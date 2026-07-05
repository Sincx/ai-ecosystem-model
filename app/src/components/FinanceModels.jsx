import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function FinanceModels({ models }) {
  const [activeSlug, setActiveSlug] = useState(models[0]?.slug ?? null)
  const active = models.find(m => m.slug === activeSlug)

  if (models.length === 0) {
    return (
      <div style={{ color: 'var(--text3)', fontSize: '0.85rem', padding: 'var(--sp8)', textAlign: 'center' }}>
        No scenario models found. Run <code>npm run parse</code> after adding a page to wiki/finance/models/.
      </div>
    )
  }

  return (
    <div className="models-layout">
      <div className="models-list">
        {models.map(m => (
          <button
            key={m.slug}
            className={`models-list-item${m.slug === activeSlug ? ' active' : ''}`}
            onClick={() => setActiveSlug(m.slug)}
          >
            <div className="models-list-date">{m.updated || m.date}</div>
            <div className="models-list-title">{m.title.replace(/^"|"$/g, '')}</div>
            {m.oneliner && <div className="models-list-oneliner">{m.oneliner.slice(0, 110)}</div>}
          </button>
        ))}
      </div>

      <div className="models-detail card">
        {active ? (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{active.body}</ReactMarkdown>
          </div>
        ) : (
          <div style={{ color: 'var(--text3)' }}>Select a model to view</div>
        )}
      </div>
    </div>
  )
}
