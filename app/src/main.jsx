import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// StrictMode disabled — ReactFlow v11 has a known double-invoke crash with it
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
