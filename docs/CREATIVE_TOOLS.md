# COLOR Studio v0.2 — Creative Tools

## Browser-local Image to Palette

- Input: browser-supported PNG, JPEG, WebP, AVIF or GIF, max 12 MiB; SVG is intentionally excluded.
- `createImageBitmap(file)` decodes a local user-selected file; a temporary object URL is only used for local preview and is revoked on replacement/unmount.
- A Canvas samples at most 192 pixels on the longest edge. Pixels with alpha < 200 are ignored.
- The pure `extractPaletteFromPixels` algorithm uses 5-bit RGB histogram buckets, weighted centroid selection, deterministic weighted k-means and a tonal fallback for flat images.
- The first five colors are copied to the generator with all swatch locks cleared when the user selects **Use in palette generator**.
- Images do not leave the user's device. No analytics, uploads, external APIs or accounts.
- The extractor is intended for creative exploration, not colorimetry, exact paint matching or ICC-aware analysis.

## Gradient Studio

- Modes: CSS `linear-gradient`, `radial-gradient`, `conic-gradient`.
- 2–5 validated stops. Colors must be `#RRGGBB`, positions clamped to 0–100%, angle normalized to 0–359 degrees.
- User may adjust color, stop position and angle, add/remove stops, apply presets, pull in the current palette and copy the CSS `background` declaration.
- Source files: `src/lib/imagePalette.ts`, `src/lib/gradient.ts`, `src/components/ImagePaletteStudio.tsx`, `src/components/GradientStudio.tsx`.

## Licensing and attribution

- Apache-2.0 license text is distributed at the project root in `LICENSE`, with additional project information in `NOTICE`.
- UI footer uses `Made by DaNial Zameni` linking to `https://danialz.com`.
- The open-source license does not require downstream forks to retain the exact UI footer.

## Quality gate

On Node.js 24: `node --test`, `npm run lint`, `npm run build`, and `npm run build -- --base=/color-studio/`.

Smoke-check 320/330/375/390/768/1440px, drag/drop, invalid/transparent photos, palette handoff, all three gradient modes and copied CSS.
