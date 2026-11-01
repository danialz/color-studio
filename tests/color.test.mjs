import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeHex, hexToRgb, rgbToHex, hexToHsl, hslToHex,
  relativeLuminance, contrastRatio, readableText,
  generatePalette, paletteToCss, paletteToJson, getSharedColors,
} from '../src/lib/color.ts'
import { PALETTES, CATEGORIES } from '../src/data/palettes.ts'

test('hex normalization rejects malformed values', () => {
  assert.equal(normalizeHex('ff00aa'), '#FF00AA')
  assert.equal(normalizeHex(' #aabbcc '), '#AABBCC')
  assert.equal(normalizeHex('#fff'), null)
  assert.equal(normalizeHex('javascript:evil'), null)
})

test('RGB and HSL conversion produce expected canonical colors', () => {
  assert.deepEqual(hexToRgb('#FF0080'), { r: 255, g: 0, b: 128 })
  assert.equal(rgbToHex(255, 0, 128), '#FF0080')
  assert.equal(hslToHex(0, 100, 50), '#FF0000')
  assert.equal(hslToHex(120, 100, 50), '#00FF00')
  assert.equal(hslToHex(240, 100, 50), '#0000FF')
  const hsl = hexToHsl('#7296C7')
  assert.equal(hslToHex(hsl.h, hsl.s, hsl.l), '#7296C7')
})

test('WCAG relative luminance and contrast ratio', () => {
  assert.equal(relativeLuminance('#000000'), 0)
  assert.equal(relativeLuminance('#FFFFFF'), 1)
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21)
  assert.equal(contrastRatio('#FFFFFF', '#FFFFFF'), 1)
  assert.equal(readableText('#FFFFFF'), '#17191E')
  assert.equal(readableText('#070707'), '#FFFFFF')
})

test('all five color harmonies produce valid colors', () => {
  for (const harmony of ['analogous', 'complementary', 'triadic', 'split', 'monochromatic']) {
    const output = generatePalette('#725CE0', harmony, [], () => 0.5)
    assert.equal(output.length, 5)
    assert.ok(output.every((part) => normalizeHex(part) === part), harmony)
  }
})

test('locked swatches remain unchanged', () => {
  const output = generatePalette('#725CE0', 'triadic', [null, '#00AAFF', null, null, '#FF00FF'], () => 0.1)
  assert.equal(output[1], '#00AAFF')
  assert.equal(output[4], '#FF00FF')
  assert.notEqual(output[0], '#00AAFF')
})

test('export formats and shared color links', () => {
  const colors = ['#ABCDEF', '#123456', '#FFFFFF', '#000000', '#FF55AA']
  assert.match(paletteToCss(colors), /--color-2: #123456;/)
  assert.deepEqual(JSON.parse(paletteToJson('Test', colors)), { name: 'Test', colors })
  assert.deepEqual(getSharedColors('?palette=abcdef-123456-ffffff-000000-ff55aa'), colors)
  assert.equal(getSharedColors('?palette=oops'), null)
  assert.equal(getSharedColors('?palette=abc-123456-ffffff-000000-ff55aa'), null)
})


test('curated library has unique valid five-swatch palettes in each category', () => {
  assert.equal(PALETTES.length, 64)
  assert.equal(new Set(PALETTES.map((palette) => palette.id)).size, 64)
  for (const palette of PALETTES) {
    assert.equal(palette.colors.length, 5, palette.id)
    assert.ok(palette.colors.every((color) => normalizeHex(color) === color), palette.id)
    assert.ok(CATEGORIES.includes(palette.category), palette.id)
  }
})
