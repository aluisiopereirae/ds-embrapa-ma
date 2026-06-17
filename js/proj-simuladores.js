// ═══════════════════════════════════════════════════════════════
// ANÁLISE COMPARATIVA MUNICIPAL & SIMULADORES DE CENÁRIOS
// Embrapa Maranhão — Módulo separado integrado na aba Projeções
// Fontes: Embrapa · IBGE · SEEG · PRODES · IMESC · CAR · MapBiomas · BRLUC
// ═══════════════════════════════════════════════════════════════

/* ─────────── ACESSO SEGURO AO MUNIC_DATA ─────────── */
// const MUNIC_DATA definido em index.html (classic script — acessível por nome, não por window)
function _getMD() {
  try { return typeof MUNIC_DATA !== 'undefined' && MUNIC_DATA.length ? MUNIC_DATA : []; }
  catch(e) { return []; }
}

/* ─────────── ÍNDICES DAS COLUNAS DE MUNIC_DATA ─────────── */
const MC = {
  name:0, lat:1, lng:2, pop:3, pib:4, pob:5, desmat:6, fome:7, gee:8,
  queimadas:9, precip:10, temp:11, lavoura:12, bovinos:13, idh:14,
  cos:15, assentamentos:16, pesca:17, bioma:18, regiao:19, solo:20, bacia:21
};

/* ─────────── FATORES POR SISTEMA (literatura científica) ─────────── */
// seq_co2: t CO₂eq/ha/ano sequestrado líquido vs. área degradada basal (2.5 t CO₂eq/ha/ano emitido)
// invest_ha: R$/ha investimento inicial  |  renda_ha: R$/ha/ano renda bruta estimada
// carbon_ha: t C/ha/ano estocado  |  temp_red: °C de redução microclimática regional se 100% da área degradada for convertida (escala proporcional à fração implantada)
// empregos: empregos/1000 ha  |  biodiv: índice relativo de biodiversidade 0-10
const SIM_SYSTEMS = {
  ilp: {
    label:'ILP', icon:'🐄', color:'#60a5fa',
    seq_co2:2.1, invest_ha:2500, renda_ha:1800, empregos:8,
    carbon_ha:1.2, temp_red:1.5, biodiv:5,
    desc:'Integração Lavoura-Pecuária: pastagem + lavoura em rotação'
  },
  ilpf: {
    label:'ILPF', icon:'🌳', color:'#4ade80',
    seq_co2:3.8, invest_ha:4500, renda_ha:2200, empregos:12,
    carbon_ha:2.8, temp_red:2.2, biodiv:7,
    desc:'Integração Lavoura-Pecuária-Floresta: maior sequestro de carbono'
  },
  saf: {
    label:'SAF', icon:'🌱', color:'#86efac',
    seq_co2:5.2, invest_ha:6000, renda_ha:1600, empregos:18,
    carbon_ha:4.1, temp_red:3.0, biodiv:9,
    desc:'Sistema Agroflorestal: máximo sequestro e biodiversidade'
  },
  sisteminha: {
    label:'Sisteminha Embrapa', icon:'🐓', color:'#fbbf24',
    seq_co2:0.8, invest_ha:800, renda_ha:3200, empregos:45,
    carbon_ha:0.5, temp_red:0.8, biodiv:4,
    desc:'Produção integrada de subsistência — alta geração de emprego'
  },
  apicultura: {
    label:'Apicultura', icon:'🐝', color:'#f59e0b',
    seq_co2:0.3, invest_ha:1200, renda_ha:2800, empregos:25,
    carbon_ha:0.2, temp_red:0.6, biodiv:6,
    desc:'Polinizadores + conservação da vegetação nativa'
  },
  meliponicultura: {
    label:'Meliponicultura', icon:'🍯', color:'#d97706',
    seq_co2:0.4, invest_ha:900, renda_ha:3500, empregos:28,
    carbon_ha:0.25, temp_red:0.7, biodiv:7,
    desc:'Abelhas nativas — serviços ecossistêmicos e biodiversidade'
  },
  roca: {
    label:'Roça Sustentável', icon:'🌾', color:'#a3e635',
    seq_co2:1.2, invest_ha:600, renda_ha:900, empregos:30,
    carbon_ha:0.8, temp_red:1.0, biodiv:5,
    desc:'Agricultura familiar sem queima — redução de GEE e fogo'
  },
  piscicultura: {
    label:'Piscicultura', icon:'🐟', color:'#22d3ee',
    seq_co2:0.5, invest_ha:8000, renda_ha:5500, empregos:15,
    carbon_ha:0.3, temp_red:0.9, biodiv:5,
    desc:'Aquicultura continental — renda e segurança alimentar'
  },
  extrativismo: {
    label:'Extrativismo Sust.', icon:'🌰', color:'#a78bfa',
    seq_co2:1.5, invest_ha:300, renda_ha:800, empregos:20,
    carbon_ha:1.0, temp_red:2.5, biodiv:8,
    desc:'Babaçu, açaí, buriti — conservação e renda florestal'
  },
  fruticultura: {
    label:'Fruticultura', icon:'🍎', color:'#fb923c',
    seq_co2:2.0, invest_ha:3500, renda_ha:3800, empregos:22,
    carbon_ha:1.4, temp_red:1.8, biodiv:6,
    desc:'Pomares diversificados — renda e sombreamento'
  }
};

// Emissão basal de área degradada (t CO₂eq/ha/ano)
const DEGRADED_EMISSION = 2.5;
// Área degradada total estimada no MA (ha) — Embrapa/MapBiomas
const MA_DEGRADED_HA = 6800000; // total de áreas degradas no Maranhão
// GEE total atual MA (kt CO₂eq/ano) — SEEG 2024
const MA_GEE_KT = 98000;

/* ─────────── INDICADORES DISPONÍVEIS PARA COMPARAÇÃO ─────────── */
const COMP_IND = {
  idh:       { label:'IDH Municipal', icon:'📈', col:MC.idh, unit:'', higher_better:true,
               scale: v => v, fmt: v => v.toFixed(3) },
  pib:       { label:'PIB per capita', icon:'💰', col:MC.pib, unit:'R$', higher_better:true,
               scale: v => v, fmt: v => 'R$ '+v.toLocaleString('pt-BR') },
  pop:       { label:'População', icon:'👥', col:MC.pop, unit:'hab', higher_better:false,
               scale: v => v, fmt: v => v.toLocaleString('pt-BR') },
  pob:       { label:'Pobreza', icon:'💸', col:MC.pob, unit:'%', higher_better:false,
               scale: v => v*100, fmt: v => (v*100).toFixed(1)+'%' },
  fome:      { label:'Inseg. Alimentar', icon:'🍽', col:MC.fome, unit:'%', higher_better:false,
               scale: v => v*100, fmt: v => (v*100).toFixed(1)+'%' },
  gee:       { label:'Emissões GEE', icon:'☁', col:MC.gee, unit:'kt CO₂e', higher_better:false,
               scale: v => v, fmt: v => v.toLocaleString('pt-BR')+' kt' },
  desmat:    { label:'Desmatamento', icon:'🪓', col:MC.desmat, unit:'km²', higher_better:false,
               scale: v => v, fmt: v => v.toLocaleString('pt-BR')+' km²' },
  queimadas: { label:'Queimadas', icon:'🔥', col:MC.queimadas, unit:'ha', higher_better:false,
               scale: v => v, fmt: v => v.toLocaleString('pt-BR')+' ha' },
  precip:    { label:'Precipitação', icon:'🌧', col:MC.precip, unit:'mm', higher_better:true,
               scale: v => v, fmt: v => v.toLocaleString('pt-BR')+' mm' },
  temp:      { label:'Temperatura', icon:'🌡', col:MC.temp, unit:'°C', higher_better:false,
               scale: v => v, fmt: v => v.toFixed(1)+'°C' },
  lavoura:   { label:'Área de Lavoura', icon:'🌾', col:MC.lavoura, unit:'ha', higher_better:true,
               scale: v => v, fmt: v => v.toLocaleString('pt-BR')+' ha' },
  bovinos:   { label:'Rebanho Bovino', icon:'🐄', col:MC.bovinos, unit:'cab', higher_better:false,
               scale: v => v, fmt: v => v.toLocaleString('pt-BR') },
  pesca:     { label:'Produção de Pesca', icon:'🐟', col:MC.pesca, unit:'t', higher_better:true,
               scale: v => v, fmt: v => v.toLocaleString('pt-BR')+' t' },
  assentamentos:{ label:'Assentamentos', icon:'🏘', col:MC.assentamentos, unit:'', higher_better:false,
               scale: v => v, fmt: v => v.toString() },
  cos:       { label:'Carbono no Solo', icon:'🌱', col:MC.cos, unit:'%', higher_better:true,
               scale: v => v, fmt: v => v.toFixed(1)+'%' },
};

/* ─────────── PARES SUGERIDOS DE COMPARAÇÃO ─────────── */
const COMP_PAIRS = [
  { indA:'gee',    indB:'desmat',  label:'GEE × Desmatamento', icon:'☁',  desc:'Emissões e pressão florestal' },
  { indA:'gee',    indB:'bovinos', label:'GEE × Rebanho',      icon:'🐄', desc:'Pecuária e emissões' },
  { indA:'desmat', indB:'queimadas',label:'Desmat. × Queimadas',icon:'🪓', desc:'Pressão ambiental combinada' },
  { indA:'fome',   indB:'pib',     label:'Fome × PIB',          icon:'🍽', desc:'Vulnerabilidade e renda' },
  { indA:'idh',    indB:'gee',     label:'IDH × GEE',           icon:'📈', desc:'Desenvolvimento vs. emissões' },
  { indA:'pob',    indB:'pesca',   label:'Pobreza × Pesca',     icon:'🐟', desc:'Segurança alimentar' },
  { indA:'lavoura',indB:'gee',     label:'Lavoura × GEE',       icon:'🌾', desc:'Agricultura e carbono' },
  { indA:'precip', indB:'queimadas',label:'Chuvas × Queimadas', icon:'🌧', desc:'Clima e fogo' },
  { indA:'cos',    indB:'desmat',  label:'Carbono Solo × Desmat.',icon:'🌱',desc:'Solo e pressão ambiental' },
  { indA:'temp',   indB:'precip',  label:'Temperatura × Chuvas',icon:'🌡', desc:'Perfil climático municipal' },
  { indA:'bovinos',indB:'desmat',  label:'Pecuária × Desmat.',  icon:'🐄', desc:'Pressão da pecuária extensiva' },
  { indA:'fome',   indB:'assentamentos',label:'Fome × Assentam.',icon:'🏘',desc:'Reforma agrária e fome' },
];

/* ─────────── DADOS CLIMÁTICOS MENSAIS POR MESORREGIÃO ─────────── */
// [precipitação mm, temperatura °C, radiação solar (índice 0-10)] por mês Jan-Dez
const CLIMATE_MONTHLY = {
  'Grande São Luís':     { p:[220,200,280,300,260,120,60,20,15,40,100,180], t:[27.0,27.2,27.0,27.3,27.6,27.8,28.0,28.3,28.5,28.2,27.8,27.3], r:[5,4,3,3,5,7,9,10,9,8,6,5] },
  'Norte Maranhense':    { p:[230,210,280,310,260,130,70,25,20,50,110,190], t:[27.0,27.1,26.9,27.2,27.5,27.7,27.9,28.2,28.4,28.1,27.7,27.2], r:[5,4,3,3,5,7,9,10,9,8,6,5] },
  'Baixada Reentrâncias':{ p:[200,185,260,290,240,110,55,18,12,38,95,170],  t:[27.2,27.3,27.1,27.4,27.7,27.9,28.1,28.4,28.6,28.3,27.9,27.4], r:[5,4,3,3,5,7,9,10,9,8,6,5] },
  'Itapecuru-Munim':     { p:[150,140,200,220,180,80,35,10,8,28,70,130],    t:[27.5,27.6,27.4,27.7,28.0,28.2,28.4,28.7,28.9,28.6,28.2,27.7], r:[6,5,4,3,5,7,9,10,9,8,7,6] },
  'Centro MA':           { p:[130,120,180,200,160,65,25,8,6,22,60,115],     t:[27.8,27.9,27.7,28.0,28.3,28.5,28.7,29.0,29.2,28.9,28.5,28.0], r:[6,5,4,4,5,7,9,10,9,8,7,6] },
  'Médio Parnaíba':      { p:[100,90,150,170,130,50,18,5,4,16,45,88],       t:[28.0,28.1,27.9,28.2,28.5,28.7,28.9,29.2,29.4,29.1,28.7,28.2], r:[7,6,5,4,5,7,9,10,9,9,7,7] },
  'Sudoeste MA':         { p:[180,160,240,260,210,95,42,14,10,32,85,160],   t:[26.8,26.9,26.7,27.0,27.3,27.5,27.7,28.0,28.2,27.9,27.5,27.0], r:[5,4,3,3,5,7,9,10,9,8,6,5] },
  'Noroeste MA':         { p:[200,180,260,280,230,105,50,16,12,36,92,175],  t:[27.0,27.1,26.9,27.2,27.5,27.7,27.9,28.2,28.4,28.1,27.7,27.2], r:[5,4,3,3,5,7,9,10,9,8,6,5] },
  'Meridional MA':       { p:[80,70,130,145,110,40,14,4,3,12,36,72],        t:[27.5,27.6,27.4,27.7,28.0,28.2,28.4,28.7,28.9,28.6,28.2,27.7], r:[7,6,5,4,5,7,9,10,9,9,8,7] },
  'Lençóis MA':         { p:[70,65,110,130,100,40,12,3,2,10,32,65],        t:[28.0,28.1,27.9,28.2,28.5,28.7,28.9,29.2,29.4,29.1,28.7,28.2], r:[8,7,6,5,5,7,9,10,9,9,8,8] },
  'Leste MA':           { p:[90,80,140,155,115,45,15,4,3,14,40,78],        t:[28.2,28.3,28.1,28.4,28.7,28.9,29.1,29.4,29.6,29.3,28.9,28.4], r:[7,6,5,4,5,7,9,10,9,9,8,7] },
  'Norte Maranhense':   { p:[230,210,280,310,260,130,70,25,20,50,110,190], t:[27.0,27.1,26.9,27.2,27.5,27.7,27.9,28.2,28.4,28.1,27.7,27.2], r:[5,4,3,3,5,7,9,10,9,8,6,5] },
};
const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

/* ─────────────────────────────────────────────────────────
   ESTADO GLOBAL DO MÓDULO
────────────────────────────────────────────────────────── */
let compMapInst = null;
let compMarkersLayer = null;
let _simCharts = {};     // chart.js instances keyed by id
let _simInit = false;    // was initSimuladores already called?
let compState = { indA: 'gee', indB: 'desmat' };
let convState = { pct: 15, system: 'ilpf', years: 20, mode: 'individual', systems: [] };
let meteoState = { munic: 'Grande São Luís' };
let plantioState = { system: 'ilpf', area: 50, espaco_linha: 14, espaco_planta: 3, angulo: 0 };
let vulnState = { munic: '' };

/* ─────────────────────────────────────────────────────────
   UTILITÁRIOS
────────────────────────────────────────────────────────── */
function _simVal(row, colIdx) {
  const v = row[colIdx];
  return typeof v === 'number' ? v : parseFloat(v) || 0;
}

function _allVals(colIdx) {
  return _getMD().map(r => _simVal(r, colIdx));
}

function _normalize(vals) {
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const r = mx - mn || 1;
  return vals.map(v => (v - mn) / r);
}

function _lerpHex(c1, c2, t) {
  const p = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const a = p(c1), b = p(c2);
  const rc = a.map((v,i) => Math.round(v + (b[i]-v)*t));
  return `rgb(${rc[0]},${rc[1]},${rc[2]})`;
}

function _indColor(t, higher_better) {
  if (higher_better) return _lerpHex('#f87171','#4ade80', t);
  return _lerpHex('#4ade80','#f87171', t);
}

function _destroyChart(id) {
  if (_simCharts[id]) { _simCharts[id].destroy(); delete _simCharts[id]; }
}

function _darkChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#a3c9a3', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#6b9b6b' }, grid: { color: 'rgba(74,222,128,0.08)' } },
      y: { ticks: { color: '#6b9b6b' }, grid: { color: 'rgba(74,222,128,0.08)' } }
    }
  };
}

function _pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
  let num = 0, dx2 = 0, dy2 = 0;
  xs.forEach((x,i) => { const dx=x-mx, dy=ys[i]-my; num+=dx*dy; dx2+=dx*dx; dy2+=dy*dy; });
  return (Math.sqrt(dx2*dy2) > 0) ? (num/Math.sqrt(dx2*dy2)).toFixed(3) : '0.000';
}

/* ─────────────────────────────────────────────────────────
   NAVEGAÇÃO DAS SUB-ABAS
────────────────────────────────────────────────────────── */
function showProjSubTab(tab) {
  document.querySelectorAll('.proj-stab').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.proj-stab[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
  ['cenarios','analise','simuladores'].forEach(t => {
    const el = document.getElementById('proj-'+t);
    if (el) el.style.display = (t === tab) ? 'block' : 'none';
  });
  if (tab === 'analise')     _initAnaliseTab();
  if (tab === 'simuladores') _initSimuladoresTab();
}

function initSimuladores() {
  if (_simInit) return;
  _simInit = true;
}

/* ═══════════════════════════════════════════════════════
   ABA 1 — ANÁLISE COMPARATIVA MUNICIPAL
═══════════════════════════════════════════════════════ */
function _buildIndOptions(sel) {
  return Object.entries(COMP_IND).map(([k,v]) =>
    `<option value="${k}"${sel===k?' selected':''}>${v.icon} ${v.label}</option>`
  ).join('');
}

function _buildAnaliseHTML() {
  const munics = _getMD().map(r => r[MC.name]).sort();
  const regioes = [...new Set(_getMD().map(r => r[MC.regiao]))].sort();
  return `
<div style="margin-bottom:18px">
  <div class="sec-title" style="margin-bottom:6px">🗺 Análise Comparativa Municipal — Maranhão</div>
  <div style="font-size:12px;color:var(--text3);margin-bottom:14px">Compare dois indicadores municipais para identificar correlações, padrões e áreas de maior vulnerabilidade. Clique em um município para detalhar.</div>

  <!-- Seletores de indicadores -->
  <div class="comp-ind-row">
    <span class="comp-ind-label">🔵 Cor:</span>
    <select class="comp-ind-select" id="comp-selA" onchange="updateCompInd()">
      ${_buildIndOptions(compState.indA)}
    </select>
    <span class="comp-ind-label" style="margin-left:8px">⭕ Tamanho:</span>
    <select class="comp-ind-select" id="comp-selB" onchange="updateCompInd()">
      ${_buildIndOptions(compState.indB)}
    </select>
    <button class="sim-btn sim-btn-primary" style="margin-left:8px;white-space:nowrap" onclick="updateCompInd()">🔄 Atualizar</button>
  </div>

  <!-- Sugestões de comparação -->
  <div style="margin-bottom:12px">
    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Comparações sugeridas</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">
      ${COMP_PAIRS.map(p => `<button class="comp-pair-btn" data-a="${p.indA}" data-b="${p.indB}" onclick="applyCompPair('${p.indA}','${p.indB}')" title="${p.desc}">${p.icon} ${p.label}</button>`).join('')}
    </div>
  </div>

  <!-- Correlação -->
  <div id="comp-corr-row" style="margin-bottom:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"></div>
</div>

<!-- Mapa + Ranking -->
<div id="comp-layout">
  <div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:6px">🗺 Mapa por município (cor = indicador A, tamanho = indicador B)</div>
    <div id="comp-map-container"></div>
    <div id="comp-map-legend" style="margin-top:8px;display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"></div>
  </div>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div class="chart-card" style="flex:1">
      <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:6px"><span id="comp-scatter-title">📊 Dispersão dos municípios</span>${_dlMenu('dl-comp-scatter',[{fn:"downloadChartImage('comp-scatter-chart','png')",lbl:'⬇ PNG'},{fn:"downloadChartImage('comp-scatter-chart','jpg')",lbl:'⬇ JPG'},{fn:"downloadChartCSV('comp-scatter-chart')",lbl:'⬇ CSV'}])}</div>
      <div class="chart-wrap" style="height:200px"><canvas id="comp-scatter-chart"></canvas></div>
    </div>
    <div class="chart-card" style="flex:1">
      <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:6px"><span id="comp-rank-title">🏆 Top 12 — Indicador A</span>${_dlMenu('dl-comp-rank',[{fn:"downloadChartImage('comp-rank-chart','png')",lbl:'⬇ PNG'},{fn:"downloadChartImage('comp-rank-chart','jpg')",lbl:'⬇ JPG'},{fn:"downloadChartCSV('comp-rank-chart')",lbl:'⬇ CSV'}])}</div>
      <div class="chart-wrap" style="height:220px"><canvas id="comp-rank-chart"></canvas></div>
    </div>
  </div>
</div>

<!-- Detalhe do município selecionado -->
<div id="comp-munic-detail" style="margin-top:16px;display:none">
  <div class="form-section">
    <div class="form-section-title" id="comp-munic-title">Município</div>
    <div id="comp-munic-body"></div>
  </div>
</div>

<!-- Tabela comparativa completa -->
<div class="form-section" style="margin-top:16px">
  <div class="form-section-title">📋 Tabela Comparativa — Todos os Municípios</div>
  <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;flex-wrap:wrap">
    <input id="comp-table-filter" type="text" placeholder="Filtrar por município..." oninput="filterCompTable()"
      style="background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:6px 12px;font-size:12px;outline:none;flex:1;min-width:180px">
    <select id="comp-table-sort" onchange="buildCompTable()" class="comp-ind-select" style="width:auto">
      ${Object.entries(COMP_IND).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join('')}
    </select>
    <button class="sim-btn sim-btn-primary" style="font-size:11px;padding:6px 12px" onclick="exportCompCSV()">⬇ CSV</button>
  </div>
  <div class="table-wrap" style="max-height:320px">
    <table class="data-table" id="comp-full-table">
      <thead><tr>
        <th>Município</th><th>Mesorregião</th><th>Bioma</th>
        <th>IDH</th><th>PIB/cap</th><th>Pobreza</th><th>Fome</th>
        <th>GEE kt</th><th>Desmat. km²</th><th>Queimadas ha</th>
        <th>Temp °C</th><th>Precip mm</th><th>Carbono Solo %</th>
      </tr></thead>
      <tbody id="comp-table-body"></tbody>
    </table>
  </div>
</div>`;
}

function _initAnaliseTab() {
  const el = document.getElementById('proj-analise');
  if (!el) return;
  if (el.dataset.init) { setTimeout(()=>{ if(compMapInst) compMapInst.invalidateSize(); updateCompVisualization(); },100); return; }
  el.innerHTML = _buildAnaliseHTML();
  el.dataset.init = '1';
  setTimeout(() => {
    _initCompMap();
    updateCompVisualization();
    buildCompTable();
  }, 150);
}

function _initCompMap() {
  if (compMapInst) return;
  const el = document.getElementById('comp-map-container');
  if (!el) return;
  compMapInst = L.map('comp-map-container', { center:[-4.5,-44.5], zoom:7, zoomControl:true, attributionControl:false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains:'abcd', maxZoom:18
  }).addTo(compMapInst);
  compMarkersLayer = L.layerGroup().addTo(compMapInst);
}

function updateCompInd() {
  const sa = document.getElementById('comp-selA');
  const sb = document.getElementById('comp-selB');
  if (sa) compState.indA = sa.value;
  if (sb) compState.indB = sb.value;
  _syncCompPairButtons();
  updateCompVisualization();
}

function applyCompPair(a, b) {
  compState.indA = a; compState.indB = b;
  const sa = document.getElementById('comp-selA');
  const sb = document.getElementById('comp-selB');
  if (sa) sa.value = a;
  if (sb) sb.value = b;
  _syncCompPairButtons();
  updateCompVisualization();
}

function _syncCompPairButtons() {
  document.querySelectorAll('.comp-pair-btn').forEach(btn => {
    const active = btn.dataset.a === compState.indA && btn.dataset.b === compState.indB;
    btn.classList.toggle('active', active);
  });
}

function updateCompVisualization() {
  _syncCompPairButtons();
  _updateCompMap();
  _buildScatterChart();
  _buildRankingChart();
  _updateCorrRow();
}

function _updateCompMap() {
  if (!compMapInst || !compMarkersLayer) return;
  compMarkersLayer.clearLayers();
  const cfgA = COMP_IND[compState.indA], cfgB = COMP_IND[compState.indB];
  if (!cfgA || !cfgB) return;
  const vA = _allVals(cfgA.col), vB = _allVals(cfgB.col);
  const nA = _normalize(vA), nB = _normalize(vB);
  _getMD().forEach((row, i) => {
    const color = _indColor(nA[i], cfgA.higher_better);
    const radius = 5 + nB[i] * 18;
    const mkr = L.circleMarker([row[MC.lat], row[MC.lng]], {
      radius, fillColor: color, color: '#fff', weight: 1.2, opacity:0.9, fillOpacity:0.75
    });
    mkr.bindTooltip(`<b>${row[MC.name]}</b><br>${cfgA.icon} ${cfgA.fmt(vA[i])}<br>${cfgB.icon} ${cfgB.fmt(vB[i])}`, { sticky:true });
    mkr.on('click', () => _showMunicDetail(row, i, vA, vB, nA, nB));
    mkr.addTo(compMarkersLayer);
  });
  // Legend
  const legEl = document.getElementById('comp-map-legend');
  if (legEl) {
    const g = cfgA.higher_better ? 'linear-gradient(to right,#f87171,#4ade80)' : 'linear-gradient(to right,#4ade80,#f87171)';
    legEl.innerHTML = `<span>${cfgA.icon} ${cfgA.label}</span><div style="flex:1;height:8px;border-radius:4px;background:${g};margin:0 8px"></div><span style="color:var(--green)">↑ Melhor</span>`;
  }
}

function _showMunicDetail(row, i, vA, vB, nA, nB) {
  const det = document.getElementById('comp-munic-detail');
  if (!det) return;
  det.style.display = 'block';
  document.getElementById('comp-munic-title').textContent = `📍 ${row[MC.name]} — ${row[MC.regiao]} (${row[MC.bioma]})`;
  const all = Object.entries(COMP_IND).map(([k,cfg]) => {
    const v = _simVal(row, cfg.col);
    const norm = (v - Math.min(..._allVals(cfg.col))) / (Math.max(..._allVals(cfg.col)) - Math.min(..._allVals(cfg.col)) || 1);
    const barColor = _indColor(norm, cfg.higher_better);
    return `<div class="vuln-bar-row">
      <span class="vuln-bar-label">${cfg.icon} ${cfg.label}</span>
      <div class="vuln-bar-track"><div class="vuln-bar-fill" style="width:${(norm*100).toFixed(1)}%;background:${barColor}"></div></div>
      <span class="vuln-bar-val">${cfg.fmt(v)}</span>
    </div>`;
  }).join('');
  document.getElementById('comp-munic-body').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:4px;margin-top:8px">${all}</div>
    <div style="margin-top:10px;font-size:11px;color:var(--text3)">Solo: ${row[MC.solo]} | Bacia: ${row[MC.bacia]}</div>`;
}

function _updateCorrRow() {
  const el = document.getElementById('comp-corr-row');
  if (!el) return;
  const cfgA = COMP_IND[compState.indA], cfgB = COMP_IND[compState.indB];
  if (!cfgA || !cfgB) return;
  const vA = _allVals(cfgA.col), vB = _allVals(cfgB.col);
  const r = _pearson(vA, vB);
  const rn = parseFloat(r);
  const rColor = Math.abs(rn) > 0.6 ? '#f87171' : Math.abs(rn) > 0.3 ? '#fbbf24' : '#4ade80';
  const interp = Math.abs(rn)>0.7?'Forte':Math.abs(rn)>0.4?'Moderada':Math.abs(rn)>0.2?'Fraca':'Sem';
  const dir = rn>0?'positiva':'negativa';
  el.innerHTML = `
    <div class="comp-corr-badge">🔗 Correlação de Pearson: <strong style="color:${rColor};margin-left:4px">r = ${r}</strong></div>
    <div class="comp-corr-badge">${interp} correlação ${dir} entre os indicadores</div>
    <div class="comp-corr-badge">📊 ${_getMD().length} municípios analisados</div>`;
}

function _buildScatterChart() {
  const cfgA = COMP_IND[compState.indA], cfgB = COMP_IND[compState.indB];
  if (!cfgA || !cfgB) return;
  const vA = _allVals(cfgA.col), vB = _allVals(cfgB.col);
  const data = _getMD().map((r,i) => ({ x: vA[i], y: vB[i], label: r[MC.name] }));
  const nA = _normalize(vA);
  const colors = nA.map(t => _indColor(t, cfgA.higher_better));
  const ctx = document.getElementById('comp-scatter-chart'); if (!ctx) return;
  _destroyChart('scatter');
  const ttl = document.getElementById('comp-scatter-title');
  if (ttl) ttl.innerHTML = `📊 ${cfgA.icon} ${cfgA.label} × ${cfgB.icon} ${cfgB.label} <span class="badge-validado" title="Fonte: IBGE 2024 — dados oficiais de indicadores municipais">✔</span>`;
  const opts = _darkChartDefaults();
  opts.scales.x.title = { display:true, text: `${cfgA.icon} ${cfgA.label}`, color:'#a3c9a3' };
  opts.scales.y.title = { display:true, text: `${cfgB.icon} ${cfgB.label}`, color:'#a3c9a3' };
  opts.plugins.tooltip = { callbacks: { label: c => `${c.raw.label}: (${cfgA.fmt(c.raw.x)}, ${cfgB.fmt(c.raw.y)})` } };
  _simCharts['scatter'] = new Chart(ctx, {
    type:'scatter', data:{ datasets:[{
      label:`${cfgA.icon} ${cfgA.label}`, data,
      backgroundColor: colors, borderColor:'rgba(255,255,255,0.3)', borderWidth:1, pointRadius:5
    }]}, options: opts
  });
}

function _buildRankingChart() {
  const cfgA = COMP_IND[compState.indA];
  if (!cfgA) return;
  const vA = _allVals(cfgA.col);
  const ranked = _getMD().map((r,i)=>({name:r[MC.name],v:vA[i]}))
    .sort((a,b)=>b.v-a.v).slice(0,12);
  const ctx = document.getElementById('comp-rank-chart'); if (!ctx) return;
  _destroyChart('rank');
  const ttl = document.getElementById('comp-rank-title');
  if (ttl) ttl.innerHTML = `🏆 Top 12 — ${cfgA.icon} ${cfgA.label} <span class="badge-validado" title="Fonte: IBGE 2024 — dados oficiais municipais">✔</span>`;
  const nVals = _normalize(ranked.map(r=>r.v));
  const colors = nVals.map(t => _indColor(t, cfgA.higher_better));
  const opts = _darkChartDefaults();
  opts.indexAxis = 'y';
  opts.plugins.legend = { display:false };
  opts.scales.x.title = { display:true, text: cfgA.label, color:'#a3c9a3' };
  _simCharts['rank'] = new Chart(ctx, {
    type:'bar', data:{
      labels: ranked.map(r=>r.name),
      datasets:[{ label: cfgA.label, data: ranked.map(r=>r.v), backgroundColor: colors }]
    }, options: opts
  });
}

function buildCompTable() {
  const sortKey = document.getElementById('comp-table-sort')?.value || 'gee';
  const cfg = COMP_IND[sortKey];
  const tbody = document.getElementById('comp-table-body'); if (!tbody) return;
  const rows = _getMD().slice().sort((a,b)=>_simVal(b,cfg?.col||MC.gee)-_simVal(a,cfg?.col||MC.gee));
  tbody.innerHTML = rows.map(r => `<tr>
    <td>${r[MC.name]}</td><td>${r[MC.regiao]||'-'}</td><td>${r[MC.bioma]||'-'}</td>
    <td>${_simVal(r,MC.idh).toFixed(3)}</td>
    <td>R$ ${_simVal(r,MC.pib).toLocaleString('pt-BR')}</td>
    <td>${(_simVal(r,MC.pob)*100).toFixed(0)}%</td>
    <td>${(_simVal(r,MC.fome)*100).toFixed(0)}%</td>
    <td>${_simVal(r,MC.gee).toLocaleString('pt-BR')}</td>
    <td>${_simVal(r,MC.desmat).toLocaleString('pt-BR')}</td>
    <td>${_simVal(r,MC.queimadas).toLocaleString('pt-BR')}</td>
    <td>${_simVal(r,MC.temp).toFixed(1)}</td>
    <td>${_simVal(r,MC.precip).toLocaleString('pt-BR')}</td>
    <td>${_simVal(r,MC.cos).toFixed(1)}</td>
  </tr>`).join('');
}

function filterCompTable() {
  const q = (document.getElementById('comp-table-filter')?.value||'').toLowerCase();
  document.querySelectorAll('#comp-table-body tr').forEach(tr => {
    tr.style.display = tr.cells[0]?.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function exportCompCSV() {
  const hdr = 'Município,Mesorregião,Bioma,IDH,PIB,Pobreza%,Fome%,GEE_kt,Desmat_km2,Queimadas_ha,Temp_C,Precip_mm,COS%';
  const rows = _getMD().map(r => [
    r[MC.name],r[MC.regiao],r[MC.bioma],_simVal(r,MC.idh),_simVal(r,MC.pib),
    (_simVal(r,MC.pob)*100).toFixed(1),(_simVal(r,MC.fome)*100).toFixed(1),
    _simVal(r,MC.gee),_simVal(r,MC.desmat),_simVal(r,MC.queimadas),
    _simVal(r,MC.temp),_simVal(r,MC.precip),_simVal(r,MC.cos)
  ].join(','));
  const blob = new Blob([[hdr,...rows].join('\n')],{type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download='analise-comparativa-ma.csv'; a.click();
  if(typeof showToast==='function') showToast('✅ CSV exportado');
}

/* ═══════════════════════════════════════════════════════
   ABA 2 — SIMULADORES DE CENÁRIOS
═══════════════════════════════════════════════════════ */
function _buildSimHTML() {
  const sysOptions = Object.entries(SIM_SYSTEMS).map(([k,v])=>
    `<option value="${k}">${v.icon} ${v.label}</option>`).join('');
  const regioes = Object.keys(CLIMATE_MONTHLY).sort();
  const regOptions = regioes.map(r=>`<option value="${r}">${r}</option>`).join('');

  return `
<div style="margin-bottom:16px">
  <div class="sec-title" style="margin-bottom:4px">🧪 Simuladores de Cenários — Análise de Impacto</div>
  <div style="font-size:12px;color:var(--text3)">Simule conversão de áreas degradadas, configure plantios e analise impactos em GEE, carbono, renda e clima.</div>
</div>

<div class="sim-tabs-inner">
  <button class="sim-itab active" data-simtab="conversao"    onclick="showSimTab('conversao')">🔄 Conversão de Áreas</button>
  <button class="sim-itab" data-simtab="plantio"             onclick="showSimTab('plantio')">🌱 Simulador de Plantio</button>
  <button class="sim-itab" data-simtab="meteo"               onclick="showSimTab('meteo')">🌦 Sazonalidade Municipal</button>
  <button class="sim-itab" data-simtab="vuln"                onclick="showSimTab('vuln')">⚠️ Vulnerabilidade Municipal</button>
  <button class="sim-itab" data-simtab="crescimento"         onclick="showSimTab('crescimento')">🌿 Crescimento de Plantas</button>
</div>

<!-- SIM 1: Conversão de Áreas Degradadas -->
<div id="simtab-conversao">
  <div id="conv-grid" style="display:grid;grid-template-columns:minmax(240px,300px) 1fr;gap:16px;align-items:start">
    <div class="sim-card" style="margin:0">
      <div class="sim-card-title">🔄 Conversão de Áreas Degradadas no MA</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:14px">
        Responde:<br>
        • <em>A conversão de X% do MA em sistemas integrados reduzirá quanto de GEE?</em><br>
        • <em>Qual o impacto climático?</em><br>
        • <em>Quanto de investimento é necessário?</em>
      </div>
      <div class="sim-param">
        <label>% de área degradada convertida: <strong id="conv-pct-val">${convState.pct}%</strong>
          <br><small style="color:var(--text3)">Área degradada total estimada: 6,8 M ha</small>
        </label>
        <input type="range" class="sim-slider" id="conv-pct" min="1" max="100" value="${convState.pct}" oninput="updateConvSlider()">
      </div>
      <div class="sim-param">
        <label>📊 Modo de análise:</label>
        <div style="display:flex;gap:4px;margin-top:4px">
          <button id="conv-mode-ind"  onclick="setConvMode('individual')" style="flex:1;padding:5px 2px;font-size:11px;border-radius:6px;cursor:pointer;background:#1a3a2a;border:1px solid #4ade80;color:#4ade80;font-weight:600">Individual</button>
          <button id="conv-mode-mult" onclick="setConvMode('multiplos')"  style="flex:1;padding:5px 2px;font-size:11px;border-radius:6px;cursor:pointer;background:var(--bg3);border:1px solid var(--text3);color:var(--text2)">Múltiplos</button>
          <button id="conv-mode-all"  onclick="setConvMode('todos')"      style="flex:1;padding:5px 2px;font-size:11px;border-radius:6px;cursor:pointer;background:var(--bg3);border:1px solid var(--text3);color:var(--text2)">Todos</button>
        </div>
      </div>
      <div class="sim-param" id="conv-sys-row">
        <label>Sistema adotado:</label>
        <select class="sim-select" id="conv-sys" onchange="runConversaoSim()">${sysOptions}</select>
      </div>
      <div class="sim-param" id="conv-chk-row" style="display:none">
        <label style="margin-bottom:4px">Sistemas selecionados:</label>
        <div style="display:flex;flex-direction:column;gap:3px;max-height:190px;overflow-y:auto;padding-right:2px">
          ${Object.entries(SIM_SYSTEMS).map(([k,s])=>`<label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text2);cursor:pointer"><input type="checkbox" class="conv-sys-chk" value="${k}" onchange="runConversaoSim()"> ${s.icon} ${s.label}</label>`).join('')}
        </div>
      </div>
      <div class="sim-param">
        <label>Horizonte de tempo: <strong id="conv-years-val">${convState.years} anos</strong></label>
        <input type="range" class="sim-slider" id="conv-years" min="5" max="40" step="5" value="${convState.years}" oninput="updateConvSlider()">
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div id="conv-results"></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">
        <div class="chart-card">
          <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px"><span>📈 Trajetória de Impacto ao Longo do Tempo <span class="badge-pendente" title="Projeção modelada — parâmetros Embrapa; confirmar com monitoramento real de campo">⚠</span></span>${_dlMenu('dl-conv-traj',[{fn:"downloadChartImage('conv-chart','png')",lbl:'⬇ PNG'},{fn:"downloadChartImage('conv-chart','jpg')",lbl:'⬇ JPG'},{fn:"downloadChartCSV('conv-chart')",lbl:'⬇ CSV'}])}</div>
          <div class="chart-wrap" style="height:clamp(260px,48vh,380px)"><canvas id="conv-chart"></canvas></div>
          <div style="margin-top:10px;padding:10px 12px;background:var(--bg3);border-radius:8px;border-left:3px solid var(--green3);font-size:11px;color:var(--text3);line-height:1.6">
            <div style="font-weight:600;color:var(--text2);margin-bottom:5px">ℹ️ Como ler este gráfico</div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <div><span style="color:rgba(248,113,113,0.7);font-weight:600">— — —</span> <strong style="color:var(--text2)">GEE MA sem intervenção</strong> (eixo esquerdo): tendência de emissões do Maranhão sem adoção de sistemas — cresce ~0,8%/ano pelo avanço do desmatamento e pressão agropecuária.</div>
              <div><span style="color:#f87171;font-weight:600">———</span> <strong style="color:var(--text2)">GEE MA com sistemas</strong> (eixo esquerdo): projeção das emissões considerando a redução combinada de todos os sistemas selecionados. A diferença entre as duas linhas vermelhas é o benefício climático acumulado.</div>
              <div style="margin-top:2px"><strong style="color:var(--text2)">Linhas coloridas</strong> (eixo direito — escala menor): contribuição individual de redução de cada sistema selecionado em kt CO₂eq/ano. Cada linha segue uma curva de adoção em S + maturação ecológica específica do sistema — sistemas florestais (SAF, ILPF) continuam crescendo por décadas; sistemas anuais (Roça, Sisteminha) estabilizam mais cedo.</div>
              <div style="margin-top:2px;padding-top:6px;border-top:1px solid var(--border);color:var(--text3)">⚠️ As linhas coloridas podem aparecer <em>acima</em> da linha de GEE sem intervenção visualmente porque utilizam o <strong>eixo direito</strong>, cuja escala é muito menor (centenas a milhares de kt) do que o eixo esquerdo (dezenas de milhares de kt). Isso é normal: as duas escalas coexistem no mesmo gráfico para permitir comparar grandezas diferentes.</div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px"><span style="flex:1;min-width:0">⚖️ Comparativo de Sistemas — Redução de GEE por ha em ${convState.years} anos <span class="badge-pendente" title="Estimativa por fatores Embrapa — confirmar com inventários GEE e dados de campo">⚠</span></span>${_dlMenu('dl-conv-cmp',[{fn:"downloadChartImage('conv-cmp-chart','png')",lbl:'⬇ PNG'},{fn:"downloadChartImage('conv-cmp-chart','jpg')",lbl:'⬇ JPG'},{fn:"downloadChartCSV('conv-cmp-chart')",lbl:'⬇ CSV'}])}</div>
          <div class="chart-wrap" style="height:clamp(260px,48vh,380px)"><canvas id="conv-cmp-chart"></canvas></div>
          <div style="margin-top:10px;padding:10px 12px;background:var(--bg3);border-radius:8px;border-left:3px solid #60a5fa;font-size:11px;color:var(--text3);line-height:1.6">
            <div style="font-weight:600;color:var(--text2);margin-bottom:6px">📌 Melhores abordagens por objetivo</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:6px">
              <div style="background:var(--bg2);border-radius:6px;padding:6px 8px">
                <div style="color:#4ade80;font-weight:600;margin-bottom:2px">🌿 Máx. sequestro de carbono</div>
                <div>SAF e ILPF — maior acúmulo de biomassa florestal e matéria orgânica no solo ao longo de décadas.</div>
              </div>
              <div style="background:var(--bg2);border-radius:6px;padding:6px 8px">
                <div style="color:#fbbf24;font-weight:600;margin-bottom:2px">💰 Maior retorno financeiro/ha</div>
                <div>Piscicultura e Meliponicultura — maior renda bruta por hectare; menor área necessária para viabilidade econômica.</div>
              </div>
              <div style="background:var(--bg2);border-radius:6px;padding:6px 8px">
                <div style="color:#fb923c;font-weight:600;margin-bottom:2px">👷 Geração de empregos</div>
                <div>Sisteminha Embrapa e SAF — maior número de empregos por hectare; ideais para assentamentos e agricultura familiar.</div>
              </div>
              <div style="background:var(--bg2);border-radius:6px;padding:6px 8px">
                <div style="color:#a78bfa;font-weight:600;margin-bottom:2px">🏦 Menor investimento inicial</div>
                <div>Extrativismo Sustentável e Roça Sustentável — implantação de baixo custo; indicados para comunidades com poucos recursos.</div>
              </div>
              <div style="background:var(--bg2);border-radius:6px;padding:6px 8px">
                <div style="color:#22d3ee;font-weight:600;margin-bottom:2px">🌍 Maior impacto em GEE/ha</div>
                <div>SAF &gt; ILPF &gt; Extrativismo — os sistemas com maior cobertura arbórea dominam a redução de emissões no longo prazo.</div>
              </div>
              <div style="background:var(--bg2);border-radius:6px;padding:6px 8px">
                <div style="color:#86efac;font-weight:600;margin-bottom:2px">⚖️ Estratégia combinada</div>
                <div>Use o modo <strong>Múltiplos</strong> para combinar sistemas complementares: ILPF ou SAF (carbono) + Sisteminha (emprego) + Apicultura (polinização) numa mesma propriedade ou território.</div>
              </div>
            </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- SIM 2: Plantio Interativo -->
<div id="simtab-plantio" style="display:none">
<div id="plt-grid" style="display:grid;grid-template-columns:minmax(240px,300px) 1fr;gap:16px;align-items:start">
<div>
  <div class="sim-card">
    <div class="sim-card-title">🌱 Configuração do Plantio</div>
    <div class="sim-param">
      <label>Sistema produtivo:</label>
      <select class="sim-select" id="plt-sys" onchange="updatePlantio()">${sysOptions}</select>
    </div>
    <div class="sim-param">
      <label>Área total: <strong id="plt-area-val">${plantioState.area} ha</strong></label>
      <input type="range" class="sim-slider" id="plt-area" min="1" max="500" value="${plantioState.area}" oninput="updatePlantio()">
    </div>
    <div class="sim-param">
      <label>Espaçamento entre linhas: <strong id="plt-el-val">${plantioState.espaco_linha} m</strong></label>
      <input type="range" class="sim-slider" id="plt-el" min="3" max="30" value="${plantioState.espaco_linha}" oninput="updatePlantio()">
    </div>
    <div class="sim-param">
      <label>Espaçamento plantas: <strong id="plt-ep-val">${plantioState.espaco_planta} m</strong></label>
      <input type="range" class="sim-slider" id="plt-ep" min="1" max="15" value="${plantioState.espaco_planta}" oninput="updatePlantio()">
    </div>
    <div class="sim-param">
      <label>Orientação das linhas: <strong id="plt-ang-val">${plantioState.angulo}°</strong>
        <br><small style="color:var(--text3)">0° = N-S | 90° = L-O</small>
      </label>
      <input type="range" class="sim-slider" id="plt-ang" min="0" max="179" value="${plantioState.angulo}" oninput="updatePlantio()">
    </div>
    <div id="plt-metrics" style="margin-top:12px"></div>
  </div>
</div>

<div>
  <div class="chart-card" style="margin-bottom:14px">
    <div class="chart-title">🌳 Vista Superior do Plantio (simulação topográfica) <span class="badge-pendente" title="Simulação paramétrica Embrapa — confirmar com dados de campo reais">⚠</span></div>
    <canvas id="plantio-canvas" width="540" height="360"></canvas>
    <div id="plantio-legend" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:11px;color:var(--text3)"></div>
  </div>
  <div class="chart-card">
    <div class="chart-title">📊 Sequestro de Carbono ao Longo do Tempo <span class="badge-pendente" title="Estimativa Embrapa — necessita monitoramento de campo e validação por inventários GEE">⚠</span></div>
    <div class="chart-wrap" style="height:180px"><canvas id="plt-carbon-chart"></canvas></div>
  </div>
</div>
</div>
</div>

<!-- SIM 3: Sazonalidade -->
<div id="simtab-meteo" style="display:none">
<div class="sim-card" style="margin-bottom:14px">
  <div class="sim-card-title">🌦 Sazonalidade e Clima por Região</div>
  <div class="comp-ind-row">
    <span class="comp-ind-label">Mesorregião:</span>
    <select class="comp-ind-select" id="meteo-reg" onchange="updateMeteoChart()">${regOptions}</select>
    <span class="comp-ind-label" style="margin-left:10px">Sistema:</span>
    <select class="comp-ind-select" id="meteo-sys" onchange="updateMeteoChart()">${sysOptions}</select>
  </div>
</div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">
  <div class="chart-card">
    <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px"><span>🌧 Precipitação e Temperatura Mensais <span class="badge-pendente" title="Dados climáticos parametrizados por mesorregião — confirmar com estações INMET/CEMADEN">⚠</span></span>${_dlMenu('dl-meteo',[{fn:"downloadChartImage('meteo-chart','png')",lbl:'⬇ PNG'},{fn:"downloadChartImage('meteo-chart','jpg')",lbl:'⬇ JPG'},{fn:"downloadChartCSV('meteo-chart')",lbl:'⬇ CSV'}])}</div>
    <div class="chart-wrap" style="height:clamp(160px,38vh,220px)"><canvas id="meteo-chart"></canvas></div>
  </div>
  <div class="chart-card">
    <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px"><span>☀️ Radiação Solar e Meses Favoráveis ao Sistema <span class="badge-pendente" title="Dados parametrizados por mesorregião — confirmar com atlas solar INPE/CRESESB">⚠</span></span>${_dlMenu('dl-meteo-solar',[{fn:"downloadChartImage('meteo-solar-chart','png')",lbl:'⬇ PNG'},{fn:"downloadChartImage('meteo-solar-chart','jpg')",lbl:'⬇ JPG'},{fn:"downloadChartCSV('meteo-solar-chart')",lbl:'⬇ CSV'}])}</div>
    <div class="chart-wrap" style="height:clamp(160px,38vh,220px)"><canvas id="meteo-solar-chart"></canvas></div>
  </div>
</div>
<div class="sim-card" style="margin-top:14px">
  <div class="sim-card-title" style="justify-content:space-between">
    <span>📅 Calendário de Atividades Recomendado</span>
    ${_dlMenu('dl-meteo-cal',[{fn:"downloadDivImage('meteo-calendario','png','calendario-atividades')",lbl:'⬇ PNG'},{fn:"downloadDivImage('meteo-calendario','jpg','calendario-atividades')",lbl:'⬇ JPG'}])}
  </div>
  <div id="meteo-calendario"></div>
</div>
</div>

<!-- SIM 4: Vulnerabilidade -->
<div id="simtab-vuln" style="display:none">

<div id="vuln-grid" style="display:grid;grid-template-columns:minmax(240px,340px) 1fr;gap:16px;align-items:start">
<div class="sim-card">
  <div class="sim-card-title">⚠️ Índice de Vulnerabilidade Municipal</div>
  <div style="font-size:11px;color:var(--text3);margin-bottom:12px">Combina indicadores para identificar municípios que mais necessitam de intervenção com sistemas produtivos sustentáveis.</div>
  <div class="sim-param">
    <label>Município selecionado:</label>
    <select class="sim-select" id="vuln-munic" onchange="updateVulnChart()">
      ${_getMD().map(r=>`<option value="${r[MC.name]}">${r[MC.name]}</option>`).join('')}
    </select>
  </div>
  <div style="margin-top:12px" id="vuln-score-box"></div>
</div>
<div>
  <div class="chart-card" style="margin-bottom:14px">
    <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px"><span>🔍 Radar de Indicadores — Município vs. Média MA <span class="badge-validado" title="Fonte: IBGE 2024 — indicadores municipais oficiais">✔</span></span>${_dlMenu('dl-vuln-radar',[{fn:"downloadChartImage('vuln-radar-chart','png')",lbl:'⬇ PNG'},{fn:"downloadChartImage('vuln-radar-chart','jpg')",lbl:'⬇ JPG'},{fn:"downloadChartCSV('vuln-radar-chart')",lbl:'⬇ CSV'}])}</div>
    <div class="chart-wrap" style="height:clamp(200px,42vh,280px)"><canvas id="vuln-radar-chart"></canvas></div>
  </div>
  <div class="chart-card">
    <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px"><span>🏅 Ranking — Top 20 Municípios mais Vulneráveis <span class="badge-validado" title="Fonte: IBGE 2024 — índice composto de indicadores municipais oficiais">✔</span></span>${_dlMenu('dl-vuln-rank',[{fn:"downloadChartImage('vuln-rank-chart','png')",lbl:'⬇ PNG'},{fn:"downloadChartImage('vuln-rank-chart','jpg')",lbl:'⬇ JPG'},{fn:"downloadChartCSV('vuln-rank-chart')",lbl:'⬇ CSV'}])}</div>
    <div class="chart-wrap" style="height:clamp(220px,45vh,300px)"><canvas id="vuln-rank-chart"></canvas></div>
  </div>
</div>
</div>
</div>

<!-- SIM 5: Crescimento de Plantas (lazy init via crescimento.js) -->
<div id="simtab-crescimento" style="display:none"></div>
`;
}

function _initSimuladoresTab() {
  const el = document.getElementById('proj-simuladores');
  if (!el) return;
  if (!el.dataset.init) {
    el.innerHTML = _buildSimHTML();
    el.dataset.init = '1';
  }
  setTimeout(() => {
    runConversaoSim();
    updatePlantio();
    updateMeteoChart();
    updateVulnChart();
  }, 100);
}

function showSimTab(tab) {
  document.querySelectorAll('.sim-itab').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.sim-itab[data-simtab="${tab}"]`);
  if (btn) btn.classList.add('active');
  ['conversao','plantio','meteo','vuln','crescimento'].forEach(t => {
    const el = document.getElementById('simtab-'+t);
    if (el) el.style.display = (t === tab) ? 'block' : 'none';
  });
  if (tab === 'crescimento' && typeof _initCrescimento === 'function') _initCrescimento();
}

/* ─────────── SIMULADOR 1: CONVERSÃO DE ÁREAS ─────────── */

// Dynamic adoption × maturation factor for year y and a given system.
// adopt: S-curve ramp-up (slow start → rapid adoption → saturation)
// matur: biomass / ecosystem maturation multiplier (grows beyond 1.0 for forested systems)
// Returns combined factor (can exceed 1 for mature forested systems)
function _convDynamic(y, sysKey) {
  const cfg = {
    ilp:             { ta: 3,  tm: 10, pk: 1.15 },
    ilpf:            { ta: 5,  tm: 22, pk: 1.90 },
    saf:             { ta: 6,  tm: 28, pk: 2.30 },
    sisteminha:      { ta: 2,  tm:  5, pk: 1.10 },
    apicultura:      { ta: 3,  tm: 10, pk: 1.25 },
    meliponicultura: { ta: 3,  tm: 10, pk: 1.25 },
    roca:            { ta: 2,  tm:  5, pk: 1.08 },
    piscicultura:    { ta: 4,  tm: 12, pk: 1.40 },
    extrativismo:    { ta: 5,  tm: 20, pk: 1.70 },
    fruticultura:    { ta: 5,  tm: 18, pk: 1.60 },
  };
  const c = cfg[sysKey] || { ta: 4, tm: 12, pk: 1.30 };
  // Sigmoid adoption (ta = inflection year, ~90% adoption at 2×ta)
  const adopt = 1 / (1 + Math.exp(-2.2 * (y - c.ta) / c.ta));
  // Maturation: linear rise to pk at tm, then gentle post-peak decline
  const matur = y <= c.tm
    ? 1 + (c.pk - 1) * (y / c.tm)
    : c.pk * (1 - 0.12 * Math.min(1, (y - c.tm) / 30));
  return adopt * matur;
}

function updateConvSlider() {
  convState.pct   = +document.getElementById('conv-pct').value;
  convState.years = +document.getElementById('conv-years').value;
  if (convState.mode === 'individual') convState.system = document.getElementById('conv-sys').value;
  const pv = document.getElementById('conv-pct-val');
  const yv = document.getElementById('conv-years-val');
  if (pv) pv.textContent = convState.pct + '%';
  if (yv) yv.textContent = convState.years + ' anos';
  runConversaoSim();
}

function setConvMode(mode) {
  convState.mode = mode;
  const sysRow  = document.getElementById('conv-sys-row');
  const chkRow  = document.getElementById('conv-chk-row');
  const modeMap = { individual:'ind', multiplos:'mult', todos:'all' };
  Object.keys(modeMap).forEach(m => {
    const btn = document.getElementById('conv-mode-' + modeMap[m]);
    if (!btn) return;
    const active = m === mode;
    btn.style.background    = active ? '#1a3a2a' : 'var(--bg3)';
    btn.style.border        = active ? '1px solid #4ade80' : '1px solid var(--text3)';
    btn.style.color         = active ? '#4ade80' : 'var(--text2)';
    btn.style.fontWeight    = active ? '600' : '400';
  });
  if (mode === 'individual') {
    if (sysRow) sysRow.style.display = '';
    if (chkRow) chkRow.style.display = 'none';
  } else {
    if (sysRow) sysRow.style.display = 'none';
    if (chkRow) chkRow.style.display = '';
    const chks = document.querySelectorAll('.conv-sys-chk');
    if (mode === 'todos') {
      chks.forEach(c => { c.checked = true; c.disabled = true; });
    } else {
      chks.forEach(c => { c.disabled = false; });
    }
  }
  runConversaoSim();
}

function runConversaoSim() {
  convState.pct   = +document.getElementById('conv-pct')?.value   || convState.pct;
  convState.years = +document.getElementById('conv-years')?.value || convState.years;
  const mode   = convState.mode || 'individual';
  const areaHa = MA_DEGRADED_HA * convState.pct / 100;
  const years  = convState.years;
  const resEl  = document.getElementById('conv-results');

  let selKeys;
  if (mode === 'individual') {
    const sysKey = document.getElementById('conv-sys')?.value || convState.system;
    convState.system = sysKey;
    selKeys = [sysKey];
  } else {
    const checked = Array.from(document.querySelectorAll('.conv-sys-chk:checked')).map(c => c.value);
    selKeys = checked.length ? checked : Object.keys(SIM_SYSTEMS);
  }
  convState.systems = selKeys;

  const years_arr = Array.from({length: years + 1}, (_, i) => i);
  const labels    = years_arr.map(y => 2025 + y);

  if (mode === 'individual') {
    const sys = SIM_SYSTEMS[selKeys[0]];
    if (!sys) return;

    const geeRedKtAnual  = areaHa * (DEGRADED_EMISSION + sys.seq_co2) / 1000;
    const geeTotalKt     = geeRedKtAnual * years;
    const carbonoTotalMt = areaHa * sys.carbon_ha * years / 1e6;
    const tempReducao    = sys.temp_red * (areaHa / MA_DEGRADED_HA);
    const investTotal    = areaHa * sys.invest_ha;
    const rendaAnual     = areaHa * sys.renda_ha;
    const empregos       = (areaHa / 1000) * sys.empregos;
    const pctGEE_MA      = (geeRedKtAnual / MA_GEE_KT * 100).toFixed(1);

    if (resEl) resEl.innerHTML = `
      <div style="background:var(--bg2);border:1px solid var(--green3);border-radius:12px;padding:14px;margin-bottom:12px">
        <div style="font-size:12px;color:var(--green);font-weight:600;margin-bottom:6px">✅ Resultado da Simulação — ${sys.icon} ${sys.label} em ${convState.pct}% das áreas degradadas (${(areaHa/1e6).toFixed(2)} M ha) em ${years} anos</div>
      </div>
      <div class="sim-result-grid">
        <div class="sim-result-card"><div class="sim-result-val" style="color:#4ade80">${geeRedKtAnual.toFixed(0)} kt</div><div class="sim-result-label">Redução GEE/ano (CO₂eq)</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#60a5fa">${(geeTotalKt/1000).toFixed(2)} Mt</div><div class="sim-result-label">GEE total evitado em ${years} anos</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#86efac">${pctGEE_MA}%</div><div class="sim-result-label">% das emissões atuais do MA</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#2dd4bf">${carbonoTotalMt.toFixed(2)} Mt C</div><div class="sim-result-label">Carbono estocado no solo/biomassa</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#fbbf24">−${tempReducao.toFixed(2)}°C</div><div class="sim-result-label">Redução temperatura microclimática</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#f87171">R$ ${(investTotal/1e9).toFixed(2)} Bi</div><div class="sim-result-label">Investimento total necessário</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#c084fc">R$ ${(rendaAnual/1e9).toFixed(2)} Bi</div><div class="sim-result-label">Renda bruta gerada/ano</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#fb923c">${Math.round(empregos).toLocaleString('pt-BR')}</div><div class="sim-result-label">Empregos gerados</div></div>
      </div>`;

    // Baseline GEE without intervention: +0.8%/yr drift (continued deforestation pressure)
    const baselineArr = years_arr.map(y => +(MA_GEE_KT * (1 + 0.008 * y)).toFixed(1));
    // GEE with system: baseline minus growing reduction (adoption S-curve × maturation)
    const geeArr = years_arr.map(y => +Math.max(
      MA_GEE_KT * 0.25,
      MA_GEE_KT * (1 + 0.008 * y) - geeRedKtAnual * _convDynamic(y, selKeys[0])
    ).toFixed(1));
    // Cumulative carbon: discrete integral of annual carbon rate × dynamic factor
    const seqArr = [];
    let _cumC = 0;
    for (const y of years_arr) {
      _cumC += areaHa * sys.carbon_ha * _convDynamic(y, selKeys[0]) / 1e6;
      seqArr.push(_cumC.toFixed(3));
    }
    const ctx = document.getElementById('conv-chart'); if (!ctx) return;
    _destroyChart('conv');
    const opts = _darkChartDefaults();
    opts.interaction = { mode:'index', intersect:false };
    _simCharts['conv'] = new Chart(ctx, {
      type:'line',
      data: { labels, datasets: [
        { label:'GEE MA sem intervenção (kt/ano)', data: baselineArr, borderColor:'rgba(248,113,113,0.40)', borderDash:[6,4], fill:false, tension:0.3, yAxisID:'y', pointRadius:0 },
        { label:'GEE MA com sistema (kt/ano)', data: geeArr, borderColor:'#f87171', backgroundColor:'rgba(248,113,113,0.10)', fill:true, tension:0.4, yAxisID:'y' },
        { label:'Carbono sequestrado (Mt C)', data: seqArr, borderColor:'#4ade80', backgroundColor:'rgba(74,222,128,0.10)', fill:true, tension:0.4, yAxisID:'y1' }
      ]},
      options: { ...opts, scales: {
        x:  { ticks:{color:'#6b9b6b'}, grid:{color:'rgba(74,222,128,0.08)'} },
        y:  { type:'linear', position:'left',  ticks:{color:'#f87171'}, grid:{color:'rgba(248,113,113,0.06)'}, title:{display:true,text:'GEE (kt CO₂eq/ano)',color:'#f87171'} },
        y1: { type:'linear', position:'right', ticks:{color:'#4ade80'}, grid:{display:false}, title:{display:true,text:'Carbono acumulado (Mt C)',color:'#4ade80'} }
      }}
    });

  } else {
    // Multi-system: split area equally among selected systems
    const N = selKeys.length;
    const areaPerSys = areaHa / Math.max(1, N);
    const sysList = selKeys.map(k => ({ key: k, ...SIM_SYSTEMS[k] })).filter(s => s.label);
    if (!sysList.length) { if (resEl) resEl.innerHTML = ''; return; }

    const totGeeRed   = sysList.reduce((a, s) => a + areaPerSys * (DEGRADED_EMISSION + s.seq_co2) / 1000, 0);
    const totGeeTotal = totGeeRed * years;
    const totCarbono  = sysList.reduce((a, s) => a + areaPerSys * s.carbon_ha * years / 1e6, 0);
    const totTempRed  = sysList.reduce((a, s) => a + s.temp_red * (areaPerSys / MA_DEGRADED_HA), 0);
    const totInvest   = sysList.reduce((a, s) => a + areaPerSys * s.invest_ha, 0);
    const totRenda    = sysList.reduce((a, s) => a + areaPerSys * s.renda_ha, 0);
    const totEmprego  = sysList.reduce((a, s) => a + (areaPerSys / 1000) * s.empregos, 0);
    const pctGEE_MA   = (totGeeRed / MA_GEE_KT * 100).toFixed(1);
    const sysLabel    = N <= 3 ? sysList.map(s => s.icon + ' ' + s.label).join(', ') : `${N} sistemas combinados`;

    if (resEl) resEl.innerHTML = `
      <div style="background:var(--bg2);border:1px solid var(--green3);border-radius:12px;padding:14px;margin-bottom:12px">
        <div style="font-size:12px;color:var(--green);font-weight:600;margin-bottom:4px">✅ Resultado Combinado — ${sysLabel}</div>
        <div style="font-size:11px;color:var(--text3)">Área de ${convState.pct}% degradada (${(areaHa/1e6).toFixed(2)} M ha) dividida igualmente entre ${N} sistema${N > 1 ? 's' : ''} em ${years} anos</div>
      </div>
      <div class="sim-result-grid">
        <div class="sim-result-card"><div class="sim-result-val" style="color:#4ade80">${totGeeRed.toFixed(0)} kt</div><div class="sim-result-label">Redução GEE/ano (CO₂eq)</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#60a5fa">${(totGeeTotal/1000).toFixed(2)} Mt</div><div class="sim-result-label">GEE total evitado em ${years} anos</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#86efac">${pctGEE_MA}%</div><div class="sim-result-label">% das emissões atuais do MA</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#2dd4bf">${totCarbono.toFixed(2)} Mt C</div><div class="sim-result-label">Carbono estocado no solo/biomassa</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#fbbf24">−${totTempRed.toFixed(2)}°C</div><div class="sim-result-label">Redução temperatura microclimática</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#f87171">R$ ${(totInvest/1e9).toFixed(2)} Bi</div><div class="sim-result-label">Investimento total necessário</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#c084fc">R$ ${(totRenda/1e9).toFixed(2)} Bi</div><div class="sim-result-label">Renda bruta gerada/ano</div></div>
        <div class="sim-result-card"><div class="sim-result-val" style="color:#fb923c">${Math.round(totEmprego).toLocaleString('pt-BR')}</div><div class="sim-result-label">Empregos gerados</div></div>
      </div>`;

    const ctx = document.getElementById('conv-chart'); if (!ctx) return;
    _destroyChart('conv');
    const opts = _darkChartDefaults();
    opts.interaction = { mode:'index', intersect:false };

    // Aggregate combined reduction at each year (sum of all selected systems)
    const totRedArr = years_arr.map(y =>
      sysList.reduce((acc, s) => {
        return acc + areaPerSys * (DEGRADED_EMISSION + s.seq_co2) / 1000 * _convDynamic(y, s.key);
      }, 0)
    );
    // Baseline MA GEE (no intervention: +0.8%/yr) and with combined systems
    const mBaseArr = years_arr.map(y => +(MA_GEE_KT * (1 + 0.008 * y)).toFixed(1));
    const mCombArr = years_arr.map((y, i) => +Math.max(
      MA_GEE_KT * 0.25,
      MA_GEE_KT * (1 + 0.008 * y) - totRedArr[i]
    ).toFixed(1));

    // Per-system reduction lines (right axis, thinner lines)
    const sysDatasets = sysList.map((s, i) => {
      const geeRedBase = areaPerSys * (DEGRADED_EMISSION + s.seq_co2) / 1000;
      const data = years_arr.map(y => +(geeRedBase * _convDynamic(y, s.key)).toFixed(1));
      const col  = s.color || `hsl(${i * 360 / sysList.length},70%,60%)`;
      return {
        label: s.icon + ' ' + s.label,
        data, borderColor: col, backgroundColor: col + '18',
        fill: false, tension: 0.4, yAxisID: 'y1',
        borderWidth: 1.5, pointRadius: 0
      };
    });

    _simCharts['conv'] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [
        { label: 'GEE MA sem intervenção (kt/ano)', data: mBaseArr,
          borderColor: 'rgba(248,113,113,0.40)', borderDash: [6,4],
          fill: false, tension: 0.3, yAxisID: 'y', pointRadius: 0, borderWidth: 2 },
        { label: 'GEE MA com sistemas (kt/ano)', data: mCombArr,
          borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.10)',
          fill: true, tension: 0.4, yAxisID: 'y', borderWidth: 2 },
        ...sysDatasets
      ]},
      options: { ...opts, scales: {
        x:  { ticks:{color:'#6b9b6b'}, grid:{color:'rgba(74,222,128,0.08)'} },
        y:  { type:'linear', position:'left',  ticks:{color:'#f87171'}, grid:{color:'rgba(248,113,113,0.06)'},
              title:{display:true,text:'GEE MA (kt CO₂eq/ano)',color:'#f87171'} },
        y1: { type:'linear', position:'right', ticks:{color:'#4ade80'}, grid:{display:false},
              title:{display:true,text:'Redução por sistema (kt CO₂eq/ano)',color:'#4ade80'} }
      }}
    });
  }

  // Comparison chart: always all systems with full areaHa
  const cmpCtx = document.getElementById('conv-cmp-chart'); if (!cmpCtx) return;
  _destroyChart('conv-cmp');
  const sysKeys   = Object.keys(SIM_SYSTEMS);
  const cmpVals   = sysKeys.map(k => +(areaHa * (DEGRADED_EMISSION + SIM_SYSTEMS[k].seq_co2) * years / 1e6).toFixed(2));
  const cmpColors = sysKeys.map(k => SIM_SYSTEMS[k].color);
  const cmpOpts   = _darkChartDefaults();
  cmpOpts.plugins.legend = { display:false };
  cmpOpts.scales.y.title = { display:true, text:'Mt CO₂eq evitado em ' + years + ' anos', color:'#a3c9a3' };
  _simCharts['conv-cmp'] = new Chart(cmpCtx, {
    type:'bar',
    data: { labels: sysKeys.map(k => SIM_SYSTEMS[k].icon + ' ' + SIM_SYSTEMS[k].label), datasets:[{
      label:'GEE evitado (Mt CO₂eq)',
      data: cmpVals,
      backgroundColor: cmpColors,
      borderRadius: 6
    }]},
    options: cmpOpts
  });
}

/* ─────────── SIMULADOR 2: PLANTIO INTERATIVO ─────────── */
function updatePlantio() {
  const sysKey = document.getElementById('plt-sys')?.value || plantioState.system;
  const area   = +document.getElementById('plt-area')?.value || plantioState.area;
  const el     = +document.getElementById('plt-el')?.value   || plantioState.espaco_linha;
  const ep     = +document.getElementById('plt-ep')?.value   || plantioState.espaco_planta;
  const ang    = +document.getElementById('plt-ang')?.value  || plantioState.angulo;
  plantioState = { system: sysKey, area, espaco_linha: el, espaco_planta: ep, angulo: ang };

  const pv = id => document.getElementById(id);
  if (pv('plt-area-val')) pv('plt-area-val').textContent = area+' ha';
  if (pv('plt-el-val'))   pv('plt-el-val').textContent   = el+' m';
  if (pv('plt-ep-val'))   pv('plt-ep-val').textContent   = ep+' m';
  if (pv('plt-ang-val'))  pv('plt-ang-val').textContent  = ang+'°';

  _drawPlantioCanvas();
  _calcPlantioMetrics();
  _buildCarbonChart();
}

function _drawPlantioCanvas() {
  const canvas = document.getElementById('plantio-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  const sys = SIM_SYSTEMS[plantioState.system];
  const ang = (plantioState.angulo * Math.PI) / 180;
  const el = plantioState.espaco_linha, ep = plantioState.espaco_planta;

  // Background (soil)
  ctx.fillStyle = '#1a0f00';
  ctx.fillRect(0,0,W,H);

  ctx.save();
  ctx.translate(W/2, H/2);
  ctx.rotate(ang);

  const configs = {
    ilp: { bg:'#1a2e00', stripeColor:'#2a5e00', stripeW:0.35, dotColor:'#fbbf24', dotSize:4, dotSymbol:'●', showDots:false, stripeLabel:'Pastagem', bgLabel:'Lavoura' },
    ilpf:{ bg:'#1a2e00', stripeColor:'#0f4020', stripeW:0.2, dotColor:'#4ade80', dotSize:7, showDots:true, stripeLabel:'Floresta ILPF', bgLabel:'Lavoura+Pastagem' },
    saf: { bg:'#0a1a00', stripeColor:'#1a3500', stripeW:0.0, dotColor:'#86efac', dotSize:10, showDots:true, stripeLabel:'', bgLabel:'Culturas Consorciadas' },
    sisteminha:{ bg:'#1a1000', stripeColor:'#3a2000', stripeW:0.25, dotColor:'#fbbf24', dotSize:5, showDots:true, stripeLabel:'Horta', bgLabel:'Área principal' },
    apicultura:{ bg:'#0a1a08', stripeColor:'#1a3010', stripeW:0.0, dotColor:'#f59e0b', dotSize:8, showDots:true, stripeLabel:'', bgLabel:'Vegetação Nativa' },
    meliponicultura:{ bg:'#0a1a08', stripeColor:'#1a3010', stripeW:0.0, dotColor:'#d97706', dotSize:7, showDots:true, stripeLabel:'', bgLabel:'Vegetação Nativa' },
    roca:{ bg:'#1a1200', stripeColor:'#2a2200', stripeW:0.3, dotColor:'#a3e635', dotSize:5, showDots:true, stripeLabel:'Consórcio', bgLabel:'Roça Principal' },
    piscicultura:{ bg:'#003344', stripeColor:'#004466', stripeW:0.4, dotColor:'#22d3ee', dotSize:6, showDots:false, stripeLabel:'Viveiro', bgLabel:'Barragem/Canal', isWater:true },
    extrativismo:{ bg:'#021a00', stripeColor:'#0a2a00', stripeW:0.0, dotColor:'#a78bfa', dotSize:9, showDots:true, stripeLabel:'', bgLabel:'Floresta Nativa' },
    fruticultura:{ bg:'#0f2000', stripeColor:'#1a3500', stripeW:0.0, dotColor:'#fb923c', dotSize:8, showDots:true, stripeLabel:'', bgLabel:'Pomar' },
  };
  const cfg = configs[plantioState.system] || configs.ilpf;

  // BG fill
  ctx.fillStyle = cfg.bg;
  ctx.fillRect(-W, -H, W*2, H*2);

  // Stripes (rows)
  if (cfg.stripeW > 0) {
    const stripeH = el * cfg.stripeW * (H / 50);
    const rowSpacing = el * (H / 50);
    ctx.fillStyle = cfg.stripeColor;
    for (let y = -H; y < H; y += rowSpacing) {
      if (cfg.isWater) {
        ctx.fillStyle = '#006688';
        ctx.fillRect(-W, y, W*2, stripeH * 1.5);
      } else {
        ctx.fillRect(-W, y, W*2, stripeH);
      }
    }
  }

  // Tree/plant dots
  if (cfg.showDots) {
    const rowSpacing = el * (H / 50);
    const colSpacing = ep * (W / 50);
    ctx.fillStyle = cfg.dotColor;
    for (let y = -H; y < H; y += rowSpacing) {
      for (let x = -W; x < W; x += colSpacing) {
        const jitter = (Math.sin(x*y+7)*2);
        ctx.beginPath();
        ctx.arc(x+jitter, y+jitter, cfg.dotSize, 0, Math.PI*2);
        ctx.fill();
        if (cfg.dotSize >= 7) {
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.arc(x+jitter+1, y+jitter+1, cfg.dotSize * 0.4, 0, Math.PI*2);
          ctx.fill();
          ctx.fillStyle = cfg.dotColor;
        }
      }
    }
  }

  ctx.restore();

  // Overlay: compass and scale
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(1,1,W-2,H-2);

  // Norte arrow
  const cx = W-30, cy = 30, nr = 14;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px DM Sans';
  ctx.textAlign = 'center';
  ctx.fillText('N', 0, -nr-3);
  ctx.beginPath();
  ctx.moveTo(0, -nr); ctx.lineTo(nr*0.4, nr*0.5);
  ctx.lineTo(0, nr*0.2); ctx.lineTo(-nr*0.4, nr*0.5); ctx.closePath();
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
  ctx.restore();

  // Info overlay
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(6, H-36, 260, 30);
  ctx.fillStyle = '#a3c9a3';
  ctx.font = '10px DM Sans';
  ctx.textAlign = 'left';
  ctx.fillText(`${sys?.icon||''} ${sys?.label||''} · ${plantioState.area} ha · ${plantioState.espaco_linha}m × ${plantioState.espaco_planta}m · ${plantioState.angulo}°`, 10, H-17);

  // Legend pills
  const legEl = document.getElementById('plantio-legend');
  if (legEl) {
    const items = [];
    if (cfg.showDots) items.push(`<span style="color:${cfg.dotColor}">⬤</span> ${sys?.desc || ''}`);
    if (cfg.isWater) items.push('🔵 Viveiros de piscicultura');
    legEl.innerHTML = items.join(' &nbsp; ');
  }
}

function _calcPlantioMetrics() {
  const sys = SIM_SYSTEMS[plantioState.system];
  if (!sys) return;
  const a = plantioState.area;
  const nPlantas = Math.floor((a * 10000) / (plantioState.espaco_linha * plantioState.espaco_planta));
  const co2AnualT = a * sys.seq_co2;
  const rendaAnual = a * sys.renda_ha;
  const el = document.getElementById('plt-metrics'); if (!el) return;
  el.innerHTML = `
    <div class="sim-result-grid" style="grid-template-columns:1fr 1fr">
      <div class="sim-result-card">
        <div class="sim-result-val" style="font-size:16px">${nPlantas.toLocaleString('pt-BR')}</div>
        <div class="sim-result-label">Plantas/Colônias no plantio</div>
      </div>
      <div class="sim-result-card">
        <div class="sim-result-val" style="font-size:16px;color:#4ade80">${co2AnualT.toFixed(1)} t</div>
        <div class="sim-result-label">CO₂eq sequestrado/ano</div>
      </div>
      <div class="sim-result-card">
        <div class="sim-result-val" style="font-size:16px;color:#c084fc">R$ ${rendaAnual.toLocaleString('pt-BR')}</div>
        <div class="sim-result-label">Renda estimada/ano</div>
      </div>
      <div class="sim-result-card">
        <div class="sim-result-val" style="font-size:16px;color:#fbbf24">${sys.biodiv}/10</div>
        <div class="sim-result-label">Índice biodiversidade</div>
      </div>
    </div>`;
}

function _buildCarbonChart() {
  const sys = SIM_SYSTEMS[plantioState.system];
  if (!sys) return;
  const ctx = document.getElementById('plt-carbon-chart'); if (!ctx) return;
  _destroyChart('plt-carbon');
  const years = Array.from({length:31},(_,i)=>i);
  const maturation = y => Math.min(1, y / (plantioState.system==='saf'||plantioState.system==='ilpf'?10:5));
  const seqArr = years.map(y => +(plantioState.area * sys.seq_co2 * maturation(y) * y / 1000).toFixed(2)); // kt
  const opts = _darkChartDefaults();
  opts.plugins.legend = { display:false };
  opts.scales.y.title = { display:true, text:'CO₂eq sequestrado (t)', color:'#a3c9a3' };
  _simCharts['plt-carbon'] = new Chart(ctx, {
    type:'line',
    data:{ labels: years.map(y=>2025+y),
      datasets:[{
        label:'Carbono sequestrado (t CO₂eq)', data: seqArr.map(v=>v*1000),
        borderColor: SIM_SYSTEMS[plantioState.system]?.color||'#4ade80',
        backgroundColor: 'rgba(74,222,128,0.12)', fill:true, tension:0.4
      }]},
    options: opts
  });
}

/* ─────────── SIMULADOR 3: SAZONALIDADE ─────────── */
function updateMeteoChart() {
  const regEl = document.getElementById('meteo-reg');
  const sysEl = document.getElementById('meteo-sys');
  const reg = regEl?.value || Object.keys(CLIMATE_MONTHLY)[0];
  const sysKey = sysEl?.value || 'ilpf';
  const sys = SIM_SYSTEMS[sysKey];
  // Try exact match, then partial match, then first available
  const clim = CLIMATE_MONTHLY[reg]
    || Object.entries(CLIMATE_MONTHLY).find(([k])=>reg.includes(k)||k.includes(reg))?.[1]
    || Object.values(CLIMATE_MONTHLY)[0];

  const ctx = document.getElementById('meteo-chart'); if (!ctx) return;
  _destroyChart('meteo');
  const opts = _darkChartDefaults();
  opts.interaction = { mode:'index', intersect:false };
  _simCharts['meteo'] = new Chart(ctx, {
    type:'bar',
    data:{ labels: MONTHS_PT,
      datasets:[
        { label:'Precipitação (mm)', data: clim.p, backgroundColor:'rgba(96,165,250,0.7)', yAxisID:'y', type:'bar', borderRadius:4 },
        { label:'Temperatura (°C)', data: clim.t, borderColor:'#f87171', backgroundColor:'transparent', type:'line', tension:0.4, yAxisID:'y1', pointRadius:4 }
      ]},
    options:{ ...opts, scales:{
      x:{ ticks:{color:'#6b9b6b'}, grid:{color:'rgba(74,222,128,0.06)'} },
      y:{ type:'linear', position:'left', ticks:{color:'#60a5fa'}, grid:{color:'rgba(96,165,250,0.06)'}, title:{display:true,text:'Precipitação (mm)',color:'#60a5fa'} },
      y1:{ type:'linear', position:'right', ticks:{color:'#f87171'}, grid:{display:false}, title:{display:true,text:'Temperatura (°C)',color:'#f87171'} }
    }}
  });

  const solarCtx = document.getElementById('meteo-solar-chart'); if (!solarCtx) return;
  _destroyChart('meteo-solar');
  // Favorability score for each month based on system requirements
  const favorScores = MONTHS_PT.map((_, i) => {
    let score = clim.r[i];
    if (clim.p[i] > 150) score += 2; // boa chuva
    if (clim.p[i] < 30 && ['saf','ilpf','ilp'].includes(sysKey)) score -= 3;
    if (['apicultura','meliponicultura'].includes(sysKey) && clim.p[i] < 60) score += 1; // seca = colheita
    return Math.max(0, Math.min(10, score));
  });
  const opts2 = _darkChartDefaults();
  opts2.plugins.legend = { display:true, labels:{color:'#a3c9a3', font:{size:10}} };
  _simCharts['meteo-solar'] = new Chart(solarCtx, {
    type:'bar',
    data:{ labels: MONTHS_PT,
      datasets:[
        { label:'Radiação Solar (índice 1-10)', data: clim.r, backgroundColor:'rgba(251,191,36,0.6)', borderRadius:4 },
        { label:`Favorabilidade p/ ${sys?.label||sysKey} (1-10)`, data: favorScores, backgroundColor:'rgba(74,222,128,0.5)', borderRadius:4 }
      ]},
    options: { ...opts2, scales:{ x:{ticks:{color:'#6b9b6b'},grid:{color:'rgba(74,222,128,0.06)'}}, y:{ticks:{color:'#a3c9a3'},grid:{color:'rgba(74,222,128,0.06)'},max:12} } }
  });

  // Calendário
  const calEl = document.getElementById('meteo-calendario'); if (!calEl) return;
  const ATIV = {
    ilp: ['Colheita/prep','Prep solo','Plantio lavoura','Lavoura','Lavoura','Entrada gado','Pastejo','Pastejo','Pastejo','Saída gado','Prep','Descanso'],
    ilpf:['Colheita','Prep','Plantio milho','Lavoura','Lavoura','Poda árvores','Seca','Manutenção','Gado','Gado','Prep','Descanso'],
    saf:['Colheita','Poda','Plantio','Trato','Trato','Colheita frutas','Manutenção','Manutenção','Colheita','Colheita','Poda','Plantio'],
    apicultura:['Colheita mel','Mel+manutenção','Chuva-espera','Florada','Florada','Colheita','Seca-colheita','Seca-colheita','Florada','Florada','Colheita','Colheita'],
    piscicultura:['Alevinagem','Alevinagem','Engorda','Engorda','Colheita','Colheita','Secagem','Manutenção','Alevinagem','Engorda','Engorda','Colheita'],
    roca:['Descanso','Prep','Plantio','Cultivo','Cultivo','Colheita','Pousio','Pousio','Prep','Plantio','Cultivo','Colheita'],
  };
  const ativ = ATIV[sysKey] || ATIV.saf;
  const colors = MONTHS_PT.map((_,i) => favorScores[i]>=7?'var(--green3)':favorScores[i]>=4?'var(--amber)':'var(--border2)');
  calEl.innerHTML = `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">
    ${MONTHS_PT.map((m,i)=>`<div style="background:${colors[i]};border-radius:8px;padding:7px 8px;text-align:center">
      <div style="font-weight:700;font-size:12px;color:#fff">${m}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.85);margin-top:2px">${ativ[i]||'—'}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.6);margin-top:1px">${clim.p[i]}mm ${clim.t[i]}°C</div>
    </div>`).join('')}
  </div>`;
}

/* ─────────── SIMULADOR 4: VULNERABILIDADE ─────────── */
function calcVulnScore(row) {
  if (!row) return 0;
  const norm = (v, mn, mx) => (v-mn)/(mx-mn||1);
  const gees = _allVals(MC.gee), dets = _allVals(MC.desmat), pobs = _allVals(MC.pob), fomes = _allVals(MC.fome), idhs = _allVals(MC.idh), pibs = _allVals(MC.pib);
  return (
    norm(_simVal(row,MC.gee),Math.min(...gees),Math.max(...gees))*0.2 +
    norm(_simVal(row,MC.desmat),Math.min(...dets),Math.max(...dets))*0.2 +
    norm(_simVal(row,MC.pob),Math.min(...pobs),Math.max(...pobs))*0.2 +
    norm(_simVal(row,MC.fome),Math.min(...fomes),Math.max(...fomes))*0.2 +
    (1-norm(_simVal(row,MC.idh),Math.min(...idhs),Math.max(...idhs)))*0.1 +
    (1-norm(_simVal(row,MC.pib),Math.min(...pibs),Math.max(...pibs)))*0.1
  );
}

function updateVulnChart() {
  const selEl = document.getElementById('vuln-munic');
  const municName = selEl?.value || _getMD()[0]?.[MC.name] || '';
  const row = _getMD().find(r=>r[MC.name]===municName);

  if (row) {
    const score = calcVulnScore(row);
    const scoreEl = document.getElementById('vuln-score-box');
    if (scoreEl) {
      const color = score>0.7?'#f87171':score>0.4?'#fbbf24':'#4ade80';
      const label = score>0.7?'Alta Vulnerabilidade':score>0.4?'Vulnerabilidade Moderada':'Baixa Vulnerabilidade';
      scoreEl.innerHTML = `
        <div style="text-align:center;padding:12px;background:var(--card);border-radius:10px;border:1px solid ${color}">
          <div style="font-size:28px;font-weight:800;color:${color}">${(score*100).toFixed(0)}</div>
          <div style="font-size:11px;color:${color};font-weight:600">${label}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:4px">Índice composto 0-100</div>
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--text3)">Solo: ${row[MC.solo]}<br>Bacia: ${row[MC.bacia]}<br>Bioma: ${row[MC.bioma]}</div>`;
    }

    // Radar chart
    const radarCtx = document.getElementById('vuln-radar-chart'); if (!radarCtx) return;
    _destroyChart('vuln-radar');
    const radarKeys = ['gee','desmat','pob','fome','idh','pib'];
    const radarLabels = ['GEE','Desmat.','Pobreza','Fome','IDH','PIB'];
    // higher_better:false (GEE, desmat, pobreza, fome) → alto valor = mais vulnerável → n alto = grande no radar
    // higher_better:true  (IDH, PIB)                  → alto valor = melhor = menos vulnerável → 1-n grande = pequeno no radar
    const radarVals = radarKeys.map(k => {
      const cfg = COMP_IND[k];
      const vals = _allVals(cfg.col);
      const mn = Math.min(...vals), mx = Math.max(...vals);
      const raw = _simVal(row, cfg.col);
      const n = (raw-mn)/(mx-mn||1);
      //return (cfg.higher_better ? 1-n : n) * 100;
      return (cfg.higher_better ? n : 1-n) * 100;
    });
    const avgVals = radarKeys.map(k => {
      const cfg = COMP_IND[k];
      const vals = _allVals(cfg.col);
      const mn = Math.min(...vals), mx = Math.max(...vals);
      const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
      const n = (avg-mn)/(mx-mn||1);
      //return (cfg.higher_better ? 1-n : n) * 100;
      return (cfg.higher_better ? n : 1-n) * 100;
    });
    _simCharts['vuln-radar'] = new Chart(radarCtx, {
      type:'radar',
      data:{ labels: radarLabels, datasets:[
        { label: municName, data: radarVals, borderColor:'#f87171', backgroundColor:'rgba(248,113,113,0.2)', pointRadius:4 },
        { label:'Média MA', data: avgVals, borderColor:'#4ade80', backgroundColor:'rgba(74,222,128,0.1)', pointRadius:3, borderDash:[4,4] }
      ]},
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:'#a3c9a3', font:{size:11} } } },
        scales:{ r:{ ticks:{color:'#6b9b6b', backdropColor:'transparent', font:{size:9}}, grid:{color:'rgba(74,222,128,0.15)'}, pointLabels:{color:'#a3c9a3', font:{size:11}}, min:0, max:100 } }
      }
    });
  }

  // Ranking: top 20 most vulnerable
  const ranked = _getMD().map(r=>({ name:r[MC.name], score:calcVulnScore(r) }))
    .sort((a,b)=>b.score-a.score).slice(0,20);
  const rkCtx = document.getElementById('vuln-rank-chart'); if (!rkCtx) return;
  _destroyChart('vuln-rank');
  const rkOpts = _darkChartDefaults();
  rkOpts.indexAxis = 'y';
  rkOpts.plugins.legend = { display:false };
  rkOpts.scales.x.max = 1;
  rkOpts.scales.x.title = { display:true, text:'Índice de Vulnerabilidade (0-1)', color:'#a3c9a3' };
  _simCharts['vuln-rank'] = new Chart(rkCtx, {
    type:'bar',
    data:{ labels: ranked.map(r=>r.name), datasets:[{
      label:'Vulnerabilidade',
      data: ranked.map(r=>r.score),
      backgroundColor: ranked.map(r => r.score>0.7?'rgba(248,113,113,0.8)':r.score>0.4?'rgba(251,191,36,0.8)':'rgba(74,222,128,0.8)'),
      borderRadius:4
    }]},
    options: rkOpts
  });
}
