# Hafiz Ali Abdullah — Portfolio & SaaS Website — Project Brief / Handoff

## Mandatory change-tracking instruction

Before doing any work, every agent must read the root-level [`CHANGE.md`](CHANGE.md), review relevant prior entries, and follow its workflow. Every change made to this project must be recorded in `CHANGE.md` before the agent completes its task. This includes source code, styles, assets, configuration, dependencies, tests, and documentation. Do not delete historical entries; append a dated entry using the format defined in `CHANGE.md`.

> This file is the single source of truth for the project. It captures every decision, preference,
> and the current build state from the planning conversation, so work can continue in Claude Code
> with full context. (Claude Code auto-loads `CLAUDE.md` as project memory — keep this at the repo root.)

---

## 0. ▶ START HERE (handoff status)

**Where we are:** Milestone 1 — the Astro **"spine"** — is built and delivered (`portfolio-site.zip` →
extract to `D:\kaggle\site`). It runs: `cd site && npm install && npm run dev` → http://localhost:4321.
The home page currently shows the **animated hero v1 (left-aligned, placeholder)**, the **mascot conversation
engine** (Aero + Dash, scroll-driven, working), the **Principles** section, and **placeholder anchors** for
Services / Work / SaaS / Booking. Design system, layout, header/footer, SEO base, and sitemap are all in place.

**✅ Already handled (don't redo):** Astro scaffold + config; design system (`global.css`, 3 themes);
`BaseLayout` with SEO + JSON-LD + scroll-reveal + counters; `Header`/`Footer`; `Mascots.jsx` conversation
engine; `Principles`; home page shell; projects index placeholder.

**⏳ START WITH THIS (first task in Claude Code):**
**Rebuild the Hero** (`src/components/Hero.astro`) to the new cinematic direction — a **diagonally-placed phone
with the app UI / holographic "VR" content bursting out**, dark vignette, centered composition, serif display
type + wide-tracked micro-labels, "01" side counter chrome, neon teal→magenta, with **Aero + Dash presenting
the phone**, and a value line + "Book a free call" CTA. See §3 for the full benchmark + spec. First run
`cd site && npm install && npm run dev` to confirm the spine works, then iterate on the hero live in the browser.

**Then continue in the order in §6.** Anything gated (ePOS live actions) is flagged in §7.

**Why this handoff exists:** the Cowork cloud sandbox blocks npm (403 on all packages), so it couldn't build or
preview Astro. Claude Code on this machine can — hence the move. Build/preview locally from here on.

---

## 1. What we're building & why

Hafiz Ali Abdullah is a Flutter / SaaS developer. His old site (`D:\kaggle\index.html` + `style.css` + `app.js`)
was a **single-page "here's what I've done" portfolio**. We are rebuilding it into a **scalable, animated,
multi-page website that works as a customer-acquisition funnel** — reframed from *"what I've done"* to
*"what you get."*

**One-line goal:** turn visitors (US/UK founders & businesses) into **booked strategy calls** for
**custom app / SaaS development**, with the shipped apps and the onlineorder.pk SaaS repositioned as
**proof of capability** rather than the subject.

---

## 2. Locked decisions (do not re-litigate)

| Topic | Decision |
|---|---|
| **Brand / identity** | Personal expert brand — **Hafiz Ali Abdullah** (not an agency). |
| **Primary offer** | **Custom Flutter app & SaaS development** services. |
| **Target audience** | **US & UK** founders / startups / businesses (English-first, higher-ticket, SEO-driven). |
| **Primary conversion goal** | **Book a call / demo** (single dominant CTA, repeated through the funnel). |
| **Mascots** | **Keep Aero (robot) + Dash (Flutter bird).** They are the signature. |
| **SEO** | Proper technical SEO from day one — this is the start of a bigger growth plan. |
| **Architecture** | **Astro + React islands.** SEO-first static rendering; React only where interactive. Chosen over vanilla and over a plain React SPA. |
| **Data model** | **Astro content collections** — each project = one Markdown file (single source of truth). Scalable: add a file → index/route/related-links update automatically. |
| **Project depth** | **Full case-study** page per project. |
| **SaaS section** | The **centerpiece** — onlineorder.pk proves "whatever you need, he can build it." |
| **ePOS** | Phase 1 = **feature walkthrough**. Phase 2 = **live actions** against the real backend (gated — see §7). |
| **Build/preview** | Must be done **locally** (Node works on the machine). The Cowork cloud sandbox has npm blocked — that's why we moved to Claude Code. |

---

## 3. Design direction

**Overall system (already ported into `src/styles/global.css`):** dark-neon. CSS variables, **3 accent themes**
(teal = default, purple, orange), glow orbs, particle field. Fonts: **Outfit** (headings) + **Plus Jakarta Sans**
(body). Per the hero benchmark, **add a high-contrast serif** (e.g. Playfair Display / Bodoni) for hero display type.

**HERO — the big one (new direction, not yet built):**
Benchmark = Creative Mints' **"Simon Sparks / Generative Design"** Dribbble shot. Its DNA:
- A **single cinematic centerpiece** on a **dark vignette canvas**, **centered composition**.
- **High-contrast serif** display name + **wide-tracked uppercase micro-labels** above & below (eyebrow + tagline).
- "Designed interface" chrome: a **"01" section counter** with a line (left), **carousel dots / play control** (right).
- Restraint: near-monochrome field, all color energy in the centerpiece + amber & magenta accents.

**Our translation (user's instruction):** replace the abstract 3D ring with a **mobile phone placed diagonally,
with the app UI / holographic "VR" content bursting out of the screen** (AR "coming out of the phone" effect) —
says "I build apps" instantly. Neon **teal → magenta** palette. **Mascots (Aero + Dash) orbit / present the phone**
so they're part of the signature object, not floating off to the side. Unlike the pure-art reference, our hero must
**still convert**: keep a tight value line + "Book a free call" CTA.

**Hero build approach (to decide in Claude Code):** either a **CSS/SVG 3D-perspective** phone with parallax floating
UI (lighter, no deps) or a real **Three.js** island (more depth, closer to reference). A pre-rendered 3D asset
(Blender/Spline export) would match the reference's glossy fidelity best. Recommend prototyping the CSS/SVG version
first (fast to iterate), upgrade to 3D if desired.

**Hero motion upgrades on the table** (user: "no preference" → builder's call): kinetic oversized typography
(word/letter reveal), animated centerpiece the mascots interact with, cursor-follow parallax, scroll-scrub
section transitions. All must respect `prefers-reduced-motion`.

> Second benchmark shot ("Portfolio Book 2020", dribbble 14219693) was referenced but never reviewed — optional.

**Mascot conversation system (signature UX):** Aero + Dash are a **scroll-driven guide**. As you scroll, each page
section triggers a "beat." Beats alternate between **talking to the visitor** and **little skits to each other** that
role-play the customer — e.g. Dash: *"I need an app but everyone says 6 months…"* → Aero: *"Relax. I know Abdullah —
he ships in weeks."* Every beat ends on a CTA toward booking. Eye-tracking, random blink, and click-to-play mischief
are preserved. **All dialogue is editable in one place: the `BEATS` object in `src/components/Mascots.jsx`.**

---

## 4. Site architecture / sitemap

```
site/                              Astro project root (keep CLAUDE.md here)
  astro.config.mjs                 integrations: @astrojs/react, @astrojs/sitemap  (mdx optional)
  src/
    layouts/BaseLayout.astro       <head> + SEO + JSON-LD, Header, Footer, Mascots, bg FX, scroll-reveal, counters
    components/
      Header.astro  Footer.astro   global chrome (theme switcher, mobile drawer)
      Mascots.jsx                  React island — conversation engine (edit BEATS to change dialogue)
      Hero.astro                   animated hero (REBUILD to the phone-centerpiece direction, §3)
      Principles.astro             "how I work" vitals
    content/config.ts + projects/  content collection (data model) — TO ADD
    pages/
      index.astro                  Home / funnel (front door)
      projects/index.astro         Projects listing (from collection)
      projects/[slug].astro        Case-study template — TO ADD
      saas.astro                   onlineorder.pk (centerpiece) — TO ADD
      epos.astro                   ePOS walkthrough — TO ADD
      epos-console.astro           ePOS live actions island — TO ADD (Phase 2)
      about.astro  404.astro       TO ADD
    styles/global.css  mascots.css design system
  public/assets/                   images (copy existing app screenshots here) + og-image.png + favicon.png
  public/robots.txt
```

**Home page section order (funnel):** hero → principles/vitals → services ("what you get") → process →
flagship SaaS teaser → shipped-apps teaser → why-work-with-me → testimonials → FAQ → booking → footer.

---

## 5. Current build state (Milestone 1 — "the spine", DONE)

Delivered as `portfolio-site.zip` (also written to `D:\kaggle\portfolio-site.zip`). **Extract into `D:\kaggle\site`.**
Built so far:
- `astro.config.mjs`, `package.json`, `tsconfig.json`, `.gitignore`, `README.md`, `public/robots.txt`
- `src/styles/global.css` (design system + hero/principles/buttons/footer/reveal), `src/styles/mascots.css`
- `src/layouts/BaseLayout.astro` (SEO + JSON-LD Person/ProfessionalService, bg FX, scroll-reveal + counters)
- `src/components/Header.astro`, `Footer.astro`, `Hero.astro` (v1 — left-aligned; **to be replaced** by phone-centerpiece hero), `Principles.astro`
- `src/components/Mascots.jsx` (full conversation engine, eye-track, blink, mischief, `BEATS` map)
- `src/pages/index.astro` (hero + principles + placeholder anchors: services / work / saas / book)
- `src/pages/projects/index.astro` (placeholder)

**To run locally:** `cd site` → `npm install` → `npm run dev` → open http://localhost:4321.

---

## 6. Next build order

1. **Rebuild the Hero** to the phone-centerpiece cinematic direction (§3). This is the priority — "makes them go beyond."
2. Home: **Services + Process** sections.
3. **Projects**: content-collection schema (`src/content/config.ts`) + `projects/[slug].astro` case-study template +
   `projects/index.astro` with filters. **Content is collaborative** — ask the user per app: what it does, key features,
   screenshots. (Store links in §8.)
4. **SaaS page** (`saas.astro`) — the centerpiece.
5. **ePOS walkthrough** (`epos.astro`).
6. **Booking** section (calendar embed + lead form), **About**, **404**.
7. **ePOS live console** (Phase 2 — see §7).

---

## 7. ePOS live actions — Phase 2 (blocked on inputs)

Needs from Hafiz before building `epos-console.astro` + `epos-console.jsx`:
- API base URL, auth model, endpoint list, a **sandbox/test account**, **CORS** enabled for the site origin.
- **Security:** a public static site cannot hold secret API keys. Sensitive calls must go through a public/authed API
  or a small **serverless proxy** (Cloudflare Worker / Netlify Function). Build the island UI + a documented API layer
  first; wire to the real backend once the above is provided.

---

## 8. Reference data (real, verified from the old site)

- **Contact:** GitHub `Hx-313` · LinkedIn `hafiz-ali-abdullah-660429207` · WhatsApp **+92 347 566 2750** · Email **aliabdullahva313@gmail.com**
- **SaaS:** onlineorder.pk · live client example **westcoastcoffee.pk** · 3 products: branded ordering web, real-time ePOS admin, Flutter dispatch terminal (any phone + Bluetooth printer = POS).
- **Shipped apps (store IDs):**
  - Pet Care – My Buddy: iOS `id6776939852`, Android `com.petcare.dailycare`
  - Expense Flow: iOS `id6765915662`, Android `com.expensetracker.nextep.expenseflow` *(NOTE: `Apps links.txt` lists `com.expensetracker.app.expenseflow` — verify correct package)*
  - eBill Checker: iOS `id6759555820`, Android `com.ebill.gas.water.internet.wapda.billchecker`
  - Speak & Translate: iOS `id1540403989` (jp store), Android `com.nextep.alllanguage.translator.alllanguagetranslator`
  - Dietify: iOS `id6758654565`, Android `com.food.diet.nutrition.tracker`
- **Existing image assets** live in `D:\kaggle\assets\` (app logos, terminal-*.jpeg, epos-desktop.png, customer-app-*.jpeg). Copy into `site/public/assets/`. Compress `epos-desktop.png` (~1.5 MB).

---

## 9. Placeholders to fill before launch

- **Domain:** replace `https://YOURDOMAIN.com` in `astro.config.mjs` + `public/robots.txt` + JSON-LD.
- **Calendly / Cal.com** link for the booking section.
- **Testimonials** (real quotes — don't fake rating schema).
- **`public/assets/og-image.png`** (1200×630) + **`public/assets/favicon.png`**.
- **ePOS API details** (Phase 2, §7).

---

## 10. Tooling / deploy notes

- Stack: Astro 5 + `@astrojs/react` 4 + `@astrojs/sitemap` 3 + React 18. (`@astrojs/mdx` was desired but hit a
  registry block in the sandbox — add it locally with `npx astro add mdx` if MDX case studies are wanted; plain `.md`
  works without it.)
- Commands: `npm install`, `npm run dev`, `npm run build` (→ `dist/`), `npm run preview`.
- Deploy: **Netlify / Vercel / Cloudflare Pages** (free, auto-deploy from GitHub; natural home for the Phase-2
  serverless proxy). GitHub Pages works too with a `base` path.
- Node 18+ required (machine has Node 24).
```
