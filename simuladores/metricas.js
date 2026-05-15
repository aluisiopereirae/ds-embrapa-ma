// Cálculo de Métricas Agronômicas — Módulo de Simuladores
// Índice de Shannon-Wiener, carbono, renda, empregos, compatibilidade

function sa_shannonIndex(speciesCounts) {
  const total = Object.values(speciesCounts).reduce((a, b) => a + b, 0);
  if (!total) return 0;
  return -Object.values(speciesCounts).reduce((sum, n) => {
    const p = n / total;
    return p > 0 ? sum + p * Math.log(p) : sum;
  }, 0);
}

function sa_calcMetricas(state, positions) {
  const sys = SA_SYSTEMS[state.system];
  if (!sys) return {};
  const variant = sys.variants.find(v => v.id === state.variant) || sys.variants[0];
  if (!variant) return {};

  const areaHa = state.area;
  const areaM2 = areaHa * 10000;
  const nPlantas = positions.length;
  const density = areaHa > 0 ? nPlantas / areaHa : 0;

  // Contagem por espécie
  const speciesCounts = {};
  positions.forEach(p => {
    const k = p.speciesIdx;
    speciesCounts[k] = (speciesCounts[k] || 0) + 1;
  });
  const shannonH = sa_shannonIndex(speciesCounts);
  const richness = Object.keys(speciesCounts).length;

  // Economia
  const rendaAnual = areaHa * variant.renda_ha;
  const investTotal = areaHa * variant.invest_ha;
  const lucroLiquidoAnual = rendaAnual * 0.65; // margem 65%
  const paybackAnos = lucroLiquidoAnual > 0 ? investTotal / lucroLiquidoAnual : 99;

  // Carbono e GEE
  const carbonAnual = areaHa * variant.carbon_ha;       // t C/ano
  const carbon10anos = carbonAnual * 10;
  const geeAnual = carbonAnual * 3.667;                 // t CO₂eq/ano (fator C→CO₂)

  // Água
  const aguaAnual = areaHa * variant.agua_ha;           // m³/ano

  // Empregos (base 100 ha)
  const empregosGerados = Math.round((areaHa / 100) * variant.empregos);

  // Cobertura de copa
  let areaCobertura = 0;
  positions.forEach(p => {
    const si = Math.min(p.speciesIdx, variant.species.length - 1);
    const cr = variant.species[si]?.crown || 0.5;
    areaCobertura += Math.PI * cr * cr;
  });
  const coberturaPercent = Math.min(100, (areaCobertura / areaM2) * 100);

  // Validação de espaçamentos
  const recRow = variant.spacingRow, recPlant = variant.spacingPlant;
  const rowOk = Math.abs(state.spacingRow - recRow) / (recRow || 1) < 0.4;
  const plantOk = Math.abs(state.spacingPlant - recPlant) / (recPlant || 1) < 0.4;

  // Alertas
  const alertas = [];
  if (!rowOk) alertas.push({ tipo: 'warning', msg: `Espaçamento entre linhas recomendado: ${recRow}m · atual: ${state.spacingRow}m` });
  if (!plantOk) alertas.push({ tipo: 'warning', msg: `Espaçamento entre plantas recomendado: ${recPlant}m · atual: ${state.spacingPlant}m` });
  if (density > 8000) alertas.push({ tipo: 'error', msg: 'Densidade acima de 8.000 pl/ha — alta competição por luz e nutrientes.' });
  if (coberturaPercent > 95) alertas.push({ tipo: 'warning', msg: 'Cobertura de copa >95% — avaliar entrada de luz para sub-bosque.' });
  const lim = SA_AREA_LIMITS[state.system];
  if (lim && areaHa < lim.min) alertas.push({ tipo: 'info', msg: `Área abaixo do mínimo recomendado (${lim.min} ha) para ${sys.label}.` });
  if (lim && areaHa > lim.max) alertas.push({ tipo: 'warning', msg: `Área acima do máximo recomendado (${lim.max} ha).` });
  if (state.system === 'piscicultura' && areaHa > 5) {
    alertas.push({ tipo: 'info', msg: 'Área >5 ha de piscicultura requer licença ambiental SEMA/MA.' });
  }

  const recomendacoes = sa_gerarRecomendacoes(state, variant, density, coberturaPercent, richness);

  return {
    nPlantas, density, richness, shannonH,
    rendaAnual, rendaMensal: rendaAnual / 12,
    investTotal, paybackAnos,
    carbonAnual, carbon10anos, geeAnual,
    aguaAnual, coberturaPercent,
    empregosGerados,
    alertas, recomendacoes,
    spacingOk: rowOk && plantOk,
    speciesCounts
  };
}

function sa_gerarRecomendacoes(state, variant, density, cobertura, richness) {
  const recs = [];
  const k = state.system;

  if (['saf', 'ilpf'].includes(k) && richness < 3) {
    recs.push('💡 SAF/ILPF com 3+ espécies apresentam maior resiliência e biodiversidade funcional.');
  }
  if (['ilp', 'ilpf'].includes(k) && state.spacingRow < 12) {
    recs.push('🚜 Para ILP/ILPF com bovinos e mecanização, espaçamento entre renques ≥14m facilita o trânsito de máquinas.');
  }
  if (['apicultura', 'meliponicultura'].includes(k)) {
    recs.push('🌸 Instale colmeias próximas a floradas nativas. Raio de voo: 1-2 km para melipôneos, até 3 km para Apis mellifera.');
  }
  if (k === 'sisteminha') {
    recs.push('🏠 Posicione o tanque de peixe para capturar água da chuva e efluente orgânico da horta — reduz insumos externos.');
  }
  if (k === 'extrativismo') {
    recs.push('🌳 Extrativismo sustentável: colete no máximo 40-50% da produção anual por touceira/palmeira para garantir regeneração.');
  }
  if (cobertura > 85) {
    recs.push('☀️ Alta cobertura de copa (>85%): prefira espécies tolerantes à sombra no sub-bosque e monitore temperatura do solo.');
  }
  if (density > 0 && density < 30 && ['ilp', 'roca'].includes(k)) {
    recs.push('📏 Densidade baixa para lavoura — verifique espaçamentos recomendados para o sistema selecionado.');
  }
  if (k === 'piscicultura') {
    recs.push('💧 Calcule a renovação hídrica: tilápia exige 5-15% de renovação diária; tambaqui suporta menor oxigenação.');
  }
  if (k === 'ilpf' && state.spacingRow >= 20) {
    recs.push('🌾 Espaçamento amplo: aproveite as faixas com soja nos primeiros 3-4 anos antes do fechamento do dossel arbóreo.');
  }
  if (['saf'].includes(k) && variant.species.length >= 4) {
    recs.push('🌿 SAF multi-espécie: estabeleça as espécies em etapas — pioneiras primeiro, espécies clímax após 2-3 anos.');
  }
  return recs;
}

// Comparação de todas as variantes de um sistema
function sa_compararVariantes(systemKey, areaHa) {
  const sys = SA_SYSTEMS[systemKey];
  if (!sys) return [];
  return sys.variants.map(v => ({
    label: v.label,
    rendaAnual: areaHa * v.renda_ha,
    investTotal: areaHa * v.invest_ha,
    carbon10anos: areaHa * v.carbon_ha * 10,
    empregos: Math.round((areaHa / 100) * v.empregos),
    biodiv: v.biodiv
  }));
}
