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
let _saSatView = 'canvas'; // 'canvas' | 'sat' — declarado aqui para uso em sa_runSimulation

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

  <!-- Abas de sistema — ocultas na aba Recomendação IA -->
  <div id="sa-sys-row" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)">
    ${sysKeys.map(k =>
      `<button class="sa-sys-tab" data-sys="${k}" onclick="sa_selectSystem('${k}')"
        style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 11px;cursor:pointer;font-size:11px;color:var(--text2);transition:all .15s">
        ${SA_SYSTEMS[k].icon} ${SA_SYSTEMS[k].label}
      </button>`
    ).join('')}
  </div>

  <div id="sa-main-grid" style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start">

    <!-- ── Painel esquerdo — oculto na aba Recomendação IA ───────────────── -->
    <div id="sa-left-col">
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
      <!-- Sub-abas de visualização -->
      <div style="display:flex;gap:6px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border);flex-wrap:wrap">
        <button id="sa-vtab-canvas" onclick="sa_switchView('canvas')"
          style="background:var(--green3);border:1px solid var(--green3);border-radius:8px;padding:5px 14px;cursor:pointer;font-size:11px;color:#fff;font-weight:600;transition:all .15s">
          🌳 Vista Superior
        </button>
        <button id="sa-vtab-sat" onclick="sa_switchView('sat')"
          style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 14px;cursor:pointer;font-size:11px;color:var(--text2);transition:all .15s">
          🛰️ Projeção Satélite
        </button>
        <button id="sa-vtab-rec" onclick="sa_switchView('rec')"
          style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 14px;cursor:pointer;font-size:11px;color:var(--text2);transition:all .15s">
          🧠 Recomendação IA
        </button>
      </div>

      <!-- ── Vista Superior (canvas existente) ───────────────────────────── -->
      <div id="sa-view-canvas">
        <div class="chart-card" style="margin-bottom:12px">
          <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🌳 Vista Superior do Plantio</span>
            <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
              <button onclick="sa_zoomOut()" title="Zoom −"
                style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;width:26px;height:26px;cursor:pointer;font-size:14px;color:var(--text2);line-height:1;display:flex;align-items:center;justify-content:center">−</button>
              <span id="sa-zoom-label" style="font-size:10px;color:var(--text3);min-width:32px;text-align:center">1.0×</span>
              <button onclick="sa_zoomIn()" title="Zoom +"
                style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;width:26px;height:26px;cursor:pointer;font-size:14px;color:var(--text2);line-height:1;display:flex;align-items:center;justify-content:center">+</button>
              <button onclick="sa_zoomReset()" title="Resetar zoom"
                style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:0 7px;height:26px;cursor:pointer;font-size:10px;color:var(--text3)">⟳</button>
            </div>
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

      <!-- ── Projeção Satélite (nova subaba) ─────────────────────────────── -->
      <div id="sa-view-sat" style="display:none">
        <div class="chart-card">
          <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">
            <span>🛰️ Projeção em Terreno Real — Satélite</span>
            <button onclick="sa_satDrawPlants()"
              style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:4px 10px;cursor:pointer;font-size:11px;color:var(--text2)">
              ⟳ Atualizar projeção
            </button>
          </div>

          <!-- Seletor de localização -->
          <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:10px;flex-wrap:wrap">
            <div style="flex:1;min-width:200px">
              <div style="font-size:10px;color:var(--text3);margin-bottom:3px">Município (centro da propriedade):</div>
              <input type="text" id="sa-sat-munic-input" list="sa-sat-munic-list"
                placeholder="🔍 Pesquisar município..."
                onchange="sa_satSelectByName(this.value)" oninput="sa_satSelectByName(this.value)"
                style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--text1);font-size:12px;font-family:inherit;box-sizing:border-box">
              <datalist id="sa-sat-munic-list"></datalist>
            </div>
            <div>
              <div style="font-size:10px;color:var(--text3);margin-bottom:3px">Latitude</div>
              <input type="number" id="sa-sat-lat" value="-4.9" step="0.00001"
                style="width:110px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--text1);font-size:12px;font-family:inherit">
            </div>
            <div>
              <div style="font-size:10px;color:var(--text3);margin-bottom:3px">Longitude</div>
              <input type="number" id="sa-sat-lng" value="-45.3" step="0.00001"
                style="width:110px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--text1);font-size:12px;font-family:inherit">
            </div>
            <button onclick="sa_satApplyCoords()"
              style="background:var(--green3);border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:11px;color:#fff;white-space:nowrap;font-weight:600">
              📍 Ir para local
            </button>
          </div>

          <!-- Dica -->
          <div style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.15);border-radius:7px;padding:7px 11px;margin-bottom:10px;font-size:11px;color:var(--text3)">
            💡 Pesquise o município para centralizar no terreno. Clique no mapa para posicionar o centro exato da propriedade. Os parâmetros do painel esquerdo são aplicados automaticamente.
          </div>

          <!-- Mapa Leaflet -->
          <div id="sa-sat-map" style="height:520px;border-radius:8px;background:#111;overflow:hidden;border:1px solid var(--border)"></div>

          <div style="font-size:10px;color:var(--text3);margin-top:8px;display:flex;gap:16px;flex-wrap:wrap">
            <span>🛰️ Esri World Imagery</span>
            <span>📍 Clique no mapa → reposiciona o plantio</span>
            <span>🔍 Scroll / pinça para zoom</span>
            <span id="sa-sat-count"></span>
          </div>
        </div>
      </div>

      <!-- ── Recomendação IA — Classificação Multi-Critério ──────────────── -->
      <div id="sa-view-rec" style="display:none">

        <!-- Barra de busca + badge -->
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
          <input type="text" id="rec-munic-input" list="rec-munic-list"
            placeholder="🔍 Pesquisar município do MA para centralizar o mapa..."
            onchange="rec_searchMunic(this.value)" oninput="rec_searchMunic(this.value)"
            style="flex:1;min-width:220px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px 10px;color:var(--text);font-size:12px;font-family:inherit;box-sizing:border-box">
          <datalist id="rec-munic-list"></datalist>
          <span style="font-size:10px;color:var(--text3);white-space:nowrap">ou clique no mapa</span>
        </div>
        <div id="rec-munic-badge" style="background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:6px 11px;margin-bottom:10px;font-size:11px;color:var(--text3)">
          📍 Nenhum local selecionado — clique no mapa para iniciar a análise
        </div>

        <!-- Grid principal: Mapa | Resultados -->
        <div style="display:grid;grid-template-columns:420px 1fr;gap:12px;align-items:start">

          <!-- ── COLUNA ESQUERDA: Mapa + Características + Restrições ──── -->
          <div>

            <!-- Mapa interativo -->
            <div class="chart-card" style="margin-bottom:10px">
              <div class="chart-title" style="margin-bottom:6px">
                🗺️ Terreno Real — Clique para Classificar
              </div>
              <div style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.12);border-radius:6px;padding:5px 9px;margin-bottom:7px;font-size:10px;color:var(--text3)">
                💡 Clique em qualquer ponto · O algoritmo detecta município, solo, bioma, clima,
                UCs, Terras Indígenas e Quilombos e classifica os 10 sistemas produtivos Embrapa.
              </div>
              <div id="rec-map" style="height:400px;border-radius:8px;background:#0a0f0a;overflow:hidden;border:1px solid var(--border)"></div>
              <div style="font-size:10px;color:var(--text3);margin-top:6px;display:flex;gap:12px;flex-wrap:wrap">
                <span>🛰️ Esri Satellite + CartoDB Labels</span>
                <span>🔴 UCs · 🟣 Terras Indígenas · 🟤 Quilombos</span>
              </div>
            </div>

            <!-- Características ambientais e socioeconômicas -->
            <div class="chart-card" style="margin-bottom:10px">
              <div class="chart-title" style="margin-bottom:8px">🌍 Características do Local Detectadas</div>
              <div id="rec-env-panel">
                <span style="color:var(--text3);font-size:11px">Clique no mapa para detectar características...</span>
              </div>
            </div>

            <!-- Restrições e impedimentos legais -->
            <div class="chart-card">
              <div class="chart-title" style="margin-bottom:8px">⚠️ Restrições e Impedimentos Legais</div>
              <div id="rec-constraints-panel">
                <span style="color:var(--text3);font-size:11px">Aguardando localização...</span>
              </div>
            </div>

          </div>

          <!-- ── COLUNA DIREITA: Pesos + Ranking + Gráficos + Multi-sistema -->
          <div>

            <!-- Pesos dos critérios (compacto, 2 colunas de sliders) -->
            <div class="chart-card" style="margin-bottom:10px">
              <div class="chart-title" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span>⚖️ Pesos dos Critérios de Avaliação</span>
                <button onclick="rec_resetWeights()"
                  style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:3px 9px;cursor:pointer;font-size:10px;color:var(--text3)">
                  ↺ Resetar
                </button>
              </div>
              <div id="rec-weights-panel">
                <span style="color:var(--text3);font-size:11px">Carregando critérios...</span>
              </div>
            </div>

            <!-- Ranking completo -->
            <div class="chart-card" style="margin-bottom:10px">
              <div class="chart-title" style="margin-bottom:8px">
                🏆 Sistemas Recomendados pela IA
                <span style="font-size:10px;color:var(--text3);font-weight:400;margin-left:5px">Pontuação 0–100 · MCDA ponderado</span>
              </div>
              <div id="rec-ranking">
                <span style="color:var(--text3);font-size:11px">Clique em um ponto no mapa para classificar os 10 sistemas...</span>
              </div>
            </div>

            <!-- Radar + Barras lado a lado -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
              <div class="chart-card">
                <div class="chart-title" style="margin-bottom:5px;font-size:11px">📡 Top 3 · Multi-Critério</div>
                <div style="height:240px"><canvas id="rec-radar"></canvas></div>
              </div>
              <div class="chart-card">
                <div class="chart-title" style="margin-bottom:5px;font-size:11px">📊 Pontuação Geral</div>
                <div style="height:240px"><canvas id="rec-bar"></canvas></div>
              </div>
            </div>

            <!-- Planejamento multi-sistema -->
            <div class="chart-card">
              <div class="chart-title" style="margin-bottom:8px">
                🔗 Planejamento Multi-sistema
                <span style="font-size:10px;color:var(--text3);font-weight:400;margin-left:5px">Combine 2–3 sistemas e calcule métricas integradas</span>
              </div>
              <div id="rec-multisys">
                <span style="color:var(--text3);font-size:11px">Selecione um local para ativar o planejamento...</span>
              </div>
            </div>

          </div>
        </div>
      </div>

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
  const g = id => document.getElementById(id);
  // Atualiza estado imediatamente para métricas econômicas (área, etc.)
  if (_saState) {
    _saState.area         = +(g('sa-area')?.value  || _saState.area);
    _saState.spacingRow   = +(g('sa-srow')?.value  || _saState.spacingRow);
    _saState.spacingPlant = +(g('sa-spl')?.value   || _saState.spacingPlant);
    _saState.angle        = +(g('sa-ang')?.value   || 0);
    // Recalcula métricas com posições atuais (resposta imediata para empregos, renda, etc.)
    _saMetrics = sa_calcMetricas(_saState, _saPositions);
    sa_renderMetrics();
  }
  sa_updateLabels();
  clearTimeout(_saDebounce);
  _saDebounce = setTimeout(sa_runSimulation, 280);
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
  // Layouts que não aplicam ângulo internamente: aplica rotação post-geração
  if (angRad && (_saState.layout || 'linear') !== 'linear') {
    _saPositions = _saRotatePositions(_saPositions, angRad);
  }
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
  if (_saSatView === 'sat') sa_satDrawPlants();

  const info = g('sa-canvas-info');
  if (info) {
    const lay = SA_LAYOUT_PRESETS.find(p => p.layout === _saState.layout && p.angle === _saState.angle)?.label
             || SA_LAYOUTS[_saState.layout]?.label || _saState.layout;
    info.textContent = `${_saPositions.length.toLocaleString('pt-BR')} plantas · ${_saState.spacingRow}m × ${_saState.spacingPlant}m · ${lay} · 🖱 roda = zoom · arrastar = mover`;
  }
}

// ─── Rotação de posições (para layouts sem angleRad interno) ──────────────────
function _saRotatePositions(pts, angleRad) {
  if (!pts.length || !angleRad) return pts;
  let sumX = 0, sumY = 0;
  pts.forEach(p => { sumX += p.x; sumY += p.y; });
  const cx = sumX / pts.length, cy = sumY / pts.length;
  const cosA = Math.cos(angleRad), sinA = Math.sin(angleRad);
  return pts.map(p => {
    const dx = p.x - cx, dy = p.y - cy;
    return { ...p, x: cx + dx * cosA - dy * sinA, y: cy + dx * sinA + dy * cosA };
  });
}

// ─── Painéis de resultado ─────────────────────────────────────────────────────
function sa_renderMetrics() {
  const el = document.getElementById('sa-metrics-panel');
  if (!el || !_saMetrics) return;
  const m = _saMetrics;
  const sysKey = _saState?.system || '';
  const area   = _saState?.area   || 0;

  const cell = (icon, label, val, unit, color) =>
    `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:7px 8px">
       <div style="font-size:10px;color:var(--text3)">${icon} ${label}</div>
       <div style="font-size:14px;font-weight:700;color:${color||'var(--green)'}">
         ${val}<span style="font-size:9px;color:var(--text3);margin-left:2px">${unit}</span>
       </div>
     </div>`;

  // Totais por sistema (colmeias, tanques, viveiros, UA, etc.)
  let sysCells = '';
  if (['apicultura','meliponicultura'].includes(sysKey)) {
    const dens  = sysKey === 'meliponicultura' ? 8 : 2;
    const total = Math.round(area * dens);
    sysCells += cell(sysKey === 'meliponicultura' ? '🍯' : '🐝',
      sysKey === 'meliponicultura' ? 'Colmeias nativas' : 'Colmeias Apis',
      total.toLocaleString('pt-BR'), '', '#f59e0b');
  }
  if (sysKey === 'piscicultura') {
    const tanks = Math.max(1, Math.round(area / 0.2));
    const volM3 = Math.round(area * 10000 * 1.2);
    sysCells += cell('🐟','Tanques/Viveiros', tanks.toLocaleString('pt-BR'), '', '#22d3ee');
    sysCells += cell('💧','Volume total', (volM3/1000).toFixed(0)+'k', 'm³', '#60a5fa');
  }
  if (sysKey === 'sisteminha') {
    const tanques  = Math.max(1, Math.round(area * 4));
    const galinhas = Math.round(area * 150);
    sysCells += cell('🐓','Galinhas/Aves', galinhas.toLocaleString('pt-BR'), '', '#fbbf24');
    sysCells += cell('🪣','Tanques Sist.', tanques.toLocaleString('pt-BR'), '', '#22d3ee');
  }
  if (['ilp','ilpf'].includes(sysKey)) {
    const ua = Math.round(area * (sysKey === 'ilpf' ? 1.2 : 2.0));
    sysCells += cell('🐄','Cap. suporte', ua.toLocaleString('pt-BR'), 'UA', '#60a5fa');
  }

  el.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
    ${cell('🌱','Plantas/Colônias', (m.nPlantas||0).toLocaleString('pt-BR'), '')}
    ${cell('📏','Densidade',        (m.density||0).toFixed(0), 'pl/ha')}
    ${cell('🌿','Espécies',         m.richness||0, '')}
    ${cell('🧬','Shannon-H',        (m.shannonH||0).toFixed(3), '')}
    ${cell('💰','Renda/ano',        'R$ '+((m.rendaAnual||0)/1000).toFixed(0)+'k', '')}
    ${cell('📅','Payback',          (m.paybackAnos||0).toFixed(1), 'anos')}
    ${cell('🌳','Carbono/ano',      (m.carbonAnual||0).toFixed(1), 't C')}
    ${cell('☁️','GEE evitado',      (m.geeAnual||0).toFixed(1), 't CO₂eq')}
    ${cell('🌿','Cobertura',        (m.coberturaPercent||0).toFixed(0), '%')}
    ${cell('👷','Empregos',         m.empregosGerados||0, '')}
    ${sysCells}
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

// ═══════════════════════════════════════════════════════════════════════════════
// SUBABA: PROJEÇÃO SATÉLITE
// ═══════════════════════════════════════════════════════════════════════════════
let _saSatMap           = null;   // instância Leaflet
let _saSatLayer         = null;   // L.layerGroup com plantas
let _saSatCenter        = { lat: -4.9, lng: -45.3 };
let _saSatBoundary      = null;   // polígono de perímetro (arrastável)
let _saSatCornerMarkers = [];     // alças de canto arrastáveis

// ─── Troca de subaba ─────────────────────────────────────────────────────────
function sa_switchView(view) {
  _saSatView = view;
  const cvDiv  = document.getElementById('sa-view-canvas');
  const satDiv = document.getElementById('sa-view-sat');
  const recDiv = document.getElementById('sa-view-rec');
  const btnCv  = document.getElementById('sa-vtab-canvas');
  const btnSat = document.getElementById('sa-vtab-sat');
  const btnRec = document.getElementById('sa-vtab-rec');

  const ON  = { background:'var(--green3)', borderColor:'var(--green3)', color:'#fff', fontWeight:'600' };
  const OFF = { background:'none', borderColor:'var(--border)', color:'var(--text2)', fontWeight:'normal' };

  if (cvDiv)  cvDiv.style.display  = view === 'canvas' ? 'block' : 'none';
  if (satDiv) satDiv.style.display = view === 'sat'    ? 'block' : 'none';
  if (recDiv) recDiv.style.display = view === 'rec'    ? 'block' : 'none';
  if (btnCv)  Object.assign(btnCv.style,  view === 'canvas' ? ON : OFF);
  if (btnSat) Object.assign(btnSat.style, view === 'sat'    ? ON : OFF);
  if (btnRec) Object.assign(btnRec.style, view === 'rec'    ? ON : OFF);

  // Oculta painel esquerdo e botões de sistema na aba Recomendação IA
  const sysRow  = document.getElementById('sa-sys-row');
  const leftCol = document.getElementById('sa-left-col');
  const grid    = document.getElementById('sa-main-grid');
  const isRec   = view === 'rec';
  if (sysRow)  sysRow.style.display          = isRec ? 'none' : 'flex';
  if (leftCol) leftCol.style.display         = isRec ? 'none' : 'block';
  if (grid)    grid.style.gridTemplateColumns = isRec ? '1fr'  : '300px 1fr';

  if (view === 'sat') {
    sa_satInit();
  } else if (view === 'rec') {
    if (typeof rec_init === 'function') rec_init();
  } else {
    // Redesenha canvas (pode ter perdido tamanho enquanto estava oculto)
    requestAnimationFrame(sa_redrawCanvas);
  }
}

// ─── Inicializa mapa Leaflet (só uma vez) ────────────────────────────────────
function sa_satInit() {
  _sa_satPopulateMunic();

  if (_saSatMap) {
    _saSatMap.invalidateSize();
    if (!_saSatLayer || _saSatLayer.getLayers().length === 0) sa_satDrawPlants(true);
    return;
  }

  const mapEl = document.getElementById('sa-sat-map');
  if (!mapEl || typeof L === 'undefined') return;

  _saSatMap = L.map('sa-sat-map', {
    center: [_saSatCenter.lat, _saSatCenter.lng],
    zoom: 15,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true    // scroll do mouse sempre ativo
  });
  _saSatMap.scrollWheelZoom.enable();

  // Satélite Esri World Imagery (livre, sem chave de API)
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri', maxZoom: 22 }
  ).addTo(_saSatMap);

  // Rótulos de estradas/lugares sobre o satélite
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    { attribution: '', maxZoom: 22, opacity: 0.65 }
  ).addTo(_saSatMap);

  _saSatLayer         = L.layerGroup().addTo(_saSatMap);
  _saSatBoundary      = null;
  _saSatCornerMarkers = [];

  // Legenda de espécies — controle Leaflet no canto inferior direito
  const LegendCtrl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd() {
      const d = L.DomUtil.create('div');
      d.id = 'sa-sat-legend';
      d.style.cssText = [
        'background:rgba(6,18,6,0.88)',
        'border:1px solid rgba(74,222,128,0.3)',
        'border-radius:8px',
        'padding:8px 12px',
        'font-size:11px',
        'color:#d4f0d4',
        'min-width:100px',
        'max-width:240px',
        'backdrop-filter:blur(3px)',
        'user-select:none',
        'pointer-events:none'
      ].join(';');
      d.innerHTML = '<span style="color:rgba(74,222,128,0.5);font-size:10px">Espécies</span>';
      L.DomEvent.disableClickPropagation(d);
      L.DomEvent.disableScrollPropagation(d);
      return d;
    }
  });
  new LegendCtrl().addTo(_saSatMap);

  // Clique no mapa reposiciona o centro do plantio
  _saSatMap.on('click', e => {
    _saSatCenter = { lat: e.latlng.lat, lng: e.latlng.lng };
    const latEl = document.getElementById('sa-sat-lat');
    const lngEl = document.getElementById('sa-sat-lng');
    if (latEl) latEl.value = e.latlng.lat.toFixed(6);
    if (lngEl) lngEl.value = e.latlng.lng.toFixed(6);
    sa_satDrawPlants(true);
  });

  sa_satDrawPlants(true);
}

// ─── Popula datalist de municípios (lazy, usa MUNIC_DATA global) ─────────────
function _sa_satPopulateMunic() {
  const dl = document.getElementById('sa-sat-munic-list');
  if (!dl || dl.dataset.populated) return;
  const md = (typeof _getMD === 'function') ? _getMD() : (typeof MUNIC_DATA !== 'undefined' ? MUNIC_DATA : []);
  if (!md.length) return;
  dl.innerHTML = [...md]
    .sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'pt-BR'))
    .map(r => `<option value="${r[0]}"></option>`)
    .join('');
  dl.dataset.populated = '1';
}

// ─── Seleciona município pelo nome digitado ───────────────────────────────────
function sa_satSelectByName(name) {
  if (!name || name.length < 3) return;
  const md = (typeof _getMD === 'function') ? _getMD() : (typeof MUNIC_DATA !== 'undefined' ? MUNIC_DATA : []);
  const row = md.find(r => String(r[0]).toLowerCase() === String(name).toLowerCase());
  if (!row || !row[1] || !row[2]) return;
  _saSatCenter = { lat: row[1], lng: row[2] };
  const latEl = document.getElementById('sa-sat-lat');
  const lngEl = document.getElementById('sa-sat-lng');
  if (latEl) latEl.value = row[1];
  if (lngEl) lngEl.value = row[2];
  if (_saSatMap) {
    _saSatMap.setView([row[1], row[2]], 14);
    sa_satDrawPlants(true);
  }
}

// ─── Aplica coordenadas digitadas manualmente ─────────────────────────────────
function sa_satApplyCoords() {
  const lat = parseFloat(document.getElementById('sa-sat-lat')?.value);
  const lng = parseFloat(document.getElementById('sa-sat-lng')?.value);
  if (isNaN(lat) || isNaN(lng)) return;
  _saSatCenter = { lat, lng };
  if (_saSatMap) {
    _saSatMap.setView([lat, lng], 15);
    sa_satDrawPlants(true);
  }
}

// ─── Desenha plantas no mapa satélite ────────────────────────────────────────
// autoFit=true → ajusta zoom/bounds para caber toda a área (navegação para novo local)
// autoFit=false (default) → mantém o zoom atual do usuário (mudança de slider)
function sa_satDrawPlants(autoFit) {
  if (!_saSatMap || !_saSatLayer) return;
  _saSatLayer.clearLayers();
  _saSatBoundary      = null;
  _saSatCornerMarkers = [];

  const positions = _saPositions;
  if (!positions || !positions.length) return;

  const sys     = SA_SYSTEMS[_saState?.system];
  const variant = sys?.variants.find(v => v.id === _saState?.variant) || sys?.variants[0];
  const nSp     = variant?.species?.length || 1;
  const sysKey  = _saState?.system || '';

  // Bounding box das posições (metros)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of positions) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  const worldCX = (minX + maxX) / 2, worldCY = (minY + maxY) / 2;

  const lat0    = _saSatCenter.lat;
  const lng0    = _saSatCenter.lng;
  const cosLat  = Math.cos(lat0 * Math.PI / 180);
  const mPerLat = 111319;
  const mPerLng = 111319 * cosLat;
  const toLL = (x, y) => [lat0 + (y - worldCY) / mPerLat, lng0 + (x - worldCX) / mPerLng];

  // Perímetro tracejado — armazenado em _saSatBoundary para atualização dinâmica
  const perimLL = [[minX,minY],[maxX,minY],[maxX,maxY],[minX,maxY]].map(([x,y]) => toLL(x, y));
  _saSatBoundary = L.polygon(perimLL, { color:'#4ade80', weight:2.5, fillOpacity:0.05, dashArray:'8 5', interactive:false })
    .addTo(_saSatLayer);

  // Alças de redimensionamento nos 4 cantos
  perimLL.forEach((ll, i) => {
    const icon = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#4ade80;border:2px solid #fff;border-radius:3px;cursor:nwse-resize;box-shadow:0 2px 6px rgba(0,0,0,0.7);transform:translate(-7px,-7px)"></div>',
      className: '', iconSize: [0, 0], iconAnchor: [0, 0]
    });
    const cm = L.marker(ll, { icon, draggable: true, zIndexOffset: 2000 });

    cm.on('dragstart', () => { _saSatMap.dragging.disable(); });

    cm.on('drag', e => {
      // Distância do canto arrastado até o centro do plantio em metros
      const dx   = (e.latlng.lng - lng0) * mPerLng;
      const dy   = (e.latlng.lat - lat0) * mPerLat;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Para quadrado centrado: distância ao canto = meia-aresta * √2
      const halfSide  = dist / Math.SQRT2;
      const newSide   = halfSide * 2;
      const newAreaHa = Math.max(0.5, Math.min(1000, (newSide * newSide) / 10000));

      _saState.area = Math.round(newAreaHa * 10) / 10;
      const sl  = document.getElementById('sa-area');
      const lbl = document.getElementById('sa-area-val');
      if (sl)  sl.value = Math.min(+(sl.max || 500), _saState.area);
      if (lbl) lbl.textContent = _saState.area.toFixed(1) + ' ha';

      // Atualiza polígono de perímetro
      const hLat = halfSide / mPerLat, hLng = halfSide / mPerLng;
      const newPerimLL = [
        [lat0 - hLat, lng0 - hLng],
        [lat0 - hLat, lng0 + hLng],
        [lat0 + hLat, lng0 + hLng],
        [lat0 + hLat, lng0 - hLng]
      ];
      if (_saSatBoundary) _saSatBoundary.setLatLngs(newPerimLL);

      // Move os demais cantos para manter o quadrado simétrico
      _saSatCornerMarkers.forEach((m, j) => { if (j !== i) m.setLatLng(newPerimLL[j]); });

      // Atualiza métricas em tempo real
      _saMetrics = sa_calcMetricas(_saState, _saPositions);
      sa_renderMetrics();
    });

    cm.on('dragend', () => {
      _saSatMap.dragging.enable();
      clearTimeout(_saDebounce);
      _saDebounce = setTimeout(sa_runSimulation, 100);
    });

    cm.addTo(_saSatLayer);
    _saSatCornerMarkers.push(cm);
  });

  // Cruz central
  L.circleMarker([lat0, lng0], {
    radius:6, color:'#fff', weight:2, fillColor:'#4ade80', fillOpacity:1, interactive:false
  }).bindTooltip(`Centro · ${lat0.toFixed(5)}, ${lng0.toFixed(5)}`, { sticky:true })
    .addTo(_saSatLayer);

  // Renderer canvas para performance
  const renderer = L.canvas({ padding: 0.5 });

  // Raio visual adaptado ao zoom (atualiza no evento zoom)
  const getRadius = () => {
    const z = _saSatMap.getZoom();
    return z >= 18 ? 5 : z >= 16 ? 4 : z >= 14 ? 3 : 2;
  };

  // Cores e estilos por sistema
  const waterSystems = ['piscicultura'];
  const isWater = waterSystems.includes(sysKey);

  positions.forEach(p => {
    const si  = Math.min(p.speciesIdx || 0, nSp - 1);
    const sp  = variant?.species?.[si];
    const col = sp?.color || sys?.color || '#4ade80';
    const ll  = toLL(p.x, p.y);

    if (isWater) {
      // Viveiros aparecem como polígonos azulados
      L.circleMarker(ll, {
        renderer, radius: getRadius() + 2,
        color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.35, weight: 1, interactive: false
      }).addTo(_saSatLayer);
    } else {
      L.circleMarker(ll, {
        renderer, radius: getRadius(),
        color: col, fillColor: col, fillOpacity: 0.85, weight: 0.5, interactive: false
      }).addTo(_saSatLayer);
    }
  });

  // Zoom → re-render com novo raio
  _saSatMap.off('zoomend', _saSatZoomHandler);
  _saSatZoomHandler = () => sa_satDrawPlants();
  _saSatMap.on('zoomend', _saSatZoomHandler);

  // Legenda de espécies (Leaflet control #sa-sat-legend, canto inferior direito)
  const legEl = document.getElementById('sa-sat-legend');
  if (legEl && variant?.species?.length) {
    const sysLabel = sys ? `${sys.icon} <strong>${sys.label}</strong>` : '';
    legEl.innerHTML =
      `<div style="font-size:10px;color:rgba(74,222,128,0.7);margin-bottom:5px">${sysLabel}</div>` +
      variant.species.map(sp =>
        `<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
          <span style="width:10px;height:10px;border-radius:50%;background:${sp.color};flex-shrink:0;display:inline-block;border:1px solid rgba(255,255,255,0.25)"></span>
          <span style="font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:170px" title="${sp.name}">${sp.name}</span>
        </div>`
      ).join('');
  }

  // Contador
  const countEl = document.getElementById('sa-sat-count');
  if (countEl) {
    const label = ['apicultura','meliponicultura'].includes(sysKey) ? 'colônias'
                : sysKey === 'piscicultura' ? 'pontos'
                : 'plantas';
    countEl.textContent = `🌱 ${positions.length.toLocaleString('pt-BR')} ${label} projetadas`;
  }

  // Fit bounds apenas quando solicitado (navegação para novo local)
  // — omitir ao mudar sliders para preservar o zoom do usuário
  if (autoFit) {
    try {
      const bounds = L.latLngBounds(positions.map(p => toLL(p.x, p.y)));
      _saSatMap.fitBounds(bounds, { padding:[50,50], maxZoom:20 });
    } catch(_) {}
  }
}
let _saSatZoomHandler = null;
