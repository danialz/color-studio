/** Browser-local image palette extraction. No image bytes are transmitted. */
import { hexToHsl, hslToHex, rgbToHex } from './color.ts'

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024
export const SAMPLE_EDGE = 192
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'] as const

interface Bucket {
  r: number
  g: number
  b: number
  count: number
}

const distanceSquared = (a: Bucket, b: Bucket) =>
  (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2

/** Deterministic quantization + weighted k-means; accepts a canvas RGBA buffer. */
export function extractPaletteFromPixels(data: Uint8ClampedArray, count = 5): string[] {
  if (data.length === 0 || data.length % 4 !== 0) throw new Error('Image pixel data is invalid')
  if (!Number.isInteger(count) || count < 2 || count > 8) throw new Error('Palette size must be between 2 and 8')

  const buckets = new Map<number, Bucket>()
  const pixels = data.length / 4
  const step = Math.max(1, Math.floor(pixels / 16000))
  for (let pixel = 0; pixel < pixels; pixel += step) {
    const i = pixel * 4
    if (data[i + 3] < 200) continue // Transparent pixels do not tint the results.
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.r += r; bucket.g += g; bucket.b += b; bucket.count += 1
    } else {
      buckets.set(key, { r, g, b, count: 1 })
    }
  }
  if (!buckets.size) throw new Error('The image contains no visible pixels')

  const points = [...buckets.values()].map((item) => ({
    r: item.r / item.count, g: item.g / item.count, b: item.b / item.count, count: item.count,
  })).sort((a, b) => b.count - a.count)
  const candidates = points.slice(0, 400)
  const centers: Bucket[] = [ { ...candidates[0] } ]
  while (centers.length < Math.min(count, candidates.length)) {
    const next = candidates.filter((point) => centers.every((center) => distanceSquared(point, center) > 0))
      .map((point) => ({ point, score: Math.min(...centers.map((center) => distanceSquared(point, center))) * Math.sqrt(point.count) }))
      .sort((a, b) => b.score - a.score)[0]
    if (!next || next.score < 1) break
    centers.push({ ...next.point })
  }

  let weights: number[] = []
  for (let iteration = 0; iteration < 8; iteration++) {
    const groups = centers.map(() => ({ r: 0, g: 0, b: 0, count: 0 }))
    for (const point of points) {
      let closest = 0
      let best = distanceSquared(point, centers[0])
      for (let i = 1; i < centers.length; i++) {
        const distance = distanceSquared(point, centers[i])
        if (distance < best) { best = distance; closest = i }
      }
      groups[closest].r += point.r * point.count
      groups[closest].g += point.g * point.count
      groups[closest].b += point.b * point.count
      groups[closest].count += point.count
    }
    weights = groups.map((group) => group.count)
    groups.forEach((group, i) => {
      if (!group.count) return
      centers[i] = { r: group.r / group.count, g: group.g / group.count, b: group.b / group.count, count: group.count }
    })
  }

  const output = centers.map((center, index) => ({
    hex: rgbToHex(center.r, center.g, center.b), weight: weights[index],
  })).sort((a, b) => b.weight - a.weight)
    .map((item) => item.hex)
  const unique = [...new Set(output)]
  const first = unique[0]
  const base = hexToHsl(first)
  // Near-monochrome source photos still produce useful 5-swatch tonal palettes.
  const tones = [15, 34, 53, 72, 88, 24, 63, 95]
  for (const l of tones) {
    if (unique.length >= count) break
    const shade = hslToHex(base.h, base.s, l)
    if (!unique.includes(shade)) unique.push(shade)
  }
  return unique.slice(0, count)
}

export function validateImageFile(file: { size: number; type: string }): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])) {
    return 'Use a PNG, JPEG, WebP, AVIF, or GIF image.'
  }
  if (!file.size || file.size > MAX_IMAGE_BYTES) {
    return 'Choose an image smaller than 12 MB.'
  }
  return null
}
