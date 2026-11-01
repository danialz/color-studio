import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon'
import { extractPaletteFromPixels, SAMPLE_EDGE, validateImageFile } from '../lib/imagePalette'

interface Props {
  onApply: (colors: string[]) => void
  onCopy: (color: string) => void
}

export default function ImagePaletteStudio({ onApply, onCopy }: Props) {
  const inputId = useId()
  const [colors, setColors] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageName, setImageName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const urlRef = useRef<string | null>(null)
  const ticketRef = useRef(0)

  useEffect(() => () => {
    ticketRef.current += 1
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  async function loadImage(file?: File) {
    if (!file) return
    const ticket = ++ticketRef.current
    setError('')
    const validation = validateImageFile(file)
    if (validation) { setError(validation); setBusy(false); return }
    setBusy(true)
    let bitmap: ImageBitmap | null = null
    try {
      bitmap = await createImageBitmap(file)
      if (ticket !== ticketRef.current) return
      if (bitmap.width < 1 || bitmap.height < 1) throw new Error('Invalid image dimensions')
      const ratio = Math.min(1, SAMPLE_EDGE / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio))
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) throw new Error('Canvas is unavailable in this browser')
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const extracted = extractPaletteFromPixels(context.getImageData(0, 0, canvas.width, canvas.height).data)
      if (ticket !== ticketRef.current) return
      const nextUrl = URL.createObjectURL(file)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = nextUrl
      setColors(extracted)
      setImageUrl(nextUrl)
      setImageName(file.name)
    } catch {
      if (ticket === ticketRef.current) setError('Could not read that image. Try a different supported photo.')
    } finally {
      bitmap?.close()
      if (ticket === ticketRef.current) setBusy(false)
    }
  }

  return <section className="creative-card image-workspace" aria-labelledby="image-tool-title">
    <div className="creative-card-heading"><span className="section-kicker">01 / IMAGE TO PALETTE</span><h3 id="image-tool-title">Colors from <em>your world.</em></h3><p>Drop in a photo and capture its five signature shades. Everything happens privately in your browser.</p></div>
    <div className="image-workspace-grid">
      <label className={`image-dropzone ${imageUrl ? 'has-image' : ''}`} htmlFor={inputId} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void loadImage(event.dataTransfer.files[0]) }}>
        <input id={inputId} type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" onChange={(event) => { void loadImage(event.target.files?.[0]); event.currentTarget.value = '' }} className="sr-only" aria-describedby={`${inputId}-hint`}/>
        {imageUrl ? <img src={imageUrl} alt="Local image used to generate the color palette"/> : <span className="image-empty-visual" aria-hidden="true"><i/><i/><i/><i/></span>}
        <span className="image-drop-copy"><Icon name="palette" size={19}/><strong>{imageUrl ? 'Replace image' : 'Choose an image'}</strong><small id={`${inputId}-hint`}>{imageName || 'PNG, JPEG, WebP, AVIF or GIF · up to 12 MB'}</small></span>
      </label>
      <div className="image-results">
        <div className="creative-small-title"><span>EXTRACTED PALETTE</span><span>{colors.length ? '5 SWATCHES' : 'READY WHEN YOU ARE'}</span></div>
        {colors.length ? <div className="extracted-swatches">{colors.map((color, i) => <button type="button" key={`${color}-${i}`} onClick={() => onCopy(color)} aria-label={`Copy color ${color}`} title={`Copy ${color}`} style={{ backgroundColor: color }}><span>{color}</span></button>)}</div> : <div className="image-placeholder-swatches" aria-hidden="true">{['#D5C7EB','#EEC7BC','#9EB8A7','#B4A4D7','#EFDEB9'].map((color) => <span key={color} style={{backgroundColor:color}}/>)}</div>}
        <p className="creative-helper" role={error ? 'alert' : undefined}>{error || (busy ? 'Reading colors…' : 'Tap any extracted swatch to copy its HEX value.')}</p>
        <button type="button" className="button button-dark creative-primary" disabled={!colors.length || busy} onClick={() => onApply(colors)}>{busy ? 'Extracting…' : 'Use in palette generator'} <Icon name="arrow-up-right" size={17}/></button>
      </div>
    </div>
    <p className="creative-privacy"><Icon name="lock" size={14}/> Photos are processed locally. No uploads, accounts or external APIs.</p>
  </section>
}
