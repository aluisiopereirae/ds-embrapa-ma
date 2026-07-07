// ═══════════════════════════════════════════════════════════════════════════
// RELATÓRIO PDF — Ficha técnica por unidade produtiva
// Reutiliza DB, MUNIC_INFO, SYSTEM_ICONS/COLORS, o mapa Leaflet (#leaflet-map)
// e o mesmo padrão de captura já usado em downloadMapImage() (index.html).
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

const PDF_LABELS = {
  sistema:'Sistema produtivo', municipio:'Município', mesorregiao:'Mesorregião', bioma:'Bioma',
  altitude:'Altitude (m)', area_total:'Área total (ha)', ano_implantacao:'Ano de implantação',
  escala:'Escala', produtor:'Produtor(a)', status:'Status',
  temperatura_media:'Temperatura média (°C)', precipitacao:'Precipitação (mm)',
  renda_total:'Renda total (R$/ano)', balanco_carbono:'Balanço de carbono (t CO₂e)',
  sequestro_carbono:'Sequestro de carbono (t C)', emissao_total_co2e:'Emissão total (t CO₂e)',
  lotacao_animal:'Lotação animal (UA/ha)', biomassa_total:'Biomassa total (t/ha)',
  diversidade_especies:'Diversidade de espécies', cobertura_solo:'Cobertura do solo (%)',
  estoque_carbono:'Estoque de carbono (t C/ha)', eficiencia_uso_solo:'Eficiência de uso do solo (%)',
  num_colmeias:'Nº de colmeias', producao_mel:'Produção de mel (kg/ano)',
  producao_cera:'Produção de cera (kg/ano)', producao_propolis:'Produção de própolis (kg/ano)',
  taxa_ocupacao_colmeias:'Taxa de ocupação das colmeias (%)',
  producao_peixe:'Produção de peixe (t/ano)', area_lamina_agua:'Área de lâmina d\'água (ha)',
  produtividade_ton_ha:'Produtividade (t/ha)', ph_agua:'pH da água', oxigenio_dissolvido:'Oxigênio dissolvido (mg/L)',
  temperatura_agua:'Temperatura da água (°C)', producao_frutas:'Produção de frutas (t/ano)',
  area_plantada:'Área plantada (ha)', produtividade:'Produtividade (t/ha)',
  diversidade_culturas:'Diversidade de culturas', producao_total:'Produção total (t/ano)',
  tipo_producao:'Tipo de produção', sistema_cultivo:'Sistema de cultivo', tipo_area:'Tipo de área',
  producao_hortalicas:'Produção de hortaliças (kg/ano)', producao_aves:'Produção de aves (un.)',
  reciclajem_nutrientes:'Reciclagem de nutrientes (%)', eficiencia_sistema:'Eficiência do sistema (%)',
  idade_responsavel:'Idade do(a) responsável', tamanho_familia:'Tamanho da família',
  mao_obra:'Mão de obra (pessoas)', acesso_pronaf:'Acesso ao PRONAF', assistencia_tecnica:'Assistência técnica',
  beneficios_sociais:'Benefícios sociais', score_ebia:'Score EBIA', aversao_risco:'Aversão ao risco (1-5)',
  satisfacao_atividade:'Satisfação com a atividade (1-5)', intencao_inovacao:'Intenção de inovação (1-5)',
  medo_credito:'Medo de acessar crédito (1-5)', poligono:'Polígono do talhão',
  area_poligono_ha:'Área do talhão desenhado (ha)',
};

const PDF_GRUPOS = [
  { titulo: 'Dados Gerais', campos: ['sistema','municipio','mesorregiao','bioma','altitude','area_total','ano_implantacao','escala','produtor','status'] },
  { titulo: 'Clima Local', campos: ['temperatura_media','precipitacao'] },
  { titulo: 'Indicadores Econômicos e Ambientais', campos: ['renda_total','balanco_carbono','sequestro_carbono','emissao_total_co2e','area_poligono_ha'] },
  { titulo: 'Indicadores Específicos do Sistema', campos: [
      'lotacao_animal','biomassa_total','diversidade_especies','cobertura_solo','estoque_carbono','eficiencia_uso_solo',
      'num_colmeias','producao_mel','producao_cera','producao_propolis','taxa_ocupacao_colmeias',
      'producao_peixe','area_lamina_agua','produtividade_ton_ha','ph_agua','oxigenio_dissolvido','temperatura_agua',
      'producao_frutas','area_plantada','produtividade','diversidade_culturas','producao_total','tipo_producao',
      'sistema_cultivo','tipo_area','producao_hortalicas','producao_aves','reciclajem_nutrientes','eficiencia_sistema',
    ] },
  { titulo: 'Perfil Socioeconômico', campos: [
      'idade_responsavel','tamanho_familia','mao_obra','acesso_pronaf','assistencia_tecnica','beneficios_sociais',
      'score_ebia','aversao_risco','satisfacao_atividade','intencao_inovacao','medo_credito',
    ] },
];

function pdf_fmtValor(campo, v) {
  if (v === true) return 'Sim';
  if (v === false) return 'Não';
  if (typeof v === 'number') return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return String(v);
}

function pdf_wait(ms) { return new Promise(res => setTimeout(res, ms)); }

function pdf_getViewAtiva() {
  // showView() não marca classe "active" nos painéis (só alterna style.display) —
  // a variável global currentView é a fonte confiável da aba realmente visível.
  return (typeof currentView !== 'undefined' && currentView) ? currentView : 'overview';
}

async function pdf_logoDataUrl() {
  try {
    const resp = await fetch('img/logo_embrapai_cor.png');
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) { return null; }
}

// Mini gráfico comparativo (esta unidade vs média do sistema) via Chart.js offscreen
function pdf_graficoComparativo(d) {
  const mesmoSistema = DB.filter(x => x.sistema === d.sistema);
  const media = campo => {
    const vals = mesmoSistema.map(x => Number(x[campo])).filter(isFinite);
    return vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : 0;
  };
  // Canvas em alta resolução (2x da área de exibição no PDF) para que os textos
  // dos rótulos/legenda saiam nítidos e legíveis quando incorporados ao PDF.
  const canvas = document.createElement('canvas');
  canvas.width = 1440; canvas.height = 720;
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Renda total (R$)', 'Balanço de carbono (t CO₂e)'],
      datasets: [
        { label: `Esta unidade (#${d.id})`, data: [d.renda_total||0, d.balanco_carbono||0], backgroundColor: '#4ade80' },
        { label: `Média do sistema (${d.sistema.toUpperCase()})`, data: [media('renda_total'), media('balanco_carbono')], backgroundColor: '#6b9b6b' },
      ]
    },
    options: {
      responsive: false, animation: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 26 }, padding: 20, boxWidth: 30 } },
        title: { display: true, text: 'Comparação com a média do sistema produtivo', font: { size: 30 }, padding: 20 },
      },
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 22 } } },
        x: { ticks: { font: { size: 24 } } },
      }
    }
  });
  const img = chart.toBase64Image();
  chart.destroy();
  return img;
}

async function pdf_capturarMapa(d) {
  const originalView = pdf_getViewAtiva();
  if (originalView !== 'map') { showView('map'); await pdf_wait(500); }
  if (!map) return { img: null, originalView };

  const prevCenter = map.getCenter(), prevZoom = map.getZoom();
  map.setView([d.lat, d.lng], 14);
  await pdf_wait(700);

  let img = null;
  try {
    const mapContainer = document.getElementById('leaflet-map');
    const rect = mapContainer.getBoundingClientRect();
    const canvas = await html2canvas(mapContainer, {
      useCORS: true, allowTaint: true, backgroundColor: null,
      scale: window.devicePixelRatio || 2,
      scrollX: -window.scrollX, scrollY: -window.scrollY,
      width: rect.width, height: rect.height,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      logging: false, imageTimeout: 15000,
    });
    img = canvas.toDataURL('image/png');
  } catch (e) { console.error('Erro ao capturar mapa para PDF:', e); }

  map.setView(prevCenter, prevZoom);
  return { img, originalView };
}

async function pdf_gerarFichaUnidade(id) {
  const d = DB.find(r => r.id === id);
  if (!d) return;
  if (typeof window.jspdf === 'undefined') { showToast('❌ Biblioteca de PDF não carregada'); return; }
  showToast('⏳ Gerando relatório PDF...');

  const { img: mapaImg, originalView } = await pdf_capturarMapa(d);
  const graficoImg = pdf_graficoComparativo(d);
  const logoImg = await pdf_logoDataUrl();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  if (logoImg) { try { doc.addImage(logoImg, 'PNG', 15, 10, 22, 22); } catch(e) {} }
  doc.setFontSize(16); doc.setTextColor(20, 83, 45);
  doc.text('EmbrapAI Maranhão — Ficha Técnica de Unidade Produtiva', logoImg ? 42 : 15, 18);
  doc.setFontSize(10); doc.setTextColor(100);
  doc.text(`${SYSTEM_ICONS[d.sistema]||''} ${d.sistema.toUpperCase()} · ${d.municipio} · Registro #${d.id}`, logoImg ? 42 : 15, 25);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, logoImg ? 42 : 15, 30);
  y = 38;
  doc.setDrawColor(200); doc.line(15, y, pageW - 15, y);
  y += 6;

  PDF_GRUPOS.forEach(grupo => {
    const linhas = grupo.campos
      .filter(c => d[c] !== null && d[c] !== undefined && d[c] !== '')
      .map(c => [PDF_LABELS[c] || c, pdf_fmtValor(c, d[c])]);
    if (!linhas.length) return;
    if (y > 260) { doc.addPage(); y = 15; }
    doc.autoTable({
      startY: y,
      head: [[grupo.titulo, '']],
      body: linhas,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [22, 101, 52], fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
      margin: { left: 15, right: 15 },
    });
    y = doc.lastAutoTable.finalY + 6;
  });

  if (d.obs) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(9); doc.setTextColor(60);
    doc.text('Observações:', 15, y); y += 5;
    const obsLines = doc.splitTextToSize(d.obs, pageW - 30);
    doc.text(obsLines, 15, y);
    y += obsLines.length * 4 + 6;
  }

  if (y > 170) { doc.addPage(); y = 15; }
  doc.setFontSize(13); doc.setTextColor(20, 83, 45);
  doc.text('Comparação com o sistema produtivo', 15, y); y += 6;
  try { doc.addImage(graficoImg, 'PNG', 15, y, 180, 90); y += 96; } catch(e) {}

  if (mapaImg) {
    // Seção sempre em página nova, com espaço reservado generoso — evita que o
    // título e a imagem do mapa fiquem espremidos no rodapé da página anterior.
    doc.addPage(); y = 15;
    doc.setFontSize(13); doc.setTextColor(20, 83, 45);
    doc.text('Localização no mapa', 15, y); y += 8;
    try {
      const imgProps = doc.getImageProperties(mapaImg);
      const w = pageW - 30, h = (imgProps.height * w) / imgProps.width;
      doc.addImage(mapaImg, 'PNG', 15, y, w, Math.min(h, 220));
    } catch(e) {}
  }

  doc.save(`ficha_${d.sistema}_${d.id}.pdf`);
  if (originalView && originalView !== 'map') showView(originalView);
  showToast('✅ Relatório PDF gerado');
}
