# HX313 Portfolio — System Command Center Master Implementation Prompt

## ROLE

You are a senior frontend engineer, creative developer, interaction designer, and UI systems architect.

You are building the production-ready portfolio website for **HX313 / Hafiz Ali Abdullah**, a full-stack software engineer.

The website must feel like a **premium software engineering studio / digital command center**, not a generic developer portfolio.

The visual direction is:

**Industrial software interface + premium SaaS + aerospace command center + restrained futuristic HUD**

Do NOT make it look like a gaming website, hacker terminal, crypto website, or generic cyberpunk dashboard.

The final result must be polished enough to be used as a real professional portfolio for attracting software clients.

---

# 1. TECH STACK — NON-NEGOTIABLE

Use:

- React
- JSX
- Vite
- JavaScript
- CSS / modern CSS
- GSAP
- `@gsap/react`
- Lucide React or another lightweight icon library if icons are needed
- SVG for diagrams, system maps, connectors, radar graphics, and interface decorations

Optional:

- React Three Fiber / Three.js ONLY if a specific visual genuinely benefits from 3D
- Do NOT introduce Three.js simply because the portfolio is futuristic

Do NOT use:

- TypeScript
- Next.js
- Angular
- Vue
- jQuery
- Bootstrap
- Material UI
- excessive component libraries
- huge animation libraries for effects that CSS/GSAP can handle

Prefer a lightweight architecture.

React should own application state and UI composition.

GSAP should own complex animation timelines and interaction animation. Use the React-specific GSAP integration correctly and clean up animations when components unmount.

---

# 2. PRIMARY DESIGN REFERENCE

The attached/reference screenshot represents the existing HX313 visual identity.

Preserve the strongest elements:

- dark almost-black background
- deep green undertones
- electric / mint green accent
- large bold typography
- restrained borders
- technical micro-labels
- generous spacing
- premium minimal composition
- strong left-side hero typography
- engineering / systems visual language

The existing hero contains:

**HAFIZ ALI ABDULLAH · FULL-STACK SOFTWARE ENGINEER**

**A MINDSET**

**BEYOND**

**ORDINARY.**

Supporting text:

"I turn ambitious ideas into production-ready software, apps, and SaaS platforms that move businesses forward."

Availability:

"AVAILABLE FOR FOCUSED BUILDS · 2026"

Keep this positioning.

Do not rewrite the brand into something generic.

---

# 3. CORE CONCEPT

Replace the existing right-side project constellation with a:

# SYSTEM COMMAND CENTER

The right side should feel like a real software command center.

The conceptual message is:

> I don't just build applications. I engineer systems.

The visual should communicate:

- systems thinking
- multiple products
- mobile applications
- SaaS
- backend systems
- APIs
- cloud integrations
- production software
- active builds
- shipped products

The interface should feel alive but controlled.

It should NOT look like a static dashboard template.

---

# 4. HERO STRUCTURE

The first viewport should be divided into two major visual zones.

## LEFT — PERSONAL POSITIONING

Approximately 42–45% width on desktop.

Contents:

### Eyebrow

HAFIZ ALI ABDULLAH  
·  
FULL-STACK SOFTWARE ENGINEER

### Main headline

A MINDSET  
BEYOND  
ORDINARY.

Make:

- "A MINDSET" light/white
- "BEYOND" green
- "ORDINARY." muted dark gray

The typography must be huge, bold, condensed-looking if an appropriate font is available.

Do not make the heading overly rounded or playful.

### Description

I turn ambitious ideas into production-ready software, apps, and SaaS platforms that move businesses forward.

### Availability

● AVAILABLE FOR FOCUSED BUILDS · 2026

The green status indicator should have a subtle breathing animation.

---

# 5. RIGHT — SYSTEM COMMAND CENTER

Approximately 55–58% width.

Create a large framed command-center environment.

Header:

```text
/// SYSTEM COMMAND CENTER
```

Right side:

```text
SYSTEM MAP / 08
```

The command center should contain five major areas:

1. System Core
2. Active Build
3. Project Inventory
4. System Status
5. Activity Feed

At the bottom, include proof metrics.

---

# 6. SYSTEM CORE

This is the visual centerpiece.

Create a sophisticated circular system diagram.

Center:

```text
HX313

FULL-STACK
SOFTWARE ENGINEER

● ONLINE
```

Around the center create four conceptual system domains:

### MOBILE APPLICATIONS

### SAAS PLATFORMS

### BACKEND SYSTEMS

### API & CLOUD INTEGRATIONS

These should sit around the central HX313 node.

Use:

- SVG rings
- thin orbital lines
- subtle grid
- small nodes
- radial connection lines
- very subtle glow
- tiny animated pulses

Do NOT overdo the glow.

The center should look engineered, not magical.

---

# 7. SYSTEM CORE ANIMATION

On page load:

1. outer grid fades in
2. rings draw themselves
3. connection lines appear sequentially
4. nodes illuminate
5. HX313 fades/scales into position
6. ONLINE status activates
7. surrounding labels appear

Use GSAP timelines.

The animation should take approximately 1.5–2.5 seconds.

Do not make the user wait for the site.

The page must remain usable during animation.

After the initial sequence, the system should enter an idle state.

Idle animation:

- very slow orbital movement
- occasional node pulse
- subtle scan line
- tiny data points moving along selected paths
- extremely low-frequency glow changes

No constant aggressive movement.

---

# 8. ACTIVE BUILD

Create a prominent panel:

```text
ACTIVE BUILD                                      01 / 08

EPOS

POS · OPERATIONS · SAAS

Production point-of-sale and operations
management platform for modern businesses.

● PRODUCTION
```

Include an EPOS visual/product screenshot area.

If an actual EPOS image exists in the project assets, use it.

Do NOT invent a fake screenshot if an actual asset is available.

Panel should also show example system metrics:

```text
OUTLETS        PRODUCTS        USERS
24             1,842           3.2K+
```

These values should be treated as content/configuration, not hardcoded throughout the UI.

Create a central data object for project information.

CTA:

```text
VIEW CASE STUDY ↗
```

Hovering the button should produce a subtle green directional animation.

---

# 9. PROJECT INVENTORY

Create a project section titled:

```text
PROJECTS
```

Projects:

### DIETIFY
Health · Mobile App
SHIPPED

### PET CARE
Care · Mobile App
SHIPPED

### NOOR-UL-QURAN
Learning · Mobile App
SHIPPED

### READMATE
Reading · Mobile App
SHIPPED

### QR SCANNER
Utility · Mobile App
SHIPPED

### SPEAK & TRANSLATE
Language · AI Voice
SHIPPED

EPOS should remain the active build and should NOT visually compete equally with these cards.

The active project should have higher hierarchy.

---

# 10. PROJECT CARD INTERACTION

Project cards are interactive.

Default state:

- muted
- compact
- minimal
- low visual noise

Hover:

- card border becomes slightly brighter
- project icon scales very subtly
- green status indicator becomes active
- metadata becomes clearer
- background gradient shifts subtly
- active build indicator changes

Click:

- select project
- update Active Build panel
- update System Core highlight
- update project number
- update metadata
- update screenshot
- update CTA

Do NOT navigate immediately on simple hover.

Use React state for selected project.

Example state:

```js
const [selectedProject, setSelectedProject] = useState(projects[0]);
```

The command center must feel like one interconnected system.

---

# 11. SYSTEM STATUS

Create a compact panel:

```text
SYSTEM STATUS

SYSTEM HEALTH       OPTIMAL
ACTIVE PROJECTS     08
SHIPPED PROJECTS    15+
YEARS BUILDING      5+
UPTIME              99.9%
```

Use small icons.

Do not make this look like a real server monitoring system unless clearly presented as portfolio metadata.

This is a visual representation of the engineer's ecosystem, not a fake live infrastructure monitor.

---

# 12. ACTIVITY FEED

Create:

```text
ACTIVITY FEED

● EPOS system deployment
  2h ago

● New feature released
  5h ago

● Performance optimized
  1d ago

● Dietify app updated
  2d ago

● Database backup completed
  2d ago
```

Important:

These should be clearly treated as portfolio/system storytelling content.

Do not claim these are real-time production events unless connected to a real backend.

Create them as static configuration for now.

---

# 13. BOTTOM PROOF BAR

At the bottom of the command center:

```text
100K+
TOTAL DOWNLOADS

08+
PROJECTS COMPLETED

15+
SYSTEMS SHIPPED

5+
YEARS BUILDING
```

Make the numbers visually strong.

Do not use huge dashboard cards.

Use a single horizontal system strip.

---

# 14. TECHNOLOGIES PANEL

On the lower portion of the left hero area, add:

```text
TECHNOLOGIES
```

Technology icons:

- Flutter
- Dart
- Node.js
- MongoDB
- Firebase
- Git
- Docker

Use monochrome / muted icons.

Green should only appear on hover or active state.

This section should support the hero rather than dominate it.

---

# 15. NAVIGATION

Top navigation:

Left:

```text
Hx313
```

Center:

```text
WORK
SERVICES
ABOUT
```

Right:

```text
SYSTEM
LIGHT
DARK
```

and:

```text
LET'S TALK ↗
```

The existing SYSTEM / LIGHT / DARK concept should remain.

SYSTEM should be the primary active mode.

Navigation should be clean and minimal.

Use a sticky/fixed navigation only if it does not interfere with the command center.

---

# 16. VISUAL LANGUAGE

Use a palette approximately around:

```css
--bg: #0b0f0e;
--bg-deep: #07110d;
--surface: #0d1713;
--surface-elevated: #101c17;
--green: #79f29a;
--green-bright: #8affaa;
--green-dark: #174f2d;
--text: #f1f4f1;
--text-muted: #9ca8a1;
--text-dim: #56615b;
--border: rgba(121, 242, 154, 0.16);
```

Do not use bright neon green everywhere.

The green accent should be valuable because it is scarce.

---

# 17. BACKGROUND

Create a subtle technical background.

Possible elements:

- extremely faint radial gradients
- 1px grid
- technical coordinate marks
- subtle noise texture
- very faint green bloom
- thin horizontal scan line
- tiny system markers

Keep opacity extremely low.

The background should only become noticeable after looking closely.

Do not create visual clutter.

---

# 18. TYPOGRAPHY

Use a modern technical sans-serif.

Prefer something similar to:

- Space Grotesk
- Inter
- Geist
- IBM Plex Sans

For micro labels, use a technical uppercase treatment.

Hero typography should be very bold.

Use letter spacing strategically.

Avoid excessive typography styles.

---

# 19. RESPONSIVE DESIGN

Desktop:

>= 1200px

Use the full command center.

Tablet:

768px–1199px

Reorganize into:

```text
Hero
↓
System Core
↓
Active Build
↓
Projects
↓
Status
↓
Metrics
```

Mobile:

<768px

Do NOT attempt to squeeze the desktop command center into mobile.

Instead:

Hero:

```text
HAFIZ ALI ABDULLAH
FULL-STACK SOFTWARE ENGINEER

A MINDSET
BEYOND
ORDINARY.
```

Then:

```text
SYSTEM CORE
```

The orbital system should scale down dramatically.

Hide non-essential decorative orbital lines.

Active Build becomes full width.

Project cards become horizontally scrollable or vertically stacked.

Status and activity become compact cards.

Metrics become a 2x2 grid.

Navigation becomes a mobile menu.

---

# 20. MOBILE SYSTEM CORE

On mobile, the system core should remain recognizable.

Do NOT remove it completely.

Use:

- smaller rings
- fewer connection lines
- fewer labels
- central HX313
- four small domain indicators

The system map should remain the signature visual of the website.

---

# 21. MOTION DESIGN

Use animation with restraint.

Required animations:

### Page entry

Fade + slight upward movement.

### Hero text

Stagger each line.

### System core

SVG drawing / node activation.

### Status indicators

Very subtle pulse.

### Project cards

Hover elevation and border transition.

### Active project

Smooth transition when changing project.

### Navigation

Minimal hover movement.

### CTA

Arrow moves a few pixels on hover.

### Scroll

Use subtle section reveal.

If GSAP is used, prefer the React-specific `useGSAP()` pattern and proper cleanup rather than unmanaged animation effects.

---

# 22. ACCESSIBILITY

Must include:

- semantic HTML
- keyboard navigation
- visible focus states
- aria labels where appropriate
- accessible buttons
- accessible project selection
- reduced-motion support

If:

```css
prefers-reduced-motion: reduce
```

is active:

- disable orbital animation
- disable aggressive transitions
- remove scan movement
- keep only essential state transitions

The website must remain fully usable.

---

# 23. PERFORMANCE

This is a portfolio website, not a benchmark demo.

Prioritize:

- fast initial load
- minimal JavaScript
- lazy loading images
- optimized assets
- no unnecessary 3D
- no giant background videos
- no excessive DOM nodes
- no continuous expensive animation loops

If SVG can accomplish something, prefer SVG over Canvas/WebGL.

If CSS can accomplish something, prefer CSS over JavaScript.

Use GSAP only where it provides meaningful interaction.

---

# 24. COMPONENT ARCHITECTURE

Organize the React project cleanly.

Suggested structure:

```text
src/
├── components/
│   ├── navigation/
│   │   └── Navigation.jsx
│   │
│   ├── hero/
│   │   ├── Hero.jsx
│   │   ├── HeroCopy.jsx
│   │   ├── AvailabilityStatus.jsx
│   │   └── TechnologyStrip.jsx
│   │
│   ├── command-center/
│   │   ├── CommandCenter.jsx
│   │   ├── SystemCore.jsx
│   │   ├── SystemMap.jsx
│   │   ├── ActiveBuild.jsx
│   │   ├── ProjectGrid.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── SystemStatus.jsx
│   │   ├── ActivityFeed.jsx
│   │   └── MetricsBar.jsx
│   │
│   └── ui/
│       ├── StatusDot.jsx
│       ├── TechnicalLabel.jsx
│       └── IconButton.jsx
│
├── data/
│   ├── projects.js
│   ├── technologies.js
│   └── activity.js
│
├── hooks/
│   ├── useCommandCenter.js
│   └── useReducedMotion.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   ├── typography.css
│   └── animations.css
│
├── App.jsx
└── main.jsx
```

Do not create one enormous `App.jsx`.

---

# 25. DATA ARCHITECTURE

Projects should be data-driven.

Example:

```js
export const projects = [
  {
    id: "epos",
    name: "EPOS",
    category: "Operations",
    type: "Flutter · SaaS",
    status: "production",
    featured: true,
    image: "/assets/projects/epos.webp",
    metrics: {
      outlets: 24,
      products: "1,842",
      users: "3.2K+"
    }
  },
  {
    id: "dietify",
    name: "Dietify",
    category: "Health",
    type: "Mobile App",
    status: "shipped",
    featured: false
  }
];
```

Do the same for:

- technologies
- activity
- system metrics
- navigation

Never duplicate the same content across multiple components.

---

# 26. COMMAND CENTER INTERACTION MODEL

The command center is the key differentiator.

When a project is selected:

### Step 1

Project card becomes active.

### Step 2

System Core highlights the relevant domain.

For example:

EPOS:

```text
SAAS
BACKEND
API & CLOUD
```

Dietify:

```text
MOBILE
```

### Step 3

Active Build updates.

### Step 4

The active build image transitions.

### Step 5

Metadata updates.

### Step 6

CTA changes if necessary.

All transitions should be smooth.

Use approximately:

```text
250–500ms
```

for normal interaction.

Do not create long 1–2 second transitions for ordinary hover interactions.

---

# 27. SYSTEM MAP VISUAL

The system map should not be a generic circular graph.

It should have a designed hierarchy:

```text
                    MOBILE
                       │
                       │
              ┌────────┴────────┐
              │                 │
          PROJECTS           PROJECTS
              │                 │
              └───────┐ ┌───────┘
                      │ │
                  ┌───▼─▼───┐
                  │  HX313  │
                  │         │
                  │ ENGINEER│
                  └───┬─┬───┘
                      │ │
              ┌───────┘ └───────┐
              │                 │
            SAAS              BACKEND
              │                 │
              └───────┬─────────┘
                      │
                API / CLOUD
```

But the actual implementation should be visually sophisticated.

Use SVG paths.

Use subtle animated path strokes.

Use small circular nodes.

Use occasional moving data particles.

---

# 28. NO GENERIC DASHBOARD TEMPLATE

This is critical.

Do NOT make the design look like:

- Admin dashboard
- CRM
- Analytics dashboard
- Trading dashboard
- Crypto terminal
- Hacker terminal

It is a **portfolio command center**.

Every interface element must reinforce:

**HX313 = software engineering systems.**

---

# 29. VISUAL HIERARCHY

Priority order:

1. A MINDSET BEYOND ORDINARY
2. HX313 System Core
3. EPOS Active Build
4. Project ecosystem
5. Technologies
6. Status/activity
7. Metrics
8. Decorative elements

Never allow decorative elements to overpower the hero headline.

---

# 30. FIRST VIEWPORT

At 1440×900:

The first viewport should show:

- navigation
- complete hero headline
- hero description
- availability
- majority of command center
- system core
- active EPOS build
- project section beginning
- no awkward clipping

At 1920×1080:

The composition should breathe.

Do not simply scale everything up.

Use max-width containers.

---

# 31. DESIGN DETAILS

Use:

- 1px borders
- rounded corners around 8–16px
- small radius on technical modules
- subtle inner shadows
- faint green gradients
- occasional corner brackets
- small status indicators
- technical labels
- restrained uppercase typography

Avoid:

- excessive glassmorphism
- giant rounded cards
- excessive shadows
- gradients everywhere
- glowing text
- random particles
- fake terminal text
- excessive icons

---

# 32. INTERACTION DETAILS

Cursor/hover interactions should feel intentional.

For interactive system nodes:

- cursor changes appropriately
- node brightens
- connection line activates
- corresponding project metadata highlights

For buttons:

- border shifts
- arrow moves
- subtle background fill appears

For project cards:

- image scale 1.02–1.04 maximum
- no huge zoom
- metadata transitions smoothly

---

# 33. LIGHT / DARK / SYSTEM

The navigation already contains:

```text
SYSTEM
LIGHT
DARK
```

Implement these modes properly.

### SYSTEM

Default.

The premium dark command-center theme.

### LIGHT

Transform the interface into a clean light engineering portfolio.

Do not simply invert colors.

### DARK

A deeper, more monochromatic version of SYSTEM.

Persist the user's selection using localStorage.

Respect:

```text
prefers-color-scheme
```

when SYSTEM mode is selected.

---

# 34. CONTENT INTEGRITY

Do not invent credentials, clients, companies, awards, statistics, testimonials, or production claims.

Use only supplied portfolio information.

If information is uncertain, create a configurable placeholder in the data layer rather than inventing a fact.

Do not fabricate "real-time" data.

Do not claim that a project has a specific number of users/downloads unless the content explicitly provides it.

---

# 35. SEO

Implement:

- proper `<title>`
- meta description
- semantic headings
- Open Graph metadata
- favicon
- canonical URL placeholder
- descriptive image alt text

Suggested title:

```text
HX313 — Full-Stack Software Engineer
```

Suggested description:

```text
Hafiz Ali Abdullah — Full-stack software engineer building production-ready mobile apps, SaaS platforms, and software systems.
```

---

# 36. CODE QUALITY

Write production-quality code.

Requirements:

- no duplicated JSX
- no unnecessary state
- no magic numbers where configuration is appropriate
- reusable components
- clean naming
- clean imports
- no console errors
- no unused dependencies
- no unused variables
- no dead components
- no commented-out abandoned implementations

Keep components focused.

---

# 37. DO NOT OVERENGINEER

Do not build a backend for static portfolio content.

Do not introduce a database.

Do not create authentication.

Do not introduce state-management libraries unless there is a real need.

React state is enough for the current command-center interaction.

---

# 38. ASSET HANDLING

Before creating fake visual assets:

1. inspect the existing project assets
2. identify available logos
3. identify project screenshots
4. identify fonts
5. identify icons
6. reuse existing assets wherever possible

Do not replace real project logos with generic icons.

Do not redraw logos using CSS.

Do not distort project artwork.

Use `object-fit: contain` for logos.

---

# 39. IMPLEMENTATION ORDER

Work in this order:

### Phase 1

Inspect existing repository.

Understand:

- package.json
- existing components
- assets
- CSS
- routing
- build configuration

Do not destroy existing functionality blindly.

### Phase 2

Establish:

- design tokens
- typography
- spacing
- global background
- responsive container

### Phase 3

Build navigation.

### Phase 4

Build hero left side.

### Phase 5

Build System Core.

### Phase 6

Build Active Build panel.

### Phase 7

Build Project Inventory.

### Phase 8

Build Status + Activity.

### Phase 9

Build Metrics.

### Phase 10

Add animation.

### Phase 11

Responsive implementation.

### Phase 12

Accessibility/performance audit.

### Phase 13

Final visual polish.

---

# 40. IMPORTANT — DO NOT STOP AT A STATIC MOCKUP

The result must actually work.

The following must be functional:

- project selection
- active build updates
- system-core highlighting
- navigation
- theme switch
- CTA interactions
- responsive layout
- hover states
- keyboard navigation
- reduced-motion behavior

The command center should feel like an interactive system.

---

# 41. FINAL VISUAL TARGET

The final page should communicate this within approximately five seconds:

> HX313 is a serious software engineer who builds real mobile applications, SaaS products, backend systems, and complete digital products.

The visitor should immediately notice:

**A MINDSET BEYOND ORDINARY.**

Then:

**HX313 SYSTEM COMMAND CENTER**

Then:

**EPOS — ACTIVE BUILD**

Then:

**A broader ecosystem of shipped products.**

The visual should feel:

**technical  
premium  
confident  
minimal  
engineered  
distinctive  
modern  
credible**

Not:

**gimmicky  
over-animated  
cyberpunk  
template-like  
AI-generated-looking  
cluttered**

---

# 42. FINAL QUALITY CHECK

Before considering the implementation complete, verify:

- [ ] Desktop hero matches the intended composition
- [ ] Command center is visually dominant on the right
- [ ] Hero headline remains dominant overall
- [ ] EPOS is clearly the featured active build
- [ ] Projects are data-driven
- [ ] Selecting a project updates the command center
- [ ] System Core reacts to selected project
- [ ] GSAP animations are cleaned up correctly
- [ ] Reduced-motion mode works
- [ ] Light/Dark/System modes work
- [ ] Mobile layout is intentionally redesigned
- [ ] No horizontal overflow
- [ ] No console errors
- [ ] No unused imports
- [ ] No fake live-system claims
- [ ] Real project assets are reused
- [ ] Page loads quickly
- [ ] Typography is consistent
- [ ] Green accent is restrained
- [ ] Decorative HUD elements do not overpower content
- [ ] Navigation works
- [ ] CTAs work
- [ ] Keyboard navigation works
- [ ] Accessibility labels exist where needed
- [ ] SEO metadata exists

## FINAL INSTRUCTION

Do not blindly copy the reference image.

Use it as the **visual language and brand reference**.

Improve the composition where necessary.

The goal is not to recreate a screenshot.

The goal is to build a **real, responsive, interactive HX313 System Command Center portfolio experience** that looks intentionally designed and production-ready.

Make every design decision support the central positioning:

# HX313
## FULL-STACK SOFTWARE ENGINEER
### BUILDING SYSTEMS BEYOND ORDINARY.