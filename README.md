# COLOR Studio

**A thoughtful color toolkit for designers, makers, and developers.**

Explore a carefully curated palette library, create color harmonies, inspect readability, and preview your colors on real interface examples — all in your browser.

> v0.2 Creative Tools · A browser-local, free and open-source portfolio project. Not yet a production-grade design token platform.

## What's inside

| Explore | Create | Preview |
| --- | --- | --- |
| 64 original 5-color palettes | Five HSL harmony strategies | SaaS dashboard interface |
| Search, category filters, sorting | Lock and manually edit swatches | E-commerce storefront |
| Local favorites and palette details | Copy CSS variables / JSON | Product landing page |
| HEX copying and WCAG contrast checks | Download JSON and copy sharing URL | Live palette mapping |

### New in v0.2 — Creative Tools

- **Image to Palette:** upload or drop a local PNG/JPEG/WebP/AVIF/GIF (up to 12 MB), extract five dominant colors, copy HEX values, or apply them directly in the generator. The canvas samples a downscaled bitmap; original photos are never uploaded.
- **Gradient Studio:** linear, radial, and conic gradients, adjustable angle and stops, three curated presets, use your current palette, copy validated CSS.
- Lightweight portfolio footer: [Made by DaNial Zameni](https://danialz.com).
- **Apache License 2.0** with full `LICENSE` and project `NOTICE`.

Responsive layout, dark/light themes, keyboard navigation, and reduced-motion preferences remain part of the experience.

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
node --test
npm run build
```

GitHub Actions runs those same checks for pull requests and pushes to `main` or `feat/**`.

## Stack

- React + TypeScript + Vite
- Handcrafted design system in CSS; no UI framework dependency
- Native browser APIs for copy, download and local persistence
- Dependency-free HSL / WCAG contrast utilities in `src/lib/color.ts`
- Node.js native test runner for color engine, image extraction, and gradients

## Project structure

```text
src/
  components/   Palette cards, icons, previews, and creative tools
  data/         Handpicked seed palettes
  lib/          Pure color math, image clustering, gradients and URL helpers
  App.tsx       Explore, Create/Creative Tools and Preview flows
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

Next iterations may include OKLCH-based perceptual scales, richer export formats and enhanced accessibility inspection. These roadmap items are not yet shipped features.

## Author

Made by [DaNial Zameni](https://danialz.com).

Repository: [danialz/color-studio](https://github.com/danialz/color-studio)

**License:** [Apache-2.0](LICENSE). See [NOTICE](NOTICE).
