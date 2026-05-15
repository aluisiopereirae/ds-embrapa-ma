// Visualização Canvas 2D — Módulo de Simuladores
// Usa ctx transform (translate + scale) para zoom/pan + DPR para nitidez

function sa_drawPlantacao(canvas, state, positions, options) {
  options = options || {};
  const zoom = options.zoom || 1;
  const panX = options.panX || 0;
  const panY = options.panY || 0;

  // ── Resolução HiDPI: canvas físico = CSS × devicePixelRatio ───────────────
  const dpr = window.devicePixelRatio || 1;
  // offsetWidth pode ser 0 se ainda não está no DOM — usa fallback
  const cssW = (canvas.offsetWidth  > 0 ? canvas.offsetWidth  : 640);
  const cssH = (canvas.offsetHeight > 0 ? canvas.offsetHeight : 420);
  const physW = Math.round(cssW * dpr);
  const physH = Math.round(cssH * dpr);
  if (canvas.width !== physW || canvas.height !== physH) {
    canvas.width  = physW;
    canvas.height = physH;
  }

  const ctx = canvas.getContext('2d');
  // Base: todos os comandos em CSS px (lógicos), renderiza em físico
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const W = cssW, H = cssH; // dimensões lógicas (CSS px)

  const sys = SA_SYSTEMS[state.system];
  const variant = sys && (sys.variants.find(v => v.id === state.variant) || sys.variants[0]);

  // ── Fundo ─────────────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d1f0d');
  bg.addColorStop(1, '#071407');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grade de solo sutil
  ctx.strokeStyle = 'rgba(74,222,128,0.045)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // ── Header fixo ───────────────────────────────────────────────────────────
  const HEADER = 30;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, W, HEADER);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  if (sys && variant) {
    const hdr = `${sys.icon} ${sys.label} · ${variant.label} · ${state.area} ha · ${(positions||[]).length.toLocaleString('pt-BR')} plantas`;
    ctx.fillText(hdr.length > 72 ? hdr.slice(0, 71) + '…' : hdr, 10, HEADER / 2);
  } else {
    ctx.fillText('Configure o sistema acima', 10, HEADER / 2);
  }
  ctx.textBaseline = 'alphabetic';

  if (!variant || !positions || !positions.length) {
    ctx.fillStyle = 'rgba(74,222,128,0.7)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▶ Ajuste os parâmetros — a visualização atualiza automaticamente', W / 2, H / 2 + 10);
    return;
  }

  // ── Bounding box das posições ─────────────────────────────────────────────
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of positions) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const rangeX = (maxX - minX) || 1;
  const rangeY = (maxY - minY) || 1;

  // ── Escala automática (auto-fit) ──────────────────────────────────────────
  const PAD = 30;
  const drawAreaW = W - PAD * 2;
  const drawAreaH = H - HEADER - PAD * 2;
  const baseScale = Math.min(drawAreaW / rangeX, drawAreaH / rangeY);
  const scale = baseScale * zoom;           // px (CSS) / metro

  const worldCX = (minX + maxX) / 2;
  const worldCY = (minY + maxY) / 2;
  const drawCX  = W / 2 + panX;            // centro do canvas + pan
  const drawCY  = HEADER + drawAreaH / 2 + PAD + panY;

  // Funções de conversão mundo → tela (para heatmap)
  const toSX = x => (x - worldCX) * scale + drawCX;
  const toSY = y => (y - worldCY) * scale + drawCY;

  // ── Heatmap (antes das plantas, em coordenadas de tela) ───────────────────
  if (options.heatmap && positions.length >= 8) {
    sa_drawDensityHeatmap(ctx, positions, toSX, toSY, W, H, scale);
  }

  // ── Transform principal: tela → mundo ─────────────────────────────────────
  ctx.save();
  ctx.translate(drawCX, drawCY);
  ctx.scale(scale, scale);
  ctx.translate(-worldCX, -worldCY);

  // Borda da área
  const border1 = 1.5 / scale;
  ctx.strokeStyle = 'rgba(74,222,128,0.4)';
  ctx.lineWidth = border1;
  ctx.setLineDash([8 / scale, 5 / scale]);
  ctx.strokeRect(minX, minY, rangeX, rangeY);
  ctx.setLineDash([]);

  // Cantos decorativos
  const cSz = Math.min(rangeX, rangeY) * 0.04;
  ctx.strokeStyle = 'rgba(74,222,128,0.7)';
  ctx.lineWidth = border1 * 1.5;
  const corners = [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]];
  corners.forEach(([cx, cy]) => {
    const sx = cx === minX ? 1 : -1, sy = cy === minY ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(cx + sx*cSz, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy*cSz); ctx.stroke();
  });

  // ── Plantas ───────────────────────────────────────────────────────────────
  // Raio mínimo visível: 2.5 CSS px convertido para metros
  const minRadiusMetros = 2.5 / scale;
  const nSpec = variant.species.length;

  positions.forEach(p => {
    const si = Math.min(p.speciesIdx, nSpec - 1);
    const sp = variant.species[si];
    const px = p.x, py = p.y;
    const crNat = (sp.crown || 0.5) * 0.5;          // raio copa real em metros
    const cr = Math.max(crNat, minRadiusMetros);     // nunca menor que 2.5px
    const col = sp.color || '#4ade80';

    // Copa: gradiente radial em metros
    const g = ctx.createRadialGradient(px, py, 0, px, py, cr);
    g.addColorStop(0,    col + 'e8');
    g.addColorStop(0.5,  col + 'a0');
    g.addColorStop(1,    col + '10');
    ctx.beginPath();
    ctx.arc(px, py, cr, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Tronco central (só visível quando zoom suficiente)
    const trR = cr * 0.18;
    if (trR * scale > 0.8) {  // só se >= 0.8px
      ctx.beginPath(); ctx.arc(px, py, trR, 0, Math.PI * 2);
      ctx.fillStyle = '#0d0600'; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, trR * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = col + 'cc'; ctx.fill();
    }
  });

  ctx.restore(); // fim do transform

  // ── Legenda (em coordenadas CSS px, nítida) ───────────────────────────────
  sa_drawLegend(ctx, variant.species, W, H);

  // ── Barra de escala ───────────────────────────────────────────────────────
  sa_drawScaleBar(ctx, scale, W, H);
}

// ── Heatmap de densidade (físico: usa canvas.width/height reais) ─────────────
function sa_drawDensityHeatmap(ctx, positions, toSX, toSY, W, H, scale) {
  // getImageData opera em pixels físicos; toSX/toSY retornam CSS px
  const dpr = window.devicePixelRatio || 1;
  const phW = Math.round(W * dpr), phH = Math.round(H * dpr);
  const imgData = ctx.getImageData(0, 0, phW, phH);
  const d = imgData.data;
  const radius = Math.max(14, Math.min(55, scale * 1.2)) * dpr;
  const step = positions.length > 600 ? 2 : 1;
  for (let i = 0; i < positions.length; i += step) {
    const p = positions[i];
    const cx = Math.round(toSX(p.x) * dpr), cy = Math.round(toSY(p.y) * dpr);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) continue;
        const fpx = cx + dx, fpy = cy + dy;
        if (fpx < 0 || fpx >= phW || fpy < 0 || fpy >= phH) continue;
        const idx = (fpy * phW + fpx) * 4;
        const v = (1 - dist / radius) * 38;
        d[idx + 1] = Math.min(255, d[idx + 1] + v);
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

// ── Legenda (CSS px, DPR-nítida) ─────────────────────────────────────────────
function sa_drawLegend(ctx, species, W, H) {
  const lW = 180, lineH = 20, topPad = 16, sidePad = 10;
  const lH = species.length * lineH + topPad + 6;
  const lX = W - lW - 10, lY = H - lH - 10;

  // Fundo
  ctx.fillStyle = 'rgba(6,18,6,0.82)';
  ctx.strokeStyle = 'rgba(74,222,128,0.35)';
  ctx.lineWidth = 1;
  _saRoundRect(ctx, lX, lY, lW, lH, 8);
  ctx.fill(); ctx.stroke();

  // Título
  ctx.fillStyle = '#6fba6f';
  ctx.font = 'bold 9.5px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ESPÉCIES', lX + sidePad, lY + topPad / 2 + 2);

  // Itens
  species.forEach((sp, i) => {
    const y = lY + topPad + i * lineH + lineH / 2;

    // Círculo colorido
    ctx.beginPath();
    ctx.arc(lX + sidePad + 7, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = sp.color || '#4ade80';
    ctx.fill();

    // Nome
    ctx.fillStyle = '#d4f0d4';
    ctx.font = '9.5px sans-serif';
    const nm = sp.name.length > 24 ? sp.name.slice(0, 23) + '…' : sp.name;
    ctx.fillText(nm, lX + sidePad + 18, y);
  });
  ctx.textBaseline = 'alphabetic';
}

// ── Barra de escala ───────────────────────────────────────────────────────────
function sa_drawScaleBar(ctx, scale, W, H) {
  // Escolhe incremento legível (40–110px de barra)
  const inc = [0.5,1,2,5,10,20,50,100,200,500,1000,2000,5000].find(v => v*scale >= 40 && v*scale <= 110) || 1;
  const barPx = inc * scale;
  const bX = 12, bY = H - 18;

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  _saRoundRect(ctx, bX - 4, bY - 14, barPx + 52, 20, 4);
  ctx.fill();

  ctx.fillStyle = '#4ade80';
  ctx.fillRect(bX, bY - 3, barPx, 5);
  ctx.fillRect(bX, bY - 6, 2, 9);
  ctx.fillRect(bX + barPx - 1, bY - 6, 2, 9);

  ctx.fillStyle = '#a8d8a8';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(inc >= 1000 ? (inc/1000)+'km' : inc+'m', bX + barPx + 6, bY);
  ctx.textBaseline = 'alphabetic';
}

function _saRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); }
  else {
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.arcTo(x+w, y, x+w, y+r, r); ctx.lineTo(x+w, y+h-r);
    ctx.arcTo(x+w, y+h, x+w-r, y+h, r); ctx.lineTo(x+r, y+h);
    ctx.arcTo(x, y+h, x, y+h-r, r); ctx.lineTo(x, y+r);
    ctx.arcTo(x, y, x+r, y, r); ctx.closePath();
  }
}
