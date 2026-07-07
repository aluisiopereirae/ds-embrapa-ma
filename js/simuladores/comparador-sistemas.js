// ═══════════════════════════════════════════════════════════════════════════
// COMPARADOR LADO A LADO DE SISTEMAS — 2-3 sistemas produtivos na mesma área
// Espelha o padrão já existente de sa_compararVariantes (metricas.js), mas
// indexando por sistema (SA_SYSTEMS) em vez de por variante de um único sistema.
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

let _cmpChart = null;

// Compara N sistemas na mesma área (ha), usando a variante indicada (ou a 1ª de cada)
function sa_compararSistemas(systemKeys, areaHa, variantIds) {
  return systemKeys.filter(k => SA_SYSTEMS[k]).map((k, i) => {
    const sys = SA_SYSTEMS[k];
    const variant = (variantIds && variantIds[i] && sys.variants.find(v => v.id === variantIds[i])) || sys.variants[0];
    const refCompat = (typeof REC_COMPAT !== 'undefined') ? REC_COMPAT[k] : null;
    return {
      key: k, label: sys.label, icon: sys.icon, variantLabel: variant.label,
      rendaAnual: areaHa * variant.renda_ha,
      investTotal: areaHa * variant.invest_ha,
      payback: refCompat ? refCompat.payback : (variant.invest_ha / Math.max(1, variant.renda_ha*0.65)),
      carbon10anos: areaHa * variant.carbon_ha * 10,
      empregos: Math.round((areaHa / 100) * variant.empregos),
      biodiv: variant.biodiv,
    };
  });
}

function cmp_buildHTML() {
  const sysOptions = Object.entries(SA_SYSTEMS).map(([k,v]) => `<option value="${k}">${v.icon} ${v.label}</option>`).join('');
  const seletor = (id, defaultIdx) => `
    <select class="form-select" id="${id}">
      <option value="">— nenhum —</option>
      ${sysOptions}
    </select>`;
  return `
  <div class="chart-card" style="margin-bottom:12px">
    <div class="chart-title">🔀 Comparador Lado a Lado de Sistemas Produtivos
      <span class="badge-pendente" title="Compara médias por sistema/variante — condições locais reais podem alterar o resultado">⚠</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:12px">
      <div class="form-group"><label class="form-label">Sistema A</label>${seletor('cmp-sys-a')}</div>
      <div class="form-group"><label class="form-label">Sistema B</label>${seletor('cmp-sys-b')}</div>
      <div class="form-group"><label class="form-label">Sistema C (opcional)</label>${seletor('cmp-sys-c')}</div>
      <div class="form-group"><label class="form-label">Área comum (ha)</label>
        <input class="form-input" id="cmp-area" type="number" value="10" min="0.1" step="0.5"></div>
      <div style="display:flex;align-items:flex-end">
        <button class="btn btn-primary" style="width:100%" onclick="cmp_calcular()">🔄 Comparar</button>
      </div>
    </div>
    <div class="chart-wrap" style="height:280px;margin-bottom:14px"><canvas id="cmp-chart"></canvas></div>
    <div class="table-wrap" style="overflow-x:auto">
      <table class="data-table" id="cmp-tabela"></table>
    </div>
  </div>`;
}

function cmp_init() {
  const keys = Object.keys(SA_SYSTEMS);
  const a = document.getElementById('cmp-sys-a'), b = document.getElementById('cmp-sys-b'), c = document.getElementById('cmp-sys-c');
  if (a && !a.value) a.value = (_saState && _saState.system) || keys[0];
  if (b && !b.value) b.value = keys.find(k => k !== a.value) || keys[1];
  cmp_calcular();
}

function cmp_calcular() {
  const area = parseFloat(document.getElementById('cmp-area')?.value) || 10;
  const keys = ['cmp-sys-a','cmp-sys-b','cmp-sys-c']
    .map(id => document.getElementById(id)?.value)
    .filter(Boolean);
  if (keys.length < 2) {
    document.getElementById('cmp-tabela').innerHTML = '<tbody><tr><td style="padding:10px;color:var(--text3)">Selecione ao menos 2 sistemas para comparar.</td></tr></tbody>';
    return;
  }

  const comp = sa_compararSistemas(keys, area);

  const opts = typeof _darkChartDefaults === 'function' ? _darkChartDefaults() : {};
  if (_cmpChart) _cmpChart.destroy();
  _cmpChart = new Chart(document.getElementById('cmp-chart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Renda/ano (R$ mil)', 'Investimento (R$ mil)', 'Payback (anos)', 'Carbono 10 anos (t)', 'Empregos', 'Biodiversidade (0-10)'],
      datasets: comp.map((c, i) => ({
        label: `${c.icon} ${c.label}`,
        data: [c.rendaAnual/1000, c.investTotal/1000, c.payback, c.carbon10anos, c.empregos, c.biodiv],
        backgroundColor: ['#4ade80','#60a5fa','#fbbf24'][i] || '#a78bfa',
      })),
    },
    options: { ...opts, plugins: { ...(opts.plugins||{}), title: { display: true, text: `Comparação em ${area} ha`, color: '#a3c9a3' } } }
  });

  const linhas = comp.map(c => `<tr>
    <td>${c.icon} <strong>${c.label}</strong><br><span style="font-size:9px;color:var(--text3)">${c.variantLabel}</span></td>
    <td>R$ ${c.rendaAnual.toLocaleString('pt-BR',{maximumFractionDigits:0})}</td>
    <td>R$ ${c.investTotal.toLocaleString('pt-BR',{maximumFractionDigits:0})}</td>
    <td>${c.payback.toFixed(1)} anos</td>
    <td>${c.carbon10anos.toFixed(1)} t</td>
    <td>${c.empregos}</td>
    <td>${c.biodiv.toFixed(1)}</td>
  </tr>`).join('');
  document.getElementById('cmp-tabela').innerHTML = `
    <thead><tr><th>Sistema</th><th>Renda/ano</th><th>Investimento</th><th>Payback</th><th>Carbono/10 anos</th><th>Empregos/100ha</th><th>Biodiversidade</th></tr></thead>
    <tbody>${linhas}</tbody>`;
}
