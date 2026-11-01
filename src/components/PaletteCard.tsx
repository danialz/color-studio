import type { Palette } from '../lib/color'
import Icon from './Icon'

interface Props {
  palette: Palette
  isFavorite: boolean
  onFavorite: (id: string) => void
  onInspect: (palette: Palette) => void
  onCopy: (color: string) => void
  onPreview: (palette: Palette) => void
}

export default function PaletteCard({ palette, isFavorite, onFavorite, onInspect, onCopy, onPreview }: Props) {
  return (
    <article className="palette-card">
      <div className="palette-card-swatches" aria-label={`${palette.name} color swatches`}>
        {palette.colors.map((color, index) => (
          <button
            className="palette-card-swatch"
            type="button"
            key={`${palette.id}-${index}`}
            style={{ backgroundColor: color }}
            title={`Copy ${color}`}
            aria-label={`Copy ${color} from ${palette.name}`}
            onClick={() => onCopy(color)}
          >
            <span className="swatch-hex">{color}</span>
          </button>
        ))}
      </div>
      <div className="palette-card-info">
        <div className="palette-card-title-row">
          <div className="palette-card-title-group">
            <button className="text-button palette-title" type="button" onClick={() => onInspect(palette)}>{palette.name}</button>
            <span className="palette-card-category">{palette.category} · {palette.tags[0]}</span>
          </div>
          <button
            className={`icon-button favorite-button ${isFavorite ? 'is-favorite' : ''}`}
            aria-label={isFavorite ? `Remove ${palette.name} from favorites` : `Save ${palette.name} to favorites`}
            aria-pressed={isFavorite}
            type="button"
            onClick={() => onFavorite(palette.id)}
          ><Icon name="heart" size={18} fill={isFavorite ? 'currentColor' : 'none'} /></button>
        </div>
        <div className="palette-card-bottom">
          <span className="palette-card-count">5 colors</span>
          <button className="quiet-link" type="button" onClick={() => onPreview(palette)}>Preview <Icon name="arrow-up-right" size={14}/></button>
        </div>
      </div>
    </article>
  )
}
