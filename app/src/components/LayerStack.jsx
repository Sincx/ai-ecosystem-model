import { useState } from 'react'

export default function LayerStack({ layers }) {
  const [expanded, setExpanded] = useState(null)

  const toggle = (id) => setExpanded(expanded === id ? null : id)

  return (
    <div className="layer-stack">
      {[...layers].reverse().map((layer) => (
        <div
          key={layer.id}
          className={`layer-row ${expanded === layer.id ? 'expanded' : ''}`}
          onClick={() => toggle(layer.id)}
        >
          <span
            className="layer-badge"
            style={{ background: layer.color + '22', color: layer.color, border: `1px solid ${layer.color}44` }}
          >
            {layer.id}
          </span>
          <div>
            <div className="layer-name">{layer.name}</div>
            <div className="layer-desc">{layer.description}</div>
          </div>
          <span className="layer-expand">
            {expanded === layer.id ? '▲ less' : '▼ more'}
          </span>

          {expanded === layer.id && (
            <div className="layer-detail">
              <div className="layer-detail-constraint">
                ⚠ {layer.constraint}
              </div>
              <div className="entity-chips">
                {layer.entities.map((e) => (
                  <span key={e} className="entity-chip">{e}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
