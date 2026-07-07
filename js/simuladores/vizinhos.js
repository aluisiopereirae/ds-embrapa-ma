// ═══════════════════════════════════════════════════════════════════════════
// VIZINHOS SIMILARES — busca de unidades produtivas próximas e parecidas
// Reutiliza DB (index.html) e a mesma fórmula haversine usada em recomendador.js
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

let _vzPesos = { distancia: 0.4, indicadores: 0.35, sistema: 0.15, municipio: 0.10 };

function vz_distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dG = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dG/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Normaliza distância euclidiana entre indicadores numéricos comparáveis
function vz_indicatorDist(a, b) {
  const fields = ['area_total', 'renda_total', 'balanco_carbono', 'ano_implantacao'];
  let somaSq = 0, n = 0;
  fields.forEach(f => {
    const va = Number(a[f]), vb = Number(b[f]);
    if (!isFinite(va) || !isFinite(vb)) return;
    // Escala aproximada de cada indicador para normalizar o peso de cada dimensão
    const escalas = { area_total: 200, renda_total: 50000, balanco_carbono: 50, ano_implantacao: 15 };
    const d = (va - vb) / (escalas[f] || 1);
    somaSq += d * d;
    n++;
  });
  return n ? Math.sqrt(somaSq / n) : 1;
}

function vz_calcularSimilares(recordId, opts) {
  const pesos = Object.assign({}, _vzPesos, opts || {});
  const base = DB.find(d => d.id === recordId);
  if (!base) return [];

  const candidatos = DB.filter(d => d.id !== recordId && isFinite(d.lat) && isFinite(d.lng));
  const distancias = candidatos.map(d => vz_distKm(base.lat, base.lng, d.lat, d.lng));
  const indicadores = candidatos.map(d => vz_indicatorDist(base, d));
  const maxDist = Math.max(1, ...distancias);
  const maxInd = Math.max(0.0001, ...indicadores);

  const resultados = candidatos.map((d, i) => {
    const distNorm = 1 - Math.min(1, distancias[i] / maxDist);
    const indNorm = 1 - Math.min(1, indicadores[i] / maxInd);
    const sistemaBonus = d.sistema === base.sistema ? 1 : 0;
    const municipioBonus = d.municipio === base.municipio ? 1 : 0;
    const score = distNorm * pesos.distancia + indNorm * pesos.indicadores +
                  sistemaBonus * pesos.sistema + municipioBonus * pesos.municipio;
    return { d, score, dist_km: distancias[i] };
  });

  resultados.sort((a, b) => b.score - a.score);
  return resultados.slice(0, 8);
}

function vz_abrirModal(recordId) {
  const base = DB.find(d => d.id === recordId);
  if (!base) return;
  const resultados = vz_calcularSimilares(recordId);

  document.getElementById('modal-title').textContent =
    `👥 Unidades Similares a #${recordId} — ${SYSTEM_ICONS[base.sistema]||''} ${base.municipio}`;

  const linhas = resultados.map(r => {
    const d = r.d;
    const pct = Math.round(r.score * 100);
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 6px;border-bottom:1px solid var(--border,#1f3320)">
      <div style="width:42px;height:42px;border-radius:50%;background:${SYSTEM_COLORS[d.sistema]||'#4ade80'}22;
        display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${SYSTEM_ICONS[d.sistema]||'📍'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px">${d.municipio} · ${d.sistema.toUpperCase()} <span style="color:#6b9b6b;font-weight:400">#${d.id}</span></div>
        <div style="font-size:11px;color:#6b9b6b">
          📍 ${r.dist_km.toFixed(1)} km · Área ${d.area_total||'-'} ha · Renda R$ ${(d.renda_total||0).toLocaleString()} ·
          Balanço C ${d.balanco_carbono ?? '-'} · Implant. ${d.ano_implantacao||'-'}
        </div>
      </div>
      <div style="text-align:center;flex-shrink:0">
        <div style="font-size:15px;font-weight:700;color:#4ade80">${pct}%</div>
        <div style="font-size:9px;color:#6b9b6b">similar</div>
      </div>
      <button onclick="vz_focarNoMapa(${d.id})" style="flex-shrink:0;padding:6px 10px;background:#0891b2;color:#fff;
        border:none;border-radius:5px;cursor:pointer;font-size:11px;white-space:nowrap">🗺 Ver</button>
    </div>`;
  }).join('');

  document.getElementById('modal-body').innerHTML = `
    <div style="font-size:11px;color:#6b9b6b;margin-bottom:10px">
      Similaridade combina proximidade geográfica, indicadores (área, renda, balanço de carbono, ano de implantação),
      mesmo sistema produtivo e mesmo município — útil para troca de experiências entre produtores.
    </div>
    <div style="max-height:420px;overflow-y:auto">
      ${linhas || '<div style="padding:16px;text-align:center;color:#6b9b6b">Nenhuma outra unidade cadastrada para comparar.</div>'}
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px;">
      <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
    </div>`;
  document.getElementById('modal-overlay').classList.add('open');
}

function vz_focarNoMapa(recordId) {
  const d = DB.find(r => r.id === recordId);
  if (!d) return;
  closeModal();
  showView('map');
  setTimeout(() => {
    if (!map) return;
    map.setView([d.lat, d.lng], 13);
    markersGroup.eachLayer(layer => {
      const ll = layer.getLatLng ? layer.getLatLng() : null;
      if (ll && Math.abs(ll.lat - d.lat) < 1e-6 && Math.abs(ll.lng - d.lng) < 1e-6) {
        layer.openPopup();
      }
    });
  }, 200);
}
