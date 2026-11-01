/** Small, dependency-free color engine for COLOR Studio. All public hex strings use #RRGGBB. */
export type Harmony = 'analogous' | 'complementary' | 'triadic' | 'split' | 'monochromatic'
export type PaletteCategory = 'Minimal' | 'Pastel' | 'Bold' | 'Earthy' | 'Dark' | 'Retro' | 'Nature' | 'Luxury'

export interface Palette {
  id: string
  name: string
  category: PaletteCategory
  colors: readonly string[]
  tags: readonly string[]
}

export const HARMONIES: readonly { value: Harmony; label: string; description: string }[] = [
  { value: 'analogous', label: 'Analogous', description: 'Neighboring hues' },
  { value: 'complementary', label: 'Complementary', description: 'Opposite hues' },
  { value: 'triadic', label: 'Triadic', description: 'Three balanced hues' },
  { value: 'split', label: 'Split complementary', description: 'Balanced contrast' },
  { value: 'monochromatic', label: 'Monochromatic', description: 'One hue, five shades' },
]

const HEX_RE = /^#?([\da-f]{6})$/i
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const positiveModulo = (value: number, modulo: number) => ((value % modulo) + modulo) % modulo

export function normalizeHex(value: string): string | null {
  const match = HEX_RE.exec(value.trim())
  return match ? `#${match[1].toUpperCase()}` : null
}

export function hexToRgb(value: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(value)
  if (!normalized) throw new Error(`Invalid hex color: ${value}`)
  const hex = normalized.slice(1)
  return { r: Number.parseInt(hex.slice(0, 2), 16), g: Number.parseInt(hex.slice(2, 4), 16), b: Number.parseInt(hex.slice(4, 6), 16) }
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

export function hexToHsl(value: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(value)
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const diff = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (diff !== 0) {
    s = diff / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r: h = ((g - b) / diff) % 6; break
      case g: h = (b - r) / diff + 2; break
      default: h = (r - g) / diff + 4
    }
    h = positiveModulo(h * 60, 360)
  }
  return { h, s: s * 100, l: l * 100 }
}

export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const h = positiveModulo(hue, 360)
  const s = clamp(saturation, 0, 100) / 100
  const l = clamp(lightness, 0, 100) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  const segment = Math.floor(h / 60)
  const channels = [
    [c, x, 0], [x, c, 0], [0, c, x],
    [0, x, c], [x, 0, c], [c, 0, x],
  ][segment]
  return rgbToHex((channels[0] + m) * 255, (channels[1] + m) * 255, (channels[2] + m) * 255)
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const linear = [r, g, b].map((value) => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

export function contrastRatio(a: string, b: string): number {
  const aLum = relativeLuminance(a), bLum = relativeLuminance(b)
  return (Math.max(aLum, bLum) + 0.05) / (Math.min(aLum, bLum) + 0.05)
}

export function readableText(background: string): '#FFFFFF' | '#17191E' {
  return contrastRatio(background, '#FFFFFF') >= contrastRatio(background, '#17191E') ? '#FFFFFF' : '#17191E'
}

export function paletteToCss(colors: readonly string[]): string {
  const lines = colors.map((color, index) => `  --color-${index + 1}: ${normalizeHex(color) ?? color};`)
  return [':root {', ...lines, '}'].join('\n')
}

export function paletteToJson(name: string, colors: readonly string[]): string {
  return JSON.stringify({ name, colors: colors.map((color) => normalizeHex(color) ?? color) }, null, 2)
}

/** Deterministic when a caller injects a seeded random function; locked slots are preserved. */
export function generatePalette(
  seed: string,
  harmony: Harmony = 'analogous',
  locked: readonly (string | null)[] = [],
  random: () => number = Math.random,
): string[] {
  const normalized = normalizeHex(seed)
  if (!normalized) throw new Error('Generator seed must be a six-digit HEX color')
  const base = hexToHsl(normalized)
  const offsets: Record<Harmony, number[]> = {
    analogous: [-38, -16, 0, 18, 40],
    complementary: [-24, 0, 18, 164, 188],
    triadic: [-16, 0, 116, 132, 248],
    split: [-12, 0, 136, 156, 218],
    monochromatic: [0, 0, 0, 0, 0],
  }
  const lightness = [24, 38, 52, 67, 82]
  return offsets[harmony].map((offset, index) => {
    const retained = locked[index]
    if (retained !== null && retained !== undefined) {
      const valid = normalizeHex(retained)
      if (valid) return valid
    }
    const jitter = (clamp(random(), 0, 1) - 0.5) * 17
    const hue = base.h + offset + (harmony === 'monochromatic' ? 0 : jitter)
    const saturation = harmony === 'monochromatic'
      ? clamp(base.s + (index - 2) * 5, 10, 87)
      : clamp(base.s * 0.76 + 16 + (index % 2) * 7 + jitter / 3, 18, 88)
    const brightness = clamp(lightness[index] + jitter / 2, 17, 88)
    return hslToHex(hue, saturation, brightness)
  })
}

export function getSharedColors(queryString: string): string[] | null {
  const serialized = new URLSearchParams(queryString).get('palette')
  if (!serialized) return null
  const parts = serialized.split('-')
  if (parts.length !== 5) return null
  const normalized = parts.map((part) => normalizeHex(part))
  return normalized.every((part) => part !== null) ? normalized as string[] : null
}
