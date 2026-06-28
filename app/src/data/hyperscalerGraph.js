// Node and edge data for the hyperscaler dependency flow graph.
// Each hyperscaler has a full supply chain mapped: silicon → packaging → memory → power → cooling → partners.

export const HYPERSCALERS = ['Microsoft Azure', 'Amazon AWS', 'Google GCP', 'Oracle OCI']

const NODE_TYPES = {
  hyperscaler: { color: '#10b981', bg: '#10b98120', border: '#10b98160' },
  silicon:     { color: '#06b6d4', bg: '#06b6d420', border: '#06b6d460' },
  foundry:     { color: '#8b5cf6', bg: '#8b5cf620', border: '#8b5cf660' },
  memory:      { color: '#a855f7', bg: '#a855f720', border: '#a855f760' },
  power:       { color: '#f59e0b', bg: '#f59e0b20', border: '#f59e0b60' },
  cooling:     { color: '#f97316', bg: '#f97316 20', border: '#f9731660' },
  partner:     { color: '#ec4899', bg: '#ec489920', border: '#ec489960' },
  contract:    { color: '#64748b', bg: '#64748b20', border: '#64748b60' },
}

// Returns {nodes, edges} for ReactFlow given a hyperscaler name
export function getGraphData(name) {
  const graphs = {

    'Microsoft Azure': {
      nodes: [
        // Central
        { id: 'az',      label: 'Microsoft Azure',     sublabel: '$80B+ capex 2026 · $13B+ AI ARR',   type: 'hyperscaler', col: 3, row: 4 },
        // Partners
        { id: 'openai',  label: 'OpenAI',              sublabel: 'Exclusive cloud partner · $13B ARR', type: 'partner',     col: 5, row: 2 },
        { id: 'maia',    label: 'Maia 200 (ASIC)',     sublabel: 'Microsoft custom · Jan 2026 launch', type: 'silicon',     col: 5, row: 5 },
        // Silicon
        { id: 'nvda_az', label: 'NVIDIA B300/GB300',   sublabel: 'Primary training GPU · NVL72 racks', type: 'silicon',    col: 1, row: 2 },
        { id: 'amd_az',  label: 'AMD MI350X',          sublabel: 'Inference burst · secondary fleet',  type: 'silicon',    col: 1, row: 5 },
        // Foundry
        { id: 'tsmc',    label: 'TSMC',                sublabel: 'N3 wafers · CoWoS packaging',        type: 'foundry',    col: 3, row: 1 },
        // Memory
        { id: 'skh',     label: 'SK Hynix',            sublabel: 'HBM3E · 58% market share',           type: 'memory',     col: 1, row: 7 },
        { id: 'mic_az',  label: 'Micron',              sublabel: 'HBM3E · US-listed · 21% share',      type: 'memory',     col: 3, row: 7 },
        // Power
        { id: 'eaton',   label: 'Eaton',               sublabel: 'HVDC · UPS · $22.8B backlog',        type: 'power',      col: 5, row: 7 },
        { id: 'gev',     label: 'GE Vernova',          sublabel: 'Gas turbines · $163B backlog',        type: 'power',      col: 5, row: 9 },
        // Cooling
        { id: 'vrt',     label: 'Vertiv',              sublabel: 'Direct-to-chip cooling · $15B+ backlog', type: 'cooling', col: 1, row: 9 },
        // Contracts
        { id: 'star',    label: 'Stargate JV',         sublabel: '$500B · MSFT + OpenAI + Oracle + SoftBank', type: 'contract', col: 3, row: 9 },
      ],
      edges: [
        { source: 'tsmc',    target: 'nvda_az', label: 'N3 wafers + CoWoS' },
        { source: 'tsmc',    target: 'maia',    label: 'N3 foundry' },
        { source: 'skh',     target: 'nvda_az', label: 'HBM3E stacks' },
        { source: 'mic_az',  target: 'nvda_az', label: 'HBM3E stacks' },
        { source: 'nvda_az', target: 'az',      label: 'Primary compute fleet' },
        { source: 'amd_az',  target: 'az',      label: 'Inference diversification' },
        { source: 'maia',    target: 'az',      label: 'Azure OpenAI inference' },
        { source: 'openai',  target: 'az',      label: 'Exclusive cloud · API demand' },
        { source: 'eaton',   target: 'az',      label: 'HVDC power delivery' },
        { source: 'gev',     target: 'az',      label: 'Gas turbine power' },
        { source: 'vrt',     target: 'az',      label: 'Liquid cooling systems' },
        { source: 'star',    target: 'az',      label: 'Stargate DC buildout' },
        { source: 'star',    target: 'openai',  label: 'Compute allocation' },
        { source: 'tsmc',    target: 'amd_az',  label: 'N3 wafers + CoWoS' },
        { source: 'skh',     target: 'maia',    label: 'HBM supply' },
      ],
      summary: {
        capex: '$80B+ (2026)',
        aiRevenue: '$13B+ ARR',
        keyRisk: 'OpenAI concentration — >50% of AI revenue from one partner',
        keyMoat: 'Exclusive OpenAI deal; Copilot enterprise rollout; Azure largest enterprise cloud',
        tier: 1,
      }
    },

    'Amazon AWS': {
      nodes: [
        { id: 'aws',      label: 'Amazon AWS',          sublabel: '$105B+ capex 2026 · $29B AI ARR',   type: 'hyperscaler', col: 3, row: 4 },
        { id: 'trn3',     label: 'Trainium3 (ASIC)',    sublabel: 'Custom training · TSMC 3nm · GA Dec 2025', type: 'silicon', col: 5, row: 2 },
        { id: 'inf3',     label: 'Inferentia3 (ASIC)',  sublabel: 'Custom inference · low cost/token',  type: 'silicon',    col: 5, row: 5 },
        { id: 'nvda_aw',  label: 'NVIDIA B300/GB300',  sublabel: 'Training + enterprise GPU rental',   type: 'silicon',    col: 1, row: 2 },
        { id: 'tsmc',     label: 'TSMC',                sublabel: 'N3 · CoWoS · all AWS silicon',      type: 'foundry',    col: 3, row: 1 },
        { id: 'mrvl',     label: 'Marvell',             sublabel: 'ASIC design partner · Trainium next-gen', type: 'silicon', col: 1, row: 5 },
        { id: 'skh',      label: 'SK Hynix',            sublabel: 'HBM3E · primary HBM supplier',      type: 'memory',     col: 1, row: 7 },
        { id: 'eaton',    label: 'Eaton',               sublabel: 'DC power infrastructure',            type: 'power',      col: 5, row: 7 },
        { id: 'gev',      label: 'GE Vernova',          sublabel: 'Gas turbines · grid power',          type: 'power',      col: 5, row: 9 },
        { id: 'vrt',      label: 'Vertiv',              sublabel: 'Liquid cooling · UPS',               type: 'cooling',    col: 1, row: 9 },
        { id: 'ant',      label: 'Anthropic',           sublabel: '$4B investment · AWS primary cloud', type: 'partner',    col: 3, row: 7 },
        { id: 'bedrock',  label: 'Amazon Bedrock',      sublabel: 'Multi-model AI platform · enterprise', type: 'partner',  col: 3, row: 9 },
      ],
      edges: [
        { source: 'tsmc',    target: 'trn3',    label: 'TSMC 3nm foundry' },
        { source: 'tsmc',    target: 'inf3',    label: 'TSMC 3nm foundry' },
        { source: 'tsmc',    target: 'nvda_aw', label: 'N3 wafers + CoWoS' },
        { source: 'mrvl',    target: 'trn3',    label: 'ASIC design (next-gen)' },
        { source: 'skh',     target: 'nvda_aw', label: 'HBM3E' },
        { source: 'skh',     target: 'trn3',    label: 'HBM3E' },
        { source: 'trn3',    target: 'aws',     label: 'UltraServers training' },
        { source: 'inf3',    target: 'aws',     label: 'Inferentia inference' },
        { source: 'nvda_aw', target: 'aws',     label: 'p5e/p6 instances' },
        { source: 'ant',     target: 'aws',     label: 'Claude via Bedrock · $4B' },
        { source: 'bedrock', target: 'aws',     label: 'Multi-model platform revenue' },
        { source: 'eaton',   target: 'aws',     label: 'DC power systems' },
        { source: 'gev',     target: 'aws',     label: 'Power generation' },
        { source: 'vrt',     target: 'aws',     label: 'Thermal management' },
      ],
      summary: {
        capex: '$105B+ (2026)',
        aiRevenue: '$29B ARR',
        keyRisk: 'ASIC ramp execution risk on Trainium3/Inferentia3',
        keyMoat: 'Broadest enterprise base; Bedrock multi-model; Anthropic partnership; own silicon reducing GPU COGS',
        tier: 2,
      }
    },

    'Google GCP': {
      nodes: [
        { id: 'gcp',     label: 'Google GCP',          sublabel: '$75B capex 2026 · ~$12B+ AI ARR',   type: 'hyperscaler', col: 3, row: 4 },
        { id: 'tpu7',    label: 'TPU v7 Ironwood',     sublabel: '2.331 H100e · TSMC N3P · $13K/chip', type: 'silicon',    col: 5, row: 2 },
        { id: 'tpu8',    label: 'TPU v8 (2027)',        sublabel: 'TSMC N2 target · next-gen',          type: 'silicon',    col: 5, row: 5 },
        { id: 'nvda_gc', label: 'NVIDIA B300/GB300',   sublabel: 'Enterprise GPU instances · A3 Ultra', type: 'silicon',   col: 1, row: 2 },
        { id: 'avgo',    label: 'Broadcom',            sublabel: 'TPU co-design + networking silicon',  type: 'silicon',    col: 1, row: 5 },
        { id: 'tsmc',    label: 'TSMC',                sublabel: 'N3P + CoWoS · TPU + NVIDIA',         type: 'foundry',    col: 3, row: 1 },
        { id: 'skh',     label: 'SK Hynix',            sublabel: 'HBM3E · TPU v7 memory',              type: 'memory',     col: 1, row: 7 },
        { id: 'eaton',   label: 'Eaton',               sublabel: 'DC power systems',                   type: 'power',      col: 5, row: 7 },
        { id: 'gev',     label: 'GE Vernova',          sublabel: 'Gas turbines · global DCs',           type: 'power',      col: 5, row: 9 },
        { id: 'vrt',     label: 'Vertiv',              sublabel: 'Liquid cooling · TPU pods',           type: 'cooling',    col: 1, row: 9 },
        { id: 'gdm',     label: 'Google DeepMind',     sublabel: 'Gemini Ultra · in-house R&D',         type: 'partner',   col: 3, row: 7 },
        { id: 'vertex',  label: 'Vertex AI',           sublabel: 'Enterprise AI platform · $10B+ ARR',  type: 'partner',   col: 3, row: 9 },
      ],
      edges: [
        { source: 'tsmc',    target: 'tpu7',    label: 'TSMC N3P foundry' },
        { source: 'tsmc',    target: 'tpu8',    label: 'TSMC N2 (planned)' },
        { source: 'tsmc',    target: 'nvda_gc', label: 'N3 + CoWoS' },
        { source: 'avgo',    target: 'tpu7',    label: 'Co-design + networking' },
        { source: 'skh',     target: 'tpu7',    label: 'HBM3E stacks' },
        { source: 'skh',     target: 'nvda_gc', label: 'HBM3E stacks' },
        { source: 'tpu7',    target: 'gcp',     label: 'TPU pods · training + inference' },
        { source: 'tpu8',    target: 'gcp',     label: 'Next-gen pods (2027)' },
        { source: 'nvda_gc', target: 'gcp',     label: 'A3 Ultra GPU instances' },
        { source: 'gdm',     target: 'gcp',     label: 'Gemini models · in-house' },
        { source: 'vertex',  target: 'gcp',     label: 'Enterprise AI revenue' },
        { source: 'eaton',   target: 'gcp',     label: 'DC power delivery' },
        { source: 'gev',     target: 'gcp',     label: 'Power generation' },
        { source: 'vrt',     target: 'gcp',     label: 'Thermal management' },
      ],
      summary: {
        capex: '$75B (2026)',
        aiRevenue: '~$12B+ ARR (est.)',
        keyRisk: 'Enterprise sales execution; Vertex AI vs AWS Bedrock market share; TPU ramp yield',
        keyMoat: 'Deepest AI research base (DeepMind); TPU vertical integration; Gemini models in-house',
        tier: 2,
      }
    },

    'Oracle OCI': {
      nodes: [
        { id: 'oci',     label: 'Oracle OCI',          sublabel: '$18.1B IaaS FY2026 · $638B RPO',    type: 'hyperscaler', col: 3, row: 4 },
        { id: 'nvda_oc', label: 'NVIDIA B300/GB300',   sublabel: '$300B Stargate · 131K GPU clusters', type: 'silicon',    col: 1, row: 2 },
        { id: 'nvda_h',  label: 'NVIDIA H100/H200',    sublabel: 'Existing fleet · OCI SuperClusters', type: 'silicon',    col: 1, row: 5 },
        { id: 'tsmc',    label: 'TSMC',                sublabel: 'N3 + CoWoS · all NVIDIA silicon',    type: 'foundry',    col: 3, row: 1 },
        { id: 'skh',     label: 'SK Hynix',            sublabel: 'HBM3E · NVIDIA GPU memory',          type: 'memory',     col: 1, row: 7 },
        { id: 'eaton',   label: 'Eaton',               sublabel: 'HVDC · DC power · Abilene TX',       type: 'power',      col: 5, row: 2 },
        { id: 'gev',     label: 'GE Vernova',          sublabel: 'Gas turbines · 4.5GW Stargate',       type: 'power',      col: 5, row: 5 },
        { id: 'vrt',     label: 'Vertiv',              sublabel: 'Liquid cooling · NVL72 racks',        type: 'cooling',    col: 1, row: 9 },
        { id: 'openai',  label: 'OpenAI',              sublabel: '$300B Stargate anchor tenant',         type: 'partner',   col: 5, row: 7 },
        { id: 'softb',   label: 'SoftBank',            sublabel: 'Stargate JV co-investor · $19B',      type: 'partner',   col: 5, row: 9 },
        { id: 'star',    label: 'Stargate JV',         sublabel: '$300B · Abilene TX · 4.5GW · 131K GPUs', type: 'contract', col: 3, row: 7 },
        { id: 'debt',    label: '$72B+ DC Debt',       sublabel: 'Financing OCI DC buildout · secured on RPO', type: 'contract', col: 3, row: 9 },
      ],
      edges: [
        { source: 'tsmc',    target: 'nvda_oc', label: 'N3 wafers + CoWoS-L' },
        { source: 'tsmc',    target: 'nvda_h',  label: 'N4 wafers + CoWoS-S' },
        { source: 'skh',     target: 'nvda_oc', label: 'HBM3E stacks' },
        { source: 'skh',     target: 'nvda_h',  label: 'HBM3E stacks' },
        { source: 'nvda_oc', target: 'oci',     label: 'Stargate cluster · 131K GPUs' },
        { source: 'nvda_h',  target: 'oci',     label: 'OCI SuperCluster legacy fleet' },
        { source: 'star',    target: 'oci',     label: 'Anchor DC programme' },
        { source: 'openai',  target: 'star',    label: '$300B commitment · anchor tenant' },
        { source: 'softb',   target: 'star',    label: 'Co-investor' },
        { source: 'star',    target: 'nvda_oc', label: 'GPU procurement' },
        { source: 'eaton',   target: 'oci',     label: 'HVDC DC power' },
        { source: 'gev',     target: 'oci',     label: '4.5GW gas turbine power' },
        { source: 'vrt',     target: 'oci',     label: 'Thermal management' },
        { source: 'debt',    target: 'oci',     label: '$72B+ DC financing' },
        { source: 'openai',  target: 'oci',     label: '$638B RPO source' },
      ],
      summary: {
        capex: '$55.7B (FY2026) · 83% capex/revenue ratio',
        aiRevenue: '$5.8B Q4 FY2026 · +93% YoY',
        keyRisk: '$72B+ debt load; RPO concentration in Stargate/OpenAI; 83% capex/revenue ratio',
        keyMoat: '$638B RPO backlog (+363% YoY); Stargate exclusivity; fastest-growing major hyperscaler',
        tier: 2,
      }
    },
  }

  return graphs[name] || null
}

export function getNodeStyle(type) {
  return NODE_TYPES[type] || NODE_TYPES.contract
}
