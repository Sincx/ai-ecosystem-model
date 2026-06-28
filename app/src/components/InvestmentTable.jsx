import { useState, useMemo } from 'react'

const LAYERS = ['All', 'L0', 'L1', 'L2', 'L3', 'L4', 'L5']
const TIERS  = ['All', '1', '2', '3']

function Stars({ n }) {
  return (
    <span>
      <span className="stars">{'★'.repeat(n)}</span>
      <span className="stars-empty">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

export default function InvestmentTable({ signals }) {
  const [layerFilter, setLayerFilter] = useState('All')
  const [tierFilter,  setTierFilter]  = useState('All')
  const [sortKey,     setSortKey]     = useState('tier')
  const [sortDir,     setSortDir]     = useState('asc')

  const filtered = useMemo(() => {
    let rows = [...signals]
    if (layerFilter !== 'All') rows = rows.filter(r => r.layer === layerFilter)
    if (tierFilter  !== 'All') rows = rows.filter(r => String(r.tier) === tierFilter)
    rows.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return rows
  }, [signals, layerFilter, tierFilter, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const arrow = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <div>
      <div className="filter-row">
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem', alignSelf: 'center' }}>Layer:</span>
        {LAYERS.map(l => (
          <button key={l} className={`filter-btn ${layerFilter === l ? 'active' : ''}`}
            onClick={() => setLayerFilter(l)}>{l}</button>
        ))}
        <span style={{ color: 'var(--border)', margin: '0 0.25rem' }}>|</span>
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem', alignSelf: 'center' }}>Tier:</span>
        {TIERS.map(t => (
          <button key={t} className={`filter-btn ${tierFilter === t ? 'active' : ''}`}
            onClick={() => setTierFilter(t)}>Tier {t === 'All' ? '—' : t}</button>
        ))}
      </div>

      <div className="inv-table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('entity')}>Entity{arrow('entity')}</th>
              <th onClick={() => toggleSort('ticker')}>Ticker{arrow('ticker')}</th>
              <th onClick={() => toggleSort('layer')}>Layer{arrow('layer')}</th>
              <th onClick={() => toggleSort('tier')}>Tier{arrow('tier')}</th>
              <th onClick={() => toggleSort('stars')}>Signal{arrow('stars')}</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.entity}</td>
                <td><span className="ticker">{r.ticker}</span></td>
                <td>
                  <span className="layer-badge" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 4 }}>
                    {r.layer}
                  </span>
                </td>
                <td>
                  <span className={`tier-badge tier-${r.tier}`}>Tier {r.tier}</span>
                </td>
                <td><Stars n={r.stars} /></td>
                <td style={{ color: 'var(--muted)', maxWidth: 420, lineHeight: 1.4 }}>{r.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
