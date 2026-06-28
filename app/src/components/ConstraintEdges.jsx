const LAYER_COLORS = {
  L0: '#f59e0b', L1: '#f97316', L2: '#8b5cf6',
  L3: '#06b6d4', L4: '#10b981', L5: '#ec4899',
}

export default function ConstraintEdges({ edges }) {
  return (
    <div className="edge-list">
      {edges.map((e, i) => (
        <div key={i} className="edge-row" style={{ opacity: e.secondary ? 0.65 : 1 }}>
          <span className="edge-from"
            style={{ background: LAYER_COLORS[e.from] + '22', color: LAYER_COLORS[e.from], border: `1px solid ${LAYER_COLORS[e.from]}44` }}>
            {e.from}
          </span>
          <span className="edge-arrow">→</span>
          <span className="edge-to"
            style={{ background: LAYER_COLORS[e.to] + '22', color: LAYER_COLORS[e.to], border: `1px solid ${LAYER_COLORS[e.to]}44` }}>
            {e.to}
          </span>
          <span className="edge-label">{e.label}</span>
        </div>
      ))}
    </div>
  )
}
