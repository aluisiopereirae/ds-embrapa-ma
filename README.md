# Ciência de Dados — Embrapa Maranhão

> Plataforma interativa de levantamento, visualização e análise de dados de sistemas produtivos sustentáveis no estado do Maranhão.

**Acesso:** [aluisiopereirae.github.io/ds-embrapa-ma](https://aluisiopereirae.github.io/ds-embrapa-ma/)

---

## Sobre o Projeto

Esta plataforma foi desenvolvida como parte de um trabalho de ciência de dados da **Embrapa Maranhão**, com o objetivo de centralizar, visualizar e analisar dados de unidades produtivas sustentáveis distribuídas pelo estado do Maranhão.

A aplicação é inteiramente **client-side** — um único arquivo HTML com dados embutidos — acessível diretamente pelo navegador, sem necessidade de servidor ou instalação.

**Levantamento de dados:** Aluisio Pereira  
**Fontes:** Embrapa · IBGE · SEEG · PRODES · IMESC · CAR · MapBiomas · BRLUC

---

## Sistemas Produtivos Cobertos

| Sistema | Descrição |
|---|---|
| 🌳 **ILPF** | Integração Lavoura-Pecuária-Floresta |
| 🐄 **ILP** | Integração Lavoura-Pecuária |
| 🌱 **SAF** | Sistemas Agroflorestais |
| 🐝 **Apicultura** | Produção de mel com abelhas |
| 🍯 **Meliponicultura** | Abelhas nativas sem ferrão |
| 🐟 **Piscicultura** | Aquicultura continental |
| 🍎 **Fruticultura** | Produção de frutas regionais |
| 🌾 **Roça Sustentável** | Agricultura de base familiar |
| 🐓 **Sisteminha Embrapa** | Produção integrada de subsistência |
| 🌰 **Extrativismo** | Babaçu, açaí, buriti e outros produtos nativos |

### Tecnologias Complementares

| Tecnologia | Descrição |
|---|---|
| 🌴 **Babaçu** | Mapeamento de áreas extrativistas |
| 🥕 **RENIVA** | Rede de inovação em variedades |
| 🧪 **AFERE (Solo)** | Análise e recomendação de fertilizantes |
| 🌿 **Vegetação** | Cobertura vegetal e serviços ecossistêmicos |

---

## Funcionalidades

### 📊 Visão Geral
- Painel com indicadores consolidados de todos os sistemas produtivos cadastrados
- Gráficos interativos (Chart.js): distribuição por sistema, por região, por ano de implantação, balanço de carbono e renda
- Aba **Estado do Maranhão** com análise comparativa por município: scatter plots, ranking Top 10, distribuição por bioma e por indicador
- Casos de Referência por sistema com fichas técnicas detalhadas (ILP/ILPF, SAF, Sisteminha, Extrativismo, Fruticultura, Roça)
- Destaque especial para a **Fazenda Barbosa (URT ILP/ILPF — Brejo-MA)**

### 🗺 Mapa Interativo
- Mapa Leaflet com camadas por sistema produtivo, filtráveis individualmente ou em conjunto
- Três modos de visualização: **Normal**, **Satélite** e **Híbrido**
- **20+ heatmaps sobrepostos** por indicador socioeconômico e ambiental municipal, incluindo:
  - IDH, Pobreza, Insegurança Alimentar, PIB per capita, Alfabetização, População
  - Emissões de GEE (kt CO₂e), Desmatamento (km²), Queimadas (ha), Vegetação (%)
  - Temperatura (°C), Precipitação (mm), Bacias Hidrográficas
  - Lavoura (ha), Rebanho Bovino, Produção de Pesca (t)
  - Terras Indígenas, Quilombolas, Assentamentos, CAF
- Filtro por ano de implantação
- Popup detalhado por ponto: dados da unidade produtiva + indicadores municipais IBGE/IMESC 2024
- Legenda dinâmica no canto inferior direito para Fruticultura e Extrativismo
- Exportação do mapa em **PNG** e **JPG** com captura precisa da área visível
- Cadastro e edição de novos pontos diretamente no mapa

### 📈 Projeções 2025–2050
- Cenários climáticos e de emissões para o Maranhão baseados em dados **SEEG × IPCC AR6 × Embrapa**:
  - **BAU** — Tendência histórica sem intervenção
  - **Restauração** — Recuperação de áreas degradadas
  - **Intensificação Sustentável** — Adoção de boas práticas
  - **Baixo Carbono** — Cenário de máxima mitigação
- Variáveis projetadas: GEE (Mt CO₂eq), Desmatamento (km²), Temperatura (°C), Sequestro de Carbono (Mt C)
- Gráficos comparativos por cenário e por mesorregião
- GEE histórico do Maranhão 2000–2025 (fonte SEEG)
- Tabela comparativa de cenários com variação percentual vs. BAU

### 📋 Dados
- Tabela completa de todos os registros por sistema
- Abas especializadas para Fruticultura e Extrativismo
- Tabela de todos os municípios do Maranhão com indicadores IBGE 2024
- Exportação em **CSV**

### ➕ Registro
- Formulário para cadastro de novas unidades produtivas
- Campos específicos por sistema (indicadores ambientais, econômicos e produtivos)
- Dados persistidos em `localStorage` — permanecem após recarregar a página

### 📖 Guias Técnicos
- Fichas de manejo por sistema produtivo
- Informações sobre benefícios ambientais, econômicos e indicadores de monitoramento

### 🤖 Assistente de Dados com IA (RAG)
- Chat flutuante com IA integrada via **API Claude (Anthropic)**
- Arquitetura **RAG** (Retrieval-Augmented Generation): o contexto completo dos dados da plataforma é injetado em cada consulta
- Responde perguntas específicas sobre os registros, sistemas, municípios e indicadores
- Histórico de conversa com suporte a perguntas de acompanhamento
- Chave de API configurada pelo usuário e armazenada apenas no navegador (localStorage)

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| HTML5 / CSS3 / JavaScript | Aplicação client-side, sem framework |
| [Leaflet.js](https://leafletjs.com/) | Mapa interativo |
| [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) | Camadas de heatmap |
| [Chart.js](https://www.chartjs.org/) | Gráficos e visualizações |
| [html2canvas](https://html2canvas.hertzen.com/) | Exportação do mapa como imagem |
| [Claude API (Anthropic)](https://www.anthropic.com/) | Assistente de IA com RAG |
| GitHub Pages | Hospedagem estática |

---

## Fontes de Dados

| Fonte | Dados |
|---|---|
| **Embrapa** | Unidades produtivas, tecnologias, casos de referência |
| **IBGE** | Censo, municípios, PIB per capita, população |
| **SEEG** | Emissões de GEE históricas (2000–2025) |
| **PRODES/INPE** | Desmatamento por município |
| **IMESC** | Indicadores socioeconômicos do Maranhão |
| **CAR** | Cadastro Ambiental Rural |
| **MapBiomas** | Cobertura e uso do solo |
| **BRLUC** | Uso da terra e carbono no Brasil |

---

## Estrutura do Projeto

```
ds-embrapa-ma/
├── index.html          # Aplicação completa (dados + interface + lógica)
├── layout_set_logo.png # Logo Embrapa
└── README.md           # Este arquivo
```

> Todos os dados, estilos e lógica estão contidos em `index.html`, tornando a plataforma portável e de fácil distribuição.

---

## Como Usar

1. Acesse [aluisiopereirae.github.io/ds-embrapa-ma](https://aluisiopereirae.github.io/ds-embrapa-ma/) pelo navegador
2. Navegue pelas abas: **Visão Geral**, **Mapa**, **Projeções**, **Registrar**, **Dados**, **Guias**
3. No Mapa, ative os sistemas e heatmaps desejados pelo painel lateral ou pelos chips de filtro
4. Para o **Assistente de IA**, clique no ícone verde no canto inferior direito, insira sua chave da API Claude e faça perguntas sobre os dados

---

## Autor

**Aluisio Pereira**  
Pesquisador / Analista — Embrapa Maranhão
