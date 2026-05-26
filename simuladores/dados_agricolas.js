// Dados Agrícolas Reais — Simuladores de Plantio
// Fontes: Embrapa Gado de Corte 2022, Embrapa Florestas 2023,
//         Embrapa Amazônia Oriental 2022-2023, CONAB 2023, MAPA 2023,
//         Embrapa Pesca e Aquicultura 2022-2023, Embrapa Cerrados 2022-2023,
//         Embrapa Cocais/MA 2022-2023, CEPLAC 2023, MIQCB 2022

const SA_SYSTEMS = {
  ilp: {
    label: 'ILP', icon: '🐄', color: '#60a5fa',
    desc: 'Integração Lavoura-Pecuária em rotação/sucessão',
    variants: [
      {
        id: 'ilp_soja_braq',
        label: 'Soja + Braquiária Marandu',
        desc: 'Soja na safra (espaçamento 0.5m × 0.45m) consorciada com Brachiaria brizantha CV. Marandu semeada no pré-colheita. Modelo predominante no oeste do MA.',
        species: [
          { name: 'Soja (Glycine max)', icon: '🌿', color: '#a3e635', crown: 0.20, height: 0.9 },
          { name: 'Braquiária Marandu', icon: '🌱', color: '#4ade80', crown: 0.30, height: 0.6 }
        ],
        spacingRow: 0.50, spacingPlant: 0.45,
        invest_ha: 2800, renda_ha: 2100, carbon_ha: 1.1, agua_ha: 650,
        empregos: 6, biodiv: 4.5,
        fonte: 'Embrapa Gado de Corte, 2022; CONAB 2023'
      },
      {
        id: 'ilp_milho_braq',
        label: 'Milho Safrinha + Braquiária Ruziziensis',
        desc: 'Milho safrinha consorciado com Brachiaria ruziziensis — modelo recomendado para Cerrado/MA. Braquiária semeada junto ao milho na entressafra.',
        species: [
          { name: 'Milho (Zea mays)', icon: '🌽', color: '#fbbf24', crown: 0.30, height: 2.0 },
          { name: 'B. ruziziensis', icon: '🌱', color: '#86efac', crown: 0.25, height: 0.5 }
        ],
        spacingRow: 0.90, spacingPlant: 0.20,
        invest_ha: 2200, renda_ha: 1800, carbon_ha: 1.3, agua_ha: 580,
        empregos: 5, biodiv: 4.2,
        fonte: 'Embrapa Milho e Sorgo, 2023; CONAB 2023'
      },
      {
        id: 'ilp_arroz_piata',
        label: 'Arroz Sequeiro + Braquiária Piatã',
        desc: 'Arroz de terras altas (Oryza sativa) consorciado com Braquiária Piatã — modelo tradicional muito utilizado no Maranhão para formação de pastagem.',
        species: [
          { name: 'Arroz Sequeiro (Oryza sativa)', icon: '🌾', color: '#d4a017', crown: 0.15, height: 1.1 },
          { name: 'Braquiária Piatã', icon: '🌱', color: '#4ade80', crown: 0.25, height: 0.7 }
        ],
        spacingRow: 0.40, spacingPlant: 0.20,
        invest_ha: 1800, renda_ha: 1500, carbon_ha: 1.2, agua_ha: 500,
        empregos: 7, biodiv: 4.8,
        fonte: 'Embrapa Arroz e Feijão, 2022; Embrapa Cocais/MA 2023'
      },
      {
        id: 'ilp_sorgo_andropogon',
        label: 'Sorgo Forrageiro + Andropogon',
        desc: 'Sorgo forrageiro para silagem + formação de pastagem de Andropogon gayanus — tolerante a solos ácidos e períodos secos do MA.',
        species: [
          { name: 'Sorgo Forrageiro (Sorghum bicolor)', icon: '🌿', color: '#fb923c', crown: 0.25, height: 2.5 },
          { name: 'Andropogon gayanus', icon: '🌱', color: '#86efac', crown: 0.30, height: 0.8 }
        ],
        spacingRow: 0.70, spacingPlant: 0.15,
        invest_ha: 2000, renda_ha: 1600, carbon_ha: 1.0, agua_ha: 520,
        empregos: 5, biodiv: 3.8,
        fonte: 'Embrapa Milho e Sorgo, 2022; Embrapa Gado de Corte 2023'
      }
    ]
  },

  ilpf: {
    label: 'ILPF', icon: '🌳', color: '#4ade80',
    desc: 'Integração Lavoura-Pecuária-Floresta — maior sequestro de carbono',
    variants: [
      {
        id: 'ilpf_eucalipto_soja',
        label: 'Eucalipto + Soja/Pastagem',
        desc: 'Renques duplos de Eucalipto urophylla × grandis a cada 22m. Soja (safra) e Brachiaria (entressafra) nas faixas entre renques. Modelo mais difundido no MA.',
        species: [
          { name: 'Eucalipto (E. urograndis)', icon: '🌳', color: '#166534', crown: 1.5, height: 18 },
          { name: 'Soja (entre renques)', icon: '🌿', color: '#a3e635', crown: 0.20, height: 0.9 },
          { name: 'Brachiaria (pastejo)', icon: '🌱', color: '#4ade80', crown: 0.25, height: 0.6 }
        ],
        spacingRow: 22, spacingPlant: 3,
        invest_ha: 4800, renda_ha: 2400, carbon_ha: 3.2, agua_ha: 780,
        empregos: 12, biodiv: 7.2,
        fonte: 'Embrapa Florestas, 2023; Embrapa Cerrados 2022'
      },
      {
        id: 'ilpf_teca_pastagem',
        label: 'Teca + Pastagem Marandu',
        desc: 'Teca (Tectona grandis) em renques a cada 10m × 3m entre plantas. Pastagem de B. Marandu nas faixas. Ciclo madeireiro 20-25 anos. Alto valor madeireiro.',
        species: [
          { name: 'Teca (Tectona grandis)', icon: '🌴', color: '#15803d', crown: 2.0, height: 20 },
          { name: 'Brachiaria Marandu', icon: '🌱', color: '#4ade80', crown: 0.30, height: 0.6 }
        ],
        spacingRow: 10, spacingPlant: 3,
        invest_ha: 5200, renda_ha: 2800, carbon_ha: 3.8, agua_ha: 720,
        empregos: 10, biodiv: 6.5,
        fonte: 'Embrapa Amazônia Oriental, 2023; MAPA 2022'
      },
      {
        id: 'ilpf_mogno_milho',
        label: 'Mogno Africano + Milho + Boi',
        desc: 'Mogno africano (Khaya ivorensis) a cada 14m × 3m. Milho anual nas faixas (1-4 anos) seguido de pastagem. Maior valor madeireiro por m³ no Brasil.',
        species: [
          { name: 'Mogno Africano (Khaya ivorensis)', icon: '🌳', color: '#065f46', crown: 2.5, height: 22 },
          { name: 'Milho (anos 1-4)', icon: '🌽', color: '#fbbf24', crown: 0.30, height: 2.0 },
          { name: 'Brachiaria (após milho)', icon: '🌱', color: '#86efac', crown: 0.25, height: 0.6 }
        ],
        spacingRow: 14, spacingPlant: 3,
        invest_ha: 5800, renda_ha: 2600, carbon_ha: 4.1, agua_ha: 810,
        empregos: 14, biodiv: 7.5,
        fonte: 'Embrapa Amazônia Oriental, 2022; SNIF/SFB 2023'
      },
      {
        id: 'ilpf_babacu_pastagem',
        label: 'Babaçu Preservado + Pastagem',
        desc: 'Preservação de babaçu nativo em renques naturais + pastagem melhorada. Modelo tipicamente maranhense — sem custo de implantação florestal.',
        species: [
          { name: 'Babaçu (Orbignya phalerata)', icon: '🌴', color: '#14532d', crown: 3.0, height: 15 },
          { name: 'Brachiaria Marandu', icon: '🌱', color: '#4ade80', crown: 0.30, height: 0.6 }
        ],
        spacingRow: 8, spacingPlant: 4,
        invest_ha: 3200, renda_ha: 2200, carbon_ha: 2.9, agua_ha: 650,
        empregos: 16, biodiv: 8.0,
        fonte: 'Embrapa Cocais/MA, 2023; MIQCB 2022'
      }
    ]
  },

  saf: {
    label: 'SAF', icon: '🌱', color: '#86efac',
    desc: 'Sistemas Agroflorestais — máximo sequestro de carbono e biodiversidade',
    variants: [
      {
        id: 'saf_dende_cacau',
        label: 'Dendê + Cacau + Ingá',
        desc: 'Dendê (9m × 9m) + Cacau sombreado (3m × 3m) + Ingá como sombreamento provisório. Modelo produtivo de alto retorno para regiões úmidas do MA.',
        species: [
          { name: 'Dendê (Elaeis guineensis)', icon: '🌴', color: '#15803d', crown: 3.5, height: 12 },
          { name: 'Cacau (Theobroma cacao)', icon: '🍫', color: '#92400e', crown: 1.5, height:  4 },
          { name: 'Ingá (sombreamento)', icon: '🌿', color: '#22c55e', crown: 2.0, height:  8 }
        ],
        spacingRow: 9, spacingPlant: 9,
        invest_ha: 8500, renda_ha: 4200, carbon_ha: 5.8, agua_ha: 1200,
        empregos: 22, biodiv: 8.5,
        fonte: 'Embrapa Amazônia Oriental, 2022; CEPLAC 2023'
      },
      {
        id: 'saf_acai_pupunha',
        label: 'Açaí + Pupunha + Andiroba',
        desc: 'Açaí cultivado BRS Pará (5m × 5m) + Pupunha para palmito (2m × 2m) + Andiroba como componente florestal. Alta biodiversidade e renda múltipla.',
        species: [
          { name: 'Açaí (Euterpe oleracea)', icon: '🫐', color: '#7c3aed', crown: 1.2, height: 10 },
          { name: 'Pupunha (Bactris gasipaes)', icon: '🌴', color: '#15803d', crown: 0.8, height:  5 },
          { name: 'Andiroba (Carapa guianensis)', icon: '🌳', color: '#166534', crown: 2.0, height: 15 }
        ],
        spacingRow: 5, spacingPlant: 5,
        invest_ha: 7200, renda_ha: 3800, carbon_ha: 5.2, agua_ha: 980,
        empregos: 25, biodiv: 9.0,
        fonte: 'Embrapa Amazônia Oriental, 2022; Embrapa Cocais 2023'
      },
      {
        id: 'saf_babacu_culturas',
        label: 'Babaçu + Mandioca + Milho',
        desc: 'Babaçu nativo preservado (8m × 4m) + mandioca + feijão-caupi + milho nas faixas. SAF de baixíssimo custo para agricultura familiar do MA.',
        species: [
          { name: 'Babaçu (Orbignya phalerata)', icon: '🌴', color: '#14532d', crown: 3.0, height: 15 },
          { name: 'Mandioca (Manihot esculenta)', icon: '🥔', color: '#d97706', crown: 0.6, height:  1.5 },
          { name: 'Milho (Zea mays)', icon: '🌽', color: '#fbbf24', crown: 0.3, height:  2.0 },
          { name: 'Feijão-Caupi (Vigna unguiculata)', icon: '🫘', color: '#92400e', crown: 0.3, height: 0.5 }
        ],
        spacingRow: 8, spacingPlant: 4,
        invest_ha: 3500, renda_ha: 2800, carbon_ha: 4.5, agua_ha: 750,
        empregos: 30, biodiv: 8.2,
        fonte: 'Embrapa Cocais/MA, 2022; Embrapa Amazônia Oriental 2023'
      },
      {
        id: 'saf_diversificado',
        label: 'SAF Multi-Estrato Diversificado',
        desc: 'Combinação de 5 estratos: Castanheira (emergente) + Mogno (dossel) + Açaí (subdossel) + Cacau (arbustivo) + Mandioca (herbáceo). Modelo de máxima resiliência.',
        species: [
          { name: 'Castanheira (Bertholletia excelsa)', icon: '🌳', color: '#064e3b', crown: 4.0, height: 25 },
          { name: 'Mogno (Swietenia macrophylla)', icon: '🌲', color: '#065f46', crown: 2.5, height: 18 },
          { name: 'Açaí (Euterpe oleracea)', icon: '🫐', color: '#7c3aed', crown: 1.2, height: 10 },
          { name: 'Cacau (Theobroma cacao)', icon: '🍫', color: '#92400e', crown: 1.5, height:  4 },
          { name: 'Mandioca (Manihot esculenta)', icon: '🥔', color: '#d97706', crown: 0.6, height:  1.5 }
        ],
        spacingRow: 6, spacingPlant: 4,
        invest_ha: 9500, renda_ha: 3200, carbon_ha: 6.8, agua_ha: 1100,
        empregos: 28, biodiv: 9.5,
        fonte: 'Embrapa Florestas, 2023; World Agroforestry (ICRAF) 2022'
      }
    ]
  },

  sisteminha: {
    label: 'Sisteminha Embrapa', icon: '🐓', color: '#fbbf24',
    desc: 'Produção integrada de subsistência — alta geração de emprego e segurança alimentar',
    variants: [
      {
        id: 'sist_padrao',
        label: 'Sisteminha Padrão (200 m²)',
        desc: 'Unidade básica: horta biointensiva 30m² + galinheiro 30 aves + tanque peixe 1.000L + ervas medicinais. Renda mensal R$ 800–1.200 por família.',
        species: [
          { name: 'Hortaliças (canteiros)', icon: '🥬', color: '#4ade80', crown: 0.20, height: 0.4 },
          { name: 'Galinhas (Gallus domesticus)', icon: '🐓', color: '#fbbf24', crown: 0.30, height: 0.4 },
          { name: 'Tilápia (tanque 1.000L)', icon: '🐟', color: '#22d3ee', crown: 0.20, height: 0.1 },
          { name: 'Ervas medicinais', icon: '🌿', color: '#86efac', crown: 0.15, height: 0.3 }
        ],
        spacingRow: 0.5, spacingPlant: 0.4,
        invest_ha: 1200, renda_ha: 3800, carbon_ha: 0.5, agua_ha: 2000,
        empregos: 48, biodiv: 4.5,
        fonte: 'Embrapa Pesca e Aquicultura, 2022; Embrapa Cocais 2023'
      },
      {
        id: 'sist_ampliado',
        label: 'Sisteminha Ampliado (1.000 m²)',
        desc: 'Versão semi-comercial: horta 100m² + 100 aves (galinhas+patos) + tanques múltiplos (5.000L) + frutíferas. Renda R$ 2.000–4.000/mês.',
        species: [
          { name: 'Hortaliças', icon: '🥬', color: '#4ade80', crown: 0.20, height: 0.4 },
          { name: 'Galinhas', icon: '🐓', color: '#fbbf24', crown: 0.30, height: 0.4 },
          { name: 'Patos (Cairina moschata)', icon: '🦆', color: '#60a5fa', crown: 0.25, height: 0.3 },
          { name: 'Tilápia/Tambaqui', icon: '🐟', color: '#22d3ee', crown: 0.20, height: 0.1 },
          { name: 'Frutíferas (pomar)', icon: '🍎', color: '#f87171', crown: 0.80, height: 2.0 }
        ],
        spacingRow: 0.6, spacingPlant: 0.5,
        invest_ha: 4500, renda_ha: 7200, carbon_ha: 0.8, agua_ha: 3500,
        empregos: 65, biodiv: 5.5,
        fonte: 'Embrapa Pesca e Aquicultura, 2023; Embrapa Cocais 2022'
      },
      {
        id: 'sist_completo',
        label: 'Sisteminha Completo (500 m²)',
        desc: 'Unidade familiar diversificada: horta 50m² + 50 galinhas + 100 codornas + 20 patos + tanque 3.000L + pomar + canto de compostagem. Renda R$ 1.500–3.000/mês.',
        species: [
          { name: 'Hortaliças (canteiros)', icon: '🥬', color: '#4ade80', crown: 0.20, height: 0.4 },
          { name: 'Galinhas (Gallus domesticus)', icon: '🐓', color: '#fbbf24', crown: 0.30, height: 0.4 },
          { name: 'Codornas (Coturnix coturnix)', icon: '🐦', color: '#fb923c', crown: 0.12, height: 0.2 },
          { name: 'Patos (Cairina moschata)', icon: '🦆', color: '#60a5fa', crown: 0.25, height: 0.3 },
          { name: 'Tilápia/Tambaqui (tanque)', icon: '🐟', color: '#22d3ee', crown: 0.20, height: 0.1 },
          { name: 'Frutíferas (pomar)', icon: '🍎', color: '#f87171', crown: 0.80, height: 2.0 },
          { name: 'Compostagem', icon: '♻️', color: '#92400e', crown: 0.25, height: 0.3 }
        ],
        spacingRow: 0.5, spacingPlant: 0.4,
        invest_ha: 2500, renda_ha: 5800, carbon_ha: 0.7, agua_ha: 2800,
        empregos: 55, biodiv: 5.8,
        fonte: 'Embrapa Pesca e Aquicultura, 2023; Embrapa Cocais 2023'
      }
    ]
  },

  apicultura: {
    label: 'Apicultura', icon: '🐝', color: '#f59e0b',
    desc: 'Produção de mel com Apis mellifera — polinizadores e conservação de floradas nativas',
    variants: [
      {
        id: 'apic_convencional',
        label: 'Apiário Convencional (Apis mellifera)',
        desc: 'Apis mellifera L. em colmeias Langstroth. Espaçamento 3m × 3m entre colmeias. Florada nativa do cerrado/babaçu. Produção 25-40 kg mel/colmeia/ano.',
        species: [
          { name: 'Apis mellifera (colmeia Langstroth)', icon: '🐝', color: '#f59e0b', crown: 0.5, height: 0.4 },
          { name: 'Florada nativa', icon: '🌸', color: '#f472b6', crown: 0.8, height: 1.0 }
        ],
        spacingRow: 3, spacingPlant: 3,
        invest_ha: 1500, renda_ha: 3200, carbon_ha: 0.2, agua_ha: 50,
        empregos: 25, biodiv: 6.5,
        fonte: 'MAPA, 2023; Embrapa Meio-Norte 2022'
      },
      {
        id: 'apic_organica',
        label: 'Apicultura Orgânica + Florestamento',
        desc: 'Apis mellifera em habitat florestal nativo preservado. Mel orgânico certificado com valor 3–5× maior. Floradas: Jurema, Mata-pasto, Babaçu, Murici.',
        species: [
          { name: 'Apis mellifera (orgânica)', icon: '🐝', color: '#d97706', crown: 0.5, height: 0.4 },
          { name: 'Jurema Preta (florada)', icon: '🌿', color: '#22c55e', crown: 1.5, height: 5.0 },
          { name: 'Murici (florada)', icon: '🌸', color: '#f472b6', crown: 0.5, height: 1.0 }
        ],
        spacingRow: 5, spacingPlant: 5,
        invest_ha: 2200, renda_ha: 4800, carbon_ha: 0.4, agua_ha: 80,
        empregos: 30, biodiv: 7.5,
        fonte: 'MAPA, 2023; Embrapa Meio-Norte 2022'
      }
    ]
  },

  meliponicultura: {
    label: 'Meliponicultura', icon: '🍯', color: '#d97706',
    desc: 'Abelhas nativas sem ferrão — serviços ecossistêmicos e mel de alto valor medicinal',
    variants: [
      {
        id: 'melip_jandaira',
        label: 'Jandaíra (Melipona subnitida)',
        desc: 'Espécie mais produtiva do Nordeste/MA. Caixas INPA espaçadas 2m × 2m. Mel medicinal R$ 80–150/L. Produção 0,5–2L/colônia/ano.',
        species: [
          { name: 'Jandaíra (caixa INPA)', icon: '🍯', color: '#f59e0b', crown: 0.3, height: 0.3 },
          { name: 'Florada nativa', icon: '🌸', color: '#f472b6', crown: 1.0, height: 1.5 }
        ],
        spacingRow: 2, spacingPlant: 2,
        invest_ha: 1200, renda_ha: 4500, carbon_ha: 0.25, agua_ha: 30,
        empregos: 30, biodiv: 7.8,
        fonte: 'Embrapa Meio-Norte, 2022; UFMA 2023'
      },
      {
        id: 'melip_urucu',
        label: 'Uruçu (Melipona scutellaris)',
        desc: 'Espécie nativa do MA — excelente polinizadora de açaí, caju e culturas regionais. Mel de alta viscosidade. Colônias em caixas racionais INPA ou madeira.',
        species: [
          { name: 'Uruçu (colmeia racional)', icon: '🍯', color: '#d97706', crown: 0.3, height: 0.3 },
          { name: 'Murici (florada principal)', icon: '🌸', color: '#f472b6', crown: 1.2, height: 2.0 },
          { name: 'Barbatimão', icon: '🌿', color: '#22c55e', crown: 1.0, height: 3.0 }
        ],
        spacingRow: 2, spacingPlant: 2,
        invest_ha: 1500, renda_ha: 5200, carbon_ha: 0.3, agua_ha: 40,
        empregos: 35, biodiv: 8.2,
        fonte: 'Embrapa Amazônia Oriental, 2023; FAPEMA 2022'
      }
    ]
  },

  roca: {
    label: 'Roça Sustentável', icon: '🌾', color: '#a3e635',
    desc: 'Agricultura familiar sem queima — redução de GEE e fogo, manutenção de MOS',
    variants: [
      {
        id: 'roca_mandio_feijao',
        label: 'Mandioca + Feijão-Caupi (sem queima)',
        desc: 'Consórcio mandioca (1m × 0.8m) + feijão-caupi sem uso do fogo. Cobertura morta mantida. Sequestro de carbono no solo (+0.8 t C/ha/ano vs. queima).',
        species: [
          { name: 'Mandioca (Manihot esculenta)', icon: '🥔', color: '#d97706', crown: 0.6, height: 1.8 },
          { name: 'Feijão-Caupi (Vigna unguiculata)', icon: '🫘', color: '#92400e', crown: 0.3, height: 0.5 }
        ],
        spacingRow: 1.0, spacingPlant: 0.8,
        invest_ha: 800, renda_ha: 1200, carbon_ha: 0.8, agua_ha: 420,
        empregos: 28, biodiv: 4.0,
        fonte: 'Embrapa Amazônia Oriental, 2022; Embrapa Cocais 2023'
      },
      {
        id: 'roca_arroz_pd',
        label: 'Arroz Sequeiro em Plantio Direto',
        desc: 'Arroz de terras altas em sistema plantio direto sobre palhada — elimina queima, aumenta MOS. Produtividade 1,5–3,0 t/ha sem irrigação.',
        species: [
          { name: 'Arroz (Oryza sativa L.)', icon: '🌾', color: '#d4a017', crown: 0.15, height: 1.0 },
          { name: 'Palhada (cobertura solo)', icon: '🌿', color: '#86efac', crown: 0.20, height: 0.1 }
        ],
        spacingRow: 0.35, spacingPlant: 0.20,
        invest_ha: 1100, renda_ha: 1500, carbon_ha: 1.0, agua_ha: 480,
        empregos: 20, biodiv: 3.5,
        fonte: 'Embrapa Arroz e Feijão, 2023; Embrapa Cerrados 2022'
      }
    ]
  },

  piscicultura: {
    label: 'Piscicultura', icon: '🐟', color: '#22d3ee',
    desc: 'Aquicultura continental — renda e segurança alimentar hídrica',
    variants: [
      {
        id: 'pisc_tilapia',
        label: 'Tilápia-do-Nilo (Tanque Escavado)',
        desc: 'Oreochromis niloticus em tanque escavado semi-intensivo (0,5–2 ha). Densidade 2–5 peixe/m². Produtividade 4–8 t/ha/ciclo. Ciclo 6–8 meses.',
        species: [
          { name: 'Tilápia-do-Nilo', icon: '🐟', color: '#22d3ee', crown: 0.15, height: 0.1 },
          { name: 'Taboa (vegetação entorno)', icon: '🌿', color: '#4ade80', crown: 0.50, height: 1.5 }
        ],
        spacingRow: 0.3, spacingPlant: 0.3,
        invest_ha: 12000, renda_ha: 7500, carbon_ha: 0.3, agua_ha: 8000,
        empregos: 12, biodiv: 4.5,
        fonte: 'Embrapa Pesca e Aquicultura, 2023; IBGE PAM 2023'
      },
      {
        id: 'pisc_tambaqui',
        label: 'Tambaqui (Viveiro Escavado)',
        desc: 'Colossoma macropomum — espécie nativa amazônica de alto valor comercial. Viveiro 0,5–3 ha. Densidade 0,5–1 peixe/m². Produtividade 3–6 t/ha/ano.',
        species: [
          { name: 'Tambaqui (Colossoma macropomum)', icon: '🐠', color: '#0ea5e9', crown: 0.20, height: 0.1 },
          { name: 'Vegetação ciliar', icon: '🌿', color: '#22c55e', crown: 0.80, height: 2.0 }
        ],
        spacingRow: 0.4, spacingPlant: 0.4,
        invest_ha: 14000, renda_ha: 9000, carbon_ha: 0.4, agua_ha: 9000,
        empregos: 14, biodiv: 5.5,
        fonte: 'Embrapa Pesca e Aquicultura, 2022; IBGE 2023'
      },
      {
        id: 'pisc_integrada',
        label: 'Piscicultura Integrada (Agropesca)',
        desc: 'Tanques de tilápia + tambaqui integrados com horta irrigada por efluente e galinheiro sobre o tanque. Máxima eficiência de uso da água e nutrientes.',
        species: [
          { name: 'Tilápia', icon: '🐟', color: '#22d3ee', crown: 0.15, height: 0.1 },
          { name: 'Tambaqui', icon: '🐠', color: '#0ea5e9', crown: 0.20, height: 0.1 },
          { name: 'Hortaliças (irrigação efluente)', icon: '🥬', color: '#4ade80', crown: 0.20, height: 0.4 }
        ],
        spacingRow: 0.35, spacingPlant: 0.35,
        invest_ha: 18000, renda_ha: 12000, carbon_ha: 0.5, agua_ha: 7200,
        empregos: 20, biodiv: 5.8,
        fonte: 'Embrapa Pesca e Aquicultura, 2022-2023; FAO 2022'
      }
    ]
  },

  fruticultura: {
    label: 'Fruticultura', icon: '🍎', color: '#f87171',
    desc: 'Produção de frutas regionais e tropicais para mercado local e exportação',
    variants: [
      {
        id: 'frut_manga',
        label: 'Manga Tommy Atkins / Kent',
        desc: 'Pomar comercial de manga Tommy Atkins ou Kent (10m × 8m). Produtividade 10–20 t/ha/ano a partir do 4º ano. Alta demanda de exportação via Imperatriz-MA.',
        species: [
          { name: 'Manga (Mangifera indica)', icon: '🥭', color: '#f59e0b', crown: 3.5, height: 6.0 }
        ],
        spacingRow: 10, spacingPlant: 8,
        invest_ha: 6500, renda_ha: 8000, carbon_ha: 2.5, agua_ha: 900,
        empregos: 15, biodiv: 4.0,
        fonte: 'Embrapa Semiárido, 2022; CODEVASF 2023'
      },
      {
        id: 'frut_caju',
        label: 'Cajueiro Anão Precoce CCP-76',
        desc: 'Cajueiro anão CCP-76 (8m × 8m) — variedade padrão para o MA. Produção de castanha 0,5–1,2 t/ha e pedúnculo 5–12 t/ha/ano. Tolerante à seca.',
        species: [
          { name: 'Cajueiro Anão CCP-76', icon: '🍊', color: '#f97316', crown: 3.0, height: 3.0 }
        ],
        spacingRow: 8, spacingPlant: 8,
        invest_ha: 4800, renda_ha: 5500, carbon_ha: 1.8, agua_ha: 600,
        empregos: 18, biodiv: 4.5,
        fonte: 'Embrapa Agroindústria Tropical, 2022; MAPA 2023'
      },
      {
        id: 'frut_acai',
        label: 'Açaí Cultivado BRS Pará',
        desc: 'Açaí BRS Pará (5m × 5m) — variedade Embrapa para cultivo irrigado. Produção regular, elimina sazonalidade do extrativismo. 4–8 t/ha/ano de fruto.',
        species: [
          { name: 'Açaí BRS Pará (Euterpe oleracea)', icon: '🫐', color: '#7c3aed', crown: 1.5, height: 10 }
        ],
        spacingRow: 5, spacingPlant: 5,
        invest_ha: 5200, renda_ha: 6800, carbon_ha: 2.2, agua_ha: 820,
        empregos: 20, biodiv: 5.5,
        fonte: 'Embrapa Amazônia Oriental, 2022; CONAB 2023'
      },
      {
        id: 'frut_goiaba',
        label: 'Goiaba Paluma / Cortibel',
        desc: 'Goiaba cv. Paluma (6m × 6m) — mais cultivada no MA. Alta demanda regional, múltiplas colheitas/ano. Produtividade 15–30 t/ha/ano.',
        species: [
          { name: 'Goiaba Paluma (Psidium guajava)', icon: '🍏', color: '#22c55e', crown: 2.0, height: 3.0 }
        ],
        spacingRow: 6, spacingPlant: 6,
        invest_ha: 3800, renda_ha: 4500, carbon_ha: 1.5, agua_ha: 750,
        empregos: 22, biodiv: 4.2,
        fonte: 'Embrapa Mandioca e Fruticultura, 2022; CONAB 2023'
      }
    ]
  },

  extrativismo: {
    label: 'Extrativismo Sust.', icon: '🌰', color: '#a78bfa',
    desc: 'Babaçu, açaí, buriti — conservação florestal com geração de renda',
    variants: [
      {
        id: 'extrat_babacu',
        label: 'Babaçu (Orbignya phalerata)',
        desc: 'Extrativismo sustentável de coco babaçu — amêndoa (azeite), mesocarpo (farinha), endocarpo (carvão). Ocorrência natural ~6 M ha no MA. Base de renda de ~400 mil famílias.',
        species: [
          { name: 'Babaçu adulto (>10 anos)', icon: '🌴', color: '#14532d', crown: 3.0, height: 15 },
          { name: 'Babaçu jovem (3-10 anos)', icon: '🌿', color: '#22c55e', crown: 1.0, height:  3 }
        ],
        spacingRow: 8, spacingPlant: 6,
        invest_ha: 400, renda_ha: 900, carbon_ha: 1.2, agua_ha: 300,
        empregos: 22, biodiv: 8.0,
        fonte: 'Embrapa Cocais/MA, 2022; CONAB PGPM-Bio 2023'
      },
      {
        id: 'extrat_acai_nativo',
        label: 'Açaí Nativo (Várzeas do MA)',
        desc: 'Manejo de touceiras nativas de açaí em áreas de várzea — desbaste seletivo, sem desmatamento. Produtividade 1–3 t/ha/ano com manejo. Alto valor de mercado.',
        species: [
          { name: 'Açaí nativo (touceira)', icon: '🫐', color: '#7c3aed', crown: 2.0, height: 12 },
          { name: 'Buritizeiro (entorno)', icon: '🌴', color: '#15803d', crown: 2.5, height: 18 }
        ],
        spacingRow: 5, spacingPlant: 4,
        invest_ha: 300, renda_ha: 1200, carbon_ha: 1.8, agua_ha: 200,
        empregos: 25, biodiv: 9.0,
        fonte: 'Embrapa Amazônia Oriental, 2022; CONAB PGPM-Bio 2023'
      },
      {
        id: 'extrat_buriti',
        label: 'Buriti (Mauritia flexuosa)',
        desc: 'Extrativismo de buriti em veredas e campos úmidos — óleo do fruto, artesanato com palha, palmito jovem. Espécie estruturante de veredas no MA.',
        species: [
          { name: 'Buritizeiro adulto', icon: '🌴', color: '#0d9488', crown: 3.0, height: 20 },
          { name: 'Carnaúba (consórcio)', icon: '🌿', color: '#14b8a6', crown: 2.0, height: 10 }
        ],
        spacingRow: 6, spacingPlant: 5,
        invest_ha: 250, renda_ha: 750, carbon_ha: 1.5, agua_ha: 150,
        empregos: 18, biodiv: 8.5,
        fonte: 'Embrapa Cerrados, 2023; IBGE PAM 2022'
      }
    ]
  }
};

// Limites de área recomendados por sistema (ha)
const SA_AREA_LIMITS = {
  ilp:             { min: 10,   max: 5000, def: 50  },
  ilpf:            { min: 10,   max: 3000, def: 50  },
  saf:             { min: 1,    max: 500,  def: 10  },
  sisteminha:      { min: 0.02, max: 50,   def: 0.1 },
  apicultura:      { min: 1,    max: 200,  def: 20  },
  meliponicultura: { min: 0.5,  max: 50,   def: 5   },
  roca:            { min: 0.5,  max: 50,   def: 5   },
  piscicultura:    { min: 0.5,  max: 20,   def: 2   },
  fruticultura:    { min: 1,    max: 200,  def: 10  },
  extrativismo:    { min: 5,    max: 5000, def: 100 }
};
