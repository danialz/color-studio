# COLOR Studio — Foundation v0.1.0

COLOR Studio is a mobile-first color palette explorer, generator and live UI preview toolkit for designers and developers.

## Implemented in this foundation

- Curated library of **64 original five-swatch palettes** across 8 categories. Palettes are static source data; there is no backend or public user-generated content in this version.
- Search across palette names, HEX colors, tags, and categories; category filter, sorting, favorites-only view.
- Instant HEX copy on swatch click, detail inspector, WCAG contrast quick checks against light and dark surfaces.
- LocalStorage favorites and persistent light/dark preference, with graceful failure when storage is unavailable.
- Generator with 5 color-harmony modes, five individually editable color slots, and swatch locks.
- Export as CSS custom properties or JSON; download JSON or copy an optional URL-encoded 5-color share link.
- Live previews for SaaS dashboard, commerce and landing-page examples.
- Responsive CSS, keyboard-first navigation where appropriate, reduced-motion fallback, focusable controls and accessible controls names.
- No added production dependencies beyond the already installed Vite/React template.

## Run locally

```sh
npm install
npm run dev
```

## Verify

```sh
npm run lint
node --test tests/color.test.mjs
npm run build
```

Node.js 24 is used for local development and GitHub CI. Native TypeScript stripping is supported in Node.js 24 without an experimental flag.

## Code map

- `src/data/palettes.ts`: editorial seed library
- `src/lib/color.ts`: HEX conversion, HSL harmony generation, WCAG luminance/contrast, CSS/JSON exports, URL validation
- `src/components/PaletteCard.tsx`: interactive palette tile
- `src/components/LivePreview.tsx`: preview experiences without external assets
- `src/components/Icon.tsx`: tiny first-party SVG icon set
- `README.md`: public project overview
- `src/App.tsx`: Explore / Create / Preview product flows
- `src/App.css`, `src/index.css`: visual design system and responsive styling
- `tests/color.test.mjs`: no-extra-dependency engine tests
- `.github/workflows/ci.yml`: lint, engine test, build on push and PR

## Boundaries and upcoming versions

This is a foundation slice, **not a finished color-science product**. Harmony generation is HSL-based; a perceptual OKLCH engine and gamut handling are candidates for a later release. Contrast checks are WCAG 2.x ratio checks; they do not guarantee full UI accessibility. The preview uses fixed fictional content (not real analytics).

Image-to-palette, advanced gradient editing, token scale generation, richer exports, URL routing and cloud sync are intentionally **not** included yet. Keep the architecture simple until the primary UX is validated.

## Safety

The patch only adds or changes the files listed in `MANIFEST.json`. It must be applied to a clean, known scaffold checkout on the `feat/color-studio-foundation` branch. It does not require editing `main`, modifying QR Studio, connecting to a payment provider, or adding credentials. Never commit `.env` files or secrets.

© COLOR Studio. Designed & engineered by Danial Zameni.
