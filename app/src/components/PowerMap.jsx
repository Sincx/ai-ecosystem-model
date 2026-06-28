import { useState } from 'react'
import {
  ComposableMap, Geographies, Geography,
  Marker, ZoomableGroup,
} from 'react-simple-maps'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DC_CLUSTERS, GLOBAL_SUMMARY, POWER_GROWTH } from '../data/powerMapData.js'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const REGIONS = ['All', 'North America', 'Europe', 'Middle East', 'Asia-Pacific', 'China']
const YEAR_OPTIONS = ['2024', '2026E', '2028E']

function mwForYear(cluster, year) {
  if (year === '2024')  return cluster.mw2024
  if (year === '2026E') return cluster.mw2026e
  return cluster.mw2028e
}

function bubbleRadius(mw) {
  return Math.sqrt(mw / 50)
}

function growthColor(pct) {
  if (pct > 150) return '#ef4444'
  if (pct > 80)  return '#f97316'
  if (pct > 40)  return '#eab308'
  return '#22c55e'
}

const CUSTOM_TOOLTIP_STYLE = {
  background: '#12121a', border: '1px solid #2a2a3e',
  borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#e2e8f0',
}

export default function PowerMap() {
  const [regionFilter, setRegionFilter] = useState('All')
  const [yearView,     setYearView]     = useState('2026E')
  const [hovered,      setHovered]      = useState(null)
  const [tooltipPos,   setTooltipPos]   = useState({ x: 0, y: 0 })

  const filtered = DC_CLUSTERS.filter(c =>
    regionFilter === 'All' || c.region === regionFilter
  )

  const totalMW = filtered.reduce((s, c) => s + mwForYear(c, yearView), 0)

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontSize: '0.8rem', alignSelf: 'center' }}>Region:</span>
          {REGIONS.map(r => (
            <button key={r}
              onClick={() => setRegionFilter(r)}
              style={{
                background: regionFilter === r ? '#6366f120' : '#12121a',
                border: `1px solid ${regionFilter === r ? '#6366f1' : '#2a2a3e'}`,
                color: regionFilter === r ? '#e2e8f0' : '#94a3b8',
                borderRadius: 20, padding: '0.25rem 0.7rem',
                cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s',
              }}>{r}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Year:</span>
          {YEAR_OPTIONS.map(y => (
            <button key={y}
              onClick={() => setYearView(y)}
              style={{
                background: yearView === y ? '#f59e0b20' : '#12121a',
                border: `1px solid ${yearView === y ? '#f59e0b' : '#2a2a3e'}`,
                color: yearView === y ? '#f59e0b' : '#94a3b8',
                borderRadius: 20, padding: '0.25rem 0.7rem',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: yearView === y ? 700 : 400,
                transition: 'all 0.15s',
              }}>{y}</button>
          ))}
        </div>
      </div>

      {/* Global stats bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[
          { label: 'Total AI DC Power (filtered)', value: `${(totalMW/1000).toFixed(1)} GW`, color: '#f59e0b' },
          { label: 'Global AI DC Power 2026E',     value: `${(GLOBAL_SUMMARY.totalMW2026e/1000).toFixed(1)} GW`, color: '#10b981' },
          { label: '2024→2026E Growth',            value: `+${GLOBAL_SUMMARY.growthPct2024_2026}%`, color: '#ef4444' },
          { label: 'AI Infra Capex 2026E',         value: `$${GLOBAL_SUMMARY.capexBn2026}B/yr`, color: '#6366f1' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, padding: '0.65rem 1rem', flex: '1 1 180px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [20, 25] }}
          style={{ width: '100%', height: 440 }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default:  { fill: '#1a1a2e', stroke: '#2a2a3e', strokeWidth: 0.4, outline: 'none' },
                      hover:    { fill: '#1e1e38', stroke: '#3a3a5e', strokeWidth: 0.4, outline: 'none' },
                      pressed:  { fill: '#1a1a2e', outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {filtered.map(cluster => {
              const mw   = mwForYear(cluster, yearView)
              const r    = bubbleRadius(mw)
              const col  = growthColor(cluster.growthPct)
              return (
                <Marker key={cluster.id} coordinates={[cluster.lng, cluster.lat]}>
                  <circle
                    r={r}
                    fill={col + '55'}
                    stroke={col}
                    strokeWidth={1.5}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => {
                      setHovered(cluster)
                      setTooltipPos({ x: e.clientX, y: e.clientY })
                    }}
                    onMouseLeave={() => setHovered(null)}
                  />
                  <text
                    textAnchor="middle"
                    y={r + 12}
                    style={{ fontSize: 8, fill: '#94a3b8', pointerEvents: 'none', fontFamily: 'sans-serif' }}
                  >
                    {cluster.shortName}
                  </text>
                </Marker>
              )
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Hover tooltip */}
        {hovered && (
          <div style={{
            position: 'fixed', left: tooltipPos.x + 14, top: tooltipPos.y - 10,
            background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 10,
            padding: '0.85rem 1rem', maxWidth: 280, zIndex: 1000,
            boxShadow: '0 4px 24px #0008', pointerEvents: 'none',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6, color: growthColor(hovered.growthPct) }}>{hovered.name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 1rem', fontSize: '0.78rem' }}>
              <span style={{ color: '#64748b' }}>2024 capacity</span>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{(hovered.mw2024/1000).toFixed(1)} GW</span>
              <span style={{ color: '#64748b' }}>2026E capacity</span>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>{(hovered.mw2026e/1000).toFixed(1)} GW</span>
              <span style={{ color: '#64748b' }}>2028E capacity</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{(hovered.mw2028e/1000).toFixed(1)} GW</span>
              <span style={{ color: '#64748b' }}>2024→2028E growth</span>
              <span style={{ color: growthColor(hovered.growthPct), fontWeight: 700 }}>+{hovered.growthPct}%</span>
            </div>
            <div style={{ marginTop: 8, fontSize: '0.73rem', color: '#94a3b8', borderTop: '1px solid #2a2a3e', paddingTop: 7 }}>
              <strong style={{ color: '#64748b' }}>Players: </strong>{hovered.players.join(', ')}
            </div>
            <div style={{ marginTop: 5, fontSize: '0.73rem', color: '#64748b', lineHeight: 1.4 }}>{hovered.notes}</div>
          </div>
        )}

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: '#12121a99', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.7rem' }}>
          <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>2024→2028E Growth</div>
          {[['> 150%', '#ef4444'], ['80–150%', '#f97316'], ['40–80%', '#eab308'], ['< 40%', '#22c55e']].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', marginBottom: 2 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color + '55', border: `1.5px solid ${color}` }} />
              {label}
            </div>
          ))}
          <div style={{ color: '#64748b', marginTop: 4, fontSize: '0.65rem' }}>Bubble size = MW capacity</div>
        </div>
      </div>

      {/* Power demand growth chart */}
      <div style={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>
          Global AI Data Centre Power Demand (TWh)
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
          All AI infrastructure globally · includes training + inference + cooling overhead
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={POWER_GROWTH} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v}`} />
            <Tooltip
              contentStyle={CUSTOM_TOOLTIP_STYLE}
              formatter={(v) => [`${v} TWh`, 'Power demand']}
            />
            <Area type="monotone" dataKey="twh" stroke="#f59e0b" strokeWidth={2}
              fill="url(#powerGrad)" dot={{ fill: '#f59e0b', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key drivers */}
      <div style={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 12, padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.75rem' }}>Key Demand Drivers</div>
        {GLOBAL_SUMMARY.keyDrivers.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
            <span style={{ color: '#f59e0b', flexShrink: 0 }}>→</span>
            <span style={{ color: '#94a3b8', lineHeight: 1.4 }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
