# Hafiz Ali Abdullah — Portfolio & SaaS Site (Astro)

A scalable, animated portfolio + customer-acquisition funnel built on **Astro + React islands**.
SEO-first (real static HTML per page), with the Aero + Dash mascots as a scroll-driven guide.

## Run it locally

You need **Node 18+** (you have Node 24 — great).

```bash
cd site           # this folder
npm install       # first time only
npm run dev       # start dev server
```

Then open the URL it prints (usually **http://localhost:4321**).

Other commands:

```bash
npm run build     # production build → ./dist
npm run preview   # preview the production build locally
```

## What's here so far (Milestone 1 — the "spine")

- `src/layouts/BaseLayout.astro` — shared `<head>` (SEO + JSON-LD), header, footer, mascots, background FX, scroll-reveal + counters.
- `src/components/Header.astro` / `Footer.astro` — global chrome (theme switcher, mobile drawer).
- `src/components/Mascots.jsx` — **the conversation engine** (React island): scroll-driven dialogue, mascot-to-customer + mascot-to-mascot skits, eye-tracking, click mischief. Edit the `BEATS` object to change what they say per section.
- `src/components/Hero.astro` — animated hero + typewriter.
- `src/components/Principles.astro` — the "how I work" vitals.
- `src/pages/index.astro` — home (hero + principles + placeholder anchors for Services / Work / SaaS / Booking).
- `src/pages/projects/index.astro` — projects index placeholder.

## Coming next (build order)

1. Services + Process sections on the home page.
2. Projects: content collection + full case-study pages (built with your content per project).
3. SaaS page (the centerpiece) + ePOS walkthrough.
4. Booking section (calendar embed + lead form).
5. About + 404.
6. ePOS live console (needs your API details).

## Placeholders to fill

- **Domain:** replace `https://YOURDOMAIN.com` in `astro.config.mjs` and `public/robots.txt`.
- **Images:** add `public/assets/og-image.png` (1200×630) and `public/assets/favicon.png`. Copy your existing app screenshots into `public/assets/`.
- **Calendly/Cal.com** link for the booking section.
- **Testimonials** and (later) **ePOS API details**.

## How to add a new project (once the collection is in)

1. Add a Markdown file in `src/content/projects/<slug>.md` with the project's info.
2. That's it — the projects index, its page, and related links update automatically.
