// ═══════════════════════════════════════════════════════════════
// SIMULADORES DE CRESCIMENTO DE PLANTAS — Maranhão
// Embrapa Maranhão · ds-embrapa-ma
// Fontes: DSSAT, Embrapa, FAO, CIAT, IBGE-LSPA, Howeler 1983
// Culturas: Mandioca · Tomate · Banana · Abacaxi · Melancia
// ═══════════════════════════════════════════════════════════════

/* ─────────── MUNICÍPIOS DO MARANHÃO ─────────── */
const CRESC_MUN = {
  sao_luis:         { nome:'São Luís',          temp:28.2, chuva:175, rad:17.5, ur:80, ph:5.4, desc:'Ilha do Maranhão · Tropical úmido · 2100mm/ano · 28°C' },
  imperatriz:       { nome:'Imperatriz',         temp:28.8, chuva:125, rad:19.0, ur:72, ph:5.2, desc:'Sul do MA · Transição cerrado · 1500mm/ano · 28.8°C' },
  balsas:           { nome:'Balsas',             temp:27.5, chuva:92,  rad:20.5, ur:60, ph:5.0, desc:'Cerrado MA · Agropecuária · 1100mm/ano · 27.5°C' },
  caxias:           { nome:'Caxias',             temp:28.5, chuva:108, rad:19.8, ur:65, ph:5.5, desc:'Leste MA · Semiárido-transição · 1300mm/ano · 28.5°C' },
  bacabal:          { nome:'Bacabal',            temp:27.8, chuva:150, rad:17.8, ur:78, ph:5.3, desc:'Centro MA · Baixada Maranhense · 1800mm/ano · 27.8°C' },
  itapecuru:        { nome:'Itapecuru-Mirim',    temp:28.0, chuva:158, rad:17.5, ur:79, ph:5.6, desc:'Norte MA · Vale Itapecuru · 1900mm/ano · 28°C' },
  viana:            { nome:'Viana',              temp:27.5, chuva:183, rad:16.8, ur:83, ph:5.1, desc:'Baixada MA · Várzea · 2200mm/ano · 27.5°C' },
  pinheiro:         { nome:'Pinheiro',           temp:27.8, chuva:167, rad:17.0, ur:82, ph:5.2, desc:'Noroeste MA · Cocais · 2000mm/ano · 27.8°C' },
  santa_ines:       { nome:'Santa Inês',         temp:28.2, chuva:142, rad:18.2, ur:75, ph:5.4, desc:'Centro-Oeste MA · 1700mm/ano · 28.2°C' },
  pedreiras:        { nome:'Pedreiras',          temp:28.0, chuva:133, rad:18.5, ur:73, ph:5.3, desc:'Centro MA · Mearim · 1600mm/ano · 28°C' },
  presidente_dutra: { nome:'Presidente Dutra',   temp:28.3, chuva:125, rad:19.0, ur:70, ph:5.1, desc:'Centro MA · 1500mm/ano · 28.3°C' },
  codo:             { nome:'Codó',               temp:28.8, chuva:117, rad:19.5, ur:67, ph:5.2, desc:'Leste MA · Transição semiárido · 1400mm/ano · 28.8°C' },
};

/* ─────────── BANCO DE DADOS DAS CULTURAS ─────────── */
const CRESC_CROPS = {
  mandioca: {
    nome:'Mandioca', icon:'🌿', cor:'#639922',
    nomeCientifico:'Manihot esculenta Crantz',
    cicloBase:12, tempOpt:27, tempMin:15, tempMax:40,
    aguaOpt:150, pHOtimo:[5.5,6.5], espOpt:1.0,
    NOptimo:100, POptimo:60, KOptimo:150, SOptimo:20,
    prodMin:14, prodMax:35, alturaMax:280,
    unidade:'t/ha (raízes frescas)',
    bmPotencial:14.5, convFreshFactor:4.5, isFruitCrop:false,
    variedades:[
      { nome:'Branquinha', ciclo:12, prodFator:0.85, tempOpt:27 },
      { nome:'BGM-1345 (Embrapa)', ciclo:12, prodFator:1.0, tempOpt:28 },
      { nome:'IAC-576-70', ciclo:14, prodFator:1.1, tempOpt:27 },
      { nome:'Manteiguinha (MA)', ciclo:12, prodFator:0.75, tempOpt:28 },
      { nome:'Eucalipto (tolerante seca)', ciclo:14, prodFator:0.7, tempOpt:26 },
    ],
    extraLabel:['Teor de amido (%)', 'HCN (mg/kg MF)'],
    extraCalc:(p, fGlobal) => [
      Math.round(28 + (42-28)*fGlobal*Math.min(1,p.K/100)*Math.min(1,80/Math.max(20,p.N))),
      Math.round(20 + (150-20)*(1-fGlobal)),
    ],
    fases:['Dormência/brotação','Emergência','Des. vegetativo','Des. vegetativo','Crescimento rápido','Crescimento rápido','Engrossamento raízes','Engrossamento raízes','Maturação','Maturação','Pré-colheita','Colheita','Colheita tardia','Colheita tardia'],
    recs:['Garantir boa umidade para brotação das estacas','Monitorar emergência; replantio se necessário','Adubação nitrogenada (1/3 da dose)','Controle preventivo de pragas foliares','Aplicar K₂O restante; capina se necessário','Avaliar estresses hídricos; irrigar se seco','Suspender nitrogênio; maximizar K para amido','Monitorar bacteriose e mosaico-comum','Preparar colheita; avaliar teor de amido','Colheita ótima para teor de amido máximo','Colheita recomendada antes de 14 meses','Colher! Raízes perdem qualidade após colheita','Risco de deterioração; colher imediatamente','Deterioração das raízes — colheita urgente'],
    refs:'Howeler & Cadavid (1983); Cock (1985 CIAT); LINTUL-Cassava-NPK (2022); Embrapa ZARC-MA; Oliveira Jr. et al.',
    defaultN:80, defaultP:60, defaultK:80, defaultS:20, defaultEsp:1.0,
  },
  tomate: {
    nome:'Tomate', icon:'🍅', cor:'#e53935',
    nomeCientifico:'Solanum lycopersicum L.',
    cicloBase:4, tempOpt:23, tempMin:10, tempMax:35,
    aguaOpt:120, pHOtimo:[6.0,6.8], espOpt:0.6,
    NOptimo:160, POptimo:100, KOptimo:210, SOptimo:25,
    prodMin:40, prodMax:120, alturaMax:180,
    unidade:'t/ha (frutos frescos)',
    bmPotencial:13.0, convFreshFactor:9.5, isFruitCrop:true,
    variedades:[
      { nome:'IPA-6 (tolerante ao calor)', ciclo:4, prodFator:0.88, tempOpt:25 },
      { nome:'Santa Clara 5300', ciclo:5, prodFator:1.0, tempOpt:23 },
      { nome:'Dominador F1 (híbrido)', ciclo:4, prodFator:1.1, tempOpt:22 },
      { nome:'Saladete (processamento)', ciclo:5, prodFator:1.05, tempOpt:24 },
    ],
    extraLabel:['Brix (°Bx)', 'Firmeza (N)'],
    extraCalc:(p, fGlobal) => [
      +(4.5 + (7.0-4.5)*(1-fGlobal*0.3)).toFixed(1),
      Math.round(30 + 20*fGlobal),
    ],
    fases:['Semeadura/transplante','Pegamento','Crescimento vegetativo','Florescimento','Frutificação','Maturação/colheita'],
    recs:['Adubação de base P+K; solo bem preparado e drenado','Irrigação diária; monitorar tombamento (Pythium)','Adubação N parcelada; tutoramento e desbrota','Polinização; controle de Tuta absoluta','Adubação potássica para enchimento; controle de fungos','Colheita escalonada a cada 3-5 dias; refrigeração pós-colheita'],
    refs:'Embrapa Hortaliças (2019); DSSAT-CERES-Tomato v4.7; Marouelli et al. (2012); FAO CROPWAT Tomato',
    defaultN:150, defaultP:100, defaultK:200, defaultS:25, defaultEsp:0.5,
  },
  banana: {
    nome:'Banana', icon:'🍌', cor:'#f9a825',
    nomeCientifico:'Musa spp.',
    cicloBase:13, tempOpt:27, tempMin:15, tempMax:38,
    aguaOpt:180, pHOtimo:[5.5,7.0], espOpt:2.5,
    NOptimo:220, POptimo:45, KOptimo:450, SOptimo:20,
    prodMin:15, prodMax:35, alturaMax:450,
    unidade:'t/ha (cachos frescos)',
    bmPotencial:18.0, convFreshFactor:5.5, isFruitCrop:true,
    variedades:[
      { nome:'Prata (Anã)', ciclo:13, prodFator:0.85, tempOpt:26 },
      { nome:'Maçã', ciclo:14, prodFator:0.8, tempOpt:26 },
      { nome:'Cavendish (Nanica)', ciclo:12, prodFator:1.0, tempOpt:27 },
      { nome:'BRS Princesa (Embrapa)', ciclo:13, prodFator:1.05, tempOpt:27 },
      { nome:'Pacovan (MA)', ciclo:14, prodFator:0.9, tempOpt:27 },
    ],
    extraLabel:['Peso do cacho (kg)', 'Brix (°Bx)'],
    extraCalc:(p, fGlobal) => [
      +(15 + 20*fGlobal).toFixed(1),
      +(16 + 6*fGlobal).toFixed(1),
    ],
    fases:['Implantação/brotação','Des. foliar inicial','Des. foliar','Crescimento vegetativo','Crescimento vegetativo','Crescimento vegetativo','Difer. floral','Emissão do cacho','Enchimento frutos','Enchimento frutos','Enchimento frutos','Maturação','Colheita','Pós-colheita'],
    recs:['Plantio das mudas (rizomas ou mudas-chifre); calagem','Manter umidade; controlar broca-do-rizoma','Adubação N parcelada mensalmente','Monitorar Sigatoka amarela; limpar folhas secas','Escore de número de folhas; irrigação regular','Adubação K pesada (maior demanda vegetativa)','Aparecimento da penca floral; proteger com saco','Desbaste para 7-9 pencas; remoção de pencas extras','Irrigação intensa; adubação foliar de K','Proteger o cacho de pássaros e sol direto','Avaliação do grau de maturação (calibre ≥ 32mm)','Colheita no ponto firme (maturação fisiológica)','Transporte refrigerado; embalagem para exportação','Brotação das filhotes para segunda safra (ratoon)'],
    refs:'Embrapa Mandioca e Fruticultura (2020); Robinson & Galán Saúco (2010); FAO Musa; IBGE-PAM 2023',
    defaultN:200, defaultP:40, defaultK:400, defaultS:20, defaultEsp:6.0,
  },
  abacaxi: {
    nome:'Abacaxi', icon:'🍍', cor:'#ff8f00',
    nomeCientifico:'Ananas comosus (L.) Merr.',
    cicloBase:16, tempOpt:26, tempMin:15, tempMax:35,
    aguaOpt:100, pHOtimo:[4.5,5.5], espOpt:0.3,
    NOptimo:30, POptimo:18, KOptimo:50, SOptimo:8,
    prodMin:25, prodMax:65, alturaMax:100,
    unidade:'t/ha (frutos frescos)',
    bmPotencial:8.0, convFreshFactor:8.0, isFruitCrop:true,
    variedades:[
      { nome:'Pérola (Perolera)', ciclo:16, prodFator:0.85, tempOpt:26 },
      { nome:'Smooth Cayenne', ciclo:18, prodFator:0.95, tempOpt:25 },
      { nome:'BRS Vitória (Embrapa)', ciclo:16, prodFator:1.0, tempOpt:26 },
      { nome:'MD-2 / Gold', ciclo:15, prodFator:1.1, tempOpt:25 },
    ],
    extraLabel:['Brix (°Bx)', 'Peso do fruto (kg)'],
    extraCalc:(p, fGlobal) => [
      +(12 + 5*fGlobal).toFixed(1),
      +(0.8 + 0.7*fGlobal).toFixed(2),
    ],
    fases:['Plantio (mudas)','Enraizamento','Des. vegetativo','Des. vegetativo','Des. vegetativo','Crescimento ativo','Crescimento ativo','Crescimento ativo','Indução floral','Florescimento','Frutificação','Frutificação','Enchimento','Enchimento','Maturação','Colheita','Pós-colheita','Ratoon'],
    recs:['Plantio das mudas; orientação da bainha solar','Rega leve; solo solto; sem encharcamento','Adubação foliar (N+K); controle de plantas daninhas','Fertilização foliar mensal; inspeção nematoides','Controle de cochonilhas; monitoramento','Fertilização K pesada (maior volume de planta)','Fertilização foliar K+Mg; inspeção broca','Adubação N suspensa; maximizar amido','Aplicação de Ethephon para induzir floração uniforme','Proteger inflorescência; umbigo do fruto','Raleio de frutinhos extras; proteção solar','Adubação Ca-B para qualidade','Irrigação regular; evitar déficit hídrico','Adubação foliar + controle de Phytophthora','Avaliar Brix ≥ 12°; casca amarelando','Colheita manual; pedúnculo de 3cm','Seleção, classificação e embalagem dos frutos','Rebrota dos filhotes para 2º ciclo (ratoon)'],
    refs:'Embrapa Mandioca e Fruticultura (CNPMF); Py et al. (1987); Oliveira & Souza (2018); FAO',
    defaultN:30, defaultP:18, defaultK:50, defaultS:8, defaultEsp:0.3,
  },
  melancia: {
    nome:'Melancia', icon:'🍉', cor:'#2e7d32',
    nomeCientifico:'Citrullus lanatus (Thunb.)',
    cicloBase:4, tempOpt:28, tempMin:18, tempMax:38,
    aguaOpt:130, pHOtimo:[6.0,7.0], espOpt:2.0,
    NOptimo:100, POptimo:80, KOptimo:130, SOptimo:15,
    prodMin:30, prodMax:80, alturaMax:40,
    unidade:'t/ha (frutos frescos)',
    bmPotencial:9.5, convFreshFactor:9.0, isFruitCrop:true,
    variedades:[
      { nome:'Crimson Sweet', ciclo:4, prodFator:1.0, tempOpt:28 },
      { nome:'Sugar Baby', ciclo:3, prodFator:0.85, tempOpt:29 },
      { nome:'BRS Soleil (Embrapa)', ciclo:4, prodFator:1.05, tempOpt:28 },
      { nome:'BRS Opara (triplóide)', ciclo:4, prodFator:0.95, tempOpt:27 },
      { nome:'Jubilee', ciclo:4, prodFator:1.0, tempOpt:28 },
    ],
    extraLabel:['Brix (°Bx)', 'Peso médio (kg)'],
    extraCalc:(p, fGlobal) => [
      +(9 + 4*fGlobal).toFixed(1),
      +(5 + 10*fGlobal).toFixed(1),
    ],
    fases:['Germinação/transplante','Estabelecimento','Crescimento vegetativo','Florescimento','Pegamento de frutos','Des. frutos','Des. frutos','Maturação/colheita'],
    recs:['Semeadura direta ou mudas; canteiro bem drenado','Desbaste para 1 planta/cova; proteção de mudas','Adubação N parcelada; controle de pulgões e trips','Polinização por abelhas (manter colmeias próximas)','Desbaste para 2-3 frutos/planta; adubação K','Irrigação intensa; K+Ca para parede firme','Controle de antracnose e míldio; monitorar maturação','Colheita quando gavinha seca; "toque" no fruto'],
    refs:'Embrapa Semi-Árido; Bhella (2003); FAO Cucurbit Crops; Dias et al. (2010); Marouelli (2011)',
    defaultN:100, defaultP:80, defaultK:130, defaultS:15, defaultEsp:3.0,
  },
};

/* ─────────── ESTADO ─────────── */
let _crescCurrentCrop = 'mandioca';
let _crescCharts = {};

/* ─────────── INICIALIZAÇÃO LAZY ─────────── */
function _initCrescimento() {
  const el = document.getElementById('simtab-crescimento');
  if (!el || el.dataset.init) return;
  el.innerHTML = _buildCrescimentoHTML();
  el.dataset.init = '1';
  showCrescTab('mandioca');
}

/* ─────────── HTML BUILDER ─────────── */
function _buildCrescimentoHTML() {
  const munOpts = Object.entries(CRESC_MUN).map(([k,m]) =>
    `<option value="${k}">${m.nome}</option>`).join('');

  const cropTabs = Object.keys(CRESC_CROPS).map((k,i) => {
    const c = CRESC_CROPS[k];
    return `<button class="sim-itab${i===0?' active':''}" data-croptab="${k}" onclick="showCrescTab('${k}')">${c.icon} ${c.nome}</button>`;
  }).join('');

  return `
<div style="margin-bottom:12px">
  <div class="sec-title" style="margin-bottom:4px">🌿 Simuladores de Crescimento de Plantas</div>
  <div style="font-size:12px;color:var(--text3)">Modelos baseados em DSSAT · Embrapa · FAO · CIAT · Mandioca · Tomate · Banana · Abacaxi · Melancia</div>
</div>

<div class="sim-tabs-inner" style="margin-bottom:14px">${cropTabs}</div>

<div style="display:grid;grid-template-columns:minmax(240px,290px) 1fr;gap:16px;align-items:start">

  <!-- ═══ CONTROLES ═══ -->
  <div class="sim-card" style="margin:0">
    <div class="sim-card-title" id="cresc-panel-title">🌿 Mandioca</div>

    <div class="sim-param">
      <label style="font-size:11px;color:var(--text3)">Município do Maranhão</label>
      <select class="sim-select" id="cresc-mun" onchange="onCrescMunicipioChange()">${munOpts}</select>
    </div>
    <div style="font-size:10px;color:var(--text3);margin-bottom:10px;padding:5px 8px;background:var(--bg3);border-radius:6px" id="cresc-mun-desc">São Luís · Tropical úmido · 28°C</div>

    <div class="sim-param">
      <label style="font-size:11px;color:var(--text3)">Cultivar / Variedade</label>
      <select class="sim-select" id="cresc-var" onchange="updateCrescent()"></select>
    </div>

    <div style="font-size:10px;font-weight:600;color:var(--text2);margin:8px 0 6px;text-transform:uppercase;letter-spacing:.05em">☀️ Clima</div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Temperatura média (°C)</span><strong id="cresc-lbl-temp">28</strong></label>
      <input type="range" class="sim-slider" id="cresc-temp" min="15" max="40" value="28" step="0.5" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Precipitação mensal (mm)</span><strong id="cresc-lbl-chuva">175</strong></label>
      <input type="range" class="sim-slider" id="cresc-chuva" min="0" max="600" value="175" step="5" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Radiação solar (MJ/m²/dia)</span><strong id="cresc-lbl-rad">18</strong></label>
      <input type="range" class="sim-slider" id="cresc-rad" min="5" max="30" value="18" step="0.5" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Umidade relativa (%)</span><strong id="cresc-lbl-ur">75</strong></label>
      <input type="range" class="sim-slider" id="cresc-ur" min="30" max="100" value="75" step="1" oninput="updateCrescLabels();updateCrescent()">
    </div>

    <div style="font-size:10px;font-weight:600;color:var(--text2);margin:8px 0 6px;text-transform:uppercase;letter-spacing:.05em">🪨 Solo & Nutrientes (CHONPS)</div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>pH do solo</span><strong id="cresc-lbl-ph">5.8</strong></label>
      <input type="range" class="sim-slider" id="cresc-ph" min="3.5" max="8.5" value="5.8" step="0.1" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Nitrogênio — N (kg/ha)</span><strong id="cresc-lbl-N">80</strong></label>
      <input type="range" class="sim-slider" id="cresc-N" min="0" max="300" value="80" step="5" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Fósforo — P₂O₅ (kg/ha)</span><strong id="cresc-lbl-P">60</strong></label>
      <input type="range" class="sim-slider" id="cresc-P" min="0" max="200" value="60" step="5" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Potássio — K₂O (kg/ha)</span><strong id="cresc-lbl-K">80</strong></label>
      <input type="range" class="sim-slider" id="cresc-K" min="0" max="600" value="80" step="5" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Enxofre — S (kg/ha)</span><strong id="cresc-lbl-S">20</strong></label>
      <input type="range" class="sim-slider" id="cresc-S" min="0" max="80" value="20" step="2" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Cálcio — Ca (cmolc/dm³)</span><strong id="cresc-lbl-Ca">2.5</strong></label>
      <input type="range" class="sim-slider" id="cresc-Ca" min="0" max="8" value="2.5" step="0.1" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Matéria orgânica (%)</span><strong id="cresc-lbl-MO">2.0</strong></label>
      <input type="range" class="sim-slider" id="cresc-MO" min="0.5" max="6" value="2.0" step="0.1" oninput="updateCrescLabels();updateCrescent()">
    </div>

    <div style="font-size:10px;font-weight:600;color:var(--text2);margin:8px 0 6px;text-transform:uppercase;letter-spacing:.05em">🌾 Manejo</div>
    <div class="sim-param">
      <label style="font-size:11px;color:var(--text3)">Mês de plantio</label>
      <select class="sim-select" id="cresc-mes" onchange="updateCrescent()">
        <option value="1">Janeiro (início chuvas)</option><option value="2">Fevereiro</option>
        <option value="3">Março</option><option value="4">Abril</option>
        <option value="5">Maio (início seca)</option><option value="6">Junho</option>
        <option value="7">Julho (seco)</option><option value="8">Agosto</option>
        <option value="9">Setembro</option><option value="10">Outubro (início chuvas)</option>
        <option value="11">Novembro</option><option value="12">Dezembro</option>
      </select>
    </div>
    <div class="sim-param">
      <label style="display:flex;justify-content:space-between"><span>Espaçamento (m²/planta)</span><strong id="cresc-lbl-esp">1.0</strong></label>
      <input type="range" class="sim-slider" id="cresc-esp" min="0.1" max="8" value="1.0" step="0.1" oninput="updateCrescLabels();updateCrescent()">
    </div>
    <div class="sim-param">
      <label style="font-size:11px;color:var(--text3)">Irrigação suplementar</label>
      <select class="sim-select" id="cresc-irrig" onchange="updateCrescent()">
        <option value="0">Não (sequeiro)</option>
        <option value="1">Sim (quando necessário)</option>
        <option value="2">Sim (gotejamento permanente)</option>
      </select>
    </div>
    <div class="sim-param">
      <label style="font-size:11px;color:var(--text3)">Pragas / Doenças</label>
      <select class="sim-select" id="cresc-praga" onchange="updateCrescent()">
        <option value="0">Nenhuma</option>
        <option value="1">Leve (monitorada)</option>
        <option value="2">Moderada (sem controle)</option>
        <option value="3">Severa (alta pressão)</option>
      </select>
    </div>
  </div>

  <!-- ═══ RESULTADOS ═══ -->
  <div style="display:flex;flex-direction:column;gap:14px">

    <!-- Status + SVG da planta -->
    <div class="chart-card" style="padding:14px">
      <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px">
          <svg id="cresc-plant-svg" viewBox="0 0 200 320" width="150" height="240" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cg-soil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7a5230"/><stop offset="100%" stop-color="#3d2a14"/>
              </linearGradient>
              <linearGradient id="cg-stem" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#5a3518"/><stop offset="50%" stop-color="#9a6838"/><stop offset="100%" stop-color="#4a2c10"/>
              </linearGradient>
            </defs>
            <g id="cg-soil-g"></g>
            <g id="cg-roots-g"></g>
            <g id="cg-stem-g"></g>
            <g id="cg-leaves-g"></g>
            <g id="cg-fruit-g"></g>
            <circle id="cg-health-dot" cx="183" cy="16" r="9" fill="#3b6d11"/>
            <text id="cg-health-lbl" x="183" y="20" text-anchor="middle" font-size="9" fill="white" font-weight="bold">✓</text>
          </svg>
          <div style="font-size:10px;color:var(--text3);text-align:center;max-width:150px" id="cresc-stage-lbl">Aguardando simulação</div>
        </div>
        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;min-width:180px">
          <div style="background:var(--bg3);border-radius:8px;padding:10px">
            <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Produtividade prevista</div>
            <div style="font-size:1.15rem;font-weight:700;color:var(--green)" id="cresc-stat-prod">—</div>
            <div style="font-size:10px;color:var(--text3)" id="cresc-prod-unit">t/ha</div>
            <div style="height:3px;background:var(--border);border-radius:2px;margin-top:5px"><div id="cresc-bar-prod" style="height:3px;border-radius:2px;background:var(--green);width:0%;transition:width .4s"></div></div>
          </div>
          <div style="background:var(--bg3);border-radius:8px;padding:10px">
            <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Saúde da planta</div>
            <div style="font-size:1.15rem;font-weight:700" id="cresc-stat-saude">—</div>
            <div style="font-size:10px;color:var(--text3)">/ 100</div>
            <div style="height:3px;background:var(--border);border-radius:2px;margin-top:5px"><div id="cresc-bar-saude" style="height:3px;border-radius:2px;background:#1d9e75;width:0%;transition:width .4s"></div></div>
          </div>
          <div style="background:var(--bg3);border-radius:8px;padding:10px">
            <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Altura estimada</div>
            <div style="font-size:1.15rem;font-weight:700;color:var(--text)" id="cresc-stat-altura">—</div>
            <div style="font-size:10px;color:var(--text3)" id="cresc-altura-unit">cm</div>
            <div style="height:3px;background:var(--border);border-radius:2px;margin-top:5px"><div id="cresc-bar-altura" style="height:3px;border-radius:2px;background:#60a5fa;width:0%;transition:width .4s"></div></div>
          </div>
          <div style="background:var(--bg3);border-radius:8px;padding:10px">
            <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Ciclo / Colheita</div>
            <div style="font-size:1.15rem;font-weight:700;color:var(--text)" id="cresc-stat-ciclo">—</div>
            <div style="font-size:10px;color:var(--text3)">meses</div>
            <div style="height:3px;background:var(--border);border-radius:2px;margin-top:5px"><div id="cresc-bar-ciclo" style="height:3px;border-radius:2px;background:#f59e0b;width:0%;transition:width .4s"></div></div>
          </div>
          <div style="background:var(--bg3);border-radius:8px;padding:10px">
            <div style="font-size:10px;color:var(--text3);margin-bottom:2px" id="cresc-extra1-lbl">Extra 1</div>
            <div style="font-size:1.15rem;font-weight:700;color:var(--text)" id="cresc-stat-extra1">—</div>
            <div style="font-size:10px;color:var(--text3)" id="cresc-extra1-unit"></div>
            <div style="height:3px;background:var(--border);border-radius:2px;margin-top:5px"><div id="cresc-bar-extra1" style="height:3px;border-radius:2px;background:#a78bfa;width:0%;transition:width .4s"></div></div>
          </div>
          <div style="background:var(--bg3);border-radius:8px;padding:10px">
            <div style="font-size:10px;color:var(--text3);margin-bottom:2px" id="cresc-extra2-lbl">Extra 2</div>
            <div style="font-size:1.15rem;font-weight:700;color:var(--text)" id="cresc-stat-extra2">—</div>
            <div style="font-size:10px;color:var(--text3)" id="cresc-extra2-unit"></div>
            <div style="height:3px;background:var(--border);border-radius:2px;margin-top:5px"><div id="cresc-bar-extra2" style="height:3px;border-radius:2px;background:#fb923c;width:0%;transition:width .4s"></div></div>
          </div>
        </div>
      </div>
      <div id="cresc-alert" style="display:none;margin-top:10px;padding:8px 12px;border-radius:6px;font-size:11px;font-weight:500"></div>
    </div>

    <!-- 4 Gráficos -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="chart-card">
        <div class="chart-title" style="font-size:12px">📈 Biomassa acumulada (t/ha MS) · LAI</div>
        <div class="chart-wrap" style="height:190px"><canvas id="cresc-chart-bio"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title" style="font-size:12px">🌿 Absorção de N · P · K (kg/ha)</div>
        <div class="chart-wrap" style="height:190px"><canvas id="cresc-chart-npk"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title" style="font-size:12px">🥧 Distribuição da biomassa na colheita</div>
        <div class="chart-wrap" style="height:190px"><canvas id="cresc-chart-dist"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title" style="font-size:12px">🎯 Fatores limitantes ao crescimento</div>
        <div class="chart-wrap" style="height:190px"><canvas id="cresc-chart-radar"></canvas></div>
      </div>
    </div>

    <!-- Base científica -->
    <div class="chart-card" style="padding:10px 14px">
      <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">📚 Base científica</div>
      <div style="font-size:10px;color:var(--text3)" id="cresc-refs">—</div>
    </div>
  </div>
</div>

<!-- Cronograma mês a mês -->
<div class="chart-card" style="margin-top:14px;padding:14px">
  <div class="chart-title" style="font-size:13px">📅 Cronograma de crescimento mês a mês</div>
  <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:11px" id="cresc-tbl">
      <thead id="cresc-tbl-head"></thead>
      <tbody id="cresc-tbl-body"></tbody>
    </table>
  </div>
</div>
`;
}

/* ─────────── NAVEGAÇÃO ENTRE CULTURAS ─────────── */
function showCrescTab(cropKey) {
  _crescCurrentCrop = cropKey;
  document.querySelectorAll('[data-croptab]').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-croptab="${cropKey}"]`);
  if (btn) btn.classList.add('active');

  const crop = CRESC_CROPS[cropKey];

  const titleEl = document.getElementById('cresc-panel-title');
  if (titleEl) titleEl.textContent = crop.icon + ' ' + crop.nome + ' — ' + crop.nomeCientifico;

  const varSel = document.getElementById('cresc-var');
  if (varSel) varSel.innerHTML = crop.variedades.map((v,i) =>
    `<option value="${i}">${v.nome}</option>`).join('');

  // Set defaults per crop
  const setV = (id, v) => { const el=document.getElementById(id); if(el) el.value=v; };
  setV('cresc-N', crop.defaultN); setV('cresc-P', crop.defaultP);
  setV('cresc-K', crop.defaultK); setV('cresc-S', crop.defaultS);
  setV('cresc-esp', crop.defaultEsp);

  // pH default
  const phMid = (crop.pHOtimo[0] + crop.pHOtimo[1]) / 2;
  setV('cresc-ph', phMid.toFixed(1));

  // Extra stat labels
  const ex = crop.extraLabel;
  const e1 = document.getElementById('cresc-extra1-lbl');
  const e2 = document.getElementById('cresc-extra2-lbl');
  if (e1) e1.textContent = ex[0];
  if (e2) e2.textContent = ex[1];

  const refsEl = document.getElementById('cresc-refs');
  if (refsEl) refsEl.textContent = crop.refs;

  updateCrescLabels();
  updateCrescent();
}

/* ─────────── MUNICÍPIO ─────────── */
function onCrescMunicipioChange() {
  const k = document.getElementById('cresc-mun').value;
  const m = CRESC_MUN[k];
  const descEl = document.getElementById('cresc-mun-desc');
  if (descEl) descEl.textContent = m.desc;
  const setV = (id, v) => { const el=document.getElementById(id); if(el) el.value=v; };
  setV('cresc-temp', m.temp);
  setV('cresc-chuva', m.chuva);
  setV('cresc-rad', m.rad);
  setV('cresc-ur', m.ur);
  setV('cresc-ph', m.ph);
  updateCrescLabels();
  updateCrescent();
}

/* ─────────── LABELS DOS SLIDERS ─────────── */
function updateCrescLabels() {
  const fv = id => { const el=document.getElementById(id); return el?parseFloat(el.value):0; };
  const sv = id => { const el=document.getElementById(id); return el?el.value:''; };
  const setT = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  setT('cresc-lbl-temp', fv('cresc-temp').toFixed(1));
  setT('cresc-lbl-chuva', sv('cresc-chuva'));
  setT('cresc-lbl-rad', fv('cresc-rad').toFixed(1));
  setT('cresc-lbl-ur', sv('cresc-ur'));
  setT('cresc-lbl-ph', fv('cresc-ph').toFixed(1));
  setT('cresc-lbl-N', sv('cresc-N'));
  setT('cresc-lbl-P', sv('cresc-P'));
  setT('cresc-lbl-K', sv('cresc-K'));
  setT('cresc-lbl-S', sv('cresc-S'));
  setT('cresc-lbl-Ca', fv('cresc-Ca').toFixed(1));
  setT('cresc-lbl-MO', fv('cresc-MO').toFixed(1));
  setT('cresc-lbl-esp', fv('cresc-esp').toFixed(1));
}

/* ─────────── LEITURA DOS PARÂMETROS ─────────── */
function _getCrescParams() {
  const fv = id => { const el=document.getElementById(id); return el?parseFloat(el.value):0; };
  const iv = id => { const el=document.getElementById(id); return el?parseInt(el.value):0; };
  return {
    temp:fv('cresc-temp'), chuva:fv('cresc-chuva'), rad:fv('cresc-rad'), ur:fv('cresc-ur'),
    ph:fv('cresc-ph'), N:fv('cresc-N'), P:fv('cresc-P'), K:fv('cresc-K'),
    S:fv('cresc-S'), Ca:fv('cresc-Ca'), MO:fv('cresc-MO'), esp:fv('cresc-esp'),
    mes:iv('cresc-mes'), irrig:iv('cresc-irrig'), praga:iv('cresc-praga'),
    varIdx:iv('cresc-var'),
  };
}

/* ─────────── MODELO CIENTÍFICO ─────────── */
function _calcCrescFactors(p, crop) {
  // Temperatura (cardinal min/opt/max - DSSAT pattern)
  let fTemp;
  const {tempMin:tMin, tempOpt:tOpt, tempMax:tMax} = crop;
  if (p.temp <= tMin) fTemp = 0;
  else if (p.temp < tMin+5) fTemp = (p.temp-tMin)/5*0.4;
  else if (p.temp <= tOpt) fTemp = 0.4 + (p.temp-(tMin+5))/(tOpt-tMin-5)*0.6;
  else if (p.temp <= tMax-5) fTemp = 1.0 - (p.temp-tOpt)/(tMax-5-tOpt)*0.4;
  else fTemp = Math.max(0, 0.6 - (p.temp-(tMax-5))/5*0.6);

  // Água
  let wMm = p.chuva;
  if (p.irrig>=1) wMm = Math.max(wMm, crop.aguaOpt*0.75);
  if (p.irrig>=2) wMm = Math.max(wMm, crop.aguaOpt);
  const wO = crop.aguaOpt;
  let fWater;
  if (wMm < 10) fWater = 0;
  else if (wMm < wO*0.25) fWater = wMm/(wO*0.25)*0.25;
  else if (wMm < wO*0.65) fWater = 0.25 + (wMm-wO*0.25)/(wO*0.4)*0.55;
  else if (wMm <= wO*1.8) fWater = 0.80 + (wMm-wO*0.65)/(wO*1.15)*0.20;
  else fWater = Math.max(0.45, 1.0-(wMm-wO*1.8)/(wO*2)*0.55);

  // pH
  const [phLo, phHi] = crop.pHOtimo;
  let fPH;
  if (p.ph < phLo-1.5) fPH = 0.2;
  else if (p.ph < phLo) fPH = 0.2 + (p.ph-(phLo-1.5))/1.5*0.6;
  else if (p.ph <= phHi) fPH = 0.8 + (p.ph-phLo)/(phHi-phLo)*0.2;
  else if (p.ph <= phHi+1) fPH = 1.0 - (p.ph-phHi)*0.4;
  else fPH = Math.max(0.2, 0.6-(p.ph-phHi-1)*0.35);

  // NPK — Liebig
  const fN  = p.N<=0 ? 0.15 : Math.min(1, 0.15+0.85*Math.min(1, p.N/crop.NOptimo));
  const fP  = p.P<=0 ? 0.20 : Math.min(1, 0.20+0.80*Math.min(1, p.P/crop.POptimo));
  const fK  = p.K<=0 ? 0.15 : Math.min(1, 0.15+0.85*Math.min(1, p.K/crop.KOptimo));
  const fS  = p.S<=0 ? 0.70 : Math.min(1, 0.70+0.30*Math.min(1, p.S/crop.SOptimo));
  const fMO = Math.min(1, 0.6+p.MO/6.0*0.4);

  // Radiação
  let fRad;
  if (p.rad<8) fRad=0.4;
  else if (p.rad<15) fRad=0.4+(p.rad-8)/7*0.35;
  else if (p.rad<=22) fRad=0.75+(p.rad-15)/7*0.25;
  else fRad=Math.max(0.7,1.0-(p.rad-22)/8*0.3);

  // Pragas
  const fPraga = [1.0, 0.88, 0.72, 0.45][p.praga] || 1.0;

  // Espaçamento
  const eO = crop.espOpt;
  let fEsp;
  if (p.esp<eO*0.35) fEsp=0.55;
  else if (p.esp<=eO*1.3) fEsp=0.82+(p.esp-eO*0.35)/(eO*0.95)*0.18;
  else if (p.esp<=eO*2.5) fEsp=1.0;
  else fEsp=Math.max(0.65,1.0-(p.esp-eO*2.5)/(eO*3)*0.35);

  return {fTemp,fWater,fPH,fN,fP,fK,fS,fMO,fRad,fPraga,fEsp};
}

function _crescGrowthFrac(cropKey, m, ciclo) {
  const t = (m+1)/ciclo;
  switch(cropKey) {
    case 'mandioca':
      if (t<=2/12) return 0.01*(m+1)/2;
      if (t<=6/12) return 0.02+0.88*(t-2/12)/(4/12);
      if (t<=10/12)return 0.90+0.08*(t-6/12)/(4/12);
      return 0.98+0.02*(t-10/12)/(2/12);
    case 'tomate':
      if (t<0.30) return t/0.30*0.30;
      if (t<0.65) return 0.30+(t-0.30)/0.35*0.65;
      if (t<=0.90)return 0.95+(t-0.65)/0.25*0.05;
      return Math.max(0.9,1.0-(t-0.90)/0.10*0.05);
    case 'banana':
      if (t<0.45) return t/0.45*0.48;
      if (t<0.75) return 0.48+(t-0.45)/0.30*0.38;
      return 0.86+(t-0.75)/0.25*0.14;
    case 'abacaxi':
      if (t<0.40) return t/0.40*0.28;
      if (t<0.62) return 0.28+(t-0.40)/0.22*0.25;
      if (t<0.88) return 0.53+(t-0.62)/0.26*0.43;
      return 0.96+(t-0.88)/0.12*0.04;
    case 'melancia':
      if (t<0.22) return t/0.22*0.28;
      if (t<0.62) return 0.28+(t-0.22)/0.40*0.68;
      return 0.96+(t-0.62)/0.38*0.04;
    default:
      return t;
  }
}

function _crescPartition(cropKey, t) {
  switch(cropKey) {
    case 'mandioca': {
      const rF=Math.min(0.55,0.10+0.45*t), lF=Math.max(0.05,0.35-0.20*t);
      return {root:rF, leaf:lF, stem:Math.max(0.05,1-rF-lF), fruit:0};
    }
    case 'tomate': {
      const fr=Math.min(0.65,Math.max(0,(t-0.35)/0.65)*0.7);
      const lf=Math.max(0.10,0.40-fr*0.28);
      return {root:0.08, leaf:lf, stem:Math.max(0.04,1-fr-lf-0.08), fruit:fr};
    }
    case 'banana': {
      const bF=Math.min(0.40,Math.max(0,(t-0.52)/0.48)*0.45);
      const lF=Math.max(0.10,0.38-bF*0.2);
      return {root:0.10, leaf:lF, stem:Math.max(0.10,1-bF-lF-0.10), fruit:bF};
    }
    case 'abacaxi': {
      const frA=Math.min(0.52,Math.max(0,(t-0.56)/0.44)*0.58);
      const lfA=Math.max(0.22,0.52-frA*0.28);
      return {root:0.05, leaf:lfA, stem:Math.max(0.05,1-frA-lfA-0.05), fruit:frA};
    }
    case 'melancia': {
      const frM=Math.min(0.72,Math.max(0,(t-0.38)/0.62)*0.78);
      const lfM=Math.max(0.10,0.40-frM*0.22);
      return {root:0.04, leaf:lfM, stem:Math.max(0.04,1-frM-lfM-0.04), fruit:frM};
    }
    default:
      return {root:0.25, leaf:0.25, stem:0.25, fruit:0.25};
  }
}

function _crescHeight(cropKey, m, ciclo, maxH) {
  const t = (m+1)/ciclo;
  switch(cropKey) {
    case 'mandioca':
      if (m<2) return 15+20*m;
      if (m<8) return 55+35*(m-2);
      return Math.min(maxH, 265+10*(m-8));
    case 'tomate':
      return Math.min(maxH, 10+maxH*0.92*Math.min(1,t*1.6));
    case 'banana':
      return Math.min(maxH, maxH*(1-Math.exp(-4*t)));
    case 'abacaxi':
      return Math.min(maxH, 8+maxH*0.88*t);
    case 'melancia':
      return Math.min(maxH, 4+maxH*t);
    default:
      return Math.min(maxH, maxH*t);
  }
}

function _crescLAI(cropKey, m, ciclo) {
  const t = (m+1)/ciclo;
  switch(cropKey) {
    case 'mandioca':
      if (m<3) return 0.5*(m+1)/3;
      if (m<6) return 0.5+2.5*(m-2)/3;
      if (m<9) return 3.0-0.3*(m-5)/3;
      return Math.max(0.5,2.1-0.5*(m-8)/3);
    case 'tomate':
      if (t<0.30) return t/0.30*2.5;
      if (t<0.65) return 2.5+(t-0.30)/0.35*1.0;
      return Math.max(0.5,3.5-(t-0.65)/0.35*2.2);
    case 'banana':
      if (t<0.40) return t/0.40*4.5;
      if (t<0.80) return 4.5+(t-0.40)/0.40*1.5;
      return Math.max(2.5,6.0-(t-0.80)/0.20*1.0);
    case 'abacaxi':
      if (t<0.50) return t/0.50*2.2;
      return Math.max(1.2,2.2-(t-0.50)/0.50*0.5);
    case 'melancia':
      if (t<0.32) return t/0.32*2.8;
      if (t<0.68) return 2.8+(t-0.32)/0.36*0.8;
      return Math.max(0.5,3.6-(t-0.68)/0.32*2.2);
    default:
      return Math.sin(t*Math.PI)*3.5;
  }
}

function _simulateCrescent(cropKey, p) {
  const crop = CRESC_CROPS[cropKey];
  const f = _calcCrescFactors(p, crop);
  const varDef = crop.variedades[Math.min(p.varIdx, crop.variedades.length-1)];
  const ciclo = varDef.ciclo;
  const vTemp = varDef.tempOpt || crop.tempOpt;

  // Ajuste por temperature ótima da variedade
  let dT = Math.abs(p.temp - vTemp);
  const varTempAdj = dT>5 ? Math.max(0.7, 1-dT/20) : 1.0;

  const fNutrMin = Math.min(f.fN, f.fP, f.fK);
  const fGlobal = Math.min(0.97,
    f.fTemp * f.fWater * f.fPH * fNutrMin * f.fS * f.fMO * f.fRad * f.fPraga * f.fEsp
  ) * varDef.prodFator * varTempAdj;

  const months = [];
  for (let m=0; m<ciclo; m++) {
    const t = (m+1)/ciclo;
    const bFrac = _crescGrowthFrac(cropKey, m, ciclo);
    const bmTotal = crop.bmPotencial * fGlobal * bFrac;
    const part = _crescPartition(cropKey, t);

    // Rendimento fresco
    const yieldFrac = crop.isFruitCrop ? part.fruit : part.root;
    const freshYield = bmTotal * yieldFrac * crop.convFreshFactor;

    const height = Math.round(_crescHeight(cropKey, m, ciclo, crop.alturaMax) * Math.min(1, fGlobal+0.12));
    const lai = +(_crescLAI(cropKey, m, ciclo) * fGlobal).toFixed(2);

    // Absorção de nutrientes cumulativa
    const absN = Math.round(Math.min(p.N*0.90, crop.NOptimo*1.05*fGlobal*bFrac));
    const absP = Math.round(Math.min(p.P*0.85, crop.POptimo*0.95*fGlobal*bFrac));
    const absK = Math.round(Math.min(p.K*0.90, crop.KOptimo*1.00*fGlobal*bFrac));

    const health = Math.min(100, Math.max(1, Math.round(fGlobal*94)));

    months.push({
      m:m+1, height, bmTotal:+bmTotal.toFixed(2),
      freshYield:+freshYield.toFixed(2),
      rootFrac:+part.root.toFixed(3), stemFrac:+part.stem.toFixed(3),
      leafFrac:+part.leaf.toFixed(3), fruitFrac:+part.fruit.toFixed(3),
      absN, absP, absK, lai, health,
    });
  }
  return {months, f, fGlobal, ciclo, varDef};
}

/* ─────────── ATUALIZAÇÃO PRINCIPAL DA UI ─────────── */
function updateCrescent() {
  const cropKey = _crescCurrentCrop;
  const crop = CRESC_CROPS[cropKey];
  if (!document.getElementById('cresc-stat-prod')) return;

  const p = _getCrescParams();
  const result = _simulateCrescent(cropKey, p);
  const last = result.months[result.months.length-1];
  const f = result.f;

  // Estatísticas
  const setTxt = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  const setW   = (id, w) => { const el=document.getElementById(id); if(el) el.style.width=w+'%'; };

  setTxt('cresc-stat-prod', last.freshYield.toFixed(1));
  setTxt('cresc-prod-unit', crop.unidade);
  setTxt('cresc-stat-saude', last.health);
  setTxt('cresc-stat-altura', last.height);
  setTxt('cresc-altura-unit', cropKey==='melancia' ? 'cm (rasteiro)' : 'cm');
  setTxt('cresc-stat-ciclo', result.ciclo);

  const extras = crop.extraCalc(p, result.fGlobal);
  setTxt('cresc-stat-extra1', extras[0]);
  setTxt('cresc-stat-extra2', extras[1]);

  setW('cresc-bar-prod',   Math.min(100, last.freshYield/crop.prodMax*100));
  setW('cresc-bar-saude',  last.health);
  setW('cresc-bar-altura', Math.min(100, last.height/crop.alturaMax*100));
  setW('cresc-bar-ciclo',  Math.min(100, result.ciclo/18*100));
  setW('cresc-bar-extra1', Math.min(100, parseFloat(extras[0])/(cropKey==='mandioca'?45:cropKey==='abacaxi'||cropKey==='tomate'?18:cropKey==='banana'?40:15)*100));
  setW('cresc-bar-extra2', Math.min(100, parseFloat(extras[1])/(cropKey==='mandioca'?200:cropKey==='tomate'?60:cropKey==='banana'?25:cropKey==='abacaxi'?2.5:25)*100));

  const sEl = document.getElementById('cresc-bar-saude');
  if (sEl) sEl.style.background = last.health>70?'#1d9e75':last.health>40?'#e97c2a':'#dc2626';

  // Alerta
  const alertEl = document.getElementById('cresc-alert');
  if (alertEl) {
    if (result.fGlobal < 0.30) {
      alertEl.style.cssText='display:block;margin-top:10px;padding:8px 12px;border-radius:6px;font-size:11px;font-weight:500;background:#fef2f2;color:#dc2626';
      alertEl.textContent='⚠️ RISCO CRÍTICO. Múltiplos fatores limitantes severos. Produtividade muito baixa ou perda da lavoura.';
    } else if (result.fGlobal < 0.55) {
      const lim=[];
      if(f.fTemp<0.7)lim.push('temperatura'); if(f.fWater<0.7)lim.push('hídrico');
      if(f.fN<0.7)lim.push('N'); if(f.fP<0.7)lim.push('P'); if(f.fK<0.7)lim.push('K');
      if(f.fPH<0.7)lim.push('pH');
      alertEl.style.cssText='display:block;margin-top:10px;padding:8px 12px;border-radius:6px;font-size:11px;font-weight:500;background:#fffbeb;color:#d97706';
      alertEl.textContent='⚠️ Crescimento limitado. Fatores críticos: '+lim.join(', ')+'.';
    } else if (result.fGlobal > 0.80) {
      alertEl.style.cssText='display:block;margin-top:10px;padding:8px 12px;border-radius:6px;font-size:11px;font-weight:500;background:#f0fdf4;color:#15803d';
      alertEl.textContent='✓ Condições favoráveis. Produção esperada: '+last.freshYield.toFixed(1)+' '+crop.unidade+'.';
    } else {
      alertEl.style.display='none';
    }
  }

  // Fase da planta
  const stageEl = document.getElementById('cresc-stage-lbl');
  if (stageEl) {
    const idx = Math.min(crop.fases.length-1, result.ciclo-1);
    stageEl.textContent = 'Mês '+result.ciclo+' — '+crop.fases[idx];
  }

  // Saúde badge SVG
  const hDot = document.getElementById('cg-health-dot');
  const hLbl = document.getElementById('cg-health-lbl');
  if (hDot) hDot.setAttribute('fill', last.health>70?'#3b6d11':last.health>40?'#d97706':'#dc2626');
  if (hLbl) hLbl.textContent = last.health>70?'✓':last.health>40?'!':'✗';

  _drawCrescPlant(cropKey, result.fGlobal, last.height, last.freshYield, result.ciclo);
  _updateCrescCharts(result, crop, cropKey);
  _updateCrescTable(result, crop, cropKey);
}

/* ─────────── DESENHO SVG DA PLANTA ─────────── */
const _svgN = n => parseFloat(n.toFixed(1));
const CRESC_GY = 212; // ground y
const CRESC_CX = 100; // center x

function _drawCrescPlant(cropKey, health, height, freshYield, ciclo) {
  const ns = 'http://www.w3.org/2000/svg';
  const gSoil   = document.getElementById('cg-soil-g');
  const gRoots  = document.getElementById('cg-roots-g');
  const gStem   = document.getElementById('cg-stem-g');
  const gLeaves = document.getElementById('cg-leaves-g');
  const gFruit  = document.getElementById('cg-fruit-g');
  if (!gSoil) return;
  [gSoil,gRoots,gStem,gLeaves,gFruit].forEach(g => g.innerHTML='');

  if (health<0.05) return;

  // Solo
  const soilRect = document.createElementNS(ns,'rect');
  soilRect.setAttribute('x','15'); soilRect.setAttribute('y',_svgN(CRESC_GY-2)+'');
  soilRect.setAttribute('width','170'); soilRect.setAttribute('height','55');
  soilRect.setAttribute('rx','4'); soilRect.setAttribute('fill','url(#cg-soil)');
  soilRect.setAttribute('opacity','0.9'); gSoil.appendChild(soilRect);
  [CRESC_GY+4, CRESC_GY+10].forEach(ly => {
    const l=document.createElementNS(ns,'path');
    l.setAttribute('d',`M20,${ly} Q60,${ly-2} 100,${ly} Q140,${ly+2} 180,${ly}`);
    l.setAttribute('stroke','#4a2a10'); l.setAttribute('stroke-width','0.7');
    l.setAttribute('fill','none'); l.setAttribute('opacity','0.4');
    gSoil.appendChild(l);
  });

  switch(cropKey) {
    case 'mandioca': _drawMandioca(ns,gRoots,gStem,gLeaves,health,height,freshYield); break;
    case 'tomate':   _drawTomate(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'banana':   _drawBanana(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'abacaxi':  _drawAbacaxi(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'melancia': _drawMelancia(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
  }
}

function _drawMandioca(ns,gR,gS,gL,h,height,yld) {
  const cy = CRESC_GY, cx = CRESC_CX;
  // Tubérculos
  if (yld>0.5) {
    const op = Math.min(1, yld/8);
    const sc = Math.min(1, yld/20);
    const rLen=40+55*sc, rW=4+8*sc;
    [-45,-22,0,22,45].forEach((deg,i) => {
      const rad=deg*Math.PI/180, dx=Math.sin(rad), dy=Math.cos(rad);
      const ox=cx+[-18,-8,0,8,18][i];
      const ex=ox+dx*rLen, ey=cy+dy*rLen;
      const px=-dy, py=dx;
      const path=document.createElementNS(ns,'path');
      path.setAttribute('d',
        `M${_svgN(ox-px*3)},${_svgN(cy-py*3)} Q${_svgN(ox+dx*rLen*0.35-px*rW)},${_svgN(cy+dy*rLen*0.35-py*rW)} ${_svgN(ex-px*1.5)},${_svgN(ey-py*1.5)} L${_svgN(ex+px*1.5)},${_svgN(ey+py*1.5)} Q${_svgN(ox+dx*rLen*0.35+px*rW)},${_svgN(cy+dy*rLen*0.35+py*rW)} ${_svgN(ox+px*3)},${_svgN(cy+py*3)} Z`);
      path.setAttribute('fill',['#c09060','#d0a068','#c8904e','#d0a068','#c08850'][i]);
      path.setAttribute('stroke','#8a5020'); path.setAttribute('stroke-width','0.7');
      path.setAttribute('opacity',op.toFixed(2));
      gR.appendChild(path);
    });
  }
  // Caule
  const sH=Math.min(175, height*0.65), sY=cy-sH, sW=4+3*Math.min(1,height/250);
  const forkY=sY+sH*0.55;
  const stemPath=document.createElementNS(ns,'path');
  stemPath.setAttribute('d',
    `M${cx-sW},${cy} L${cx-sW*0.5},${_svgN(forkY)} L${cx-sW*0.8},${_svgN(sY+6)} L${cx+sW*0.8},${_svgN(sY+6)} L${cx+sW*0.5},${_svgN(forkY)} L${cx+sW},${cy} Z`);
  stemPath.setAttribute('fill','url(#cg-stem)'); stemPath.setAttribute('stroke','#3a1c08');
  stemPath.setAttribute('stroke-width','0.7'); stemPath.setAttribute('opacity',Math.min(1,h+0.15)+'');
  gS.appendChild(stemPath);
  // Folhas (palmadas)
  if (h>0.1) {
    const gr=h>0.65?'#2e7a08':h>0.4?'#5a9a18':'#8ab040';
    [[cx,sY+6,0],[cx-sH*0.45,forkY,-1],[cx+sH*0.45,forkY,1]].forEach(([tx,ty,d]) => {
      _drawPalmLeaf(ns,gL,tx,ty,h,gr,d,h>0.4?6:4,26+14*h,3+2*h);
    });
  }
}

function _drawTomate(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(155,height*0.85);
  // Tutor (varão)
  const tutor=document.createElementNS(ns,'line');
  tutor.setAttribute('x1',cx+''); tutor.setAttribute('y1',cy+'');
  tutor.setAttribute('x2',cx+''); tutor.setAttribute('y2',_svgN(cy-sH)+'');
  tutor.setAttribute('stroke','#8a6040'); tutor.setAttribute('stroke-width','2');
  tutor.setAttribute('stroke-dasharray','4,3'); tutor.setAttribute('opacity','0.6');
  gS.appendChild(tutor);
  // Caule principal (curvo)
  const mp=document.createElementNS(ns,'path');
  mp.setAttribute('d',`M${cx},${cy} C${cx-15},${_svgN(cy-sH*0.4)} ${cx+10},${_svgN(cy-sH*0.7)} ${cx-5},${_svgN(cy-sH)}`);
  mp.setAttribute('stroke','#3a7a1a'); mp.setAttribute('stroke-width','2.5');
  mp.setAttribute('fill','none'); mp.setAttribute('opacity','0.9');
  gS.appendChild(mp);
  // Folhas
  if (h>0.1) {
    const lc=h>0.6?'#3d8c14':'#5aaa28';
    [[cx-18,_svgN(cy-sH*0.30)],[cx+14,_svgN(cy-sH*0.52)],[cx-12,_svgN(cy-sH*0.72)],[cx+8,_svgN(cy-sH*0.88)]].forEach(([lx,ly]) => {
      _drawSimpleLeaf(ns,gL,lx,ly,h,lc,18+8*h,7+3*h);
    });
  }
  // Frutos (círculos vermelhos)
  if (yld>2 && h>0.3) {
    const nFr=Math.min(6,Math.round(yld/8)+1);
    const frOp=Math.min(1,yld/40);
    const frR=5+4*Math.min(1,yld/80);
    [[cx-20,_svgN(cy-sH*0.42)],[cx+18,_svgN(cy-sH*0.60)],[cx-14,_svgN(cy-sH*0.78)],[cx+10,_svgN(cy-sH*0.92)],[cx-8,_svgN(cy-sH*0.25)],[cx+22,_svgN(cy-sH*0.35)]].slice(0,nFr).forEach(([fx,fy]) => {
      const fr=document.createElementNS(ns,'circle');
      fr.setAttribute('cx',fx+''); fr.setAttribute('cy',fy+'');
      fr.setAttribute('r',_svgN(frR)+''); fr.setAttribute('fill','#e53935');
      fr.setAttribute('stroke','#b71c1c'); fr.setAttribute('stroke-width','0.5');
      fr.setAttribute('opacity',frOp.toFixed(2)); gF.appendChild(fr);
      // Brilho
      const sh=document.createElementNS(ns,'circle');
      sh.setAttribute('cx',_svgN(fx-frR*0.3)+''); sh.setAttribute('cy',_svgN(fy-frR*0.3)+'');
      sh.setAttribute('r',_svgN(frR*0.3)+''); sh.setAttribute('fill','rgba(255,255,255,0.35)');
      sh.setAttribute('opacity',frOp.toFixed(2)); gF.appendChild(sh);
    });
  }
}

function _drawBanana(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(185,height*0.40);
  const sW=10+6*Math.min(1,height/450);
  // Pseudocaule (cilindro)
  const ps=document.createElementNS(ns,'path');
  const op=Math.min(1,h+0.15);
  ps.setAttribute('d',`M${cx-sW},${cy} L${cx-sW*0.7},${_svgN(cy-sH)} Q${cx},${_svgN(cy-sH-4)} ${cx+sW*0.7},${_svgN(cy-sH)} L${cx+sW},${cy} Z`);
  ps.setAttribute('fill','#7aab38'); ps.setAttribute('stroke','#4a7a18');
  ps.setAttribute('stroke-width','0.8'); ps.setAttribute('opacity',op+''); gS.appendChild(ps);
  // Listras no pseudocaule
  for(let k=0;k<3;k++){
    const kx=cx-sW*0.5+k*sW*0.45;
    const kl=document.createElementNS(ns,'line');
    kl.setAttribute('x1',_svgN(kx)+''); kl.setAttribute('y1',cy+'');
    kl.setAttribute('x2',_svgN(kx*0.7+cx*0.3)+''); kl.setAttribute('y2',_svgN(cy-sH)+'');
    kl.setAttribute('stroke','#5a8a20'); kl.setAttribute('stroke-width','0.5');
    kl.setAttribute('opacity','0.5'); gS.appendChild(kl);
  }
  // Folhas grandes
  if (h>0.1) {
    [[-1.1,-0.95,0.7],[-0.5,-1.0,0.9],[0.5,-1.05,0.9],[1.2,-0.92,0.7]].forEach(([ax,ay,sc]) => {
      const llx=cx+ax*55*Math.min(1,h+0.2)*sc;
      const lly=_svgN(cy-sH+ay*30*Math.min(1,h+0.2)*sc);
      const leaf=document.createElementNS(ns,'path');
      const mx=cx+(llx-cx)*0.5, my=_svgN(cy-sH+(lly-cy+sH)*0.5+8);
      leaf.setAttribute('d',
        `M${cx},${_svgN(cy-sH)} Q${mx-8},${_svgN(my-12)} ${llx},${lly} Q${mx+8},${_svgN(my+4)} ${cx},${_svgN(cy-sH)} Z`);
      leaf.setAttribute('fill',h>0.6?'#3a7a12':'#5a9a28');
      leaf.setAttribute('stroke','#2a5a08'); leaf.setAttribute('stroke-width','0.6');
      leaf.setAttribute('opacity',Math.min(1,h+0.2)+''); gL.appendChild(leaf);
    });
  }
  // Cacho
  if (yld>1 && h>0.35) {
    const bOp=Math.min(1,yld/12);
    const bSc=Math.min(1,yld/20);
    const bunch=document.createElementNS(ns,'ellipse');
    bunch.setAttribute('cx',_svgN(cx+18)+''); bunch.setAttribute('cy',_svgN(cy-sH-20-15*bSc)+'');
    bunch.setAttribute('rx',_svgN(12+10*bSc)+''); bunch.setAttribute('ry',_svgN(6+5*bSc)+'');
    bunch.setAttribute('fill','#f9a825'); bunch.setAttribute('stroke','#e65100');
    bunch.setAttribute('stroke-width','0.7'); bunch.setAttribute('opacity',bOp.toFixed(2));
    gF.appendChild(bunch);
    // Dedos da banana
    for(let b=0;b<Math.min(5,Math.round(2+4*bSc));b++){
      const bd=document.createElementNS(ns,'path');
      const bx=_svgN(cx+8+b*5);
      const by=_svgN(cy-sH-14-12*bSc-b*3);
      bd.setAttribute('d',`M${bx},${by} Q${_svgN(bx+4)},${_svgN(by-8)} ${_svgN(bx+2)},${_svgN(by-14)}`);
      bd.setAttribute('stroke','#fbc02d'); bd.setAttribute('stroke-width','4');
      bd.setAttribute('stroke-linecap','round'); bd.setAttribute('fill','none');
      bd.setAttribute('opacity',bOp.toFixed(2)); gF.appendChild(bd);
    }
  }
}

function _drawAbacaxi(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(55,height*0.55);
  // Roseta de folhas (espinhosas)
  if (h>0.08) {
    const nL=h>0.6?12:h>0.35?8:5;
    const lLen=20+30*Math.min(1,h+0.1);
    for(let i=0;i<nL;i++){
      const ang=(i/nL)*2*Math.PI-Math.PI/2;
      const ex=cx+Math.cos(ang)*lLen;
      const ey=_svgN(cy-4+Math.sin(ang)*lLen*0.55);
      const leaf=document.createElementNS(ns,'path');
      leaf.setAttribute('d',`M${cx},${cy} Q${_svgN(cx+Math.cos(ang)*lLen*0.5)},${_svgN(cy+Math.sin(ang)*lLen*0.3-8)} ${ex},${ey}`);
      leaf.setAttribute('stroke',h>0.6?'#2d7a1a':'#4a9a2e');
      leaf.setAttribute('stroke-width',_svgN(2+1.5*Math.min(1,h+0.1))+'');
      leaf.setAttribute('fill','none'); leaf.setAttribute('stroke-linecap','round');
      leaf.setAttribute('opacity',Math.min(1,h+0.15)+''); gL.appendChild(leaf);
    }
  }
  // Fruto (pera/ananás)
  if (yld>1 && h>0.3) {
    const frOp=Math.min(1,yld/30);
    const frSc=Math.min(1,yld/40);
    const fry=_svgN(cy-sH-20-25*frSc);
    // Corpo do fruto
    const body=document.createElementNS(ns,'path');
    body.setAttribute('d',
      `M${_svgN(cx-9-8*frSc)},${_svgN(fry+20)} Q${_svgN(cx-14-10*frSc)},${fry} ${cx},${_svgN(fry-15-12*frSc)} Q${_svgN(cx+14+10*frSc)},${fry} ${_svgN(cx+9+8*frSc)},${_svgN(fry+20)} Z`);
    body.setAttribute('fill','#ff8f00'); body.setAttribute('stroke','#e65100');
    body.setAttribute('stroke-width','0.8'); body.setAttribute('opacity',frOp.toFixed(2));
    gF.appendChild(body);
    // Escamas (padrão hexagonal)
    if (frSc>0.3) {
      for(let r=0;r<3;r++) for(let c=0;c<3;c++) {
        const sx=_svgN(cx-8+c*8), sy=_svgN(fry+2+r*7);
        const sc2=document.createElementNS(ns,'ellipse');
        sc2.setAttribute('cx',sx+''); sc2.setAttribute('cy',sy+'');
        sc2.setAttribute('rx','3.5'); sc2.setAttribute('ry','3');
        sc2.setAttribute('fill','none'); sc2.setAttribute('stroke','#bf360c');
        sc2.setAttribute('stroke-width','0.5'); sc2.setAttribute('opacity',(frOp*0.6).toFixed(2));
        gF.appendChild(sc2);
      }
    }
    // Coroa do abacaxi
    [[-8,-22],[-4,-28],[0,-30],[4,-28],[8,-22]].forEach(([lx,ly]) => {
      const cl=document.createElementNS(ns,'line');
      cl.setAttribute('x1',cx+''); cl.setAttribute('y1',_svgN(fry-15-12*frSc)+'');
      cl.setAttribute('x2',_svgN(cx+lx)+''); cl.setAttribute('y2',_svgN(fry-15-12*frSc+ly)+'');
      cl.setAttribute('stroke','#33691e'); cl.setAttribute('stroke-width','1.8');
      cl.setAttribute('stroke-linecap','round'); cl.setAttribute('opacity',frOp.toFixed(2));
      gF.appendChild(cl);
    });
  }
}

function _drawMelancia(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  // Rama rasteira (vine)
  if (h>0.05) {
    const vine=document.createElementNS(ns,'path');
    vine.setAttribute('d',`M${cx},${cy} C${cx-40},${_svgN(cy-15)} ${cx-70},${_svgN(cy-5)} ${cx-85},${_svgN(cy-8)}`);
    vine.setAttribute('stroke','#5a8a20'); vine.setAttribute('stroke-width','2');
    vine.setAttribute('fill','none'); vine.setAttribute('opacity','0.8'); gS.appendChild(vine);
    const vine2=document.createElementNS(ns,'path');
    vine2.setAttribute('d',`M${cx},${cy} C${cx+35},${_svgN(cy-12)} ${cx+65},${_svgN(cy-8)} ${cx+80},${_svgN(cy-6)}`);
    vine2.setAttribute('stroke','#5a8a20'); vine2.setAttribute('stroke-width','2');
    vine2.setAttribute('fill','none'); vine2.setAttribute('opacity','0.8'); gS.appendChild(vine2);
  }
  // Folhas
  if (h>0.1) {
    const lc=h>0.6?'#2e7a08':'#5aaa28';
    [[-50,-18],[-30,-20],[20,-18],[55,-16],[-10,-16],[35,-20]].slice(0,Math.min(6,Math.round(h*8))).forEach(([ox,oy]) => {
      _drawLobeLeaf(ns,gL,cx+ox,_svgN(cy+oy),lc,14+8*h,h);
    });
  }
  // Fruto (melancia redonda com listras)
  if (yld>2 && h>0.25) {
    const frOp=Math.min(1,yld/30);
    const frR=12+12*Math.min(1,yld/60);
    const frX=_svgN(cx-25), frY=_svgN(cy-frR-2);
    const fb=document.createElementNS(ns,'ellipse');
    fb.setAttribute('cx',frX+''); fb.setAttribute('cy',frY+'');
    fb.setAttribute('rx',_svgN(frR)+''); fb.setAttribute('ry',_svgN(frR*0.88)+'');
    fb.setAttribute('fill','#2e7d32'); fb.setAttribute('stroke','#1b5e20');
    fb.setAttribute('stroke-width','0.8'); fb.setAttribute('opacity',frOp.toFixed(2));
    gF.appendChild(fb);
    // Listras
    for(let s=0;s<5;s++){
      const sa=(s/4-0.5)*1.4;
      const sl=document.createElementNS(ns,'path');
      const slx1=_svgN(frX+Math.sin(sa)*frR*0.85);
      const sly1=_svgN(frY-Math.cos(sa)*frR*0.82);
      const slx2=_svgN(frX+Math.sin(sa)*frR*0.88);
      const sly2=_svgN(frY+Math.cos(sa)*frR*0.8);
      sl.setAttribute('d',`M${slx1},${sly1} Q${_svgN(frX+Math.sin(sa)*frR*1.0)},${frY} ${slx2},${sly2}`);
      sl.setAttribute('stroke','#1b5e20'); sl.setAttribute('stroke-width','1.2');
      sl.setAttribute('fill','none'); sl.setAttribute('opacity',(frOp*0.7).toFixed(2));
      gF.appendChild(sl);
    }
    // Brilho
    const glw=document.createElementNS(ns,'ellipse');
    glw.setAttribute('cx',_svgN(frX-frR*0.35)+''); glw.setAttribute('cy',_svgN(frY-frR*0.32)+'');
    glw.setAttribute('rx',_svgN(frR*0.28)+''); glw.setAttribute('ry',_svgN(frR*0.18)+'');
    glw.setAttribute('fill','rgba(255,255,255,0.25)'); glw.setAttribute('opacity',frOp.toFixed(2));
    gF.appendChild(glw);
  }
}

// Folha palmada (mandioca)
function _drawPalmLeaf(ns,g,cx,cy,h,col,dir,nL,len,wid) {
  const petL=10+6*h, petDx=(dir===0?0:dir*0.3), petDy=-1;
  const mag=Math.sqrt(petDx*petDx+1), pNx=petDx/mag, pNy=-1/mag;
  const pex=cx+pNx*petL, pey=cy+pNy*petL;
  const pet=document.createElementNS(ns,'line');
  pet.setAttribute('x1',_svgN(cx)+''); pet.setAttribute('y1',_svgN(cy)+'');
  pet.setAttribute('x2',_svgN(pex)+''); pet.setAttribute('y2',_svgN(pey)+'');
  pet.setAttribute('stroke',col); pet.setAttribute('stroke-width','1.5');
  pet.setAttribute('opacity',Math.min(1,h+0.15)+''); g.appendChild(pet);
  const base=Math.atan2(pNy,pNx);
  for(let i=0;i<nL;i++){
    const t2=nL>1?i/(nL-1):0.5;
    const ang=base+(t2-0.5)*160*Math.PI/180;
    const ex=pex+Math.cos(ang)*len, ey=pey+Math.sin(ang)*len;
    const perp=ang+Math.PI/2;
    const lx1=pex+Math.cos(perp)*wid*0.5, ly1=pey+Math.sin(perp)*wid*0.5;
    const lx2=pex-Math.cos(perp)*wid*0.5, ly2=pey-Math.sin(perp)*wid*0.5;
    const cpx=pex+Math.cos(ang)*len*0.5+Math.cos(perp)*wid*0.4;
    const cpy=pey+Math.sin(ang)*len*0.5+Math.sin(perp)*wid*0.4;
    const lobe=document.createElementNS(ns,'path');
    lobe.setAttribute('d',
      `M${_svgN(lx1)},${_svgN(ly1)} Q${_svgN(cpx+Math.cos(perp)*wid*0.3)},${_svgN(cpy+Math.sin(perp)*wid*0.3)} ${_svgN(ex)},${_svgN(ey)} Q${_svgN(cpx-Math.cos(perp)*wid*0.3)},${_svgN(cpy-Math.sin(perp)*wid*0.3)} ${_svgN(lx2)},${_svgN(ly2)} Z`);
    lobe.setAttribute('fill',col); lobe.setAttribute('stroke','#1a5008');
    lobe.setAttribute('stroke-width','0.5'); lobe.setAttribute('opacity',Math.min(1,h+0.15)+'');
    g.appendChild(lobe);
  }
}

function _drawSimpleLeaf(ns,g,cx,cy,h,col,len,wid) {
  const l=document.createElementNS(ns,'path');
  l.setAttribute('d',`M${cx},${cy} Q${_svgN(cx-wid)},${_svgN(cy-len*0.5)} ${cx},${_svgN(cy-len)} Q${_svgN(cx+wid)},${_svgN(cy-len*0.5)} ${cx},${cy} Z`);
  l.setAttribute('fill',col); l.setAttribute('stroke','#1a5008');
  l.setAttribute('stroke-width','0.5'); l.setAttribute('opacity',Math.min(1,h+0.15)+'');
  g.appendChild(l);
}

function _drawLobeLeaf(ns,g,cx,cy,col,size,h) {
  const lobes=[-0.5,0,0.5];
  lobes.forEach(off => {
    const ang=(off-0.5)*Math.PI*0.7;
    const ex=cx+Math.cos(ang)*size, ey=_svgN(cy+Math.sin(ang)*size*0.6);
    const l=document.createElementNS(ns,'path');
    l.setAttribute('d',`M${cx},${cy} Q${_svgN(cx+Math.cos(ang)*size*0.5-4)},${_svgN(cy+Math.sin(ang)*size*0.3-4)} ${ex},${ey} Q${_svgN(cx+Math.cos(ang)*size*0.5+4)},${_svgN(cy+Math.sin(ang)*size*0.3+4)} ${cx},${cy} Z`);
    l.setAttribute('fill',col); l.setAttribute('stroke','#1a5008');
    l.setAttribute('stroke-width','0.5'); l.setAttribute('opacity',Math.min(1,h+0.12)+'');
    g.appendChild(l);
  });
}

/* ─────────── GRÁFICOS ─────────── */
function _updateCrescCharts(result, crop, cropKey) {
  const months = result.months;
  const labels = months.map(m => 'M'+m.m);
  const cropColor = crop.cor;

  const _destroyAndCreate = (key, canvasId, config) => {
    if (_crescCharts[key]) { try { _crescCharts[key].destroy(); } catch(e){} }
    const el = document.getElementById(canvasId);
    if (!el) return;
    _crescCharts[key] = new Chart(el, config);
  };

  // Biomassa + LAI
  _destroyAndCreate('bio', 'cresc-chart-bio', {
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'Biomassa total (t/ha MS)', data:months.map(m=>m.bmTotal), borderColor:cropColor, backgroundColor:cropColor+'22', fill:true, tension:.35, pointRadius:2 },
        { label:crop.isFruitCrop?'Fruto/produto (t/ha MF)':'Raízes (t/ha MF)', data:months.map(m=>m.freshYield/4), borderColor:'#e97c2a', borderDash:[5,3], backgroundColor:'transparent', tension:.35, pointRadius:2 },
        { label:'LAI', data:months.map(m=>m.lai), borderColor:'#60a5fa', backgroundColor:'transparent', yAxisID:'y2', tension:.35, pointRadius:2 },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{labels:{font:{size:9},boxWidth:8}}},
      scales:{
        x:{ticks:{font:{size:9}}},
        y:{beginAtZero:true, ticks:{font:{size:9}}, title:{display:true,text:'t/ha',font:{size:8}}},
        y2:{position:'right', beginAtZero:true, max:8, ticks:{font:{size:9}}, grid:{drawOnChartArea:false}, title:{display:true,text:'LAI',font:{size:8}}},
      }
    }
  });

  // NPK
  _destroyAndCreate('npk', 'cresc-chart-npk', {
    type:'bar',
    data:{
      labels,
      datasets:[
        { label:'N (kg/ha)', data:months.map(m=>m.absN), backgroundColor:'rgba(59,109,17,0.72)' },
        { label:'P (kg/ha)', data:months.map(m=>m.absP), backgroundColor:'rgba(186,117,23,0.72)' },
        { label:'K (kg/ha)', data:months.map(m=>m.absK), backgroundColor:'rgba(24,95,165,0.72)' },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{labels:{font:{size:9},boxWidth:8}}},
      scales:{x:{ticks:{font:{size:9}}}, y:{beginAtZero:true,ticks:{font:{size:9}}}}
    }
  });

  // Distribuição (donut)
  const last = months[months.length-1];
  const distData = crop.isFruitCrop
    ? [Math.round(last.fruitFrac*100), Math.round(last.stemFrac*100), Math.round(last.leafFrac*100), Math.round(last.rootFrac*100)]
    : [Math.round(last.rootFrac*100), Math.round(last.stemFrac*100), Math.round(last.leafFrac*100)];
  const distLabels = crop.isFruitCrop
    ? ['Fruto/produto','Caule','Folhas','Raízes']
    : ['Raízes','Caule','Folhas'];
  const distColors = crop.isFruitCrop
    ? [cropColor,'#8B4513','#3b6d11','#8a5020']
    : [cropColor,'#8B4513','#3b6d11'];

  _destroyAndCreate('dist', 'cresc-chart-dist', {
    type:'doughnut',
    data:{labels:distLabels, datasets:[{data:distData, backgroundColor:distColors, borderWidth:2, borderColor:'#fff'}]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{position:'bottom', labels:{font:{size:9},boxWidth:8}}}
    }
  });

  // Radar fatores
  const f = result.f;
  _destroyAndCreate('radar', 'cresc-chart-radar', {
    type:'radar',
    data:{
      labels:['Temperatura','Água','Nitrogênio','Fósforo','Potássio','pH','Radiação','M. Orgânica','Pragas'],
      datasets:[{
        label:'Fator limitante (0-100)',
        data:[f.fTemp,f.fWater,f.fN,f.fP,f.fK,f.fPH,f.fRad,f.fMO,f.fPraga].map(v=>+(v*100).toFixed(0)),
        backgroundColor:cropColor+'30', borderColor:cropColor, pointBackgroundColor:cropColor, pointRadius:3,
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      scales:{r:{min:0,max:100, ticks:{stepSize:25,font:{size:8}}, pointLabels:{font:{size:8}}}},
      plugins:{legend:{display:false}}
    }
  });
}

/* ─────────── TABELA CRONOGRAMA ─────────── */
function _updateCrescTable(result, crop, cropKey) {
  const thead = document.getElementById('cresc-tbl-head');
  const tbody = document.getElementById('cresc-tbl-body');
  if (!thead || !tbody) return;

  const yieldLabel = crop.isFruitCrop ? 'Fruto (t/ha MF)' : 'Raízes (t/ha MF)';
  thead.innerHTML = `<tr style="background:var(--bg3)">
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">Mês</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">Fase</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">Altura (cm)</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">Biomassa (t/ha MS)</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">${yieldLabel}</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">N (kg/ha)</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">P (kg/ha)</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">K (kg/ha)</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">LAI</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">Saúde</th>
    <th style="padding:5px 7px;text-align:left;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">Recomendação</th>
  </tr>`;

  tbody.innerHTML = '';
  result.months.forEach((m, i) => {
    const isHarvest = (m.m === result.ciclo);
    const hColor = m.health>70?'#15803d':m.health>40?'#d97706':'#dc2626';
    const phase = crop.fases[Math.min(i, crop.fases.length-1)];
    const rec   = crop.recs[Math.min(i, crop.recs.length-1)];
    const tr = document.createElement('tr');
    if (isHarvest) tr.style.background='var(--bg3)';
    tr.innerHTML = `
      <td style="padding:4px 7px;border-bottom:1px solid var(--border);font-weight:600"><strong>${m.m}</strong></td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border)">${phase}</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border)">${m.height}</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border)">${m.bmTotal}</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border)">${m.freshYield}</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border)">${m.absN}</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border)">${m.absP}</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border)">${m.absK}</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border)">${m.lai}</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border);color:${hColor};font-weight:600">${m.health}%</td>
      <td style="padding:4px 7px;border-bottom:1px solid var(--border);font-size:10px;color:var(--text3)">${isHarvest?'🌾 ':''}${rec}</td>
    `;
    tbody.appendChild(tr);
  });
}
