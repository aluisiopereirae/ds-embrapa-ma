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
    nome:'Mandioca', icon:'🌿', cor:'#639922', cropType:'root',
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
    recN:100, recP:60, recK:150, recS:20, mesIdeal:3, tblStep:1,
  },
  tomate: {
    nome:'Tomate', icon:'🍅', cor:'#e53935', cropType:'shrub',
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
    recN:160, recP:100, recK:210, recS:25, mesIdeal:7, tblStep:1,
  },
  banana: {
    nome:'Banana', icon:'🍌', cor:'#f9a825', cropType:'shrub',
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
    recN:220, recP:45, recK:450, recS:20, mesIdeal:3, tblStep:1,
  },
  abacaxi: {
    nome:'Abacaxi', icon:'🍍', cor:'#ff8f00', cropType:'shrub',
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
    recN:30, recP:18, recK:50, recS:8, mesIdeal:5, tblStep:1,
  },
  melancia: {
    nome:'Melancia', icon:'🍉', cor:'#2e7d32', cropType:'vine',
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
    recN:100, recP:80, recK:130, recS:15, mesIdeal:3, tblStep:1,
  },
  feijao: {
    nome:'Feijão-Caupi', icon:'🫘', cor:'#795548', cropType:'legume',
    nomeCientifico:'Vigna unguiculata (L.) Walp.',
    cicloBase:3, tempOpt:27, tempMin:18, tempMax:38,
    aguaOpt:80, pHOtimo:[5.5,7.0], espOpt:0.15,
    NOptimo:40, POptimo:40, KOptimo:40, SOptimo:10,
    prodMin:0.8, prodMax:3.5, alturaMax:60, unidade:'t/ha (grãos)',
    bmPotencial:5.5, convFreshFactor:1.0, isFruitCrop:true,
    variedades:[
      {nome:'BRS Guariba (Embrapa)', ciclo:3, prodFator:1.0, tempOpt:27},
      {nome:'BRS Tumucumaque', ciclo:3, prodFator:1.05, tempOpt:27},
      {nome:'BRS Pujante', ciclo:3, prodFator:0.95, tempOpt:28},
    ],
    extraLabel:['Proteína (%)', 'Peso de 100 grãos (g)'],
    extraCalc:(p,fG)=>[+(22+3*fG).toFixed(1), +(16+4*fG).toFixed(1)],
    fases:['Semeadura/emergência','Crescimento vegetativo','Florescimento','Frutificação/enchimento','Maturação','Colheita'],
    recs:['Semeadura direta; calagem se pH<5.5; adubação P+K base','Manter umidade; capinas; controle de trips','Monitorar mosca-branca; adubação K leve','Irrigação regular; controle de fungos e pragas','Reduzir irrigação; avaliar maturidade (vagens secas)','Colheita manual ou mecânica; armazenamento seco'],
    refs:'Embrapa Meio-Norte; Freire Filho et al. (2011); ZARC Feijão-Caupi MA; FAO Legume Crops',
    defaultN:20, defaultP:40, defaultK:40, defaultS:10, defaultEsp:0.15,
    recN:40, recP:40, recK:40, recS:10, mesIdeal:3, tblStep:1,
  },
  milho: {
    nome:'Milho', icon:'🌽', cor:'#f9a825', cropType:'cereal',
    nomeCientifico:'Zea mays L.',
    cicloBase:4, tempOpt:25, tempMin:15, tempMax:38,
    aguaOpt:120, pHOtimo:[5.5,7.0], espOpt:0.15,
    NOptimo:150, POptimo:80, KOptimo:80, SOptimo:20,
    prodMin:3, prodMax:15, alturaMax:250, unidade:'t/ha (grãos)',
    bmPotencial:12.0, convFreshFactor:1.0, isFruitCrop:true,
    variedades:[
      {nome:'BRS 3046 (Embrapa)', ciclo:4, prodFator:1.0, tempOpt:25},
      {nome:'AG 1051 (Agroceres)', ciclo:4, prodFator:1.05, tempOpt:25},
      {nome:'Milho Crioulo (MA)', ciclo:4, prodFator:0.75, tempOpt:26},
      {nome:'BRS Caatingueiro (semiárido)', ciclo:3, prodFator:0.85, tempOpt:27},
    ],
    extraLabel:['Proteína (%)', 'Umidade na colheita (%)'],
    extraCalc:(p,fG)=>[+(8+4*fG).toFixed(1), +(14+2*(1-fG)).toFixed(1)],
    fases:['Semeadura/emergência','Crescimento vegetativo','Crescimento vegetativo','Florescimento/espigamento','Enchimento de grãos','Maturação fisiológica','Colheita'],
    recs:['Semeadura; calagem prévia; adubação N+P+K base','Controle de plantas daninhas; adubação N (1ª cobertura)','Irrigação regular; monitorar lagarta-do-cartucho','Polinização; estresse hídrico crítico nesta fase','Adubação K; monitorar grãos','Reduzir irrigação; teor de umidade ≈ 18-22%','Colheita quando umidade ≈ 14%; secagem se necessário'],
    refs:'Embrapa Milho e Sorgo; Parentoni et al.; DSSAT-CERES-Maize v4.7; FAO; IBGE-PAM MA',
    defaultN:120, defaultP:70, defaultK:70, defaultS:20, defaultEsp:0.15,
    recN:150, recP:80, recK:80, recS:20, mesIdeal:3, tblStep:1,
  },
  sorgo: {
    nome:'Sorgo', icon:'🌾', cor:'#a1887f', cropType:'cereal',
    nomeCientifico:'Sorghum bicolor (L.) Moench',
    cicloBase:4, tempOpt:27, tempMin:15, tempMax:40,
    aguaOpt:90, pHOtimo:[5.5,7.5], espOpt:0.12,
    NOptimo:100, POptimo:60, KOptimo:60, SOptimo:15,
    prodMin:2, prodMax:8, alturaMax:180, unidade:'t/ha (grãos)',
    bmPotencial:9.0, convFreshFactor:1.0, isFruitCrop:true,
    variedades:[
      {nome:'BRS 310 (Embrapa)', ciclo:4, prodFator:1.0, tempOpt:27},
      {nome:'BR 304', ciclo:4, prodFator:0.95, tempOpt:27},
      {nome:'ADV 0135 (híbrido)', ciclo:4, prodFator:1.05, tempOpt:27},
    ],
    extraLabel:['Tanino (%)', 'Peso de mil grãos (g)'],
    extraCalc:(p,fG)=>[+(0.5+0.5*(1-fG)).toFixed(2), +(22+8*fG).toFixed(1)],
    fases:['Germinação/emergência','Crescimento vegetativo','Crescimento vegetativo','Emborrachamento','Florescimento','Enchimento de grãos','Maturação/colheita'],
    recs:['Semeadura em solo úmido; calagem se pH<5.5','Capina; adubação N 1ª cobertura','Irrigação moderada; resistente à seca','Adubação N 2ª cobertura','Monitorar pulgão-verde; período crítico de água','Avaliar umidade dos grãos; reduzir irrigação','Colheita mecânica; umidade ≤ 14%'],
    refs:'Embrapa Milho e Sorgo; May et al. (2012); DSSAT-CERES-Sorghum; FAO',
    defaultN:80, defaultP:50, defaultK:50, defaultS:15, defaultEsp:0.12,
    recN:100, recP:60, recK:60, recS:15, mesIdeal:3, tblStep:1,
  },
  arroz: {
    nome:'Arroz', icon:'🌾', cor:'#8d6e63', cropType:'cereal',
    nomeCientifico:'Oryza sativa L.',
    cicloBase:4, tempOpt:28, tempMin:18, tempMax:38,
    aguaOpt:180, pHOtimo:[5.0,6.5], espOpt:0.10,
    NOptimo:100, POptimo:60, KOptimo:60, SOptimo:15,
    prodMin:2, prodMax:7, alturaMax:100, unidade:'t/ha (grãos)',
    bmPotencial:8.0, convFreshFactor:1.0, isFruitCrop:true,
    variedades:[
      {nome:'BRS Sertaneja (Embrapa)', ciclo:4, prodFator:1.0, tempOpt:28},
      {nome:'BRS Primavera', ciclo:4, prodFator:0.95, tempOpt:27},
      {nome:'Metica-1', ciclo:4, prodFator:1.05, tempOpt:28},
    ],
    extraLabel:['Teor de amilose (%)', 'Renda de engenho (%)'],
    extraCalc:(p,fG)=>[+(20+4*fG).toFixed(1), +(68+6*fG).toFixed(1)],
    fases:['Semeadura/germinação','Perfilhamento','Perfilhamento','Emborrachamento','Florescimento','Enchimento de grãos','Maturação/colheita'],
    recs:['Semeadura em solos de baixada ou irrigado; pH 5-6.5','Adubação N (1/3); manutenção da lâmina de água','Adubação N (1/3); controle de plantas daninhas aquáticas','Adubação N (1/3 final); monitorar brusone','Manter lâmina de água; período crítico','Reduzir água; avaliar maturidade dos grãos','Colheita mecânica a 20% de umidade; secagem'],
    refs:'Embrapa Arroz e Feijão; Steinmetz et al.; DSSAT-CERES-Rice v4.7; FAO Rice; ZARC Arroz MA',
    defaultN:80, defaultP:50, defaultK:50, defaultS:15, defaultEsp:0.10,
    recN:100, recP:60, recK:60, recS:15, mesIdeal:2, tblStep:1,
  },
  soja: {
    nome:'Soja', icon:'🟢', cor:'#558b2f', cropType:'legume',
    nomeCientifico:'Glycine max (L.) Merr.',
    cicloBase:4, tempOpt:25, tempMin:15, tempMax:35,
    aguaOpt:100, pHOtimo:[6.0,7.0], espOpt:0.10,
    NOptimo:20, POptimo:80, KOptimo:80, SOptimo:20,
    prodMin:2, prodMax:4.5, alturaMax:80, unidade:'t/ha (grãos)',
    bmPotencial:8.5, convFreshFactor:1.0, isFruitCrop:true,
    variedades:[
      {nome:'M 8349 IPRO (Monsoy)', ciclo:4, prodFator:1.0, tempOpt:25},
      {nome:'BRS 8990 IPRO (Embrapa)', ciclo:4, prodFator:1.05, tempOpt:25},
      {nome:'P98R31 (Pioneer)', ciclo:4, prodFator:1.0, tempOpt:25},
    ],
    extraLabel:['Proteína (%)', 'Óleo (%)'],
    extraCalc:(p,fG)=>[+(36+5*fG).toFixed(1), +(20+2*fG).toFixed(1)],
    fases:['Semeadura/emergência','Crescimento vegetativo','Crescimento vegetativo','Florescimento/enchimento','Enchimento de vagens','Maturação','Colheita'],
    recs:['Inoculação com Bradyrhizobium; calagem pH>6; adubação P+K','Controle de plantas daninhas; monitorar mosca-branca','Adubação K leve; controle de percevejos','Período crítico para água; monitorar ferrugem asiática','Monitorar desfolha por lagartas','Reduzir irrigação; avaliar ponto de colheita','Colheita mecânica; umidade 13-14%'],
    refs:'Embrapa Soja; Farias et al. (2009); DSSAT-CROPGRO-Soybean; CONAB; IBGE-PAM MA (MATOPIBA)',
    defaultN:20, defaultP:80, defaultK:80, defaultS:20, defaultEsp:0.10,
    recN:20, recP:80, recK:80, recS:20, mesIdeal:11, tblStep:1,
  },
  fava: {
    nome:'Fava', icon:'🫛', cor:'#6d9e3f', cropType:'legume',
    nomeCientifico:'Phaseolus lunatus L.',
    cicloBase:4, tempOpt:24, tempMin:15, tempMax:34,
    aguaOpt:80, pHOtimo:[5.5,7.0], espOpt:0.20,
    NOptimo:30, POptimo:40, KOptimo:40, SOptimo:10,
    prodMin:0.8, prodMax:2.5, alturaMax:80, unidade:'t/ha (grãos secos)',
    bmPotencial:4.5, convFreshFactor:1.0, isFruitCrop:true,
    variedades:[
      {nome:'Fava Larga (MA)', ciclo:4, prodFator:1.0, tempOpt:24},
      {nome:'BRS Juriti (Embrapa)', ciclo:4, prodFator:1.05, tempOpt:24},
    ],
    extraLabel:['Proteína (%)', 'Peso de 100 sementes (g)'],
    extraCalc:(p,fG)=>[+(21+4*fG).toFixed(1), +(80+40*fG).toFixed(1)],
    fases:['Semeadura/emergência','Crescimento vegetativo','Crescimento vegetativo','Florescimento','Enchimento de vagens','Maturação','Colheita'],
    recs:['Semeadura no início das chuvas; calagem; adubação P+K','Capinas; inoculação com Rhizobium','Monitorar pulgões e mosca-branca; adubação foliar','Irrigação moderada; controle de antracnose','Adubação K; monitorar ácaros','Reduzir irrigação; avaliar secagem natural','Colheita manual; trilha; armazenamento seco'],
    refs:'Embrapa Meio-Norte; Vieira et al. (2015); FAO Phaseolus; IBGE-MA',
    defaultN:20, defaultP:40, defaultK:40, defaultS:10, defaultEsp:0.20,
    recN:30, recP:40, recK:40, recS:10, mesIdeal:3, tblStep:1,
  },
  cana: {
    nome:'Cana-de-açúcar', icon:'🎋', cor:'#388e3c', cropType:'cane',
    nomeCientifico:'Saccharum officinarum L.',
    cicloBase:18, tempOpt:28, tempMin:18, tempMax:40,
    aguaOpt:140, pHOtimo:[5.5,7.0], espOpt:0.6,
    NOptimo:120, POptimo:60, KOptimo:150, SOptimo:25,
    prodMin:50, prodMax:130, alturaMax:400, unidade:'t/ha (colmos frescos)',
    bmPotencial:25.0, convFreshFactor:5.5, isFruitCrop:false,
    variedades:[
      {nome:'RB92579 (Ridesa)', ciclo:18, prodFator:1.0, tempOpt:28},
      {nome:'RB867515', ciclo:18, prodFator:1.05, tempOpt:28},
      {nome:'SP80-3280', ciclo:18, prodFator:0.9, tempOpt:27},
    ],
    extraLabel:['Pol (% açúcar)', 'Fibra (%)'],
    extraCalc:(p,fG)=>[+(12+3*fG).toFixed(1), +(12+1.5*(1-fG)).toFixed(1)],
    fases:['Plantio das mudas (toletes)','Brotação/perfilhamento','Perfilhamento','Crescimento vegetativo','Crescimento rápido','Crescimento rápido','Crescimento rápido','Grand period de crescimento','Grand period de crescimento','Crescimento acelerado','Crescimento acelerado','Maturação','Maturação','Maturação','Pré-colheita','Pré-colheita','Colheita','Ratoon (soqueira)'],
    recs:['Plantio dos toletes em sulcos; adubação P+K base','Manutenção da umidade; capinas','Adubação N+K em cobertura (1ª dose)','Monitorar brocas (Diatraea); controle herbicida','Adubação N (2ª dose); irrigação regular','Controle de pulgão-do-colmo','Monitorar podridão-vermelha','Irrigação plena; máxima demanda hídrica','Adubação foliar micronutrientes','Monitorar maturação antecipada','Iniciar estresse hídrico para concentrar sacarose','Período de maturação; reduzir nitrogênio','Queima ou corte verde; colheita mecânica','Adubação da soqueira (ratoon)','Controle de plantas daninhas no ratoon','Monitorar saúde do ratoon','Colheita mecânica no ponto de máx açúcar','Rebrota da soqueira; nova safra'],
    refs:'Embrapa Agroenergia; Consecana; DSSAT-CANEGRO; Doorenbos & Kassam (FAO); UNICA (2022)',
    defaultN:100, defaultP:50, defaultK:120, defaultS:25, defaultEsp:0.6,
    recN:120, recP:60, recK:150, recS:25, mesIdeal:5, tblStep:2,
  },
  bacuri: {
    nome:'Bacuri', icon:'🟡', cor:'#f9a825', cropType:'tree',
    nomeCientifico:'Platonia insignis Mart.',
    cicloBase:60, tempOpt:27, tempMin:18, tempMax:35,
    aguaOpt:200, pHOtimo:[5.0,6.5], espOpt:25.0,
    NOptimo:60, POptimo:20, KOptimo:80, SOptimo:15,
    prodMin:5, prodMax:15, alturaMax:2500, unidade:'t/ha (frutos frescos)',
    bmPotencial:7.0, convFreshFactor:5.5, isFruitCrop:true,
    variedades:[
      {nome:'Ecótipo Caatinga (MA)', ciclo:60, prodFator:1.0, tempOpt:27},
      {nome:'Ecótipo Cocais', ciclo:72, prodFator:0.88, tempOpt:26},
    ],
    extraLabel:['Teor de polpa (%)', 'Brix da polpa (°Bx)'],
    extraCalc:(p,fG)=>[+(30+15*fG).toFixed(1), +(14+6*fG).toFixed(1)],
    fases:['Plantio/estabelecimento','Crescimento inicial','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Formação da copa','Maturação reprodutiva','Florescimento','Frutificação','Maturação/colheita','Produção plena','Colheita'],
    recs:['Plantio em área florestada; espaçamento 5×5m; calagem leve','Cobertura morta; irrigação nos secos','Adubação NPK leve; controle de formigas','Poda de formação; controle de pragas','Manejo sustentável; coleta de frutos nativos','Proteção da regeneração natural','Adubação de manutenção; monitorar floração','Período chuvoso favorece floração','Monitorar desenvolvimento dos frutos','Colheita manual (frutos caem quando maduros)','Comercialização da polpa e sementes (garcinol)','Produção sustentada; manejo agroflorestal'],
    refs:'Embrapa Amazônia Oriental; Mota et al. (2002); Lorenzi (2009); CIFOR Bacuri; Bioeconomia MA',
    defaultN:40, defaultP:15, defaultK:60, defaultS:15, defaultEsp:25.0,
    recN:60, recP:20, recK:80, recS:15, mesIdeal:2, tblStep:6,
  },
  pequi: {
    nome:'Pequi', icon:'🟤', cor:'#e65100', cropType:'tree',
    nomeCientifico:'Caryocar brasiliense Camb.',
    cicloBase:48, tempOpt:26, tempMin:16, tempMax:38,
    aguaOpt:100, pHOtimo:[4.5,6.0], espOpt:25.0,
    NOptimo:40, POptimo:15, KOptimo:60, SOptimo:10,
    prodMin:3, prodMax:10, alturaMax:1000, unidade:'t/ha (frutos com caroço)',
    bmPotencial:5.5, convFreshFactor:4.0, isFruitCrop:true,
    variedades:[
      {nome:'Ecótipo Cerrado MA', ciclo:48, prodFator:1.0, tempOpt:26},
      {nome:'Ecótipo sul do MA', ciclo:60, prodFator:0.85, tempOpt:25},
    ],
    extraLabel:['Teor de gordura (%)','Carotenoides (µg/g)'],
    extraCalc:(p,fG)=>[+(36+10*fG).toFixed(1), +(850+350*fG).toFixed(0)],
    fases:['Plantio/brotação','Crescimento inicial','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Crescimento produtivo','Emissão das flores','Florescimento (estação seca)','Frutificação','Maturação','Colheita dos frutos','Produção plena'],
    recs:['Plantio em solos de cerrado; espaçamento 5×5m; sem calagem excessiva','Manutenção do cerrado nativo ao redor','Sem adubação pesada; espécie adaptada a solos pobres','Poda leve de formação; controle de formigas','Adubação orgânica (esterco); manejo sustentável','Início das chuvas: adubação leve N+K','Período de seca induz floração','Proteger polinizadores nativos (abelhas, borboletas)','Acompanhar desenvolvimento; evitar irrigação excessiva','Frutos maduros em nov-jan; aroma característico','Colheita dos frutos caídos; cozinhar ou extrair polpa/óleo','Produção sustentada; importância cultural e nutricional'],
    refs:'Embrapa Cerrados; Vera et al. (2009); EMBRAPA CPAC; Lorenzi (2008); Souza & Vieira (2022)',
    defaultN:20, defaultP:10, defaultK:40, defaultS:10, defaultEsp:25.0,
    recN:40, recP:15, recK:60, recS:10, mesIdeal:11, tblStep:6,
  },
  acai: {
    nome:'Açaí', icon:'🟣', cor:'#6a1b9a', cropType:'palm',
    nomeCientifico:'Euterpe oleracea Mart.',
    cicloBase:36, tempOpt:27, tempMin:18, tempMax:38,
    aguaOpt:250, pHOtimo:[5.5,6.5], espOpt:4.0,
    NOptimo:100, POptimo:30, KOptimo:180, SOptimo:20,
    prodMin:10, prodMax:25, alturaMax:1200,
    unidade:'t/ha (cachos frescos)',
    bmPotencial:10.0, convFreshFactor:6.0, isFruitCrop:true,
    variedades:[
      {nome:'BRS-Pará (Embrapa)', ciclo:36, prodFator:1.0, tempOpt:27},
      {nome:'BRS-Tajá', ciclo:36, prodFator:0.95, tempOpt:27},
      {nome:'PAR-01 (nativo)', ciclo:40, prodFator:0.85, tempOpt:26},
    ],
    extraLabel:['Antocianinas (mg/g)','Teor lipídico (%)'],
    extraCalc:(p,fGlobal)=>[
      +(15+22*fGlobal).toFixed(1),
      +(8+7*fGlobal).toFixed(1),
    ],
    fases:['Plantio/enraizamento','Crescimento inicial','Formação de perfilhos','Crescimento vegetativo','Crescimento vegetativo','Diferenciação floral','Florescimento','Florescimento','Frutificação','Frutificação','Maturação','Colheita plena'],
    recs:['Plantio em áreas úmidas; espaçamento 4×4m; calagem prévia','Irrigação frequente; sombreamento parcial','Manter 3-4 perfilhos/touceira; adubação N leve','Adubação NPK completa; cobertura morta','Adubação K pesada; controle de curculionídeos','Observar emissão da espata floral; adubação foliar micronutrientes','Polinização entomófila; manter umidade','Adubação foliar K+B; controle antracnose','Monitorar coloração (verde→roxo); adubação K','Amostrar Brix e teor lipídico','Colheita manual dos cachos maduros','Produção contínua 2-3×/ano; poda de manutenção'],
    refs:'Embrapa Amazônia Oriental (2020); Shanley & Medina (2005); Cavalcante (1996); FAO; CIFOR Açaí',
    defaultN:80, defaultP:25, defaultK:150, defaultS:20, defaultEsp:16.0,
    recN:100, recP:30, recK:180, recS:20, mesIdeal:3, tblStep:4,
  },
  cupuacu: {
    nome:'Cupuaçu', icon:'🟤', cor:'#6d4c41', cropType:'tree',
    nomeCientifico:'Theobroma grandiflorum (Willd. ex Spreng.) K.Schum.',
    cicloBase:48, tempOpt:25, tempMin:16, tempMax:35,
    aguaOpt:180, pHOtimo:[5.5,6.5], espOpt:9.0,
    NOptimo:80, POptimo:40, KOptimo:120, SOptimo:15,
    prodMin:8, prodMax:20, alturaMax:800,
    unidade:'t/ha (frutos frescos)',
    bmPotencial:8.5, convFreshFactor:4.5, isFruitCrop:true,
    variedades:[
      {nome:'Coari (Embrapa)', ciclo:48, prodFator:1.0, tempOpt:25},
      {nome:'BRS-Carimbó', ciclo:42, prodFator:1.05, tempOpt:25},
      {nome:'Mamau (nativo)', ciclo:54, prodFator:0.85, tempOpt:24},
    ],
    extraLabel:['Brix da polpa (°Bx)','Peso do fruto (kg)'],
    extraCalc:(p,fGlobal)=>[
      +(8+6*fGlobal).toFixed(1),
      +(0.8+1.2*fGlobal).toFixed(2),
    ],
    fases:['Estabelecimento','Crescimento inicial','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Formação da copa','Crescimento produtivo','Florescimento inicial','Frutificação','Frutificação','Maturação','Colheita plena'],
    recs:['Plantio sombreado; espaçamento 3×3m; calagem','Adubação N leve; cobertura morta; capinas','Podas de formação; controle vassoura-de-bruxa','Adubação NPK completa; poda sanitária','Manutenção da copa; controle de Phytophthora','Adubação K+Ca; proteção das flores','Monitorar Crinipellis perniciosa','Raleio de frutos; controle de fungos','Adubação foliar micronutrientes; colheita quando casca amarelando','Processamento da polpa (congelamento rápido)','Seleção e classificação dos frutos','Produção plena 2ª safra; manejo do sombreamento'],
    refs:'Embrapa Amazônia Oriental (2019); Calzavara et al. (1984); Müller & Calzavara; FAO Non-Wood Forest Products',
    defaultN:60, defaultP:30, defaultK:100, defaultS:15, defaultEsp:9.0,
    recN:80, recP:40, recK:120, recS:15, mesIdeal:2, tblStep:4,
  },
  buriti: {
    nome:'Buriti', icon:'🌴', cor:'#e65100', cropType:'palm',
    nomeCientifico:'Mauritia flexuosa L.f.',
    cicloBase:60, tempOpt:27, tempMin:18, tempMax:38,
    aguaOpt:200, pHOtimo:[5.0,6.5], espOpt:16.0,
    NOptimo:60, POptimo:20, KOptimo:100, SOptimo:15,
    prodMin:5, prodMax:15, alturaMax:2000,
    unidade:'t/ha (frutos frescos)',
    bmPotencial:7.0, convFreshFactor:5.0, isFruitCrop:true,
    variedades:[
      {nome:'Ecótipo de várzea (MA)', ciclo:60, prodFator:1.0, tempOpt:27},
      {nome:'Ecótipo de cerrado', ciclo:72, prodFator:0.85, tempOpt:26},
    ],
    extraLabel:['Carotenoides (mg/g)','Peso do fruto (g)'],
    extraCalc:(p,fGlobal)=>[
      +(30+40*fGlobal).toFixed(1),
      +(18+12*fGlobal).toFixed(1),
    ],
    fases:['Plantio/estabelecimento','Crescimento lento do palmito','Crescimento vegetativo','Crescimento vegetativo','Formação do estipe','Formação do estipe','Crescimento produtivo','Emissão floral','Florescimento','Frutificação','Maturação','Colheita plena'],
    recs:['Plantio em veredas/áreas úmidas; espaçamento 4×4m','Manutenção de umidade; sem adubação N excessiva','Adubação NPK leve anual; controle de pragas','Monitorar desenvolvimento do estipe','Adubação K; manutenção do habitat','Início do período produtivo; adubação de manutenção','Proteger polinizadores (coleópteros)','Emissão da espata; adubação foliar B+Mn','Coleta de pólen; polinização auxiliar','Monitorar amadurecimento (casca escamosa)','Colheita dos cachos (frutos vermelho-alaranjados)','Produção sustentada; poda de folhas secas'],
    refs:'Lorenzi et al. (2010); Shanley & Medina (2005); Balick (1988); Embrapa Cocais; CIFOR Bioeconomia MA',
    defaultN:40, defaultP:15, defaultK:80, defaultS:15, defaultEsp:25.0,
    recN:60, recP:20, recK:100, recS:15, mesIdeal:2, tblStep:6,
  },
  caju: {
    nome:'Cajueiro', icon:'🟡', cor:'#f57f17', cropType:'tree',
    nomeCientifico:'Anacardium occidentale L.',
    cicloBase:30, tempOpt:27, tempMin:18, tempMax:40,
    aguaOpt:80, pHOtimo:[5.5,7.0], espOpt:16.0,
    NOptimo:60, POptimo:30, KOptimo:60, SOptimo:10,
    prodMin:5, prodMax:20, alturaMax:1200,
    unidade:'t/ha (castanhas + pedúnculos)',
    bmPotencial:6.5, convFreshFactor:6.0, isFruitCrop:true,
    variedades:[
      {nome:'CCP-76 (anão precoce)', ciclo:24, prodFator:1.0, tempOpt:28},
      {nome:'BRS-189 (Embrapa)', ciclo:28, prodFator:1.05, tempOpt:27},
      {nome:'Cajueiro comum (tardio)', ciclo:36, prodFator:0.85, tempOpt:27},
    ],
    extraLabel:['Peso da castanha (g)','Brix do pedúnculo (°Bx)'],
    extraCalc:(p,fGlobal)=>[
      +(8+6*fGlobal).toFixed(1),
      +(10+6*fGlobal).toFixed(1),
    ],
    fases:['Plantio/brotação','Crescimento vegetativo','Formação da copa','Formação da copa','Crescimento produtivo','Florescimento (seca)','Florescimento (seca)','Frutificação','Maturação/colheita','Produção plena'],
    recs:['Plantio início das chuvas; espaçamento 8×8m; calagem','Podas de formação; adubação N moderada; capinas','Controle de antracnose (Colletotrichum); adubação NPK','Manutenção da copa; adubação K; controle helopeltis','Adubação pré-floração; estresse hídrico leve','Evitar irrigação excessiva na floração (seca induz floração)','Proteger flores de chuvas; monitorar broca','Colheita dos pedúnculos; proteção das castanhas','Beneficiamento das castanhas; CNPCO Embrapa','Colheita anual; poda de limpeza pós-safra'],
    refs:'Embrapa Agroindústria Tropical (2019); Barros (2002); Mitchell & Mori (1987); FAO Cashew; IBGE-PAM',
    defaultN:50, defaultP:25, defaultK:50, defaultS:10, defaultEsp:16.0,
    recN:60, recP:30, recK:60, recS:10, mesIdeal:7, tblStep:3,
  },
  manga: {
    nome:'Manga', icon:'🥭', cor:'#ff6f00', cropType:'tree',
    nomeCientifico:'Mangifera indica L.',
    cicloBase:36, tempOpt:26, tempMin:15, tempMax:40,
    aguaOpt:100, pHOtimo:[5.5,7.5], espOpt:25.0,
    NOptimo:100, POptimo:40, KOptimo:120, SOptimo:15,
    prodMin:10, prodMax:30, alturaMax:1500,
    unidade:'t/ha (frutos frescos)',
    bmPotencial:9.5, convFreshFactor:7.0, isFruitCrop:true,
    variedades:[
      {nome:'Tommy Atkins', ciclo:36, prodFator:1.0, tempOpt:26},
      {nome:'Palmer', ciclo:36, prodFator:1.05, tempOpt:25},
      {nome:'BRS-Espada', ciclo:34, prodFator:0.95, tempOpt:27},
      {nome:'Haden', ciclo:38, prodFator:0.90, tempOpt:25},
    ],
    extraLabel:['Brix (°Bx)','Peso do fruto (g)'],
    extraCalc:(p,fGlobal)=>[
      +(14+7*fGlobal).toFixed(1),
      +(250+250*fGlobal).toFixed(0),
    ],
    fases:['Estabelecimento','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Formação da copa','Crescimento produtivo','Crescimento produtivo','Indução floral (seca)','Florescimento','Florescimento','Frutificação/enchimento','Maturação/colheita'],
    recs:['Plantio em área aberta; espaçamento 5×5m; calagem','Podas de formação; adubação NPK; controle antracnose','Manutenção da copa; adubação K','Poda de limpeza anual; adubação pré-floração','Estresse hídrico controlado para induzir floração','Período seco favorece diferenciação floral','Adubação K+Ca+B; controle de broca Cryptorhynchus','Evitar irrigação no florescimento; monitorar Oidium','Polinização; controle de mosca-das-frutas','Raleio de frutos; adubação foliar K+Ca','Irrigação plena; enchimento do fruto','Colheita no ponto de maturação fisiológica; pós-colheita cuidadoso'],
    refs:'Embrapa Semi-Árido (2018); Subramanyam (1997); FAOSTAT Mango; Singh (2001); Avilan et al.',
    defaultN:80, defaultP:35, defaultK:100, defaultS:15, defaultEsp:25.0,
    recN:100, recP:40, recK:120, recS:15, mesIdeal:7, tblStep:3,
  },

  /* ══ POMARES — culturas de cultivo comercial ══ */
  laranja: {
    nome:'Laranja', icon:'🍊', cor:'#ef6c00', cropType:'tree',
    nomeCientifico:'Citrus sinensis (L.) Osbeck',
    cicloBase:36, tempOpt:24, tempMin:12, tempMax:38,
    aguaOpt:100, pHOtimo:[6.0,7.5], espOpt:16.0,
    NOptimo:120, POptimo:60, KOptimo:150, SOptimo:20,
    prodMin:20, prodMax:55, alturaMax:500, unidade:'t/ha (frutos frescos)',
    bmPotencial:10.0, convFreshFactor:8.5, isFruitCrop:true,
    variedades:[
      {nome:'Pêra Rio', ciclo:36, prodFator:1.0, tempOpt:24},
      {nome:'Valência', ciclo:36, prodFator:1.05, tempOpt:23},
      {nome:'Hamlin', ciclo:34, prodFator:0.95, tempOpt:24},
    ],
    extraLabel:['Brix (°Bx)','Ratio (Brix/Acidez)'],
    extraCalc:(p,fG)=>[+(10+4*fG).toFixed(1), +(10+5*fG).toFixed(1)],
    fases:['Plantio/pegamento','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Formação da copa','Indução floral','Florescimento','Frutificação','Enchimento','Maturação I','Maturação II','Colheita'],
    recs:['Plantio em solos bem drenados; pH 6-7.5; calagem','Podas de formação; adubação NPK completa','Controle de Phytophthora e gomose; adubação K','Adubação Ca+Mg; controle de ácaros','Poda de produção; adubação pré-floração','Estresse hídrico leve induz floração','Monitorar mosca-das-frutas; controle de pulgões','Adubação K+Ca+B; monitorar queda de frutos','Irrigação regular; adubação foliar Ca+Boro','Avaliar maturação (Brix≥10); pré-colheita','Estresse hídrico aumenta sólidos solúveis','Colheita; armazenamento refrigerado'],
    refs:'Embrapa Mandioca e Fruticultura; Koller (2006); FAO Citrus; IBGE-PAM',
    defaultN:100, defaultP:50, defaultK:120, defaultS:20, defaultEsp:16.0,
    recN:120, recP:60, recK:150, recS:20, mesIdeal:5, tblStep:3,
  },
  mamao: {
    nome:'Mamão', icon:'🍈', cor:'#ff7043', cropType:'shrub',
    nomeCientifico:'Carica papaya L.',
    cicloBase:12, tempOpt:27, tempMin:18, tempMax:38,
    aguaOpt:150, pHOtimo:[5.5,7.0], espOpt:2.25,
    NOptimo:200, POptimo:100, KOptimo:280, SOptimo:25,
    prodMin:40, prodMax:100, alturaMax:300, unidade:'t/ha (frutos frescos)',
    bmPotencial:15.0, convFreshFactor:10.0, isFruitCrop:true,
    variedades:[
      {nome:'Sunrise Solo (Havaí)', ciclo:12, prodFator:1.0, tempOpt:27},
      {nome:'Golden (Formosa)', ciclo:12, prodFator:1.1, tempOpt:27},
      {nome:'BRS Rubi do Cerrado', ciclo:11, prodFator:1.05, tempOpt:28},
    ],
    extraLabel:['Brix (°Bx)','Firmeza da polpa (N)'],
    extraCalc:(p,fG)=>[+(11+4*fG).toFixed(1), +(40+20*fG).toFixed(0)],
    fases:['Transplante/pegamento','Crescimento vegetativo','Crescimento vegetativo','Diferenciação floral','Florescimento','Frutificação','Enchimento','Maturação I','Maturação II','Colheita I','Colheita II','Produção plena'],
    recs:['Transplante de mudas; espaçamento 3×2.5m; calagem','Adubação N parcelada; irrigação frequente','Identificar e eliminar plantas masculinas (3:1 ratio)','Adubação K+Ca; monitorar sexualidade','Polinização; controle de ácaros e trips','Adubação K+Ca+Boro; controle de antracnose','Irrigação plena; adubação foliar micronutrientes','Monitorar maturação (casca amarelando na base)','Colheita com ¼ da casca amarela','Colheita escalonada a cada 2-3 dias','Armazenamento a 8-12°C; transporte cuidadoso','Produção contínua; replantio após 2 anos'],
    refs:'Embrapa Mandioca e Fruticultura; Marin et al. (2006); FAO Papaya; IBGE-PAM MA',
    defaultN:160, defaultP:80, defaultK:220, defaultS:25, defaultEsp:2.25,
    recN:200, recP:100, recK:280, recS:25, mesIdeal:3, tblStep:1,
  },
  limao: {
    nome:'Limão', icon:'🍋', cor:'#c6a700', cropType:'tree',
    nomeCientifico:'Citrus limon (L.) Osbeck / C. latifolia Tanaka',
    cicloBase:36, tempOpt:24, tempMin:12, tempMax:38,
    aguaOpt:100, pHOtimo:[6.0,7.5], espOpt:12.25,
    NOptimo:100, POptimo:50, KOptimo:120, SOptimo:20,
    prodMin:15, prodMax:40, alturaMax:400, unidade:'t/ha (frutos frescos)',
    bmPotencial:8.5, convFreshFactor:8.0, isFruitCrop:true,
    variedades:[
      {nome:'Tahiti (Lima Ácida)', ciclo:36, prodFator:1.05, tempOpt:24},
      {nome:'Eureka', ciclo:36, prodFator:0.95, tempOpt:22},
      {nome:'Siciliano', ciclo:36, prodFator:1.0, tempOpt:22},
    ],
    extraLabel:['Acidez (%)', 'Rendimento de suco (%)'],
    extraCalc:(p,fG)=>[+(5+2*fG).toFixed(1), +(45+10*fG).toFixed(0)],
    fases:['Plantio/pegamento','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Florescimento','Frutificação','Enchimento','Maturação I','Maturação II','Colheita I','Colheita II','Produção plena'],
    recs:['Plantio em solos drenados; espaçamento 7×5m; calagem','Podas de formação; controle de gomose','Adubação NPK completa; controle de ácaros','Adubação pré-floração K+Ca; poda de produção','Monitorar mosca-das-frutas; monitorar floração','Monitorar queda fisiológica de frutos jovens','Irrigação regular; adubação foliar','Avaliar ponto de colheita (verde-brilhante=ok para Tahiti)','Colheita escalonada','Armazenamento refrigerado','Comercialização in natura ou para suco','Produção contínua (3-5 safras/ano para Tahiti)'],
    refs:'Embrapa Mandioca e Fruticultura; Koller (2006); FAO Citrus; IBGE-PAM',
    defaultN:80, defaultP:40, defaultK:100, defaultS:20, defaultEsp:12.25,
    recN:100, recP:50, recK:120, recS:20, mesIdeal:5, tblStep:3,
  },
  maracuja: {
    nome:'Maracujá', icon:'🟡', cor:'#fbc02d', cropType:'vine',
    nomeCientifico:'Passiflora edulis f. flavicarpa Deg.',
    cicloBase:12, tempOpt:25, tempMin:18, tempMax:36,
    aguaOpt:140, pHOtimo:[5.5,7.0], espOpt:3.0,
    NOptimo:80, POptimo:60, KOptimo:120, SOptimo:20,
    prodMin:15, prodMax:40, alturaMax:300, unidade:'t/ha (frutos frescos)',
    bmPotencial:9.0, convFreshFactor:9.0, isFruitCrop:true,
    variedades:[
      {nome:'BRS Gigante Amarelo (Embrapa)', ciclo:12, prodFator:1.05, tempOpt:25},
      {nome:'BRS Sol do Cerrado', ciclo:12, prodFator:1.0, tempOpt:25},
      {nome:'Marília (FB-200)', ciclo:12, prodFator:0.95, tempOpt:24},
    ],
    extraLabel:['Brix (°Bx)','Rendimento de polpa (%)'],
    extraCalc:(p,fG)=>[+(12+4*fG).toFixed(1), +(30+10*fG).toFixed(0)],
    fases:['Transplante/pegamento','Crescimento das ramas','Crescimento das ramas','Florescimento','Florescimento','Frutificação','Enchimento','Maturação I','Colheita I','Colheita II','Colheita III','Pico de produção'],
    recs:['Transplante de mudas; espaldeira; calagem; espaçamento 3×3m','Formação das ramas; condução em "Y" ou latada','Adubação N+K; controle de antracnose','Polinização manual (15-18h); controle de mosca','Adubação foliar B; proteger das chuvas','Adubação K+Ca; controle de Phytophthora','Irrigação regular; colheita de frutos caídos','Colheita diária dos frutos caídos','Armazenamento seco; polpa para suco','Pico de produção no verão chuvoso MA','Manutenção das ramas produtivas','Podas de renovação; adubação de manutenção'],
    refs:'Embrapa Mandioca e Fruticultura; Meletti (2011); FAO Passiflora; IBGE-PAM MA',
    defaultN:60, defaultP:50, defaultK:100, defaultS:20, defaultEsp:3.0,
    recN:80, recP:60, recK:120, recS:20, mesIdeal:3, tblStep:1,
  },
  acerola: {
    nome:'Acerola', icon:'🔴', cor:'#c62828', cropType:'shrub',
    nomeCientifico:'Malpighia emarginata DC.',
    cicloBase:24, tempOpt:26, tempMin:18, tempMax:38,
    aguaOpt:100, pHOtimo:[5.5,7.0], espOpt:6.25,
    NOptimo:80, POptimo:50, KOptimo:100, SOptimo:15,
    prodMin:15, prodMax:50, alturaMax:300, unidade:'t/ha (frutos frescos)',
    bmPotencial:8.0, convFreshFactor:9.5, isFruitCrop:true,
    variedades:[
      {nome:'BRS 366 Jaburu (Embrapa)', ciclo:24, prodFator:1.05, tempOpt:26},
      {nome:'Okinawa', ciclo:24, prodFator:1.0, tempOpt:26},
      {nome:'Sertaneja', ciclo:24, prodFator:0.95, tempOpt:27},
    ],
    extraLabel:['Vitamina C (mg/100g)','Brix (°Bx)'],
    extraCalc:(p,fG)=>[+(800+600*fG).toFixed(0), +(6+3*fG).toFixed(1)],
    fases:['Plantio/enraizamento','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Formação da copa','Florescimento I','Frutificação I','Colheita I','Florescimento II','Frutificação II','Colheita II','Produção plena'],
    recs:['Plantio em solos bem drenados; espaçamento 5×5m; calagem','Podas de formação; adubação NPK completa','Controle de antracnose (Colletotrichum)','Poda de limpeza; adubação pré-floração','Adubação K+Ca+Boro','Monitorar polinizadores; proteger de chuvas','Colheita rápida (2-3 dias no ponto)','Processamento imediato ou congelamento','Poda pós-colheita; adubação N','Controle de Phyllosticta; adubação foliar','Colheita escalonada; 3-5 colheitas/ano','Produção contínua; mercado fresco e processado'],
    refs:'Embrapa Mandioca e Fruticultura; Ritzinger & Ritzinger (2011); FAO; IBGE-PAM MA',
    defaultN:60, defaultP:40, defaultK:80, defaultS:15, defaultEsp:6.25,
    recN:80, recP:50, recK:100, recS:15, mesIdeal:3, tblStep:2,
  },
  goiaba: {
    nome:'Goiaba', icon:'🟢', cor:'#2e7d32', cropType:'shrub',
    nomeCientifico:'Psidium guajava L.',
    cicloBase:24, tempOpt:26, tempMin:18, tempMax:40,
    aguaOpt:100, pHOtimo:[5.0,7.0], espOpt:6.25,
    NOptimo:80, POptimo:50, KOptimo:100, SOptimo:15,
    prodMin:15, prodMax:50, alturaMax:600, unidade:'t/ha (frutos frescos)',
    bmPotencial:8.5, convFreshFactor:9.5, isFruitCrop:true,
    variedades:[
      {nome:'Paluma', ciclo:24, prodFator:1.0, tempOpt:26},
      {nome:'Pedro Sato', ciclo:24, prodFator:1.05, tempOpt:25},
      {nome:'BRS Crystal', ciclo:24, prodFator:1.0, tempOpt:26},
    ],
    extraLabel:['Vitamina C (mg/100g)','Brix (°Bx)'],
    extraCalc:(p,fG)=>[+(150+100*fG).toFixed(0), +(8+4*fG).toFixed(1)],
    fases:['Plantio/enraizamento','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Florescimento I','Frutificação I','Colheita I','Poda de produção','Florescimento II','Frutificação II','Maturação','Colheita plena'],
    recs:['Plantio; espaçamento 6×5m; calagem; adubação base','Podas de formação; adubação NPK completa','Controle de moscas-das-frutas e pulgões','Poda de produção; adubação pré-floração','Monitorar floração; proteção de insetos benéficos','Desbaste de frutos; adubação K+Ca','Colheita escalonada; refrigeração','Poda pós-colheita; adubação N','Reinício do ciclo produtivo','Controle de antracnose; adubação foliar','Avaliar ponto de colheita (cor e firmeza)','3-4 colheitas/ano; mercado fresco e polpa'],
    refs:'Embrapa Mandioca e Fruticultura; Natale et al. (2009); FAO Guava; IBGE-PAM MA',
    defaultN:60, defaultP:40, defaultK:80, defaultS:15, defaultEsp:6.25,
    recN:80, recP:50, recK:100, recS:15, mesIdeal:3, tblStep:2,
  },
  tamarindo: {
    nome:'Tamarindo', icon:'🟫', cor:'#5d4037', cropType:'tree',
    nomeCientifico:'Tamarindus indica L.',
    cicloBase:60, tempOpt:28, tempMin:18, tempMax:42,
    aguaOpt:80, pHOtimo:[5.5,7.5], espOpt:25.0,
    NOptimo:60, POptimo:30, KOptimo:80, SOptimo:10,
    prodMin:8, prodMax:25, alturaMax:2500, unidade:'t/ha (frutos com casca)',
    bmPotencial:7.5, convFreshFactor:5.0, isFruitCrop:true,
    variedades:[
      {nome:'Doce (low-acid)', ciclo:60, prodFator:1.0, tempOpt:28},
      {nome:'Ácido (tradicional)', ciclo:60, prodFator:0.9, tempOpt:28},
    ],
    extraLabel:['Açúcar (%)', 'Acidez (% ácido tartárico)'],
    extraCalc:(p,fG)=>[+(35+15*fG).toFixed(1), +(12+3*(1-fG)).toFixed(1)],
    fases:['Plantio/estabelecimento','Crescimento inicial','Crescimento vegetativo','Crescimento vegetativo','Formação da copa','Formação da copa','Maturação reprodutiva','Florescimento','Frutificação','Maturação','Colheita/beneficiamento','Produção plena'],
    recs:['Plantio em solos drenados; espaçamento 5×5m; tolerante à seca','Irrigação nos primeiros anos; sem adubação pesada','Adubação NPK moderada anual; controle de formigas','Poda leve de formação; tolerante a ventos','Manutenção da copa; coleta de sementes para propagação','Adubação K+P pré-floração','Floração na transição seca-chuva','Monitorar pragas; controle preventivo','Frutos em cachos; desenvolvimento lento (4-6 meses)','Casca acinzentada quando maduro; polpa firme e aromática','Colheita manual; descasque; embalagem das vagens','Produção plena a partir dos 5-6 anos; exportação'],
    refs:'Embrapa Semiárido; El-Siddig et al. (FAO, 1999); Lorenzi et al. (2006); IBGE-PAM',
    defaultN:40, defaultP:20, defaultK:60, defaultS:10, defaultEsp:25.0,
    recN:60, recP:30, recK:80, recS:10, mesIdeal:5, tblStep:6,
  },
  coco: {
    nome:'Coco-da-baía', icon:'🥥', cor:'#4e342e', cropType:'palm',
    nomeCientifico:'Cocos nucifera L.',
    cicloBase:60, tempOpt:27, tempMin:18, tempMax:38,
    aguaOpt:180, pHOtimo:[5.5,8.0], espOpt:30.0,
    NOptimo:150, POptimo:80, KOptimo:300, SOptimo:30,
    prodMin:80, prodMax:200, alturaMax:2500, unidade:'frutos/palma/ano',
    bmPotencial:15.0, convFreshFactor:1.0, isFruitCrop:true,
    variedades:[
      {nome:'Anão Verde do Pará (AVeP)', ciclo:48, prodFator:1.05, tempOpt:27},
      {nome:'Anão Amarelo da Malásia (AAM)', ciclo:48, prodFator:1.0, tempOpt:27},
      {nome:'Gigante do Oeste Africano (GOA)', ciclo:60, prodFator:0.9, tempOpt:27},
    ],
    extraLabel:['Água de coco (L/fruto)','Gordura saturada da copra (%)'],
    extraCalc:(p,fG)=>[+(0.2+0.3*fG).toFixed(2), +(85+5*fG).toFixed(1)],
    fases:['Plantio de mudas','Enraizamento','Crescimento vegetativo','Crescimento vegetativo','Crescimento vegetativo','Emissão das primeiras flores','Florescimento','Frutificação','Frutificação','Enchimento','Maturação','Colheita (produção plena)'],
    recs:['Plantio de mudas; espaçamento 6×6m; adubação base K','Irrigação frequente; cobertura morta','Adubação N+K+Mg parcelada','Controle de broca-do-coqueiro (Rhynchophorus)','Controle de ácaros; monitorar anel vermelho','Adubação de produção K+B; irrigação regular','Monitorar polinização; adubação foliar Boro','Proteção dos cachos jovens','Irrigação plena; adubação K+Mg','Colheita de coco verde (5-7 meses) ou seco (11-12)','Colheita escalonada mensal; 12-15 frutos/palma','Produção plena a partir do 5º ano; adubação contínua'],
    refs:'Embrapa Tabuleiros Costeiros; Ferreira (2005); FAO Coconut; IBGE-PAM MA',
    defaultN:120, defaultP:60, defaultK:240, defaultS:30, defaultEsp:36.0,
    recN:150, recP:80, recK:300, recS:30, mesIdeal:3, tblStep:6,
  },

  /* ══ HORTALIÇAS E TEMPEROS ══ */
  alface: {
    nome:'Alface', icon:'🥬', cor:'#66bb6a', cropType:'herb',
    nomeCientifico:'Lactuca sativa L.',
    cicloBase:2, tempOpt:20, tempMin:10, tempMax:30,
    aguaOpt:80, pHOtimo:[5.8,7.0], espOpt:0.07,
    NOptimo:60, POptimo:40, KOptimo:80, SOptimo:10,
    prodMin:15, prodMax:35, alturaMax:30, unidade:'t/ha (cabeças frescas)',
    bmPotencial:4.5, convFreshFactor:10.0, isFruitCrop:false,
    variedades:[
      {nome:'Verônica (crespa)', ciclo:2, prodFator:1.0, tempOpt:22},
      {nome:'Regina (lisa)', ciclo:2, prodFator:0.95, tempOpt:20},
      {nome:'Elisa (americana)', ciclo:2, prodFator:1.0, tempOpt:18},
    ],
    extraLabel:['Massa fresca por cabeça (g)','Valor SPAD (índice de clorofila)'],
    extraCalc:(p,fG)=>[+(150+200*fG).toFixed(0), +(35+15*fG).toFixed(0)],
    fases:['Semeadura/emergência','Crescimento foliar inicial','Crescimento foliar','Formação da cabeça','Colheita'],
    recs:['Semeadura em bandejas; substrato; sombreamento 30-50%','Adubação N+K (1ª dose); irrigação por gotejamento','Controle de pulgões e lesmas; capina','Adubação N final; irrigação regular; sem calor excessivo','Colheita pela manhã; resfriamento imediato'],
    refs:'Embrapa Hortaliças; Filgueira (2008); FAO Vegetable Crops; CEASA-MA',
    defaultN:50, defaultP:35, defaultK:65, defaultS:10, defaultEsp:0.07,
    recN:60, recP:40, recK:80, recS:10, mesIdeal:7, tblStep:1,
  },
  couve: {
    nome:'Couve', icon:'🥦', cor:'#388e3c', cropType:'herb',
    nomeCientifico:'Brassica oleracea var. acephala DC.',
    cicloBase:3, tempOpt:20, tempMin:10, tempMax:32,
    aguaOpt:90, pHOtimo:[5.5,7.0], espOpt:0.30,
    NOptimo:80, POptimo:40, KOptimo:80, SOptimo:15,
    prodMin:10, prodMax:30, alturaMax:80, unidade:'t/ha (folhas frescas)',
    bmPotencial:5.0, convFreshFactor:11.0, isFruitCrop:false,
    variedades:[
      {nome:'Manteiga (comum)', ciclo:3, prodFator:1.0, tempOpt:20},
      {nome:'Portuguesa', ciclo:3, prodFator:0.9, tempOpt:18},
    ],
    extraLabel:['Cálcio (mg/100g)','Vitamina C (mg/100g)'],
    extraCalc:(p,fG)=>[+(120+80*fG).toFixed(0), +(60+40*fG).toFixed(0)],
    fases:['Transplante/pegamento','Crescimento vegetativo','Emissão de folhas','Colheita escalonada','Produção contínua'],
    recs:['Transplante de mudas; espaçamento 0.5×0.6m; calagem','Adubação N parcelada; irrigação frequente','Controle de lagartas (MLPV); adubação foliar','Colheita de folhas baixeiras; manter planta produtiva','Adubação N a cada 20 dias; produção por 2-3 anos'],
    refs:'Embrapa Hortaliças; Filgueira (2008); FAO; CEASA-MA',
    defaultN:65, defaultP:35, defaultK:65, defaultS:15, defaultEsp:0.30,
    recN:80, recP:40, recK:80, recS:15, mesIdeal:7, tblStep:1,
  },
  coentro: {
    nome:'Coentro', icon:'🌿', cor:'#558b2f', cropType:'herb',
    nomeCientifico:'Coriandrum sativum L.',
    cicloBase:2, tempOpt:22, tempMin:10, tempMax:30,
    aguaOpt:60, pHOtimo:[5.5,7.0], espOpt:0.05,
    NOptimo:40, POptimo:20, KOptimo:40, SOptimo:8,
    prodMin:5, prodMax:15, alturaMax:40, unidade:'t/ha (folhas frescas)',
    bmPotencial:2.5, convFreshFactor:11.0, isFruitCrop:false,
    variedades:[
      {nome:'Verdão (MA)', ciclo:2, prodFator:1.0, tempOpt:22},
      {nome:'Tabocas', ciclo:2, prodFator:0.95, tempOpt:22},
    ],
    extraLabel:['Teor de óleo essencial (ml/100g)','Linalol (%)'],
    extraCalc:(p,fG)=>[+(0.3+0.3*fG).toFixed(2), +(60+15*fG).toFixed(0)],
    fases:['Semeadura','Emergência/crescimento','Colheita de folhas','Florescimento/sementes'],
    recs:['Semeadura direta em canteiros; 3-5 g/m²; pH 5.5-7','Adubação N+K leve; irrigação moderada; sombreamento 30%','Colheita das folhas antes do pendoamento','Colheita das sementes quando marrons; secagem'],
    refs:'Embrapa Hortaliças; Filgueira (2008); FAO; mercado tradicional MA',
    defaultN:30, defaultP:18, defaultK:35, defaultS:8, defaultEsp:0.05,
    recN:40, recP:20, recK:40, recS:8, mesIdeal:7, tblStep:1,
  },
  cebolinha: {
    nome:'Cebolinha', icon:'🌱', cor:'#43a047', cropType:'herb',
    nomeCientifico:'Allium fistulosum L.',
    cicloBase:2, tempOpt:20, tempMin:10, tempMax:30,
    aguaOpt:70, pHOtimo:[5.5,7.0], espOpt:0.04,
    NOptimo:60, POptimo:30, KOptimo:60, SOptimo:10,
    prodMin:8, prodMax:25, alturaMax:40, unidade:'t/ha (folhas frescas)',
    bmPotencial:3.5, convFreshFactor:11.0, isFruitCrop:false,
    variedades:[
      {nome:'Comprida (MA)', ciclo:2, prodFator:1.0, tempOpt:20},
      {nome:'Todo-Ano', ciclo:2, prodFator:1.05, tempOpt:22},
    ],
    extraLabel:['Massa por maço (g)','Flavonoides (mg/100g)'],
    extraCalc:(p,fG)=>[+(80+70*fG).toFixed(0), +(50+30*fG).toFixed(0)],
    fases:['Semeadura/divisão de touceiras','Crescimento','Perfilhamento','Colheita escalonada'],
    recs:['Propagação por divisão de touceiras ou sementes','Adubação N+K; irrigação frequente','Manutenção do canteiro; controle de fungos','Colheita quando 30-40cm; amarrar em maços'],
    refs:'Embrapa Hortaliças; Filgueira (2008); FAO; CEASA-MA',
    defaultN:50, defaultP:25, defaultK:50, defaultS:10, defaultEsp:0.04,
    recN:60, recP:30, recK:60, recS:10, mesIdeal:7, tblStep:1,
  },
  pimentao: {
    nome:'Pimentão', icon:'🫑', cor:'#1b5e20', cropType:'shrub',
    nomeCientifico:'Capsicum annuum L. (grupo grossum)',
    cicloBase:4, tempOpt:24, tempMin:16, tempMax:35,
    aguaOpt:120, pHOtimo:[5.5,7.0], espOpt:0.40,
    NOptimo:120, POptimo:80, KOptimo:150, SOptimo:20,
    prodMin:20, prodMax:60, alturaMax:80, unidade:'t/ha (frutos frescos)',
    bmPotencial:9.0, convFreshFactor:9.5, isFruitCrop:true,
    variedades:[
      {nome:'Yolo Wonder', ciclo:4, prodFator:1.0, tempOpt:24},
      {nome:'Magali', ciclo:4, prodFator:1.05, tempOpt:24},
      {nome:'Margarita F1 (híbrido)', ciclo:4, prodFator:1.1, tempOpt:23},
    ],
    extraLabel:['Vitamina C (mg/100g)','Capsaicina (mg/kg)'],
    extraCalc:(p,fG)=>[+(100+60*fG).toFixed(0), +(5+10*(1-fG)).toFixed(0)],
    fases:['Transplante/pegamento','Crescimento vegetativo','Florescimento','Frutificação','Colheita verde/maturação','Colheita colorida/plena'],
    recs:['Transplante de mudas; espaçamento 0.5×0.8m; calagem','Adubação N+K parcelada; irrigação gotejamento','Polinização; controle de Tuta absoluta e ácaros','Adubação K+Ca+Boro; controle de Phytophthora','Colheita no verde (mais produção) ou colorido (mais valor)','Colheita a cada 5-7 dias; refrigeração'],
    refs:'Embrapa Hortaliças; Loures et al.; FAO Capsicum; CEASA-MA',
    defaultN:100, defaultP:65, defaultK:120, defaultS:20, defaultEsp:0.40,
    recN:120, recP:80, recK:150, recS:20, mesIdeal:7, tblStep:1,
  },
  quiabo: {
    nome:'Quiabo', icon:'🟢', cor:'#2e7d32', cropType:'shrub',
    nomeCientifico:'Abelmoschus esculentus (L.) Moench',
    cicloBase:3, tempOpt:27, tempMin:18, tempMax:38,
    aguaOpt:100, pHOtimo:[5.5,7.0], espOpt:0.25,
    NOptimo:80, POptimo:60, KOptimo:80, SOptimo:15,
    prodMin:8, prodMax:25, alturaMax:150, unidade:'t/ha (frutos frescos)',
    bmPotencial:6.0, convFreshFactor:10.0, isFruitCrop:true,
    variedades:[
      {nome:'Santa Cruz 47', ciclo:3, prodFator:1.0, tempOpt:27},
      {nome:'Clemson Spineless', ciclo:3, prodFator:0.95, tempOpt:27},
    ],
    extraLabel:['Mucilagem (%)','Fibra bruta (%)'],
    extraCalc:(p,fG)=>[+(2+1.5*fG).toFixed(1), +(3+1*fG).toFixed(1)],
    fases:['Semeadura/emergência','Crescimento vegetativo','Florescimento','Frutificação/colheita','Produção plena'],
    recs:['Semeadura direta; espaçamento 0.4×0.6m; calagem','Adubação N+K em cobertura; capinas','Monitorar trips e pulgões; controle de nematoides','Colheita a cada 2-3 dias (frutos jovens, 7-10cm)','Adubação foliar; poda de estimulação'],
    refs:'Embrapa Hortaliças; Filgueira (2008); FAO; CEASA-MA',
    defaultN:65, defaultP:50, defaultK:65, defaultS:15, defaultEsp:0.25,
    recN:80, recP:60, recK:80, recS:15, mesIdeal:3, tblStep:1,
  },
  batata_doce: {
    nome:'Batata-doce', icon:'🍠', cor:'#7b5ea7', cropType:'root',
    nomeCientifico:'Ipomoea batatas (L.) Lam.',
    cicloBase:4, tempOpt:24, tempMin:15, tempMax:35,
    aguaOpt:100, pHOtimo:[5.5,6.5], espOpt:0.20,
    NOptimo:60, POptimo:60, KOptimo:100, SOptimo:15,
    prodMin:12, prodMax:45, alturaMax:40, unidade:'t/ha (raízes frescas)',
    bmPotencial:8.0, convFreshFactor:5.5, isFruitCrop:false,
    variedades:[
      {nome:'BRS Cuia (Embrapa)', ciclo:4, prodFator:1.0, tempOpt:24},
      {nome:'Beauregard', ciclo:4, prodFator:1.05, tempOpt:24},
      {nome:'CNPH 80 (roxa)', ciclo:4, prodFator:0.95, tempOpt:24},
    ],
    extraLabel:['Amido (%)', 'Beta-caroteno (µg/100g)'],
    extraCalc:(p,fG)=>[+(18+8*fG).toFixed(1), +(500+1500*fG).toFixed(0)],
    fases:['Plantio das ramas','Enraizamento/brotação','Crescimento vegetativo','Engrossamento das raízes','Maturação','Colheita'],
    recs:['Plantio de ramas de 30cm; camalhões; calagem leve','Irrigação moderada; capinas; evitar encharcamento','Adubação K+P; monitorar besouros','Reduzir N; aumentar K para formação das raízes','Reduzir irrigação; testar com amostragem','Colheita 90-120 dias; cura pré-armazenamento'],
    refs:'Embrapa Hortaliças; Oliveira et al. (2013); FAO IBS; IBGE-PAM MA',
    defaultN:50, defaultP:50, defaultK:80, defaultS:15, defaultEsp:0.20,
    recN:60, recP:60, recK:100, recS:15, mesIdeal:3, tblStep:1,
  },
  cara: {
    nome:'Cará', icon:'🟤', cor:'#795548', cropType:'root',
    nomeCientifico:'Dioscorea alata L.',
    cicloBase:9, tempOpt:26, tempMin:18, tempMax:35,
    aguaOpt:130, pHOtimo:[5.5,7.0], espOpt:0.60,
    NOptimo:80, POptimo:40, KOptimo:100, SOptimo:15,
    prodMin:12, prodMax:40, alturaMax:200, unidade:'t/ha (tubérculos frescos)',
    bmPotencial:9.0, convFreshFactor:5.0, isFruitCrop:false,
    variedades:[
      {nome:'Da Costa (roxo)', ciclo:9, prodFator:1.0, tempOpt:26},
      {nome:'Cará-do-ar', ciclo:7, prodFator:0.85, tempOpt:26},
    ],
    extraLabel:['Amido (%)','Proteína (%)'],
    extraCalc:(p,fG)=>[+(22+8*fG).toFixed(1), +(7+3*fG).toFixed(1)],
    fases:['Plantio das sementes-tubérculo','Brotação/emergência','Crescimento vegetativo','Crescimento vegetativo','Crescimento vegetativo','Engrossamento dos tubérculos','Engrossamento dos tubérculos','Maturação','Colheita'],
    recs:['Plantio de pedaços de tubérculos (300-400g); espaçamento 0.5×1.2m','Irrigação moderada; controle de formigas cortadeiras','Espaldeira ou tutoramento das ramas','Adubação N+K parcelada; capinas','Monitorar antracnose e podridão radicular','Reduzir N; aumentar K; irrigação regular','Avaliar engrossamento por amostragem','Reduzir irrigação; amarelamento das ramas indica maturação','Colheita manual; cura por 7-10 dias'],
    refs:'Embrapa Hortaliças; Pedralli (2002); FAO Yams; IBGE-PAM MA',
    defaultN:65, defaultP:35, defaultK:80, defaultS:15, defaultEsp:0.60,
    recN:80, recP:40, recK:100, recS:15, mesIdeal:3, tblStep:1,
  },
  inhame: {
    nome:'Inhame', icon:'🟤', cor:'#6d4c41', cropType:'root',
    nomeCientifico:'Colocasia esculenta (L.) Schott',
    cicloBase:9, tempOpt:25, tempMin:18, tempMax:35,
    aguaOpt:140, pHOtimo:[5.5,7.0], espOpt:0.50,
    NOptimo:80, POptimo:50, KOptimo:120, SOptimo:20,
    prodMin:12, prodMax:35, alturaMax:150, unidade:'t/ha (rizomas frescos)',
    bmPotencial:9.0, convFreshFactor:5.0, isFruitCrop:false,
    variedades:[
      {nome:'Sete-Ervas (MA)', ciclo:9, prodFator:1.0, tempOpt:25},
      {nome:'Chinês', ciclo:8, prodFator:1.05, tempOpt:25},
    ],
    extraLabel:['Amido (%)','Proteína (%)'],
    extraCalc:(p,fG)=>[+(18+7*fG).toFixed(1), +(6+3*fG).toFixed(1)],
    fases:['Plantio dos rizomas','Brotação/emergência','Crescimento foliar','Crescimento vegetativo','Crescimento vegetativo','Engrossamento dos cormos','Engrossamento dos cormos','Maturação','Colheita'],
    recs:['Plantio de cormos-filhos; solos argilosos úmidos; calagem','Irrigação frequente; evitar déficit hídrico','Adubação N (1ª dose); capinas','Adubação N+K (2ª dose); monitorar pragas','Controle de nematoides e fungos de solo','Reduzir N; aumentar K; adubação foliar Ca+Mg','Irrigação regular; cormos crescem no subsolo','Amarelamento das folhas indica maturação','Colheita manual; separação dos cormos-filhos'],
    refs:'Embrapa Hortaliças; Leal et al. (2017); FAO Taro; IBGE-PAM MA',
    defaultN:65, defaultP:40, defaultK:100, defaultS:20, defaultEsp:0.50,
    recN:80, recP:50, recK:120, recS:20, mesIdeal:3, tblStep:1,
  },
  jerimum: {
    nome:'Jerimum (Abóbora)', icon:'🎃', cor:'#e65100', cropType:'vine',
    nomeCientifico:'Cucurbita moschata Duchesne / C. maxima Duchesne',
    cicloBase:4, tempOpt:27, tempMin:18, tempMax:38,
    aguaOpt:120, pHOtimo:[5.5,7.0], espOpt:4.0,
    NOptimo:80, POptimo:60, KOptimo:100, SOptimo:15,
    prodMin:15, prodMax:50, alturaMax:50, unidade:'t/ha (frutos frescos)',
    bmPotencial:8.5, convFreshFactor:9.0, isFruitCrop:true,
    variedades:[
      {nome:'Moranga Exposição', ciclo:4, prodFator:1.0, tempOpt:27},
      {nome:'Cucurbitão Paulista', ciclo:4, prodFator:0.95, tempOpt:27},
      {nome:'BRS Jabuticaba (Embrapa)', ciclo:4, prodFator:1.05, tempOpt:27},
    ],
    extraLabel:['Brix (°Bx)','Peso médio (kg)'],
    extraCalc:(p,fG)=>[+(6+3*fG).toFixed(1), +(3+7*fG).toFixed(1)],
    fases:['Semeadura/emergência','Crescimento das ramas','Florescimento','Frutificação','Enchimento','Maturação','Colheita'],
    recs:['Semeadura direta (2-3 sementes/cova); espaçamento 2×2m; calagem','Desbaste para 1 planta/cova; adubação N+K base','Polinização manual (flor masculina nas femininas)','Raleio para 2-3 frutos/planta; adubação K+Ca','Irrigação regular; adubação foliar micronutrientes','Reduzir irrigação; cortiça na casca indica maturação','Colheita quando pedúnculo seco; armazenamento seco a temp ambiente'],
    refs:'Embrapa Hortaliças; Filgueira (2008); FAO Cucurbit; CEASA-MA; IBGE-PAM MA',
    defaultN:65, defaultP:50, defaultK:80, defaultS:15, defaultEsp:4.0,
    recN:80, recP:60, recK:100, recS:15, mesIdeal:3, tblStep:1,
  },
};

/* ─────────── CATEGORIAS ─────────── */
const CRESC_CAT = {
  lavouras: { label:'🌾 Lavouras',  icon:'🌾', crops:['mandioca','feijao','milho','sorgo','arroz','soja','fava','cana'] },
  nativas:  { label:'🌳 Nativas',   icon:'🌳', crops:['acai','cupuacu','buriti','caju','bacuri','pequi'] },
  pomares:  { label:'🍌 Pomares',   icon:'🍌', crops:['banana','abacaxi','manga','melancia','laranja','mamao','limao','maracuja','acerola','goiaba','tamarindo','coco'] },
  hortas:   { label:'🥬 Hortaliças',icon:'🥬', crops:['tomate','alface','couve','coentro','cebolinha','pimentao','quiabo','batata_doce','cara','inhame','jerimum'] },
};

/* ─────────── ESTADO ─────────── */
let _crescCurrentCrop = 'mandioca';
let _crescCurrentCat  = 'lavouras';
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

  const catTabs = Object.entries(CRESC_CAT).map(([k,cat],i) =>
    `<button class="sim-itab${i===0?' active':''}" data-cresccat="${k}" onclick="showCrescCat('${k}')" style="font-size:12px">${cat.label}</button>`
  ).join('');

  const firstCatCrops = CRESC_CAT.lavouras.crops;
  const cropTabs = firstCatCrops.map((k,i) => {
    const c = CRESC_CROPS[k];
    if (!c) return '';
    return `<button class="sim-itab${i===0?' active':''}" data-croptab="${k}" onclick="showCrescTab('${k}')" style="font-size:11px">${c.icon} ${c.nome}</button>`;
  }).join('');

  return `
<div style="margin-bottom:10px">
  <div class="sec-title" style="margin-bottom:4px">🌱 Simuladores de Crescimento de Plantas e Culturas</div>
  <div style="font-size:11px;color:var(--text3)">DSSAT · Embrapa · FAO · CIAT · 37 culturas do Maranhão em 4 categorias</div>
</div>

<div class="sim-tabs-inner" style="margin-bottom:6px;border-bottom:1px solid var(--border);padding-bottom:8px" id="cresc-cat-tabs">${catTabs}</div>
<div class="sim-tabs-inner" style="margin-bottom:14px;overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px" id="cresc-crop-tabs">${cropTabs}</div>

<style>
  #cresc-sim-wrapper {
    display: grid;
    grid-template-columns: minmax(250px,280px) minmax(0,1fr);
    gap: 14px;
    align-items: start;
  }
  #cresc-ctrl-sections {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  @media (max-width: 660px) {
    #cresc-sim-wrapper { grid-template-columns: 1fr; }
    #cresc-ctrl-sections {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 10px;
    }
  }
</style>

<div id="cresc-sim-wrapper">

  <!-- ═══ CONTROLES (painel esquerdo compacto) ═══ -->
  <div class="sim-card" style="margin:0;min-width:0">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">
      <div class="sim-card-title" id="cresc-panel-title" style="margin:0;flex:1;font-size:11px;min-width:80px">🌿 Mandioca</div>
      <button onclick="crescAutoAjustar()" style="padding:4px 8px;border-radius:6px;border:1px solid var(--green2);background:var(--green3);color:var(--bg2);font-size:9px;font-weight:700;cursor:pointer;white-space:nowrap" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">⚡ Auto-ajustar</button>
    </div>

    <div id="cresc-ctrl-sections">

      <!-- 📍 Local -->
      <div style="flex:1;min-width:140px">
        <div class="sim-param">
          <label style="font-size:10px;color:var(--text3)">Município do Maranhão</label>
          <select class="sim-select" id="cresc-mun" onchange="onCrescMunicipioChange()">${munOpts}</select>
        </div>
        <div style="font-size:9px;color:var(--text3);margin-bottom:6px;padding:3px 6px;background:var(--bg3);border-radius:4px;line-height:1.3" id="cresc-mun-desc">São Luís · Tropical úmido · 28°C</div>
        <div class="sim-param">
          <label style="font-size:10px;color:var(--text3)">Cultivar / Variedade</label>
          <select class="sim-select" id="cresc-var" onchange="updateCrescent()"></select>
        </div>
      </div>

      <!-- ☀️ Clima -->
      <div style="flex:1;min-width:155px">
        <div style="font-size:9px;font-weight:600;color:var(--text2);margin:0 0 4px;text-transform:uppercase;letter-spacing:.04em">☀️ Clima</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>Temp(°C)</span><strong id="cresc-lbl-temp">28</strong></label>
            <input type="range" class="sim-slider" id="cresc-temp" min="15" max="40" value="28" step="0.5" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>Precip(mm)</span><strong id="cresc-lbl-chuva">175</strong></label>
            <input type="range" class="sim-slider" id="cresc-chuva" min="0" max="600" value="175" step="5" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>Rad(MJ/m²)</span><strong id="cresc-lbl-rad">18</strong></label>
            <input type="range" class="sim-slider" id="cresc-rad" min="5" max="30" value="18" step="0.5" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>UR(%)</span><strong id="cresc-lbl-ur">75</strong></label>
            <input type="range" class="sim-slider" id="cresc-ur" min="30" max="100" value="75" step="1" oninput="updateCrescLabels();updateCrescent()">
          </div>
        </div>
      </div>

      <!-- 🪨 Solo & Nutrientes -->
      <div style="flex:1.5;min-width:195px">
        <div style="font-size:9px;font-weight:600;color:var(--text2);margin:0 0 4px;text-transform:uppercase;letter-spacing:.04em">🪨 Solo & Nutrientes</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>pH</span><strong id="cresc-lbl-ph">5.8</strong></label>
            <input type="range" class="sim-slider" id="cresc-ph" min="3.5" max="8.5" value="5.8" step="0.1" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>N(kg/ha)</span><strong id="cresc-lbl-N">80</strong></label>
            <input type="range" class="sim-slider" id="cresc-N" min="0" max="300" value="80" step="5" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>P₂O₅(kg/ha)</span><strong id="cresc-lbl-P">60</strong></label>
            <input type="range" class="sim-slider" id="cresc-P" min="0" max="200" value="60" step="5" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>K₂O(kg/ha)</span><strong id="cresc-lbl-K">80</strong></label>
            <input type="range" class="sim-slider" id="cresc-K" min="0" max="600" value="80" step="5" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>S(kg/ha)</span><strong id="cresc-lbl-S">20</strong></label>
            <input type="range" class="sim-slider" id="cresc-S" min="0" max="80" value="20" step="2" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>Ca(cmolc)</span><strong id="cresc-lbl-Ca">2.5</strong></label>
            <input type="range" class="sim-slider" id="cresc-Ca" min="0" max="8" value="2.5" step="0.1" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0;grid-column:1/-1">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>M.O.(%)</span><strong id="cresc-lbl-MO">2.0</strong></label>
            <input type="range" class="sim-slider" id="cresc-MO" min="0.5" max="6" value="2.0" step="0.1" oninput="updateCrescLabels();updateCrescent()">
          </div>
        </div>
      </div>

      <!-- 🌾 Manejo -->
      <div style="flex:1;min-width:140px">
        <div style="font-size:9px;font-weight:600;color:var(--text2);margin:0 0 4px;text-transform:uppercase;letter-spacing:.04em">🌾 Manejo</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
          <div class="sim-param" style="margin:0">
            <label style="font-size:9px;color:var(--text3)">Mês de plantio</label>
            <select class="sim-select" id="cresc-mes" onchange="updateCrescent()">
              <option value="1">Jan</option><option value="2">Fev</option>
              <option value="3">Mar</option><option value="4">Abr</option>
              <option value="5">Mai</option><option value="6">Jun</option>
              <option value="7">Jul</option><option value="8">Ago</option>
              <option value="9">Set</option><option value="10">Out</option>
              <option value="11">Nov</option><option value="12">Dez</option>
            </select>
          </div>
          <div class="sim-param" style="margin:0">
            <label style="display:flex;justify-content:space-between;font-size:9px"><span>Espaç.(m²)</span><strong id="cresc-lbl-esp">1.0</strong></label>
            <input type="range" class="sim-slider" id="cresc-esp" min="0.1" max="8" value="1.0" step="0.1" oninput="updateCrescLabels();updateCrescent()">
          </div>
          <div class="sim-param" style="margin:0">
            <label style="font-size:9px;color:var(--text3)">Irrigação</label>
            <select class="sim-select" id="cresc-irrig" onchange="updateCrescent()">
              <option value="0">Não (sequeiro)</option>
              <option value="1">Quando necessário</option>
              <option value="2">Gotejamento</option>
            </select>
          </div>
          <div class="sim-param" style="margin:0">
            <label style="font-size:9px;color:var(--text3)">Pragas / Doenças</label>
            <select class="sim-select" id="cresc-praga" onchange="updateCrescent()">
              <option value="0">Nenhuma</option>
              <option value="1">Leve</option>
              <option value="2">Moderada</option>
              <option value="3">Severa</option>
            </select>
          </div>
        </div>
      </div>

    </div><!-- #cresc-ctrl-sections -->
  </div>

  <!-- ═══ VISUALIZAÇÃO DA PLANTA + CONDIÇÕES ═══ -->
  <div style="display:flex;flex-direction:column;gap:12px;min-width:0">

    <!-- Status + SVG + Stats -->
    <div class="chart-card" style="padding:14px">
      <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px">
          <svg id="cresc-plant-svg" viewBox="0 0 200 320" style="width:160px;height:256px;display:block" xmlns="http://www.w3.org/2000/svg">
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
            <circle id="cg-health-dot" cx="181" cy="17" r="13" fill="#3b6d11"/>
            <text id="cg-health-lbl" x="181" y="17" text-anchor="middle" dominant-baseline="central" font-size="13" fill="white" font-weight="bold">✓</text>
          </svg>
          <div style="font-size:10px;color:var(--text3);text-align:center;max-width:160px;line-height:1.3" id="cresc-stage-lbl">Aguardando simulação</div>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px">
            <div style="background:var(--bg3);border-radius:7px;padding:8px 10px">
              <div style="font-size:9px;color:var(--text3);margin-bottom:1px">Produtividade</div>
              <div style="font-size:1.1rem;font-weight:700;color:var(--green)" id="cresc-stat-prod">—</div>
              <div style="font-size:9px;color:var(--text3)" id="cresc-prod-unit">t/ha</div>
              <div style="height:2px;background:var(--border);border-radius:2px;margin-top:4px"><div id="cresc-bar-prod" style="height:2px;border-radius:2px;background:var(--green);width:0%;transition:width .4s"></div></div>
            </div>
            <div style="background:var(--bg3);border-radius:7px;padding:8px 10px">
              <div style="font-size:9px;color:var(--text3);margin-bottom:1px">Saúde da planta</div>
              <div style="font-size:1.1rem;font-weight:700" id="cresc-stat-saude">—</div>
              <div style="font-size:9px;color:var(--text3)">/ 100</div>
              <div style="height:2px;background:var(--border);border-radius:2px;margin-top:4px"><div id="cresc-bar-saude" style="height:2px;border-radius:2px;background:#1d9e75;width:0%;transition:width .4s"></div></div>
            </div>
            <div style="background:var(--bg3);border-radius:7px;padding:8px 10px">
              <div style="font-size:9px;color:var(--text3);margin-bottom:1px">Altura estimada</div>
              <div style="font-size:1.1rem;font-weight:700;color:var(--text)" id="cresc-stat-altura">—</div>
              <div style="font-size:9px;color:var(--text3)" id="cresc-altura-unit">cm</div>
              <div style="height:2px;background:var(--border);border-radius:2px;margin-top:4px"><div id="cresc-bar-altura" style="height:2px;border-radius:2px;background:#60a5fa;width:0%;transition:width .4s"></div></div>
            </div>
            <div style="background:var(--bg3);border-radius:7px;padding:8px 10px">
              <div style="font-size:9px;color:var(--text3);margin-bottom:1px">Ciclo / Colheita</div>
              <div style="font-size:1.1rem;font-weight:700;color:var(--text)" id="cresc-stat-ciclo">—</div>
              <div style="font-size:9px;color:var(--text3)">meses</div>
              <div style="height:2px;background:var(--border);border-radius:2px;margin-top:4px"><div id="cresc-bar-ciclo" style="height:2px;border-radius:2px;background:#f59e0b;width:0%;transition:width .4s"></div></div>
            </div>
            <div style="background:var(--bg3);border-radius:7px;padding:8px 10px">
              <div style="font-size:9px;color:var(--text3);margin-bottom:1px" id="cresc-extra1-lbl">Extra 1</div>
              <div style="font-size:1.1rem;font-weight:700;color:var(--text)" id="cresc-stat-extra1">—</div>
              <div style="font-size:9px;color:var(--text3)" id="cresc-extra1-unit"></div>
              <div style="height:2px;background:var(--border);border-radius:2px;margin-top:4px"><div id="cresc-bar-extra1" style="height:2px;border-radius:2px;background:#a78bfa;width:0%;transition:width .4s"></div></div>
            </div>
            <div style="background:var(--bg3);border-radius:7px;padding:8px 10px">
              <div style="font-size:9px;color:var(--text3);margin-bottom:1px" id="cresc-extra2-lbl">Extra 2</div>
              <div style="font-size:1.1rem;font-weight:700;color:var(--text)" id="cresc-stat-extra2">—</div>
              <div style="font-size:9px;color:var(--text3)" id="cresc-extra2-unit"></div>
              <div style="height:2px;background:var(--border);border-radius:2px;margin-top:4px"><div id="cresc-bar-extra2" style="height:2px;border-radius:2px;background:#fb923c;width:0%;transition:width .4s"></div></div>
            </div>
          </div>
          <div id="cresc-alert" style="display:none;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:500"></div>
          <!-- 🩺 Diagnóstico em tempo real — dentro do card da visualização -->
          <div id="cresc-diagnostico" style="margin-top:8px;padding:8px 10px;border-radius:7px;border:1px solid var(--border);background:var(--bg3)">
            <div style="font-size:11px;color:var(--text3);text-align:center">Aguardando simulação...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🥧 Distribuição + 🎯 Fatores — após diagnóstico, mesma coluna direita -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
      <div class="chart-card">
        <div class="chart-title" style="font-size:11px">🥧 Distribuição da biomassa</div>
        <div class="chart-wrap" style="height:185px"><canvas id="cresc-chart-dist"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title" style="font-size:11px">🎯 Fatores limitantes</div>
        <div class="chart-wrap" style="height:185px"><canvas id="cresc-chart-radar"></canvas></div>
      </div>
    </div>

  </div>

</div>

<!-- 📈 Biomassa · LAI e 🌿 Absorção NPK (responsivos) -->
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-top:14px">
  <div class="chart-card">
    <div class="chart-title" style="font-size:12px">📈 Biomassa acumulada (t/ha MS) · LAI</div>
    <div class="chart-wrap" style="height:200px"><canvas id="cresc-chart-bio"></canvas></div>
  </div>
  <div class="chart-card">
    <div class="chart-title" style="font-size:12px">🌿 Absorção de N · P · K (kg/ha)</div>
    <div class="chart-wrap" style="height:200px"><canvas id="cresc-chart-npk"></canvas></div>
  </div>
</div>

<!-- 🌍 GEE — por último (largura total) -->
<div class="chart-card" style="margin-top:14px">
  <div class="chart-title" style="font-size:12px">🌍 Balanço de Gases de Efeito Estufa (GEE) — kg CO₂eq/ha/ciclo</div>
  <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
    <div class="chart-wrap" style="height:230px;flex:1;min-width:260px"><canvas id="cresc-chart-ghg"></canvas></div>
    <div id="cresc-ghg-summary" style="min-width:140px;max-width:185px;padding:10px;background:var(--bg3);border-radius:8px;font-size:10px;line-height:1.7;flex-shrink:0">—</div>
  </div>
</div>

<!-- Base científica -->
<div class="chart-card" style="padding:10px 14px;margin-top:14px">
  <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">📚 Base científica</div>
  <div style="font-size:10px;color:var(--text3)" id="cresc-refs">—</div>
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

/* ─────────── NAVEGAÇÃO ENTRE CATEGORIAS ─────────── */
function showCrescCat(catKey) {
  _crescCurrentCat = catKey;
  document.querySelectorAll('[data-cresccat]').forEach(b => b.classList.remove('active'));
  const catBtn = document.querySelector(`[data-cresccat="${catKey}"]`);
  if (catBtn) catBtn.classList.add('active');

  const crops = CRESC_CAT[catKey].crops;
  const container = document.getElementById('cresc-crop-tabs');
  if (container) {
    container.innerHTML = crops.map((k,i) => {
      const c = CRESC_CROPS[k];
      if (!c) return '';
      return `<button class="sim-itab${i===0?' active':''}" data-croptab="${k}" onclick="showCrescTab('${k}')" style="font-size:11px;white-space:nowrap">${c.icon} ${c.nome}</button>`;
    }).join('');
  }
  // Switch to first crop of this category
  if (crops.length > 0 && CRESC_CROPS[crops[0]]) showCrescTab(crops[0]);
}

/* ─────────── NAVEGAÇÃO ENTRE CULTURAS ─────────── */
function showCrescTab(cropKey) {
  if (!CRESC_CROPS[cropKey]) return;
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

/* ─────────── AUTO-AJUSTE ─────────── */
function crescAutoAjustar() {
  const cropKey = _crescCurrentCrop;
  const crop = CRESC_CROPS[cropKey];
  if (!crop) return;
  const munKey = document.getElementById('cresc-mun').value;
  const mun = CRESC_MUN[munKey];
  if (!mun) return;
  const setV = (id,v) => { const el=document.getElementById(id); if(el) el.value=v; };

  // Clima real do município
  setV('cresc-temp', mun.temp);
  setV('cresc-chuva', mun.chuva);
  setV('cresc-rad', mun.rad);
  setV('cresc-ur', mun.ur);

  // pH: ponto médio ótimo da cultura (meta de manejo independente do pH natural do município)
  const phMid = (crop.pHOtimo[0] + crop.pHOtimo[1]) / 2;
  setV('cresc-ph', phMid.toFixed(1));

  // Nutrientes recomendados para a cultura (N menor em leguminosas — fixação biológica)
  setV('cresc-N', crop.recN !== undefined ? crop.recN : crop.NOptimo);
  setV('cresc-P', crop.recP !== undefined ? crop.recP : crop.POptimo);
  setV('cresc-K', crop.recK !== undefined ? crop.recK : crop.KOptimo);
  setV('cresc-S', crop.recS !== undefined ? crop.recS : crop.SOptimo);

  // Ca e M.O. por tipo de cultura — valores que maximizam fMO e nutrição
  const caRef = {root:2.0, legume:3.0, cereal:2.5, tree:3.5, vine:2.5, shrub:2.8, cane:2.0};
  setV('cresc-Ca', (caRef[crop.cropType] ?? 2.5).toFixed(1));
  setV('cresc-MO', '4.5');  // fMO=1.0 com a fórmula calibrada para trópicos

  // Manejo — espaçamento no centro do intervalo ótimo (1.3–2.5× espOpt = fEsp=1.0)
  setV('cresc-esp', (crop.espOpt * 1.6).toFixed(2));
  setV('cresc-mes', crop.mesIdeal || 1);
  setV('cresc-praga', '0');

  // Irrigação: baseada na chuva mensal vs necessidade hídrica da cultura
  const irrigEl = document.getElementById('cresc-irrig');
  if (irrigEl) irrigEl.value = mun.chuva < crop.aguaOpt * 0.4 ? '2' : mun.chuva < crop.aguaOpt * 0.75 ? '1' : '0';

  updateCrescLabels();
  updateCrescent();
}

/* ─────────── DIAGNÓSTICO EM TEMPO REAL ─────────── */
function _updateCrescDiagnostico() {
  const el = document.getElementById('cresc-diagnostico');
  if (!el) return;
  const cropKey = _crescCurrentCrop;
  const crop = CRESC_CROPS[cropKey];
  const p = _getCrescParams();
  const f = _calcCrescFactors(p, crop);
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const recN = crop.recN || crop.NOptimo;
  const recP = crop.recP || crop.POptimo;
  const recK = crop.recK || crop.KOptimo;
  const recS = crop.recS || crop.SOptimo;

  const checks = [
    {
      label:'Temperatura', value:p.temp+'°C', fv:f.fTemp, ideal:crop.tempOpt+'°C',
      ok: p.temp >= crop.tempMin+2 && p.temp <= crop.tempMax-3 && f.fTemp >= 0.75,
      critical: f.fTemp < 0.50,
      why: p.temp < crop.tempMin+2
        ? `Muito fria (mín ${crop.tempMin}°C). Crescimento severamente limitado.`
        : p.temp > crop.tempMax-3
          ? `Muito quente (máx ${crop.tempMax}°C). Estresse térmico e queda de flores/frutos.`
          : f.fTemp < 0.75 ? `Subótima. Melhor: ${crop.tempOpt}°C.` : `Temperatura adequada para ${crop.nome}.`,
    },
    {
      label:'Chuva/Água', value:p.chuva+'mm/mês', fv:f.fWater, ideal:crop.aguaOpt+'mm/mês',
      ok: f.fWater >= 0.75,
      critical: f.fWater < 0.45,
      why: f.fWater < 0.45
        ? `Déficit hídrico severo. Necessita ${crop.aguaOpt}mm/mês.${p.irrig===0?' Ative a irrigação!':''}`
        : f.fWater < 0.75
          ? `Abaixo do ideal (${crop.aguaOpt}mm). Produção reduzida.`
          : `Suprimento hídrico adequado.`,
    },
    {
      label:'pH do Solo', value:p.ph.toFixed(1), fv:f.fPH, ideal:crop.pHOtimo[0]+'-'+crop.pHOtimo[1],
      ok: p.ph >= crop.pHOtimo[0] && p.ph <= crop.pHOtimo[1],
      critical: f.fPH < 0.50,
      why: p.ph < crop.pHOtimo[0]
        ? `Muito ácido. Aplicar calcário dolomítico para elevar a ${crop.pHOtimo[0]}.`
        : p.ph > crop.pHOtimo[1]
          ? `Muito alcalino. Adicionar enxofre elementar ou fertilizante ácido.`
          : `pH dentro da faixa ótima para ${crop.nome}.`,
    },
    {
      label:'Nitrogênio (N)', value:p.N+'kg/ha', fv:f.fN, ideal:recN+'kg/ha',
      ok: p.N >= recN*0.70,
      critical: p.N < recN*0.30,
      why: p.N < recN*0.30
        ? `N gravemente insuficiente. Causa clorose foliar e baixíssima produção.`
        : p.N < recN*0.70
          ? `N abaixo do recomendado (${recN}kg/ha). Parcelar adubação nitrogenada.`
          : p.N > recN*1.6
            ? `Excesso de N. Pode causar crescimento excessivo e reduzir frutificação.`
            : `N adequado para ${crop.nome}.`,
    },
    {
      label:'Fósforo (P₂O₅)', value:p.P+'kg/ha', fv:f.fP, ideal:recP+'kg/ha',
      ok: p.P >= recP*0.70,
      critical: p.P < recP*0.25,
      why: p.P < recP*0.25
        ? `P gravemente insuficiente. Prejudica enraizamento e florescimento.`
        : p.P < recP*0.70
          ? `P abaixo do recomendado (${recP}kg/ha). Aplicar na adubação de base.`
          : `Fósforo adequado para o cultivo.`,
    },
    {
      label:'Potássio (K₂O)', value:p.K+'kg/ha', fv:f.fK, ideal:recK+'kg/ha',
      ok: p.K >= recK*0.70,
      critical: p.K < recK*0.25,
      why: p.K < recK*0.25
        ? `K gravemente insuficiente. Afeta qualidade dos frutos e resistência a doenças.`
        : p.K < recK*0.70
          ? `K abaixo do recomendado (${recK}kg/ha). Parcelar em cobertura.`
          : `Potássio adequado para o cultivo.`,
    },
    {
      label:'Mês de Plantio', value:MONTHS[p.mes-1], fv:null,
      ideal: crop.mesIdeal ? MONTHS[crop.mesIdeal-1]+'±1' : 'qualquer',
      ok: !crop.mesIdeal || [0,1,11].map(d => ((p.mes-1+d)%12===crop.mesIdeal-1)).some(Boolean)
        || Math.abs(p.mes-crop.mesIdeal)<=1,
      critical: false,
      why: crop.mesIdeal && !(Math.abs(p.mes-crop.mesIdeal)<=1 || Math.abs(p.mes-crop.mesIdeal)>=11)
        ? `Mês não ideal no MA. Melhor: ${MONTHS[crop.mesIdeal-1]}±1. Pode impactar florescimento e chuvas.`
        : `Mês de plantio adequado para ${crop.nome} no Maranhão.`,
    },
    {
      label:'Pragas/Doenças', value:['Nenhuma','Leve','Moderada','Severa'][p.praga], fv:f.fPraga,
      ideal:'Nenhuma/Leve',
      ok: p.praga <= 1,
      critical: p.praga === 3,
      why: p.praga===3
        ? `Pressão severa! Aplique MIP urgente. Perdas de 45-55% na produção.`
        : p.praga===2
          ? `Pressão moderada. Implante MIP (Manejo Integrado de Pragas).`
          : `Situação fitossanitária adequada.`,
    },
  ];

  const icon = c => c.critical?'err':(!c.ok||(c.fv!==null&&c.fv<0.75))?'warn':'ok';
  const bg   = c => ({err:'#220a0a',warn:'#1a1300',ok:'var(--bg3)'}[icon(c)]);
  const col  = c => ({err:'#f87171',warn:'#fcd34d',ok:'var(--green)'}[icon(c)]);
  const bdr  = c => ({err:'#dc262640',warn:'#d9770640',ok:'var(--border)'}[icon(c)]);
  const ico  = c => ({err:'❌',warn:'⚠️',ok:'✅'}[icon(c)]);

  el.innerHTML = `<div style="font-size:11px;font-weight:700;color:var(--green);margin-bottom:8px;display:flex;align-items:center;gap:6px">🩺 Diagnóstico em tempo real<span style="font-size:10px;font-weight:400;color:var(--text3)">— ${crop.icon} ${crop.nome}</span></div>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:5px">
${checks.map(c=>`<div style="background:${bg(c)};border:1px solid ${bdr(c)};border-radius:6px;padding:6px 8px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px"><span style="font-size:10px;font-weight:600;color:var(--text2)">${c.label}</span><span style="font-size:12px">${ico(c)}</span></div>
<div style="font-size:11px;font-weight:700;color:${col(c)}">${c.value}</div>
<div style="font-size:9px;color:var(--text3)">ideal: ${c.ideal}</div>
${icon(c)!=='ok'?`<div style="font-size:9px;color:${col(c)};margin-top:3px;line-height:1.3">${c.why}</div>`:''}</div>`).join('')}
</div>`;
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

  // Água — pico de eficiência em aguaOpt (Doorenbos & Kassam, FAO-33)
  let wMm = p.chuva;
  if (p.irrig>=1) wMm = Math.max(wMm, crop.aguaOpt*0.75);
  if (p.irrig>=2) wMm = Math.max(wMm, crop.aguaOpt);
  const wO = crop.aguaOpt;
  let fWater;
  if (wMm < 10)          fWater = 0;
  else if (wMm < wO*0.25) fWater = wMm/(wO*0.25)*0.25;
  else if (wMm < wO*0.65) fWater = 0.25 + (wMm-wO*0.25)/(wO*0.40)*0.55;
  else if (wMm <= wO)     fWater = 0.80 + (wMm-wO*0.65)/(wO*0.35)*0.20;
  else if (wMm <= wO*1.4) fWater = 1.00 - (wMm-wO)/(wO*0.40)*0.12;
  else fWater = Math.max(0.50, 0.88-(wMm-wO*1.40)/(wO*1.50)*0.38);

  // pH — fator 1.0 dentro da faixa ótima da cultura (Black, 1993)
  const [phLo, phHi] = crop.pHOtimo;
  let fPH;
  if (p.ph >= phLo && p.ph <= phHi) fPH = 1.0;
  else if (p.ph < phLo-1.5) fPH = 0.20;
  else if (p.ph < phLo) fPH = 0.20 + (p.ph-(phLo-1.5))/1.5*0.80;
  else if (p.ph <= phHi+1.0) fPH = 1.00 - (p.ph-phHi)*0.35;
  else fPH = Math.max(0.20, 0.65-(p.ph-phHi-1.0)*0.35);

  // NPK — Liebig
  const fN  = p.N<=0 ? 0.15 : Math.min(1, 0.15+0.85*Math.min(1, p.N/crop.NOptimo));
  const fP  = p.P<=0 ? 0.20 : Math.min(1, 0.20+0.80*Math.min(1, p.P/crop.POptimo));
  const fK  = p.K<=0 ? 0.15 : Math.min(1, 0.15+0.85*Math.min(1, p.K/crop.KOptimo));
  const fS  = p.S<=0 ? 0.70 : Math.min(1, 0.70+0.30*Math.min(1, p.S/crop.SOptimo));
  // M.O. — pico em 4.5% (valor alcançável com bom manejo tropical)
  const fMO = Math.min(1, 0.60 + p.MO/4.5*0.40);

  // Radiação — pico em 18-20 MJ/m²/dia (adequado para trópicos)
  let fRad;
  if (p.rad < 8)        fRad = 0.40;
  else if (p.rad < 12)  fRad = 0.40 + (p.rad-8)/4*0.30;
  else if (p.rad <= 20) fRad = 0.70 + (p.rad-12)/8*0.30;
  else if (p.rad <= 25) fRad = Math.max(0.85, 1.00-(p.rad-20)/5*0.15);
  else fRad = Math.max(0.70, 0.85-(p.rad-25)/5*0.15);

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
    case 'acai':
      if (t<=0.15) return 0.01+0.11*(t/0.15);
      if (t<=0.45) return 0.12+0.33*((t-0.15)/0.30);
      if (t<=0.78) return 0.45+0.43*((t-0.45)/0.33);
      return 0.88+0.12*((t-0.78)/0.22);
    case 'cupuacu':
      if (t<=0.12) return 0.01+0.09*(t/0.12);
      if (t<=0.40) return 0.10+0.28*((t-0.12)/0.28);
      if (t<=0.72) return 0.38+0.45*((t-0.40)/0.32);
      return 0.83+0.17*((t-0.72)/0.28);
    case 'buriti':
      if (t<=0.10) return 0.005+0.05*(t/0.10);
      if (t<=0.40) return 0.055+0.22*((t-0.10)/0.30);
      if (t<=0.75) return 0.275+0.52*((t-0.40)/0.35);
      return 0.795+0.205*((t-0.75)/0.25);
    case 'caju':
      if (t<=0.12) return 0.02+0.15*(t/0.12);
      if (t<=0.38) return 0.17+0.33*((t-0.12)/0.26);
      if (t<=0.68) return 0.50+0.38*((t-0.38)/0.30);
      return 0.88+0.12*((t-0.68)/0.32);
    case 'manga':
      if (t<=0.14) return 0.02+0.18*(t/0.14);
      if (t<=0.42) return 0.20+0.38*((t-0.14)/0.28);
      if (t<=0.70) return 0.58+0.32*((t-0.42)/0.28);
      return 0.90+0.10*((t-0.70)/0.30);
    default: {
      const ct2 = (CRESC_CROPS[cropKey]||{}).cropType||'';
      if (ct2==='cereal'||ct2==='legume') {
        if (t<0.15) return t/0.15*0.15;
        if (t<0.55) return 0.15+(t-0.15)/0.40*0.78;
        if (t<0.85) return 0.93+(t-0.55)/0.30*0.05;
        return 0.98;
      }
      if (ct2==='cane') {
        if (t<0.20) return t/0.20*0.12;
        if (t<0.70) return 0.12+(t-0.20)/0.50*0.80;
        return 0.92+(t-0.70)/0.30*0.06;
      }
      if (ct2==='herb') {
        if (t<0.30) return t/0.30*0.65;
        if (t<0.75) return 0.65+(t-0.30)/0.45*0.33;
        return 0.98;
      }
      if (ct2==='root') {
        if (t<0.25) return t/0.25*0.25;
        if (t<0.65) return 0.25+(t-0.25)/0.40*0.68;
        return 0.93+(t-0.65)/0.35*0.05;
      }
      if (ct2==='palm'||ct2==='tree') {
        return 1-Math.exp(-4*t);
      }
      if (ct2==='vine'||ct2==='shrub') {
        if (t<0.30) return t/0.30*0.32;
        if (t<0.70) return 0.32+(t-0.30)/0.40*0.62;
        return 0.94+(t-0.70)/0.30*0.04;
      }
      return t;
    }
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
    case 'acai': {
      const fr=Math.min(0.45,Math.max(0,(t-0.60)/0.40)*0.50);
      const lf=Math.max(0.12,0.38-fr*0.25);
      return {root:0.08,leaf:lf,stem:Math.max(0.08,1-fr-lf-0.08),fruit:fr};
    }
    case 'cupuacu': {
      const fr=Math.min(0.52,Math.max(0,(t-0.58)/0.42)*0.58);
      const lf=Math.max(0.15,0.40-fr*0.25);
      return {root:0.10,leaf:lf,stem:Math.max(0.08,1-fr-lf-0.10),fruit:fr};
    }
    case 'buriti': {
      const fr=Math.min(0.40,Math.max(0,(t-0.68)/0.32)*0.45);
      const lf=Math.max(0.15,0.35-fr*0.18);
      return {root:0.12,leaf:lf,stem:Math.max(0.12,1-fr-lf-0.12),fruit:fr};
    }
    case 'caju': {
      const fr=Math.min(0.48,Math.max(0,(t-0.50)/0.50)*0.55);
      const lf=Math.max(0.12,0.38-fr*0.22);
      return {root:0.08,leaf:lf,stem:Math.max(0.08,1-fr-lf-0.08),fruit:fr};
    }
    case 'manga': {
      const fr=Math.min(0.55,Math.max(0,(t-0.55)/0.45)*0.60);
      const lf=Math.max(0.12,0.38-fr*0.22);
      return {root:0.08,leaf:lf,stem:Math.max(0.08,1-fr-lf-0.08),fruit:fr};
    }
    default: {
      const ct3 = (CRESC_CROPS[cropKey]||{}).cropType||'';
      if (ct3==='cereal') {
        const gr=Math.min(0.60,Math.max(0,(t-0.45)/0.55)*0.65);
        const lf=Math.max(0.08,0.38-gr*0.28);
        return {root:0.06,leaf:lf,stem:Math.max(0.06,1-gr-lf-0.06),fruit:gr};
      }
      if (ct3==='legume') {
        const pod=Math.min(0.55,Math.max(0,(t-0.40)/0.60)*0.60);
        const lf=Math.max(0.10,0.40-pod*0.25);
        return {root:0.10,leaf:lf,stem:Math.max(0.05,1-pod-lf-0.10),fruit:pod};
      }
      if (ct3==='cane') {
        const sf=Math.min(0.72,0.10+0.62*t);
        const lf=Math.max(0.08,0.30-sf*0.12);
        return {root:0.08,leaf:lf,stem:sf,fruit:Math.max(0,1-sf-lf-0.08)};
      }
      if (ct3==='herb') {
        return {root:0.12,leaf:Math.max(0.60,0.80-t*0.20),stem:0.08,fruit:Math.min(0.20,t*0.20)};
      }
      if (ct3==='root') {
        const rf=Math.min(0.60,0.10+0.50*t);
        const lf=Math.max(0.08,0.35-rf*0.25);
        return {root:rf,leaf:lf,stem:Math.max(0.05,1-rf-lf),fruit:0};
      }
      if (ct3==='vine') {
        const fr=Math.min(0.68,Math.max(0,(t-0.40)/0.60)*0.74);
        const lf=Math.max(0.10,0.38-fr*0.22);
        return {root:0.06,leaf:lf,stem:Math.max(0.04,1-fr-lf-0.06),fruit:fr};
      }
      if (ct3==='shrub') {
        const fr=Math.min(0.52,Math.max(0,(t-0.35)/0.65)*0.58);
        const lf=Math.max(0.12,0.40-fr*0.25);
        return {root:0.08,leaf:lf,stem:Math.max(0.06,1-fr-lf-0.08),fruit:fr};
      }
      if (ct3==='tree') {
        const fr=Math.min(0.50,Math.max(0,(t-0.55)/0.45)*0.55);
        const lf=Math.max(0.15,0.38-fr*0.22);
        return {root:0.10,leaf:lf,stem:Math.max(0.10,1-fr-lf-0.10),fruit:fr};
      }
      if (ct3==='palm') {
        const fr=Math.min(0.42,Math.max(0,(t-0.65)/0.35)*0.48);
        const lf=Math.max(0.15,0.35-fr*0.18);
        return {root:0.12,leaf:lf,stem:Math.max(0.12,1-fr-lf-0.12),fruit:fr};
      }
      return {root:0.20,leaf:0.30,stem:0.25,fruit:0.25};
    }
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
    case 'acai':
      return Math.min(maxH, 20+maxH*(1-Math.exp(-3.5*t)));
    case 'cupuacu':
      return Math.min(maxH, 15+maxH*(1-Math.exp(-2.5*t)));
    case 'buriti':
      return Math.min(maxH, 10+maxH*(1-Math.exp(-2.0*t)));
    case 'caju':
      return Math.min(maxH, 20+maxH*0.85*Math.min(1,t*1.8));
    case 'manga':
      return Math.min(maxH, 25+maxH*0.88*Math.min(1,t*1.6));
    default: {
      const ct4 = (CRESC_CROPS[cropKey]||{}).cropType||'';
      if (ct4==='cereal') return Math.min(maxH, maxH*(1-Math.exp(-6*t)));
      if (ct4==='legume') return Math.min(maxH, maxH*(1-Math.exp(-5*t)));
      if (ct4==='cane')   return Math.min(maxH, maxH*(1-Math.exp(-4.5*t)));
      if (ct4==='herb')   return Math.min(maxH, maxH*Math.min(1,t*2.5));
      if (ct4==='root')   return Math.min(maxH, maxH*Math.min(1,t*1.8));
      if (ct4==='vine')   return Math.min(maxH, maxH*Math.min(1,t*1.5));
      if (ct4==='shrub')  return Math.min(maxH, maxH*(1-Math.exp(-4*t)));
      if (ct4==='tree')   return Math.min(maxH, maxH*(1-Math.exp(-2.5*t)));
      if (ct4==='palm')   return Math.min(maxH, maxH*(1-Math.exp(-2.0*t)));
      return Math.min(maxH, maxH*t);
    }
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
    case 'acai':
      if (t<0.30) return t/0.30*3.5;
      if (t<0.70) return 3.5+(t-0.30)/0.40*1.5;
      return Math.max(2.5,5.0-(t-0.70)/0.30*0.5);
    case 'cupuacu':
      if (t<0.35) return t/0.35*3.0;
      if (t<0.70) return 3.0+(t-0.35)/0.35*1.5;
      return Math.max(2.0,4.5-(t-0.70)/0.30*0.8);
    case 'buriti':
      if (t<0.35) return t/0.35*4.0;
      if (t<0.75) return 4.0+(t-0.35)/0.40*2.0;
      return Math.max(3.0,6.0-(t-0.75)/0.25*0.5);
    case 'caju':
      if (t<0.30) return t/0.30*2.5;
      if (t<0.65) return 2.5+(t-0.30)/0.35*1.0;
      return Math.max(1.0,3.5-(t-0.65)/0.35*1.0);
    case 'manga':
      if (t<0.30) return t/0.30*3.0;
      if (t<0.65) return 3.0+(t-0.30)/0.35*1.5;
      return Math.max(2.0,4.5-(t-0.65)/0.35*0.8);
    default: {
      const ct5 = (CRESC_CROPS[cropKey]||{}).cropType||'';
      if (ct5==='cereal') return Math.max(0.2,Math.sin(t*Math.PI)*4.0);
      if (ct5==='legume') return Math.max(0.2,Math.sin(t*Math.PI)*3.5);
      if (ct5==='cane')   {
        if (t<0.20) return t/0.20*3.0;
        if (t<0.75) return 3.0+(t-0.20)/0.55*3.0;
        return Math.max(2.5,6.0-(t-0.75)/0.25*1.5);
      }
      if (ct5==='herb')   return Math.max(0.1,Math.sin(t*Math.PI)*2.8);
      if (ct5==='root')   {
        if (t<0.40) return t/0.40*2.5;
        if (t<0.75) return 2.5-(t-0.40)/0.35*0.8;
        return Math.max(0.3,1.7-(t-0.75)/0.25*1.2);
      }
      if (ct5==='vine')   return Math.max(0.3,Math.sin(t*Math.PI)*3.2);
      if (ct5==='shrub')  {
        if (t<0.35) return t/0.35*3.0;
        if (t<0.70) return 3.0+(t-0.35)/0.35*0.8;
        return Math.max(1.5,3.8-(t-0.70)/0.30*1.0);
      }
      if (ct5==='tree') {
        if (t<0.30) return t/0.30*2.5;
        if (t<0.65) return 2.5+(t-0.30)/0.35*1.8;
        return Math.max(2.0,4.3-(t-0.65)/0.35*0.8);
      }
      if (ct5==='palm') {
        if (t<0.30) return t/0.30*3.0;
        if (t<0.70) return 3.0+(t-0.30)/0.40*2.0;
        return Math.max(2.5,5.0-(t-0.70)/0.30*0.5);
      }
      return Math.sin(t*Math.PI)*3.5;
    }
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

  // Alerta — mensagens calibradas para os limiares do modelo melhorado
  const alertEl = document.getElementById('cresc-alert');
  if (alertEl) {
    if (result.fGlobal < 0.28) {
      alertEl.style.cssText='display:block;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:500;background:#fef2f2;color:#dc2626';
      alertEl.textContent='⚠️ RISCO CRÍTICO. Condições muito adversas para esta cultura neste local. Considere outra cultura ou melhore solo e irrigação.';
    } else if (result.fGlobal < 0.55) {
      const lim=[], cLim=[];
      if(f.fTemp<0.72){lim.push('temperatura');cLim.push('clima');}
      if(f.fWater<0.72){lim.push('hídrico');cLim.push('clima/irrig.');}
      if(f.fN<0.72)lim.push('N'); if(f.fP<0.72)lim.push('P');
      if(f.fK<0.72)lim.push('K'); if(f.fPH<0.72)lim.push('pH');
      if(f.fMO<0.72)lim.push('M.O.'); if(f.fEsp<0.90)lim.push('espaçamento');
      const isCLim = cLim.length > 0 && lim.filter(l=>!['N','P','K','pH','M.O.','espaçamento'].includes(l)).length >= lim.length/2;
      alertEl.style.cssText='display:block;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:500;background:#fffbeb;color:#b45309';
      alertEl.textContent= isCLim
        ? '⚠️ Clima limita esta cultura aqui. Fator(es): '+lim.join(', ')+'. Manejo de solo otimizado.'
        : '⚠️ Crescimento limitado. Ajuste: '+lim.join(', ')+'. Use ⚡ ajuste automático.';
    } else if (result.fGlobal >= 0.75) {
      alertEl.style.cssText='display:block;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:500;background:#f0fdf4;color:#15803d';
      alertEl.textContent='✓ Condições favoráveis para '+crop.nome+'. Produção estimada: '+last.freshYield.toFixed(1)+' '+crop.unidade+'.';
    } else {
      alertEl.style.cssText='display:block;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:500;background:#f8fafc;color:#475569';
      alertEl.textContent='ℹ️ Crescimento moderado. Otimize nutrição e irrigação para melhores resultados.';
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
  if (hDot) hDot.setAttribute('fill', last.health>65?'#3b6d11':last.health>38?'#d97706':'#dc2626');
  if (hLbl) hLbl.textContent = last.health>65?'✓':last.health>38?'!':'✗';

  _drawCrescPlant(cropKey, result.fGlobal, last.height, last.freshYield, result.ciclo);
  _updateCrescCharts(result, crop, cropKey);
  _updateCrescTable(result, crop, cropKey);
  _updateCrescDiagnostico();

  const ghg = _calcGHGBalance(cropKey, p, result);
  _updateGHGPanel(ghg, cropKey, crop);
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

  const crop = CRESC_CROPS[cropKey];
  const ct = crop ? crop.cropType : '';
  switch(cropKey) {
    case 'mandioca': _drawMandioca(ns,gRoots,gStem,gLeaves,health,height,freshYield); break;
    case 'tomate':   _drawTomate(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'banana':   _drawBanana(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'abacaxi':  _drawAbacaxi(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'melancia': _drawMelancia(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'acai':     _drawAcai(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'cupuacu':  _drawCupuacu(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'buriti':   _drawBuriti(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'caju':     _drawCaju(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    case 'manga':    _drawManga(ns,gStem,gLeaves,gFruit,health,height,freshYield); break;
    default:
      switch(ct) {
        case 'cereal':  _drawCereal(ns,gStem,gLeaves,gFruit,health,height,freshYield,crop); break;
        case 'legume':  _drawLegume(ns,gRoots,gStem,gLeaves,gFruit,health,height,freshYield,crop); break;
        case 'cane':    _drawCane(ns,gStem,gLeaves,health,height,freshYield); break;
        case 'herb':    _drawHerb(ns,gStem,gLeaves,gFruit,health,height,freshYield,crop); break;
        case 'root':    _drawRootCrop(ns,gRoots,gStem,gLeaves,health,height,freshYield,crop); break;
        case 'vine':    _drawVineCrop(ns,gStem,gLeaves,gFruit,health,height,freshYield,crop); break;
        case 'shrub':   _drawShrubCrop(ns,gStem,gLeaves,gFruit,health,height,freshYield,crop); break;
        case 'tree':    _drawTreeCrop(ns,gStem,gLeaves,gFruit,health,height,freshYield,crop); break;
        case 'palm':    _drawPalmCrop(ns,gStem,gLeaves,gFruit,health,height,freshYield,crop); break;
        default:        _drawShrubCrop(ns,gStem,gLeaves,gFruit,health,height,freshYield,crop); break;
      }
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
/* ─────────── GHG — BALANÇO DE GASES DE EFEITO ESTUFA ─────────── */
function _calcGHGBalance(cropKey, p, result) {
  const crop = CRESC_CROPS[cropKey];
  const cycleYrs = Math.max(0.08, crop.cicloBase / 12);

  // Emissões de N₂O por fertilização nitrogenada (IPCC 2006, EF=1%, GWP N₂O=298, fator 44/28)
  const n2oFert = p.N * 0.01 * (44/28) * 298;

  // Emissões de produção de fertilizantes (Lal 2004: N=4.4, P=1.5, K=0.7, S=0.5 kg CO₂/kg)
  const fertProd = p.N * 4.4 + p.P * 1.5 + p.K * 0.7 + p.S * 0.5;

  // Preparo do solo e operações (estimativa por tipologia de cultura · ciclo)
  const soilBase = {root:320, legume:180, cereal:230, tree:80, vine:260, shrub:200, cane:280, palm:70}[crop.cropType] ?? 200;
  const soilCO2 = soilBase * cycleYrs;

  // CH₄ de arroz inundado (IPCC 2006: ~20 kg CH₄/ha·season, GWP=28)
  const ch4 = cropKey === 'arroz' ? 5600 * cycleYrs : 0;

  const totalEmit = n2oFert + fertProd + soilCO2 + ch4;

  // Sequestro de C pela biomassa residual (Lal 2004, IPCC 2019)
  // Biomassa real = potencial × eficiência global
  const bmActual = crop.bmPotencial * result.fGlobal;
  const bmCO2 = bmActual * 1000 * 0.45 * (44/12); // t → kg, fração C=0.45, mol CO₂/C
  const retFrac = {root:0.20, legume:0.15, cereal:0.12, tree:0.35, vine:0.18, shrub:0.22, cane:0.18, palm:0.30}[crop.cropType] ?? 0.18;
  const cSeq = bmCO2 * retFrac * cycleYrs;

  return {
    n2o:       Math.round(n2oFert),
    fertProd:  Math.round(fertProd),
    soilCO2:   Math.round(soilCO2),
    ch4:       Math.round(ch4),
    totalEmit: Math.round(totalEmit),
    cSeq:      Math.round(cSeq),
    netBalance:Math.round(totalEmit - cSeq)
  };
}

function _updateGHGPanel(ghg, cropKey, crop) {
  if (_crescCharts['ghg']) { try { _crescCharts['ghg'].destroy(); } catch(e){} }
  const el = document.getElementById('cresc-chart-ghg');
  if (el) {
    const hasCH4 = ghg.ch4 > 0;
    // Horizontal stacked bar: Y = categories, X = kg CO₂eq
    const datasets = [
      { label:'N₂O fertilizante',    data:[ghg.n2o,      0], backgroundColor:'rgba(185,28,28,0.85)',  borderColor:'#b91c1c', borderWidth:1 },
      { label:'Prod. fertilizantes', data:[ghg.fertProd,  0], backgroundColor:'rgba(234,88,12,0.82)',  borderColor:'#ea580c', borderWidth:1 },
      { label:'Preparo solo / ops.', data:[ghg.soilCO2,   0], backgroundColor:'rgba(202,138,4,0.80)',  borderColor:'#ca8a04', borderWidth:1 },
    ];
    if (hasCH4) datasets.push(
      { label:'CH₄ arroz paddy',     data:[ghg.ch4,       0], backgroundColor:'rgba(109,40,217,0.82)', borderColor:'#7c3aed', borderWidth:1 }
    );
    datasets.push(
      { label:'Sequestro C biomassa',data:[0, ghg.cSeq],      backgroundColor:'rgba(22,163,74,0.85)',  borderColor:'#16a34a', borderWidth:1 }
    );

    _crescCharts['ghg'] = new Chart(el, {
      type: 'bar',
      data: { labels:['📤 Emissões totais','📥 Sequestro C'], datasets },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position:'bottom', labels:{ font:{size:9}, boxWidth:10, padding:5 } },
          tooltip: { callbacks: { label: ctx => ctx.raw > 0 ? ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString()} kg CO₂eq` : null } }
        },
        scales: {
          x: { stacked:true, beginAtZero:true, ticks:{ font:{size:9} }, title:{ display:true, text:'kg CO₂eq / ha / ciclo', font:{size:8} } },
          y: { stacked:true, ticks:{ font:{size:10}, color:'var(--text)' } }
        }
      }
    });
  }

  // Painel resumo GHG
  const sumEl = document.getElementById('cresc-ghg-summary');
  if (!sumEl) return;
  const net = ghg.netBalance;
  const isSink   = net <= 0;
  const isMod    = net > 0 && net < 800;
  const netColor = isSink ? '#15803d' : isMod ? '#b45309' : '#dc2626';
  const netBg    = isSink ? '#f0fdf4' : isMod ? '#fffbeb' : '#fef2f2';
  const netLabel = isSink ? '🌿 Sumidouro líquido' : isMod ? '⚠️ Emissão moderada' : '🔴 Emissor líquido';
  sumEl.innerHTML = `
    <div style="font-weight:700;color:var(--text);margin-bottom:6px;font-size:11px;border-bottom:1px solid var(--border);padding-bottom:5px">Balanço GEE</div>
    <div style="color:#b91c1c;font-weight:600;font-size:10px;margin-bottom:2px">📤 Emissões</div>
    <div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--text3)"><span>N₂O fertil.</span><b>${ghg.n2o.toLocaleString()}</b></div>
    <div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--text3)"><span>Prod. fertil.</span><b>${ghg.fertProd.toLocaleString()}</b></div>
    <div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--text3)"><span>Solo/ops.</span><b>${ghg.soilCO2.toLocaleString()}</b></div>
    ${ghg.ch4>0?`<div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--text3)"><span>CH₄ arroz</span><b>${ghg.ch4.toLocaleString()}</b></div>`:''}
    <div style="display:flex;justify-content:space-between;font-size:9.5px;font-weight:600;color:#b91c1c;border-top:1px solid var(--border);margin-top:2px;padding-top:2px"><span>Total emitido</span><b>${ghg.totalEmit.toLocaleString()}</b></div>
    <div style="color:#15803d;font-weight:600;font-size:10px;margin:6px 0 2px">📥 Sequestro C</div>
    <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#15803d"><span>Biomassa retida</span><b>${ghg.cSeq.toLocaleString()}</b></div>
    <div style="margin-top:8px;padding:6px 8px;border-radius:7px;background:${netBg};color:${netColor};font-weight:700;font-size:10px;text-align:center;line-height:1.4">${netLabel}<br><span style="font-size:13px">${Math.abs(net).toLocaleString()}</span> kg CO₂eq</div>
    <div style="font-size:8.5px;color:var(--text3);margin-top:3px;text-align:center">${isSink?'Balanço negativo (favorável ao clima)':'Emissão líquida por ha por ciclo'}</div>
  `;
}

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
/* ─────────── SVG — NOVAS CULTURAS ─────────── */
function _drawAcai(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(170,20+height*0.12);
  const sw=3+2*Math.min(1,height/800);
  // Estipe fino
  const st=document.createElementNS(ns,'path');
  st.setAttribute('d',`M${cx-sw},${cy} Q${cx-sw*0.8},${_svgN(cy-sH*0.5)} ${cx-sw*0.5},${_svgN(cy-sH)}`);
  st.setAttribute('stroke','#5a3518'); st.setAttribute('stroke-width',sw*2+'');
  st.setAttribute('fill','none'); st.setAttribute('opacity',Math.min(1,h+0.2)+''); gS.appendChild(st);
  // Cicatrizes foliares
  for(let k=0;k<4;k++){
    const lly=_svgN(cy-sH*(0.25+k*0.18));
    const ci=document.createElementNS(ns,'path');
    ci.setAttribute('d',`M${_svgN(cx-sw*1.5)},${lly} Q${cx},${_svgN(lly-2)} ${_svgN(cx+sw*1.5)},${lly}`);
    ci.setAttribute('stroke','#3a2010'); ci.setAttribute('stroke-width','0.8');
    ci.setAttribute('fill','none'); ci.setAttribute('opacity','0.5'); gS.appendChild(ci);
  }
  // Folhas pinadas
  if (h>0.08) {
    const lc=h>0.6?'#2d7a1a':'#4a9a2e';
    const nL=h>0.4?5:3;
    [[-1,-0.95],[-0.5,-1.05],[0,-1.10],[0.5,-1.02],[1.1,-0.92]].slice(0,nL).forEach(([ax,ay]) => {
      const llx=_svgN(cx+ax*50*Math.min(1,h+0.2));
      const lly=_svgN(cy-sH+ay*22*Math.min(1,h+0.2));
      const mx=_svgN(cx+(llx-cx)*0.5), my=_svgN(cy-sH+(lly-cy+sH)*0.5+6);
      const lf=document.createElementNS(ns,'path');
      lf.setAttribute('d',`M${cx},${_svgN(cy-sH)} Q${mx},${_svgN(my-8)} ${llx},${lly} Q${_svgN(mx+4)},${_svgN(my+4)} ${cx},${_svgN(cy-sH)} Z`);
      lf.setAttribute('fill',lc); lf.setAttribute('stroke','#1a5a08');
      lf.setAttribute('stroke-width','0.5'); lf.setAttribute('opacity',Math.min(1,h+0.2)+''); gL.appendChild(lf);
    });
  }
  // Cachos (bolinhas roxas)
  if (yld>0.5 && h>0.35) {
    const bOp=Math.min(1,yld/12);
    const bSc=Math.min(1,yld/18);
    [[-12,-18],[8,-22]].slice(0,Math.round(1+bSc)).forEach(([bx,by]) => {
      for(let k=0;k<Math.round(5+8*bSc);k++){
        const fx=_svgN(cx+bx+Math.sin(k*2.1)*9*bSc);
        const fy=_svgN(cy-sH+by+Math.cos(k*2.1)*7*bSc);
        const fr=document.createElementNS(ns,'circle');
        fr.setAttribute('cx',fx+''); fr.setAttribute('cy',fy+'');
        fr.setAttribute('r','2.5'); fr.setAttribute('fill','#4a148c');
        fr.setAttribute('stroke','#1a0044'); fr.setAttribute('stroke-width','0.4');
        fr.setAttribute('opacity',bOp.toFixed(2)); gF.appendChild(fr);
      }
    });
  }
}

function _drawCupuacu(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(150,15+height*0.18);
  const sw=5+4*Math.min(1,height/600);
  // Tronco
  const tr=document.createElementNS(ns,'path');
  tr.setAttribute('d',`M${cx-sw},${cy} L${_svgN(cx-sw*0.6)},${_svgN(cy-sH)} L${_svgN(cx+sw*0.6)},${_svgN(cy-sH)} L${cx+sw},${cy} Z`);
  tr.setAttribute('fill','#4a2c10'); tr.setAttribute('stroke','#2a1408');
  tr.setAttribute('stroke-width','0.7'); tr.setAttribute('opacity',Math.min(1,h+0.15)+''); gS.appendChild(tr);
  // Copa densa
  if (h>0.08) {
    const cr=Math.min(68,22+55*Math.min(1,h));
    const ch=Math.min(72,18+60*Math.min(1,h));
    const lc=h>0.6?'#2d6a14':'#4a8a22';
    const c1=document.createElementNS(ns,'ellipse');
    c1.setAttribute('cx',cx+''); c1.setAttribute('cy',_svgN(cy-sH-ch*0.38)+'');
    c1.setAttribute('rx',cr+''); c1.setAttribute('ry',_svgN(ch*0.65)+'');
    c1.setAttribute('fill',lc); c1.setAttribute('opacity','0.88'); gL.appendChild(c1);
    if (h>0.3) {
      const c2=document.createElementNS(ns,'ellipse');
      c2.setAttribute('cx',_svgN(cx-cr*0.2)+''); c2.setAttribute('cy',_svgN(cy-sH-ch*0.58)+'');
      c2.setAttribute('rx',_svgN(cr*0.55)+''); c2.setAttribute('ry',_svgN(ch*0.48)+'');
      c2.setAttribute('fill',h>0.6?'#3d7a1a':'#5a9a28');
      c2.setAttribute('opacity','0.65'); gL.appendChild(c2);
    }
  }
  // Frutos grandes ovais
  if (yld>0.5 && h>0.3) {
    const frOp=Math.min(1,yld/10);
    const frSc=Math.min(1,yld/14);
    [[-22,12],[8,5],[28,18]].slice(0,Math.round(1+2*frSc)).forEach(([dx,dy]) => {
      const fb=document.createElementNS(ns,'ellipse');
      fb.setAttribute('cx',_svgN(cx+dx)+''); fb.setAttribute('cy',_svgN(cy-sH*0.55+dy)+'');
      fb.setAttribute('rx',_svgN(8+6*frSc)+''); fb.setAttribute('ry',_svgN(12+9*frSc)+'');
      fb.setAttribute('fill','#6d4c41'); fb.setAttribute('stroke','#3e2723');
      fb.setAttribute('stroke-width','0.8'); fb.setAttribute('opacity',frOp.toFixed(2)); gF.appendChild(fb);
    });
  }
}

function _drawBuriti(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(175,10+height*0.088);
  const sw=6+5*Math.min(1,height/1500);
  // Estipe cilíndrico
  const st=document.createElementNS(ns,'path');
  st.setAttribute('d',`M${cx-sw},${cy} Q${_svgN(cx-sw*0.8)},${_svgN(cy-sH*0.6)} ${_svgN(cx-sw*0.65)},${_svgN(cy-sH)} L${_svgN(cx+sw*0.65)},${_svgN(cy-sH)} Q${_svgN(cx+sw*0.8)},${_svgN(cy-sH*0.6)} ${cx+sw},${cy} Z`);
  st.setAttribute('fill','#6d4c20'); st.setAttribute('stroke','#3a2010');
  st.setAttribute('stroke-width','0.8'); st.setAttribute('opacity',Math.min(1,h+0.2)+''); gS.appendChild(st);
  // Folhas em leque (fan palm)
  if (h>0.08) {
    const lc=h>0.6?'#1a5e0a':'#3a7a1e';
    const nL=h>0.5?7:h>0.25?5:3;
    const lLen=32+40*Math.min(1,h+0.1);
    for(let i=0;i<nL;i++){
      const ang=(-0.58+(i/(nL-1))*1.16)*Math.PI;
      const tipX=_svgN(cx+Math.cos(ang)*lLen);
      const tipY=_svgN(cy-sH+Math.sin(ang)*lLen*0.5+4);
      const perp=ang+Math.PI/2;
      const w=10+8*Math.min(1,h);
      const bx=cx, by=_svgN(cy-sH+2);
      const fan=document.createElementNS(ns,'path');
      fan.setAttribute('d',
        `M${bx},${by} Q${_svgN(cx+Math.cos(ang)*lLen*0.4+Math.cos(perp)*w)},${_svgN(cy-sH+Math.sin(ang)*lLen*0.4*0.5+Math.sin(perp)*w*0.5)} ${tipX},${tipY} Q${_svgN(cx+Math.cos(ang)*lLen*0.4-Math.cos(perp)*w)},${_svgN(cy-sH+Math.sin(ang)*lLen*0.4*0.5-Math.sin(perp)*w*0.5)} ${bx},${by} Z`);
      fan.setAttribute('fill',lc); fan.setAttribute('stroke','#0f3008');
      fan.setAttribute('stroke-width','0.5'); fan.setAttribute('opacity',Math.min(1,h+0.15)+''); gL.appendChild(fan);
    }
  }
  // Cacho (frutos escamosos alaranjados)
  if (yld>0.3 && h>0.4) {
    const bOp=Math.min(1,yld/8);
    const bSc=Math.min(1,yld/12);
    const nc=Math.round(4+7*bSc);
    for(let k=0;k<nc;k++){
      const fx=_svgN(cx+8+Math.sin(k*1.9)*14*bSc);
      const fy=_svgN(cy-sH-14+Math.cos(k*1.9)*10*bSc);
      const fr=document.createElementNS(ns,'circle');
      fr.setAttribute('cx',fx+''); fr.setAttribute('cy',fy+'');
      fr.setAttribute('r',_svgN(3+2.5*bSc)+''); fr.setAttribute('fill','#e64a00');
      fr.setAttribute('stroke','#bf360c'); fr.setAttribute('stroke-width','0.5');
      fr.setAttribute('opacity',bOp.toFixed(2)); gF.appendChild(fr);
    }
  }
}

function _drawCaju(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(135,18+height*0.11);
  const sw=5+4*Math.min(1,height/900);
  // Tronco tortuoso
  const tr=document.createElementNS(ns,'path');
  tr.setAttribute('d',`M${cx-sw},${cy} Q${_svgN(cx+4)},${_svgN(cy-sH*0.45)} ${_svgN(cx-3)},${_svgN(cy-sH)} L${_svgN(cx+sw*0.7)},${_svgN(cy-sH)} Q${cx+sw},${_svgN(cy-sH*0.45)} ${cx+sw},${cy} Z`);
  tr.setAttribute('fill','#5a3515'); tr.setAttribute('stroke','#3a2010');
  tr.setAttribute('stroke-width','0.7'); tr.setAttribute('opacity',Math.min(1,h+0.15)+''); gS.appendChild(tr);
  // Copa larga e baixa
  if (h>0.08) {
    const cr=Math.min(72,18+65*Math.min(1,h));
    const ch=Math.min(55,12+48*Math.min(1,h));
    const lc=h>0.6?'#2a6010':'#3a8018';
    [[0,0,1.0],[cx*0.2,ch*0.18,0.75],[-cx*0.15,ch*0.22,0.72]].forEach(([dx,dy,sc]) => {
      const c=document.createElementNS(ns,'ellipse');
      c.setAttribute('cx',_svgN(cx+dx)+''); c.setAttribute('cy',_svgN(cy-sH-ch*0.38+dy)+'');
      c.setAttribute('rx',_svgN(cr*sc)+''); c.setAttribute('ry',_svgN(ch*0.62*sc)+'');
      c.setAttribute('fill',lc); c.setAttribute('opacity',Math.min(0.9,h+0.08)+''); gL.appendChild(c);
    });
  }
  // Pedúnculo (pera) + castanha
  if (yld>0.5 && h>0.3) {
    const frOp=Math.min(1,yld/10);
    const frSc=Math.min(1,yld/14);
    [[-18,8],[12,2],[0,-10]].slice(0,Math.round(1+2*frSc)).forEach(([dx,dy]) => {
      const fx=_svgN(cx+dx), fy=_svgN(cy-sH*0.55+dy);
      const fh=_svgN(8+7*frSc);
      const pe=document.createElementNS(ns,'path');
      pe.setAttribute('d',`M${_svgN(fx-5*frSc)},${_svgN(fy+fh*0.4)} Q${_svgN(fx-7*frSc)},${fy} ${fx},${_svgN(fy-fh*0.7)} Q${_svgN(fx+7*frSc)},${fy} ${_svgN(fx+5*frSc)},${_svgN(fy+fh*0.4)} Z`);
      pe.setAttribute('fill',yld>7?'#f44336':'#ff8f00'); pe.setAttribute('stroke','#c62828');
      pe.setAttribute('stroke-width','0.5'); pe.setAttribute('opacity',frOp.toFixed(2)); gF.appendChild(pe);
      const ca=document.createElementNS(ns,'path');
      ca.setAttribute('d',`M${fx},${_svgN(fy-fh*0.7)} Q${_svgN(fx+8)},${_svgN(fy-fh*1.1)} ${_svgN(fx+3)},${_svgN(fy-fh*1.5)} Q${_svgN(fx-4)},${_svgN(fy-fh*1.1)} ${fx},${_svgN(fy-fh*0.7)} Z`);
      ca.setAttribute('fill','#795548'); ca.setAttribute('opacity',(frOp*0.9).toFixed(2)); gF.appendChild(ca);
    });
  }
}

function _drawManga(ns,gS,gL,gF,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(155,22+height*0.09);
  const sw=6+5*Math.min(1,height/1200);
  // Tronco reto
  const tr=document.createElementNS(ns,'path');
  tr.setAttribute('d',`M${cx-sw},${cy} L${_svgN(cx-sw*0.75)},${_svgN(cy-sH)} L${_svgN(cx+sw*0.75)},${_svgN(cy-sH)} L${cx+sw},${cy} Z`);
  tr.setAttribute('fill','#4a2c10'); tr.setAttribute('stroke','#2a1408');
  tr.setAttribute('stroke-width','0.7'); tr.setAttribute('opacity',Math.min(1,h+0.2)+''); gS.appendChild(tr);
  // Copa densa arredondada (mangueira)
  if (h>0.08) {
    const cr=Math.min(78,20+68*Math.min(1,h));
    const ch=Math.min(85,16+75*Math.min(1,h));
    const lc=h>0.6?'#1a5e08':'#2a7a12';
    const c1=document.createElementNS(ns,'ellipse');
    c1.setAttribute('cx',cx+''); c1.setAttribute('cy',_svgN(cy-sH-ch*0.40)+'');
    c1.setAttribute('rx',cr+''); c1.setAttribute('ry',_svgN(ch*0.60)+'');
    c1.setAttribute('fill',lc); c1.setAttribute('opacity','0.92'); gL.appendChild(c1);
    const c2=document.createElementNS(ns,'ellipse');
    c2.setAttribute('cx',_svgN(cx-cr*0.1)+''); c2.setAttribute('cy',_svgN(cy-sH-ch*0.62)+'');
    c2.setAttribute('rx',_svgN(cr*0.62)+''); c2.setAttribute('ry',_svgN(ch*0.40)+'');
    c2.setAttribute('fill',h>0.6?'#2d7a14':'#3d9020');
    c2.setAttribute('opacity','0.70'); gL.appendChild(c2);
  }
  // Mangas (formato gota/rim)
  if (yld>1 && h>0.3) {
    const frOp=Math.min(1,yld/15);
    const frSc=Math.min(1,yld/22);
    [[-24,-8],[14,-18],[36,0],[-8,-22],[26,-6]].slice(0,Math.round(1+4*frSc)).forEach(([dx,dy]) => {
      const fx=_svgN(cx+dx), fy=_svgN(cy-sH*0.45+dy);
      const fw=_svgN(5+6*frSc), fh2=_svgN(8+9*frSc);
      const mg=document.createElementNS(ns,'path');
      mg.setAttribute('d',`M${fx},${_svgN(fy-fh2-3)} Q${_svgN(fx+fw+3)},${fy} ${fx},${_svgN(fy+fh2)} Q${_svgN(fx-fw-3)},${fy} ${fx},${_svgN(fy-fh2-3)} Z`);
      mg.setAttribute('fill',yld>15?'#ff8f00':'#ffa000'); mg.setAttribute('stroke','#e65100');
      mg.setAttribute('stroke-width','0.5'); mg.setAttribute('opacity',frOp.toFixed(2)); gF.appendChild(mg);
    });
  }
}

/* ─────────── SVG GENÉRICOS POR TIPO ─────────── */

function _drawCereal(ns,gS,gL,gF,h,height,yld,crop) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const cor = (crop&&crop.cor)||'#f9a825';
  const sH=Math.min(155,12+height*0.55);
  const sw=2.5+1.5*Math.min(1,height/200);
  // Colmos (3-5 perfilhos)
  const nC=h>0.5?5:h>0.25?3:1;
  const offsets=[-22,-11,0,11,22].slice(0,nC).map((x,i)=>x+(i%2===0?0:3));
  offsets.forEach(ox => {
    const p=document.createElementNS(ns,'path');
    const bend=ox*0.25;
    p.setAttribute('d',`M${cx+ox},${cy} Q${cx+ox+bend},${cy-sH*0.5} ${_svgN(cx+ox+bend*1.5)},${_svgN(cy-sH)}`);
    p.setAttribute('stroke','url(#cg-stem)'); p.setAttribute('stroke-width',sw+'');
    p.setAttribute('fill','none'); p.setAttribute('opacity',Math.min(1,h+0.1)+''); gS.appendChild(p);
    // Folhas
    if (h>0.15) {
      [0.35,0.65].forEach((t,li) => {
        const ty=cy-sH*t, td=li%2===0?1:-1;
        const lf=document.createElementNS(ns,'path');
        lf.setAttribute('d',`M${_svgN(cx+ox+bend*t)},${_svgN(ty)} Q${_svgN(cx+ox+bend*t+td*28)},${_svgN(ty-12)} ${_svgN(cx+ox+bend*t+td*42)},${_svgN(ty+4)}`);
        lf.setAttribute('stroke',h>0.55?'#3a8a10':'#5a9a20'); lf.setAttribute('stroke-width','1.8');
        lf.setAttribute('fill','none'); lf.setAttribute('opacity','0.88'); gL.appendChild(lf);
      });
    }
    // Espiga/panícula
    if (h>0.4 && yld>0.1) {
      const esc=Math.min(1,yld/(crop?crop.prodMax*0.5:5));
      const eH=_svgN(8+18*esc), eW=_svgN(3+4*esc);
      const ex=_svgN(cx+ox+bend*1.5), ey=_svgN(cy-sH-eH*0.5);
      const grain=document.createElementNS(ns,'ellipse');
      grain.setAttribute('cx',ex+''); grain.setAttribute('cy',ey+'');
      grain.setAttribute('rx',eW+''); grain.setAttribute('ry',eH+'');
      grain.setAttribute('fill',cor); grain.setAttribute('stroke','#a06010');
      grain.setAttribute('stroke-width','0.5'); grain.setAttribute('opacity',(0.5+0.5*esc).toFixed(2)); gF.appendChild(grain);
    }
  });
}

function _drawLegume(ns,gR,gS,gL,gF,h,height,yld,crop) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const cor=(crop&&crop.cor)||'#795548';
  const sH=Math.min(90,8+height*0.45);
  const sw=2+1.5*Math.min(1,height/150);
  // Nódulos radiculares (leguminosas)
  if (h>0.2) {
    [-18,-8,2,12,22].forEach((ox,i) => {
      const ny=cy+6+i*3, nx=cx+ox;
      const nd=document.createElementNS(ns,'circle');
      nd.setAttribute('cx',nx+''); nd.setAttribute('cy',ny+''); nd.setAttribute('r','2.5');
      nd.setAttribute('fill','#f87171'); nd.setAttribute('opacity',(0.4+0.5*Math.min(1,h)).toFixed(2)); gR.appendChild(nd);
    });
  }
  // Caule principal
  const st=document.createElementNS(ns,'path');
  st.setAttribute('d',`M${cx},${cy} Q${cx-8},${cy-sH*0.5} ${cx},${_svgN(cy-sH)}`);
  st.setAttribute('stroke','url(#cg-stem)'); st.setAttribute('stroke-width',sw+'');
  st.setAttribute('fill','none'); st.setAttribute('opacity',Math.min(1,h+0.1)+''); gS.appendChild(st);
  // Folhas trifolioladas
  if (h>0.15) {
    [0.3,0.55,0.8].forEach((t,ti) => {
      const ty=_svgN(cy-sH*t), tx=_svgN(cx+(ti%2===0?-6:4));
      [-1,0,1].forEach(d => {
        const lf=document.createElementNS(ns,'ellipse');
        lf.setAttribute('cx',_svgN(+tx+d*12)+''); lf.setAttribute('cy',_svgN(ty-d*5)+'');
        lf.setAttribute('rx','6'); lf.setAttribute('ry','4');
        lf.setAttribute('fill',h>0.55?'#2e7a14':'#4a9a24'); lf.setAttribute('opacity','0.85'); gL.appendChild(lf);
      });
    });
  }
  // Vagens
  if (yld>0.1 && h>0.4) {
    const sc=Math.min(1,yld/(crop?crop.prodMax*0.5:2));
    const nV=Math.round(1+4*sc);
    for (let i=0;i<nV;i++) {
      const vx=_svgN(cx-20+i*12), vy=_svgN(cy-sH*0.35-i*8);
      const vg=document.createElementNS(ns,'path');
      vg.setAttribute('d',`M${vx},${vy} Q${_svgN(+vx+15)},${_svgN(vy-4)} ${_svgN(+vx+22)},${vy}`);
      vg.setAttribute('stroke',cor); vg.setAttribute('stroke-width',_svgN(3+3*sc)+'');
      vg.setAttribute('fill','none'); vg.setAttribute('stroke-linecap','round');
      vg.setAttribute('opacity',(0.5+0.5*sc).toFixed(2)); gF.appendChild(vg);
    }
  }
}

function _drawCane(ns,gS,gL,h,height,yld) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const sH=Math.min(170,10+height*0.60);
  const nC=h>0.6?7:h>0.35?5:3;
  const offs=[-30,-18,-8,2,12,22,32].slice(0,nC);
  offs.forEach((ox,i) => {
    const sw=2.5+1.5*Math.min(1,height/350);
    const bend=ox*0.15;
    // Colmo da cana (com internós)
    for (let seg=0;seg<5;seg++) {
      const sy1=cy-sH*(seg/5), sy2=cy-sH*((seg+1)/5);
      const r=document.createElementNS(ns,'rect');
      r.setAttribute('x',_svgN(cx+ox-sw)+''); r.setAttribute('y',_svgN(sy2)+'');
      r.setAttribute('width',_svgN(sw*2)+''); r.setAttribute('height',_svgN(sy1-sy2)+'');
      r.setAttribute('fill',seg%2===0?'#4a8a20':'#5a9a28');
      r.setAttribute('opacity',Math.min(1,h+0.15)+''); gS.appendChild(r);
      // Nó (internó)
      const nd=document.createElementNS(ns,'line');
      nd.setAttribute('x1',_svgN(cx+ox-sw-1)+''); nd.setAttribute('y1',_svgN(sy1)+'');
      nd.setAttribute('x2',_svgN(cx+ox+sw+1)+''); nd.setAttribute('y2',_svgN(sy1)+'');
      nd.setAttribute('stroke','#2a5a08'); nd.setAttribute('stroke-width','1.5'); gS.appendChild(nd);
    }
    // Folhas longas na ponta
    if (h>0.25) {
      [-1,0,1].forEach(d => {
        const lf=document.createElementNS(ns,'path');
        lf.setAttribute('d',`M${_svgN(cx+ox)},${_svgN(cy-sH)} Q${_svgN(cx+ox+d*30)},${_svgN(cy-sH-15)} ${_svgN(cx+ox+d*50)},${_svgN(cy-sH+5)}`);
        lf.setAttribute('stroke',h>0.55?'#2e8010':'#3a9a1a'); lf.setAttribute('stroke-width','1.6');
        lf.setAttribute('fill','none'); lf.setAttribute('opacity','0.82'); gL.appendChild(lf);
      });
    }
  });
}

function _drawHerb(ns,gS,gL,gF,h,height,yld,crop) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const cor=(crop&&crop.cor)||'#66bb6a';
  const sH=Math.min(45,4+height*0.8);
  const nF=h>0.6?8:h>0.3?5:3;
  const angles=[];
  for(let i=0;i<nF;i++) angles.push((i/(nF-1||1))*180-90);
  angles.forEach((ang,i) => {
    const rad=ang*Math.PI/180;
    const lLen=10+sH*0.85;
    const ex=_svgN(cx+Math.sin(rad)*lLen), ey=_svgN(cy-Math.cos(rad)*lLen*0.7);
    const fw=_svgN(4+8*Math.min(1,h)), fh2=_svgN(6+18*Math.min(1,h));
    // Caule da folha
    const stem=document.createElementNS(ns,'line');
    stem.setAttribute('x1',cx+''); stem.setAttribute('y1',cy+'');
    stem.setAttribute('x2',ex+''); stem.setAttribute('y2',ey+'');
    stem.setAttribute('stroke','#4a8a14'); stem.setAttribute('stroke-width','1.2');
    stem.setAttribute('opacity',Math.min(1,h+0.1)+''); gS.appendChild(stem);
    // Lâmina foliar
    const lf=document.createElementNS(ns,'ellipse');
    lf.setAttribute('cx',ex+''); lf.setAttribute('cy',ey+'');
    lf.setAttribute('rx',fw+''); lf.setAttribute('ry',fh2+'');
    lf.setAttribute('transform',`rotate(${ang},${ex},${ey})`);
    lf.setAttribute('fill',h>0.6?cor:'#7acc7a'); lf.setAttribute('opacity','0.88'); gL.appendChild(lf);
  });
  // Cabeça de alface (se alto crescimento)
  if (h>0.55 && (crop&&crop.nome&&crop.nome.toLowerCase().includes('alface'))) {
    const hd=document.createElementNS(ns,'ellipse');
    hd.setAttribute('cx',cx+''); hd.setAttribute('cy',_svgN(cy-4)+'');
    hd.setAttribute('rx',_svgN(12+10*Math.min(1,h))+''); hd.setAttribute('ry',_svgN(8+6*Math.min(1,h))+'');
    hd.setAttribute('fill',cor); hd.setAttribute('opacity','0.45'); gL.appendChild(hd);
  }
}

function _drawRootCrop(ns,gR,gS,gL,h,height,yld,crop) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const cor=(crop&&crop.cor)||'#7b5ea7';
  const sH=Math.min(60,6+height*0.55);
  const sc=Math.min(1,yld/(crop?crop.prodMax*0.5:12));
  // Tubérculos/raízes tuberosas
  if (sc>0.05) {
    [-24,-12,0,12,24].slice(0,Math.round(1+4*sc)).forEach((ox,i) => {
      const tw=_svgN(5+7*sc), th=_svgN(8+14*sc);
      const tx=_svgN(cx+ox+(i%2===0?0:4)), ty=_svgN(cy+8+i*2);
      const tb=document.createElementNS(ns,'ellipse');
      tb.setAttribute('cx',tx+''); tb.setAttribute('cy',ty+'');
      tb.setAttribute('rx',tw+''); tb.setAttribute('ry',th+'');
      tb.setAttribute('fill',cor); tb.setAttribute('stroke','#5a3080');
      tb.setAttribute('stroke-width','0.6'); tb.setAttribute('opacity',(0.5+0.5*sc).toFixed(2)); gR.appendChild(tb);
    });
  }
  // Folhas basais
  const nF=h>0.5?6:h>0.25?4:2;
  for(let i=0;i<nF;i++) {
    const ang=((i/(nF-1||1))*160-80)*Math.PI/180;
    const lLen=sH*0.9;
    const ex=_svgN(cx+Math.sin(ang)*lLen), ey=_svgN(cy-Math.cos(ang)*lLen*0.55);
    const lf=document.createElementNS(ns,'path');
    lf.setAttribute('d',`M${cx},${cy} Q${_svgN(cx+Math.sin(ang)*lLen*0.5+Math.cos(ang)*8)},${_svgN(cy-Math.cos(ang)*lLen*0.3)} ${ex},${ey}`);
    lf.setAttribute('stroke',h>0.55?'#2e7a14':'#4a9a24'); lf.setAttribute('stroke-width','2');
    lf.setAttribute('fill','none'); lf.setAttribute('opacity','0.85'); gL.appendChild(lf);
  }
}

function _drawVineCrop(ns,gS,gL,gF,h,height,yld,crop) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const cor=(crop&&crop.cor)||'#fbc02d';
  const sH=Math.min(100,8+height*0.5);
  // Ramas horizontais (trepadeira/rasteira)
  const nR=h>0.5?3:2;
  for(let r=0;r<nR;r++) {
    const dir=r%2===0?1:-1;
    const rY=_svgN(cy-sH*(0.2+r*0.3));
    const rm=document.createElementNS(ns,'path');
    rm.setAttribute('d',`M${cx},${rY} Q${_svgN(cx+dir*30)},${_svgN(+rY-12)} ${_svgN(cx+dir*55)},${rY}`);
    rm.setAttribute('stroke','#4a7a14'); rm.setAttribute('stroke-width','2');
    rm.setAttribute('fill','none'); rm.setAttribute('opacity',Math.min(1,h+0.1)+''); gS.appendChild(rm);
    // Gavinhas
    if (h>0.3) {
      const gv=document.createElementNS(ns,'path');
      gv.setAttribute('d',`M${_svgN(cx+dir*35)},${rY} Q${_svgN(cx+dir*42)},${_svgN(+rY-10)} ${_svgN(cx+dir*38)},${_svgN(+rY-16)}`);
      gv.setAttribute('stroke','#4a7a14'); gv.setAttribute('stroke-width','1');
      gv.setAttribute('fill','none'); gS.appendChild(gv);
    }
    // Folhas na rama
    [0.3,0.7].forEach(t => {
      const lx=_svgN(cx+dir*55*t), ly=_svgN(+rY-12*t);
      const lf=document.createElementNS(ns,'circle');
      lf.setAttribute('cx',lx+''); lf.setAttribute('cy',ly+'');
      lf.setAttribute('r',_svgN(6+6*Math.min(1,h))+'');
      lf.setAttribute('fill',h>0.55?'#2e7a14':'#4a9a24'); lf.setAttribute('opacity','0.80'); gL.appendChild(lf);
    });
  }
  // Caule principal
  const st=document.createElementNS(ns,'line');
  st.setAttribute('x1',cx+''); st.setAttribute('y1',cy+'');
  st.setAttribute('x2',cx+''); st.setAttribute('y2',_svgN(cy-sH)+'');
  st.setAttribute('stroke','url(#cg-stem)'); st.setAttribute('stroke-width','3');
  st.setAttribute('opacity',Math.min(1,h+0.1)+''); gS.appendChild(st);
  // Frutos na rama
  if (yld>0.5 && h>0.4) {
    const sc=Math.min(1,yld/(crop?crop.prodMax*0.5:15));
    [[-45,0],[35,-10]].slice(0,Math.round(1+sc)).forEach(([dx,dy]) => {
      const fEl=document.createElementNS(ns,'ellipse');
      fEl.setAttribute('cx',_svgN(cx+dx)+''); fEl.setAttribute('cy',_svgN(cy-sH*0.25+dy)+'');
      fEl.setAttribute('rx',_svgN(8+10*sc)+''); fEl.setAttribute('ry',_svgN(6+8*sc)+'');
      fEl.setAttribute('fill',cor); fEl.setAttribute('stroke','#a06010');
      fEl.setAttribute('stroke-width','0.6'); fEl.setAttribute('opacity',(0.6+0.4*sc).toFixed(2)); gF.appendChild(fEl);
    });
  }
}

function _drawShrubCrop(ns,gS,gL,gF,h,height,yld,crop) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const cor=(crop&&crop.cor)||'#43a047';
  const sH=Math.min(120,8+height*0.5);
  const sw=3+2.5*Math.min(1,height/200);
  // Múltiplos ramos principais
  const branches=[[-18,-1],[0,0],[18,1]];
  branches.forEach(([bx,bd]) => {
    const tx=_svgN(cx+bx+bd*15), ty=_svgN(cy-sH);
    const br=document.createElementNS(ns,'path');
    br.setAttribute('d',`M${cx},${cy} Q${_svgN(cx+bx*0.5)},${_svgN(cy-sH*0.5)} ${tx},${ty}`);
    br.setAttribute('stroke','url(#cg-stem)'); br.setAttribute('stroke-width',sw+'');
    br.setAttribute('fill','none'); br.setAttribute('opacity',Math.min(1,h+0.15)+''); gS.appendChild(br);
    // Copa arbustiva
    if (h>0.1) {
      const cr=_svgN(14+22*Math.min(1,h));
      const cp=document.createElementNS(ns,'circle');
      cp.setAttribute('cx',tx+''); cp.setAttribute('cy',_svgN(+ty-cr*0.3)+'');
      cp.setAttribute('r',cr+'');
      cp.setAttribute('fill',h>0.6?'#1a5e08':'#2a7a12'); cp.setAttribute('opacity','0.82'); gL.appendChild(cp);
    }
  });
  // Frutos
  if (yld>0.5 && h>0.35) {
    const sc=Math.min(1,yld/(crop?crop.prodMax*0.5:25));
    const nFr=Math.round(2+6*sc);
    for(let i=0;i<nFr;i++) {
      const angle=((i/nFr)*2*Math.PI);
      const r=_svgN(12+25*sc);
      const fx=_svgN(cx+Math.cos(angle)*r*0.9);
      const fy=_svgN(cy-sH*0.6+Math.sin(angle)*r*0.5);
      const fr=document.createElementNS(ns,'circle');
      fr.setAttribute('cx',fx+''); fr.setAttribute('cy',fy+'');
      fr.setAttribute('r',_svgN(3+5*sc)+'');
      fr.setAttribute('fill',cor); fr.setAttribute('stroke','#a06010');
      fr.setAttribute('stroke-width','0.5'); fr.setAttribute('opacity',(0.55+0.45*sc).toFixed(2)); gF.appendChild(fr);
    }
  }
}

function _drawTreeCrop(ns,gS,gL,gF,h,height,yld,crop) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const cor=(crop&&crop.cor)||'#388e3c';
  const sH=Math.min(160,15+height*0.08);
  const sw=5+6*Math.min(1,height/1200);
  // Tronco
  const tr=document.createElementNS(ns,'path');
  tr.setAttribute('d',`M${_svgN(cx-sw)},${cy} L${_svgN(cx-sw*0.65)},${_svgN(cy-sH)} L${_svgN(cx+sw*0.65)},${_svgN(cy-sH)} L${_svgN(cx+sw)},${cy} Z`);
  tr.setAttribute('fill','#4a2c10'); tr.setAttribute('stroke','#2a1408');
  tr.setAttribute('stroke-width','0.7'); tr.setAttribute('opacity',Math.min(1,h+0.2)+''); gS.appendChild(tr);
  // Copa
  if (h>0.08) {
    const cr=_svgN(22+60*Math.min(1,h));
    const ch=_svgN(18+68*Math.min(1,h));
    const lc=h>0.6?'#1a5e08':'#2a7a12';
    [[0,0],[1,0.35],[0,0.65],[-1,0.35]].forEach(([dx,dy]) => {
      const el=document.createElementNS(ns,'ellipse');
      el.setAttribute('cx',_svgN(cx+dx*cr*0.4)+''); el.setAttribute('cy',_svgN(cy-sH-ch*0.35+dy*ch*0.3)+'');
      el.setAttribute('rx',_svgN(cr*(0.7+Math.abs(dy)*0.3))+''); el.setAttribute('ry',_svgN(ch*(0.5+dy*0.2))+'');
      el.setAttribute('fill',lc); el.setAttribute('opacity',(0.70+dy*0.15).toFixed(2)); gL.appendChild(el);
    });
  }
  // Frutos
  if (yld>0.5 && h>0.3) {
    const sc=Math.min(1,yld/(crop?crop.prodMax*0.5:15));
    const nFr=Math.round(2+8*sc);
    for(let i=0;i<nFr;i++) {
      const ang=(i/nFr)*2*Math.PI;
      const r=_svgN(18+35*sc);
      const fx=_svgN(cx+Math.cos(ang)*r); const fy=_svgN(cy-sH*0.55+Math.sin(ang)*r*0.4);
      const fr=document.createElementNS(ns,'circle');
      fr.setAttribute('cx',fx+''); fr.setAttribute('cy',fy+'');
      fr.setAttribute('r',_svgN(3+6*sc)+'');
      fr.setAttribute('fill',cor); fr.setAttribute('stroke','#5a3010');
      fr.setAttribute('stroke-width','0.5'); fr.setAttribute('opacity',(0.55+0.45*sc).toFixed(2)); gF.appendChild(fr);
    }
  }
}

function _drawPalmCrop(ns,gS,gL,gF,h,height,yld,crop) {
  const cy=CRESC_GY, cx=CRESC_CX;
  const cor=(crop&&crop.cor)||'#4e342e';
  const sH=Math.min(165,12+height*0.09);
  const sw=5+4*Math.min(1,height/1500);
  // Estipe (tronco de palmeira)
  const nSegs=6;
  for(let s=0;s<nSegs;s++) {
    const sy1=_svgN(cy-sH*(s/nSegs)), sy2=_svgN(cy-sH*((s+1)/nSegs));
    const w1=_svgN(sw*(1-s/nSegs*0.25)), w2=_svgN(sw*(1-(s+1)/nSegs*0.25));
    const seg=document.createElementNS(ns,'path');
    seg.setAttribute('d',`M${_svgN(cx-w1)},${sy1} L${_svgN(cx-w2)},${sy2} L${_svgN(cx+w2)},${sy2} L${_svgN(cx+w1)},${sy1} Z`);
    seg.setAttribute('fill',s%2===0?'#5a3a18':'#6a4a20'); seg.setAttribute('opacity',Math.min(1,h+0.15)+''); gS.appendChild(seg);
    const ring=document.createElementNS(ns,'line');
    ring.setAttribute('x1',_svgN(cx-w1-1)+''); ring.setAttribute('y1',sy1+'');
    ring.setAttribute('x2',_svgN(cx+w1+1)+''); ring.setAttribute('y2',sy1+'');
    ring.setAttribute('stroke','#3a2008'); ring.setAttribute('stroke-width','1'); gS.appendChild(ring);
  }
  // Folhas pinadas
  if (h>0.12) {
    const nLeaves=h>0.55?7:h>0.3?5:3;
    for(let i=0;i<nLeaves;i++) {
      const ang=((i/(nLeaves-1||1))*160-80)*Math.PI/180;
      const lLen=_svgN(20+75*Math.min(1,h));
      const ex=_svgN(cx+Math.sin(ang)*lLen), ey=_svgN(cy-sH-Math.cos(ang)*lLen*0.5);
      const lf=document.createElementNS(ns,'path');
      lf.setAttribute('d',`M${cx},${_svgN(cy-sH)} Q${_svgN(cx+Math.sin(ang)*lLen*0.5)},${_svgN(cy-sH-Math.cos(ang)*lLen*0.35)} ${ex},${ey}`);
      lf.setAttribute('stroke',h>0.55?'#1e6e04':'#2e8a12'); lf.setAttribute('stroke-width','2.5');
      lf.setAttribute('fill','none'); lf.setAttribute('opacity','0.88'); gL.appendChild(lf);
      // Pinas ao longo da folha
      if (h>0.3) {
        for(let p=1;p<=4;p++) {
          const t=p/5;
          const px=_svgN(cx+Math.sin(ang)*lLen*t);
          const py=_svgN(cy-sH-Math.cos(ang)*lLen*t*0.5);
          const pn=document.createElementNS(ns,'line');
          const perpAng=ang+Math.PI/2;
          pn.setAttribute('x1',px+''); pn.setAttribute('y1',py+'');
          pn.setAttribute('x2',_svgN(+px+Math.sin(perpAng)*12)+'');
          pn.setAttribute('y2',_svgN(+py+Math.cos(perpAng)*6)+'');
          pn.setAttribute('stroke','#2e8a12'); pn.setAttribute('stroke-width','1'); gL.appendChild(pn);
        }
      }
    }
  }
  // Cachos/frutos
  if (yld>0.5 && h>0.4) {
    const sc=Math.min(1,yld/(crop?Math.max(crop.prodMax*0.5,80):80));
    const cacheEl=document.createElementNS(ns,'ellipse');
    cacheEl.setAttribute('cx',cx+''); cacheEl.setAttribute('cy',_svgN(cy-sH+8)+'');
    cacheEl.setAttribute('rx',_svgN(12+14*sc)+''); cacheEl.setAttribute('ry',_svgN(8+10*sc)+'');
    cacheEl.setAttribute('fill',cor); cacheEl.setAttribute('stroke','#2a1808');
    cacheEl.setAttribute('stroke-width','0.8'); cacheEl.setAttribute('opacity',(0.55+0.45*sc).toFixed(2)); gF.appendChild(cacheEl);
  }
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
  const tblStep = crop.tblStep || 1;
  result.months.forEach((m, i) => {
    if (tblStep > 1 && m.m % tblStep !== 0 && m.m !== result.ciclo) return;
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
