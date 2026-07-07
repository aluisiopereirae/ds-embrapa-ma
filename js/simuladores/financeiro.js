// ═══════════════════════════════════════════════════════════════════════════
// SIMULADOR FINANCEIRO — Payback, VPL e TIR por sistema/variante/área
// Reutiliza _saState, SA_SYSTEMS[...].variants[...] (invest_ha/renda_ha) e o
// payback de referência já calibrado por sistema em REC_COMPAT (recomendador.js).
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

let _finChartFluxo = null, _finChartReceita = null;

function fin_buildHTML() {
  return `
  <div class="chart-card" style="margin-bottom:12px">
    <div class="chart-title">💰 Simulador Financeiro — Payback, VPL e TIR
      <span class="badge-pendente" title="Projeção financeira paramétrica com base em custos/receitas médios Embrapa por sistema — validar com orçamento real do produtor">⚠</span>
    </div>
    <div id="fin-contexto" style="font-size:11px;color:var(--text3);margin-bottom:10px"></div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">
      <div class="form-group"><label class="form-label">Margem líquida (%)</label>
        <input class="form-input" id="fin-margem" type="number" value="65" min="1" max="99" step="1"></div>
      <div class="form-group"><label class="form-label">Taxa de desconto anual (%)</label>
        <input class="form-input" id="fin-taxa" type="number" value="10" min="0" max="50" step="0.5"></div>
      <div class="form-group"><label class="form-label">Horizonte de análise (anos)</label>
        <input class="form-input" id="fin-anos" type="number" value="10" min="3" max="30" step="1"></div>
      <div class="form-group"><label class="form-label">Produção ano 1 (% da plena)</label>
        <input class="form-input" id="fin-ramp1" type="number" value="30" min="0" max="100" step="5"></div>
      <div class="form-group"><label class="form-label">Produção ano 2 (% da plena)</label>
        <input class="form-input" id="fin-ramp2" type="number" value="65" min="0" max="100" step="5"></div>
      <div style="display:flex;align-items:flex-end">
        <button class="btn btn-primary" style="width:100%" onclick="fin_calcular()">🔄 Recalcular</button>
      </div>
    </div>

    <div id="fin-kpis" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px"></div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div class="chart-wrap" style="height:240px"><canvas id="fin-chart-fluxo"></canvas></div>
      <div class="chart-wrap" style="height:240px"><canvas id="fin-chart-receita"></canvas></div>
    </div>

    <div class="table-wrap" style="max-height:320px;overflow-y:auto">
      <table class="data-table" id="fin-tabela"></table>
    </div>
  </div>`;
}

// Bisseção sobre a curva de VPL(taxa) — robusta mesmo com fluxos de caixa não convencionais
function fin_calcTIR(cashflows) {
  const npv = rate => cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
  let lo = -0.99, hi = 5.0;
  let npvLo = npv(lo), npvHi = npv(hi);
  if (npvLo * npvHi > 0) return null; // sem raiz no intervalo (fluxo sempre positivo ou negativo)
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const npvMid = npv(mid);
    if (Math.abs(npvMid) < 1e-6) return mid;
    if ((npvMid > 0) === (npvLo > 0)) { lo = mid; npvLo = npvMid; } else { hi = mid; }
  }
  return (lo + hi) / 2;
}

function fin_init() {
  fin_calcular();
}

function fin_calcular() {
  const el = document.getElementById('fin-contexto');
  if (!el) return;
  if (!_saState || !_saState.system) {
    el.innerHTML = '⚠ Configure um sistema no painel do simulador (aba "Vista Superior") antes de usar o financeiro.';
    return;
  }

  const sysKey = _saState.system;
  const sys = SA_SYSTEMS[sysKey];
  const variant = sys.variants.find(v => v.id === _saState.variant) || sys.variants[0];
  const areaHa = _saState.area || SA_AREA_LIMITS[sysKey]?.def || 10;
  const refCompat = (typeof REC_COMPAT !== 'undefined') ? REC_COMPAT[sysKey] : null;

  const margem = (parseFloat(document.getElementById('fin-margem')?.value) || 65) / 100;
  const taxa = (parseFloat(document.getElementById('fin-taxa')?.value) || 10) / 100;
  const anos = parseInt(document.getElementById('fin-anos')?.value) || 10;
  const ramp1 = (parseFloat(document.getElementById('fin-ramp1')?.value) || 30) / 100;
  const ramp2 = (parseFloat(document.getElementById('fin-ramp2')?.value) || 65) / 100;

  el.innerHTML = `📍 ${sys.icon} <strong>${sys.label}</strong> — ${variant.label} · Área: ${areaHa} ha ·
    Investimento de referência: R$ ${variant.invest_ha.toLocaleString('pt-BR')}/ha · Renda plena de referência: R$ ${variant.renda_ha.toLocaleString('pt-BR')}/ha/ano
    <span style="font-size:9px">(fonte: ${variant.fonte||'Embrapa'})</span>`;

  const investTotal = areaHa * variant.invest_ha;
  const rendaPlenaAnual = areaHa * variant.renda_ha;

  const rampFactor = ano => ano === 1 ? ramp1 : ano === 2 ? ramp2 : 1;

  const receitas = [0], custos = [investTotal], fluxos = [-investTotal];
  for (let a = 1; a <= anos; a++) {
    const receita = rendaPlenaAnual * rampFactor(a);
    const lucro = receita * margem;
    const custoOperacional = receita - lucro;
    receitas.push(receita);
    custos.push(custoOperacional);
    fluxos.push(lucro);
  }

  // Payback simples (fluxo nominal acumulado)
  let acumulado = fluxos[0], paybackSimples = null;
  for (let a = 1; a < fluxos.length; a++) {
    const prev = acumulado;
    acumulado += fluxos[a];
    if (paybackSimples === null && acumulado >= 0) {
      paybackSimples = (a - 1) + (fluxos[a] !== 0 ? (-prev) / fluxos[a] : 0);
    }
  }

  // VPL e payback descontado
  const fluxosDescontados = fluxos.map((cf, t) => cf / Math.pow(1 + taxa, t));
  const vpl = fluxosDescontados.reduce((a, b) => a + b, 0);
  let acumDesc = fluxosDescontados[0], paybackDescontado = null;
  for (let a = 1; a < fluxosDescontados.length; a++) {
    const prev = acumDesc;
    acumDesc += fluxosDescontados[a];
    if (paybackDescontado === null && acumDesc >= 0) {
      paybackDescontado = (a - 1) + (fluxosDescontados[a] !== 0 ? (-prev) / fluxosDescontados[a] : 0);
    }
  }

  const tir = fin_calcTIR(fluxos);

  const kpiCard = (label, valor, nota, cor) => `
    <div class="sim-card" style="text-align:center;padding:10px">
      <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${label}</div>
      <div style="font-size:18px;font-weight:700;color:${cor||'var(--text1)'};margin:3px 0">${valor}</div>
      ${nota ? `<div style="font-size:9px;color:var(--text3)">${nota}</div>` : ''}
    </div>`;

  document.getElementById('fin-kpis').innerHTML = [
    kpiCard('Investimento Total', 'R$ ' + investTotal.toLocaleString('pt-BR', {maximumFractionDigits:0})),
    kpiCard('Payback Simples', paybackSimples!==null ? paybackSimples.toFixed(1)+' anos' : '> horizonte', refCompat ? `Ref. Embrapa: ${refCompat.payback} anos` : '', '#4ade80'),
    kpiCard('Payback Descontado', paybackDescontado!==null ? paybackDescontado.toFixed(1)+' anos' : '> horizonte', `Taxa ${(taxa*100).toFixed(1)}%/ano`),
    kpiCard('VPL', 'R$ ' + vpl.toLocaleString('pt-BR', {maximumFractionDigits:0}), `${anos} anos · ${(taxa*100).toFixed(1)}%/ano`, vpl>=0?'#4ade80':'#f87171'),
    kpiCard('TIR', tir!==null ? (tir*100).toFixed(1)+'% a.a.' : 'n/d', tir!==null && tir>taxa ? '✅ acima da taxa de desconto' : (tir!==null?'⚠ abaixo da taxa de desconto':''), tir!==null && tir>taxa ? '#4ade80':'#f87171'),
  ].join('');

  const labels = Array.from({length: anos+1}, (_, i) => 'Ano ' + i);
  const cumulativo = []; fluxos.reduce((acc, cf, i) => { const v = acc+cf; cumulativo.push(v); return v; }, 0);

  const opts = typeof _darkChartDefaults === 'function' ? _darkChartDefaults() : {};
  if (_finChartFluxo) _finChartFluxo.destroy();
  _finChartFluxo = new Chart(document.getElementById('fin-chart-fluxo').getContext('2d'), {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Fluxo de caixa acumulado (R$)', data: cumulativo, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.10)', fill: true, tension: 0.3 },
    ]},
    options: { ...opts, plugins: { ...(opts.plugins||{}), title: { display: true, text: 'Fluxo de Caixa Acumulado', color: '#a3c9a3' } } }
  });

  if (_finChartReceita) _finChartReceita.destroy();
  _finChartReceita = new Chart(document.getElementById('fin-chart-receita').getContext('2d'), {
    type: 'bar',
    data: { labels: labels.slice(1), datasets: [
      { label: 'Receita (R$/ano)', data: receitas.slice(1), backgroundColor: '#4ade80' },
      { label: 'Custo operacional (R$/ano)', data: custos.slice(1), backgroundColor: '#f87171' },
    ]},
    options: { ...opts, plugins: { ...(opts.plugins||{}), title: { display: true, text: 'Receita vs. Custo Operacional', color: '#a3c9a3' } } }
  });

  const linhasTabela = labels.map((l, i) => `<tr>
    <td>${l}</td><td>R$ ${receitas[i].toLocaleString('pt-BR',{maximumFractionDigits:0})}</td>
    <td>R$ ${custos[i].toLocaleString('pt-BR',{maximumFractionDigits:0})}</td>
    <td style="color:${fluxos[i]>=0?'#4ade80':'#f87171'}">R$ ${fluxos[i].toLocaleString('pt-BR',{maximumFractionDigits:0})}</td>
    <td style="color:${cumulativo[i]>=0?'#4ade80':'#f87171'}">R$ ${cumulativo[i].toLocaleString('pt-BR',{maximumFractionDigits:0})}</td>
  </tr>`).join('');
  document.getElementById('fin-tabela').innerHTML = `
    <thead><tr><th>Período</th><th>Receita</th><th>Custo/Investimento</th><th>Fluxo líquido</th><th>Fluxo acumulado</th></tr></thead>
    <tbody>${linhasTabela}</tbody>`;
}
