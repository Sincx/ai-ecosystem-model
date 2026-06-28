import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: '#12121a', border: '1px solid #ef444444',
          borderRadius: 10, padding: '2rem',
          color: '#94a3b8', fontSize: '0.85rem',
        }}>
          <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: '0.5rem' }}>
            Component failed to render
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: '1rem', background: '#1e1e2e', border: '1px solid #2a2a3e',
              color: '#94a3b8', borderRadius: 6, padding: '0.4rem 0.8rem',
              cursor: 'pointer', fontSize: '0.8rem',
            }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
