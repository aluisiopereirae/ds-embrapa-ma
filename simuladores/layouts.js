// Geradores de Layout de Plantio — Módulo de Simuladores
// Cada gerador retorna array de { x, y, row, col, speciesIdx }

// Cache das zonas do Sisteminha para visualizacao.js desenhar fundos coloridos
let SA_SISTEMINHA_ZONES = null;
let SA_SISTEMINHA_BOUNDS = null;

const SA_LAYOUTS = {
  linear: {
    label: 'Linear', icon: '≡', desc: 'Linhas paralelas tradicionais',
    generate(areaM2, spacingRow, spacingPlant, angleRad = 0, nSpecies = 1) {
      const W = Math.sqrt(areaM2), H = areaM2 / W;
      const cols = Math.max(1, Math.floor(W / spacingPlant));
      const rows = Math.max(1, Math.floor(H / spacingRow));
      const cosA = Math.cos(angleRad), sinA = Math.sin(angleRad);
      const cx = W / 2, cy = H / 2;
      const ns = Math.max(1, nSpecies);
      const pts = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = (c + 0.5) * spacingPlant - cx;
          const y0 = (r + 0.5) * spacingRow - cy;
          pts.push({
            x: cx + x0 * cosA - y0 * sinA,
            y: cy + x0 * sinA + y0 * cosA,
            row: r, col: c, speciesIdx: r % ns  // alterna espécies por linha
          });
        }
      }
      return pts;
    }
  },

  hexagonal: {
    label: 'Hexagonal', icon: '⬡', desc: 'Grade hexagonal — maior densidade por área',
    generate(areaM2, spacingRow, spacingPlant, angleRad = 0, nSpecies = 1) {
      const W = Math.sqrt(areaM2), H = areaM2 / W;
      const ns = Math.max(1, nSpecies);
      const pts = [];
      const rows = Math.max(1, Math.floor(H / spacingRow));
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * spacingPlant * 0.5;
        const cols = Math.max(1, Math.floor((W - offset) / spacingPlant));
        for (let c = 0; c < cols; c++) {
          pts.push({
            x: offset + (c + 0.5) * spacingPlant,
            y: (r + 0.5) * spacingRow,
            row: r, col: c, speciesIdx: r % ns  // alterna espécies por linha
          });
        }
      }
      return pts;
    }
  },

  circular: {
    label: 'Circular', icon: '◎', desc: 'Anéis concêntricos — pomar circular',
    generate(areaM2, spacingRow, spacingPlant, angleRad = 0, nSpecies = 1) {
      const R = Math.sqrt(areaM2 / Math.PI);
      const cx = R, cy = R;
      const pts = [{ x: cx, y: cy, row: 0, col: 0, speciesIdx: 0 }];
      let ring = 1;
      let r = spacingRow;
      while (r <= R) {
        const perim = 2 * Math.PI * r;
        const n = Math.max(6, Math.floor(perim / spacingPlant));
        for (let i = 0; i < n; i++) {
          const a = (2 * Math.PI * i) / n;
          pts.push({
            x: cx + r * Math.cos(a),
            y: cy + r * Math.sin(a),
            row: ring, col: i,
            speciesIdx: ring % Math.max(1, nSpecies)
          });
        }
        r += spacingRow;
        ring++;
      }
      return pts;
    }
  },

  faixas: {
    label: 'Faixas', icon: '▤', desc: 'Faixas alternadas — renques florestais + lavoura',
    generate(areaM2, spacingRow, spacingPlant, angleRad = 0, nSpecies = 2) {
      const W = Math.sqrt(areaM2), H = areaM2 / W;
      const pts = [];
      // Renque a cada 3 linhas de lavoura
      const linesPerBlock = 4; // 1 renque + 3 lavoura
      let row = 0;
      let y = spacingRow / 2;
      while (y < H) {
        const lineInBlock = row % linesPerBlock;
        const isRenque = lineInBlock === 0;
        const sIdx = isRenque ? 0 : 1 % Math.max(1, nSpecies);
        const sp = isRenque ? spacingPlant * 1.5 : spacingPlant;
        const cols = Math.max(1, Math.floor(W / sp));
        for (let c = 0; c < cols; c++) {
          pts.push({ x: (c + 0.5) * sp, y, row, col: c, speciesIdx: sIdx });
        }
        y += isRenque ? spacingRow * 1.5 : spacingRow;
        row++;
      }
      return pts;
    }
  },

  grid: {
    label: 'Quadriculado', icon: '⊞', desc: 'Grade regular quadrada — máximo controle',
    generate(areaM2, spacingRow, spacingPlant, angleRad = 0, nSpecies = 2) {
      const sp = (spacingRow + spacingPlant) / 2;
      const side = Math.sqrt(areaM2);
      const n = Math.max(1, Math.floor(side / sp));
      const pts = [];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          pts.push({
            x: (c + 0.5) * sp, y: (r + 0.5) * sp,
            row: r, col: c,
            speciesIdx: (r + c) % Math.max(1, nSpecies)
          });
        }
      }
      return pts;
    }
  },

  random: {
    label: 'Aleatório', icon: '⁕', desc: 'Distribuição natural — SAF e extrativismo',
    generate(areaM2, spacingRow, spacingPlant, angleRad = 0, nSpecies = 1) {
      const W = Math.sqrt(areaM2), H = areaM2 / W;
      const minDist = (spacingRow + spacingPlant) / 2 * 0.65;
      const target = Math.min(1200, Math.floor(areaM2 / (spacingRow * spacingPlant)));
      const pts = [];
      let attempts = 0;
      const maxAttempts = target * 8;
      while (pts.length < target && attempts < maxAttempts) {
        attempts++;
        const x = Math.random() * W;
        const y = Math.random() * H;
        let ok = true;
        for (let i = pts.length - 1; i >= Math.max(0, pts.length - 60); i--) {
          if (Math.hypot(x - pts[i].x, y - pts[i].y) < minDist) { ok = false; break; }
        }
        if (ok) {
          pts.push({ x, y, row: 0, col: pts.length, speciesIdx: Math.floor(Math.random() * Math.max(1, nSpecies)) });
        }
      }
      return pts;
    }
  },

  mosaico: {
    label: 'Mosaico', icon: '▦', desc: 'Blocos alternados por espécie',
    generate(areaM2, spacingRow, spacingPlant, angleRad = 0, nSpecies = 2) {
      const W = Math.sqrt(areaM2), H = areaM2 / W;
      const blockM = Math.max(spacingRow, spacingPlant) * 5;
      const cols = Math.max(1, Math.floor(W / spacingPlant));
      const rows = Math.max(1, Math.floor(H / spacingRow));
      const ns = Math.max(2, nSpecies);
      const pts = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const brow = Math.floor((r * spacingRow) / blockM);
          const bcol = Math.floor((c * spacingPlant) / blockM);
          pts.push({
            x: (c + 0.5) * spacingPlant, y: (r + 0.5) * spacingRow,
            row: r, col: c, speciesIdx: (brow + bcol) % ns
          });
        }
      }
      return pts;
    }
  },

  sisteminha: {
    label: 'Sisteminha', icon: '🐓', desc: 'Zonas integradas: tanque, aves, horta, compostagem',
    generate(areaM2, spacingRow, spacingPlant, tankCodeRad = 0, nSpecies = 4) {
      const W = Math.sqrt(areaM2), H = areaM2 / W;
      const ns = Math.max(1, nSpecies);
      const tc = Math.round(tankCodeRad * 180 / Math.PI); // rad → graus: 0=centro, 45=canto, 90=lateral

      // Mapeamento zona → índice de espécie conforme variante
      // padrao(4):   0=hortaliças, 1=galinhas, 2=tilápia,    3=ervas
      // ampliado(5): 0=hortaliças, 1=galinhas, 2=patos,      3=tilápia, 4=frutíferas
      // completo(7): 0=hortaliças, 1=galinhas, 2=codornas,   3=patos,   4=tilápia, 5=frutíferas, 6=compost
      const Z = {
        horta: 0,
        aves:  1,
        cod:   ns >= 7 ? 2 : -1,
        patos: ns >= 7 ? 3 : ns >= 5 ? 2 : -1,
        tank:  ns >= 7 ? 4 : ns >= 5 ? 3 : 2,
        fruti: ns >= 7 ? 5 : ns >= 5 ? 4 : -1,
        comp:  ns >= 7 ? 6 : -1,
        ervas: ns <= 4 ? 3 : -1,
      };

      // Monta array de zonas { type, x0, y0, x1, y1, spMult, srMult }
      let zones = [];

      if (tc >= 35 && tc <= 55) { // ─── canto superior-esquerdo ───────────
        const lw = W * 0.38, th = H * 0.40, avh = H * 0.35;
        zones.push({ t:'tank',  x0:0,      y0:0,          x1:lw,       y1:th,         sm:0.45, rm:0.45 });
        if (Z.cod >= 0) {
          zones.push({ t:'aves', x0:0,     y0:th,         x1:lw,       y1:th+avh*0.5, sm:0.65, rm:0.65 });
          zones.push({ t:'cod',  x0:0,     y0:th+avh*0.5, x1:lw*0.52,  y1:th+avh,     sm:0.55, rm:0.55 });
          zones.push({ t:'patos',x0:lw*0.52,y0:th+avh*0.5,x1:lw,       y1:th+avh,     sm:0.55, rm:0.55 });
          zones.push({ t:'comp', x0:0,     y0:th+avh,     x1:lw*0.45,  y1:H,          sm:0.45, rm:0.45 });
          zones.push({ t:'ervas',x0:lw*0.45,y0:th+avh,    x1:lw,       y1:H,          sm:0.50, rm:0.50 });
        } else if (Z.patos >= 0) {
          zones.push({ t:'aves', x0:0,     y0:th,         x1:lw,       y1:th+avh*0.55,sm:0.65, rm:0.65 });
          zones.push({ t:'patos',x0:0,     y0:th+avh*0.55,x1:lw,       y1:th+avh,     sm:0.55, rm:0.55 });
          zones.push({ t:'ervas',x0:0,     y0:th+avh,     x1:lw,       y1:H,          sm:0.50, rm:0.50 });
        } else {
          zones.push({ t:'aves', x0:0,     y0:th,         x1:lw,       y1:th+avh,     sm:0.65, rm:0.65 });
          zones.push({ t:'ervas',x0:0,     y0:th+avh,     x1:lw,       y1:H,          sm:0.50, rm:0.50 });
        }
        zones.push({ t:'horta', x0:lw, y0:0,      x1:W, y1:H*0.60, sm:1.0, rm:1.0 });
        zones.push({ t:(Z.fruti>=0?'fruti':'horta'), x0:lw, y0:H*0.60, x1:W, y1:H, sm:1.2, rm:1.2 });

      } else if (tc >= 75 && tc <= 105) { // ─── lateral esquerda ────────────
        const lw = W * 0.30;
        zones.push({ t:'aves', x0:0,  y0:0,      x1:lw,       y1:H*0.20, sm:0.65, rm:0.65 });
        zones.push({ t:'tank', x0:0,  y0:H*0.20, x1:lw,       y1:H*0.78, sm:0.45, rm:0.45 });
        if (Z.patos >= 0) {
          zones.push({ t:'patos',x0:0,    y0:H*0.78, x1:lw*0.55,  y1:H,      sm:0.55, rm:0.55 });
          zones.push({ t:(Z.comp>=0?'comp':'ervas'), x0:lw*0.55, y0:H*0.78, x1:lw, y1:H, sm:0.45, rm:0.45 });
        } else {
          zones.push({ t:'ervas',x0:0,    y0:H*0.78, x1:lw,       y1:H,      sm:0.50, rm:0.50 });
        }
        zones.push({ t:'horta', x0:lw, y0:0,      x1:W,        y1:H*0.55, sm:1.0, rm:1.0 });
        if (Z.fruti >= 0) {
          zones.push({ t:'fruti', x0:lw, y0:H*0.55, x1:W*0.87, y1:H, sm:1.2, rm:1.2 });
          zones.push({ t:(Z.comp>=0?'comp':'ervas'), x0:W*0.87, y0:H*0.78, x1:W, y1:H, sm:0.45, rm:0.45 });
        } else {
          zones.push({ t:'horta', x0:lw, y0:H*0.55, x1:W, y1:H, sm:1.0, rm:1.0 });
        }

      } else { // ─── tanque central ──────────────────────────────────────────
        const cx0 = W*0.32, cx1 = W*0.68, cy0 = H*0.30, cy1 = H*0.70;
        zones.push({ t:'horta', x0:0,   y0:0,   x1:W,   y1:cy0,  sm:1.0, rm:1.0 });
        zones.push({ t:'aves',  x0:0,   y0:cy0, x1:cx0, y1:cy1,  sm:0.65,rm:0.65 });
        zones.push({ t:'tank',  x0:cx0, y0:cy0, x1:cx1, y1:cy1,  sm:0.45,rm:0.45 });
        if (Z.patos >= 0) {
          zones.push({ t:'patos', x0:cx1, y0:cy0, x1:W*0.84, y1:cy1, sm:0.60, rm:0.60 });
          zones.push({ t:'ervas', x0:W*0.84, y0:cy0, x1:W, y1:cy1,   sm:0.50, rm:0.50 });
        } else {
          zones.push({ t:'ervas', x0:cx1, y0:cy0, x1:W, y1:cy1,       sm:0.50, rm:0.50 });
        }
        if (Z.fruti >= 0) {
          zones.push({ t:(Z.comp>=0?'comp':'ervas'), x0:0, y0:cy1, x1:W*0.13, y1:H, sm:0.45, rm:0.45 });
          zones.push({ t:'fruti', x0:W*0.13, y0:cy1, x1:W, y1:H, sm:1.2, rm:1.2 });
        } else {
          zones.push({ t:'horta', x0:0, y0:cy1, x1:W, y1:H, sm:1.0, rm:1.0 });
          if (Z.comp >= 0) zones.push({ t:'comp', x0:0, y0:H*0.87, x1:W*0.13, y1:H, sm:0.45, rm:0.45 });
        }
      }

      // Filtra zonas com índice inválido e converte t→speciesIdx
      const validZones = zones.map(z => ({ ...z, speciesIdx: Z[z.t] ?? 0 }))
                               .filter(z => Z[z.t] !== undefined && Z[z.t] >= 0 && Z[z.t] < ns);

      // Cache para visualizacao.js
      SA_SISTEMINHA_ZONES  = validZones;
      SA_SISTEMINHA_BOUNDS = { W, H };

      // Gera posições por zona
      const pts = [];
      for (const z of validZones) {
        const zW = z.x1 - z.x0, zH = z.y1 - z.y0;
        const sp = spacingPlant * z.sm, sr = spacingRow * z.rm;
        const cols = Math.max(1, Math.floor(zW / sp));
        const rows = Math.max(1, Math.floor(zH / sr));
        const cSp = zW / cols, rSp = zH / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            pts.push({
              x: z.x0 + (c + 0.5) * cSp,
              y: z.y0 + (r + 0.5) * rSp,
              row: r, col: c, speciesIdx: z.speciesIdx, zone: z.t
            });
          }
        }
      }
      return pts;
    }
  }
};

const SA_LAYOUT_ORDER = ['linear', 'hexagonal', 'circular', 'faixas', 'grid', 'random', 'mosaico', 'sisteminha'];
