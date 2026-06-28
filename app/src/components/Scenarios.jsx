export default function Scenarios({ scenarios }) {
  return (
    <div className="scenario-grid">
      {scenarios.map((s) => (
        <div key={s.name} className="scenario-card" style={{ borderColor: s.color }}>
          <div className="scenario-name" style={{ color: s.color }}>{s.name}</div>
          <div className="scenario-prob" style={{ color: s.color }}>{s.probability}%</div>
          <div className="scenario-desc">{s.description}</div>
          <ul className="scenario-impl">
            {s.implications.map((imp, i) => (
              <li key={i}>{imp}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
