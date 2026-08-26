import { spawnSync } from "node:child_process"
import { readFileSync, realpathSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const SCRIPT_VERSION = "0.4.0"

export function fail(message, code = "invalid_input", details) {
  const error = new Error(message)
  error.code = code
  if (details !== undefined) error.details = details
  return error
}

export function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

export function optionalString(value, field) {
  if (value === undefined || value === null || value === "") return undefined
  if (typeof value !== "string") throw fail(`${field} must be a string`)
  return value.trim() || undefined
}

export function requiredString(value, field) {
  const normalized = optionalString(value, field)
  if (!normalized) throw fail(`${field} is required`)
  return normalized
}

export function requireGid(value, type, field) {
  const normalized = requiredString(value, field)
  const allowedTypes = Array.isArray(type) ? type : [type]
  if (!allowedTypes.some((name) => new RegExp(`^gid://shopify/${name}/\\d+$`).test(normalized))) {
    throw fail(`${field} must be a Shopify ${allowedTypes.join(" or ")} GID`)
  }
  return normalized
}

export function normalizeMoney(value, field) {
  const normalized = requiredString(value, field)
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw fail(`${field} must be a non-negative decimal string`)
  }
  return normalized
}

export function parseJsonScriptArguments(argv, { allowApply = false } = {}) {
  const parsed = { apply: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--apply") {
      if (!allowApply) throw fail("--apply is not supported by this read-only script", "invalid_arguments")
      parsed.apply = true
    } else if (arg === "--help" || arg === "-h") parsed.help = true
    else if (arg === "--version") parsed.version = true
    else if (["--store", "--input", "--json"].includes(arg)) {
      const value = argv[index + 1]
      if (!value || value.startsWith("--")) throw fail(`${arg} requires a value`, "invalid_arguments")
      parsed[arg.slice(2)] = value
      index += 1
    } else {
      throw fail(`unknown argument: ${arg}`, "invalid_arguments")
    }
  }
  if (parsed.help || parsed.version) return parsed
  if (!parsed.store || !/^[-a-z0-9]+\.myshopify\.com$/i.test(parsed.store)) {
    throw fail("--store must be a full *.myshopify.com domain", "invalid_arguments")
  }
  if (Boolean(parsed.input) === Boolean(parsed.json)) {
    throw fail("provide exactly one of --input or --json", "invalid_arguments")
  }
  return parsed
}

export function readJsonArgument(args, label = "input") {
  let source
  try {
    source =
      args.json ??
      (args.input === "-" ? readFileSync(0, "utf8") : readFileSync(args.input, "utf8"))
  } catch (error) {
    throw fail(`${label} could not be read: ${error.message}`, "input_unavailable")
  }
  try {
    return JSON.parse(source)
  } catch (error) {
    throw fail(`${label} is not valid JSON: ${error.message}`)
  }
}

function parseShopifyJson(stdout, { redactInvalidOutput = false } = {}) {
  const content = stdout.trim()
  if (!content) throw fail("Shopify CLI returned no JSON", "shopify_cli_invalid_output")
  try {
    return JSON.parse(content)
  } catch (error) {
    throw fail(`Shopify CLI returned invalid JSON: ${error.message}`, "shopify_cli_invalid_output", {
      stdout: redactInvalidOutput ? "[redacted staged-upload output]" : content.slice(0, 2000),
    })
  }
}

export function runShopifyOperation({
  store,
  query,
  variables,
  allowMutations = false,
  redactStdout = false,
  spawn = spawnSync,
}) {
  const cliArgs = ["store", "execute", "--store", store, "--query", query]
  if (allowMutations) cliArgs.push("--allow-mutations")
  if (variables !== undefined) cliArgs.push("--variables", JSON.stringify(variables))
  const result = spawn("shopify", cliArgs, {
    encoding: "utf8",
    env: {
      ...process.env,
      SHOPIFY_CLI_AGENT_INFO:
        process.env.SHOPIFY_CLI_AGENT_INFO ||
        `n:shopify-product-management|v:${SCRIPT_VERSION}|p:none|m:none`,
    },
    maxBuffer: 10 * 1024 * 1024,
  })
  if (result.error) {
    throw fail(`Shopify CLI could not start: ${result.error.message}`, "shopify_cli_unavailable")
  }
  if (result.status !== 0) {
    throw fail("Shopify CLI operation failed", "shopify_cli_failed", {
      exitCode: result.status,
      stderr: String(result.stderr || "").trim().slice(0, 4000),
      stdout: redactStdout
        ? "[redacted staged-upload output]"
        : String(result.stdout || "").trim().slice(0, 4000),
    })
  }
  return parseShopifyJson(String(result.stdout || ""), { redactInvalidOutput: redactStdout })
}

export function throwOnUserErrors(payload, label, { errorFields = ["userErrors"] } = {}) {
  if (!payload) throw fail(`Shopify returned no ${label} payload`, "shopify_invalid_response")
  const errors = errorFields.flatMap((field) => (Array.isArray(payload[field]) ? payload[field] : []))
  if (errors.length > 0) {
    throw fail(`Shopify rejected ${label}`, "shopify_user_errors", { userErrors: errors })
  }
  return payload
}

export function printJson(value, stream = process.stdout) {
  stream.write(`${JSON.stringify(value, null, 2)}\n`)
}

export async function runJsonScript({ argv, help, allowApply = false, handler }) {
  try {
    const args = parseJsonScriptArguments(argv, { allowApply })
    if (args.help) {
      process.stdout.write(help)
      return
    }
    if (args.version) {
      process.stdout.write(`${SCRIPT_VERSION}\n`)
      return
    }
    const result = await handler({
      store: args.store,
      input: readJsonArgument(args),
      apply: args.apply,
    })
    printJson(result)
  } catch (error) {
    printJson(
      {
        ok: false,
        error: error.code || "unexpected_error",
        message: error.message || String(error),
        ...(error.details === undefined ? {} : { details: error.details }),
      },
      process.stderr,
    )
    process.exitCode = 1
  }
}

export function isEntryPoint(moduleUrl) {
  if (!process.argv[1]) return false
  const modulePath = fileURLToPath(moduleUrl)
  try {
    return realpathSync(process.argv[1]) === realpathSync(modulePath)
  } catch {
    return resolve(process.argv[1]) === resolve(modulePath)
  }
}
