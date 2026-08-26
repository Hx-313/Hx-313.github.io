import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const evalDirectory = dirname(fileURLToPath(import.meta.url))
const skillDirectory = resolve(evalDirectory, "..")
const pluginDirectory = resolve(skillDirectory, "../..")

function read(relativePath) {
  return readFileSync(resolve(pluginDirectory, relativePath), "utf8")
}

const suite = JSON.parse(read("skills/shopify-product-collection-write-brief/evals/evals.json"))

test("Brief Skill is a distributed dependency of the shared editor", () => {
  const plugin = JSON.parse(read("plugin.json"))
  const editor = plugin.subAgents.find(({ id }) => id === "shopify-product-editor")
  const editorSkillIds = editor.skills.map(({ id }) => id)

  assert.ok(editorSkillIds.includes("shopify-product-collection-write-brief"))
  assert.equal(
    existsSync(resolve(pluginDirectory, "docs/product-collection-write-brief.md")),
    false,
  )
})

test("runtime producers and consumers load the Brief Skill without docs dependency", () => {
  const runtimePaths = [
    "prompt.md",
    "subagents/shopify-product-editor/prompt.md",
    "skills/dtc-builder/SKILL.md",
    "skills/shopify-product-management/SKILL.md",
    "skills/shopify-product-management/references/write-contract.md",
    "skills/shopify-collection-management/SKILL.md",
    "skills/shopify-collection-management/references/write-contract.md",
  ]

  for (const path of runtimePaths) {
    const content = read(path)
    assert.match(content, /shopify-product-collection-write-brief/)
    assert.doesNotMatch(content, /docs\/product-collection-write-brief/)
  }

  const rootPrompt = read("prompt.md")
  assert.match(
    rootPrompt,
    /Before preparing the first merchant-facing Product\/Collection write preview or asking for confirmation, the Main Agent MUST load/,
  )
})

test("Brief Skill owns the canonical nested contract and dependency-aware ordering", () => {
  const skill = read("skills/shopify-product-collection-write-brief/SKILL.md")

  assert.match(skill, /name: shopify-product-collection-write-brief/)
  assert.match(skill, /Main Agent MUST load this Skill completely before it prepares/)
  assert.match(skill, /"resource_scope": "product \| collection \| product-and-collection"/)
  assert.match(skill, /"product": \{/)
  assert.match(skill, /"collection": \{/)
  assert.match(skill, /`status: ACTIVE`/)
  assert.match(skill, /Publication target/)
  assert.match(skill, /"dependencies": \[/)
  assert.match(skill, /Product-first is mandatory only/)
  assert.match(skill, /no global cross-domain order/)
  assert.match(skill, /No prompt, orchestrator, Skill, eval, or new caller may emit/)
})

test("cross-domain order follows declared business dependencies", () => {
  const skill = read("skills/shopify-product-collection-write-brief/SKILL.md")
  const rootPrompt = read("prompt.md")
  const builder = read("skills/dtc-builder/SKILL.md")
  const editor = read("subagents/shopify-product-editor/prompt.md")
  const productSkill = read("skills/shopify-product-management/SKILL.md")
  const collectionSkill = read("skills/shopify-collection-management/SKILL.md")

  assert.match(skill, /`dependencies` is conditionally required only/)
  assert.match(skill, /co-presence in one brief never creates an implicit ordering edge/)
  assert.match(rootPrompt, /independent cross-domain items have no fixed Product-first rule/)
  assert.match(builder, /only a Collection item that consumes Product results is ordered after/)
  assert.match(editor, /Never infer an edge merely because both envelopes are present/)
  assert.match(editor, /Independent cross-domain items have no fixed Product-first rule/)
  assert.match(productSkill, /independent Collection outcome does not impose global Product-first order/)
  assert.match(collectionSkill, /Independent combined outcomes have no fixed Product-first order/)
})

test("post-delete non-resolution verification has one execution owner", () => {
  const rootPrompt = read("prompt.md")
  const productDelete = read("skills/shopify-product-management/references/delete-product.md")
  const collectionDelete = read("skills/shopify-collection-management/references/delete-collection.md")

  assert.match(rootPrompt, /require its owned evidence that the product no longer resolves/)
  assert.match(rootPrompt, /does not issue a duplicate post-delete verification read/)
  for (const contract of [productDelete, collectionDelete]) {
    assert.match(contract, /final non-resolution read belongs to the shared editor/)
    assert.match(contract, /do not ask the Main Agent to repeat the read/)
  }
})

test("heterogeneous primary operations are partitioned into homogeneous editor spawns", () => {
  const skill = read("skills/shopify-product-collection-write-brief/SKILL.md")
  const rootPrompt = read("prompt.md")
  const builder = read("skills/dtc-builder/SKILL.md")
  const editor = read("subagents/shopify-product-editor/prompt.md")
  const productContract = read("skills/shopify-product-management/references/write-contract.md")
  const collectionContract = read("skills/shopify-collection-management/references/write-contract.md")

  assert.match(skill, /exactly one primary lifecycle `operation`/)
  assert.match(skill, /partitions it into homogeneous operation groups/)
  assert.match(skill, /same `shopify-product-editor` once per group, sequentially/)
  assert.match(skill, /Secondary capabilities do not create another primary-operation group/)
  assert.match(skill, /Destructive deletes are never grouped/)
  assert.match(rootPrompt, /partition heterogeneous same-domain operations into separate sequential briefs/)
  assert.match(builder, /Keep each domain envelope homogeneous/)
  for (const consumer of [editor, productContract, collectionContract]) {
    assert.match(consumer, /mixed_primary_operations/)
  }
})

test("evaluation suite covers distribution, dependency order, missing confirmation, and operation grouping", () => {
  assert.equal(suite.skill_name, "shopify-product-collection-write-brief")
  assert.equal(suite.evals.length, 5)
  assert.equal(new Set(suite.evals.map(({ id }) => id)).size, suite.evals.length)

  const prompts = suite.evals.map(({ prompt }) => prompt).join("\n")
  assert.match(prompts, /no docs\/ directory/)
  assert.match(prompts, /user replies exactly: 上架吧/)
  assert.match(prompts, /omitted user_confirmed_at/)
  assert.match(prompts, /creating Product Canvas Tote and updating the title/)
  assert.match(prompts, /Neither outcome consumes the result of the other/)
  assert.ok(suite.evals.every(({ expectations }) => expectations.length > 0))
})
