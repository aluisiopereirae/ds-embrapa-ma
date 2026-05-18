// Geradores de Layout de Plantio — Módulo de Simuladores
// Cada gerador retorna array de { x, y, row, col, speciesIdx }

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
  }
};

const SA_LAYOUT_ORDER = ['linear', 'hexagonal', 'circular', 'faixas', 'grid', 'random', 'mosaico'];
