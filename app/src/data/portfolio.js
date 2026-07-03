// Portfolio 1 — equity positions with entry prices
export const PORTFOLIO = [
  { ticker: 'CSCO',   name: 'Cisco Systems',       entry: 118.21, currency: 'USD', sector: 'Technology',    layer: 'L3' },
  { ticker: 'XOM',    name: 'Exxon Mobil',          entry: 157.75, currency: 'USD', sector: 'Energy',        layer: null },
  { ticker: 'CAT',    name: 'Caterpillar',           entry: 863.95, currency: 'USD', sector: 'Industrials',   layer: null },
  { ticker: 'IQV',    name: 'IQVIA Holdings',        entry: 174.00, currency: 'USD', sector: 'Healthcare',    layer: null },
  { ticker: 'IBM',    name: 'IBM',                   entry: 225.00, currency: 'USD', sector: 'Technology',    layer: 'L4' },
  { ticker: 'QCOM',   name: 'Qualcomm',              entry: 238.63, currency: 'USD', sector: 'Semiconductors',layer: 'L3' },
  { ticker: 'LHA.DE', name: 'Lufthansa',             entry:   7.89, currency: 'EUR', sector: 'Airlines',      layer: null },
  { ticker: 'CRWD',   name: 'CrowdStrike',           entry: 663.46, currency: 'USD', sector: 'Cybersecurity', layer: null },
  { ticker: 'MU',     name: 'Micron Technology',     entry: 895.88, currency: 'USD', sector: 'Semiconductors',layer: 'L2' },
  { ticker: 'NVO',    name: 'Novo Nordisk',          entry:  44.55, currency: 'USD', sector: 'Healthcare',    layer: null },
  { ticker: 'SKYT',   name: 'SkyWater Technology',   entry:  38.98, currency: 'USD', sector: 'Semiconductors',layer: 'L1' },
  { ticker: 'HPQ',    name: 'HP Inc.',               entry:  25.01, currency: 'USD', sector: 'Technology',    layer: null },
  { ticker: 'AMAT',   name: 'Applied Materials',     entry: 458.17, currency: 'USD', sector: 'Semiconductors',layer: 'L1' },
  { ticker: 'GEV',    name: 'GE Vernova',            entry: 969.67, currency: 'USD', sector: 'Energy/Power',  layer: 'L0' },
  { ticker: 'TNET',   name: 'TriNet Group',          entry:  45.40, currency: 'USD', sector: 'HR Services',   layer: null },
  { ticker: 'JPM',    name: 'JPMorgan Chase',        entry: 310.89, currency: 'USD', sector: 'Financials',    layer: null },
  { ticker: 'AVGO',   name: 'Broadcom',              entry: 385.73, currency: 'USD', sector: 'Semiconductors',layer: 'L3' },
  { ticker: 'PEP',    name: 'PepsiCo',               entry: 141.92, currency: 'USD', sector: 'Consumer Staples',layer: null },
  { ticker: 'NOC',    name: 'Northrop Grumman',      entry: 548.01, currency: 'USD', sector: 'Defence',       layer: null },
  { ticker: 'DHI',    name: "D.R. Horton",           entry: 146.01, currency: 'USD', sector: 'Homebuilders',  layer: null },
]

// Analyst command generators
export function makeTACommand(ticker) {
  return `/technical-analyst ${ticker}`
}

export function makeEACommand(ticker) {
  return `/equity-analyst ${ticker}`
}

export function makePortfolioTACommand() {
  const tickers = PORTFOLIO.map(p => p.ticker).join(', ')
  return `/technical-analyst Portfolio 1 positions: ${tickers}. Focus on stop-loss risk, momentum, and T1/T2 proximity. Entry prices: ${PORTFOLIO.map(p => `${p.ticker} ${p.currency === 'EUR' ? '€' : '$'}${p.entry}`).join(', ')}.`
}
