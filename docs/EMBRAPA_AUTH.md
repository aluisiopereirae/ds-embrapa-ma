# Integração OAuth 2.1 PKCE — Embrapa MCP-SEG

Documentação de referência da integração de autenticação corporativa Embrapa nesta aplicação.

- **Referência oficial:** https://www.embrapa.io/2026-05-22-mcp-seg/
- **Discovery:** https://seg.mcp.embrapa.io/.well-known/oauth-authorization-server

---

## O que foi implementado

**Arquivo criado:** `simuladores/embrapa-auth.js`  
**Modificado:** `index.html` — botão de login no header + `<script>` ao final do body

---

## Fluxo OAuth 2.1 com PKCE

```
1. Usuário clica "🔐 Entrar com Embrapa"
   ↓
2. App registra-se dinamicamente no MCP (POST /oauth/register)
   ↓
3. Redireciona para https://seg.mcp.embrapa.io/oauth/authorize
   ↓
4. Usuário faz login com credenciais corporativas Embrapa
   ↓
5. Retorna com ?code= → app troca pelo token (POST /oauth/token)
   ↓
6. Busca perfil: GET /oauth/userinfo (Bearer token)
   ↓
7. Exibe avatar + nome + unidade no header
```

---

## Endpoints OAuth 2.1

Descobertos via `/.well-known/oauth-authorization-server`:

| Endpoint     | URL                                              |
|--------------|--------------------------------------------------|
| Autorização  | `https://seg.mcp.embrapa.io/oauth/authorize`     |
| Token        | `https://seg.mcp.embrapa.io/oauth/token`         |
| Userinfo     | `https://seg.mcp.embrapa.io/oauth/userinfo`      |
| Registro     | `https://seg.mcp.embrapa.io/oauth/register`      |
| Revogação    | `https://seg.mcp.embrapa.io/oauth/revoke`        |

**Parâmetros do servidor:**

| Campo                               | Valor                              |
|-------------------------------------|------------------------------------|
| `grant_types_supported`             | `authorization_code`, `refresh_token` |
| `response_types_supported`          | `code`                             |
| `code_challenge_methods_supported`  | `S256`                             |
| `token_endpoint_auth_methods`       | `none` (cliente público, sem secret) |

---

## Ferramentas MCP disponíveis

O MCP-SEG expõe 8 ferramentas acessíveis via `embrapaMCPSearch()`:

| Ferramenta         | Descrição                                                        |
|--------------------|------------------------------------------------------------------|
| `consultar`        | Navegação genérica em coleções com filtros e paginação           |
| `buscar_projetos`  | Pesquisa textual de projetos por unidade/status                  |
| `detalhar_projeto` | Equipe, planos, atividades e relações de um projeto em uma chamada |
| `buscar_empregados`| Busca full-text por nome, e-mail, cargo ou setor (~21 mil registros) |
| `perfil_empregado` | Perfil completo com todos os níveis de participação              |
| `buscar_softwares` | Catálogo CatSoft (~1,2 mil sistemas)                             |
| `ranking_m2m`      | Ordenação por quantidade de relações                             |
| `system_prompt`    | Retorna esquema e regras de uso para a LLM                       |

---

## Funções JavaScript disponíveis

```javascript
// Autenticação
embrapaLogin()       // inicia o fluxo PKCE e redireciona para login
embrapaLogout()      // revoga token e limpa sessão
embrapaGetUser()     // retorna { name, email, unidade, picture, ... } ou null
embrapaGetToken()    // retorna o Bearer token ativo ou null se expirado

// Chamadas ao MCP-SEG (requer token válido)
embrapaMCPSearch('buscar_empregados', { query: 'João Silva' })
embrapaMCPSearch('buscar_projetos',   { query: 'soja maranhão' })
embrapaMCPSearch('perfil_empregado',  { id: '12345' })
embrapaMCPSearch('buscar_softwares',  { query: 'monitoramento' })
embrapaMCPSearch('detalhar_projeto',  { id: 'SEG-XXXX' })
```

---

## Requisito: servir via HTTP/HTTPS

A aplicação **não funciona com `file://`** — o `redirect_uri` do OAuth exige um origin HTTP.

Use um servidor local durante o desenvolvimento:

```bash
# Node.js
npx serve .

# Python
python -m http.server 8080

# VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Acesse então em `http://localhost:3000` (ou a porta do servidor).

---

## Possíveis problemas

### CORS no token endpoint

Se o browser bloquear a requisição `POST /oauth/token` por política de CORS, será necessário um proxy reverso simples:

```nginx
# nginx — proxy para o MCP
location /mcp-proxy/ {
    proxy_pass https://seg.mcp.embrapa.io/;
    add_header Access-Control-Allow-Origin *;
}
```

Ou um proxy Node.js mínimo:

```javascript
// proxy.js (Node + express)
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/mcp-proxy', createProxyMiddleware({
  target: 'https://seg.mcp.embrapa.io',
  changeOrigin: true,
  pathRewrite: { '^/mcp-proxy': '' },
}));

app.listen(8081);
```

### redirect_uri não aprovado

A Embrapa pode precisar aprovar o `redirect_uri` da aplicação. Informe ao time de TI da Embrapa a URL base onde o app está hospedado (ex: `https://meu-site.embrapa.br/`).

---

## Dados disponíveis no `userinfo`

Após login, `embrapaGetUser()` pode retornar campos como:

```json
{
  "sub": "matricula-do-empregado",
  "name": "Nome Completo",
  "given_name": "Nome",
  "email": "nome@embrapa.br",
  "picture": "https://...",
  "unidade": "Embrapa Cocais",
  "unit": "CPAMN"
}
```

> Os campos exatos dependem do que o servidor Embrapa expõe no endpoint `userinfo`. Verifique com o time do embrapa.io quais claims estão disponíveis.

---

## Dados corporativos acessíveis via MCP-SEG

| Base           | Volume aproximado                                  |
|----------------|----------------------------------------------------|
| SEG — Projetos | ~7.700 projetos                                    |
| SEG — Planos   | ~29.000 planos de ação                             |
| SEG — Atividades | ~123.000 atividades                              |
| Empregados     | ~21.000 colaboradores (unidade, cargo, Lattes, foto) |
| CatSoft        | ~1.200 sistemas cadastrados                        |
| Portal embrapa.br | palavras-chave, ecossistemas, notícias indexadas |
