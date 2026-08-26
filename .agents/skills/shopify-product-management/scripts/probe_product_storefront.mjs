#!/usr/bin/env node

import { fail, isEntryPoint, isObject, requiredString, runJsonScript } from "./lib/runtime.mjs"

const HELP = `probe_product_storefront.mjs

Lightweight read-only reachability probe for one published Product URL.
Runs one redirect-following HEAD request and falls back to one bounded GET only when HEAD is blocked.
It does not authenticate, inspect page content, or prove visual correctness.

Input:
{
  "handle": "product-handle"
}
`

const HEAD_FALLBACK_STATUSES = new Set([403, 405, 501])

function normalizeInput(raw) {
  if (!isObject(raw)) throw fail("probe_product_storefront input must be an object")
  const handle = requiredString(raw.handle, "handle")
  if (/[/?#\s]/.test(handle)) {
    throw fail("handle must be one Product URL path segment")
  }
  return { handle }
}

function summarizeResponse(response, { method, originalUrl }) {
  return {
    method,
    originalUrl,
    finalUrl: response.url || originalUrl,
    redirected:
      response.redirected === true || Boolean(response.url && response.url !== originalUrl),
    httpStatus: response.status,
    reachable: response.status >= 200 && response.status < 400,
    contentVerified: false,
    fullBodyDownloaded: false,
  }
}

async function request({ url, method, fetchImpl, timeoutMs }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      ...(method === "GET" ? { headers: { Range: "bytes=0-0" } } : {}),
    })
    if (method === "GET" && response.body?.cancel) await response.body.cancel()
    return response
  } catch (error) {
    const reason = error?.name === "AbortError" ? "timeout" : error?.message || String(error)
    throw fail("Storefront reachability probe failed", "storefront_probe_failed", {
      method,
      url,
      reason,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function probeProductStorefront({
  store,
  input,
  fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
}) {
  if (typeof fetchImpl !== "function") {
    throw fail("fetch is unavailable in this runtime", "storefront_probe_unavailable")
  }
  const { handle } = normalizeInput(input)
  const originalUrl = `https://${store}/products/${encodeURIComponent(handle)}`
  const attempts = []

  const head = await request({ url: originalUrl, method: "HEAD", fetchImpl, timeoutMs })
  attempts.push(summarizeResponse(head, { method: "HEAD", originalUrl }))

  let result = attempts[0]
  if (HEAD_FALLBACK_STATUSES.has(head.status)) {
    const get = await request({ url: originalUrl, method: "GET", fetchImpl, timeoutMs })
    result = summarizeResponse(get, { method: "GET", originalUrl })
    attempts.push(result)
  }

  return {
    ok: true,
    probe: result,
    attempts,
  }
}

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    handler: ({ store, input }) => probeProductStorefront({ store, input }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
