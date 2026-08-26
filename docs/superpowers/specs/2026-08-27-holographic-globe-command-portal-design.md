# HX313 Holographic Globe Command Portal Design Spec

**Date:** 2026-08-27  
**Status:** Approved for Implementation  
**Visual Reference Grounding:** Cyber-engineering command center with central 3D holographic particle earth constellation, tactical telemetry HUDs, and interactive brand mascots (Aero 🤖 & Dash 🐦).

---

## 1. Vision & Executive Summary

The HX313 portfolio experience transforms into a high-density, cinematic software engineering command portal. The interface communicates elite technical capability, system architecture mastery, and full-stack product execution through a central **3D Holographic Particle Globe Constellation** connected to live telemetry, real-world product nodes, and interactive brand mascots.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  HX313 · PRODUCT ENGINEER              ······ PRODUCT CONSTELLATION ······        SYSTEM TIME  STATUS  ≡  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⬡ │                                                                            │ ┌ SYSTEM OVERVIEW ──┐ │
│ ⊞ │  Hello, I'm                                   [DIETIFY]       [READMATE]   │ │ Active Nodes:  08 │ │
│ ◫ │  H × 313                                        \             /            │ │ Systems:       14 │ │
│ ⌨ │  PRODUCT ENGINEER                                ╭───────────╮             │ │ Uptime:    99.98% │ │
│ ⚙ │                                      [MASJID360] │  3D GLOBE │  [WOS]      │ └───────────────────┘ │
│   │  I build digital products,                       │ PARTICLE  │   /         │ ┌ ACTIVITY FEED ────┐ │
│   │  systems and experiences that                    │  MATRIX   │  [EPOS]     │ │ WOS: Order #2365  │ │
│   │  solve real problems.               [QR SCANNER] ╰───────────╯             │ │ EPOS: Sale logged │ │
│   │                                                 /      |      \            │ └───────────────────┘ │
│   │  CORE SKILLS: [Flutter] [System Design]   [RECEIPT] [STITCH] [PEDOMETER]   │ ┌ SYSTEM HEALTH ────┐ │
│   │                                                                            │ │ DB / API / AUTH ▇▇│ │
│   │  [ ENTER COMMAND CENTER >> ] (Neon Glow)                                   │ └───────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ TECH STACK: Flutter · Node · AWS ] │ [ CURRENT FOCUS ] │ [ RECENT DEPLOYMENTS ] │ [ ⌖ RADAR SCAN ]  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layout Structure & Grid Breakdown

The portal uses a 3-column + tactical dock grid:

### A. Top Chrome (Status Header)
* **Left:** `HX313` logo + `PRODUCT ENGINEER` subtitle.
* **Center:** `PRODUCT CONSTELLATION` with a dotted timeline scale indicator.
* **Right:** Live digital clock (`SYSTEM TIME 11:37:42 PM UTC+5`), live status indicator (`STATUS ONLINE •`), and tactical menu trigger.

### B. Left Navigation & Hero Column (320px – 400px)
* **Leftmost Vertical Rail:** Micro-icon quick navigation (Home, Constellation, Projects, Terminal, Settings).
* **Identity Block:**
  * Greeting: `Hello, I'm`
  * Hero Title: `H × 313` with illuminated emerald green multiplication sign.
  * Subtitle: `PRODUCT ENGINEER`
  * Elevator Pitch: *"I build digital products, systems and experiences that solve real problems and create impact."*
* **Core Skills Pills:** `Product Architecture`, `System Design`, `Flutter`, `Node.js`, `API Design`, `Database`, `AI Integration`.
* **Primary System Access:** Glowing emerald button `[ ENTER COMMAND CENTER >> ]` + secondary `EXPLORE WORK >>`.

### C. Centerpiece: 3D Holographic Particle Globe & Network Nodes
* **Particle Earth Sphere (HTML5 Canvas / Three.js):**
  * 3D rotating spherical point cloud displaying continents and latitude/longitude orbital coordinate rings in vibrant emerald/teal.
  * Smooth mouse drag / inertia rotation and cursor parallax tracking.
* **Radiating Product Nodes:**
  * Central node: `H × 313`
  * Orbiting product badges connected via luminous bezier vectors:
    * `WOS` (Flagship Restaurant Tech Suite)
    * `EPOS` (Point of Sale & Bluetooth Dispatch)
    * `DIETIFY` (Nutrition & Health Tracking)
    * `RECEIPT SCANNER / EXPENSE FLOW` (Financial Management)
    * `EBILL CHECKER` (Utility Verification)
    * `SPEAK & TRANSLATE` (Multilingual Voice Utility)
    * `MASJID360` (Community Management Platform)
* **Mascot Interaction Layer (Aero 🤖 & Dash 🐦):**
  * Aero and Dash orbit the globe in continuous flight paths.
  * Autonomous interactions: Dash pecks at a node to trigger an orbital data pulse; Aero repairs connection glitches with his laser tool.
  * Clicking either mascot triggers soundless comic thought bubbles and playful trick animations.

### D. Right Telemetry Column (280px – 340px)
* **System Overview Card:**
  * Metrics: Active Nodes (`08`), Systems (`14`), Deployments (`12`), Integrations (`26`), Uptime (`99.98%`), Response Time (`42ms`).
* **Live Activity Feed:**
  * Auto-streaming simulated transaction and build log:
    * `WOS: Order #2365 Received · 2m ago`
    * `EPOS: New Sale Recorded · 5m ago`
    * `DIETIFY: Daily Goal Completed · 12m ago`
    * `MASJID360: New Booking Confirmed · 18m ago`
* **System Health Indicators:**
  * Segmented glowing status meters for `DATABASE`, `API SERVICES`, `AUTH SERVICE`, `STORAGE` + `VIEW ALL SYSTEMS` button.

### E. Bottom Tactical Dock
* **Tech Stack Hub:** Vector glyphs for Flutter, Dart, Node.js, MongoDB, Firebase, AWS.
* **Current Focus Widget:** Wireframe rotating prism graphic + *"Building intelligent systems and scalable products with AI integration and real-time capabilities."*
* **Recent Deployments:** Version chips (`WOS v2.3.1`, `EPOS v1.4.0`, `DIETIFY v1.2.3`).
* **Live Radar Scanner:** 360° sweeping tactical radar display in the bottom-right corner.

---

## 3. Color Palette & Visual Tokens (OKLCH / Dark Emerald)

| Token | Hex Equivalent | Role |
| :--- | :--- | :--- |
| `--color-bg-base` | `#06090e` | Deep space background |
| `--color-surface-panel` | `rgba(10, 15, 24, 0.85)` | Tactical glass panels with border lines |
| `--color-border-tactical` | `rgba(255, 255, 255, 0.08)` | Grid and card boundaries |
| `--color-emerald-primary` | `#10b981` | Core laser green accent and node glow |
| `--color-emerald-bright` | `#22c55e` | Active indicators and status text |
| `--color-teal-glow` | `rgba(16, 185, 129, 0.35)` | Box shadows and node halos |
| `--color-text-main` | `#f8fafc` | Primary titles and coordinates |
| `--color-text-muted` | `#94a3b8` | Telemetry labels and metadata |

---

## 4. Performance & Technical Architecture

* **Point Cloud Engine:** Lightweight Canvas 2D or Three.js particle renderer utilizing instanced geometry and mathematical sphere projection for stable 60fps across all devices.
* **Zero Layout Shift:** Rigid grid structure ensuring immediate above-the-fold paint without cumulative layout shifts.
* **Accessibility:** `prefers-reduced-motion` slows down or pauses globe auto-rotation; all nodes and buttons remain keyboard navigable with visible focus states.
