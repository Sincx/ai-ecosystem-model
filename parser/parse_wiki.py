"""
parse_wiki.py — reads ai-tech wiki markdown files and writes structured JSON
to C:/LLM wiki/web/data/ for consumption by the React app.

Run from any directory:
    python "C:/LLM wiki/web/parser/parse_wiki.py"
"""

import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

WIKI_DIR   = Path("C:/Users/Mike/Documents/Fred/Fred/wiki/ai-tech")
MODELS_DIR = Path("C:/Users/Mike/Documents/Fred/Fred/wiki/finance/models")
OUT_DIR    = Path("C:/LLM wiki/web/app/public/data")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_frontmatter(text):
    """Return (meta_dict, body_text) from a markdown file with YAML frontmatter."""
    meta = {}
    body = text
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            for line in parts[1].splitlines():
                if ":" in line:
                    k, _, v = line.partition(":")
                    meta[k.strip()] = v.strip().strip('"')
            body = parts[2]
    return meta, body


def parse_md_table(block):
    """Parse a markdown table block into list-of-dicts. Skips separator rows."""
    rows = [r for r in block.strip().splitlines() if r.strip().startswith("|")]
    if len(rows) < 2:
        return []
    headers = [h.strip().strip("*") for h in rows[0].split("|")[1:-1]]
    data = []
    for row in rows[2:]:          # skip separator
        cells = [c.strip() for c in row.split("|")[1:-1]]
        if len(cells) == len(headers):
            data.append(dict(zip(headers, cells)))
    return data


def clean_value(v):
    """Strip markdown bold/italic markers and return a clean string."""
    return re.sub(r'\*+', '', v).strip()


def extract_tables(body):
    """Return list of (heading, table_rows) tuples from a markdown body."""
    results = []
    current_heading = "General"
    table_lines = []
    in_table = False

    for line in body.splitlines():
        h = re.match(r'^#{1,4}\s+(.*)', line)
        if h:
            if in_table and table_lines:
                results.append((current_heading, parse_md_table("\n".join(table_lines))))
                table_lines = []
                in_table = False
            current_heading = h.group(1).strip()
        elif line.strip().startswith("|"):
            in_table = True
            table_lines.append(line)
        else:
            if in_table and table_lines:
                results.append((current_heading, parse_md_table("\n".join(table_lines))))
                table_lines = []
                in_table = False

    if in_table and table_lines:
        results.append((current_heading, parse_md_table("\n".join(table_lines))))

    return results


def extract_oneliner(body):
    """Pull the blockquote one-liner summary."""
    m = re.search(r'^>\s*\*\*One-line:\*\*\s*(.*)', body, re.MULTILINE)
    if m:
        return m.group(1).strip()
    m = re.search(r'^>\s*(.*)', body, re.MULTILINE)
    return m.group(1).strip() if m else ""


# ---------------------------------------------------------------------------
# Entity catalogue — maps wiki slug patterns to entity definitions
# ---------------------------------------------------------------------------

ENTITIES = {
    "nvidia":    {"name": "NVIDIA",          "ticker": "NVDA", "layer": "L3", "tier": 2},
    "tsmc":      {"name": "TSMC",            "ticker": "TSM",  "layer": "L2", "tier": 1},
    "sk-hynix":  {"name": "SK Hynix",        "ticker": "000660.KS", "layer": "L2", "tier": 1},
    "microsoft": {"name": "Microsoft Azure", "ticker": "MSFT", "layer": "L4", "tier": 1},
    "aws":       {"name": "Amazon AWS",      "ticker": "AMZN", "layer": "L4", "tier": 2},
    "google":    {"name": "Google GCP",      "ticker": "GOOGL","layer": "L4", "tier": 2},
    "oracle":    {"name": "Oracle OCI",      "ticker": "ORCL", "layer": "L4", "tier": 2},
    "broadcom":  {"name": "Broadcom",        "ticker": "AVGO", "layer": "L3", "tier": 2},
    "micron":    {"name": "Micron",          "ticker": "MU",   "layer": "L2", "tier": 2},
    "eaton":     {"name": "Eaton",           "ticker": "ETN",  "layer": "L0", "tier": 1},
    "ge-vernova":{"name": "GE Vernova",      "ticker": "GEV",  "layer": "L0", "tier": 2},
    "quanta":    {"name": "Quanta Services", "ticker": "PWR",  "layer": "L0", "tier": 3},
    "vertiv":    {"name": "Vertiv",          "ticker": "VRT",  "layer": "L0", "tier": 2},
    "coreweave": {"name": "CoreWeave",       "ticker": "CRWV", "layer": "L4", "tier": 3},
    "amd":       {"name": "AMD",             "ticker": "AMD",  "layer": "L3", "tier": 3},
    "marvell":   {"name": "Marvell",         "ticker": "MRVL", "layer": "L3", "tier": 3},
}


# ---------------------------------------------------------------------------
# Parsers per page type
# ---------------------------------------------------------------------------

def parse_investment_signals(body, date):
    """Extract investment ranking table from the constraint-edge model file."""
    signals = []
    tables = extract_tables(body)
    for heading, rows in tables:
        if not rows:
            continue
        # Look for the investment ranking table (has Signal/Tier column)
        cols = list(rows[0].keys()) if rows else []
        col_lower = [c.lower() for c in cols]
        if any("signal" in c or "tier" in c or "investment" in c for c in col_lower):
            for row in rows:
                vals = {k: clean_value(v) for k, v in row.items()}
                # Try to identify entity and signal
                entity_col = next((k for k in vals if any(x in k.lower() for x in ["entity","company","layer","subject"])), None)
                signal_col = next((k for k in vals if "signal" in k.lower()), None)
                tier_col   = next((k for k in vals if "tier" in k.lower()), None)
                if entity_col and (signal_col or tier_col):
                    signals.append({
                        "date": date,
                        "entity": vals.get(entity_col, ""),
                        "signal": vals.get(signal_col, ""),
                        "tier": vals.get(tier_col, ""),
                        "why": vals.get(next((k for k in vals if "why" in k.lower()), ""), ""),
                    })
    return signals


def parse_hyperscaler_page(body, date):
    """Extract cloud revenue, capex, and growth metrics."""
    snapshots = []
    tables = extract_tables(body)
    for heading, rows in tables:
        if not rows:
            continue
        cols = list(rows[0].keys())
        col_lower = [c.lower() for c in cols]
        if any("revenue" in c or "capex" in c or "growth" in c for c in col_lower):
            for row in rows:
                vals = {k: clean_value(v) for k, v in row.items()}
                provider_col = next((k for k in vals if any(x in k.lower() for x in ["provider","company","cloud"])), None)
                if provider_col and vals.get(provider_col, "").strip():
                    snapshots.append({"date": date, "heading": heading, **vals})
    return snapshots


def parse_hbm_page(body, date):
    """Extract HBM market share and capacity metrics."""
    snapshots = []
    tables = extract_tables(body)
    for heading, rows in tables:
        if not rows:
            continue
        for row in rows:
            vals = {k: clean_value(v) for k, v in row.items()}
            snapshots.append({"date": date, "heading": heading, **vals})
    return snapshots


# ---------------------------------------------------------------------------
# Layer stack definition (static — derived from model design)
# ---------------------------------------------------------------------------

LAYER_STACK = [
    {
        "id": "L0",
        "name": "Power & Cooling",
        "description": "Electricity generation, transformers, switchgear, liquid cooling. 2.5–3.5 year lead time from order to compute availability.",
        "constraint": "Transformer lead times 80–100 weeks; gas turbine 36–48 months. CoWoS and HBM cannot be installed until power is available.",
        "entities": ["Eaton (ETN)", "GE Vernova (GEV)", "Quanta Services (PWR)", "Vertiv (VRT)", "Siemens Energy", "ABB"],
        "color": "#f59e0b",
    },
    {
        "id": "L1",
        "name": "Physical Data Centre",
        "description": "DC construction, real estate, network infrastructure, cooling systems deployment.",
        "constraint": "18–24 month construction cycle; power availability gates groundbreak; zoning approvals add 6–12 months.",
        "entities": ["Digital Realty", "Equinix", "Hyperscaler-owned DCs", "Compass", "QTS"],
        "color": "#f97316",
    },
    {
        "id": "L2",
        "name": "HBM + CoWoS Packaging",
        "description": "High-Bandwidth Memory (HBM3E → HBM4) physically integrated with GPU dies via TSMC CoWoS packaging. Single-point-of-failure for GPU supply.",
        "constraint": "TSMC CoWoS is the only viable advanced packaging vendor. NVIDIA holds >60% of 2026 CoWoS slots. HBM supply controlled by SK Hynix (58% share).",
        "entities": ["TSMC (TSM)", "SK Hynix (000660.KS)", "Samsung", "Micron (MU)"],
        "color": "#8b5cf6",
    },
    {
        "id": "L3",
        "name": "AI Silicon",
        "description": "GPU accelerators (NVIDIA, AMD) and custom ASICs (Broadcom/Marvell for hyperscaler XPUs). All manufactured at TSMC.",
        "constraint": "NVIDIA holds $1tr in purchase orders. Broadcom ASIC at +44.6% CAGR taking inference share. AMD constrained by CUDA moat and CoWoS allocation (~8%).",
        "entities": ["NVIDIA (NVDA)", "Broadcom (AVGO)", "AMD (AMD)", "Marvell (MRVL)", "Google TPU", "Amazon Trainium", "Microsoft Maia"],
        "color": "#06b6d4",
    },
    {
        "id": "L4",
        "name": "Cloud & Neo-Cloud",
        "description": "Hyperscalers (Azure, AWS, GCP, Oracle OCI) and neo-clouds (CoreWeave, Lambda) that rent GPU compute to enterprises and foundation model companies.",
        "constraint": "~$650B/year capex deployed here. CoreWeave $22B GPU-collateralised debt = binary tail risk. Oracle $638B RPO backlog locks in future revenue.",
        "entities": ["Microsoft Azure (MSFT)", "Amazon AWS (AMZN)", "Google GCP (GOOGL)", "Oracle OCI (ORCL)", "CoreWeave (CRWV)", "Lambda Labs"],
        "color": "#10b981",
    },
    {
        "id": "L5",
        "name": "Foundation Models",
        "description": "Companies building and deploying frontier AI models. Rent compute from L4 or own it (Google, Meta). Revenue from API access, subscriptions, and enterprise contracts.",
        "constraint": "Token price deflation (−70%/year) compresses margins. Inference cost is the binding constraint on model accessibility and revenue model viability.",
        "entities": ["OpenAI", "Anthropic", "Google DeepMind", "Meta AI", "xAI", "Mistral", "DeepSeek"],
        "color": "#ec4899",
    },
]


# ---------------------------------------------------------------------------
# Investment signals — static from model (updated manually when model updates)
# ---------------------------------------------------------------------------

INVESTMENT_SIGNALS = [
    {"entity": "SK Hynix",        "ticker": "000660.KS", "layer": "L2", "tier": 1, "stars": 5, "rationale": "72% HBM operating margin; HBM4 sole-source for Rubin; no viable alternative supplier"},
    {"entity": "Eaton",           "ticker": "ETN",       "layer": "L0", "tier": 1, "stars": 5, "rationale": "$22.8B backlog; DC orders +240% YoY; HVDC Rubin partnership; 80–100 week transformer lead times lock in backlog"},
    {"entity": "TSMC",            "ticker": "TSM",       "layer": "L2", "tier": 1, "stars": 5, "rationale": "CoWoS monopoly; manufactures NVIDIA GPUs AND Broadcom ASICs; ~30% revenue growth 2026; wins regardless of GPU vs ASIC outcome"},
    {"entity": "Microsoft Azure", "ticker": "MSFT",      "layer": "L4", "tier": 1, "stars": 5, "rationale": "$13B+ AI ARR; OpenAI exclusivity; Copilot enterprise rollout; highest AI monetisation visibility of any hyperscaler"},
    {"entity": "GE Vernova",      "ticker": "GEV",       "layer": "L0", "tier": 2, "stars": 4, "rationale": "$163B backlog; gas turbine 100GW pipeline; DC Electrification orders in Q1 2026 exceeded all of 2025"},
    {"entity": "NVIDIA",          "ticker": "NVDA",      "layer": "L3", "tier": 2, "stars": 4, "rationale": "$1tr purchase orders; B300 now shipping; Rubin R100 sampling Q4 2026. Risk: inference ASIC substitution 2027–2028"},
    {"entity": "Amazon AWS",      "ticker": "AMZN",      "layer": "L4", "tier": 2, "stars": 4, "rationale": "$29B AI ARR; Trainium custom silicon reducing GPU dependency; broadest enterprise base"},
    {"entity": "Oracle OCI",      "ticker": "ORCL",      "layer": "L4", "tier": 2, "stars": 4, "rationale": "$638B RPO (+363% YoY); Stargate $300B partnership; fastest-growing hyperscaler at 77% IaaS growth"},
    {"entity": "Micron",          "ticker": "MU",        "layer": "L2", "tier": 2, "stars": 4, "rationale": "21% HBM share growing; sole US-listed HBM play; HBM4 ramp 2026–2027; beneficiary of SK Hynix capacity constraints"},
    {"entity": "Broadcom",        "ticker": "AVGO",      "layer": "L3", "tier": 2, "stars": 4, "rationale": "$8.4B Q1 AI revenue (+106%); $73B backlog; 70% ASIC market share; $100B/2027 target; networking silicon also growing"},
    {"entity": "Quanta Services", "ticker": "PWR",       "layer": "L0", "tier": 3, "stars": 3, "rationale": "$48.5B record backlog; electrical construction; AI DC build is primary driver. Risk: execution, labour"},
    {"entity": "CoreWeave",       "ticker": "CRWV",      "layer": "L4", "tier": 3, "stars": 3, "rationale": "$99.4B RPO; neo-cloud GPU rental. Binary risk: $22B+ GPU-collateralised debt; NVIDIA customer concentration. New risk (Jul 2026): Meta — CRWV's #2 customer at $35.2B — reportedly building 'Meta Compute' to resell its own excess capacity, a customer-to-competitor flip; CRWV fell 13.9% on the report"},
    {"entity": "AMD",             "ticker": "AMD",       "layer": "L3", "tier": 3, "stars": 3, "rationale": "MI350X competitive on specs; $16.6B DC revenue FY2025. Ceiling: CoWoS ~8% allocation; CUDA ecosystem moat"},
    {"entity": "Marvell",         "ticker": "MRVL",      "layer": "L3", "tier": 3, "stars": 3, "rationale": "#2 ASIC design partner ~25% share; Amazon Trainium next-gen; growing but less diversified than Broadcom"},
]


# ---------------------------------------------------------------------------
# Scenario analysis — from model
# ---------------------------------------------------------------------------

SCENARIOS = [
    {
        "name": "Base Case",
        "probability": 55,
        "description": "Elastic demand: cheaper inference → more usage → capex deployed stays ~$650B/year. Hyperscaler AI revenue compounds 35–45% through 2027. ASIC substitutes inference gradually; NVIDIA maintains training dominance. HBM supply tightens on HBM4 transition.",
        "implications": ["SK Hynix, TSMC, Eaton, Microsoft outperform", "NVIDIA inference share declines slowly", "CoreWeave debt serviceable if RPO converts"],
        "color": "#10b981",
    },
    {
        "name": "Bull Case",
        "probability": 25,
        "description": "Demand explosion: AGI-adjacent breakthrough triggers emergency capex surge. Goldman's $765B (2026) estimate proves conservative. Power equipment and HBM lead times become acute choke points. All Tier 1 and Tier 2 investments dramatically outperform.",
        "implications": ["L0 power equipment (Eaton, GEV) biggest winners — lead times extend further", "HBM spot prices spike; SK Hynix margin expands", "NVIDIA order book doubles; CoWoS queues extend to 2029"],
        "color": "#3b82f6",
    },
    {
        "name": "Bear Case",
        "probability": 20,
        "description": "Demand plateau: enterprise AI adoption stalls; hyperscaler AI revenue misses expectations; capex pulled back. ASIC substitution accelerates faster than expected. CoreWeave debt refinancing fails. Meta Compute (reported Jul 2026) launches and wins neocloud overflow share while Meta lets its ~$48B combined CoreWeave/Nebius contracts lapse — a double hit of lost anchor customer plus new competitor.",
        "implications": ["NVIDIA inference revenue collapses; GPU spot prices fall", "CoreWeave binary risk realises; contagion to GPU-collateralised credit markets", "L0 order books survive (physical infrastructure contracts, not compute contracts)", "CoreWeave/Nebius lose Meta as both customer and gain it as competitor simultaneously"],
        "color": "#ef4444",
    },
    {
        "name": "Patel 10×",
        "probability": 10,
        "description": "Compute scarcity: Lab revenues sustain ~10×/yr growth while supply caps at ~3×/yr. Margin expansion and inference allocation hit ceilings. GPU rental prices rise 10–15× ($15–25/hr H100). Startups priced out; market consolidates to 2–3 frontier labs. Token prices still fall (efficiency) but GPU-hour prices rise (scarcity). Power equipment demand accelerates.",
        "implications": ["GPU rental reprices to $15–25/hr; NVIDIA DC revenue $250–300B", "Total AI capex $1.2–1.5T/yr; power equipment biggest winners", "CoreWeave extremely bullish — compute scarcity makes GPU-collateralised debt safe", "Market structure: oligopoly of 2–3 frontier labs; mid-tier labs exit"],
        "color": "#f59e0b",
    },
    {
        "name": "Burry Bust",
        "probability": 10,
        "description": "Circular financing unwind: ~2/3 of AI trifecta spend is circular (chipmakers fund labs, labs buy chips, hyperscalers fund labs, labs buy cloud). A major lab misses revenue targets by >30%, triggering cascade. GPU spot prices fall 40–60%. GPU-collateralised debt faces collateral impairment. Chip equity sells off 30–50%. Power equipment less affected (non-cancellable order books).",
        "implications": ["GPU spot falls to $1.00–1.50/hr; NVIDIA DC revenue $90–120B", "CoreWeave restructuring — GPU-collateralised debt impaired", "Power equipment resilient on signed non-cancellable backlogs", "Key test: monitor non-circular revenue ratio across AI trifecta"],
        "color": "#7c3aed",
    },
    {
        "name": "Evans Equilibrium",
        "probability": 0,
        "description": "Token commoditisation (value-capture overlay, not a separate capex scenario): once 2025–2026 orders deliver capacity in 2027–2028, supply normalises. Competition drives token prices toward marginal cost. Value capture by layer: L0–L1 durable, L2 high near-term then normalises, L3 training durable / inference erodes, L4 moderate, L5 low (commoditised), application layer highest long-term.",
        "implications": ["L0–L1 power/DC infrastructure: sustained pricing power", "L2 HBM: pricing power while shortage persists, erodes post-2028", "L3 NVIDIA: training moat holds, inference loses to ASICs", "L5 foundation models commoditise — 'LLMs become databases'", "Application layer (above L5) captures most long-term value"],
        "color": "#64748b",
    },
]


# ---------------------------------------------------------------------------
# Constraint edges
# ---------------------------------------------------------------------------

CONSTRAINT_EDGES = [
    {"from": "L0", "to": "L1", "label": "No power = no DC. 2.5–3.5yr lag from order to compute-ready site."},
    {"from": "L1", "to": "L2", "label": "No DC = no place to install servers. Construction gates chip deployment."},
    {"from": "L2", "to": "L3", "label": "CoWoS is the packaging step that produces finished GPUs. No CoWoS = no GPU."},
    {"from": "L3", "to": "L4", "label": "No chips = no compute supply for cloud providers to sell."},
    {"from": "L4", "to": "L5", "label": "No cloud compute = no training runs. Token price at L4 sets model economics at L5."},
    {"from": "L2", "to": "L3", "label": "HBM supply constrains GPU memory bandwidth; HBM4 shortage gates Rubin R100 volume.", "secondary": True},
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def build_finance_models():
    """Scan wiki/finance/models for model-*.md pages and return full markdown
    bodies (frontmatter stripped) for client-side rendering. Unlike the ai-tech
    snapshot index, this keeps the full body — these pages are qualitative
    scenario models (bull/neutral/bear tables) too varied to flatten into a
    fixed JSON schema, so react-markdown renders them client-side instead."""
    models = []
    if not MODELS_DIR.exists():
        print(f"WARNING: Models dir not found: {MODELS_DIR}")
        return models
    for f in sorted(MODELS_DIR.glob("model-*.md"), reverse=True):
        m = re.search(r'(\d{4}-\d{2}-\d{2})\.md$', f.name)
        date = m.group(1) if m else "unknown"
        text = f.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(text)
        models.append({
            "file": f.name,
            "slug": f.stem,
            "date": date,
            "title": meta.get("title", f.stem).strip('"'),
            "tags": meta.get("tags", ""),
            "updated": meta.get("updated", date),
            "oneliner": extract_oneliner(body),
            "body": body.strip(),
        })
    return models


def build_snapshot_index():
    """Scan wiki for all dated data pages and return an index."""
    index = []
    if not WIKI_DIR.exists():
        print(f"WARNING: Wiki dir not found: {WIKI_DIR}")
        return index
    for f in sorted(WIKI_DIR.glob("data-*-*.md")):
        m = re.search(r'(\d{4}-\d{2}-\d{2})\.md$', f.name)
        date = m.group(1) if m else "unknown"
        text = f.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(text)
        index.append({
            "file": f.name,
            "date": date,
            "title": meta.get("title", f.stem),
            "tags": meta.get("tags", ""),
            "oneliner": extract_oneliner(body),
        })
    return index


def write_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  wrote {path}")


def main():
    print(f"Parser starting — wiki: {WIKI_DIR}")
    print(f"Output: {OUT_DIR}\n")

    write_json(OUT_DIR / "layer_stack.json",       LAYER_STACK)
    write_json(OUT_DIR / "investment_signals.json", INVESTMENT_SIGNALS)
    write_json(OUT_DIR / "scenarios.json",          SCENARIOS)
    write_json(OUT_DIR / "constraint_edges.json",   CONSTRAINT_EDGES)

    snapshot_index = build_snapshot_index()
    write_json(OUT_DIR / "snapshot_index.json",     snapshot_index)

    finance_models = build_finance_models()
    write_json(OUT_DIR / "finance_models.json",     finance_models)

    # Per-page detailed table extraction
    hyperscaler_snapshots = []
    hbm_snapshots = []

    if WIKI_DIR.exists():
        for f in WIKI_DIR.glob("data-*.md"):
            m = re.search(r'(\d{4}-\d{2}-\d{2})\.md$', f.name)
            date = m.group(1) if m else "unknown"
            text = f.read_text(encoding="utf-8")
            _, body = parse_frontmatter(text)

            if "hyperscaler" in f.name:
                rows = parse_hyperscaler_page(body, date)
                hyperscaler_snapshots.extend(rows)
            elif "hbm" in f.name:
                rows = parse_hbm_page(body, date)
                hbm_snapshots.extend(rows)

    write_json(OUT_DIR / "hyperscaler_snapshots.json", hyperscaler_snapshots)
    write_json(OUT_DIR / "hbm_snapshots.json",         hbm_snapshots)

    meta = {
        "generated": datetime.utcnow().isoformat() + "Z",
        "wiki_dir": str(WIKI_DIR),
        "pages_indexed": len(snapshot_index),
    }
    write_json(OUT_DIR / "meta.json", meta)

    print(f"\nDone. {len(snapshot_index)} wiki pages indexed.")


if __name__ == "__main__":
    main()
