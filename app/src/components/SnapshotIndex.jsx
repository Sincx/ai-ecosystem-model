import { useState } from 'react'

export default function SnapshotIndex({ snapshots }) {
  const [search, setSearch] = useState('')

  const filtered = snapshots.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.oneliner.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input
        type="text"
        placeholder="Search pages…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: 400, background: 'var(--bg2)',
          border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem',
          color: 'var(--text)', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none',
        }}
      />
      <div className="snap-grid">
        {filtered.map((s, i) => (
          <div key={i} className="snap-card">
            <div className="snap-date">{s.date} · {s.file}</div>
            <div className="snap-title">{s.title.replace(/^"?Data: /, '').replace(/"$/, '')}</div>
            {s.oneliner && <div className="snap-oneliner">{s.oneliner.slice(0, 180)}{s.oneliner.length > 180 ? '…' : ''}</div>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No pages match.</div>
        )}
      </div>
    </div>
  )
}
