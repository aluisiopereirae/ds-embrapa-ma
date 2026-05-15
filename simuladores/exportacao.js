// Exportação — Módulo de Simuladores (PNG, JPG, CSV)

function sa_exportPNG(canvas, filename) {
  filename = filename || 'plantio';
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename + '_' + new Date().toISOString().slice(0, 10) + '.png';
  a.click();
}

function sa_exportJPG(canvas, filename) {
  filename = filename || 'plantio';
  // JPG não suporta transparência — aplica fundo branco
  const tmp = document.createElement('canvas');
  tmp.width = canvas.width; tmp.height = canvas.height;
  const ctx = tmp.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, tmp.width, tmp.height);
  ctx.drawImage(canvas, 0, 0);
  const a = document.createElement('a');
  a.href = tmp.toDataURL('image/jpeg', 0.92);
  a.download = filename + '_' + new Date().toISOString().slice(0, 10) + '.jpg';
  a.click();
}

function sa_exportCSV(state, positions, metrics) {
  const sys = SA_SYSTEMS[state.system];
  const variant = sys && (sys.variants.find(v => v.id === state.variant) || sys.variants[0]);

  const fmt = v => (v === null || v === undefined) ? '' : String(v).replace(/"/g, '""');

  const header = [
    ['=== SIMULADOR DE PLANTIO — EMBRAPA MARANHÃO ==='],
    ['Gerado em', new Date().toLocaleString('pt-BR')],
    [],
    ['PARÂMETROS DE ENTRADA'],
    ['Sistema', fmt(sys && sys.label)],
    ['Variante', fmt(variant && variant.label)],
    ['Área (ha)', state.area],
    ['Espaçamento entre linhas (m)', state.spacingRow],
    ['Espaçamento entre plantas (m)', state.spacingPlant],
    ['Ângulo das linhas (°)', state.angle || 0],
    ['Layout', state.layout],
    [],
    ['MÉTRICAS CALCULADAS'],
    ['Nº total de plantas', metrics.nPlantas || 0],
    ['Densidade (plantas/ha)', (metrics.density || 0).toFixed(0)],
    ['Riqueza de espécies', metrics.richness || 0],
    ['Índice Shannon-H', (metrics.shannonH || 0).toFixed(3)],
    ['Renda anual estimada (R$)', (metrics.rendaAnual || 0).toFixed(2)],
    ['Renda mensal estimada (R$)', (metrics.rendaMensal || 0).toFixed(2)],
    ['Investimento total (R$)', (metrics.investTotal || 0).toFixed(2)],
    ['Payback estimado (anos)', (metrics.paybackAnos || 0).toFixed(1)],
    ['Carbono estocado/ano (t C/ha)', (metrics.carbonAnual || 0).toFixed(2)],
    ['Carbono 10 anos (t C)', (metrics.carbon10anos || 0).toFixed(2)],
    ['GEE evitado/ano (t CO₂eq)', (metrics.geeAnual || 0).toFixed(2)],
    ['Cobertura de copa (%)', (metrics.coberturaPercent || 0).toFixed(1)],
    ['Empregos gerados', metrics.empregosGerados || 0],
    ['Consumo hídrico estimado (m³/ano)', (metrics.aguaAnual || 0).toFixed(0)],
    [],
    ['FONTES'],
    ['Fonte', fmt(variant && variant.fonte)],
    []
  ];

  const posHeader = [
    ['POSIÇÕES DAS PLANTAS'],
    ['Planta', 'X (m)', 'Y (m)', 'Linha', 'Coluna', 'Espécie']
  ];

  const posRows = positions.map((p, i) => {
    const si = Math.min(p.speciesIdx, (variant && variant.species ? variant.species.length - 1 : 0));
    const spName = (variant && variant.species && variant.species[si]) ? variant.species[si].name : '';
    return [i + 1, p.x.toFixed(2), p.y.toFixed(2), p.row, p.col, fmt(spName)];
  });

  const allRows = [...header, ...posHeader, ...posRows];
  const csv = allRows.map(r => r.map(c => '"' + fmt(c) + '"').join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'simulador_' + (state.system || 'plantio') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
