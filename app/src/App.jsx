import { useState, useEffect } from 'react'
import './styles.css'
import LayerStack          from './components/LayerStack.jsx'
import InvestmentTable     from './components/InvestmentTable.jsx'
import Scenarios           from './components/Scenarios.jsx'
import ConstraintEdges     from './components/ConstraintEdges.jsx'
import SnapshotIndex       from './components/SnapshotIndex.jsx'
import HyperscalerGraph    from './components/HyperscalerGraph.jsx'
import PowerMap            from './components/PowerMap.jsx'
import ErrorBoundary       from './components/ErrorBoundary.jsx'

const VIEWS = ['Stack', 'Signals', 'Hyperscalers', 'Power Map', 'Scenarios', 'Constraints', 'Wiki']

async function loadJSON(path) {
  try {
    const r = await fetch(path)
    if (!r.ok) return null
    return r.json()
  } catch {
    return null
  }
}

export default function App() {
  const [view,    setView]    = useState('Stack')
  const [data,    setData]    = useState({})
  const [meta,    setMeta]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      loadJSON('/data/layer_stack.json'),
      loadJSON('/data/investment_signals.json'),
      loadJSON('/data/scenarios.json'),
      loadJSON('/data/constraint_edges.json'),
      loadJSON('/data/snapshot_index.json'),
      loadJSON('/data/meta.json'),
    ]).then(([layers, signals, scenarios, edges, snapshots, meta]) => {
      setData({ layers, signals, scenarios, edges, snapshots })
      setMeta(meta)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)' }}>
        Loading model data…
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="nav">
        <h1>AI Ecosystem <span>Constraint-Edge Model</span></h1>
        {VIEWS.map(v => (
          <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v}</button>
        ))}
      </nav>

      {meta && (
        <div className="meta-bar">
          <span><span className="dot" />Live</span>
          <span>Generated: <strong>{new Date(meta.generated).toLocaleString()}</strong></span>
          <span>Wiki pages indexed: <strong>{meta.pages_indexed}</strong></span>
          <span>Wiki: <strong>{meta.wiki_dir}</strong></span>
        </div>
      )}

      {view === 'Stack' && data.layers && (
        <>
          <div className="section-title">
            AI Infrastructure Stack <span>L0 → L5 · click a layer to expand</span>
          </div>
          <LayerStack layers={data.layers} />
        </>
      )}

      {view === 'Signals' && data.signals && (
        <>
          <div className="section-title">
            Investment Signals <span>{data.signals.length} entities · filter by layer or tier</span>
          </div>
          <InvestmentTable signals={data.signals} />
        </>
      )}

      {view === 'Hyperscalers' && (
        <>
          <div className="section-title">
            Hyperscaler Dependency Graph <span>click a hyperscaler · drag nodes · scroll to zoom</span>
          </div>
          <ErrorBoundary>
            <HyperscalerGraph />
          </ErrorBoundary>
        </>
      )}

      {view === 'Power Map' && (
        <>
          <div className="section-title">
            AI DC Power Demand — World Map <span>hover clusters · toggle year · filter by region</span>
          </div>
          <ErrorBoundary>
            <PowerMap />
          </ErrorBoundary>
        </>
      )}

      {view === 'Scenarios' && data.scenarios && (
        <>
          <div className="section-title">
            Scenario Analysis <span>Base 55% · Bull 25% · Bear 20%</span>
          </div>
          <Scenarios scenarios={data.scenarios} />
        </>
      )}

      {view === 'Constraints' && data.edges && (
        <>
          <div className="section-title">
            Constraint Propagation <span>how scarcity flows through the stack</span>
          </div>
          <div className="card">
            <ConstraintEdges edges={data.edges} />
          </div>
        </>
      )}

      {view === 'Wiki' && data.snapshots && (
        <>
          <div className="section-title">
            Wiki Pages <span>{data.snapshots.length} data pages indexed</span>
          </div>
          <SnapshotIndex snapshots={data.snapshots} />
        </>
      )}
    </div>
  )
}
