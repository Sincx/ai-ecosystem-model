import { useState, useRef, useEffect, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { NODES, EDGES, LAYER_META } from '../data/ecosystemFlowData.js'

// ── Layout constants ──────────────────────────────────────────────────────────
const MAX_LAYER = 5   // L0..L5
const COL_W   = 220   // horizontal stride between layer columns
const NODE_W  = 180
const NODE_H  = 64
const ROW_H   = 90
const PAD_TOP = 52    // space for layer header labels
const PAD_L   = 24

// L5 on the left, L0 on the right — flip column order
function nodeX(layer) { return PAD_L + (MAX_LAYER - layer) * COL_W }
function nodeY(row)   { return PAD_TOP + row * ROW_H }
function nodeCx(layer) { return nodeX(layer) + NODE_W / 2 }
function nodeCy(row)   { return nodeY(row) + NODE_H / 2 }

// Wider range so thin/thick difference is clearly visible
function edgeWidth(valueB) {
  return Math.max(1.5, Math.log(valueB + 1) * 4.2)
}

// Cubic bezier: supply flows RIGHT → LEFT (source/supplier on right, customer on left)
// Exits the LEFT edge of source, enters the RIGHT edge of target
function bezier(sx, sy, tx, ty) {
  const mx = (sx - tx) * 0.45
  return `M ${sx},${sy} C ${sx - mx},${sy} ${tx + mx},${ty} ${tx},${ty}`
}

// ── Layer colour lookup ───────────────────────────────────────────────────────
const LAYER_COLOR = Object.fromEntries(LAYER_META.map(l => [l.col, l.color]))

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    realized:  { bg: '#10b98122', border: '#10b981', text: '#10b981' },
    committed: { bg: '#f59e0b22', border: '#f59e0b', text: '#f59e0b' },
  }
  const c = colors[status] || colors.committed
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 4, padding: '1px 5px', flexShrink: 0,
    }}>{status}</span>
  )
}

// ── Company detail panel ──────────────────────────────────────────────────────
function CompanyDetail({ node, onClose }) {
  const color = LAYER_COLOR[node.layer]
  const sparkData = node.spark || []
  // Last 30 days = indices 150-179, last 6m = 0-179
  const spark6m = sparkData.map((p, i) => ({ ...p, i }))
  const priceLabel = node.priceLabel || `$${node.price.toLocaleString()}`
  const isUp30  = node.change30d >= 0
  const isUp6m  = node.change6m  >= 0

  return (
    <div style={{
      width: 400, flexShrink: 0, overflowY: 'auto',
      background: '#0e0e18', border: `1px solid ${color}44`,
      borderRadius: 14, padding: '1.1rem 1.2rem',
      display: 'flex', flexDirection: 'column', gap: '0.9rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0' }}>{node.name}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{node.ticker}</div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: '1px solid #2a2a3e', color: '#64748b',
          borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>✕</button>
      </div>

      {/* Price + change chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e2e8f0' }}>{priceLabel}</span>
        {node.type === 'private' && (
          <span style={{ fontSize: '0.65rem', color: '#64748b', background: '#1e1e2e', border: '1px solid #2a2a3e', borderRadius: 4, padding: '1px 5px' }}>PRIVATE</span>
        )}
        {node.change30d !== 0 && (
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, borderRadius: 5, padding: '2px 7px',
            background: isUp30 ? '#10b98122' : '#ef444422',
            color: isUp30 ? '#10b981' : '#ef4444',
          }}>{isUp30 ? '▲' : '▼'} {Math.abs(node.change30d).toFixed(1)}% (30d)</span>
        )}
        {node.change6m !== 0 && (
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, borderRadius: 5, padding: '2px 7px',
            background: isUp6m ? '#10b98115' : '#ef444415',
            color: isUp6m ? '#059669' : '#dc2626',
          }}>{isUp6m ? '▲' : '▼'} {Math.abs(node.change6m).toFixed(1)}% (6m)</span>
        )}
      </div>

      {/* Sparkline */}
      {spark6m.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 4 }}>
            {node.type === 'private' ? 'Valuation trajectory' : 'Price — last 6 months'}
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={spark6m} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis dataKey="d" hide />
              <YAxis tick={{ fontSize: 9, fill: '#475569' }} tickFormatter={v =>
                node.priceLabel?.includes('₩') ? `₩${(v/1000).toFixed(0)}k` :
                node.type === 'private' ? `$${v}B` : `$${v}`
              } />
              <Tooltip
                contentStyle={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: '0.72rem' }}
                formatter={(v) => [
                  node.priceLabel?.includes('₩') ? `₩${v.toLocaleString()}` :
                  node.type === 'private' ? `$${v}B` : `$${v}`,
                  'Price'
                ]}
                labelFormatter={() => ''}
              />
              <ReferenceLine x={150} stroke="#6366f144" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '0.62rem', color: '#334155', textAlign: 'right' }}>
            ← 6 months · 30 days →
          </div>
        </div>
      )}

      {/* Revenue chart */}
      {node.revenue?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 4 }}>
            Revenue / ARR ($B){node.revenueNote ? ` — ${node.revenueNote}` : ''}
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={node.revenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis dataKey="y" tick={{ fontSize: 9, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 9, fill: '#475569' }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: '0.72rem' }}
                formatter={v => [`$${v}B`, 'Revenue']}
              />
              <Bar dataKey="v" fill={color + '99'} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Inputs */}
      {node.inputs?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.45rem' }}>
            ← Inputs / Dependencies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {node.inputs.map((inp, i) => (
              <div key={i} style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8, padding: '0.55rem 0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', lineHeight: 1.3 }}>{inp.company}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>${inp.valueB}B</span>
                    <StatusBadge status={inp.status} />
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 3, lineHeight: 1.4 }}>{inp.what}</div>
                {inp.date && <div style={{ fontSize: '0.65rem', color: '#334155', marginTop: 3 }}>📅 {inp.date}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outputs */}
      {node.outputs?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.45rem' }}>
            Outputs / Revenue Streams →
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {node.outputs.map((out, i) => (
              <div key={i} style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8, padding: '0.55rem 0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', lineHeight: 1.3 }}>{out.company}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
                      {out.valueB > 0 ? `$${out.valueB}B` : 'Open source'}
                    </span>
                    <StatusBadge status={out.status} />
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 3, lineHeight: 1.4 }}>{out.what}</div>
                {out.date && <div style={{ fontSize: '0.65rem', color: '#334155', marginTop: 3 }}>📅 {out.date}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EcosystemFlow() {
  const [selected,  setSelected]  = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [pan,       setPan]       = useState({ x: 20, y: 20 })
  const [zoom,      setZoom]      = useState(0.47)
  const svgRef      = useRef(null)
  const containerRef = useRef(null)
  const dragging    = useRef(null)

  // Build node lookup
  const nodeById = Object.fromEntries(NODES.map(n => [n.id, n]))

  // Canvas size
  const maxCol = Math.max(...NODES.map(n => n.layer))
  const maxRow = Math.max(...NODES.map(n => n.row))
  const canvasW = nodeX(maxCol) + NODE_W + PAD_L
  const canvasH = nodeY(maxRow) + NODE_H + 20

  // Pan
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('.flow-node')) return
    dragging.current = { startX: e.clientX - pan.x, startY: e.clientY - pan.y }
  }, [pan])
  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    setPan({ x: e.clientX - dragging.current.startX, y: e.clientY - dragging.current.startY })
  }, [])
  const onMouseUp = useCallback(() => { dragging.current = null }, [])

  // Auto-fit zoom to container width on mount (deferred so DOM has painted)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!containerRef.current) return
      const w = containerRef.current.clientWidth - 20
      const fitZoom = (w - 50) / canvasW
      setZoom(Math.min(0.85, Math.max(0.35, fitZoom)))
    }, 50)
    return () => clearTimeout(timer)
  }, [canvasW])

  // Zoom
  const onWheel = useCallback((e) => {
    e.preventDefault()
    setZoom(z => Math.min(2, Math.max(0.35, z - e.deltaY * 0.001)))
  }, [])
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  const selectedNode = selected ? nodeById[selected] : null

  // Hovered edges
  const hoveredEdges = new Set()
  if (hoveredId) {
    EDGES.forEach(e => {
      if (e.source === hoveredId || e.target === hoveredId) {
        hoveredEdges.add(`${e.source}-${e.target}`)
      }
    })
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
      {/* ── SVG canvas ─────────────────────────────────── */}
      <div style={{
        flex: 1, position: 'relative', minWidth: 0,
        background: '#0a0a0f', border: '1px solid #2a2a3e',
        borderRadius: 12, overflow: 'hidden', height: 680,
        cursor: dragging.current ? 'grabbing' : 'grab',
      }}>
        <svg
          ref={svgRef}
          width="100%" height="100%"
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{ userSelect: 'none' }}
        >
          <defs>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

            {/* Layer header labels */}
            {LAYER_META.map(lm => (
              <g key={lm.id}>
                <rect
                  x={nodeX(lm.col) - 4} y={0}
                  width={NODE_W + 8} height={PAD_TOP - 8}
                  rx={6} fill={lm.color + '14'} stroke={lm.color + '33'} strokeWidth={1}
                />
                <text
                  x={nodeX(lm.col) + NODE_W / 2} y={PAD_TOP - 16}
                  textAnchor="middle"
                  style={{ fontSize: 10, fill: lm.color, fontFamily: 'sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', pointerEvents: 'none' }}
                >
                  {lm.id}
                </text>
                <text
                  x={nodeX(lm.col) + NODE_W / 2} y={PAD_TOP - 4}
                  textAnchor="middle"
                  style={{ fontSize: 8, fill: lm.color + 'aa', fontFamily: 'sans-serif', pointerEvents: 'none' }}
                >
                  {lm.label}
                </text>
              </g>
            ))}

            {/* Edges */}
            {EDGES.map((e, i) => {
              const src = nodeById[e.source]
              const tgt = nodeById[e.target]
              if (!src || !tgt) return null
              // Source (supplier) is now on the RIGHT — exit its left edge
              // Target (customer) is now on the LEFT — enter its right edge
              const sx = nodeX(src.layer)
              const sy = nodeCy(src.row)
              const tx = nodeX(tgt.layer) + NODE_W
              const ty = nodeCy(tgt.row)
              const key = `${e.source}-${e.target}`
              const isHot = hoveredEdges.has(key) || selected === e.source || selected === e.target
              const w = edgeWidth(e.valueB)
              return (
                <g key={i}>
                  <path
                    d={bezier(sx, sy, tx, ty)}
                    fill="none"
                    stroke={isHot ? '#6366f1' : '#2a2a3e'}
                    strokeWidth={isHot ? w + 1.5 : w}
                    opacity={isHot ? 0.9 : 0.55}
                    style={{ transition: 'stroke 0.15s, opacity 0.15s' }}
                  />
                  {isHot && (
                    <text
                      x={(sx + tx) / 2}
                      y={(sy + ty) / 2 - 7}
                      textAnchor="middle"
                      style={{ fontSize: 9, fill: '#94a3b8', fontFamily: 'sans-serif', pointerEvents: 'none' }}
                    >
                      ${e.valueB}B — {e.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Nodes */}
            {NODES.map(n => {
              const color = LAYER_COLOR[n.layer]
              const nx = nodeX(n.layer)
              const ny = nodeY(n.row)
              const isHov  = hoveredId === n.id
              const isSel  = selected  === n.id
              return (
                <g
                  key={n.id}
                  className="flow-node"
                  onMouseEnter={() => setHoveredId(n.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelected(selected === n.id ? null : n.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {(isHov || isSel) && (
                    <rect x={nx - 4} y={ny - 4} width={NODE_W + 8} height={NODE_H + 8}
                      rx={13} fill={color + '18'} filter="url(#glow2)" />
                  )}
                  <rect
                    x={nx} y={ny} width={NODE_W} height={NODE_H} rx={9}
                    fill={isSel ? color + '28' : '#12121a'}
                    stroke={isSel ? color : isHov ? color + 'aa' : '#2a2a3e'}
                    strokeWidth={isSel ? 2 : 1.5}
                    style={{ transition: 'stroke 0.12s, fill 0.12s' }}
                  />
                  {/* Layer colour bar */}
                  <rect x={nx} y={ny} width={4} height={NODE_H} rx={2} fill={color} />
                  {/* Ticker */}
                  <text x={nx + 14} y={ny + 17}
                    style={{ fontSize: 9, fill: color, fontFamily: 'sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', pointerEvents: 'none' }}>
                    {n.ticker.length > 12 ? n.ticker.slice(0, 12) : n.ticker}
                  </text>
                  {/* Name */}
                  <text x={nx + 14} y={ny + 32}
                    style={{ fontSize: 11.5, fill: '#e2e8f0', fontFamily: 'sans-serif', fontWeight: 700, pointerEvents: 'none' }}>
                    {n.name.length > 20 ? n.name.slice(0, 20) + '…' : n.name}
                  </text>
                  {/* Market cap */}
                  <text x={nx + 14} y={ny + 47}
                    style={{ fontSize: 9, fill: '#475569', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
                    {n.type === 'private' ? `Val: $${n.marketCapB}B` : `MCap: $${n.marketCapB}B`}
                  </text>
                  {/* Price */}
                  <text x={nx + 14} y={ny + 59}
                    style={{ fontSize: 9, fill: '#334155', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
                    {n.priceLabel || `$${n.price}`}
                    {n.change30d !== 0 && (
                      ` · ${n.change30d >= 0 ? '+' : ''}${n.change30d}% 30d`
                    )}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* Controls */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 5 }}>
          {[['+', () => setZoom(z => Math.min(2, z + 0.15))],
            ['−', () => setZoom(z => Math.max(0.35, z - 0.15))],
            ['⌂', () => { setPan({ x: 20, y: 20 }); const w = containerRef.current?.clientWidth || 800; setZoom(Math.min(0.85, Math.max(0.35, (w - 50) / canvasW))) }],
          ].map(([label, fn]) => (
            <button key={label} onClick={fn} style={{
              width: 28, height: 28, background: '#12121a', border: '1px solid #2a2a3e',
              color: '#94a3b8', borderRadius: 6, cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{label}</button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: '0.65rem', color: '#334155' }}>
          Click node to inspect · Hover for flow values · Drag to pan · Scroll to zoom
        </div>

        {/* Edge value legend */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: '#12121a99', borderRadius: 8, padding: '0.45rem 0.65rem', fontSize: '0.67rem' }}>
          <div style={{ color: '#475569', marginBottom: 3, fontWeight: 600 }}>Edge width = $B flow</div>
          {[[0.5,'thin'], [5,'medium'], [15,'thick'], [28,'heaviest']].map(([v, lbl]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', marginBottom: 2 }}>
              <div style={{ width: 28, height: edgeWidth(v), background: '#2a2a3e', borderRadius: 1 }} />
              <span>${v}B</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail panel ───────────────────────────────── */}
      {selectedNode && (
        <CompanyDetail node={selectedNode} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
