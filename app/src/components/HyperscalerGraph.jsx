import { useState, useRef, useEffect, useCallback } from 'react'
import { HYPERSCALERS, getGraphData, getNodeStyle } from '../data/hyperscalerGraph.js'

const GRID_COL = 220
const GRID_ROW = 105
const NODE_W   = 190
const NODE_H   = 70

// Lay out nodes on a column/row grid, centred in the SVG
function layoutNodes(rawNodes) {
  let minCol = Infinity, maxCol = -Infinity, minRow = Infinity, maxRow = -Infinity
  rawNodes.forEach(n => {
    minCol = Math.min(minCol, n.col); maxCol = Math.max(maxCol, n.col)
    minRow = Math.min(minRow, n.row); maxRow = Math.max(maxRow, n.row)
  })
  return rawNodes.map(n => ({
    ...n,
    x: (n.col - minCol) * GRID_COL + NODE_W / 2,
    y: (n.row - minRow) * GRID_ROW + NODE_H / 2,
  }))
}

function nodeCenter(node) {
  return { x: node.x, y: node.y }
}

// Draw a curved path between two node centres, entering/leaving from left/right sides
function edgePath(from, to) {
  const fx = from.x + NODE_W / 2 - 5
  const fy = from.y
  const tx = to.x   - NODE_W / 2 + 5
  const ty = to.y
  const cx1 = fx + (tx - fx) * 0.45
  const cy1 = fy
  const cx2 = fx + (tx - fx) * 0.55
  const cy2 = ty
  return `M ${fx},${fy} C ${cx1},${cy1} ${cx2},${cy2} ${tx},${ty}`
}

// Edge label position = midpoint of cubic bezier
function edgeMid(from, to) {
  return {
    x: (from.x + NODE_W / 2 + to.x - NODE_W / 2) / 2,
    y: (from.y + to.y) / 2,
  }
}

export default function HyperscalerGraph() {
  const [selected,  setSelected]  = useState('Microsoft Azure')
  const [hoveredId, setHoveredId] = useState(null)
  const [pan,       setPan]       = useState({ x: 30, y: 30 })
  const [zoom,      setZoom]      = useState(1)
  const svgRef = useRef(null)
  const dragging = useRef(null)

  const graphData = getGraphData(selected)
  const nodes     = layoutNodes(graphData?.nodes || [])
  const edges     = graphData?.edges || []

  // Build node lookup
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))

  // Compute SVG canvas size
  const allX = nodes.map(n => n.x + NODE_W)
  const allY = nodes.map(n => n.y + NODE_H)
  const canvasW = Math.max(...allX, 600) + 60
  const canvasH = Math.max(...allY, 400) + 60

  // Pan with mouse drag
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('.graph-node')) return
    dragging.current = { startX: e.clientX - pan.x, startY: e.clientY - pan.y }
  }, [pan])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    setPan({ x: e.clientX - dragging.current.startX, y: e.clientY - dragging.current.startY })
  }, [])

  const onMouseUp = useCallback(() => { dragging.current = null }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    setZoom(z => Math.min(2, Math.max(0.4, z - e.deltaY * 0.001)))
  }, [])

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // Reset pan/zoom on hyperscaler change
  useEffect(() => { setPan({ x: 30, y: 30 }); setZoom(0.85) }, [selected])

  const hoveredNode = hoveredId ? nodeById[hoveredId] : null

  return (
    <div>
      {/* Selector */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {HYPERSCALERS.map(h => (
          <button key={h} onClick={() => setSelected(h)} style={{
            background: selected === h ? '#6366f120' : '#12121a',
            border: `1px solid ${selected === h ? '#6366f1' : '#2a2a3e'}`,
            color: selected === h ? '#e2e8f0' : '#94a3b8',
            borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: selected === h ? 600 : 400, transition: 'all 0.15s',
          }}>{h}</button>
        ))}
      </div>

      {/* Summary bar */}
      {graphData?.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', marginBottom: '0.85rem' }}>
          {[
            { label: 'Capex 2026',  val: graphData.summary.capex },
            { label: 'AI Revenue',  val: graphData.summary.aiRevenue },
            { label: 'Key Moat',    val: graphData.summary.keyMoat },
            { label: 'Key Risk',    val: graphData.summary.keyRisk },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, padding: '0.65rem 0.9rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.4 }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '0.6rem', fontSize: '0.7rem' }}>
        {[
          ['hyperscaler','#10b981'],['silicon','#06b6d4'],['foundry','#8b5cf6'],
          ['memory','#a855f7'],['power','#f59e0b'],['cooling','#f97316'],
          ['partner','#ec4899'],['contract','#64748b'],
        ].map(([t, c]) => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: c + '40', border: `1px solid ${c}`, flexShrink: 0 }} />
            {t}
          </span>
        ))}
      </div>

      {/* SVG graph */}
      <div style={{ position: 'relative', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: 12, overflow: 'hidden', height: 600, cursor: 'grab' }}>
        <svg
          ref={svgRef}
          width="100%" height="100%"
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{ userSelect: 'none' }}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#2a2a3e" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map((e, i) => {
              const from = nodeById[e.source]
              const to   = nodeById[e.target]
              if (!from || !to) return null
              const path = edgePath(from, to)
              const mid  = edgeMid(from, to)
              const isHovered = hoveredId === e.source || hoveredId === e.target
              return (
                <g key={i}>
                  <path
                    d={path}
                    fill="none"
                    stroke={isHovered ? '#6366f1' : '#2a2a3e'}
                    strokeWidth={isHovered ? 2 : 1.5}
                    markerEnd="url(#arrow)"
                    style={{ transition: 'stroke 0.15s' }}
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={mid.x - 55} y={mid.y - 9}
                        width={110} height={16}
                        rx={4} fill="#12121a" stroke="#2a2a3e" strokeWidth={0.8}
                      />
                      <text x={mid.x} y={mid.y + 4} textAnchor="middle"
                        style={{ fontSize: 9, fill: '#94a3b8', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
                        {e.label?.slice(0, 22)}{e.label?.length > 22 ? '…' : ''}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* Nodes */}
            {nodes.map(n => {
              const style   = getNodeStyle(n.type)
              const isHov   = hoveredId === n.id
              const nx      = n.x - NODE_W / 2
              const ny      = n.y - NODE_H / 2
              return (
                <g
                  key={n.id}
                  className="graph-node"
                  onMouseEnter={() => setHoveredId(n.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: 'default' }}
                >
                  {/* Shadow / glow on hover */}
                  {isHov && (
                    <rect x={nx - 3} y={ny - 3} width={NODE_W + 6} height={NODE_H + 6}
                      rx={13} fill={style.color + '15'} filter="url(#glow)" />
                  )}
                  {/* Main box */}
                  <rect
                    x={nx} y={ny} width={NODE_W} height={NODE_H} rx={10}
                    fill={style.bg}
                    stroke={isHov ? style.color : style.border}
                    strokeWidth={isHov ? 2 : 1.5}
                    style={{ transition: 'stroke 0.15s' }}
                  />
                  {/* Type label */}
                  <text x={nx + 10} y={ny + 16}
                    style={{ fontSize: 9, fill: style.color, fontFamily: 'sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', pointerEvents: 'none' }}>
                    {n.type}
                  </text>
                  {/* Main label */}
                  <text x={nx + 10} y={ny + 33}
                    style={{ fontSize: 12, fill: '#e2e8f0', fontFamily: 'sans-serif', fontWeight: 700, pointerEvents: 'none' }}>
                    {n.label.slice(0, 22)}{n.label.length > 22 ? '…' : ''}
                  </text>
                  {/* Sublabel line 1 */}
                  {n.sublabel && (
                    <text x={nx + 10} y={ny + 48}
                      style={{ fontSize: 9, fill: '#64748b', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
                      {n.sublabel.slice(0, 28)}{n.sublabel.length > 28 ? '…' : ''}
                    </text>
                  )}
                  {/* Sublabel line 2 */}
                  {n.sublabel?.length > 28 && (
                    <text x={nx + 10} y={ny + 60}
                      style={{ fontSize: 9, fill: '#64748b', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
                      {n.sublabel.slice(28, 56)}{n.sublabel.length > 56 ? '…' : ''}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>

        {/* Controls overlay */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6 }}>
          {[
            ['+', () => setZoom(z => Math.min(2,   z + 0.15))],
            ['−', () => setZoom(z => Math.max(0.3, z - 0.15))],
            ['⌂', () => { setPan({ x: 30, y: 30 }); setZoom(0.85) }],
          ].map(([label, fn]) => (
            <button key={label} onClick={fn} style={{
              width: 30, height: 30, background: '#12121a', border: '1px solid #2a2a3e',
              color: '#94a3b8', borderRadius: 6, cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 12, left: 12, color: '#2a2a3e', fontSize: '0.68rem' }}>
          Drag to pan · Scroll to zoom · Hover nodes for edge labels
        </div>
      </div>
    </div>
  )
}
