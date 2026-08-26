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

const suite = JSON.parse(read("skills/shopify-product-management/evals/evals.json"))

test("evaluation suite covers minimum and conditional product fields", () => {
  assert.equal(suite.skill_name, "shopify-product-management")
  assert.equal(suite.evals.length, 20)
  assert.equal(new Set(suite.evals.map(({ id }) => id)).size, suite.evals.length)

  const prompts = suite.evals.map(({ prompt }) => prompt).join("\n")
  assert.match(prompts, /exactly one active location/)
  assert.match(prompts, /two active stocked locations/)
  assert.match(prompts, /no user_confirmed_at/)
  assert.match(prompts, /user replies exactly: 上架吧/)
  assert.match(prompts, /Upload \/tmp\/product-front\.png/)
  assert.match(prompts, /collection gid:\/\/shopify\/Collection\/789/)
  assert.match(prompts, /店铺主语言是英文/)
  assert.match(prompts, /法语翻译面向加拿大市场/)
  assert.match(prompts, /库存从 8 调整到 12/)
  assert.match(prompts, /立即上架到 Online Store/)
  assert.match(prompts, /willChange=false/)
  assert.match(prompts, /public PDP URL is reachable/)
  assert.match(prompts, /\"error\":\"verification_failed\"/)
  assert.match(prompts, /shopify_html_normalized/)
  assert.match(prompts, /install_path=\/opt\/host\/plugins\/acme-shopify\/skills\/shopify-product-management/)
  assert.match(prompts, /store_handle=north-star instead/)
})

test("script entrypoints preserve the Skill install path and normalize store handles before execution", () => {
  const skill = read("skills/shopify-product-management/SKILL.md")
  const search = read("skills/shopify-product-management/references/read-search-products.md")
  const pathEval = suite.evals.find(({ id }) => id === 19)

  for (const content of [skill, search]) {
    assert.match(content, /exact `install_path`/)
    assert.match(content, /`SKILL_DIR`/)
    assert.match(content, /\$\{SKILL_DIR\}\/scripts\/search_products\.mjs/)
    assert.match(content, /full .*\.myshopify\.com.*domain/i)
    assert.match(content, /short .*handle/i)
  }

  assert.match(skill, /Never strip `skills\/shopify-product-management`/)
  assert.match(skill, /plugin runtime root/)
  assert.match(skill, /never submit a short handle merely to discover/i)

  assert.ok(pathEval)
  const rubric = [pathEval.expected_output, ...pathEval.expectations].join("\n")
  assert.match(rubric, /skills\/shopify-product-management\/scripts\/search_products\.mjs/)
  assert.match(rubric, /north-star\.myshopify\.com/)
  assert.match(rubric, /Does not use .*acme-shopify\/scripts\/search_products\.mjs/)
  assert.match(rubric, /first invocation/)

  const writeHandleEval = suite.evals.find(({ id }) => id === 20)
  const writeHandleRubric = [writeHandleEval.expected_output, ...writeHandleEval.expectations].join("\n")
  assert.match(writeHandleRubric, /before.*store access/i)
  assert.match(writeHandleRubric, /Does not normalize the short handle for a write/)
  assert.match(writeHandleRubric, /Does not invoke create_product\.mjs/)
})

test("failure and normalized-HTML evals enforce the script JSON contract", () => {
  const failureEval = suite.evals.find(({ id }) => id === 17)
  const warningEval = suite.evals.find(({ id }) => id === 18)
  const editor = read("subagents/shopify-product-editor/prompt.md")
  const contract = read("skills/shopify-product-management/references/write-contract.md")

  const failureRubric = [failureEval.expected_output, ...failureEval.expectations].join("\n")
  assert.match(failureRubric, /partial/)
  assert.match(failureRubric, /details\.observedProduct/)
  assert.match(failureRubric, /Does not invoke --help/)
  assert.match(failureRubric, /get_product\.mjs or another read/)
  assert.match(failureRubric, /Does not continue.*publication/)

  const warningRubric = [warningEval.expected_output, ...warningEval.expectations].join("\n")
  assert.match(warningRubric, /shopify_html_normalized/)
  assert.match(warningRubric, /ok=true/)
  assert.match(warningRubric, /continue.*publication/i)

  for (const content of [editor, contract]) {
    assert.match(content, /Only `?\{? ?"ok"?:? true/i)
    assert.match(content, /observedProduct/)
    assert.match(content, /do not run `--help`|do not run --help/i)
    assert.match(content, /reclassif/i)
  }
})

test("write contract keeps only the Product envelope safety fields universally mandatory", () => {
  const contract = read("skills/shopify-product-management/references/write-contract.md")
  assert.match(contract, /only common mandatory Product-envelope fields/)
  assert.match(contract, /resource_scope.*selects Product/)
  assert.match(contract, /`user_confirmation_summary` must equal that exact user utterance/)
  assert.match(contract, /evidence must never be added only after a failed spawn/)
  assert.match(contract, /`language`, `content_language`, `business_targets`, `verify`.*optional/)
  assert.match(contract, /Supplier\/provenance, SKU, handle, vendor, product type, tags, SEO, media, inventory, and publication are never common mandatory fields/)
})

test("all four layers enforce the same first-spawn confirmation invariant", () => {
  const rootPrompt = read("prompt.md")
  const builder = read("skills/dtc-builder/SKILL.md")
  const editor = read("subagents/shopify-product-editor/prompt.md")
  const contract = read("skills/shopify-product-management/references/write-contract.md")

  for (const content of [rootPrompt, builder, editor, contract]) {
    assert.match(content, /`user_confirmed_at`/)
    assert.match(content, /`user_confirmation_summary`/)
    assert.match(content, /first.*spawn/i)
    assert.match(content, /上架吧/)
  }

  assert.match(rootPrompt, /Never replace it with Agent-authored prose/)
  assert.match(builder, /never rely on a failed sub-agent call to discover or repair/i)
  assert.match(editor, /confirmation_evidence_not_verbatim/)
  const productBriefRule = rootPrompt
    .split("\n")
    .find((line) => line.startsWith("- `shopify-product-editor`"))
  assert.ok(productBriefRule)
  assert.doesNotMatch(productBriefRule, /productSet|GraphQL|scripts\//)
})

test("create permits title-only drafts and makes variant fields conditional", () => {
  const create = read("skills/shopify-product-management/references/create-product.md")
  assert.match(create, /Minimum product data is `title`/)
  assert.match(create, /Omitted `status` safely defaults to `DRAFT`/)
  assert.match(create, /When variants are supplied, require `options`/)
  assert.match(create, /SKU and compare-at price remain optional/)
  assert.match(create, /explicitly confirmed no-media draft is valid/)
})

test("create eval rewards the script-owned verification result without a duplicate read", () => {
  const createEval = suite.evals.find(({ id }) => id === 1)
  const createContract = read("skills/shopify-product-management/references/create-product.md")

  assert.ok(createEval)
  const rubric = [createEval.expected_output, ...createEval.expectations].join("\n")
  assert.match(rubric, /Product returned by apply as the script-owned post-create verification/)
  assert.match(rubric, /Does not invoke get_product\.mjs or another duplicate verification read/)
  assert.doesNotMatch(rubric, /verifies with get_product\.mjs/)
  assert.match(createContract, /returned Product is the script's owned post-create verification read/)
  assert.match(createContract, /Do not issue a duplicate verification read/)
})

test("inventory location is optional only while the Product Skill resolves it unambiguously", () => {
  const inventory = read("skills/shopify-product-management/references/inventory.md")
  const subagent = read("subagents/shopify-product-editor/prompt.md")
  assert.match(inventory, /location target remains optional/)
  assert.match(inventory, /multiple active stocked levels/i)
  assert.match(inventory, /stop with `inventory_location_required`/)
  assert.match(inventory, /compareQuantity/)
  assert.match(subagent, /For Product publication and inventory, apply `shopify-product-management`/)
  assert.match(inventory, /single_active_location/)
  assert.match(inventory, /only one active stocked level/)
  assert.match(inventory, /Never choose the first, primary, or previously used location/)
})

test("Product inventory scripts and Collection ownership stay separate", () => {
  const skill = read("skills/shopify-product-management/SKILL.md")
  const inventory = read("skills/shopify-product-management/references/inventory.md")
  const collections = read("skills/shopify-product-management/references/collections.md")
  const collectionSkill = read("skills/shopify-collection-management/SKILL.md")
  const collectionTools = read("skills/shopify-collection-management/references/tool-routing.md")

  for (const script of ["get_inventory_levels.mjs", "set_inventory.mjs"]) {
    assert.match(skill, new RegExp(script.replace(".", "\\.")))
  }
  assert.match(inventory, /stale_inventory/)
  assert.match(inventory, /compare-and-set/)
  assert.doesNotMatch(skill, /resolve_collection\.mjs|add_to_collection\.mjs/)
  assert.match(collectionSkill, /Add\/remove membership/)
  assert.match(collectionTools, /scripts\/add_to_collection\.mjs/)
  assert.match(collectionTools, /scripts\/remove_from_collection\.mjs/)
  assert.doesNotMatch(collectionTools, /mcp__codex_apps__shopify_/)
  assert.match(collections, /legacy scripts remain only for backward compatibility/)
})

test("Product and Collection publication use explicit bundled scripts", () => {
  const productSkill = read("skills/shopify-product-management/SKILL.md")
  const productPublication = read("skills/shopify-product-management/references/publication.md")
  const collectionTools = read("skills/shopify-collection-management/references/tool-routing.md")

  assert.match(productSkill, /scripts\/set_product_publication\.mjs/)
  assert.match(productPublication, /publication_not_found/)
  assert.match(productPublication, /publication_ambiguous/)
  assert.match(collectionTools, /scripts\/set_collection_publication\.mjs/)
  assert.match(collectionTools, /never defaults to Online Store/)
})

test("already-satisfied publication targets stop after dry-run without apply", () => {
  const productContract = read("skills/shopify-product-management/references/write-contract.md")
  const productPublication = read("skills/shopify-product-management/references/publication.md")
  const productHelp = read("skills/shopify-product-management/scripts/set_product_publication.mjs")
  const collectionSkill = read("skills/shopify-collection-management/SKILL.md")
  const collectionContract = read("skills/shopify-collection-management/references/write-contract.md")
  const collectionTools = read("skills/shopify-collection-management/references/tool-routing.md")
  const collectionHelp = read("skills/shopify-collection-management/scripts/set_collection_publication.mjs")
  const editor = read("subagents/shopify-product-editor/prompt.md")

  for (const content of [
    productContract,
    productPublication,
    productHelp,
    collectionSkill,
    collectionContract,
    collectionTools,
    collectionHelp,
    editor,
  ]) {
    assert.match(content, /willChange.*false|no change/i)
    assert.match(content, /without `--apply`|do not invoke `?--apply`?|must not be followed by apply/i)
  }
  assert.match(productPublication, /already_satisfied/)
  assert.match(collectionTools, /already_satisfied/)
})

test("immediate Product publication uses one joint preview with separate ACTIVE and Publication outcomes", () => {
  const rootPrompt = read("prompt.md")
  const brief = read("skills/shopify-product-collection-write-brief/SKILL.md")
  const builder = read("skills/dtc-builder/SKILL.md")
  const editor = read("subagents/shopify-product-editor/prompt.md")
  const contract = read("skills/shopify-product-management/references/write-contract.md")
  const create = read("skills/shopify-product-management/references/create-product.md")
  const publication = read("skills/shopify-product-management/references/publication.md")

  for (const content of [rootPrompt, brief, builder, editor, contract, create, publication]) {
    assert.match(content, /ACTIVE/)
    assert.match(content, /Publication/)
    assert.match(content, /preview/i)
    assert.match(content, /separate/i)
  }
  assert.match(contract, /explicitly asks to keep `DRAFT`/)
})

test("published Product reachability uses one lightweight post-verification probe", () => {
  const productSkill = read("skills/shopify-product-management/SKILL.md")
  const publication = read("skills/shopify-product-management/references/publication.md")
  const storefront = read("skills/shopify-storefront-validate/SKILL.md")
  const editor = read("subagents/shopify-product-editor/prompt.md")

  assert.match(productSkill, /probe_product_storefront\.mjs/)
  assert.match(publication, /Do not perform a pre-write 404 probe/)
  assert.match(publication, /Do not separately fetch the alias and primary domains/)
  assert.match(storefront, /Prefer one `HEAD` request/)
  assert.match(storefront, /cancel the response body/)
  assert.match(storefront, /reachability only/)
  assert.match(editor, /probe only after publication verification/)
})

test("root prompt routes listing details to the product skill", () => {
  const prompt = read("prompt.md")
  const create = read("skills/shopify-product-management/references/create-product.md")
  assert.match(prompt, /details belong to `shopify-product-management` rather than this root prompt/)
  assert.doesNotMatch(prompt, /explicitly show and confirm a no-media draft/)
  assert.doesNotMatch(prompt, /Omitted status means/)
  assert.match(create, /explicitly confirmed no-media draft is valid/)
  assert.match(create, /Omitted `status` safely defaults to `DRAFT`/)
  assert.match(prompt, /never write placeholder text or a fabricated URL into Shopify product data/)
  assert.doesNotMatch(prompt, /otherwise write `\[No image available\]`/)
})

test("root prompt separates optional brief metadata, archive, and deletion", () => {
  const prompt = read("prompt.md")
  assert.match(prompt, /Reply\/report language and extra verification criteria are optional/)
  assert.match(prompt, /Delete-backup protocol/)
  assert.match(prompt, /Before removing product media, back up each removed item's URL and alt text/)
  assert.doesNotMatch(prompt, /live PDP will 404/)
  assert.doesNotMatch(prompt, /Delete \/ archive product, or bulk delete/)
  assert.equal(prompt.split("\n").some((line) => /BACKUP FIRST.*archive/i.test(line)), false)
})

test("conversation, source-content, and target-market languages stay separate", () => {
  const rootPrompt = read("prompt.md")
  const builder = read("skills/dtc-builder/SKILL.md")
  const productSkill = read("skills/shopify-product-management/SKILL.md")
  const editor = read("subagents/shopify-product-editor/prompt.md")
  const themeDecorator = read("subagents/shopify-theme-decorator/prompt.md")
  const contract = read("skills/shopify-product-management/references/write-contract.md")

  assert.match(rootPrompt, /conversation language controls interaction and reporting only/)
  assert.match(rootPrompt, /Never infer them from the user's conversation language/)
  assert.match(rootPrompt, /Do not add a language question to SKU, price, inventory, status/)
  assert.match(builder, /Separate conversation and storefront languages/)
  assert.match(productSkill, /Keep `language` independent from `content_language`/)
  assert.match(contract, /Never infer source content, translation, or market language from `language`/)
  assert.match(editor, /Abort the affected item as `content_language_ambiguous`/)
  assert.match(themeDecorator, /NEVER infer storefront copy language from `language`/)
})

test("language context remains business intent rather than API overreach", () => {
  const rootPrompt = read("prompt.md")
  const builder = read("skills/dtc-builder/SKILL.md")
  const editor = read("subagents/shopify-product-editor/prompt.md")

  assert.match(rootPrompt, /Merchant-facing language and market names are business intent/)
  assert.match(builder, /these are business facts, not API fields/)
  assert.match(editor, /merchant-facing language name/)

  const languageSection = rootPrompt.slice(
    rootPrompt.indexOf("## Language Separation"),
    rootPrompt.indexOf("## 2. Sub-Agent Spawn Governance"),
  )
  assert.doesNotMatch(languageSection, /translationsRegister|shopLocales|marketId|GraphQL/)
})
