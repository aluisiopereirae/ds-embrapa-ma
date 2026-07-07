// ═══════════════════════════════════════════════════════════════════════════
// CALENDÁRIO DE MANEJO / MÃO-DE-OBRA — cronograma anual por sistema/variante
// Onde há cultivo real correspondente em CRESC_CROPS (crescimento.js), usa
// mesIdeal/fases/recs reais daquele cultivo. Nos demais casos, usa um template
// sazonal genérico com base no regime chuvoso/seco do Maranhão (precip_mm em
// MUNIC_DATA) + laborIntensity do sistema (REC_COMPAT, recomendador.js).
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

const CAL_MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// Aliases (sem acento, minúsculo) para casar nomes de espécie (dados_agricolas.js)
// com as chaves de CRESC_CROPS (crescimento.js)
const CAL_ALIASES = {
  mandioca:['mandioca','macaxeira'], tomate:['tomate'], banana:['banana'], abacaxi:['abacaxi'],
  melancia:['melancia'], feijao:['feijao'], milho:['milho'], sorgo:['sorgo'], arroz:['arroz'],
  soja:['soja'], fava:['fava'], cana:['cana-de-acucar','cana'], bacuri:['bacuri'], pequi:['pequi'],
  acai:['acai','acaizeiro'], cupuacu:['cupuacu'], buriti:['buriti'], caju:['caju','cajueiro'],
  manga:['manga','mangueira'], laranja:['laranja'], mamao:['mamao'], limao:['limao'],
  maracuja:['maracuja'], acerola:['acerola'], goiaba:['goiaba'], tamarindo:['tamarindo'],
  coco:['coco','coqueiro'], alface:['alface'], couve:['couve'], coentro:['coentro'],
  cebolinha:['cebolinha'], pimentao:['pimentao'], quiabo:['quiabo'],
  batata_doce:['batata-doce','batata doce'], cara:['cara (dioscorea','cará (dioscorea'],
  inhame:['inhame'], jerimum:['jerimum','abobora'],
};

function cal_normalize(s) {
  return String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function cal_matchCrop(speciesName) {
  if (typeof CRESC_CROPS === 'undefined') return null;
  const n = cal_normalize(speciesName);
  for (const [key, aliases] of Object.entries(CAL_ALIASES)) {
    if (aliases.some(a => n.includes(cal_normalize(a)))) {
      return CRESC_CROPS[key] ? { key, crop: CRESC_CROPS[key] } : null;
    }
  }
  return null;
}

// Monta as atividades mensais para uma espécie: usa dados reais do cultivo
// (ciclo curto, <=14 meses → recorrente todo ano) ou um template genérico.
function cal_atividadesEspecie(speciesName, laborIntensity) {
  const atividades = Array.from({length:12}, () => []);
  const match = cal_matchCrop(speciesName);

  if (match && match.crop.fases && match.crop.tblStep && match.crop.cicloBase <= 14) {
    const crop = match.crop;
    const mesIni = (crop.mesIdeal || 1) - 1;
    crop.fases.forEach((fase, i) => {
      const mes = (mesIni + i * crop.tblStep) % 12;
      const faseLower = cal_normalize(fase);
      const peso = /(colheita|plantio|emergencia|brotacao)/.test(faseLower) ? 1.0 : 0.5;
      atividades[mes].push({
        especie: speciesName, atividade: fase, rec: (crop.recs && crop.recs[i]) || '',
        peso: peso * (0.4 + 0.6*laborIntensity), fonte: crop.refs || 'Embrapa', real: true,
      });
    });
    return { atividades, real: true, cropNome: crop.nome, mesIdeal: crop.mesIdeal, refs: crop.refs };
  }

  // Fallback genérico — sazonalidade chuvosa (dez-mai) / seca (jun-nov) do MA
  const mesPlantio = match ? (match.crop.mesIdeal - 1) : 11; // dez por padrão (início das chuvas)
  atividades[mesPlantio % 12].push({ especie: speciesName, atividade: 'Plantio / implantação', rec: 'Início do período chuvoso — melhor época para implantação no MA.', peso: 1.0*(0.4+0.6*laborIntensity), fonte:'estimativa sazonal MA', real:false });
  for (let m = 0; m < 12; m++) {
    if (m === mesPlantio % 12) continue;
    atividades[m].push({ especie: speciesName, atividade: 'Tratos culturais / manejo contínuo', rec: '', peso: 0.35*(0.4+0.6*laborIntensity), fonte:'estimativa', real:false });
  }
  const mesColheita = (mesPlantio + 8) % 12; // pico de colheita estimado ~8 meses após implantação
  atividades[mesColheita].push({ especie: speciesName, atividade: 'Pico de colheita / manejo (estimado)', rec: 'Estimativa genérica — ajuste conforme ciclo real da espécie em campo.', peso: 1.0*(0.4+0.6*laborIntensity), fonte:'estimativa', real:false });

  return { atividades, real: false, cropNome: match ? match.crop.nome : speciesName, mesIdeal: match ? match.crop.mesIdeal : null };
}

let _calChart = null;

function cal_buildHTML() {
  return `
  <div class="chart-card" style="margin-bottom:12px">
    <div class="chart-title">📅 Calendário de Manejo e Mão-de-obra
      <span class="badge-pendente" title="Onde não há cultivo correspondente em base de dados real, o calendário usa estimativa sazonal genérica (regime chuvoso/seco do MA) — validar em campo">⚠</span>
    </div>
    <div id="cal-contexto" style="font-size:11px;color:var(--text3);margin-bottom:10px"></div>
    <div class="chart-wrap" style="height:220px;margin-bottom:14px"><canvas id="cal-chart-demanda"></canvas></div>
    <div class="table-wrap" style="max-height:420px;overflow-y:auto">
      <table class="data-table" id="cal-grade"></table>
    </div>
    <div id="cal-recs-mes" style="margin-top:12px"></div>
  </div>`;
}

function cal_init() {
  cal_calcular();
}

function cal_calcular() {
  const el = document.getElementById('cal-contexto');
  if (!el) return;
  if (!_saState || !_saState.system) {
    el.innerHTML = '⚠ Configure um sistema no painel do simulador (aba "Vista Superior") antes de ver o calendário.';
    return;
  }
  const sysKey = _saState.system;
  const sys = SA_SYSTEMS[sysKey];
  const variant = sys.variants.find(v => v.id === _saState.variant) || sys.variants[0];
  const laborIntensity = (typeof REC_COMPAT !== 'undefined' && REC_COMPAT[sysKey]) ? REC_COMPAT[sysKey].laborIntensity : 0.5;

  const especies = variant.species.map(s => s.name);
  const resultados = especies.map(nome => cal_atividadesEspecie(nome, laborIntensity));
  const nReal = resultados.filter(r => r.real).length;

  el.innerHTML = `📍 ${sys.icon} <strong>${sys.label}</strong> — ${variant.label} ·
    ${nReal}/${especies.length} espécie(s) com cronograma real (Embrapa/DSSAT/FAO/CIAT) ·
    intensidade de mão-de-obra do sistema: ${(laborIntensity*100).toFixed(0)}%`;

  // Demanda mensal agregada (soma de pesos de todas as espécies)
  const demandaMensal = Array(12).fill(0);
  const atividadesPorMes = Array.from({length:12}, () => []);
  resultados.forEach(r => {
    r.atividades.forEach((lista, m) => {
      lista.forEach(a => { demandaMensal[m] += a.peso; atividadesPorMes[m].push(a); });
    });
  });
  const maxDemanda = Math.max(1, ...demandaMensal);

  const opts = typeof _darkChartDefaults === 'function' ? _darkChartDefaults() : {};
  if (_calChart) _calChart.destroy();
  _calChart = new Chart(document.getElementById('cal-chart-demanda').getContext('2d'), {
    type: 'bar',
    data: { labels: CAL_MESES, datasets: [
      { label: 'Demanda relativa de mão-de-obra', data: demandaMensal.map(d => +(100*d/maxDemanda).toFixed(0)),
        backgroundColor: demandaMensal.map(d => d/maxDemanda > 0.66 ? '#f87171' : d/maxDemanda > 0.33 ? '#fbbf24' : '#4ade80') },
    ]},
    options: { ...opts, plugins: { ...(opts.plugins||{}), legend: { display:false }, title: { display: true, text: 'Demanda de Mão-de-obra por Mês (escala relativa)', color: '#a3c9a3' } } }
  });

  // Grade 12 meses × espécies
  const linhas = resultados.map((r, i) => {
    const cels = r.atividades.map((lista, m) => {
      if (!lista.length) return '<td></td>';
      const principal = lista.sort((a,b)=>b.peso-a.peso)[0];
      const cor = principal.real ? '#4ade80' : '#6b9b6b';
      return `<td style="font-size:9px;color:${cor}" title="${principal.rec||''}">${principal.atividade}</td>`;
    }).join('');
    return `<tr><td style="font-weight:600;font-size:11px">${especies[i]} ${r.real ? '<span title="Cronograma real (fonte: '+(r.refs||'Embrapa')+')">✔</span>' : '<span title="Estimativa sazonal genérica">≈</span>'}</td>${cels}</tr>`;
  }).join('');
  document.getElementById('cal-grade').innerHTML = `
    <thead><tr><th>Espécie</th>${CAL_MESES.map(m=>`<th>${m}</th>`).join('')}</tr></thead>
    <tbody>${linhas}</tbody>`;

  // Recomendações do mês corrente
  const mesAtual = new Date().getMonth();
  const recsHoje = atividadesPorMes[mesAtual].filter(a => a.rec);
  document.getElementById('cal-recs-mes').innerHTML = recsHoje.length ? `
    <div class="form-section-title" style="font-size:11px">💡 Recomendações para ${CAL_MESES[mesAtual]} (mês atual)</div>
    <ul style="font-size:11px;color:var(--text2);padding-left:18px">
      ${recsHoje.map(a => `<li><strong>${a.especie}:</strong> ${a.rec}</li>`).join('')}
    </ul>` : '';
}
