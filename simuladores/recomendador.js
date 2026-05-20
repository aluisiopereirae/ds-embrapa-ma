// ═══════════════════════════════════════════════════════════════════════════
// RECOMENDADOR IA — Classificação Multi-Critério de Sistemas Produtivos
// Algoritmo MCDA ponderado com dados reais Maranhão: solo, clima, bioma,
// UCs, Terras Indígenas, Quilombos, altitude, IDH, GEE, queimadas, desmat.
// Embrapa Maranhão · DS 2025
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ─── Unidades de Conservação do Maranhão (dados CNUC/ICMBio 2024) ──────────
// res: 'total'=bloqueia tudo | 'extrat'=só extrativismo | 'parcial'=APA/condicionado | 'comunit'=uso comunitário
const REC_UC = [
  // ── Parques Nacionais ────────────────────────────────────────────────────
  { n:'PN Lençóis Maranhenses',          t:'PARNA',    lat:-2.49, lng:-43.12, r:85,  res:'total',  c:'#ef4444' },
  { n:'PN Chapada das Mesas',            t:'PARNA',    lat:-7.18, lng:-46.61, r:45,  res:'total',  c:'#ef4444' },
  // ── Reservas Biológicas ──────────────────────────────────────────────────
  { n:'REBIO Gurupi',                    t:'REBIO',    lat:-2.94, lng:-46.93, r:65,  res:'total',  c:'#dc2626' },
  // ── Reservas Extrativistas ───────────────────────────────────────────────
  { n:'RESEX do Ciriáco',                t:'RESEX',    lat:-3.55, lng:-46.67, r:20,  res:'extrat', c:'#f97316' },
  { n:'RESEX Chapada Limpa',             t:'RESEX',    lat:-4.16, lng:-45.51, r:18,  res:'extrat', c:'#f97316' },
  { n:'RESEX Quilombo do Frechal',       t:'RESEX',    lat:-2.34, lng:-44.88, r:8,   res:'comunit',c:'#f97316' },
  { n:'RESEX Marinha Caeté-Taperaçu',   t:'RESEX',    lat:-1.14, lng:-46.78, r:22,  res:'extrat', c:'#f97316' },
  { n:'RESEX Baixo Parnaíba Maranhense', t:'RESEX',    lat:-2.95, lng:-41.89, r:30,  res:'extrat', c:'#f97316' },
  // ── APAs Federais ────────────────────────────────────────────────────────
  { n:'APA Baixada Maranhense',          t:'APA',      lat:-3.15, lng:-44.82, r:110, res:'parcial',c:'#eab308' },
  { n:'APA Upaon-Açu/Miritiba',         t:'APA',      lat:-2.01, lng:-43.61, r:80,  res:'parcial',c:'#eab308' },
  { n:'APA Reentrâncias Maranhenses',    t:'APA',      lat:-2.25, lng:-44.55, r:95,  res:'parcial',c:'#eab308' },
  { n:'APA Delta do Parnaíba',           t:'APA',      lat:-2.89, lng:-41.72, r:55,  res:'parcial',c:'#eab308' },
  // ── Parques Estaduais ────────────────────────────────────────────────────
  { n:'PE do Mirador',                   t:'PARQUE_E', lat:-6.27, lng:-44.58, r:55,  res:'total',  c:'#ef4444' },
  { n:'PE do Bacanga',                   t:'PARQUE_E', lat:-2.57, lng:-44.29, r:9,   res:'total',  c:'#ef4444' },
  { n:'PE Bom Jesus dos Perdões',        t:'PARQUE_E', lat:-2.13, lng:-43.49, r:12,  res:'total',  c:'#ef4444' },
  { n:'PE Sete Cidades (limítrofe MA)',  t:'PARQUE_E', lat:-4.10, lng:-41.70, r:18,  res:'total',  c:'#ef4444' },
  // ── APAs Estaduais ───────────────────────────────────────────────────────
  { n:'APA Rio Mearim',                  t:'APA_E',    lat:-4.29, lng:-44.75, r:40,  res:'parcial',c:'#ca8a04' },
  { n:'APA Rio Preguiças/Pequenos Lençóis', t:'APA_E', lat:-2.58, lng:-43.05, r:35, res:'parcial',c:'#ca8a04' },
  { n:'APA Rio Itapecuru',               t:'APA_E',    lat:-4.85, lng:-43.55, r:45,  res:'parcial',c:'#ca8a04' },
  // ── Floresta Nacional ────────────────────────────────────────────────────
  { n:'FLONA Araripe-Apodi',             t:'FLONA',    lat:-7.18, lng:-45.32, r:30,  res:'parcial',c:'#84cc16' },
];

// ─── Terras Indígenas homologadas no MA (FUNAI 2024) ──────────────────────
const REC_TI = [
  { n:"TI Araribóia",                lat:-4.18, lng:-45.85, r:85 },
  { n:"TI Ka'apor",                  lat:-2.68, lng:-46.31, r:75 },
  { n:"TI Caru",                     lat:-3.55, lng:-46.15, r:50 },
  { n:"TI Alto Turiaçu",             lat:-2.15, lng:-46.58, r:65 },
  { n:"TI Cana Brava/Guajajara",     lat:-5.52, lng:-46.85, r:45 },
  { n:"TI Morro Branco",             lat:-7.48, lng:-45.30, r:20 },
  { n:"TI Bacurizinho",              lat:-4.62, lng:-46.07, r:25 },
  { n:"TI Porquinhos",               lat:-6.38, lng:-45.72, r:40 },
  { n:"TI Governador",               lat:-3.15, lng:-45.48, r:20 },
  { n:"TI Lagoa Comprida",           lat:-7.25, lng:-45.90, r:15 },
  { n:"TI Awa",                      lat:-3.72, lng:-46.73, r:55 },
  { n:"TI Coqui",                    lat:-3.72, lng:-45.78, r:18 },
  { n:"TI Urucu/Juruá",             lat:-2.97, lng:-46.24, r:22 },
  { n:"TI Taquaritiua",              lat:-3.25, lng:-45.62, r:12 },
  { n:"TI Geralda/Toco Preto",       lat:-3.68, lng:-46.34, r:15 },
  { n:"TI Krikati",                  lat:-4.55, lng:-46.08, r:30 },
  { n:"TI Rodeador",                 lat:-3.95, lng:-44.85, r:10 },
];

// ─── Territórios Quilombolas certificados MA (FCP 2024) ───────────────────
const REC_QUILOMBOS = [
  { n:'QT Frechal',              lat:-2.34, lng:-44.88, r:5 },
  { n:'QT Alcântara',            lat:-2.40, lng:-44.42, r:15 },
  { n:'QT Rio dos Peixes',       lat:-3.61, lng:-45.17, r:8 },
  { n:'QT Centro do Guilherme',  lat:-4.10, lng:-46.30, r:6 },
  { n:'QT Santa Rosa dos Pretos',lat:-4.40, lng:-43.92, r:9 },
  { n:'QT Montes Claros',        lat:-7.52, lng:-44.78, r:7 },
];

// ─── Matriz de compatibilidade por sistema ────────────────────────────────
// precip/temp: [[limInf, limSup, score], ...] — interpolação linear entre segmentos
// bioma/solo: mapa chave→score
// Parâmetros agronômicos: valores da literatura Embrapa / SEEG / MapBiomas
// laborIntensity: 0=extensivo 1=muito intensivo em mão-de-obra
// bovinosBonus: true → ganha com tradição pecuária local
// pescaTradBonus: true → ganha com tradição pesqueira local
// settle: true → ganha com presença de assentamentos de reforma agrária
// floodPenalty: true → perde em áreas alagadiças; floodBonus: true → ganha
const REC_COMPAT = {
  ilpf: {
    label:'ILPF', icon:'🐄', color:'#22c55e', desc:'Integração Lavoura-Pecuária-Floresta',
    precip:[[0,600,0.10],[600,900,0.55],[900,1400,1.00],[1400,1900,0.85],[1900,2500,0.60],[2500,5000,0.35]],
    temp:  [[0,18,0.30],[18,22,0.70],[22,32,1.00],[32,36,0.65],[36,50,0.20]],
    bioma: {'Cerrado':1.0,'Transição':0.90,'Amazônia':0.70},
    solo:  {'Latossolo':1.00,'Argissolo':0.90,'Nitossolo':0.85,'Cambissolo':0.75,'Plintossolo':0.55,'Gleissolo':0.30,'Neossolo':0.50,'Espodossolo':0.25},
    minArea:10, aguaSens:0.50, mktSens:0.70, desmatBonus:true,
    laborIntensity:0.35, bovinosBonus:true, pescaTradBonus:false, settle:false, floodPenalty:true,
    gee_seq:10.2, renda_ha:4800, invest_ha:3200, empregos_100ha:15, biodiv:7.0, payback:5.0, cobertura:35,
  },
  ilp: {
    label:'ILP', icon:'🌾', color:'#84cc16', desc:'Integração Lavoura-Pecuária',
    precip:[[0,600,0.15],[600,900,0.60],[900,1400,1.00],[1400,1900,0.80],[1900,2500,0.55],[2500,5000,0.30]],
    temp:  [[0,18,0.30],[18,22,0.75],[22,32,1.00],[32,36,0.60],[36,50,0.20]],
    bioma: {'Cerrado':1.0,'Transição':0.85,'Amazônia':0.60},
    solo:  {'Latossolo':1.00,'Argissolo':0.90,'Nitossolo':0.80,'Cambissolo':0.70,'Plintossolo':0.50,'Gleissolo':0.25,'Neossolo':0.45,'Espodossolo':0.20},
    minArea:5, aguaSens:0.60, mktSens:0.65, desmatBonus:false,
    laborIntensity:0.30, bovinosBonus:true, pescaTradBonus:false, settle:false, floodPenalty:true,
    gee_seq:4.5, renda_ha:3800, invest_ha:2500, empregos_100ha:8, biodiv:4.5, payback:3.0, cobertura:0,
  },
  saf: {
    label:'SAF', icon:'🌳', color:'#10b981', desc:'Sistema Agroflorestal',
    precip:[[0,700,0.10],[700,1000,0.55],[1000,1400,0.90],[1400,2200,1.00],[2200,3000,0.85],[3000,5000,0.60]],
    temp:  [[0,20,0.30],[20,24,0.75],[24,30,1.00],[30,34,0.75],[34,50,0.30]],
    bioma: {'Amazônia':1.0,'Transição':0.95,'Cerrado':0.80},
    solo:  {'Latossolo':1.00,'Argissolo':0.95,'Nitossolo':0.90,'Cambissolo':0.85,'Gleissolo':0.65,'Plintossolo':0.75,'Neossolo':0.55,'Espodossolo':0.40},
    minArea:1, aguaSens:0.35, mktSens:0.50, desmatBonus:true, forestBonus:true,
    laborIntensity:0.55, bovinosBonus:false, pescaTradBonus:false, settle:true, floodPenalty:false,
    gee_seq:14.8, renda_ha:5200, invest_ha:2800, empregos_100ha:25, biodiv:9.5, payback:6.0, cobertura:70,
  },
  apicultura: {
    label:'Apicultura', icon:'🍯', color:'#f59e0b', desc:'Criação de Apis mellifera',
    precip:[[0,400,0.20],[400,700,0.65],[700,1400,1.00],[1400,2000,0.85],[2000,3000,0.70],[3000,5000,0.45]],
    temp:  [[0,16,0.20],[16,22,0.75],[22,32,1.00],[32,36,0.65],[36,50,0.25]],
    bioma: {'Cerrado':1.0,'Transição':0.90,'Amazônia':0.75},
    solo:  {'Latossolo':0.85,'Argissolo':0.85,'Gleissolo':0.80,'Plintossolo':0.80,'Cambissolo':0.85,'Nitossolo':0.85,'Neossolo':0.80,'Espodossolo':0.75},
    minArea:0.5, aguaSens:0.30, mktSens:0.45, desmatBonus:false, floraBonus:true,
    laborIntensity:0.30, bovinosBonus:false, pescaTradBonus:false, settle:false, floodPenalty:false,
    gee_seq:0.8, renda_ha:6800, invest_ha:1500, empregos_100ha:18, biodiv:7.5, payback:2.0, cobertura:0,
  },
  meliponicultura: {
    label:'Meliponicultura', icon:'🐝', color:'#d97706', desc:'Abelhas sem ferrão nativas',
    precip:[[0,500,0.20],[500,800,0.65],[800,1500,0.90],[1500,2500,1.00],[2500,3500,0.80],[3500,5000,0.50]],
    temp:  [[0,20,0.25],[20,24,0.80],[24,30,1.00],[30,34,0.70],[34,50,0.20]],
    bioma: {'Amazônia':1.0,'Transição':0.90,'Cerrado':0.80},
    solo:  {'Latossolo':0.85,'Argissolo':0.85,'Gleissolo':0.80,'Plintossolo':0.80,'Cambissolo':0.85,'Nitossolo':0.85,'Neossolo':0.75,'Espodossolo':0.70},
    minArea:0.2, aguaSens:0.25, mktSens:0.40, desmatBonus:false, floraBonus:true, forestBonus:true,
    laborIntensity:0.25, bovinosBonus:false, pescaTradBonus:false, settle:false, floodPenalty:false,
    gee_seq:0.5, renda_ha:7500, invest_ha:1200, empregos_100ha:20, biodiv:8.5, payback:2.0, cobertura:0,
  },
  sisteminha: {
    label:'Sisteminha', icon:'🏠', color:'#06b6d4', desc:'Sisteminha Embrapa — agricultura familiar',
    precip:[[0,400,0.55],[400,700,0.75],[700,1400,1.00],[1400,2500,0.95],[2500,5000,0.85]],
    temp:  [[0,18,0.45],[18,22,0.75],[22,32,1.00],[32,36,0.80],[36,50,0.55]],
    bioma: {'Cerrado':0.90,'Transição':0.95,'Amazônia':0.90},
    solo:  {'Latossolo':0.90,'Argissolo':0.90,'Gleissolo':0.75,'Plintossolo':0.80,'Cambissolo':0.85,'Nitossolo':0.85,'Neossolo':0.75,'Espodossolo':0.65},
    minArea:0.05, aguaSens:0.55, mktSens:0.20, desmatBonus:false, socialBonus:true,
    laborIntensity:0.80, bovinosBonus:false, pescaTradBonus:false, settle:true, floodPenalty:false,
    // renda_ha reduzida de 9500 → 4200 (subsistência + excedente modesto, não agronegócio)
    gee_seq:1.2, renda_ha:4200, invest_ha:2200, empregos_100ha:45, biodiv:5.5, payback:1.5, cobertura:20,
  },
  piscicultura: {
    label:'Piscicultura', icon:'🐟', color:'#3b82f6', desc:'Piscicultura em tanques escavados',
    precip:[[0,600,0.20],[600,900,0.55],[900,1400,0.85],[1400,2500,1.00],[2500,5000,0.80]],
    temp:  [[0,20,0.20],[20,24,0.65],[24,30,1.00],[30,34,0.75],[34,50,0.35]],
    bioma: {'Amazônia':0.90,'Transição':0.95,'Cerrado':0.75},
    solo:  {'Gleissolo':1.00,'Plintossolo':0.90,'Argissolo':0.75,'Latossolo':0.70,'Cambissolo':0.60,'Nitossolo':0.70,'Neossolo':0.40,'Espodossolo':0.35},
    minArea:0.5, aguaSens:0.90, mktSens:0.55, desmatBonus:false, waterBonus:true, lowlandBonus:true,
    laborIntensity:0.45, bovinosBonus:false, pescaTradBonus:true, settle:false, floodBonus:true,
    gee_seq:1.5, renda_ha:8200, invest_ha:4500, empregos_100ha:22, biodiv:3.5, payback:3.5, cobertura:0,
  },
  extrativismo: {
    label:'Extrativismo', icon:'🌿', color:'#059669', desc:'Extrativismo sustentável de produtos florestais',
    precip:[[0,600,0.10],[600,900,0.40],[900,1400,0.75],[1400,2500,1.00],[2500,4000,0.85],[4000,5000,0.65]],
    temp:  [[0,20,0.25],[20,24,0.75],[24,30,1.00],[30,35,0.70],[35,50,0.25]],
    bioma: {'Amazônia':1.0,'Transição':0.85,'Cerrado':0.65},
    solo:  {'Latossolo':0.85,'Argissolo':0.85,'Gleissolo':0.75,'Plintossolo':0.80,'Cambissolo':0.80,'Nitossolo':0.85,'Neossolo':0.60,'Espodossolo':0.55},
    minArea:5, aguaSens:0.25, mktSens:0.35, desmatBonus:true, forestBonus:true, forestReq:true, resexBonus:true,
    laborIntensity:0.40, bovinosBonus:false, pescaTradBonus:true, settle:false, floodBonus:true,
    gee_seq:12.5, renda_ha:3200, invest_ha:800, empregos_100ha:30, biodiv:9.0, payback:1.0, cobertura:80,
  },
  fruticultura: {
    label:'Fruticultura', icon:'🍇', color:'#8b5cf6', desc:'Fruticultura irrigada e de sequeiro',
    precip:[[0,500,0.20],[500,800,0.60],[800,1400,1.00],[1400,2000,0.90],[2000,3000,0.70],[3000,5000,0.45]],
    temp:  [[0,18,0.30],[18,22,0.70],[22,30,1.00],[30,34,0.70],[34,50,0.30]],
    bioma: {'Cerrado':0.90,'Transição':1.00,'Amazônia':0.80},
    solo:  {'Latossolo':1.00,'Argissolo':0.95,'Nitossolo':0.90,'Cambissolo':0.80,'Plintossolo':0.60,'Gleissolo':0.45,'Neossolo':0.55,'Espodossolo':0.35},
    minArea:1, aguaSens:0.65, mktSens:0.70, desmatBonus:false,
    laborIntensity:0.60, bovinosBonus:false, pescaTradBonus:false, settle:true, floodPenalty:true,
    gee_seq:5.5, renda_ha:7200, invest_ha:5500, empregos_100ha:35, biodiv:6.0, payback:4.0, cobertura:50,
  },
  roca: {
    label:'Roça Sustentável', icon:'🌱', color:'#65a30d', desc:'Roça familiar com manejo sustentável',
    precip:[[0,400,0.25],[400,700,0.65],[700,1400,1.00],[1400,2200,0.90],[2200,3500,0.75],[3500,5000,0.55]],
    temp:  [[0,16,0.30],[16,22,0.75],[22,32,1.00],[32,36,0.70],[36,50,0.30]],
    bioma: {'Cerrado':0.85,'Transição':0.95,'Amazônia':0.90},
    solo:  {'Latossolo':0.90,'Argissolo':0.90,'Gleissolo':0.70,'Plintossolo':0.75,'Cambissolo':0.85,'Nitossolo':0.85,'Neossolo':0.70,'Espodossolo':0.55},
    minArea:0.2, aguaSens:0.50, mktSens:0.15, desmatBonus:false, socialBonus:true,
    laborIntensity:0.75, bovinosBonus:false, pescaTradBonus:false, settle:true, floodPenalty:true,
    // renda_ha reduzida de 4200 → 2800 (roça é principalmente subsistência)
    gee_seq:2.5, renda_ha:2800, invest_ha:600, empregos_100ha:40, biodiv:5.0, payback:1.0, cobertura:15,
  },
};

// ─── Definição dos critérios de avaliação (ajustáveis) ────────────────────
const REC_CRITERIA = [
  { id:'gee',      label:'Redução de GEE',        icon:'💨', default:80 },
  { id:'renda',    label:'Renda / Economia',       icon:'💰', default:70 },
  { id:'biodiv',   label:'Biodiversidade',          icon:'🌿', default:65 },
  { id:'empregos', label:'Geração de Empregos',    icon:'👷', default:60 },
  { id:'social',   label:'Impacto Social',          icon:'🤝', default:70 },
  { id:'clima',    label:'Adaptação Climática',     icon:'☀️', default:75 },
  { id:'invest',   label:'Baixo Investimento',      icon:'💸', default:50 },
  { id:'payback',  label:'Retorno Rápido',          icon:'⏱', default:55 },
  { id:'agua',     label:'Eficiência Hídrica',      icon:'💧', default:55 },
];

// ─── Estado do módulo ─────────────────────────────────────────────────────
let _recMap          = null;
let _recMarker       = null;
let _recUcLayer      = null;
let _recTiLayer      = null;
let _recEnv          = null;
let _recConstraints  = [];
let _recScores       = [];
let _recWeights      = {};
let _recRadarChart   = null;
let _recBarChart     = null;
let _recMultiSel     = {};   // { sysKey: percentagem (0-100) }
let _recInitDone     = false;

// ─── Utilitários ──────────────────────────────────────────────────────────
function rec_distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dG = (lng2 - lng1) * Math.PI / 180;
  const a  = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dG/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function rec_interpCurve(val, curve) {
  for (let i = 0; i < curve.length - 1; i++) {
    const [lo, hi, s0] = curve[i];
    const [nlo, , s1]  = curve[i+1];
    if (val >= lo && val < hi) {
      const t = (val - lo) / (hi - lo);
      return s0 + t * (s1 - s0);
    }
  }
  const last = curve[curve.length - 1];
  return val >= last[0] ? last[2] : curve[0][2];
}

function rec_matchSolo(soloStr, soloMap) {
  if (!soloStr) return 0.70;
  for (const [key, val] of Object.entries(soloMap)) {
    if (soloStr.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 0.70;
}

function rec_clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ─── Estimativa de altitude por lat/lng no Maranhão ─────────────────────
function rec_altitudeEstimate(lat, lng) {
  // Chapada das Mangabeiras (SE)
  if (lat < -6.5 && lng > -45.5 && lng < -43.5) return 480;
  // Serra da Cangalha
  if (rec_distKm(lat, lng, -8.4, -46.4) < 35)   return 720;
  // Chapada do Borges / Mirador
  if (lat < -5.0 && lat > -7.0 && lng > -45.5 && lng < -44.0) return 380;
  // Chapada Limpa
  if (lat < -4.5 && lat > -5.5 && lng > -45.8 && lng < -44.8) return 320;
  // Planície amazônica (W)
  if (lng < -46.0)  return 70;
  // Baixada maranhense (N-NW litoral)
  if (lat > -3.5 && lng > -44.5) return 20;
  // Litoral
  if (lat > -2.8)   return 15;
  return 150;
}

// ─── Detecção de ambiente a partir do MUNIC_DATA ─────────────────────────
function rec_detectEnv(lat, lng) {
  if (typeof MUNIC_DATA === 'undefined') return null;
  let bestDist = Infinity, bestRow = null;
  MUNIC_DATA.forEach(row => {
    const d = rec_distKm(lat, lng, row[1], row[2]);
    if (d < bestDist) { bestDist = d; bestRow = row; }
  });
  if (!bestRow) return null;
  return {
    lat, lng,
    municipio:  bestRow[0],
    dist_km:    Math.round(bestDist * 10) / 10,
    precip_mm:  bestRow[10] || 1200,
    temp_c:     bestRow[11] || 27,
    bioma:      bestRow[18] || 'Cerrado',
    solo:       bestRow[20] || 'Latossolo',
    idh:        bestRow[14] || 0.60,
    pib_pc:     bestRow[4]  || 8000,
    pob_pct:    bestRow[5]  || 45,
    fome_pct:   bestRow[7]  || 20,
    desmat_km2: bestRow[6]  || 50,
    queimadas:  bestRow[9]  || 5000,
    gee_kt:     bestRow[8]  || 30,
    lavoura_ha: bestRow[12] || 5000,
    bovinos:    bestRow[13] || 5000,
    cos_pct:    bestRow[15] || 40,
    pesca_t:    bestRow[17] || 50,
    bacia:      bestRow[21] || '',
    regiao:     bestRow[19] || '',
    pop:        bestRow[3]  || 10000,
    assentamentos: bestRow[16] || 0,
    altitude:   rec_altitudeEstimate(lat, lng),
  };
}

// ─── Detecção de restrições legais ───────────────────────────────────────
function rec_detectConstraints(lat, lng) {
  const out = [];
  REC_UC.forEach(uc => {
    const d = rec_distKm(lat, lng, uc.lat, uc.lng);
    if (d < uc.r) out.push({ type:'uc', name:uc.n, ucType:uc.t, res:uc.res, dist_km:+(d.toFixed(1)), c:uc.c });
  });
  REC_TI.forEach(ti => {
    const d = rec_distKm(lat, lng, ti.lat, ti.lng);
    if (d < ti.r) out.push({ type:'ti', name:ti.n, res:'total', dist_km:+(d.toFixed(1)), c:'#a855f7' });
  });
  REC_QUILOMBOS.forEach(q => {
    const d = rec_distKm(lat, lng, q.lat, q.lng);
    if (d < q.r) out.push({ type:'quilombo', name:q.n, res:'consulta', dist_km:+(d.toFixed(1)), c:'#7c3aed' });
  });
  return out;
}

// ─── Motor de pontuação por sistema ──────────────────────────────────────
function rec_scoreSystem(sysKey, env, constraints, weights) {
  const sys = REC_COMPAT[sysKey];
  if (!sys || !env) return null;

  // ── Compatibilidade climática e pedológica ────────────────────────────
  const precipScore = rec_interpCurve(env.precip_mm, sys.precip);
  const tempScore   = rec_interpCurve(env.temp_c,    sys.temp);
  const biomaScore  = sys.bioma[env.bioma] ?? 0.70;
  const soloScore   = rec_matchSolo(env.solo, sys.solo);

  // ── Altitude ──────────────────────────────────────────────────────────
  const alt = env.altitude;
  let altMult = 1.0;
  if (sysKey === 'piscicultura' && alt > 400) altMult = rec_clamp(1 - (alt-400)/1500, 0.3, 1.0);
  if (['ilpf','ilp'].includes(sysKey) && alt > 900) altMult = 0.55;
  if (sysKey === 'saf' && alt > 950) altMult = 0.65;

  // ── Detecção de área alagadiça ────────────────────────────────────────
  const soloAlagado   = /gleissolo|plintossolo/i.test(env.solo || '');
  const regiaoAlagada = /baixada|litoral|mearim|munim|turiaçu|itapecuru|amazôn/i.test((env.regiao || '') + ' ' + (env.bacia || ''));
  const isFloodable   = soloAlagado || (regiaoAlagada && (env.precip_mm || 0) > 1100);

  let floodMult = 1.0;
  if (isFloodable) {
    if (sys.floodBonus)        floodMult = 1.45;  // piscicultura / extrativismo prosperam
    else if (sys.floodPenalty) floodMult = 0.70;  // ilp/ilpf/roca/fruticultura prejudicados
    else                        floodMult = 0.90;  // outros — leve penalidade
  }

  // ── Água / bacia — bônus adicional para sistemas hídricos ─────────────
  let aguaMult = 1.0;
  if (sys.waterBonus) {
    if (soloAlagado)                                     aguaMult = 1.25;
    else if (env.bacia && !/oceân/i.test(env.bacia))     aguaMult = 1.10;
  }

  // ── Floresta remanescente ─────────────────────────────────────────────
  let florestMult = 1.0;
  if (sys.forestBonus || sys.forestReq) {
    florestMult = 0.30 + (env.cos_pct / 100) * 1.0;
    florestMult = rec_clamp(florestMult, sys.forestReq ? 0.20 : 0.50, 1.30);
  }

  // ── Score ambiental base (40% do total) ──────────────────────────────
  const climaBase = (precipScore * 0.45 + tempScore * 0.35 + biomaScore * 0.20) * altMult;
  const soloBase  = soloScore * aguaMult * florestMult;
  const envScore  = rec_clamp((climaBase * 0.60 + soloBase * 0.40) * floodMult, 0, 1);

  // ── Fator de disponibilidade de mão-de-obra ───────────────────────────
  // Sistemas intensivos em trabalho precisam de população local suficiente
  const popNorm    = rec_clamp(Math.log10((env.pop || 1000) + 1) / 5.7, 0.2, 1.0);
  const assentNorm = rec_clamp((env.assentamentos || 0) / 25, 0, 1);
  const laborAvail = rec_clamp(popNorm * 0.65 + assentNorm * 0.35, 0.20, 1.0);
  // Quanto mais intensivo o sistema, mais prejudicado se população baixa
  const laborFit   = rec_clamp(1 - (sys.laborIntensity || 0) * (1 - laborAvail), 0.30, 1.0);

  // ── Multiplicador de tradição/contexto local ──────────────────────────
  // Usa bovinos, pesca_t, lavoura_ha e assentamentos para calibrar
  const bovinosNorm = rec_clamp((env.bovinos || 0) / 150000, 0, 1);
  const pescaNorm   = rec_clamp((env.pesca_t  || 0) / 300, 0, 1);
  const lavouraNorm = rec_clamp((env.lavoura_ha || 0) / 50000, 0, 1);
  const settlNorm   = rec_clamp((env.assentamentos || 0) / 20, 0, 1);

  let tradicaoMult = 1.0;
  if (sys.bovinosBonus)   tradicaoMult += bovinosNorm * 0.20;  // ILPF/ILP perto de regiões pecuárias
  if (sys.pescaTradBonus) tradicaoMult += pescaNorm   * 0.25;  // piscicultura/extrativismo perto de áreas pesqueiras
  if (sys.settle)         tradicaoMult += settlNorm   * 0.15;  // sistemas familiares ganham com assentamentos
  // SAF e roça ganham com tradição agrícola (lavoura)
  if (['saf','roca','fruticultura'].includes(sysKey)) tradicaoMult += lavouraNorm * 0.10;
  tradicaoMult = rec_clamp(tradicaoMult, 0.80, 1.40);

  // ── Bônus contextuais ─────────────────────────────────────────────────
  const idh_norm   = rec_clamp((env.idh - 0.40) / 0.45, 0, 1);
  const mktScore   = 1 - sys.mktSens * (1 - idh_norm);
  const desmatMult = sys.desmatBonus
    ? 1 + rec_clamp((env.desmat_km2 || 0) / 800, 0, 0.25)
    : 1.0;
  const queimaRisk = rec_clamp((env.queimadas || 0) / 60000, 0, 1);
  const queimaMult = ['saf','extrativismo'].includes(sysKey) ? (1 - queimaRisk * 0.20)
                   : sysKey === 'roca' ? (1 - queimaRisk * 0.25)
                   : 1.0;

  // ── Impacto social: alta pobreza/fome favorece sistemas de subsistência ─
  const vulnerabilidade = rec_clamp(((env.pob_pct || 0) + (env.fome_pct || 0)) / 180, 0, 1);
  // Sisteminha e roça têm maior aderência social em contextos de alta vulnerabilidade
  const socialCtx = sys.socialBonus
    ? 0.50 + vulnerabilidade * 0.50
    : rec_clamp(1 - vulnerabilidade * 0.25, 0.70, 1.0);

  // ── Pontuações por critério normalizadas (0-1) ────────────────────────
  // renda normalizada por 8500 (max realista p/ piscicultura/apicultura)
  const rendaNorm = rec_clamp(sys.renda_ha / 8500, 0, 1);
  const crit = {
    gee:      rec_clamp(sys.gee_seq / 15.0, 0, 1) * desmatMult,
    renda:    rendaNorm * mktScore * tradicaoMult,
    biodiv:   sys.biodiv / 10,
    empregos: rec_clamp(sys.empregos_100ha / 45, 0, 1) * laborFit * tradicaoMult,
    social:   socialCtx,
    clima:    envScore * queimaMult,
    invest:   rec_clamp(1 - (sys.invest_ha - 600) / 4900, 0, 1),
    payback:  rec_clamp(1 - (sys.payback - 1.0) / 6.0, 0, 1),
    agua:     rec_clamp(1 - sys.aguaSens * (1 - Math.min(1, (env.precip_mm || 0) / 1500)), 0, 1),
  };

  // ── Pontuação ponderada pelos critérios ───────────────────────────────
  let wSum = 0, sSum = 0;
  REC_CRITERIA.forEach(cr => {
    const w = rec_clamp((weights[cr.id] ?? cr.default) / 100, 0, 1);
    const s = rec_clamp(crit[cr.id] || 0, 0, 1);
    sSum += w * s; wSum += w;
  });
  const critScore = wSum > 0 ? sSum / wSum : 0;

  // ── Combinação final: 40% ambiente + 60% critérios ───────────────────
  const rawScore = envScore * 0.40 + critScore * 0.60;

  // ── Multiplicador de restrições legais ────────────────────────────────
  let constraintMult = 1.0;
  let constraintAlert = null;

  const tiHit = constraints.find(c => c.type === 'ti');
  if (tiHit) {
    constraintMult = 0.0;
    constraintAlert = { lvl:'block', msg:`Terra Indígena ${tiHit.name} — atividade agropecuária vedada por lei (Const. art. 231).` };
  }

  if (!tiHit) {
    const totalHit = constraints.find(c => c.res === 'total' && c.type === 'uc');
    if (totalHit) {
      if (sysKey === 'extrativismo' && totalHit.ucType === 'RESEX') {
        constraintAlert = { lvl:'ok', msg:`RESEX ${totalHit.name} — extrativismo sustentável é a atividade prevista.` };
      } else {
        constraintMult = 0.04;
        constraintAlert = { lvl:'block', msg:`${totalHit.ucType} ${totalHit.name} — atividade produtiva proibida sem autorização ICMBio.` };
      }
    }

    const extratHit = constraints.find(c => c.res === 'extrat');
    if (extratHit && constraintMult === 1.0) {
      if (sysKey === 'extrativismo') {
        constraintMult = 1.15;
        constraintAlert = { lvl:'ok', msg:`RESEX ${extratHit.name} — extrativismo recomendado e compatível!` };
      } else {
        constraintMult = 0.15;
        constraintAlert = { lvl:'warn', msg:`RESEX ${extratHit.name} — apenas extrativismo sustentável é permitido nesta área.` };
      }
    }

    const parcialHit = constraints.find(c => c.res === 'parcial');
    if (parcialHit && constraintMult === 1.0) {
      constraintMult = 0.75;
      constraintAlert = { lvl:'warn', msg:`APA ${parcialHit.name} — atividade condicionada a EIA/RIMA e licença ambiental SEMA.` };
    }

    const qHit = constraints.find(c => c.type === 'quilombo');
    if (qHit && constraintMult === 1.0) {
      constraintMult = 0.85;
      constraintAlert = { lvl:'info', msg:`Território Quilombola ${qHit.name} — exige consulta prévia livre e informada (Decreto 4.887/2003).` };
    }
  }

  const finalScore = Math.round(rec_clamp(rawScore * constraintMult, 0, 1.10) * 100);

  return {
    key: sysKey,
    label: sys.label, icon: sys.icon, color: sys.color, desc: sys.desc,
    score: finalScore,
    envScore: Math.round(envScore * 100),
    critScore: Math.round(critScore * 100),
    constraintMult,
    constraintAlert,
    crit,
    // fatores contextuais para exibição no painel
    ctx: { isFloodable, floodMult: +floodMult.toFixed(2), laborFit: +laborFit.toFixed(2),
           tradicaoMult: +tradicaoMult.toFixed(2), laborAvail: +laborAvail.toFixed(2) },
    params: { gee_seq: sys.gee_seq, renda_ha: sys.renda_ha, invest_ha: sys.invest_ha,
               empregos_100ha: sys.empregos_100ha, payback: sys.payback, biodiv: sys.biodiv,
               cobertura: sys.cobertura, minArea: sys.minArea },
  };
}

// ─── Executar pontuação de todos os sistemas ─────────────────────────────
function rec_runAll(lat, lng) {
  _recEnv         = rec_detectEnv(lat, lng);
  _recConstraints = rec_detectConstraints(lat, lng);
  if (!_recEnv) return;

  _recScores = Object.keys(REC_COMPAT)
    .map(k => rec_scoreSystem(k, _recEnv, _recConstraints, _recWeights))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  rec_renderAll();
}

// ─── Inicializar pesos a partir dos defaults ─────────────────────────────
function rec_initWeights() {
  REC_CRITERIA.forEach(c => { _recWeights[c.id] = c.default; });
}

function rec_onWeight(id, val) {
  _recWeights[id] = +val;
  const lbl = document.getElementById('rec-wlbl-' + id);
  if (lbl) lbl.textContent = val + '%';
  if (_recEnv) rec_runAll(_recEnv.lat, _recEnv.lng);
}

function rec_resetWeights() {
  REC_CRITERIA.forEach(c => {
    _recWeights[c.id] = c.default;
    const sl  = document.getElementById('rec-w-' + c.id);
    const lbl = document.getElementById('rec-wlbl-' + c.id);
    if (sl)  sl.value = c.default;
    if (lbl) lbl.textContent = c.default + '%';
  });
  if (_recEnv) rec_runAll(_recEnv.lat, _recEnv.lng);
}

// ─── Render: painel de ambiente ───────────────────────────────────────────
function rec_renderEnv(env) {
  const el = document.getElementById('rec-env-panel');
  if (!el) return;
  if (!env) { el.innerHTML = '<span style="color:var(--text3);font-size:11px">Clique no mapa para detectar características...</span>'; return; }

  const biomaColor = env.bioma === 'Amazônia' ? '#10b981' : env.bioma === 'Cerrado' ? '#f59e0b' : '#3b82f6';
  const idh_pct    = Math.round(env.idh * 100);
  const geeClass   = env.gee_kt > 50 ? 'var(--red)' : env.gee_kt > 20 ? 'var(--amber)' : 'var(--green)';

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px">
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">Município</div>
        <div style="font-weight:600;color:var(--green)">${env.municipio}</div>
        <div style="color:var(--text3);font-size:10px">${env.regiao} · ${env.bacia || '—'}</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">Bioma / Solo</div>
        <div style="font-weight:600;color:${biomaColor}">${env.bioma}</div>
        <div style="color:var(--text3);font-size:10px">${env.solo}</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">☔ Precipitação</div>
        <div style="font-weight:600">${(env.precip_mm||0).toLocaleString('pt-BR')} mm/ano</div>
        <div style="color:var(--text3);font-size:10px">🌡 ${env.temp_c?.toFixed(1)}°C média</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">⛰ Altitude est.</div>
        <div style="font-weight:600">${env.altitude} m</div>
        <div style="color:var(--text3);font-size:10px">🌳 Cobert. veg. ${env.cos_pct}%</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">📊 IDH / PIB pc</div>
        <div style="font-weight:600">${env.idh?.toFixed(3)} <span style="color:var(--text3);font-size:10px">(${idh_pct < 50 ? '🔴' : idh_pct < 65 ? '🟡' : '🟢'})</span></div>
        <div style="color:var(--text3);font-size:10px">R$ ${(env.pib_pc||0).toLocaleString('pt-BR')}/hab</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">💨 GEE / Desmat.</div>
        <div style="font-weight:600;color:${geeClass}">${env.gee_kt?.toFixed(1)} kt CO₂eq</div>
        <div style="color:var(--text3);font-size:10px">🪓 ${env.desmat_km2?.toFixed(0)} km²/ano</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">👥 Vulnerabilidade</div>
        <div style="font-weight:600">${env.pob_pct?.toFixed(1)}% pobreza</div>
        <div style="color:var(--text3);font-size:10px">🍽 ${env.fome_pct?.toFixed(1)}% inseg. alimentar</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">🔥 Queimadas / Pecuária</div>
        <div style="font-weight:600">${(env.queimadas||0).toLocaleString('pt-BR')} ha/ano</div>
        <div style="color:var(--text3);font-size:10px">🐄 ${(env.bovinos||0).toLocaleString('pt-BR')} bovinos</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">👥 Pop. / Assentamentos</div>
        <div style="font-weight:600">${(env.pop||0).toLocaleString('pt-BR')} hab</div>
        <div style="color:var(--text3);font-size:10px">🏘 ${env.assentamentos||0} assentamentos</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">🐟 Pesca / Lavoura</div>
        <div style="font-weight:600">${(env.pesca_t||0).toLocaleString('pt-BR')} t pesca/ano</div>
        <div style="color:var(--text3);font-size:10px">🌾 ${(env.lavoura_ha||0).toLocaleString('pt-BR')} ha lavoura</div>
      </div>
      <div style="background:${/gleissolo|plintossolo/i.test(env.solo||'')||/baixada|litoral/i.test((env.regiao||'')+(env.bacia||''))?'#1e3a5f':'var(--bg3)'};border-radius:6px;padding:7px 9px">
        <div style="color:var(--text3);font-size:10px;margin-bottom:2px">💧 Área Alagadiça</div>
        <div style="font-weight:600;color:${/gleissolo|plintossolo/i.test(env.solo||'')?'#38bdf8':'var(--text)'}">
          ${/gleissolo|plintossolo/i.test(env.solo||'')?'⚠️ Solo alagadiço':/baixada|litoral/i.test((env.regiao||'')+(env.bacia||''))?'🔵 Região de baixada':'✅ Sem risco de alagamento'}
        </div>
        <div style="color:var(--text3);font-size:10px">${env.regiao||''}</div>
      </div>
    </div>`;
}

// ─── Render: restrições legais ────────────────────────────────────────────
function rec_renderConstraints(constraints) {
  const el = document.getElementById('rec-constraints-panel');
  if (!el) return;
  if (!constraints.length) {
    el.innerHTML = '<div style="color:var(--green);font-size:11px">✅ Nenhuma restrição legal detectada neste ponto.</div>';
    return;
  }
  el.innerHTML = constraints.map(c => {
    const icon  = c.type === 'ti' ? '🔴 TI' : c.type === 'quilombo' ? '🟣 QT' :
                  c.res === 'total' ? '🔴 UC' : c.res === 'extrat' ? '🟠 RESEX' : '🟡 APA';
    const color = c.type === 'ti' ? 'var(--red)' : c.res === 'total' ? '#f87171' :
                  c.res === 'extrat' ? '#fb923c' : c.type === 'quilombo' ? '#a78bfa' : 'var(--amber)';
    const msg   = c.type === 'ti'      ? 'Atividades agropecuárias vedadas — consulte FUNAI.' :
                  c.type === 'quilombo'? 'Exige consulta prévia livre e informada.' :
                  c.res === 'total'    ? 'Proteção integral — exige autorização ICMBio.' :
                  c.res === 'extrat'   ? 'Uso direto — apenas extrativismo sustentável.' :
                                         'APA — licenciamento ambiental SEMA/MA obrigatório.';
    return `<div style="background:var(--bg3);border:1px solid ${color}22;border-radius:6px;padding:6px 9px;margin-bottom:5px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:11px;font-weight:600;color:${color}">${icon} ${c.name}</span>
        <span style="font-size:10px;color:var(--text3)">${c.dist_km} km</span>
      </div>
      <div style="font-size:10px;color:var(--text3);margin-top:2px">${msg}</div>
    </div>`;
  }).join('');
}

// ─── Render: ranking de sistemas ─────────────────────────────────────────
function rec_renderRanking(scores) {
  const el = document.getElementById('rec-ranking');
  if (!el || !scores.length) return;

  const medals = ['🥇','🥈','🥉'];
  const rows = scores.map((s, i) => {
    const pct    = s.score;
    const barW   = Math.min(100, pct);
    const medal  = i < 3 ? medals[i] : `${i+1}°`;
    const alert  = s.constraintAlert;
    const alertHtml = alert ? (() => {
      const alertColor = alert.lvl === 'block' ? 'var(--red)' : alert.lvl === 'warn' ? 'var(--amber)' : alert.lvl === 'ok' ? 'var(--green)' : 'var(--blue)';
      const alertIcon  = alert.lvl === 'block' ? '🚫' : alert.lvl === 'warn' ? '⚠️' : alert.lvl === 'ok' ? '✅' : 'ℹ️';
      return `<div style="font-size:10px;color:${alertColor};margin-top:3px">${alertIcon} ${alert.msg}</div>`;
    })() : '';
    const opacity = s.constraintMult < 0.1 ? '0.45' : s.constraintMult < 0.5 ? '0.70' : '1';

    return `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 11px;margin-bottom:7px;opacity:${opacity}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:15px">${medal}</span>
          <span style="font-size:13px">${s.icon}</span>
          <span style="font-weight:600;font-size:12px">${s.label}</span>
          <span style="font-size:10px;color:var(--text3)">${s.desc}</span>
        </div>
        <span style="font-weight:700;font-size:16px;color:${s.color}">${pct}</span>
      </div>
      <div style="background:var(--bg2);border-radius:4px;height:6px;margin-bottom:6px;overflow:hidden">
        <div style="height:100%;width:${barW}%;background:${s.color};border-radius:4px;transition:width .4s ease"></div>
      </div>
      <div style="display:flex;gap:12px;font-size:10px;color:var(--text3);flex-wrap:wrap">
        <span>💨 ${s.params.gee_seq} tCO₂/ha</span>
        <span>💰 R$${(s.params.renda_ha/1000).toFixed(1)}k/ha</span>
        <span>👷 ${s.params.empregos_100ha}/100ha</span>
        <span>⏱ ${s.params.payback}a payback</span>
        <span>🌿 ${s.params.biodiv}/10</span>
      </div>
      ${s.ctx ? `<div style="display:flex;gap:8px;font-size:10px;margin-top:4px;flex-wrap:wrap">
        ${s.ctx.isFloodable ? `<span style="color:#38bdf8">💧 Alagável ×${s.ctx.floodMult}</span>` : ''}
        ${s.ctx.laborFit < 0.80 ? `<span style="color:#fb923c">👷 Mão-de-obra escassa ×${s.ctx.laborFit}</span>` : ''}
        ${s.ctx.tradicaoMult > 1.05 ? `<span style="color:#86efac">⭐ Tradição local ×${s.ctx.tradicaoMult}</span>` : ''}
      </div>` : ''}
      ${alertHtml}
    </div>`;
  }).join('');

  el.innerHTML = `<div style="margin-bottom:8px;font-size:10px;color:var(--text3)">
    ${scores.length} sistemas avaliados · Local: <strong style="color:var(--accent)">${_recEnv?.municipio || '—'}</strong>
    · Bioma: <strong>${_recEnv?.bioma || '—'}</strong>
  </div>${rows}`;
}

// ─── Render: gráfico radar (top 3) ───────────────────────────────────────
function rec_renderRadar(top3) {
  const canvas = document.getElementById('rec-radar');
  if (!canvas || typeof Chart === 'undefined') return;
  if (_recRadarChart) { _recRadarChart.destroy(); _recRadarChart = null; }

  const labels = REC_CRITERIA.map(c => c.icon + ' ' + c.label);
  const datasets = top3.map(s => ({
    label: s.icon + ' ' + s.label,
    data: REC_CRITERIA.map(c => Math.round(rec_clamp(s.crit[c.id] || 0, 0, 1) * 100)),
    borderColor: s.color,
    backgroundColor: s.color + '22',
    pointBackgroundColor: s.color,
    borderWidth: 2,
    pointRadius: 3,
  }));

  _recRadarChart = new Chart(canvas, {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#a3c9a3', font: { size: 11 } } },
      },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { color: '#6b9b6b', font: { size: 9 }, stepSize: 25, backdropColor: 'transparent' },
          pointLabels: { color: '#a3c9a3', font: { size: 10 } },
          grid: { color: '#2a4a2a' },
          angleLines: { color: '#2a4a2a' },
        }
      }
    }
  });
}

// ─── Render: gráfico de barras comparativo ────────────────────────────────
function rec_renderBar(scores) {
  const canvas = document.getElementById('rec-bar');
  if (!canvas || typeof Chart === 'undefined') return;
  if (_recBarChart) { _recBarChart.destroy(); _recBarChart = null; }

  _recBarChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: scores.map(s => s.icon + ' ' + s.label),
      datasets: [{
        label: 'Pontuação do Recomendador',
        data: scores.map(s => s.score),
        backgroundColor: scores.map(s => s.color + 'cc'),
        borderColor: scores.map(s => s.color),
        borderWidth: 1, borderRadius: 5,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { min: 0, max: 110, ticks: { color: '#6b9b6b', font: { size: 10 } }, grid: { color: '#1a2a1a' } },
        y: { ticks: { color: '#a3c9a3', font: { size: 10 } }, grid: { display: false } },
      }
    }
  });
}

// ─── Render: planejamento multi-sistema ───────────────────────────────────
function rec_renderMultiSys(scores) {
  const el = document.getElementById('rec-multisys');
  if (!el || !scores.length) return;

  // Inicializa seleção: top 2 sistemas com 50/50 se vazio
  if (!Object.keys(_recMultiSel).length) {
    const elegivel = scores.filter(s => s.score > 0).slice(0, 2);
    elegivel.forEach((s, i) => { _recMultiSel[s.key] = i === 0 ? 60 : 40; });
  }

  const selKeys = Object.keys(_recMultiSel);
  const combGee    = selKeys.reduce((t, k) => t + (REC_COMPAT[k].gee_seq   * (_recMultiSel[k]/100)), 0);
  const combRenda  = selKeys.reduce((t, k) => t + (REC_COMPAT[k].renda_ha  * (_recMultiSel[k]/100)), 0);
  const combEmp    = selKeys.reduce((t, k) => t + (REC_COMPAT[k].empregos_100ha * (_recMultiSel[k]/100)), 0);
  const combBiodiv = selKeys.reduce((t, k) => t + (REC_COMPAT[k].biodiv    * (_recMultiSel[k]/100)), 0);
  const combInvest = selKeys.reduce((t, k) => t + (REC_COMPAT[k].invest_ha * (_recMultiSel[k]/100)), 0);

  const checkBoxes = scores.filter(s => s.score > 0).slice(0, 7).map(s => {
    const checked = _recMultiSel[s.key] !== undefined;
    return `<label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:11px;padding:3px 0">
      <input type="checkbox" ${checked ? 'checked' : ''} onchange="rec_toggleMulti('${s.key}', this.checked)"
        style="accent-color:${s.color}">
      <span>${s.icon} ${s.label}</span>
      <span style="color:var(--text3);font-size:10px;margin-left:auto">${s.score}pts</span>
    </label>`;
  }).join('');

  const sliders = selKeys.map(k => {
    const s = REC_COMPAT[k];
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
      <span style="font-size:12px;width:22px">${s.icon}</span>
      <span style="font-size:11px;width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.label}</span>
      <input type="range" min="5" max="90" value="${_recMultiSel[k]}" step="5"
        oninput="rec_onMultiSlider('${k}', +this.value)"
        style="flex:1;accent-color:${s.color}">
      <span id="rec-ms-lbl-${k}" style="width:36px;text-align:right;font-size:11px;color:${s.color}">${_recMultiSel[k]}%</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">
      <div>
        <div style="font-size:10px;color:var(--text3);margin-bottom:6px">Selecionar sistemas para combinar:</div>
        ${checkBoxes}
      </div>
      <div>
        <div style="font-size:10px;color:var(--text3);margin-bottom:6px">% de área por sistema:</div>
        ${sliders || '<span style="font-size:11px;color:var(--text3)">Selecione ao menos um sistema</span>'}
      </div>
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:10px;margin-top:10px">
      <div style="font-size:10px;color:var(--text3);margin-bottom:7px;font-weight:600">⚡ Métricas Combinadas (por ha total)</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:11px">
        <div style="text-align:center">
          <div style="font-size:18px;font-weight:700;color:var(--green)">${combGee.toFixed(1)}</div>
          <div style="color:var(--text3);font-size:10px">tCO₂/ha seq.</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:18px;font-weight:700;color:var(--amber)">R$${(combRenda/1000).toFixed(1)}k</div>
          <div style="color:var(--text3);font-size:10px">renda/ha/ano</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:18px;font-weight:700;color:var(--teal)">${combEmp.toFixed(0)}</div>
          <div style="color:var(--text3);font-size:10px">empregos/100ha</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:16px;font-weight:700;color:var(--purple)">${combBiodiv.toFixed(1)}/10</div>
          <div style="color:var(--text3);font-size:10px">biodiversidade</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:16px;font-weight:700;color:var(--red)">R$${(combInvest/1000).toFixed(1)}k</div>
          <div style="color:var(--text3);font-size:10px">invest./ha</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:16px;font-weight:700;color:var(--green)">${selKeys.length}</div>
          <div style="color:var(--text3);font-size:10px">sistemas</div>
        </div>
      </div>
    </div>`;
}

// ─── Multi-sistema: toggle checkbox ───────────────────────────────────────
function rec_toggleMulti(key, checked) {
  if (checked) {
    _recMultiSel[key] = 30;
  } else {
    delete _recMultiSel[key];
  }
  rec_rebalanceMulti();
}

function rec_onMultiSlider(key, val) {
  _recMultiSel[key] = val;
  const lbl = document.getElementById('rec-ms-lbl-' + key);
  if (lbl) lbl.textContent = val + '%';
  rec_renderMultiSys(_recScores);
}

function rec_rebalanceMulti() {
  // Balanceia para que a soma aproxime 100 (não forçado)
  rec_renderMultiSys(_recScores);
}

// ─── Render principal ─────────────────────────────────────────────────────
function rec_renderAll() {
  rec_updateBadge(_recEnv);
  rec_renderEnv(_recEnv);
  rec_renderConstraints(_recConstraints);
  rec_renderRanking(_recScores);
  rec_renderRadar(_recScores.slice(0, 3));
  rec_renderBar(_recScores);
  _recMultiSel = {};
  rec_renderMultiSys(_recScores);
}

// ─── Adicionar overlay de UCs e TIs no mapa ───────────────────────────────
function rec_addProtectedLayers() {
  if (!_recMap || !_recUcLayer) return;

  // UCs
  REC_UC.forEach(uc => {
    L.circle([uc.lat, uc.lng], {
      radius: uc.r * 1000, color: uc.c, fillColor: uc.c,
      fillOpacity: 0.08, weight: 1.5, dashArray: '5,4', interactive: true
    }).bindTooltip(`<b>${uc.t}</b><br>${uc.n}`, { permanent: false })
      .addTo(_recUcLayer);
  });

  // TIs
  REC_TI.forEach(ti => {
    L.circle([ti.lat, ti.lng], {
      radius: ti.r * 1000, color: '#a855f7', fillColor: '#a855f7',
      fillOpacity: 0.06, weight: 1.5, dashArray: '3,4', interactive: true
    }).bindTooltip(`<b>Terra Indígena</b><br>${ti.n}`, { permanent: false })
      .addTo(_recUcLayer);
  });

  // Quilombos
  REC_QUILOMBOS.forEach(q => {
    L.circle([q.lat, q.lng], {
      radius: q.r * 1000, color: '#7c3aed', fillColor: '#7c3aed',
      fillOpacity: 0.08, weight: 1, dashArray: '2,5', interactive: true
    }).bindTooltip(`<b>Território Quilombola</b><br>${q.n}`, { permanent: false })
      .addTo(_recUcLayer);
  });
}

// ─── Render: painel de pesos dos critérios (grade 2 colunas, compacto) ───
function rec_buildWeightsPanel() {
  const el = document.getElementById('rec-weights-panel');
  if (!el) return;
  el.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:3px 12px';
  el.innerHTML = REC_CRITERIA.map(c => `
    <div style="display:flex;align-items:center;gap:5px;padding:2px 0">
      <span style="font-size:12px;width:16px;flex-shrink:0">${c.icon}</span>
      <span style="font-size:10px;width:120px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.label}</span>
      <input type="range" id="rec-w-${c.id}" min="0" max="100" value="${_recWeights[c.id]}"
        oninput="rec_onWeight('${c.id}', +this.value)"
        style="flex:1;accent-color:var(--green3);height:3px;min-width:60px">
      <span id="rec-wlbl-${c.id}" style="width:28px;text-align:right;font-size:10px;color:var(--accent);flex-shrink:0">${_recWeights[c.id]}%</span>
    </div>`).join('');
}

// ─── Inicializar módulo Recomendador ─────────────────────────────────────
function rec_init() {
  rec_initWeights();
  rec_buildWeightsPanel();

  // Inicializa panels com placeholder
  const envEl = document.getElementById('rec-env-panel');
  if (envEl && !_recEnv) rec_renderEnv(null);
  const csEl  = document.getElementById('rec-constraints-panel');
  if (csEl && !_recConstraints.length)
    csEl.innerHTML = '<span style="color:var(--text3);font-size:11px">Clique no mapa para verificar restrições...</span>';

  // Só cria o mapa uma vez
  if (_recMap) {
    _recMap.invalidateSize();
    return;
  }

  const mapEl = document.getElementById('rec-map');
  if (!mapEl || typeof L === 'undefined') return;

  _recMap = L.map('rec-map', {
    center: [-4.9, -45.3], zoom: 7,
    zoomControl: true, scrollWheelZoom: true,
    preferCanvas: true,
  });

  // Camada satelite Esri
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri World Imagery',
    maxZoom: 18,
  }).addTo(_recMap);

  // Camada de labels
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: 'CartoDB', opacity: 0.7, maxZoom: 18,
  }).addTo(_recMap);

  // Camada de áreas protegidas
  _recUcLayer = L.layerGroup().addTo(_recMap);
  rec_addProtectedLayers();

  // Legenda de layers
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const d = L.DomUtil.create('div');
    d.style.cssText = 'background:rgba(10,20,10,0.9);border:1px solid #2a4a2a;border-radius:8px;padding:8px 11px;font-size:10px;color:#a3c9a3;line-height:1.6';
    d.innerHTML = `<div style="font-weight:600;margin-bottom:4px">Restrições</div>
      <div><span style="color:#ef4444">●</span> Parque/REBIO (total)</div>
      <div><span style="color:#f97316">●</span> RESEX (extrat.)</div>
      <div><span style="color:#eab308">●</span> APA (parcial)</div>
      <div><span style="color:#a855f7">●</span> Terra Indígena</div>
      <div><span style="color:#7c3aed">●</span> Território Quilombola</div>`;
    return d;
  };
  legend.addTo(_recMap);

  // Click no mapa → classificar
  _recMap.on('click', e => {
    const { lat, lng } = e.latlng;

    // Atualiza marcador
    if (_recMarker) _recMarker.remove();
    _recMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `<div style="width:20px;height:20px;background:#4ade80;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.7);transform:translate(-10px,-10px)"></div>`,
        className: '', iconSize: [0,0],
      })
    }).addTo(_recMap);

    // Feedback visual
    const badge = document.getElementById('rec-munic-badge');
    if (badge) badge.innerHTML = '<span style="color:var(--text3);font-size:11px">Analisando...</span>';
    const rankEl = document.getElementById('rec-ranking');
    if (rankEl) rankEl.innerHTML = '<span style="color:var(--text3);font-size:11px">Classificando sistemas...</span>';

    // Roda o classificador
    setTimeout(() => rec_runAll(lat, lng), 50);
  });

  // Populate datalist de municípios no rec
  const dl = document.getElementById('rec-munic-list');
  if (dl && typeof MUNIC_DATA !== 'undefined') {
    dl.innerHTML = MUNIC_DATA.map(r => `<option value="${r[0]}">`).join('');
  }

  _recInitDone = true;
}

// ─── Busca de município pelo nome ─────────────────────────────────────────
function rec_searchMunic(name) {
  if (!name || typeof MUNIC_DATA === 'undefined') return;
  const row = MUNIC_DATA.find(r => r[0].toLowerCase() === name.toLowerCase().trim());
  if (!row) return;
  const lat = row[1], lng = row[2];
  if (_recMap) _recMap.setView([lat, lng], 12);
  // Atualiza marcador e dispara classificação
  if (_recMap && _recMarker) _recMarker.remove();
  if (_recMap) {
    _recMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `<div style="width:20px;height:20px;background:#4ade80;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.7);transform:translate(-10px,-10px)"></div>`,
        className: '', iconSize: [0,0],
      })
    }).addTo(_recMap);
  }
  setTimeout(() => rec_runAll(lat, lng), 80);
}

// ─── Atualizar badge de município ─────────────────────────────────────────
function rec_updateBadge(env) {
  const badge = document.getElementById('rec-munic-badge');
  if (!badge || !env) return;
  badge.innerHTML = `<div style="display:flex;align-items:center;gap:8px;font-size:11px">
    <span style="color:var(--green)">📍 ${env.municipio}</span>
    <span style="color:var(--text3)">${env.lat.toFixed(4)}, ${env.lng.toFixed(4)}</span>
    <span style="background:var(--bg3);border-radius:4px;padding:2px 7px;color:var(--text2)">${env.bioma}</span>
    <span style="background:var(--bg3);border-radius:4px;padding:2px 7px;color:var(--text2)">${env.solo}</span>
  </div>`;
}

