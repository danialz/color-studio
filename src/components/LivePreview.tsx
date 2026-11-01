import { readableText } from '../lib/color'
import Icon from './Icon'

export type PreviewKind = 'dashboard' | 'commerce' | 'landing'

interface Props {
  colors: readonly string[]
  kind: PreviewKind
  compact?: boolean
}

const cardStyle = (color: string) => ({ backgroundColor: color, color: readableText(color) })

export default function LivePreview({ colors, kind, compact = false }: Props) {
  const [deep, primary, middle, soft, pale] = colors
  return (
    <div className={`live-preview ${compact ? 'is-compact' : ''}`} style={{ backgroundColor: pale, color: readableText(pale) }}>
      <header className="mock-header">
        <div className="mock-brand"><span className="mock-brand-dot" style={{ backgroundColor: primary }}/>{kind === 'commerce' ? 'atelier.' : kind === 'landing' ? 'forma.' : 'overview.'}</div>
        <div className="mock-header-links"><span>Overview</span><span>Explore</span><span>About</span></div>
        <span className="mock-avatar" style={{ backgroundColor: middle, color: readableText(middle) }}>C</span>
      </header>
      {kind === 'dashboard' ? (
        <main className="mock-content">
          <div className="mock-eyebrow" style={{ color: deep }}>YOUR WORKSPACE</div>
          <div className="mock-title-row"><h3 style={{ color: deep }}>Good morning, Alex <span aria-hidden="true">✳</span></h3><span className="mock-period">This month <Icon name="chevron-down" size={11}/></span></div>
          <div className="mock-stats">
            <div className="mock-stat" style={cardStyle(deep)}><span>Revenue</span><strong>$48,250</strong><small>↑ 12.6% vs. last month</small></div>
            <div className="mock-stat" style={cardStyle(soft)}><span>Customers</span><strong>2,408</strong><small>↑ 8.2% this month</small></div>
            <div className="mock-stat" style={cardStyle(middle)}><span>Conversion</span><strong>4.82%</strong><small>↑ 2.4% this month</small></div>
          </div>
          <div className="mock-chart" style={{ backgroundColor: '#FFFFFF', color: '#2D2D31' }}>
            <div className="mock-chart-head"><span>Activity over time</span><small>Last 7 days</small></div>
            <div className="mock-chart-bars" aria-hidden="true">
              {[35, 55, 42, 80, 60, 93, 75, 61, 89, 72].map((height, index) => <span key={index} style={{ height: `${height}%`, backgroundColor: index === 5 ? primary : soft }}/>) }
            </div>
            <div className="mock-chart-foot"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
          </div>
        </main>
      ) : kind === 'commerce' ? (
        <main className="mock-content mock-shop">
          <div className="mock-eyebrow" style={{ color: primary }}>CURATED ESSENTIALS</div>
          <h3 style={{ color: deep }}>Good things, made simply.</h3>
          <p style={{ color: deep }}>Everyday objects with a little more intention.</p>
          <div className="mock-products">
            <div className="mock-product"><div className="mock-object mock-object-one" style={{ backgroundColor: soft }}><div className="mock-vase" style={{ backgroundColor: deep }}/></div><strong style={{ color: deep }}>The Everyday Vase</strong><span style={{ color: deep }}>$49.00</span></div>
            <div className="mock-product"><div className="mock-object mock-object-two" style={{ backgroundColor: middle }}><div className="mock-lamp" style={{ backgroundColor: primary }}/></div><strong style={{ color: deep }}>Shape Table Lamp</strong><span style={{ color: deep }}>$89.00</span></div>
          </div>
          <span className="mock-cta" style={cardStyle(primary)}>Explore the collection <Icon name="arrow-right" size={13}/></span>
        </main>
      ) : (
        <main className="mock-content mock-landing">
          <div className="mock-landing-orbit" style={{ backgroundColor: middle }}><div style={{ backgroundColor: deep }}/><i style={{ backgroundColor: soft }}/></div>
          <div className="mock-eyebrow" style={{ color: primary }}>CREATIVE POSSIBILITIES</div>
          <h3 style={{ color: deep }}>Good ideas deserve <em>great color.</em></h3>
          <p style={{ color: deep }}>Create a little magic. Make every detail feel intentional.</p>
          <span className="mock-cta" style={cardStyle(primary)}>Start creating <Icon name="arrow-up-right" size={13}/></span>
          <div className="mock-landing-tags" style={{ color: deep }}><span>Thoughtful design</span><span>Real possibilities</span></div>
        </main>
      )}
    </div>
  )
}
