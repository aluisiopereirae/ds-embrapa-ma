// ═══════════════════════════════════════════════════════════════════════════
// CAMADA DE RISCO FUNDIÁRIO — sobreposição de UC/TI/Quilombo no mapa principal
// e verificação no formulário de cadastro.
// Reutiliza REC_UC/REC_TI/REC_QUILOMBOS/rec_detectConstraints/rec_addProtectedLayers
// (js/simuladores/recomendador.js) — nenhum dado geográfico novo é criado aqui.
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

let rf_landRiskLayer = null;
let rf_landRiskActive = false;

function rf_initLandRiskLayer() {
  if (rf_landRiskLayer) return;
  rf_landRiskLayer = L.layerGroup();
}

function rf_toggleLandRiskLayer() {
  if (!map) { showView('map'); setTimeout(rf_toggleLandRiskLayer, 400); return; }
  if (!rf_landRiskLayer) rf_initLandRiskLayer();
  rf_landRiskActive = !rf_landRiskActive;
  const btn = document.getElementById('btn-toggle-land-risk');
  if (rf_landRiskActive) {
    if (typeof rec_addProtectedLayers === 'function' && rf_landRiskLayer.getLayers().length === 0) {
      rec_addProtectedLayers(rf_landRiskLayer);
    }
    map.addLayer(rf_landRiskLayer);
    if (btn) btn.classList.add('active');
    showToast('⚠️ Camada de Unidades de Conservação, Terras Indígenas e Quilombos ativada');
  } else {
    map.removeLayer(rf_landRiskLayer);
    if (btn) btn.classList.remove('active');
  }
}

// Badge compacto exibido no popup de cada ponto do mapa principal
function rec_renderLandRiskBadge(lat, lng) {
  if (typeof rec_detectConstraints !== 'function' || !isFinite(lat) || !isFinite(lng)) return '';
  const constraints = rec_detectConstraints(lat, lng);
  if (!constraints.length) return '';
  const pior = constraints.find(c => c.type === 'ti') || constraints.find(c => c.res === 'total') || constraints[0];
  const cor = pior.type === 'ti' ? '#a855f7' : (pior.c || '#f87171');
  return `<div style="margin-top:6px;padding:5px 8px;background:${cor}1a;border:1px solid ${cor}55;border-radius:6px;font-size:10px;color:${cor}">
    ⚠️ Área sensível: ${constraints.map(c=>c.name).join(', ')} (${pior.dist_km} km)
  </div>`;
}

function rf_verificarFormulario() {
  const lat = parseFloat(document.getElementById('f_lat')?.value);
  const lng = parseFloat(document.getElementById('f_lng')?.value);
  const alertBox = document.getElementById('rf-form-alert');
  if (!alertBox) return;
  if (!isFinite(lat) || !isFinite(lng)) {
    alertBox.innerHTML = '<div style="color:var(--amber,#eab308);font-size:11px">Preencha latitude e longitude antes de verificar.</div>';
    return;
  }
  if (typeof rec_detectConstraints !== 'function') return;
  const constraints = rec_detectConstraints(lat, lng);
  alertBox.innerHTML = '<div id="rf-form-alert-inner"></div>';
  if (typeof rec_renderConstraints === 'function') {
    rec_renderConstraints(constraints, 'rf-form-alert-inner');
  }
  const bloqueio = constraints.find(c => c.type === 'ti' || c.res === 'total');
  if (bloqueio) {
    alertBox.innerHTML += `<div style="margin-top:6px;padding:8px;background:#dc262622;border:1px solid #dc262655;border-radius:6px;font-size:11px;color:#f87171;font-weight:600">
      🚫 Este ponto está dentro de ${bloqueio.type === 'ti' ? 'uma Terra Indígena' : 'uma Unidade de Conservação de proteção integral'} —
      atividade produtiva vedada por lei sem autorização do órgão competente (FUNAI/ICMBio).
    </div>`;
  }
}
