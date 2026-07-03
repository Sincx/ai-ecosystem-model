// Vercel serverless function — proxies Yahoo Finance so browser avoids CORS
export default async function handler(req, res) {
  const { symbols } = req.query
  if (!symbols) return res.status(400).json({ error: 'symbols required' })

  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice`
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    })
    if (!r.ok) throw new Error(`Yahoo responded ${r.status}`)
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.json(data)
  } catch (e) {
    return res.status(502).json({ error: e.message })
  }
}
