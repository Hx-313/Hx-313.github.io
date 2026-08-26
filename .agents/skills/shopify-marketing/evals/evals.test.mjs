import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const evalDirectory = dirname(fileURLToPath(import.meta.url))
const skillDirectory = resolve(evalDirectory, "..")
const pluginDirectory = resolve(skillDirectory, "../..")

function read(relativePath) {
  return readFileSync(resolve(pluginDirectory, relativePath), "utf8")
}

const suite = JSON.parse(read("skills/shopify-marketing/evals/evals.json"))

test("SEO evals cover the observed evidence, ownership, target, and completion failures", () => {
  assert.equal(suite.skill_name, "shopify-marketing")
  assert.equal(suite.evals.length, 6)
  assert.equal(new Set(suite.evals.map(({ id }) => id)).size, suite.evals.length)

  const prompts = suite.evals.map(({ prompt }) => prompt).join("\n")
  assert.match(prompts, /Admin GraphQL response/)
  assert.match(prompts, /按顺序帮我优化吧/)
  assert.match(prompts, /guess the nearest Product or MediaImage ID/)
  assert.match(prompts, /shopUpdate does not exist/)
  assert.match(prompts, /CTR has significantly improved/)
  assert.match(prompts, /<p>Old body<\/p>/)
})

test("classic SEO reference binds all three guard phases", () => {
  const seo = read("skills/shopify-marketing/references/seo.md")
  for (const phase of ["audit", "plan", "finalize"]) {
    assert.match(seo, new RegExp(`seo_workflow_guard\\.py ${phase}`))
  }
  assert.match(seo, /insufficient_evidence/)
  assert.match(seo, /manifest_hash/)
  assert.match(seo, /shopify-product-editor/)
  assert.match(seo, /Do not guess a replacement GID/)
  assert.match(seo, /task_completion_allowed: true/)
})

test("page auditor returns null scores when evidence is incomplete", () => {
  const auditor = read("subagents/shopify-page-auditor/prompt.md")
  assert.match(auditor, /evidence_status: insufficient_evidence/)
  assert.match(auditor, /scores: null/)
  assert.match(auditor, /not_measured/)
  assert.match(auditor, /do not invent competitors or ranking positions/)
})
