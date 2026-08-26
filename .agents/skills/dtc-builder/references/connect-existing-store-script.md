# Connect existing Shopify store — onboarding script

When a user wants to connect an existing store or authorize Accio, deliver the block below — **STRUCTURE verbatim, LANGUAGE in the user's language** (per `prompt.md` RULE #-2). Do NOT summarize or skip the ASCII Domains diagram — the diagram is the single most effective way to prevent the user from sending their custom-brand `.com` domain (the #1 onboarding failure).

Authentication itself is managed through the Accio Work Connector — you do not need to manually generate or provide API tokens. This script only collects the initial `*.myshopify.com` handle that the Connector binds to.

> ⚠️ **Language contract (read first)**: The rendering below is a *reference* in English. Pick by the user's latest message language:
> - User writes English → deliver the **EN reference** below verbatim.
> - User writes any other language → use the **EN reference** as the structural template and translate the prose into the user's language, keeping the ASCII diagram, Shopify Admin UI labels (`Settings`, `Domains`), and the literal `.myshopify.com` strings unchanged.
>
> **Forbidden**: changing the structure, dropping the ASCII diagram, or summarizing the steps. Translate the prose only; preserve the verbatim structure.

**Keep as-is in any language** (do NOT translate):
- ASCII box-drawing characters and the diagram layout
- `myshopify.com` / `.myshopify.com` / `xxxxxx-aaa` placeholders
- Shopify Admin UI button labels: `Settings`, `Domains`, `[Primary]`

---

## EN reference (deliver this when the user is writing English; for other languages, translate the prose while preserving this structure)

> Before we can authorize, I need the **initial domain** of your Shopify store (it looks like `xxxxxx.myshopify.com`). Please follow these steps:
>
> **Step 1**: Log in to Shopify Admin → left nav **Settings** → **Domains**
>
> **Step 2**: You'll see a list of domains, all ending in `.myshopify.com`. **Just send me the bottom one** from the list.
>
> ```
> ┌─────────────────────────────────────────┐
> │  Domains                                 │
> ├─────────────────────────────────────────┤
> │  xxxxxx-aaa.myshopify.com   [Primary]    │
> │  xxxxxx-bbb.myshopify.com                │
> │  xxxxxx-ccc.myshopify.com                │  ← ✅ use this (the bottom one)
> └─────────────────────────────────────────┘
> ```
>
> **Step 3**: Copy that full bottom row and send it back to me (include `.myshopify.com`).
>
> ⚠️ Tips:
> - If you only see 1 row, that row IS the initial domain.
> - The placeholder `xxxxxx-aaa` is just an example — your actual domain will be a different string.
> - Do NOT send a custom brand domain (like `mybrand.com`) — that row cannot be used for authorization.

---

**Mandatory check after the user responds**: Do NOT attempt any API operation until the store status shows as "Connected" in the Accio Work interface.

For the full Connector-bound active-store context workflow, see [`aw-shopify-oauth/SKILL.md`](../../aw-shopify-oauth/SKILL.md). If a CLI probe or validated GraphQL execution is needed after connection, route that work to the official `shopify-use-shopify-cli` skill.
