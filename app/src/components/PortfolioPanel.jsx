import { useState } from 'react'
import { PORTFOLIO, makeTACommand, makeEACommand, makePortfolioTACommand } from '../data/portfolio.js'

function copyToClipboard(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  })
}

function CopyBtn({ text, label = 'Copy', small = false }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className={`copy-btn${small ? ' copy-btn-sm' : ''}${copied ? ' copied' : ''}`}
      onClick={() => copyToClipboard(text, setCopied)}
      title={text}
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

function AnalystForm() {
  const [ticker, setTicker]   = useState('')
  const [mode, setMode]       = useState('ta')
  const [custom, setCustom]   = useState('')
  const [copied, setCopied]   = useState(false)

  const cmd = ticker.trim()
    ? mode === 'ta'  ? makeTACommand(ticker.trim().toUpperCase())
    : mode === 'ea'  ? makeEACommand(ticker.trim().toUpperCase())
    : `/researcher ${ticker.trim().toUpperCase()} ${custom}`
    : ''

  return (
    <div className="analyst-form">
      <div className="analyst-form-row">
        <input
          className="analyst-input"
          placeholder="Ticker or company name…"
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && cmd) copyToClipboard(cmd, setCopied) }}
        />
        <div className="analyst-modes">
          {[
            { id: 'ta', label: 'Technical' },
            { id: 'ea', label: 'Fundamental' },
            { id: 'res', label: 'Research' },
          ].map(m => (
            <button
              key={m.id}
              className={`filter-btn${mode === m.id ? ' active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {mode === 'res' && (
        <input
          className="analyst-input"
          style={{ marginTop: 'var(--sp2)' }}
          placeholder="Additional context (optional)…"
          value={custom}
          onChange={e => setCustom(e.target.value)}
        />
      )}
      {cmd && (
        <div className="cmd-preview">
          <code>{cmd}</code>
          <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={() => copyToClipboard(cmd, setCopied)}
          >
            {copied ? '✓ Copied' : 'Copy command'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function PortfolioPanel() {
  const [filter, setFilter] = useState('all')
  const [portfolioCopied, setPortfolioCopied] = useState(false)

  const sectors = ['all', ...new Set(PORTFOLIO.map(p => p.sector))]
  const visible = filter === 'all' ? PORTFOLIO : PORTFOLIO.filter(p => p.sector === filter)

  const LAYER_COLORS = {
    L0: '#f59e0b', L1: '#10b981', L2: '#8b5cf6',
    L3: '#06b6d4', L4: '#3b82f6', L5: '#ec4899',
  }

  return (
    <div className="portfolio-wrap">

      {/* ── Analyst trigger ──────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--sp6)' }}>
        <div className="card-label">Run Analysis</div>
        <AnalystForm />
        <div style={{ marginTop: 'var(--sp4)', display: 'flex', gap: 'var(--sp3)', flexWrap: 'wrap' }}>
          <button
            className={`filter-btn${portfolioCopied ? ' active' : ''}`}
            onClick={() => copyToClipboard(makePortfolioTACommand(), setPortfolioCopied)}
          >
            {portfolioCopied ? '✓ Copied' : 'Portfolio TA sweep (all 20)'}
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text3)', alignSelf: 'center' }}>
            Paste into Claude Code to run the full portfolio technical analysis
          </span>
        </div>
      </div>

      {/* ── Sector filter ─────────────────────────────────────── */}
      <div className="filter-row" style={{ marginBottom: 'var(--sp4)', flexWrap: 'wrap' }}>
        <span className="filter-label">Sector</span>
        {sectors.map(s => (
          <button
            key={s}
            className={`filter-btn${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* ── Holdings table ────────────────────────────────────── */}
      <div className="portfolio-table-wrap">
        <table className="portfolio-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th>Sector</th>
              <th>Layer</th>
              <th style={{ textAlign: 'right' }}>Entry</th>
              <th style={{ textAlign: 'center' }}>Analyse</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.ticker}>
                <td>
                  <span className="ticker-badge">{p.ticker}</span>
                </td>
                <td className="name-cell">{p.name}</td>
                <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{p.sector}</td>
                <td>
                  {p.layer && (
                    <span
                      className="layer-badge"
                      style={{ background: LAYER_COLORS[p.layer] + '22', color: LAYER_COLORS[p.layer], borderColor: LAYER_COLORS[p.layer] + '55' }}
                    >
                      {p.layer}
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {p.currency === 'EUR' ? '€' : '$'}{p.entry.toFixed(2)}
                </td>
                <td>
                  <div className="action-btns">
                    <CopyBtn text={makeTACommand(p.ticker)} label="TA" small />
                    <CopyBtn text={makeEACommand(p.ticker)} label="FA" small />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text4)', marginTop: 'var(--sp4)' }}>
        Entry prices are cost basis. Copy a command and paste into Claude Code to run the skill.
        TA = Technical Analysis · FA = Fundamental / Equity Deep Dive
      </p>
    </div>
  )
}
