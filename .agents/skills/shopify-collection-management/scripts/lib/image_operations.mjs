import { readFileSync, realpathSync, statSync } from "node:fs"
import { basename, extname, isAbsolute } from "node:path"

import {
  fail,
  isObject,
  optionalString,
  requiredString,
  runShopifyOperation,
  throwOnUserErrors,
} from "./runtime.mjs"

export const STAGED_UPLOADS_MUTATION = `
mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters { name value }
    }
    userErrors { field message }
  }
}`.trim()

export const FILE_CREATE_MUTATION = `
mutation CreateImageFile($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files {
      id
      alt
      fileStatus
      ... on MediaImage { image { url } }
    }
    userErrors { field message }
  }
}`.trim()

export const GET_IMAGE_FILES_QUERY = `
query GetImageFiles($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on MediaImage {
      id
      alt
      fileStatus
      image { url }
    }
  }
}`.trim()

const IMAGE_MIME_TYPES = new Map([
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
])

function execute(executor, request) {
  return executor(request)
}

export function normalizeUploadImageInput(raw) {
  if (!isObject(raw)) throw fail("upload_image input must be an object")
  const hasImage = raw.image !== undefined
  const hasSourceUrl = raw.sourceUrl !== undefined
  if (hasImage === hasSourceUrl) throw fail("provide exactly one of image or sourceUrl")
  const alt = raw.alt === undefined ? undefined : requiredString(raw.alt, "alt")
  const requestedFilename = optionalString(raw.filename, "filename")
  if (hasSourceUrl) {
    const sourceUrl = requiredString(raw.sourceUrl, "sourceUrl")
    let parsed
    try {
      parsed = new URL(sourceUrl)
    } catch {
      throw fail("sourceUrl must be a public HTTPS URL")
    }
    if (parsed.protocol !== "https:") throw fail("sourceUrl must be a public HTTPS URL")
    const filename = basename(requestedFilename || parsed.pathname)
    if (!filename) throw fail("filename is required when sourceUrl has no file name")
    return { kind: "remote", source: sourceUrl, filename, alt }
  }

  const source = requiredString(raw.image, "image")
  if (!isAbsolute(source)) throw fail("image must be an absolute local file path")
  let path
  let stats
  try {
    path = realpathSync(source)
    stats = statSync(path)
  } catch (error) {
    throw fail(`image cannot be read: ${error.message}`, "local_media_unavailable")
  }
  if (!stats.isFile() || stats.size === 0) {
    throw fail("image must point to a non-empty local file", "local_media_unavailable")
  }
  const filename = basename(requestedFilename || path)
  const mimeType = optionalString(raw.mimeType, "mimeType") || IMAGE_MIME_TYPES.get(extname(filename).toLowerCase())
  if (!mimeType?.startsWith("image/")) {
    throw fail("unsupported image type; provide an image/* mimeType", "unsupported_local_media")
  }
  return { kind: "local", source: path, filename, mimeType, size: stats.size, alt }
}

function assertStagedTarget(target) {
  if (!isObject(target) || !Array.isArray(target.parameters)) {
    throw fail("Shopify returned an invalid staged target", "shopify_invalid_response")
  }
  let uploadUrl
  try {
    uploadUrl = new URL(target.url)
  } catch {
    throw fail("Shopify returned an invalid staged upload URL", "shopify_invalid_response")
  }
  if (uploadUrl.protocol !== "https:" || typeof target.resourceUrl !== "string" || !target.resourceUrl) {
    throw fail("Shopify returned an incomplete staged target", "shopify_invalid_response")
  }
  return target
}

async function postStagedFile({ file, target, fetchImpl }) {
  if (
    typeof fetchImpl !== "function" ||
    typeof globalThis.FormData !== "function" ||
    typeof globalThis.Blob !== "function"
  ) {
    throw fail("This runtime cannot upload local media", "local_media_upload_unavailable")
  }
  const form = new globalThis.FormData()
  for (const [index, parameter] of target.parameters.entries()) {
    if (!isObject(parameter) || typeof parameter.name !== "string" || typeof parameter.value !== "string") {
      throw fail(`Shopify returned an invalid staged parameter at index ${index}`, "shopify_invalid_response")
    }
    form.append(parameter.name, parameter.value)
  }
  let content
  try {
    content = readFileSync(file.source)
  } catch (error) {
    throw fail(`Local image became unreadable: ${error.message}`, "local_media_unavailable", {
      filename: file.filename,
    })
  }
  form.append("file", new globalThis.Blob([content], { type: file.mimeType }), file.filename)
  let response
  try {
    response = await fetchImpl(target.url, { method: "POST", body: form })
  } catch (error) {
    throw fail(`Uploading the local image failed: ${error.message}`, "staged_upload_failed", {
      filename: file.filename,
    })
  }
  if (!response?.ok) {
    throw fail("Uploading the local image failed", "staged_upload_failed", {
      filename: file.filename,
      status: response?.status,
    })
  }
}

function fileSnapshot(file) {
  return {
    fileId: file?.id || null,
    filename: null,
    alt: file?.alt || "",
    status: file?.fileStatus || null,
    url: file?.image?.url || null,
  }
}

export async function uploadImage({
  store,
  input,
  apply,
  executor = runShopifyOperation,
  fetchImpl = globalThis.fetch,
  wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
}) {
  const normalized = normalizeUploadImageInput(input)
  if (!apply) {
    return {
      ok: true,
      dryRun: true,
      store,
      plan: {
        sourceType: normalized.kind,
        source: normalized.source,
        filename: normalized.filename,
        ...(normalized.mimeType ? { mimeType: normalized.mimeType, size: normalized.size } : {}),
        ...(normalized.alt ? { alt: normalized.alt } : {}),
      },
    }
  }

  let originalSource = normalized.source
  if (normalized.kind === "local") {
    const stagedResult = execute(executor, {
      store,
      query: STAGED_UPLOADS_MUTATION,
      variables: {
        input: [{
          resource: "IMAGE",
          filename: normalized.filename,
          mimeType: normalized.mimeType,
          httpMethod: "POST",
        }],
      },
      allowMutations: true,
      redactStdout: true,
    })
    const stagedPayload = throwOnUserErrors(stagedResult?.stagedUploadsCreate, "stagedUploadsCreate")
    const target = assertStagedTarget(stagedPayload.stagedTargets?.[0])
    await postStagedFile({ file: normalized, target, fetchImpl })
    originalSource = target.resourceUrl
  }

  const createResult = execute(executor, {
    store,
    query: FILE_CREATE_MUTATION,
    variables: {
      files: [{
        originalSource,
        contentType: "IMAGE",
        filename: normalized.filename,
        ...(normalized.alt ? { alt: normalized.alt } : {}),
      }],
    },
    allowMutations: true,
  })
  const createPayload = throwOnUserErrors(createResult?.fileCreate, "fileCreate")
  let file = createPayload.files?.[0]
  if (!file?.id) throw fail("Shopify returned no created file", "shopify_invalid_response")

  for (let attempt = 0; attempt < 5 && !file?.image?.url; attempt += 1) {
    if (file.fileStatus === "FAILED") {
      throw fail("Shopify failed to process the uploaded image", "file_processing_failed", {
        file: fileSnapshot(file),
      })
    }
    await wait(1000)
    const pollResult = execute(executor, {
      store,
      query: GET_IMAGE_FILES_QUERY,
      variables: { ids: [file.id] },
    })
    file = pollResult?.nodes?.[0]
  }
  if (!file?.image?.url) {
    throw fail("Shopify image processing did not finish in time", "file_processing_incomplete", {
      file: fileSnapshot(file),
    })
  }
  return {
    ok: true,
    dryRun: false,
    file: {
      fileId: file.id,
      filename: normalized.filename,
      alt: file.alt || normalized.alt || "",
      status: file.fileStatus,
      url: file.image.url,
    },
  }
}
