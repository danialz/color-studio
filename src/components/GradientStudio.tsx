import { useRef, useState } from 'react'
import Icon from './Icon'
import { GRADIENT_MODES, gradientCss } from '../lib/gradient'
import type { GradientMode, GradientStop } from '../lib/gradient'

interface Props {
  palette: readonly string[]
  onCopy: (css: string) => void
}

const PRESETS = [
  { name: 'Afterglow', stops: ['#BFA8E7', '#F5B8B2', '#F3D9A5'] },
  { name: 'Lagoon', stops: ['#244C6B', '#4CA9A8', '#D8F2D5'] },
  { name: 'Electric', stops: ['#17163B', '#8D56DC', '#F890B7'] },
] as const

const fromColors = (values: readonly string[], five = false): GradientStop[] => {
  const selected = five ? values.slice(0, 5) : [values[0], values[Math.floor(values.length / 2)], values[values.length - 1]]
  return selected.map((color, index) => ({ id: index + 1, color: color || '#A997E8', position: Math.round(index * 100 / (selected.length - 1)) }))
}

export default function GradientStudio({ palette, onCopy }: Props) {
  const [mode, setMode] = useState<GradientMode>('linear')
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState<GradientStop[]>(() => fromColors(palette))
  const nextId = useRef(6)
  const css = gradientCss(mode, angle, stops)

  function changeStop(id: number, change: Partial<GradientStop>) {
    setStops((current) => current.map((stop) => stop.id === id ? { ...stop, ...change } : stop))
  }

  function addStop() {
    setStops((current) => {
      if (current.length >= 5) return current
      const sorted = [...current].sort((a, b) => a.position - b.position)
      let gapIndex = 0, biggestGap = -1
      for (let index = 0; index < sorted.length - 1; index++) {
        const gap = sorted[index + 1].position - sorted[index].position
        if (gap > biggestGap) { gapIndex = index; biggestGap = gap }
      }
      const id = nextId.current++
      return [...current, { id, color: palette[current.length % palette.length] || '#A997E8', position: Math.round((sorted[gapIndex].position + sorted[gapIndex + 1].position) / 2) }]
    })
  }

  return <section className="creative-card gradient-workspace" aria-labelledby="gradient-tool-title">
    <div className="creative-card-heading"><span className="section-kicker">02 / GRADIENT STUDIO</span><h3 id="gradient-tool-title">A beautiful <em>blend.</em></h3><p>Compose smooth backgrounds with editable stops, direction and three gradient modes. Copy production-ready CSS.</p></div>
    <div className="gradient-preview" style={{ background: css }} role="img" aria-label={`Preview of ${mode} gradient`}><span>YOUR COLOR STORY</span><strong>Make waves<br/>with color.</strong></div>
    <div className="gradient-mode-row" role="group" aria-label="Gradient type">{GRADIENT_MODES.map((value) => <button type="button" key={value} aria-pressed={mode === value} className={mode === value ? 'selected' : ''} onClick={() => setMode(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}</button>)}</div>
    {mode !== 'radial' && <div className="gradient-angle"><label htmlFor="gradient-angle-range">{mode === 'conic' ? 'Start angle' : 'Direction'} <strong>{angle}°</strong></label><input id="gradient-angle-range" type="range" min="0" max="359" step="1" value={angle} onChange={(event) => setAngle(Number(event.target.value))}/></div>}
    <div className="gradient-stops-head"><strong>Color stops</strong><button type="button" disabled={stops.length >= 5} onClick={addStop}>+ Add stop <span>{stops.length}/5</span></button></div>
    <div className="gradient-stops-list">{stops.map((stop, index) => <div className="gradient-stop-row" key={stop.id}>
      <label className="gradient-color-input" title={`Change stop ${index + 1}`}><span className="sr-only">Color stop {index + 1}</span><input type="color" value={stop.color} onChange={(event) => changeStop(stop.id, { color: event.target.value })}/></label>
      <span className="gradient-stop-hex">{stop.color.toUpperCase()}</span>
      <label className="gradient-position"><span className="sr-only">Position of color stop {index + 1} in percent</span><input type="number" min="0" max="100" value={stop.position} onChange={(event) => changeStop(stop.id, { position: Math.max(0, Math.min(100, Number(event.target.value) || 0)) })}/> <span>%</span></label>
      <button type="button" className="gradient-remove" aria-label={`Remove color stop ${index + 1}`} title="Remove stop" disabled={stops.length <= 2} onClick={() => setStops((current) => current.filter((item) => item.id !== stop.id))}><Icon name="close" size={15}/></button>
    </div>)}</div>
    <div className="gradient-presets"><span>TRY A MOOD</span>{PRESETS.map((preset) => <button key={preset.name} type="button" onClick={() => { setStops(fromColors(preset.stops)); setMode('linear'); setAngle(135) }}>{preset.name}</button>)}</div>
    <div className="gradient-code"><code>{`background: ${css};`}</code></div>
    <div className="gradient-actions"><button className="button button-outline" type="button" onClick={() => setStops(fromColors(palette, true))}><Icon name="refresh" size={16}/> Use my palette</button><button className="button button-dark" type="button" onClick={() => onCopy(`background: ${css};`)}><Icon name="copy" size={16}/> Copy gradient CSS</button></div>
  </section>
}
