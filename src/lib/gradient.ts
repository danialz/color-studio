/** Validated, deterministic CSS gradients. */
import { normalizeHex } from './color.ts'

export type GradientMode = 'linear' | 'radial' | 'conic'
export interface GradientStop { id: number; color: string; position: number }
export const GRADIENT_MODES: readonly GradientMode[] = ['linear', 'radial', 'conic']

export function normalizeAngle(angle: number): number {
  return Number.isFinite(angle) ? ((Math.round(angle) % 360) + 360) % 360 : 0
}

export function gradientCss(mode: GradientMode, angle: number, stops: readonly GradientStop[]): string {
  if (!GRADIENT_MODES.includes(mode)) throw new Error('Unknown gradient mode')
  if (stops.length < 2 || stops.length > 5) throw new Error('Choose between 2 and 5 color stops')
  const colors = stops.map((stop) => {
    const hex = normalizeHex(stop.color)
    if (!hex || !Number.isFinite(stop.position)) throw new Error('Invalid gradient stop')
    return { hex, position: Math.max(0, Math.min(100, Math.round(stop.position))) }
  }).sort((a, b) => a.position - b.position)
  const list = colors.map(({ hex, position }) => `${hex} ${position}%`).join(', ')
  switch (mode) {
    case 'linear': return `linear-gradient(${normalizeAngle(angle)}deg, ${list})`
    case 'radial': return `radial-gradient(circle at center, ${list})`
    case 'conic': return `conic-gradient(from ${normalizeAngle(angle)}deg at center, ${list})`
  }
}
