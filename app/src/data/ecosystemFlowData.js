// Generates a deterministic price sparkline from % changes
function genSpark(price, chg30d, chg6m, seed = 1) {
  const p30  = price / (1 + chg30d / 100)
  const p6m  = price / (1 + chg6m  / 100)
  return Array.from({ length: 180 }, (_, i) => {
    let base
    if (i < 150) {
      base = p6m + (p30 - p6m) * (i / 150)
    } else {
      base = p30 + (price - p30) * ((i - 150) / 30)
    }
    const noise = Math.sin(seed * 13 + i * 0.94) * price * 0.014
    return { d: i - 180, v: Math.max(1, +(base + noise).toFixed(2)) }
  })
}

export const LAYER_META = [
  { col: 0, id: 'L0', label: 'Power & Cooling',    color: '#f59e0b' },
  { col: 1, id: 'L1', label: 'Physical DC / Tools', color: '#10b981' },
  { col: 2, id: 'L2', label: 'Silicon Supply',      color: '#8b5cf6' },
  { col: 3, id: 'L3', label: 'AI Silicon',          color: '#06b6d4' },
  { col: 4, id: 'L4', label: 'Cloud & Neo-Cloud',   color: '#3b82f6' },
  { col: 5, id: 'L5', label: 'Foundation Models',   color: '#ec4899' },
]

export const NODES = [
  // ── L0 Power & Cooling ──────────────────────────────────────────────
  {
    id: 'eaton', name: 'Eaton', ticker: 'ETN', layer: 0, row: 0, type: 'public',
    price: 348, change30d: 6.2, change6m: 22.4, marketCapB: 140,
    revenue: [{ y: 'FY22', v: 20.8 }, { y: 'FY23', v: 23.2 }, { y: 'FY24', v: 24.9 }, { y: 'FY25E', v: 27.5 }],
    inputs: [
      { company: 'Steel / copper suppliers', what: 'Raw materials for transformers & switchgear', valueB: 3.2, status: 'realized', date: 'Ongoing' },
      { company: 'Electronics components', what: 'Power semiconductors, capacitors', valueB: 1.8, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'Hyperscalers (direct)', what: 'UPS, PDU, switchgear — on-site DC power', valueB: 4.5, status: 'committed', date: '2025–2028' },
      { company: 'Digital Realty / Equinix', what: 'Power distribution to colo DCs', valueB: 1.5, status: 'realized', date: 'Ongoing' },
      { company: 'Industrial / utility', what: 'Non-AI electrical equipment', valueB: 17.5, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(348, 6.2, 22.4, 1),
  },
  {
    id: 'vertiv', name: 'Vertiv', ticker: 'VRT', layer: 0, row: 1, type: 'public',
    price: 125, change30d: 9.1, change6m: 38.5, marketCapB: 48,
    revenue: [{ y: 'FY22', v: 5.4 }, { y: 'FY23', v: 6.9 }, { y: 'FY24', v: 8.4 }, { y: 'FY25E', v: 11.0 }],
    inputs: [
      { company: 'Ecolab (acquired)', what: 'Cooling chemistry & services', valueB: 4.75, status: 'committed', date: 'Acquisition 2025' },
      { company: 'Compressor / heat-ex suppliers', what: 'Direct-to-chip cooling components', valueB: 0.9, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'NVIDIA / hyperscalers', what: 'Direct-to-chip liquid cooling for B300/GB300 racks', valueB: 3.8, status: 'committed', date: '2025–2027' },
      { company: 'Digital Realty / Equinix', what: 'Thermal management for colo facilities', valueB: 1.2, status: 'realized', date: 'Ongoing' },
      { company: '$15B+ backlog (total)', what: 'All DC cooling & power infrastructure', valueB: 15, status: 'committed', date: '2025–2028' },
    ],
    spark: genSpark(125, 9.1, 38.5, 2),
  },
  {
    id: 'schneider', name: 'Schneider Electric', ticker: 'SU.PA', layer: 0, row: 2, type: 'public',
    price: 280, change30d: 4.3, change6m: 16.8, marketCapB: 165,
    revenue: [{ y: 'FY22', v: 34.2 }, { y: 'FY23', v: 37.7 }, { y: 'FY24', v: 39.5 }, { y: 'FY25E', v: 42.0 }],
    inputs: [
      { company: 'European supply chain', what: 'Switchgear, automation components', valueB: 12.0, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'Hyperscalers / DC operators', what: 'EcoStruxure DC management, PDU, cooling', valueB: 8.5, status: 'committed', date: '2025–2028' },
      { company: 'Industrial / building segment', what: 'Non-DC energy management', valueB: 31.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(280, 4.3, 16.8, 3),
  },

  {
    id: 'bloom', name: 'Bloom Energy', ticker: 'BE', layer: 0, row: 3, type: 'public',
    price: 22, change30d: 18.4, change6m: 64.8, marketCapB: 5.1,
    revenue: [{ y: 'FY22', v: 0.97 }, { y: 'FY23', v: 1.33 }, { y: 'FY24', v: 1.56 }, { y: 'FY25E', v: 2.4 }],
    inputs: [
      { company: 'Natural gas suppliers', what: 'Fuel feed for solid-oxide fuel cells', valueB: 0.4, status: 'realized', date: 'Ongoing' },
      { company: 'SK / materials vendors', what: 'Ceramic fuel cell stack components', valueB: 0.3, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'Oracle (New Mexico BTM)', what: 'Fuel cells replacing gas turbines — Stargate campus', valueB: 0.4, status: 'committed', date: '2026–2028' },
      { company: 'Hyperscaler BTM pipeline', what: 'Onsite power for 40GW+ BTM buildout by 2028', valueB: 1.2, status: 'committed', date: '2026–2029' },
      { company: 'Utility & industrial', what: 'Non-DC fuel cell installations', valueB: 0.7, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(22, 18.4, 64.8, 21),
  },
  {
    id: 'constellation', name: 'Constellation Energy', ticker: 'CEG', layer: 0, row: 4, type: 'public',
    price: 295, change30d: 7.8, change6m: 34.6, marketCapB: 91,
    revenue: [{ y: 'FY22', v: 20.7 }, { y: 'FY23', v: 23.6 }, { y: 'FY24', v: 25.0 }, { y: 'FY25E', v: 28.0 }],
    inputs: [
      { company: 'Uranium suppliers', what: 'Nuclear fuel — low-cost, long-term contracts', valueB: 1.8, status: 'realized', date: 'Ongoing' },
      { company: 'Calpine (JV / acquired assets)', what: 'Gas peaker & CCGT fleet', valueB: 2.1, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'Amazon AWS', what: 'Comanche Peak nuclear PPA — 1,200MW, 20-year deal', valueB: 1.6, status: 'committed', date: '2026–2046' },
      { company: 'CyrusOne', what: 'Freestone Energy Center — 760MW campus co-location', valueB: 0.9, status: 'committed', date: '2026–2030' },
      { company: 'Grid power (PJM / ERCOT)', what: 'Merchant nuclear + gas power sales', valueB: 22.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(295, 7.8, 34.6, 22),
  },

  // ── L1 Physical DC / Tooling ─────────────────────────────────────────
  {
    id: 'digital_realty', name: 'Digital Realty', ticker: 'DLR', layer: 1, row: 0, type: 'public',
    price: 175, change30d: 3.8, change6m: 14.2, marketCapB: 53,
    revenue: [{ y: 'FY22', v: 4.7 }, { y: 'FY23', v: 5.5 }, { y: 'FY24', v: 5.9 }, { y: 'FY25E', v: 6.5 }],
    inputs: [
      { company: 'Eaton / Vertiv / Schneider', what: 'Power & cooling equipment for facilities', valueB: 2.1, status: 'committed', date: '2025–2027' },
      { company: 'Construction / real estate', what: 'Land, build-out, fit-out capex', valueB: 3.5, status: 'committed', date: '2025–2027' },
    ],
    outputs: [
      { company: 'Microsoft Azure', what: 'Colo DC capacity — Northern Virginia, Dublin', valueB: 1.8, status: 'committed', date: '2025–2028' },
      { company: 'Amazon AWS', what: 'Colo DC capacity — multiple regions', valueB: 1.4, status: 'realized', date: 'Ongoing' },
      { company: 'Oracle OCI', what: 'Colo in key OCI expansion markets', valueB: 0.9, status: 'committed', date: '2026–2028' },
    ],
    spark: genSpark(175, 3.8, 14.2, 4),
  },
  {
    id: 'equinix', name: 'Equinix', ticker: 'EQIX', layer: 1, row: 1, type: 'public',
    price: 900, change30d: 5.1, change6m: 19.7, marketCapB: 85,
    revenue: [{ y: 'FY22', v: 7.3 }, { y: 'FY23', v: 8.2 }, { y: 'FY24', v: 8.8 }, { y: 'FY25E', v: 9.4 }],
    inputs: [
      { company: 'Power utilities', what: 'Grid power — largest single cost item', valueB: 2.1, status: 'realized', date: 'Ongoing' },
      { company: 'Vertiv / Schneider', what: 'Power & cooling infrastructure for IBX', valueB: 0.9, status: 'committed', date: '2025–2027' },
    ],
    outputs: [
      { company: 'Microsoft / Google / AWS', what: 'Interconnection & colo for peering/edge', valueB: 3.2, status: 'realized', date: 'Ongoing' },
      { company: 'Enterprise customers', what: 'IBX colocation — 10,000+ customers', valueB: 5.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(900, 5.1, 19.7, 5),
  },
  {
    id: 'asml', name: 'ASML', ticker: 'ASML', layer: 1, row: 2, type: 'public',
    price: 750, change30d: 7.5, change6m: 18.3, marketCapB: 310,
    revenue: [{ y: 'FY22', v: 21.2 }, { y: 'FY23', v: 27.6 }, { y: 'FY24', v: 28.3 }, { y: 'FY25E', v: 36.0 }],
    inputs: [
      { company: 'Carl Zeiss (optics)', what: 'Lens systems for EUV/High-NA EUV', valueB: 1.8, status: 'committed', date: '2025–2030' },
      { company: 'Cymer (captive)', what: 'EUV light source — wholly owned subsidiary', valueB: 0.9, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'TSMC', what: 'EUV & High-NA EUV lithography — ~40% of revenue', valueB: 11.5, status: 'committed', date: '2025–2028' },
      { company: 'Samsung / Intel', what: 'EUV systems — ~35% of revenue', valueB: 9.8, status: 'committed', date: '2025–2027' },
    ],
    spark: genSpark(750, 7.5, 18.3, 6),
  },

  // ── L2 Silicon Supply ─────────────────────────────────────────────────
  {
    id: 'tsmc', name: 'TSMC', ticker: 'TSM', layer: 2, row: 0, type: 'public',
    price: 185, change30d: 9.4, change6m: 26.1, marketCapB: 960,
    revenue: [{ y: 'FY22', v: 75.9 }, { y: 'FY23', v: 69.3 }, { y: 'FY24', v: 88.0 }, { y: 'FY25E', v: 110.0 }],
    inputs: [
      { company: 'ASML', what: 'EUV lithography (N3/N2 nodes)', valueB: 11.5, status: 'committed', date: '2025–2028' },
      { company: 'Applied Materials / Lam', what: 'Deposition, etch, CMP tools', valueB: 8.0, status: 'realized', date: 'Ongoing' },
      { company: 'SK Hynix / Micron', what: 'HBM dies for CoWoS integration', valueB: 4.5, status: 'committed', date: '2025–2027' },
    ],
    outputs: [
      { company: 'NVIDIA', what: 'N4P wafers + CoWoS packaging (B200/B300) — ~28% of revenue', valueB: 28.0, status: 'committed', date: '2025–2027' },
      { company: 'AMD', what: 'N4P GPU dies (MI300X/MI350X)', valueB: 6.0, status: 'committed', date: '2025–2026' },
      { company: 'Apple', what: '3nm / 2nm SoC (A18/M5)', valueB: 18.0, status: 'realized', date: 'Ongoing' },
      { company: 'Broadcom / Marvell', what: 'Custom ASIC / networking chips', valueB: 5.5, status: 'committed', date: '2025–2026' },
    ],
    spark: genSpark(185, 9.4, 26.1, 7),
  },
  {
    id: 'sk_hynix', name: 'SK Hynix', ticker: '000660.KS', layer: 2, row: 1, type: 'public',
    price: 190000, change30d: 8.3, change6m: 31.2, marketCapB: 138,
    revenue: [{ y: 'FY22', v: 34.9 }, { y: 'FY23', v: 22.8 }, { y: 'FY24', v: 45.0 }, { y: 'FY25E', v: 62.0 }],
    priceLabel: '₩190,000',
    inputs: [
      { company: 'TSMC / Samsung fabs', what: 'Logic chips for HBM controller dies', valueB: 2.5, status: 'committed', date: '2025–2027' },
      { company: 'Equipment vendors', what: 'Memory lithography, stacking tools', valueB: 3.8, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'NVIDIA', what: 'HBM3e for H100 / B200 / B300 (>60% share)', valueB: 14.0, status: 'committed', date: '2025–2027' },
      { company: 'AMD', what: 'HBM3e for MI300X / MI350X', valueB: 3.0, status: 'committed', date: '2025–2026' },
      { company: 'Google (TPU)', what: 'HBM for TPU v5/v6', valueB: 1.8, status: 'committed', date: '2025–2026' },
    ],
    spark: genSpark(190000, 8.3, 31.2, 8),
  },
  {
    id: 'micron', name: 'Micron', ticker: 'MU', layer: 2, row: 2, type: 'public',
    price: 110, change30d: 5.8, change6m: 22.5, marketCapB: 122,
    revenue: [{ y: 'FY22', v: 30.8 }, { y: 'FY23', v: 15.5 }, { y: 'FY24', v: 25.1 }, { y: 'FY25E', v: 38.0 }],
    inputs: [
      { company: 'Equipment vendors', what: 'Litho, etch, CMP for DRAM/NAND', valueB: 4.2, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'NVIDIA', what: 'HBM3e — ~30% of NVIDIA allocation', valueB: 4.0, status: 'committed', date: '2025–2027' },
      { company: 'AMD', what: 'HBM for GPU memory', valueB: 1.2, status: 'committed', date: '2025–2026' },
      { company: 'PC / Mobile / Storage', what: 'DRAM and NAND for non-AI end markets', valueB: 18.5, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(110, 5.8, 22.5, 9),
  },

  // ── L3 AI Silicon ─────────────────────────────────────────────────────
  {
    id: 'nvidia', name: 'NVIDIA', ticker: 'NVDA', layer: 3, row: 0, type: 'public',
    price: 135, change30d: 14.8, change6m: 45.2, marketCapB: 3300,
    revenue: [{ y: 'FY23', v: 26.9 }, { y: 'FY24', v: 60.9 }, { y: 'FY25', v: 130.5 }, { y: 'FY26E', v: 195.0 }],
    inputs: [
      { company: 'TSMC', what: 'CoWoS packaging + N4P GPU dies (B200/B300)', valueB: 28.0, status: 'committed', date: '2025–2027' },
      { company: 'SK Hynix', what: 'HBM3e — primary supplier (>60% allocation)', valueB: 14.0, status: 'committed', date: '2025–2027' },
      { company: 'Micron', what: 'HBM3e — secondary supplier (~30% allocation)', valueB: 4.0, status: 'committed', date: '2025–2027' },
    ],
    outputs: [
      { company: 'Microsoft Azure', what: 'GB200 NVL72 / B300 systems — largest customer', valueB: 18.0, status: 'committed', date: '2025–2027' },
      { company: 'Amazon AWS', what: 'B200 / GB300 for EC2 P6 / UltraServers', valueB: 15.0, status: 'committed', date: '2025–2027' },
      { company: 'Google GCP', what: 'B200 / GB300 for GCE A3 Ultra', valueB: 9.0, status: 'committed', date: '2025–2026' },
      { company: 'Oracle OCI', what: 'GB200 NVL72 SuperClusters', valueB: 7.0, status: 'committed', date: '2025–2027' },
      { company: 'Networking (NVLink/Spectrum)', what: 'InfiniBand & NVLink switching revenue', valueB: 15.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(135, 14.8, 45.2, 10),
  },
  {
    id: 'amd', name: 'AMD', ticker: 'AMD', layer: 3, row: 1, type: 'public',
    price: 165, change30d: 8.2, change6m: 12.4, marketCapB: 267,
    revenue: [{ y: 'FY22', v: 23.6 }, { y: 'FY23', v: 22.7 }, { y: 'FY24', v: 25.8 }, { y: 'FY25E', v: 34.6 }],
    inputs: [
      { company: 'TSMC', what: 'N4P GPU dies (MI300X / MI350X CDNA4)', valueB: 6.0, status: 'committed', date: '2025–2026' },
      { company: 'SK Hynix / Micron', what: 'HBM3e for MI300X / MI350X', valueB: 4.2, status: 'committed', date: '2025–2026' },
    ],
    outputs: [
      { company: 'Microsoft Azure', what: 'MI300X / MI350X for Azure AI — ROCm inference', valueB: 3.0, status: 'committed', date: '2025–2026' },
      { company: 'Meta', what: 'MI300X for inference fleet expansion', valueB: 1.8, status: 'committed', date: '2025' },
      { company: 'EPYC CPUs (cloud)', what: 'EPYC to AWS/Azure/GCP — #1 cloud CPU share', valueB: 5.5, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(165, 8.2, 12.4, 11),
  },
  {
    id: 'broadcom', name: 'Broadcom', ticker: 'AVGO', layer: 3, row: 2, type: 'public',
    price: 250, change30d: 11.4, change6m: 52.3, marketCapB: 1170,
    revenue: [{ y: 'FY22', v: 33.2 }, { y: 'FY23', v: 35.8 }, { y: 'FY24', v: 51.6 }, { y: 'FY25E', v: 69.0 }],
    inputs: [
      { company: 'TSMC', what: 'N3/N4 wafers for XPU / networking ASICs', valueB: 4.0, status: 'committed', date: '2025–2027' },
    ],
    outputs: [
      { company: 'Google', what: 'TPU v5/v6 ASIC design (revenue share model)', valueB: 9.0, status: 'committed', date: '2025–2028' },
      { company: 'Meta', what: 'MTIA v2 custom inference ASIC', valueB: 3.5, status: 'committed', date: '2025–2026' },
      { company: 'Apple', what: 'WiFi / Bluetooth / networking chips', valueB: 8.0, status: 'realized', date: 'Ongoing' },
      { company: 'VMware (captive)', what: 'Software — private cloud / VCSP revenue', valueB: 14.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(250, 11.4, 52.3, 12),
  },
  {
    id: 'marvell', name: 'Marvell', ticker: 'MRVL', layer: 3, row: 3, type: 'public',
    price: 95, change30d: 13.2, change6m: 47.8, marketCapB: 83,
    revenue: [{ y: 'FY23', v: 5.9 }, { y: 'FY24', v: 5.5 }, { y: 'FY25', v: 7.2 }, { y: 'FY26E', v: 11.5 }],
    inputs: [
      { company: 'TSMC', what: 'N3/N5 wafers for custom ASIC silicon', valueB: 1.5, status: 'committed', date: '2025–2027' },
    ],
    outputs: [
      { company: 'Amazon AWS', what: 'Trainium3 / Inferentia chip architecture (design partner)', valueB: 2.0, status: 'committed', date: '2025–2027' },
      { company: 'Microsoft Azure', what: 'Maia 2 ASIC design collaboration', valueB: 1.2, status: 'committed', date: '2025–2026' },
      { company: 'Optical / networking', what: 'DC interconnect silicon (non-AI)', valueB: 4.5, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(95, 13.2, 47.8, 13),
  },

  // ── L4 Cloud & Neo-Cloud ──────────────────────────────────────────────
  {
    id: 'microsoft', name: 'Microsoft Azure', ticker: 'MSFT', layer: 4, row: 0, type: 'public',
    price: 470, change30d: 5.1, change6m: 18.3, marketCapB: 3500,
    revenue: [{ y: 'FY23', v: 87.9 }, { y: 'FY24', v: 107.5 }, { y: 'FY25E', v: 132.0 }, { y: 'FY26E', v: 165.0 }],
    revenueNote: 'Total MSFT revenue; Azure ~53%',
    inputs: [
      { company: 'NVIDIA', what: 'GB200 NVL72 / B300 GPU cluster procurement', valueB: 18.0, status: 'committed', date: '2025–2027' },
      { company: 'Digital Realty / Equinix', what: 'Colo DC capacity in constrained markets', valueB: 2.9, status: 'committed', date: '2025–2028' },
      { company: 'Eaton / Vertiv', what: 'On-site power & liquid cooling systems', valueB: 2.5, status: 'committed', date: '2025–2027' },
      { company: 'Marvell (Maia 2)', what: 'Custom ASIC for Azure AI inference', valueB: 1.2, status: 'committed', date: '2025–2026' },
    ],
    outputs: [
      { company: 'OpenAI', what: 'Compute for GPT-4o / o3 training & API — $13B committed', valueB: 13.0, status: 'committed', date: '2025–2030' },
      { company: 'Enterprise Azure customers', what: 'Azure AI Studio, Copilot, cloud services', valueB: 40.0, status: 'realized', date: 'Ongoing' },
      { company: 'GitHub Copilot', what: 'AI coding — 1.8M paid seats, $2B ARR', valueB: 2.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(470, 5.1, 18.3, 14),
  },
  {
    id: 'amazon', name: 'Amazon AWS', ticker: 'AMZN', layer: 4, row: 1, type: 'public',
    price: 230, change30d: 4.8, change6m: 21.5, marketCapB: 2400,
    revenue: [{ y: 'FY23', v: 90.8 }, { y: 'FY24', v: 107.6 }, { y: 'FY25E', v: 130.0 }],
    revenueNote: 'AWS segment revenue only',
    inputs: [
      { company: 'NVIDIA', what: 'B200 / GB300 for EC2 P6 / UltraServers', valueB: 15.0, status: 'committed', date: '2025–2027' },
      { company: 'Marvell', what: 'Trainium3 / Inferentia3 ASIC design', valueB: 2.0, status: 'committed', date: '2025–2027' },
      { company: 'Digital Realty', what: 'Colo DC capacity — Northern Virginia, APAC', valueB: 1.4, status: 'realized', date: 'Ongoing' },
    ],
    outputs: [
      { company: 'Anthropic', what: 'AWS Bedrock primary cloud + $4B investment', valueB: 4.0, status: 'committed', date: '2025–2030' },
      { company: 'Enterprise AWS customers', what: 'EC2, S3, SageMaker — broad cloud portfolio', valueB: 95.0, status: 'realized', date: 'Ongoing' },
      { company: 'Bedrock AI API', what: 'Multi-model API (Claude, Llama, Titan)', valueB: 5.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(230, 4.8, 21.5, 15),
  },
  {
    id: 'google', name: 'Google GCP', ticker: 'GOOGL', layer: 4, row: 2, type: 'public',
    price: 195, change30d: 6.3, change6m: 24.7, marketCapB: 2400,
    revenue: [{ y: 'FY23', v: 33.1 }, { y: 'FY24', v: 43.2 }, { y: 'FY25E', v: 58.0 }],
    revenueNote: 'GCP segment revenue only',
    inputs: [
      { company: 'NVIDIA', what: 'B200 / GB300 for GCE A3 Ultra instances', valueB: 9.0, status: 'committed', date: '2025–2026' },
      { company: 'Broadcom', what: 'TPU v5 / v6 ASIC design (revenue share)', valueB: 9.0, status: 'committed', date: '2025–2028' },
      { company: 'SK Hynix', what: 'HBM for TPU pods', valueB: 1.8, status: 'committed', date: '2025–2026' },
    ],
    outputs: [
      { company: 'Anthropic', what: 'GCP Vertex AI compute + $2B investment', valueB: 2.0, status: 'committed', date: '2025–2030' },
      { company: 'Enterprise GCP', what: 'Vertex AI, BigQuery, Workspace AI', valueB: 45.0, status: 'realized', date: 'Ongoing' },
      { company: 'Google DeepMind (internal)', what: 'Internal Gemini / AlphaCode training compute', valueB: 12.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(195, 6.3, 24.7, 16),
  },
  {
    id: 'oracle', name: 'Oracle OCI', ticker: 'ORCL', layer: 4, row: 3, type: 'public',
    price: 165, change30d: 8.9, change6m: 29.4, marketCapB: 458,
    revenue: [{ y: 'FY23', v: 19.8 }, { y: 'FY24', v: 22.4 }, { y: 'FY25E', v: 27.5 }],
    revenueNote: 'Total Oracle revenue; OCI ~25%',
    inputs: [
      { company: 'NVIDIA', what: 'GB200 NVL72 SuperClusters — 65,000+ GPUs', valueB: 7.0, status: 'committed', date: '2025–2027' },
      { company: 'Digital Realty', what: 'Colo capacity for OCI expansion regions', valueB: 0.9, status: 'committed', date: '2026–2028' },
    ],
    outputs: [
      { company: 'OpenAI', what: 'Stargate project — dedicated OCI AI cluster', valueB: 6.5, status: 'committed', date: '2025–2028' },
      { company: 'Enterprise OCI customers', what: 'Database, cloud services', valueB: 18.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(165, 8.9, 29.4, 17),
  },

  // ── L5 Foundation Models ──────────────────────────────────────────────
  {
    id: 'openai', name: 'OpenAI', ticker: 'Private', layer: 5, row: 0, type: 'private',
    price: 157, change30d: 0, change6m: 50, marketCapB: 157,
    priceLabel: '$157B valuation',
    revenue: [{ y: 'ARR H2\'23', v: 1.6 }, { y: 'ARR 2024', v: 3.7 }, { y: 'ARR H1\'25', v: 10.0 }, { y: 'ARR 2025E', v: 18.0 }],
    revenueNote: 'Annualised revenue run-rate ($B)',
    inputs: [
      { company: 'Microsoft Azure', what: 'Training compute — dedicated Azure capacity', valueB: 13.0, status: 'committed', date: '2025–2030' },
      { company: 'Oracle OCI', what: 'Stargate AI training cluster', valueB: 6.5, status: 'committed', date: '2025–2028' },
    ],
    outputs: [
      { company: 'ChatGPT (consumers)', what: 'Plus/Pro subscriptions — 300M MAU', valueB: 5.0, status: 'realized', date: 'Ongoing' },
      { company: 'API (developers)', what: 'GPT-4o, o3 API, Assistants API', valueB: 9.0, status: 'realized', date: 'Ongoing' },
      { company: 'Enterprise ChatGPT', what: 'Enterprise licenses — 2M+ seats', valueB: 4.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(157, 0, 50, 18),
  },
  {
    id: 'anthropic', name: 'Anthropic', ticker: 'Private', layer: 5, row: 1, type: 'private',
    price: 61, change30d: 0, change6m: 22, marketCapB: 61,
    priceLabel: '$61B valuation',
    revenue: [{ y: 'ARR 2023', v: 0.1 }, { y: 'ARR 2024', v: 1.0 }, { y: 'ARR H1\'25', v: 3.0 }, { y: 'ARR 2025E', v: 5.5 }],
    revenueNote: 'Annualised revenue run-rate ($B)',
    inputs: [
      { company: 'Amazon AWS', what: 'AWS Bedrock primary cloud + $4B investment', valueB: 4.0, status: 'committed', date: '2025–2030' },
      { company: 'Google GCP', what: 'GCP Vertex AI compute + $2B investment', valueB: 2.0, status: 'committed', date: '2025–2030' },
    ],
    outputs: [
      { company: 'AWS Bedrock', what: 'Claude 3.5 / Claude 4 via Bedrock API', valueB: 1.8, status: 'realized', date: 'Ongoing' },
      { company: 'Google Vertex AI', what: 'Claude on Vertex AI', valueB: 0.8, status: 'realized', date: 'Ongoing' },
      { company: 'Enterprise direct', what: 'claude.ai Teams / Enterprise, direct API', valueB: 2.5, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(61, 0, 22, 19),
  },
  {
    id: 'meta_ai', name: 'Meta AI', ticker: 'META', layer: 5, row: 2, type: 'public',
    price: 650, change30d: 7.2, change6m: 33.8, marketCapB: 1650,
    revenue: [{ y: 'FY23', v: 134.9 }, { y: 'FY24', v: 164.5 }, { y: 'FY25E', v: 195.0 }],
    revenueNote: 'Total Meta revenue (advertising driven)',
    inputs: [
      { company: 'NVIDIA', what: 'H100 / B200 fleet — 350,000+ GPUs deployed', valueB: 12.0, status: 'realized', date: 'Ongoing' },
      { company: 'AMD', what: 'MI300X for inference fleet augmentation', valueB: 1.8, status: 'committed', date: '2025' },
      { company: 'Broadcom', what: 'MTIA v2 custom inference ASIC', valueB: 3.5, status: 'committed', date: '2025–2026' },
    ],
    outputs: [
      { company: 'Llama (open-source)', what: 'Llama 3.x / Llama 4 — free, drives ecosystem lock-in', valueB: 0, status: 'realized', date: 'Ongoing' },
      { company: 'Meta Advertising', what: 'AI-enhanced ad targeting — core revenue engine', valueB: 160.0, status: 'realized', date: 'Ongoing' },
      { company: 'Meta AI Assistant', what: 'WhatsApp / Instagram / Facebook AI features', valueB: 3.0, status: 'realized', date: 'Ongoing' },
    ],
    spark: genSpark(650, 7.2, 33.8, 20),
  },
]

// Edges: { source, target, valueB, label }
// strokeWidth will be derived from valueB
export const EDGES = [
  // L0 → L1
  { source: 'bloom',         target: 'equinix',        valueB: 0.3,  label: 'BTM fuel cells — colo power' },
  { source: 'constellation', target: 'digital_realty', valueB: 0.5,  label: 'Nuclear PPA — DC power supply' },

  // L0 → L4 (direct BTM power to hyperscaler self-build DCs)
  { source: 'bloom',         target: 'oracle',         valueB: 0.4,  label: 'Fuel cells — NM Stargate BTM' },
  { source: 'constellation', target: 'amazon',         valueB: 1.6,  label: 'Comanche Peak — 1.2GW nuclear PPA' },

  { source: 'eaton',     target: 'digital_realty', valueB: 0.9,  label: 'UPS, switchgear' },
  { source: 'eaton',     target: 'equinix',        valueB: 0.6,  label: 'PDU, power mgmt' },
  { source: 'vertiv',    target: 'digital_realty', valueB: 1.2,  label: 'Liquid cooling systems' },
  { source: 'vertiv',    target: 'equinix',        valueB: 0.9,  label: 'Thermal mgmt' },
  { source: 'schneider', target: 'digital_realty', valueB: 0.8,  label: 'EcoStruxure DC mgmt' },
  { source: 'schneider', target: 'equinix',        valueB: 0.5,  label: 'Power distribution' },

  // L1 → L2
  { source: 'asml',      target: 'tsmc',           valueB: 11.5, label: 'EUV / High-NA EUV systems' },

  // L1 → L4 (DC hosting)
  { source: 'digital_realty', target: 'microsoft', valueB: 1.8,  label: 'Colo DC capacity' },
  { source: 'digital_realty', target: 'amazon',    valueB: 1.4,  label: 'Colo DC capacity' },
  { source: 'digital_realty', target: 'oracle',    valueB: 0.9,  label: 'Colo — OCI expansion' },
  { source: 'equinix',   target: 'microsoft',      valueB: 1.1,  label: 'Interconnect & colo' },
  { source: 'equinix',   target: 'google',         valueB: 0.8,  label: 'Peering & IBX colo' },

  // L2 → L3 (HBM + wafers to GPU makers)
  { source: 'tsmc',      target: 'nvidia',         valueB: 28.0, label: 'CoWoS + N4P wafers' },
  { source: 'tsmc',      target: 'amd',            valueB: 6.0,  label: 'N4P GPU dies' },
  { source: 'tsmc',      target: 'broadcom',       valueB: 4.0,  label: 'N3/N4 ASIC wafers' },
  { source: 'tsmc',      target: 'marvell',        valueB: 1.5,  label: 'N5 networking silicon' },
  { source: 'sk_hynix',  target: 'nvidia',         valueB: 14.0, label: 'HBM3e (>60% share)' },
  { source: 'sk_hynix',  target: 'amd',            valueB: 3.0,  label: 'HBM3e MI300X/MI350X' },
  { source: 'sk_hynix',  target: 'google',         valueB: 1.8,  label: 'HBM for TPU v5/v6' },
  { source: 'micron',    target: 'nvidia',         valueB: 4.0,  label: 'HBM3e (~30% share)' },
  { source: 'micron',    target: 'amd',            valueB: 1.2,  label: 'HBM memory' },

  // L3 → L4 (GPU supply to hyperscalers)
  { source: 'nvidia',    target: 'microsoft',      valueB: 18.0, label: 'GB200/B300 clusters' },
  { source: 'nvidia',    target: 'amazon',         valueB: 15.0, label: 'B200 / GB300 P6' },
  { source: 'nvidia',    target: 'google',         valueB: 9.0,  label: 'B200 / GB300 A3 Ultra' },
  { source: 'nvidia',    target: 'oracle',         valueB: 7.0,  label: 'GB200 NVL72 SuperCluster' },
  { source: 'nvidia',    target: 'meta_ai',        valueB: 12.0, label: 'H100/B200 fleet (350K+)' },
  { source: 'amd',       target: 'microsoft',      valueB: 3.0,  label: 'MI350X Azure AI' },
  { source: 'amd',       target: 'meta_ai',        valueB: 1.8,  label: 'MI300X inference fleet' },
  { source: 'broadcom',  target: 'google',         valueB: 9.0,  label: 'TPU v5/v6 ASIC' },
  { source: 'broadcom',  target: 'meta_ai',        valueB: 3.5,  label: 'MTIA v2 inference ASIC' },
  { source: 'marvell',   target: 'amazon',         valueB: 2.0,  label: 'Trainium3 architecture' },
  { source: 'marvell',   target: 'microsoft',      valueB: 1.2,  label: 'Maia 2 ASIC design' },

  // L4 → L5 (cloud compute to AI labs)
  { source: 'microsoft', target: 'openai',         valueB: 13.0, label: 'Dedicated Azure capacity' },
  { source: 'oracle',    target: 'openai',         valueB: 6.5,  label: 'Stargate OCI cluster' },
  { source: 'amazon',    target: 'anthropic',      valueB: 4.0,  label: 'AWS Bedrock + $4B invest' },
  { source: 'google',    target: 'anthropic',      valueB: 2.0,  label: 'GCP Vertex + $2B invest' },
]
