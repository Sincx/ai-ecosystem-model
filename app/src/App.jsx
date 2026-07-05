import { useState, useEffect } from 'react'
import './styles.css'
import LayerStack       from './components/LayerStack.jsx'
import InvestmentTable  from './components/InvestmentTable.jsx'
import Scenarios        from './components/Scenarios.jsx'
import FinanceModels    from './components/FinanceModels.jsx'
import ConstraintEdges  from './components/ConstraintEdges.jsx'
import SnapshotIndex    from './components/SnapshotIndex.jsx'
import HyperscalerGraph from './components/HyperscalerGraph.jsx'
import PowerMap         from './components/PowerMap.jsx'
import EcosystemFlow    from './components/EcosystemFlow.jsx'
import ErrorBoundary    from './components/ErrorBoundary.jsx'

// 8 → 5 tabs. Flow absorbs Hyperscalers; Model absorbs Stack+Constraints; Research absorbs Scenarios+Wiki
const VIEWS = [
  { id: 'Flow',     label: 'Flow',     sub: 'Supply chain' },
  { id: 'Signals',  label: 'Signals',  sub: 'Investments' },
  { id: 'Power',    label: 'Power',    sub: 'Global demand' },
  { id: 'Model',    label: 'Model',    sub: 'Stack & constraints' },
  { id: 'Research', label: 'Research', sub: 'Scenarios & wiki' },
]

async function loadJSON(path) {
  try {
    const r = await fetch(path)
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

export default function App() {
  const [view,       setView]       = useState('Flow')
  const [modelSub,   setModelSub]   = useState('stack')      // 'stack' | 'constraints'
  const [researchSub, setResearchSub] = useState('scenarios') // 'scenarios' | 'models' | 'wiki'
  const [flowSub,    setFlowSub]    = useState('flow')       // 'flow' | 'hyperscalers'
  const [data,       setData]       = useState({})
  const [meta,       setMeta]       = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      loadJSON('/data/layer_stack.json'),
      loadJSON('/data/investment_signals.json'),
      loadJSON('/data/scenarios.json'),
      loadJSON('/data/constraint_edges.json'),
      loadJSON('/data/snapshot_index.json'),
      loadJSON('/data/finance_models.json'),
      loadJSON('/data/meta.json'),
    ]).then(([layers, signals, scenarios, edges, snapshots, financeModels, meta]) => {
      setData({ layers, signals, scenarios, edges, snapshots, financeModels: financeModels || [] })
      setMeta(meta)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text3)', fontSize: '0.85rem' }}>
        Loading model data…
      </div>
    )
  }

  const genDate = meta ? new Date(meta.generated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  return (
    <div className="app">
      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="nav">
        {/* Brand */}
        <div className="nav-brand">
          <span className="nav-brand-name">AI Capex Model</span>
          <span className="nav-brand-sub">Constraint-Edge Framework</span>
        </div>

        {/* Tabs */}
        <div className="nav-tabs">
          {VIEWS.map(v => (
            <button
              key={v.id}
              className={`nav-tab${view === v.id ? ' active' : ''}`}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Meta — right side, compact */}
        <div className="nav-meta">
          {meta && (
            <>
              <div className="nav-live">
                <span className="live-dot" />
                {genDate}
              </div>
              <span className="nav-pages">{meta.pages_indexed} pages</span>
              <span className="nav-pages" style={{ color: 'var(--accent2)', borderColor: 'var(--accent)' }}>v0.6</span>
            </>
          )}
        </div>
      </nav>

      {/* ── Flow (Supply Chain + Hyperscalers) ──────────────────────── */}
      {view === 'Flow' && (
        <>
          <div className="section-title">
            Supply Chain Flow
            <span>L5 (demand) ← L0 (infrastructure) · click a company to inspect</span>
          </div>

          {/* Sub-toggle */}
          <div className="filter-row" style={{ marginBottom: 'var(--sp6)' }}>
            <span className="filter-label">View</span>
            <button className={`filter-btn${flowSub === 'flow' ? ' active' : ''}`} onClick={() => setFlowSub('flow')}>
              Full Ecosystem
            </button>
            <button className={`filter-btn${flowSub === 'hyperscalers' ? ' active' : ''}`} onClick={() => setFlowSub('hyperscalers')}>
              Hyperscaler Deep-Dive
            </button>
          </div>

          <ErrorBoundary>
            {flowSub === 'flow'
              ? <EcosystemFlow />
              : <HyperscalerGraph />
            }
          </ErrorBoundary>
        </>
      )}

      {/* ── Signals ─────────────────────────────────────────────────── */}
      {view === 'Signals' && data.signals && (
        <>
          <div className="section-title">
            Investment Signals
            <span>{data.signals.length} entities · filter by layer or tier</span>
          </div>
          <InvestmentTable signals={data.signals} />
        </>
      )}

      {/* ── Power Map ───────────────────────────────────────────────── */}
      {view === 'Power' && (
        <>
          <div className="section-title">
            AI DC Power Demand
            <span>Global clusters · hover for detail · toggle year</span>
          </div>
          <ErrorBoundary>
            <PowerMap />
          </ErrorBoundary>
        </>
      )}

      {/* ── Model (Stack + Constraints) ─────────────────────────────── */}
      {view === 'Model' && (
        <>
          <div className="section-title">
            Model Structure
            <span>6-layer stack and constraint propagation</span>
          </div>

          {/* Sub-toggle */}
          <div className="filter-row" style={{ marginBottom: 'var(--sp6)' }}>
            <span className="filter-label">View</span>
            <button className={`filter-btn${modelSub === 'stack' ? ' active' : ''}`} onClick={() => setModelSub('stack')}>
              Layer Stack
            </button>
            <button className={`filter-btn${modelSub === 'constraints' ? ' active' : ''}`} onClick={() => setModelSub('constraints')}>
              Constraint Edges
            </button>
          </div>

          {modelSub === 'stack' && data.layers && <LayerStack layers={data.layers} />}
          {modelSub === 'constraints' && data.edges && (
            <div className="card">
              <ConstraintEdges edges={data.edges} />
            </div>
          )}
        </>
      )}

      {/* ── Research (Scenarios + Wiki) ─────────────────────────────── */}
      {view === 'Research' && (
        <>
          <div className="section-title">
            Research
            <span>Macro scenarios and wiki reference pages</span>
          </div>

          {/* Sub-toggle */}
          <div className="filter-row" style={{ marginBottom: 'var(--sp6)' }}>
            <span className="filter-label">View</span>
            <button className={`filter-btn${researchSub === 'scenarios' ? ' active' : ''}`} onClick={() => setResearchSub('scenarios')}>
              Scenarios
            </button>
            <button className={`filter-btn${researchSub === 'models' ? ' active' : ''}`} onClick={() => setResearchSub('models')}>
              Scenario Models
              {data.financeModels && <span style={{ marginLeft: 6, fontSize: '0.68rem', opacity: 0.7 }}>{data.financeModels.length}</span>}
            </button>
            <button className={`filter-btn${researchSub === 'wiki' ? ' active' : ''}`} onClick={() => setResearchSub('wiki')}>
              Wiki Pages
              {data.snapshots && <span style={{ marginLeft: 6, fontSize: '0.68rem', opacity: 0.7 }}>{data.snapshots.length}</span>}
            </button>
          </div>

          {researchSub === 'scenarios' && data.scenarios && <Scenarios scenarios={data.scenarios} />}
          {researchSub === 'models' && <FinanceModels models={data.financeModels || []} />}
          {researchSub === 'wiki' && data.snapshots && <SnapshotIndex snapshots={data.snapshots} />}
        </>
      )}
    </div>
  )
}
