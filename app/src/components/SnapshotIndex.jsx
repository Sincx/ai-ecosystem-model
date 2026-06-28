import { useState } from 'react'

export default function SnapshotIndex({ snapshots }) {
  const [search, setSearch] = useState('')

  const filtered = snapshots.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.oneliner.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="snap-search">
        <span className="snap-search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search pages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text4)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>✕</button>
        )}
      </div>

      <div className="snap-grid">
        {filtered.map((s, i) => (
          <div key={i} className="snap-card">
            <div className="snap-date">{s.date} · {s.file}</div>
            <div className="snap-title">{s.title.replace(/^"?Data: /, '').replace(/"$/, '')}</div>
            {s.oneliner && <div className="snap-oneliner">{s.oneliner.slice(0, 180)}{s.oneliner.length > 180 ? '…' : ''}</div>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: 'var(--text3)', fontSize: '0.85rem', padding: 'var(--sp8)', textAlign: 'center' }}>
            No pages match "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
