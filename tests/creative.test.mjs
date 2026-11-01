import assert from 'node:assert/strict'
import { test } from 'node:test'
import { extractPaletteFromPixels, validateImageFile } from '../src/lib/imagePalette.ts'
import { gradientCss, normalizeAngle } from '../src/lib/gradient.ts'

const rgba = (entries) => new Uint8ClampedArray(entries.flat())

test('image palettes extract visible dominant colors deterministically', () => {
  const pixels = rgba([
    ...Array.from({ length: 12 }, () => [220, 20, 35, 255]),
    ...Array.from({ length: 7 }, () => [16, 70, 235, 255]),
    ...Array.from({ length: 5 }, () => [24, 195, 80, 255]),
    ...Array.from({ length: 3 }, () => [255, 210, 20, 255]),
    ...Array.from({ length: 2 }, () => [157, 28, 212, 255]),
    [0, 0, 0, 0],
  ])
  const colors = extractPaletteFromPixels(pixels)
  assert.equal(colors.length, 5)
  assert.equal(new Set(colors).size, 5)
  assert.deepEqual(colors, extractPaletteFromPixels(pixels))
  assert.ok(colors.every((hex) => /^#[0-9A-F]{6}$/.test(hex)))
  assert.ok(colors.some((color) => color.startsWith('#D')))
})

test('flat image yields five distinct tonal shades', () => {
  const pixels = rgba(Array.from({ length: 10 }, () => [90, 110, 130, 255]))
  const colors = extractPaletteFromPixels(pixels)
  assert.equal(colors.length, 5)
  assert.equal(new Set(colors).size, 5)
})

test('image extractor ignores transparent pixels and rejects empty/invalid pixels', () => {
  assert.throws(() => extractPaletteFromPixels(rgba([[10, 20, 30, 0]])), /visible/)
  assert.throws(() => extractPaletteFromPixels(new Uint8ClampedArray([10, 20, 30])), /invalid/)
  assert.throws(() => extractPaletteFromPixels(rgba([[1, 2, 3, 255]]), 9), /between/)
})

test('upload validation rejects unsupported and oversized image files', () => {
  assert.equal(validateImageFile({ type: 'image/png', size: 1024 }), null)
  assert.match(validateImageFile({ type: 'image/svg+xml', size: 100 }), /PNG/)
  assert.match(validateImageFile({ type: 'image/jpeg', size: 14 * 1024 * 1024 }), /12 MB/)
})

test('gradient generator produces safe CSS for three supported modes', () => {
  const stops = [{ id: 1, color: '#ff0000', position: 100 }, { id: 2, color: '#0000ff', position: 0 }]
  assert.equal(gradientCss('linear', 450, stops), 'linear-gradient(90deg, #0000FF 0%, #FF0000 100%)')
  assert.equal(gradientCss('radial', 90, stops), 'radial-gradient(circle at center, #0000FF 0%, #FF0000 100%)')
  assert.match(gradientCss('conic', -45, stops), /^conic-gradient\(from 315deg at center/)
  assert.equal(normalizeAngle(NaN), 0)
})

test('gradient input cannot inject CSS and requires valid stops', () => {
  const stops = [{ id: 1, color: '#123456', position: 0 }, { id: 2, color: 'url(javascript:1)', position: 100 }]
  assert.throws(() => gradientCss('linear', 0, stops), /Invalid gradient stop/)
  assert.throws(() => gradientCss('radial', 0, stops.slice(0, 1)), /between 2 and 5/)
  assert.throws(() => gradientCss('invalid', 0, stops), /Unknown gradient/)
})
