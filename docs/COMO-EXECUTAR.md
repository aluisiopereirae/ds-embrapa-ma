# Como Executar — EmbrapAI / Embrapa Maranhão

---

## 1. Execução Local (localhost:8080)

### Pré-requisito

- **Python 3** instalado — [python.org/downloads](https://www.python.org/downloads/)
  - Durante a instalação, marque **"Add Python to PATH"**

### Passo a passo

1. Abra a pasta do projeto no explorador de arquivos
2. Clique duas vezes no arquivo **`iniciar-servidor.bat`**
3. Uma janela preta (terminal) vai abrir mostrando:

```
  ╔══════════════════════════════════════╗
  ║  EmbrapAI — Servidor local           ║
  ║  http://localhost:8080               ║
  ║  Ctrl+C para encerrar               ║
  ╚══════════════════════════════════════╝
```

4. Abra o navegador e acesse: **http://localhost:8080**
5. Para encerrar: clique na janela preta e pressione **Ctrl+C**

> **Importante:** não feche a janela preta enquanto estiver usando o sistema — ela é o servidor.

### Por que é necessário um servidor?

O sistema usa um arquivo `proxy-server.py` que faz duas coisas ao mesmo tempo:
- Serve os arquivos do site (HTML, JS, CSS)
- Funciona como proxy para o Chat IA, repassando as chamadas para a API Anthropic sem restrições de CORS

O simples `python -m http.server` (servidor padrão do Python) **não funciona** para o Chat IA porque não suporta requisições POST — retorna erro 501.

---

## 2. Execução no GitHub Pages (via Cloudflare Worker)

### Por que é necessário um proxy?

O navegador impõe uma política de segurança chamada **CORS** que bloqueia chamadas diretas de uma página web para serviços externos quando os cabeçalhos de autorização não são permitidos. A API da Anthropic não responde corretamente ao *preflight* CORS vindo do GitHub Pages, tornando impossível chamar a API diretamente do navegador.

A solução é um **proxy intermediário**: o navegador chama o Cloudflare Worker (que aceita a requisição), e o Worker repassa para a Anthropic de servidor para servidor (sem restrição de CORS).

---

### Passo 1 — Criar conta no Cloudflare (gratuito)

1. Acesse [workers.cloudflare.com](https://workers.cloudflare.com)
2. Clique em **"Sign Up"** e crie uma conta com seu e-mail
3. Não é necessário cartão de crédito
4. O plano gratuito suporta **100.000 requisições por dia**

---

### Passo 2 — Criar o Worker

1. Após login, clique em **"Workers & Pages"** no menu lateral
2. Clique em **"Create"** → **"Create Worker"**
3. Dê um nome ao worker (ex: `embrapa-proxy`)
4. Clique em **"Deploy"** para criar com o código padrão
5. Em seguida clique em **"Edit code"** (ou "Quick edit")

---

### Passo 3 — Colar o código do proxy

1. Apague **todo** o código que aparece no editor
2. Abra o arquivo **`cloudflare-worker.js`** da pasta do projeto
3. Copie todo o conteúdo e cole no editor do Cloudflare
4. Clique em **"Deploy"** (botão azul no canto superior direito)
5. Aguarde a mensagem de confirmação: *"Your worker has been deployed"*

---

### Passo 4 — Copiar a URL do Worker

Após o deploy, a URL gerada aparece no topo da tela, no formato:

```
https://nome-do-worker.seu-usuario.workers.dev
```

Exemplo real usado neste projeto:

```
https://shy-feather-3fc8.aluisio-pereira-ti.workers.dev/
```

Copie essa URL.

---

### Passo 5 — Configurar a URL no projeto

1. Abra o arquivo **`index.html`** em um editor de texto
2. Localize a linha (próximo ao início do bloco `<script>` do chat, por volta da linha 5651):

```javascript
const CLOUDFLARE_PROXY = '';
```

3. Cole a URL do Worker entre as aspas:

```javascript
const CLOUDFLARE_PROXY = 'https://shy-feather-3fc8.aluisio-pereira-ti.workers.dev/';
```

4. Salve o arquivo

---

### Passo 6 — Enviar para o GitHub

No terminal (ou Git Bash):

```bash
git add index.html
git commit -m "configura proxy Cloudflare Worker para GitHub Pages"
git push
```

Ou pelo VS Code: painel **Source Control** → escreva a mensagem → **Commit** → **Push**.

---

### Passo 7 — Aguardar o deploy do GitHub Pages

O GitHub Pages leva entre **1 e 3 minutos** para publicar as alterações após o push.

Para verificar o status do deploy:
1. Acesse o repositório no GitHub
2. Clique em **"Actions"** (aba superior)
3. Aguarde o workflow **"pages build and deployment"** ficar verde ✅

---

### Passo 8 — Testar

1. Abra a URL do GitHub Pages
2. Pressione **Ctrl+Shift+R** para garantir que não está carregando cache
3. Clique no botão de chat (canto inferior direito)
4. Informe sua chave de API Anthropic em **⚙ Configurações**
5. Envie uma mensagem — deve responder normalmente

---

### Verificar se o Worker está ativo

Acesse a URL do Worker diretamente no navegador. Se o Worker estiver funcionando, você verá:

```json
{"error":{"message":"Method not allowed"}}
```

Isso é o comportamento correto — significa que o Worker está rodando e rejeitou corretamente uma requisição GET (o chat usa POST).

---

## Resumo

| Ambiente | Como rodar | Chat IA |
|---|---|---|
| Local | `iniciar-servidor.bat` → `http://localhost:8080` | Funciona via `proxy-server.py` |
| GitHub Pages | Push para `main` → URL do GitHub Pages | Funciona via Cloudflare Worker |
| Arquivo direto (`file://`) | Abrir `index.html` no navegador | **Não funciona** — use o servidor local |
