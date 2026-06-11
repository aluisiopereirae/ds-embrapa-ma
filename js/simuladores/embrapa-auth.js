// ═══════════════════════════════════════════════════════════════════════════
// Embrapa MCP-SEG — Autenticação OAuth 2.1 com PKCE
// Documentação: https://www.embrapa.io/docs/mcp/seg/
// Endpoints descobertos via: https://seg.mcp.embrapa.io/.well-known/oauth-authorization-server
// ═══════════════════════════════════════════════════════════════════════════

const EMBRAPA_MCP = {
  BASE: 'https://seg.mcp.embrapa.io',
  AUTH_URL: 'https://seg.mcp.embrapa.io/oauth/authorize',
  TOKEN_URL: 'https://seg.mcp.embrapa.io/oauth/token',
  USERINFO_URL: 'https://seg.mcp.embrapa.io/oauth/userinfo',
  REGISTER_URL: 'https://seg.mcp.embrapa.io/oauth/register',
  REVOKE_URL: 'https://seg.mcp.embrapa.io/oauth/revoke',
};

// ─── Helpers PKCE ──────────────────────────────────────────────────────────
function _b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function _genVerifier() {
  const arr = new Uint8Array(48);
  crypto.getRandomValues(arr);
  return _b64url(arr);
}

async function _genChallenge(verifier) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return _b64url(buf);
}

function _redirectUri() {
  return window.location.origin + window.location.pathname.replace(/\/$/, '') + '/';
}

// ─── Registro dinâmico de cliente (RFC 7591) ───────────────────────────────
async function _getClientId() {
  const stored = sessionStorage.getItem('embrapa_client_id');
  if (stored) return stored;

  try {
    const res = await fetch(EMBRAPA_MCP.REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'DS Embrapa Maranhão — Dados & Simuladores',
        redirect_uris: [_redirectUri()],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
      }),
    });
    if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
    const data = await res.json();
    sessionStorage.setItem('embrapa_client_id', data.client_id);
    return data.client_id;
  } catch (err) {
    console.error('[EmbrapaAuth] Registro dinâmico falhou:', err);
    return null;
  }
}

// ─── Login: inicia fluxo PKCE ──────────────────────────────────────────────
async function embrapaLogin() {
  _setLoginState('loading');

  const clientId = await _getClientId();
  if (!clientId) {
    _setLoginState('error', 'Falha no registro da aplicação. Verifique a rede.');
    return;
  }

  const verifier = _genVerifier();
  const challenge = await _genChallenge(verifier);
  const state = crypto.randomUUID();

  sessionStorage.setItem('embrapa_pkce_verifier', verifier);
  sessionStorage.setItem('embrapa_oauth_state', state);
  sessionStorage.setItem('embrapa_redirect_from', window.location.href);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: _redirectUri(),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });

  window.location.href = `${EMBRAPA_MCP.AUTH_URL}?${params}`;
}

// ─── Callback: processa o code retornado ──────────────────────────────────
async function embrapaHandleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    console.error('[EmbrapaAuth] Erro retornado pelo servidor:', error, params.get('error_description'));
    _setLoginState('error', params.get('error_description') || error);
    window.history.replaceState({}, '', window.location.pathname);
    return false;
  }

  if (!code) return false;

  const savedState = sessionStorage.getItem('embrapa_oauth_state');
  if (state !== savedState) {
    console.error('[EmbrapaAuth] State mismatch — possível CSRF');
    _setLoginState('error', 'Falha de segurança: state inválido.');
    window.history.replaceState({}, '', window.location.pathname);
    return false;
  }

  const verifier = sessionStorage.getItem('embrapa_pkce_verifier');
  const clientId = sessionStorage.getItem('embrapa_client_id');

  try {
    const res = await fetch(EMBRAPA_MCP.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: _redirectUri(),
        client_id: clientId,
        code_verifier: verifier,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || `Token error: ${res.status}`);
    }

    const tokens = await res.json();
    sessionStorage.setItem('embrapa_access_token', tokens.access_token);
    if (tokens.refresh_token) sessionStorage.setItem('embrapa_refresh_token', tokens.refresh_token);
    if (tokens.expires_in) sessionStorage.setItem('embrapa_token_exp', Date.now() + tokens.expires_in * 1000);

    sessionStorage.removeItem('embrapa_pkce_verifier');
    sessionStorage.removeItem('embrapa_oauth_state');

    window.history.replaceState({}, '', window.location.pathname);
    await embrapaLoadUser();
    return true;

  } catch (err) {
    console.error('[EmbrapaAuth] Falha na troca de token:', err);
    _setLoginState('error', err.message);
    window.history.replaceState({}, '', window.location.pathname);
    return false;
  }
}

// ─── Carrega dados do usuário logado ──────────────────────────────────────
async function embrapaLoadUser() {
  const token = embrapaGetToken();
  if (!token) { _setLoginState('idle'); return null; }

  try {
    const res = await fetch(EMBRAPA_MCP.USERINFO_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Userinfo: ${res.status}`);
    const user = await res.json();
    sessionStorage.setItem('embrapa_user', JSON.stringify(user));
    _renderUser(user);
    return user;
  } catch (err) {
    console.error('[EmbrapaAuth] Falha ao carregar perfil:', err);
    _setLoginState('idle');
    return null;
  }
}

// ─── Logout ────────────────────────────────────────────────────────────────
async function embrapaLogout() {
  const token = embrapaGetToken();
  if (token) {
    try {
      await fetch(EMBRAPA_MCP.REVOKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token, client_id: sessionStorage.getItem('embrapa_client_id') || '' }),
      });
    } catch (_) {}
  }

  ['embrapa_access_token','embrapa_refresh_token','embrapa_token_exp',
   'embrapa_user','embrapa_pkce_verifier','embrapa_oauth_state'].forEach(k => sessionStorage.removeItem(k));

  _setLoginState('idle');
}

// ─── Token helper ──────────────────────────────────────────────────────────
function embrapaGetToken() {
  const token = sessionStorage.getItem('embrapa_access_token');
  const exp = sessionStorage.getItem('embrapa_token_exp');
  if (!token) return null;
  if (exp && Date.now() > Number(exp) - 30000) return null; // 30s de margem
  return token;
}

function embrapaGetUser() {
  try { return JSON.parse(sessionStorage.getItem('embrapa_user') || 'null'); } catch { return null; }
}

// ─── Chamada autenticada à API MCP-SEG ────────────────────────────────────
// Usa a ferramenta "buscar_empregados" ou outra via HTTP para o MCP
async function embrapaMCPSearch(tool, params = {}) {
  const token = embrapaGetToken();
  if (!token) throw new Error('Não autenticado');

  // MCP sobre HTTP usa POST para chamadas de tool
  const res = await fetch(`${EMBRAPA_MCP.BASE}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: tool, arguments: params },
    }),
  });

  if (!res.ok) throw new Error(`MCP error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// ─── Renderização do botão/avatar no header ────────────────────────────────
function _setLoginState(state, msg = '') {
  const btn = document.getElementById('embrapa-login-btn');
  const info = document.getElementById('embrapa-user-info');
  if (!btn) return;

  if (state === 'idle') {
    btn.style.display = '';
    if (info) info.style.display = 'none';
    btn.disabled = false;
    btn.innerHTML = '🔐 Entrar com Embrapa';
  } else if (state === 'loading') {
    btn.innerHTML = '⏳ Autenticando…';
    btn.disabled = true;
  } else if (state === 'error') {
    btn.style.display = '';
    btn.disabled = false;
    btn.innerHTML = '⚠️ Erro — tentar novamente';
    if (msg) console.warn('[EmbrapaAuth]', msg);
  }
}

function _renderUser(user) {
  const btn = document.getElementById('embrapa-login-btn');
  const info = document.getElementById('embrapa-user-info');

  if (btn) btn.style.display = 'none';

  if (!info) return;
  info.style.display = 'flex';

  const nome = user.name || user.given_name || user.sub || 'Empregado';
  const email = user.email || '';
  const unidade = user.unidade || user.unit || '';
  const foto = user.picture || user.photo || '';

  info.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="embrapaToggleMenu()" title="Perfil Embrapa">
      ${foto
        ? `<img src="${foto}" alt="${nome}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--green3)">`
        : `<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--green3),var(--teal));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff">${nome.charAt(0).toUpperCase()}</div>`
      }
      <div style="line-height:1.2">
        <div style="font-size:12px;font-weight:600;color:var(--text)">${nome.split(' ')[0]}</div>
        ${unidade ? `<div style="font-size:10px;color:var(--text3)">${unidade}</div>` : ''}
      </div>
      <span style="font-size:10px;color:var(--text3)">▾</span>
    </div>
    <div id="embrapa-dropdown" style="display:none;position:absolute;top:56px;right:16px;background:var(--card);border:1px solid var(--border2);border-radius:10px;padding:12px 16px;min-width:220px;z-index:2000;box-shadow:0 8px 24px rgba(0,0,0,0.5)">
      <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">${nome}</div>
      ${email ? `<div style="font-size:11px;color:var(--text3);margin-bottom:2px">✉ ${email}</div>` : ''}
      ${unidade ? `<div style="font-size:11px;color:var(--text3);margin-bottom:8px">🏢 ${unidade}</div>` : ''}
      <hr style="border-color:var(--border);margin:8px 0">
      <button onclick="embrapaLogout()" style="width:100%;background:none;border:1px solid var(--border2);color:var(--text2);padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;text-align:left">
        🚪 Sair da conta Embrapa
      </button>
    </div>
  `;
}

function embrapaToggleMenu() {
  const d = document.getElementById('embrapa-dropdown');
  if (!d) return;
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
}

// Fecha dropdown ao clicar fora
document.addEventListener('click', e => {
  const info = document.getElementById('embrapa-user-info');
  const dd = document.getElementById('embrapa-dropdown');
  if (dd && info && !info.contains(e.target)) dd.style.display = 'none';
});

// ─── Inicialização automática ──────────────────────────────────────────────
async function embrapaInit() {
  // Se há um "code" na URL, estamos no callback
  if (new URLSearchParams(window.location.search).has('code') ||
      new URLSearchParams(window.location.search).has('error')) {
    await embrapaHandleCallback();
    return;
  }

  // Se há token válido em sessão, recarrega o perfil
  if (embrapaGetToken()) {
    const cached = embrapaGetUser();
    if (cached) { _renderUser(cached); return; }
    await embrapaLoadUser();
    return;
  }

  _setLoginState('idle');
}

// Executa ao carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', embrapaInit);
} else {
  embrapaInit();
}
