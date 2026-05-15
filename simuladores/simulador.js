// Simulador de Plantio Avançado — Controlador Principal
// Embrapa Maranhão · Módulo de Simuladores de Cenários

let _saState = null;
let _saPositions = [];
let _saMetrics = {};
let _saCompChart = null;
let _saZoom = 1.0;
let _saPanX = 0, _saPanY = 0;
let _saDragging = false, _saDragX = 0, _saDragY = 0;
let _saDebounce = null;

// ─── Presets de layout (direção + padrão de linhas) ──────────────────────────
// Cada preset define layout (gerador) + ângulo das linhas + rótulo visual
// angle=0  → linhas horizontais no canvas = direção L-O
// angle=90 → linhas verticais no canvas  = direção N-S
const SA_LAYOUT_PRESETS = [
  { key: 'lo',      layout: 'linear',    angle: 0,   icon: '↔',  label: 'L → O',    desc: 'Linhas Leste-Oeste — curvas nível em terreno plano' },
  { key: 'ns',      layout: 'linear',    angle: 90,  icon: '↕',  label: 'N → S',    desc: 'Linhas Norte-Sul — otimiza radiação solar direta' },
  { key: 'd45',     layout: 'linear',    angle: 45,  icon: '↗',  label: 'NE / SO',   desc: 'Diagonal 45° — reduz velocidade do vento' },
  { key: 'd135',    layout: 'linear',    angle: 135, icon: '↖',  label: 'NO / SE',   desc: 'Diagonal 135° — combinação com ventos locais' },
  { key: 'hexag',   layout: 'hexagonal', angle: 0,   icon: '⬡',  label: 'Hexag.',   desc: 'Grade hexagonal — máxima densidade por área' },
  { key: 'circular',layout: 'circular',  angle: 0,   icon: '◎',  label: 'Circular', desc: 'Anéis concêntricos — pomares e jardins produtivos' },
  { key: 'renques', layout: 'faixas',    angle: 0,   icon: '▤',  label: 'Renques',  desc: 'Faixas alternadas floresta + lavoura — ILPF' },
  { key: 'natural', layout: 'random',    angle: 0,   icon: '⁕',  label: 'Natural',  desc: 'Distribuição natural — SAF e extrativismo' },
];

// ─── HTML da interface ────────────────────────────────────────────────────────
function _buildSaHTML() {
  const sysKeys = Object.keys(SA_SYSTEMS);

  const layoutBtns = SA_LAYOUT_PRESETS.map(p =>
    `<button class="sa-layout-btn" data-preset="${p.key}" onclick="sa_selectPreset('${p.key}')"
      title="${p.desc}"
      style="background:none;border:1px solid var(--border);border-radius:6px;padding:5px 3px;cursor:pointer;font-size:10px;color:var(--text2);text-align:center;transition:all .15s;line-height:1.3">
      <div style="font-size:17px;line-height:1">${p.icon}</div>
      <div style="margin-top:2px;font-size:9px">${p.label}</div>
    </button>`
  ).join('');

  return `
<div id="sa-root" style="font-size:13px">

  <!-- Abas de sistema -->
  <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)">
    ${sysKeys.map(k =>
      `<button class="sa-sys-tab" data-sys="${k}" onclick="sa_selectSystem('${k}')"
        style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 11px;cursor:pointer;font-size:11px;color:var(--text2);transition:all .15s">
        ${SA_SYSTEMS[k].icon} ${SA_SYSTEMS[k].label}
      </button>`
    ).join('')}
  </div>

  <div style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start">

    <!-- ── Painel esquerdo ────────────────────────────────────────────────── -->
    <div>
      <div class="sim-card" style="margin-bottom:12px">
        <div class="sim-card-title">⚙️ Configuração</div>

        <div class="sim-param">
          <label style="font-size:11px;color:var(--text2)">Variante / Espécie:</label>
          <select id="sa-variant" class="sim-select" onchange="sa_selectVariant(this.value)"></select>
        </div>
        <div class="sim-param">
          <label style="font-size:11px;color:var(--text2)">Área: <strong id="sa-area-val">—</strong></label>
          <input type="range" class="sim-slider" id="sa-area" min="1" max="500" step="1" value="50"
            oninput="sa_onSlider()" onchange="sa_onSlider()">
        </div>
        <div class="sim-param">
          <label style="font-size:11px;color:var(--text2)">Espaçamento entre linhas: <strong id="sa-srow-val">—</strong></label>
          <input type="range" class="sim-slider" id="sa-srow" min="0.2" max="30" step="0.1" value="14"
            oninput="sa_onSlider()" onchange="sa_onSlider()">
        </div>
        <div class="sim-param">
          <label style="font-size:11px;color:var(--text2)">Espaçamento entre plantas: <strong id="sa-spl-val">—</strong></label>
          <input type="range" class="sim-slider" id="sa-spl" min="0.1" max="15" step="0.1" value="3"
            oninput="sa_onSlider()" onchange="sa_onSlider()">
        </div>
        <div class="sim-param">
          <label style="font-size:11px;color:var(--text2)">Ângulo das linhas: <strong id="sa-ang-val">0°</strong>
            <span style="font-size:9px;color:var(--text3)"> — ou use os botões abaixo</span>
          </label>
          <input type="range" class="sim-slider" id="sa-ang" min="0" max="179" step="1" value="0"
            oninput="sa_onSlider()" onchange="sa_onSlider()">
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <input type="checkbox" id="sa-heatmap" style="accent-color:var(--green)" onchange="sa_redrawCanvas()">
          <label for="sa-heatmap" style="font-size:11px;color:var(--text2);cursor:pointer">Heatmap de densidade</label>
        </div>
      </div>

      <!-- Layout / direção das linhas -->
      <div class="sim-card" style="margin-bottom:12px">
        <div class="sim-card-title">🗺 Direção e Padrão das Linhas</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">
          ${layoutBtns}
        </div>
      </div>

      <!-- Métricas -->
      <div class="sim-card">
        <div class="sim-card-title">📊 Métricas</div>
        <div id="sa-metrics-panel" style="color:var(--text3);font-size:11px">Configure e aguarde o plantio ser gerado.</div>
      </div>
    </div>

    <!-- ── Painel direito ─────────────────────────────────────────────────── -->
    <div>
      <!-- Canvas card -->
      <div class="chart-card" style="margin-bottom:12px">
        <!-- Barra do canvas: título + zoom + menu -->
        <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🌳 Vista Superior do Plantio</span>

          <!-- Controles de zoom -->
          <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
            <button onclick="sa_zoomOut()" title="Zoom −"
              style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;width:26px;height:26px;cursor:pointer;font-size:14px;color:var(--text2);line-height:1;display:flex;align-items:center;justify-content:center">−</button>
            <span id="sa-zoom-label" style="font-size:10px;color:var(--text3);min-width:32px;text-align:center">1.0×</span>
            <button onclick="sa_zoomIn()" title="Zoom +"
              style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;width:26px;height:26px;cursor:pointer;font-size:14px;color:var(--text2);line-height:1;display:flex;align-items:center;justify-content:center">+</button>
            <button onclick="sa_zoomReset()" title="Resetar zoom"
              style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:0 7px;height:26px;cursor:pointer;font-size:10px;color:var(--text3)">⟳</button>
          </div>

          <!-- Menu de exportação (três pontos) -->
          <div style="position:relative;flex-shrink:0" id="sa-export-wrap">
            <button onclick="sa_toggleExportMenu()" title="Exportar"
              style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;width:26px;height:26px;cursor:pointer;font-size:16px;color:var(--text2);line-height:1;display:flex;align-items:center;justify-content:center">⋮</button>
            <div id="sa-export-menu" style="display:none;position:absolute;right:0;top:30px;background:var(--card);border:1px solid var(--border);border-radius:8px;min-width:130px;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,0.5);overflow:hidden">
              <button onclick="sa_doExportPNG();sa_closeExportMenu()" style="display:block;width:100%;text-align:left;background:none;border:none;padding:9px 14px;font-size:12px;color:var(--text2);cursor:pointer" onmouseenter="this.style.background='var(--hover)'" onmouseleave="this.style.background='none'">📷 Exportar PNG</button>
              <button onclick="sa_doExportJPG();sa_closeExportMenu()" style="display:block;width:100%;text-align:left;background:none;border:none;padding:9px 14px;font-size:12px;color:var(--text2);cursor:pointer" onmouseenter="this.style.background='var(--hover)'" onmouseleave="this.style.background='none'">🖼 Exportar JPG</button>
              <button onclick="sa_doExportCSV();sa_closeExportMenu()" style="display:block;width:100%;text-align:left;background:none;border:none;padding:9px 14px;font-size:12px;color:var(--text2);cursor:pointer" onmouseenter="this.style.background='var(--hover)'" onmouseleave="this.style.background='none'">📊 Exportar CSV</button>
            </div>
          </div>
        </div>

        <canvas id="sa-canvas"
          style="width:100%;height:clamp(300px,50vh,520px);border-radius:8px;background:#0a1a0a;cursor:grab;display:block;touch-action:none"></canvas>
        <div id="sa-canvas-info" style="font-size:10px;color:var(--text3);margin-top:5px;text-align:center;user-select:none">
          🖱 Roda do mouse para zoom · Arraste para mover
        </div>
      </div>

      <div id="sa-alertas" style="margin-bottom:10px"></div>

      <div class="chart-card" style="margin-bottom:12px">
        <div class="chart-title">🔀 Comparação de Variantes — Sistema Atual</div>
        <div class="chart-wrap" style="height:200px"><canvas id="sa-comp-chart"></canvas></div>
      </div>

      <div id="sa-recomendacoes"></div>
      <div id="sa-desc-box" style="margin-top:10px"></div>
    </div>
  </div>
</div>`;
}

// ─── Inicialização ────────────────────────────────────────────────────────────
function initSimuladorAvancado(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!el.dataset.saInit) {
    el.innerHTML = _buildSaHTML();
    el.dataset.saInit = '1';

    const firstSys = 'ilpf';
    const firstVariant = SA_SYSTEMS[firstSys].variants[0];
    _saZoom = 1.0; _saPanX = 0; _saPanY = 0;
    _saState = {
      system: firstSys,
      variant: firstVariant.id,
      area: SA_AREA_LIMITS[firstSys]?.def || 50,
      spacingRow: firstVariant.spacingRow,
      spacingPlant: firstVariant.spacingPlant,
      angle: 0,
      layout: 'linear',
      heatmap: false
    };

    sa_renderSystemTabs();
    sa_renderVariantSelect();
    sa_applyPreset('lo', false); // seleciona L-O sem simular ainda
    sa_syncSliders();
    sa_attachCanvasEvents();
    // Aguarda layout do DOM para garantir canvas.offsetWidth > 0
    requestAnimationFrame(() => requestAnimationFrame(sa_runSimulation));
    return;
  }

  sa_runSimulation();
}

// ─── Eventos do canvas (zoom + pan + resize) ─────────────────────────────────
function sa_attachCanvasEvents() {
  const cv = document.getElementById('sa-canvas');
  if (!cv || cv.dataset.eventsAttached) return;
  cv.dataset.eventsAttached = '1';

  // ResizeObserver: redraw quando o container muda de tamanho (responsivo)
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => { sa_redrawCanvas(); });
    ro.observe(cv);
  }

  // Roda do mouse → zoom
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    _saZoom = Math.max(0.2, Math.min(10, _saZoom + delta * _saZoom));
    sa_updateZoomLabel();
    sa_redrawCanvas();
  }, { passive: false });

  // Drag → pan
  cv.addEventListener('mousedown', e => {
    _saDragging = true;
    _saDragX = e.clientX - _saPanX;
    _saDragY = e.clientY - _saPanY;
    cv.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!_saDragging) return;
    _saPanX = e.clientX - _saDragX;
    _saPanY = e.clientY - _saDragY;
    sa_redrawCanvas();
  });
  window.addEventListener('mouseup', () => {
    _saDragging = false;
    if (cv) cv.style.cursor = 'grab';
  });

  // Touch → pan
  let lastTouchX = 0, lastTouchY = 0, lastTouchDist = 0;
  cv.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
    e.preventDefault();
  }, { passive: false });
  cv.addEventListener('touchmove', e => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      _saPanX += dx; _saPanY += dy;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      sa_redrawCanvas();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      _saZoom = Math.max(0.2, Math.min(10, _saZoom * (dist / lastTouchDist)));
      lastTouchDist = dist;
      sa_updateZoomLabel();
      sa_redrawCanvas();
    }
    e.preventDefault();
  }, { passive: false });
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────
function sa_zoomIn()  { _saZoom = Math.min(10, _saZoom * 1.3); sa_updateZoomLabel(); sa_redrawCanvas(); }
function sa_zoomOut() { _saZoom = Math.max(0.2, _saZoom / 1.3); sa_updateZoomLabel(); sa_redrawCanvas(); }
function sa_zoomReset() { _saZoom = 1.0; _saPanX = 0; _saPanY = 0; sa_updateZoomLabel(); sa_redrawCanvas(); }

function sa_updateZoomLabel() {
  const el = document.getElementById('sa-zoom-label');
  if (el) el.textContent = _saZoom.toFixed(1) + '×';
}

// Redesenha o canvas sem recalcular posições (rápido, para zoom/pan)
function sa_redrawCanvas() {
  if (!_saState || !_saPositions) return;
  const cv = document.getElementById('sa-canvas');
  if (!cv) return;
  sa_drawPlantacao(cv, _saState, _saPositions, {
    zoom: _saZoom, panX: _saPanX, panY: _saPanY,
    heatmap: document.getElementById('sa-heatmap')?.checked || false
  });
}

// ─── Menu de exportação ───────────────────────────────────────────────────────
function sa_toggleExportMenu() {
  const m = document.getElementById('sa-export-menu');
  if (!m) return;
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
function sa_closeExportMenu() {
  const m = document.getElementById('sa-export-menu');
  if (m) m.style.display = 'none';
}
// Fecha menu ao clicar fora
document.addEventListener('click', e => {
  const wrap = document.getElementById('sa-export-wrap');
  if (wrap && !wrap.contains(e.target)) sa_closeExportMenu();
});

// ─── Presets de layout ────────────────────────────────────────────────────────
function sa_applyPreset(key, andSimulate) {
  const preset = SA_LAYOUT_PRESETS.find(p => p.key === key);
  if (!preset || !_saState) return;
  _saState.layout = preset.layout;
  _saState.angle  = preset.angle;
  // Sincroniza slider de ângulo
  const angEl = document.getElementById('sa-ang');
  if (angEl) angEl.value = preset.angle;
  sa_updateLabels();
  // Destaca botão ativo
  document.querySelectorAll('.sa-layout-btn').forEach(b => {
    const on = b.dataset.preset === key;
    b.style.background  = on ? 'var(--green3)' : 'none';
    b.style.color       = on ? '#fff' : 'var(--text2)';
    b.style.borderColor = on ? 'var(--green3)' : 'var(--border)';
    b.style.fontWeight  = on ? '600' : 'normal';
  });
  if (andSimulate !== false) sa_runSimulation();
}

function sa_selectPreset(key) { sa_applyPreset(key, true); }

// ─── Seleções de sistema e variante ──────────────────────────────────────────
function sa_selectSystem(sysKey) {
  if (!_saState) return;
  const sys = SA_SYSTEMS[sysKey];
  if (!sys) return;
  _saState.system = sysKey;
  const v = sys.variants[0];
  _saState.variant = v.id;
  _saState.spacingRow = v.spacingRow;
  _saState.spacingPlant = v.spacingPlant;
  _saState.area = SA_AREA_LIMITS[sysKey]?.def || 50;
  _saZoom = 1; _saPanX = 0; _saPanY = 0;
  sa_renderSystemTabs();
  sa_renderVariantSelect();
  sa_syncSliders();
  sa_runSimulation();
}

function sa_selectVariant(id) {
  if (!_saState) return;
  const v = SA_SYSTEMS[_saState.system]?.variants.find(x => x.id === id);
  if (!v) return;
  _saState.variant = id;
  _saState.spacingRow = v.spacingRow;
  _saState.spacingPlant = v.spacingPlant;
  _saZoom = 1; _saPanX = 0; _saPanY = 0;
  sa_syncSliders();
  sa_runSimulation();
}

// ─── Sliders (dinâmico com debounce) ─────────────────────────────────────────
function sa_onSlider() {
  sa_updateLabels();
  clearTimeout(_saDebounce);
  _saDebounce = setTimeout(sa_runSimulation, 180);
}

function sa_syncSliders() {
  const g = id => document.getElementById(id);
  if (!_saState) return;
  if (g('sa-area')) g('sa-area').value = _saState.area;
  if (g('sa-srow')) g('sa-srow').value = _saState.spacingRow;
  if (g('sa-spl'))  g('sa-spl').value  = _saState.spacingPlant;
  if (g('sa-ang'))  g('sa-ang').value  = _saState.angle || 0;
  sa_updateLabels();
}

function sa_updateLabels() {
  const g = id => document.getElementById(id);
  const area = +(g('sa-area')?.value || _saState?.area || 50);
  const srow = +(g('sa-srow')?.value || _saState?.spacingRow || 3);
  const spl  = +(g('sa-spl')?.value  || _saState?.spacingPlant || 1);
  const ang  = +(g('sa-ang')?.value  || 0);
  if (g('sa-area-val')) g('sa-area-val').textContent = area + ' ha';
  if (g('sa-srow-val')) g('sa-srow-val').textContent = srow + ' m';
  if (g('sa-spl-val'))  g('sa-spl-val').textContent  = spl  + ' m';
  if (g('sa-ang-val'))  g('sa-ang-val').textContent  = ang  + '°';
}

function sa_renderSystemTabs() {
  document.querySelectorAll('.sa-sys-tab').forEach(b => {
    const on = b.dataset.sys === _saState?.system;
    b.style.background  = on ? 'var(--green3)' : 'none';
    b.style.color       = on ? '#fff' : 'var(--text2)';
    b.style.borderColor = on ? 'var(--green3)' : 'var(--border)';
    b.style.fontWeight  = on ? '600' : 'normal';
  });
}

function sa_renderVariantSelect() {
  const sel = document.getElementById('sa-variant');
  if (!sel) return;
  sel.innerHTML = (SA_SYSTEMS[_saState?.system]?.variants || []).map(v =>
    `<option value="${v.id}" ${v.id === _saState?.variant ? 'selected' : ''}>${v.label}</option>`
  ).join('');
}

// ─── Simulação principal ──────────────────────────────────────────────────────
function sa_runSimulation() {
  if (!_saState) return;
  clearTimeout(_saDebounce);

  const g = id => document.getElementById(id);
  _saState.area         = +(g('sa-area')?.value || _saState.area);
  _saState.spacingRow   = +(g('sa-srow')?.value || _saState.spacingRow);
  _saState.spacingPlant = +(g('sa-spl')?.value  || _saState.spacingPlant);
  _saState.angle        = +(g('sa-ang')?.value  || 0);
  _saState.heatmap      = g('sa-heatmap')?.checked || false;
  sa_updateLabels();

  const areaM2 = _saState.area * 10000;
  const variant = SA_SYSTEMS[_saState.system]?.variants.find(v => v.id === _saState.variant)
               || SA_SYSTEMS[_saState.system]?.variants[0];
  const nSp    = variant?.species?.length || 1;
  const angRad = (_saState.angle * Math.PI) / 180;
  const genFn  = SA_LAYOUTS[_saState.layout || 'linear'];

  _saPositions = genFn
    ? genFn.generate(areaM2, _saState.spacingRow, _saState.spacingPlant, angRad, nSp)
    : [];
  if (_saPositions.length > 2500) _saPositions = _saPositions.slice(0, 2500);

  // Canvas
  const cv = document.getElementById('sa-canvas');
  if (cv) {
    sa_drawPlantacao(cv, _saState, _saPositions, {
      zoom: _saZoom, panX: _saPanX, panY: _saPanY, heatmap: _saState.heatmap
    });
  }
  sa_updateZoomLabel();

  _saMetrics = sa_calcMetricas(_saState, _saPositions);

  sa_renderMetrics();
  sa_renderAlertas();
  sa_renderRecomendacoes();
  sa_renderDesc();
  sa_renderCompChart();

  const info = g('sa-canvas-info');
  if (info) {
    const lay = SA_LAYOUT_PRESETS.find(p => p.layout === _saState.layout && p.angle === _saState.angle)?.label
             || SA_LAYOUTS[_saState.layout]?.label || _saState.layout;
    info.textContent = `${_saPositions.length.toLocaleString('pt-BR')} plantas · ${_saState.spacingRow}m × ${_saState.spacingPlant}m · ${lay} · 🖱 roda = zoom · arrastar = mover`;
  }
}

// ─── Painéis de resultado ─────────────────────────────────────────────────────
function sa_renderMetrics() {
  const el = document.getElementById('sa-metrics-panel');
  if (!el || !_saMetrics) return;
  const m = _saMetrics;
  const cell = (icon, label, val, unit) =>
    `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:7px 8px">
       <div style="font-size:10px;color:var(--text3)">${icon} ${label}</div>
       <div style="font-size:14px;font-weight:700;color:var(--green)">${val}<span style="font-size:9px;color:var(--text3);margin-left:2px">${unit}</span></div>
     </div>`;
  el.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
    ${cell('🌱','Plantas',      (m.nPlantas||0).toLocaleString('pt-BR'), '')}
    ${cell('📏','Densidade',    (m.density||0).toFixed(0), 'pl/ha')}
    ${cell('🌿','Espécies',     m.richness||0, '')}
    ${cell('🧬','Shannon-H',    (m.shannonH||0).toFixed(2), '')}
    ${cell('💰','Renda/ano',    'R$ '+((m.rendaAnual||0)/1000).toFixed(0)+'k', '')}
    ${cell('📅','Payback',      (m.paybackAnos||0).toFixed(1), 'anos')}
    ${cell('🌳','Carbono/ano',  (m.carbonAnual||0).toFixed(1), 't C')}
    ${cell('☁️','GEE evitado',  (m.geeAnual||0).toFixed(1), 't CO₂eq')}
    ${cell('🌿','Cobertura',    (m.coberturaPercent||0).toFixed(0), '%')}
    ${cell('👷','Empregos',     m.empregosGerados||0, '')}
  </div>`;
}

function sa_renderAlertas() {
  const el = document.getElementById('sa-alertas');
  if (!el) return;
  const alertas = _saMetrics?.alertas || [];
  if (!alertas.length) { el.innerHTML = ''; return; }
  const cl = { warning:'#fbbf24', error:'#f87171', info:'#60a5fa' };
  const ic = { warning:'⚠️', error:'❌', info:'ℹ️' };
  el.innerHTML = alertas.map(a =>
    `<div style="background:var(--bg2);border:1px solid ${cl[a.tipo]||'#fbbf24'};border-radius:8px;padding:7px 12px;margin-bottom:5px;font-size:11px;color:${cl[a.tipo]||'#fbbf24'}">
       ${ic[a.tipo]||'⚠️'} ${a.msg}
     </div>`
  ).join('');
}

function sa_renderRecomendacoes() {
  const el = document.getElementById('sa-recomendacoes');
  if (!el) return;
  const recs = _saMetrics?.recomendacoes || [];
  if (!recs.length) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="sim-card">
    <div class="sim-card-title">💡 Recomendações Técnicas</div>
    ${recs.map(r => `<div style="font-size:11px;color:var(--text2);padding:5px 0;border-bottom:1px solid var(--border2)">${r}</div>`).join('')}
  </div>`;
}

function sa_renderDesc() {
  const el = document.getElementById('sa-desc-box');
  if (!el) return;
  const sys = SA_SYSTEMS[_saState?.system];
  const v = sys?.variants.find(x => x.id === _saState?.variant) || sys?.variants[0];
  if (!v) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="sim-card">
    <div class="sim-card-title">${sys.icon} ${sys.label} — ${v.label}</div>
    <div style="font-size:11px;color:var(--text2);line-height:1.65;margin-bottom:8px">${v.desc}</div>
    <div style="font-size:10px;color:var(--text3)">📚 ${v.fonte}</div>
    ${v.species.length ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">
      ${v.species.map(sp => `<span style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:3px 9px;font-size:10px;color:var(--text2)">${sp.icon} ${sp.name}</span>`).join('')}
    </div>` : ''}
  </div>`;
}

function sa_renderCompChart() {
  const ctx = document.getElementById('sa-comp-chart');
  if (!ctx) return;
  if (_saCompChart) { try { _saCompChart.destroy(); } catch(e){} _saCompChart = null; }
  const comp = sa_compararVariantes(_saState?.system, _saState?.area || 10);
  if (!comp.length) return;
  _saCompChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: comp.map(c => c.label.length > 18 ? c.label.slice(0, 17) + '…' : c.label),
      datasets: [
        { label:'Renda/ano (R$ mil)', data: comp.map(c => (c.rendaAnual/1000).toFixed(1)), backgroundColor:'rgba(74,222,128,0.6)', borderRadius:4, yAxisID:'y' },
        { label:'Carbono 10a (t C)',   data: comp.map(c => c.carbon10anos.toFixed(1)),      backgroundColor:'rgba(96,165,250,0.6)', borderRadius:4, yAxisID:'y' },
        { label:'Biodiversidade',      data: comp.map(c => c.biodiv), type:'line', tension:0.4, pointRadius:5, borderColor:'#fbbf24', backgroundColor:'rgba(251,191,36,0.15)', yAxisID:'y1' }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ labels:{ color:'#a3c9a3', font:{size:10} } } },
      scales:{
        x:  { ticks:{color:'#6b9b6b',font:{size:9}}, grid:{color:'rgba(74,222,128,0.06)'} },
        y:  { ticks:{color:'#6b9b6b'}, grid:{color:'rgba(74,222,128,0.06)'}, title:{display:true,text:'Renda / Carbono',color:'#6b9b6b',font:{size:9}} },
        y1: { type:'linear', position:'right', ticks:{color:'#fbbf24'}, grid:{display:false}, min:0, max:12 }
      }
    }
  });
}

// ─── Exportações ──────────────────────────────────────────────────────────────
function sa_doExportPNG() {
  const cv = document.getElementById('sa-canvas');
  if (cv) sa_exportPNG(cv, 'plantio_' + (_saState?.system || 'sim'));
}
function sa_doExportJPG() {
  const cv = document.getElementById('sa-canvas');
  if (cv) sa_exportJPG(cv, 'plantio_' + (_saState?.system || 'sim'));
}
function sa_doExportCSV() {
  if (_saState && _saMetrics) sa_exportCSV(_saState, _saPositions, _saMetrics);
}

// ─── Compatibilidade ──────────────────────────────────────────────────────────
function updatePlantio() {
  initSimuladorAvancado('simtab-plantio');
}
