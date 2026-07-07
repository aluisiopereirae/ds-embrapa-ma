// ═══════════════════════════════════════════════════════════════════════════
// POLÍGONOS DE TALHÃO — desenho no mapa, área geodésica real, contexto municipal
// Reutiliza map/DB/MUNIC_DATA (index.html) + Leaflet.draw (L.GeometryUtil)
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

let pg_talhaoLayers = null;
let pg_drawControl = null;
let pg_drawActive = false;
let _pgPendingPoligono = null; // { coords:[[lat,lng],...], area_ha, centroid:{lat,lng} }

function pg_distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dG = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dG/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function pg_initDrawControl() {
  if (pg_drawControl) return;
  pg_talhaoLayers = L.layerGroup().addTo(map);

  pg_drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
      polygon: { allowIntersection: false, showArea: true, shapeOptions: { color: '#fbbf24', weight: 2 } },
      polyline: false, rectangle: false, circle: false, circlemarker: false, marker: false,
    },
    edit: false,
  });

  map.on(L.Draw.Event.CREATED, pg_onPolygonCreated);
  pg_renderTalhaoLayers();
}

function pg_toggleDrawMode() {
  if (!map) { showView('map'); setTimeout(pg_toggleDrawMode, 400); return; }
  pg_drawActive = !pg_drawActive;
  const btn = document.getElementById('btn-toggle-draw-talhao');
  if (pg_drawActive) {
    map.addControl(pg_drawControl);
    if (btn) btn.classList.add('active');
    showToast('▱ Desenhe o contorno do talhão no mapa (clique para adicionar vértices, dê duplo-clique para finalizar)');
  } else {
    map.removeControl(pg_drawControl);
    if (btn) btn.classList.remove('active');
  }
}

function pg_nearestMunicipio(lat, lng) {
  if (typeof MUNIC_DATA === 'undefined' || !MUNIC_DATA.length) return null;
  let best = null, bestDist = Infinity;
  MUNIC_DATA.forEach(row => {
    const d = pg_distKm(lat, lng, row[1], row[2]);
    if (d < bestDist) { bestDist = d; best = row; }
  });
  if (!best) return null;
  return {
    nome: best[0], dist_km: bestDist, desmat_km2: best[6], cos_pct: best[15], bioma: best[18],
  };
}

function pg_onPolygonCreated(e) {
  const layer = e.layer;
  const latlngs = layer.getLatLngs()[0];
  const areaM2 = L.GeometryUtil ? L.GeometryUtil.geodesicArea(latlngs) : 0;
  const areaHa = areaM2 / 10000;
  const centro = layer.getBounds().getCenter();
  const coords = latlngs.map(ll => [ll.lat, ll.lng]);

  _pgPendingPoligono = { coords, area_ha: +areaHa.toFixed(3), centroid: { lat: centro.lat, lng: centro.lng } };

  const munic = pg_nearestMunicipio(centro.lat, centro.lng);
  const proximos = DB.filter(d => pg_distKm(centro.lat, centro.lng, d.lat, d.lng) < 30)
    .sort((a,b) => pg_distKm(centro.lat, centro.lng, a.lat, a.lng) - pg_distKm(centro.lat, centro.lng, b.lat, b.lng))
    .slice(0, 10);

  layer.setStyle({ color: '#fbbf24', fillOpacity: 0.15 });
  layer.bindTooltip(`Talhão desenhado — ${areaHa.toFixed(2)} ha`);
  layer.addTo(pg_talhaoLayers);

  document.getElementById('modal-title').textContent = '▱ Talhão Desenhado — Associar a Unidade Produtiva';
  document.getElementById('modal-body').innerHTML = `
    <div style="background:var(--bg3,#0f1f0f);padding:12px;border-radius:8px;margin-bottom:12px">
      <div style="font-size:20px;font-weight:700;color:#fbbf24">${areaHa.toFixed(2)} ha</div>
      <div style="font-size:11px;color:#6b9b6b">Área calculada geodesicamente a partir do polígono desenhado (${coords.length} vértices)</div>
    </div>
    ${munic ? `<div style="font-size:12px;margin-bottom:12px">
      <div style="font-weight:600;margin-bottom:4px">📍 Município mais próximo: ${munic.nome} (${munic.dist_km.toFixed(1)} km do centro do talhão)</div>
      <div style="color:#6b9b6b">Cobertura do solo (municipal): ${munic.cos_pct ?? '-'}% · Desmatamento: ${munic.desmat_km2 ?? '-'} km² · Bioma: ${munic.bioma||'-'}</div>
    </div>` : ''}
    <div style="font-size:11px;color:#eab308;background:#eab30822;padding:8px;border-radius:6px;margin-bottom:12px;border:1px solid #eab30855">
      ⚠️ Estes indicadores são referências <strong>municipais</strong> (não pixel-a-pixel). Para verificação oficial da situação fundiária/ambiental
      do talhão, consulte:
      <a href="https://www.car.gov.br/publico/imoveis/index" target="_blank" rel="noopener" style="color:#4ade80">SICAR — Cadastro Ambiental Rural</a> e
      <a href="https://alerta.mapbiomas.org/" target="_blank" rel="noopener" style="color:#4ade80">MapBiomas Alerta</a>.
    </div>
    <div style="margin-bottom:8px;font-size:12px;font-weight:600">Associar este talhão a:</div>
    <select class="form-select" id="pg-select-record" style="width:100%;margin-bottom:12px">
      <option value="">➕ Novo cadastro (usar centro do talhão como coordenada)</option>
      ${proximos.map(d => `<option value="${d.id}">#${d.id} — ${SYSTEM_ICONS[d.sistema]||''} ${d.sistema.toUpperCase()} · ${d.municipio} (${pg_distKm(centro.lat,centro.lng,d.lat,d.lng).toFixed(1)} km)</option>`).join('')}
    </select>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="pg_cancelarPendente()">Cancelar</button>
      <button class="btn btn-primary" onclick="pg_confirmarAssociacao()">Confirmar</button>
    </div>`;
  document.getElementById('modal-overlay').classList.add('open');
}

function pg_cancelarPendente() {
  if (pg_talhaoLayers) pg_talhaoLayers.clearLayers();
  pg_renderTalhaoLayers();
  _pgPendingPoligono = null;
  closeModal();
}

function pg_confirmarAssociacao() {
  const sel = document.getElementById('pg-select-record');
  const id = sel && sel.value ? parseInt(sel.value) : null;
  if (id) {
    const rec = DB.find(d => d.id === id);
    if (rec) {
      rec.poligono = _pgPendingPoligono.coords;
      rec.area_poligono_ha = _pgPendingPoligono.area_ha;
      saveData(DB);
      renderMapMarkers();
      showToast(`✅ Talhão associado ao registro #${id} (${_pgPendingPoligono.area_ha} ha)`);
    }
    _pgPendingPoligono = null;
    pg_renderTalhaoLayers();
    closeModal();
  } else {
    // Novo cadastro: preenche lat/lng com o centróide e abre o formulário de Registrar
    const c = _pgPendingPoligono.centroid;
    closeModal();
    showView('register');
    setTimeout(() => {
      const flat = document.getElementById('f_lat'), flng = document.getElementById('f_lng');
      if (flat) flat.value = c.lat.toFixed(5);
      if (flng) flng.value = c.lng.toFixed(5);
      showToast(`▱ Coordenadas do talhão preenchidas — complete o cadastro (${_pgPendingPoligono.area_ha} ha)`);
    }, 300);
  }
}

// Redesenha no mapa todos os polígonos já salvos em DB (chamado após init e após salvar registro)
function pg_renderTalhaoLayers() {
  if (!pg_talhaoLayers) return;
  pg_talhaoLayers.clearLayers();
  DB.forEach(d => {
    if (!d.poligono || !d.poligono.length) return;
    const latlngs = d.poligono.map(p => [p[0], p[1]]);
    const color = (typeof SYSTEM_COLORS !== 'undefined' && SYSTEM_COLORS[d.sistema]) || '#fbbf24';
    L.polygon(latlngs, { color, weight: 2, fillOpacity: 0.12 })
      .bindTooltip(`${SYSTEM_ICONS[d.sistema]||''} ${d.municipio} #${d.id} — ${d.area_poligono_ha||'?'} ha`)
      .addTo(pg_talhaoLayers);
  });
}
