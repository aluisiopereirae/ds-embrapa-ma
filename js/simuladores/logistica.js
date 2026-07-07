// ═══════════════════════════════════════════════════════════════════════════
// LOGÍSTICA / ESCOAMENTO — distância até os principais polos consumidores do MA
// Estimativa em linha reta (haversine) sempre disponível + rota real opcional
// via servidor público OSRM (router.project-osrm.org), com fallback silencioso.
// Reutiliza MUNIC_DATA (index.html) para os polos — nenhuma coordenada nova.
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

const LG_VELOCIDADE_MEDIA_KMH = 50; // estimativa conservadora para rodovias estaduais/vicinais do MA
const LG_N_POLOS = 8;
let _lgPolos = null;
let _lgBadgeCounter = 0;

function lg_distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dG = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dG/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Polos = municípios de maior população em MUNIC_DATA (colunas: [mun,lat,lon,pop,...])
function lg_getPolos() {
  if (_lgPolos) return _lgPolos;
  if (typeof MUNIC_DATA === 'undefined' || !MUNIC_DATA.length) return [];
  _lgPolos = MUNIC_DATA
    .map(row => ({ nome: row[0], lat: row[1], lng: row[2], pop: row[3] }))
    .sort((a, b) => (b.pop||0) - (a.pop||0))
    .slice(0, LG_N_POLOS);
  return _lgPolos;
}

function lg_calcularDistancias(lat, lng) {
  return lg_getPolos()
    .map(p => ({ ...p, dist_km: lg_distKm(lat, lng, p.lat, p.lng) }))
    .sort((a, b) => a.dist_km - b.dist_km);
}

function lg_renderEscoamentoBadge(lat, lng) {
  if (!isFinite(lat) || !isFinite(lng)) return '';
  const polos = lg_calcularDistancias(lat, lng).slice(0, 3);
  if (!polos.length) return '';
  const uid = 'lg-badge-' + (_lgBadgeCounter++);
  const linhas = polos.map((p, i) => {
    const horas = p.dist_km / LG_VELOCIDADE_MEDIA_KMH;
    return `<div style="display:flex;justify-content:space-between;font-size:10px;padding:1px 0" id="${uid}-${i}">
      <span>${i===0?'🏙':'·'} ${p.nome}</span>
      <span>${p.dist_km.toFixed(0)} km · ~${horas.toFixed(1)}h (linha reta)</span>
    </div>`;
  }).join('');
  return `<div style="margin-top:6px;padding:6px 8px;background:#0891b21a;border:1px solid #0891b255;border-radius:6px">
    <div style="font-size:10px;font-weight:600;color:#0891b2;margin-bottom:3px">🚚 Escoamento — polos consumidores mais próximos</div>
    ${linhas}
    <button onclick="lg_calcularRotaReal(${lat},${lng},'${uid}')" style="margin-top:4px;padding:3px 8px;font-size:10px;background:#0891b2;color:#fff;border:none;border-radius:4px;cursor:pointer">🔄 Calcular rota real (via OSRM)</button>
  </div>`;
}

// Enriquecimento opcional: distância/duração reais por estrada via servidor demo público do OSRM.
// Sem chave, sem servidor próprio — mas é um serviço de terceiros não garantido; em caso de falha,
// mantém silenciosamente a estimativa em linha reta já exibida.
async function lg_calcularRotaReal(lat, lng, uid) {
  const polos = lg_calcularDistancias(lat, lng).slice(0, 3);
  for (let i = 0; i < polos.length; i++) {
    const p = polos[i];
    const el = document.getElementById(`${uid}-${i}`);
    if (el) el.querySelector('span:last-child').textContent = '⏳ calculando rota real...';
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${p.lng},${p.lat}?overview=false`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const data = await resp.json();
      const rota = data?.routes?.[0];
      if (rota && el) {
        const km = rota.distance / 1000, h = rota.duration / 3600;
        el.querySelector('span:last-child').textContent = `${km.toFixed(0)} km · ${h.toFixed(1)}h (rota real)`;
      } else if (el) {
        el.querySelector('span:last-child').textContent = `${p.dist_km.toFixed(0)} km · linha reta (rota real indisponível)`;
      }
    } catch (e) {
      if (el) el.querySelector('span:last-child').textContent = `${p.dist_km.toFixed(0)} km · linha reta (rota real indisponível)`;
    }
  }
}
