import { useEffect, useMemo, useRef, useState } from 'react'
import type { Palette, PaletteCategory, Harmony } from './lib/color'
import {
  HARMONIES, contrastRatio, generatePalette, getSharedColors, hslToHex,
  normalizeHex, paletteToCss, paletteToJson, readableText, relativeLuminance,
} from './lib/color'
import { CATEGORIES, PALETTES } from './data/palettes'
import Icon from './components/Icon'
import PaletteCard from './components/PaletteCard'
import LivePreview from './components/LivePreview'
import type { PreviewKind } from './components/LivePreview'
import './App.css'

type Screen = 'explore' | 'create' | 'preview'
type SortOrder = 'featured' | 'az' | 'light' | 'dark'
type Theme = 'light' | 'dark'
const DEFAULT_PALETTE = PALETTES[3]
const FEATURED_PALETTE = PALETTES[0]

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem('color-studio:favorites') ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem('color-studio:theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* Storage may be unavailable in private contexts. */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function writeClipboard(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value).then(() => true, () => fallbackCopy(value))
  }
  return Promise.resolve(fallbackCopy(value))
}

function fallbackCopy(value: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  let copied = false
  try { copied = document.execCommand('copy') } catch { copied = false }
  textarea.remove()
  return copied
}

function HeaderLogo() {
  return <span className="brand-logo" aria-hidden="true"><span/><span/><span/><span/></span>
}

function App() {
  const [screen, setScreen] = useState<Screen>('explore')
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'All' | PaletteCategory>('All')
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(readFavorites)
  const [detail, setDetail] = useState<Palette | null>(null)
  const [harmony, setHarmony] = useState<Harmony>('analogous')
  const [colors, setColors] = useState<string[]>(() => getSharedColors(window.location.search) ?? [...DEFAULT_PALETTE.colors])
  const [locks, setLocks] = useState<boolean[]>([false, false, false, false, false])
  const [previewColors, setPreviewColors] = useState<string[]>(() => getSharedColors(window.location.search) ?? [...FEATURED_PALETTE.colors])
  const [previewKind, setPreviewKind] = useState<PreviewKind>('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const modalCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { window.localStorage.setItem('color-studio:theme', theme) } catch { /* optional persistence */ }
  }, [theme])

  useEffect(() => {
    try { window.localStorage.setItem('color-studio:favorites', JSON.stringify(favorites)) } catch { /* optional persistence */ }
  }, [favorites])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2700)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    function onKeyboard(event: KeyboardEvent) {
      const element = event.target as HTMLElement | null
      const isTyping = element?.matches('input, textarea, select, [contenteditable="true"]') ?? false
      if (event.key === '/' && !isTyping && !detail) {
        event.preventDefault()
        setScreen('explore')
        window.requestAnimationFrame(() => searchRef.current?.focus())
      }
    }
    document.addEventListener('keydown', onKeyboard)
    return () => document.removeEventListener('keydown', onKeyboard)
  }, [detail])

  useEffect(() => {
    if (!detail) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.classList.add('modal-is-open')
    modalCloseRef.current?.focus()
    function onModalKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setDetail(null)
      if (event.key !== 'Tab') return
      const modal = document.querySelector<HTMLElement>('.detail-dialog')
      const tabbable = Array.from(modal?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])') ?? [])
      if (tabbable.length === 0) return
      const first = tabbable[0], last = tabbable[tabbable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onModalKey)
    return () => {
      document.body.classList.remove('modal-is-open')
      document.removeEventListener('keydown', onModalKey)
      previous?.focus()
    }
  }, [detail])

  const visiblePalettes = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = PALETTES.filter((palette) => {
      if (category !== 'All' && palette.category !== category) return false
      if (favoritesOnly && !favorites.includes(palette.id)) return false
      return !term || [palette.name, palette.category, ...palette.tags, ...palette.colors].join(' ').toLowerCase().includes(term)
    })
    if (sortOrder === 'az') return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    if (sortOrder === 'light' || sortOrder === 'dark') {
      const average = (palette: Palette) => palette.colors.reduce((sum, color) => sum + relativeLuminance(color), 0) / palette.colors.length
      return [...filtered].sort((a, b) => (average(b) - average(a)) * (sortOrder === 'light' ? 1 : -1))
    }
    return filtered
  }, [category, favorites, favoritesOnly, query, sortOrder])

  async function copy(value: string, success = 'Copied to clipboard') {
    setToast(await writeClipboard(value) ? success : 'Clipboard unavailable — try a secure browser context')
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function openCreate(palette?: Palette) {
    if (palette) {
      setColors([...palette.colors])
      setLocks([false, false, false, false, false])
    }
    setDetail(null)
    setScreen('create')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openPreview(palette?: Palette, values?: readonly string[]) {
    setPreviewColors([...(values ?? palette?.colors ?? colors)])
    setDetail(null)
    setScreen('preview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigate(next: Screen) {
    setDetail(null)
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function shuffleColors() {
    const seed = hslToHex(Math.random() * 360, 62 + Math.random() * 25, 47 + Math.random() * 15)
    setColors((current) => generatePalette(seed, harmony, current.map((color, index) => locks[index] ? color : null)))
    if (locks.every(Boolean)) setToast('Unlock at least one swatch to generate new colors')
  }

  function editColor(index: number, color: string) {
    const normalized = normalizeHex(color)
    if (!normalized) return
    setColors((current) => current.map((item, i) => i === index ? normalized : item))
  }

  function shareColors(values: readonly string[]) {
    const url = new URL(window.location.href)
    url.searchParams.set('palette', values.map((value) => value.slice(1)).join('-'))
    void copy(url.toString(), 'Share link copied')
  }

  function downloadJson(name: string, values: readonly string[]) {
    const blob = new Blob([paletteToJson(name, values)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'palette'}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setToast('JSON palette downloaded')
  }

  const currentPaletteName = 'My Color Studio palette'
  const isDark = theme === 'dark'

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="page-container header-inner">
          <button className="brand-link" onClick={() => navigate('explore')} type="button" aria-label="COLOR Studio home"><HeaderLogo/><span>COLOR<span className="brand-light">Studio</span><span className="brand-dot">.</span></span></button>
          <nav className="main-navigation" aria-label="Main navigation">
            <button type="button" className={screen === 'explore' ? 'is-current' : ''} aria-current={screen === 'explore' ? 'page' : undefined} onClick={() => navigate('explore')}>Explore</button>
            <button type="button" className={screen === 'create' ? 'is-current' : ''} aria-current={screen === 'create' ? 'page' : undefined} onClick={() => navigate('create')}>Create</button>
            <button type="button" className={screen === 'preview' ? 'is-current' : ''} aria-current={screen === 'preview' ? 'page' : undefined} onClick={() => navigate('preview')}>Preview</button>
          </nav>
          <div className="header-actions">
            <button className="theme-toggle" type="button" title={`Switch to ${isDark ? 'light' : 'dark'} mode`} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`} onClick={() => setTheme(isDark ? 'light' : 'dark')}><Icon name={isDark ? 'sun' : 'moon'} size={18}/></button>
            <button className="header-create" type="button" onClick={() => openCreate()}><Icon name="sparkles" size={16}/> <span>Open Studio</span></button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {screen === 'explore' && <>
          <section className="hero page-container">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-star">✳</span> THE CREATIVE COLOR TOOLKIT <span className="eyebrow-line"/></div>
              <h1>Good design<br/>starts with <span className="hero-title-accent">great color<span className="hero-period">.</span></span></h1>
              <p>Discover beautifully curated palettes, find your perfect combination, and bring every creative idea to life.</p>
              <div className="hero-actions"><button className="button button-dark" onClick={() => document.getElementById('palette-library')?.scrollIntoView({ behavior: 'smooth' })} type="button">Explore palettes <Icon name="arrow-right" size={17}/></button><button className="button button-outline" onClick={() => openCreate()} type="button">Create a palette <Icon name="arrow-up-right" size={18}/></button></div>
              <div className="hero-features"><span><Icon name="check-circle" size={16}/> Curated with care</span><span><Icon name="check-circle" size={16}/> Made for creatives</span></div>
            </div>
            <div className="hero-visual" aria-label="Featured color palette Afterglow">
              <div className="hero-orbit hero-orbit-left"/><div className="hero-orbit hero-orbit-right"/>
              <div className="hero-featured-card">
                <div className="featured-topline"><span className="tiny-star">✳</span><span>PALETTE SPOTLIGHT</span><span className="featured-index">001 / {String(PALETTES.length).padStart(3, '0')}</span></div>
                <div className="featured-swatches">{FEATURED_PALETTE.colors.map((color, i) => <button key={color} style={{ backgroundColor: color, height: `${170 + [18, 42, 3, 30, 0][i]}px` }} type="button" title={`Copy ${color}`} aria-label={`Copy ${color}`} onClick={() => void copy(color, `${color} copied`)}><span>{color}</span></button>)}</div>
                <div className="featured-details"><div><span className="featured-eyebrow">SOFT · DREAMY · WARM</span><strong>{FEATURED_PALETTE.name}</strong></div><button className="featured-arrow" aria-label="Inspect featured palette" type="button" onClick={() => setDetail(FEATURED_PALETTE)}><Icon name="arrow-up-right" size={22}/></button></div>
              </div>
              <div className="floating-label"><span className="floating-label-icon">✦</span><span>Find your<br/><strong>perfect shade</strong></span></div>
            </div>
          </section>
          <section className="stats-strip"><div className="page-container stats-inner"><div><strong>{PALETTES.length}<span>+</span></strong><span>Curated color palettes</span></div><div className="stat-divider"/><div><strong>05</strong><span>Color harmony modes</span></div><div className="stat-divider"/><div><strong>∞</strong><span>Creative possibilities</span></div><div className="stats-micro">MADE TO INSPIRE <span aria-hidden="true">✳</span></div></div></section>
          <section className="library-section page-container" id="palette-library">
            <div className="section-heading"><div><div className="section-kicker"><span className="kicker-bar"/> CURATED COLOR LIBRARY</div><h2>Find your next <em>color story.</em></h2><p>Explore handpicked combinations for your next big idea.</p></div><span className="library-count">{PALETTES.length} palettes in the collection</span></div>
            <div className="library-toolbar"><label className="search-field"><Icon name="search" size={20}/><span className="sr-only">Search palettes</span><input ref={searchRef} type="search" placeholder="Search colors, styles, or moods..." value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off"/><kbd>/</kbd></label><label className="sort-field"><Icon name="sliders" size={17}/><span className="sr-only">Sort palettes</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="featured">Featured first</option><option value="az">Name: A to Z</option><option value="light">Lightest first</option><option value="dark">Darkest first</option></select><Icon name="chevron-down" size={14}/></label></div>
            <div className="filter-row"><div className="category-scroll" role="group" aria-label="Filter palettes by category">{CATEGORIES.map((value) => <button key={value} type="button" className={`filter-chip ${category === value ? 'selected' : ''}`} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div><button type="button" className={`favorites-filter ${favoritesOnly ? 'selected' : ''}`} aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((current) => !current)}><Icon name="heart" size={16} fill={favoritesOnly ? 'currentColor' : 'none'}/> Saved <span className="favorite-count">{favorites.length}</span></button></div>
            <div className="results-note"><span>Showing <strong>{visiblePalettes.length}</strong> palettes</span><span>Click a color to copy its HEX code <Icon name="mouse" size={14}/></span></div>
            {visiblePalettes.length > 0 ? <div className="palette-grid">{visiblePalettes.map((palette) => <PaletteCard key={palette.id} palette={palette} isFavorite={favorites.includes(palette.id)} onFavorite={toggleFavorite} onInspect={setDetail} onCopy={(value) => void copy(value, `${value} copied`)} onPreview={openPreview}/>)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="search" size={26}/></span><h3>No palettes found</h3><p>Try a different word or clear your filters to start fresh.</p><button className="button button-dark" type="button" onClick={() => { setQuery(''); setCategory('All'); setFavoritesOnly(false) }}>Clear filters <Icon name="refresh" size={16}/></button></div>}
          </section>
          <section className="cta-section page-container"><div className="cta-card"><div className="cta-flower" aria-hidden="true">✳</div><div><span className="section-kicker">YOUR IDEAS. YOUR COLORS.</span><h2>Can't find the one?<br/><em>Make your own.</em></h2><p>Mix, lock, tweak, and discover a palette that's uniquely yours.</p><button className="button button-light" type="button" onClick={() => openCreate()}>Launch Color Studio <Icon name="arrow-up-right" size={18}/></button></div><div className="cta-bubbles" aria-hidden="true"><i/><i/><i/><i/><i/></div></div></section>
        </>}

        {screen === 'create' && <section className="page-container studio-section">
          <div className="workspace-header"><div><div className="section-kicker"><span className="kicker-bar"/> THE COLOR WORKSPACE</div><h1>Make it <em>your palette.</em></h1><p>Explore harmony. Lock the shades you love. Discover the ones you didn't know you needed.</p></div><span className="workspace-aside">DESIGN FREELY <span>✳</span></span></div>
          <div className="generator-toolbar"><div className="generator-toolbar-intro"><Icon name="sparkles" size={20}/><div><strong>Palette Generator</strong><span>Mix a little magic into your next project.</span></div></div><label className="harmony-picker">Color harmony <span className="harmony-select"><select value={harmony} onChange={(event) => setHarmony(event.target.value as Harmony)}>{HARMONIES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><Icon name="chevron-down" size={14}/></span></label></div>
          <div className="generator-grid">{colors.map((color, index) => <div className="generator-swatch" key={index} style={{ backgroundColor: color, color: readableText(color) }}><div className="generator-swatch-top"><span>0{index + 1}</span><button type="button" className="generator-icon" title={locks[index] ? 'Unlock this shade' : 'Lock this shade'} aria-label={locks[index] ? `Unlock ${color}` : `Lock ${color}`} aria-pressed={locks[index]} onClick={() => setLocks((current) => current.map((item, i) => i === index ? !item : item))}><Icon name={locks[index] ? 'lock' : 'unlock'} size={18}/></button></div><div className="generator-swatch-middle"><label className="color-input-label" title={`Change swatch ${index + 1}`}><Icon name="adjust" size={20}/><span className="sr-only">Choose color for swatch {index + 1}</span><input type="color" value={color} onChange={(event) => editColor(index, event.target.value)}/></label></div><div className="generator-swatch-bottom"><button type="button" onClick={() => void copy(color, `${color} copied`)} title={`Copy ${color}`}><strong>{color}</strong><Icon name="copy" size={16}/></button><span>{locks[index] ? 'LOCKED' : 'TAP TO EDIT'}</span></div></div>)}</div>
          <div className="generator-actions"><div className="generator-hint"><Icon name="lock" size={16}/> Locked colors stay put when you generate.</div><div className="generator-action-buttons"><button type="button" className="button button-outline" onClick={() => setLocks([false, false, false, false, false])}><Icon name="unlock" size={16}/> Unlock all</button><button type="button" className="button button-dark" onClick={shuffleColors}><Icon name="shuffle" size={17}/> Generate palette <kbd>↻</kbd></button></div></div>
          <div className="workspace-lower"><section className="workspace-panel"><div className="workspace-panel-heading"><span className="section-kicker">MAKE IT YOURS</span><h2>From palette to project.</h2><p>Every great design system starts with five considered colors.</p></div><div className="workspace-export-list"><button type="button" onClick={() => void copy(paletteToCss(colors), 'CSS variables copied')}><span><Icon name="code" size={18}/> Copy CSS variables</span><Icon name="arrow-up-right" size={17}/></button><button type="button" onClick={() => void copy(paletteToJson(currentPaletteName, colors), 'JSON copied')}><span><Icon name="copy" size={18}/> Copy JSON tokens</span><Icon name="arrow-up-right" size={17}/></button><button type="button" onClick={() => downloadJson(currentPaletteName, colors)}><span><Icon name="download" size={18}/> Download JSON</span><Icon name="arrow-up-right" size={17}/></button><button type="button" onClick={() => shareColors(colors)}><span><Icon name="link" size={18}/> Copy shareable link</span><Icon name="arrow-up-right" size={17}/></button></div></section><section className="workspace-panel preview-panel"><div className="panel-preview-top"><div><span className="section-kicker">LIVE PREVIEW</span><h2>See it come to life.</h2></div><button type="button" className="quiet-link" onClick={() => openPreview(undefined, colors)}>Open full preview <Icon name="arrow-up-right" size={16}/></button></div><div className="mini-preview"><LivePreview colors={colors} kind="dashboard" compact/></div></section></div>
        </section>}

        {screen === 'preview' && <section className="page-container preview-section">
          <div className="workspace-header"><div><div className="section-kicker"><span className="kicker-bar"/> COLORS IN CONTEXT</div><h1>Imagine it <em>in action.</em></h1><p>See how your palette works across real-world interfaces before you bring it to life.</p></div><button type="button" className="button button-outline" onClick={() => openCreate({ id: 'preview', name: 'Preview', category: 'Minimal', colors: previewColors, tags: [] })}><Icon name="sliders" size={17}/> Edit in Studio</button></div>
          <div className="preview-layout"><div className="preview-sidebar"><div className="preview-sidebar-top"><span className="section-kicker">PREVIEW ENVIRONMENT</span><h2>Choose your canvas.</h2></div><div className="preview-kind-list">{([{ id: 'dashboard', name: 'SaaS dashboard', detail: 'Analytics, charts, and cards', icon: 'grid' }, { id: 'commerce', name: 'E-commerce', detail: 'A product-focused storefront', icon: 'layers' }, { id: 'landing', name: 'Landing page', detail: 'A bold marketing experience', icon: 'sparkles' }] as const).map((item) => <button type="button" key={item.id} className={previewKind === item.id ? 'selected' : ''} aria-pressed={previewKind === item.id} onClick={() => setPreviewKind(item.id)}><span className="preview-kind-icon"><Icon name={item.icon} size={18}/></span><span><strong>{item.name}</strong><small>{item.detail}</small></span><Icon name="arrow-up-right" size={16}/></button>)}</div><div className="preview-sidebar-footer"><span className="section-kicker">YOUR PALETTE</span><div className="sidebar-swatches">{previewColors.map((color, index) => <button style={{ backgroundColor: color }} key={`${color}-${index}`} type="button" aria-label={`Copy ${color}`} title={color} onClick={() => void copy(color, `${color} copied`)}/>)}</div><button className="outline-wide" type="button" onClick={() => void copy(paletteToCss(previewColors), 'CSS variables copied')}><Icon name="copy" size={17}/> Copy color variables</button><button className="outline-wide" type="button" onClick={() => shareColors(previewColors)}><Icon name="link" size={17}/> Share this palette</button></div></div><div className="preview-stage"><div className="preview-stage-top"><span><span className="browser-dots"><i/><i/><i/></span> LIVE INTERFACE PREVIEW</span><span>100% COLOR MAPPED <Icon name="check-circle" size={14}/></span></div><div className="preview-stage-inner"><LivePreview colors={previewColors} kind={previewKind}/></div></div></div>
          <div className="preview-tip"><Icon name="contrast" size={20}/><span>Design tip: color aesthetics and readability are different things. Check text/background contrast for accessibility before production.</span></div>
        </section>}
      </main>

      <footer className="site-footer"><div className="page-container footer-inner"><button type="button" onClick={() => navigate('explore')} className="brand-link footer-brand"><HeaderLogo/><span>COLOR<span className="brand-light">Studio</span><span className="brand-dot">.</span></span></button><span>Thoughtful tools for colorful ideas.</span><span className="footer-credit">Designed & engineered by <a href="https://danialz.com" target="_blank" rel="noreferrer">Danial Zameni <Icon name="arrow-up-right" size={14}/></a></span></div></footer>

      {detail && <div className="modal-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null) }}><section className="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="palette-dialog-title"><div className="modal-top"><span className="section-kicker">COLOR COLLECTION / {detail.category.toUpperCase()}</span><button type="button" className="icon-button" ref={modalCloseRef} onClick={() => setDetail(null)} aria-label="Close palette details"><Icon name="close" size={20}/></button></div><div className="modal-heading"><h2 id="palette-dialog-title">{detail.name}<span>.</span></h2><p>{detail.tags.map((tag) => `#${tag}`).join('  ')}</p></div><div className="modal-swatches">{detail.colors.map((color, index) => <button key={`${detail.id}-${index}`} type="button" style={{ backgroundColor: color, color: readableText(color) }} title={`Copy ${color}`} aria-label={`Copy ${color}`} onClick={() => void copy(color, `${color} copied`)}><span>{color}</span><Icon name="copy" size={15}/></button>)}</div><div className="modal-accessibility"><div className="modal-accessibility-head"><Icon name="contrast" size={17}/> <strong>Contrast quick check</strong><span>WCAG 2.2 AA · normal text ≥ 4.5:1</span></div><div className="contrast-results">{detail.colors.map((color) => { const onWhite = contrastRatio(color, '#FFFFFF'); const onDark = contrastRatio(color, '#17191E'); return <div key={color}><span className="contrast-sample" style={{ backgroundColor: color, color: readableText(color) }}>Aa</span><strong>{color}</strong><small>on white {onWhite.toFixed(2)}:1 <span className={onWhite >= 4.5 ? 'contrast-pass' : 'contrast-fail'}>{onWhite >= 4.5 ? 'AA' : 'Fail'}</span></small><small>on dark {onDark.toFixed(2)}:1 <span className={onDark >= 4.5 ? 'contrast-pass' : 'contrast-fail'}>{onDark >= 4.5 ? 'AA' : 'Fail'}</span></small></div> })}</div></div><div className="modal-actions"><button className="button button-outline" type="button" onClick={() => void copy(paletteToCss(detail.colors), 'CSS variables copied')}><Icon name="code" size={17}/> Copy CSS</button><button className="button button-outline" type="button" onClick={() => shareColors(detail.colors)}><Icon name="link" size={17}/> Share</button><button className="button button-outline" type="button" onClick={() => openPreview(detail)}><Icon name="eye" size={17}/> Preview</button><button className="button button-dark" type="button" onClick={() => openCreate(detail)}>Edit palette <Icon name="arrow-up-right" size={17}/></button></div></section></div>}
      {toast && <div className="toast" role="status" aria-live="polite"><Icon name="check-circle" size={18}/>{toast}</div>}
    </div>
  )
}

export default App
