# COLOR Studio

**A thoughtful color toolkit for designers, makers, and developers.**

Explore a carefully curated palette library, create color harmonies, inspect readability, and preview your colors on real interface examples — all in your browser.

> Foundation preview · This is an active portfolio project, not a production-grade design token platform yet.

## What's inside

| Explore | Create | Preview |
| --- | --- | --- |
| 64 original 5-color palettes | Five HSL harmony strategies | SaaS dashboard interface |
| Search, category filters, sorting | Lock and manually edit swatches | E-commerce storefront |
| Local favorites and palette details | Copy CSS variables / JSON | Product landing page |
| HEX copying and WCAG contrast checks | Download JSON and copy sharing URL | Live palette mapping |

Responsive layout, dark/light themes, keyboard navigation, and reduced-motion preferences are part of the initial foundation.

## Run locally

Node.js 24 and npm 11 are recommended.

```bash
npm install
npm run dev
```

Visit the local URL printed by Vite (usually `http://localhost:5173`).

## Quality checks

```bash
npm run lint
node --test tests/color.test.mjs
npm run build
```

GitHub Actions runs those same checks for pull requests and pushes to `main` or `feat/**`.

## Stack

- React + TypeScript + Vite
- Handcrafted design system in CSS; no UI framework dependency
- Native browser APIs for copy, download and local persistence
- Dependency-free HSL / WCAG contrast utilities in `src/lib/color.ts`
- Node.js native test runner for the color engine

## Project structure

```text
src/
  components/   Palette card, SVG icons, interface previews
  data/         Handpicked seed palettes
  lib/          Pure color math, harmony, export and URL helpers
  App.tsx       Explore, Create and Preview flows
  App.css       Design system and responsive layouts
  index.css     Global CSS reset
public/         Brand favicon
tests/          Color-engine unit tests
docs/           Architecture notes and scope boundaries
.github/        CI configuration
```

## Accessibility & caveats

Contrast checks use WCAG 2.x luminance and ratios and help assess common text/surface pairs. They are *not* a full accessibility audit. HSL harmonies are creative starting points; an OKLCH perceptual engine is part of the future roadmap, not claimed as implemented.

Preview examples contain intentionally fictional UI data. No user accounts, backend services, tracking, AI requests or external color APIs are required by the foundation.

## Roadmap

Next iterations are planned to cover image-to-palette, gradient editing, perceptually uniform token scales, richer export formats and enhanced accessibility inspection. Roadmap items are not shipped features.

## Author

Made by [Danial Zameni](https://danialz.com).

Repository: [danialz/color-studio](https://github.com/danialz/color-studio)

*License: not selected yet.*
