/**
 * EmbrapAI — Cloudflare Worker (proxy CORS para a API Anthropic)
 *
 * Como publicar (gratuito, sem cartão de crédito):
 *  1. Acesse https://workers.cloudflare.com e crie uma conta
 *  2. Clique em "Create Worker"
 *  3. Apague o código de exemplo e cole todo o conteúdo deste arquivo
 *  4. Clique em "Save and Deploy"
 *  5. Copie a URL gerada (ex: https://embrapa-proxy.seu-usuario.workers.dev)
 *  6. No chat da plataforma, clique em ⚙ e cole a URL no campo "Proxy CORS"
 */

export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: 'Header x-api-key ausente' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await request.text();

    let anthropicResponse;
    try {
      anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: `Proxy error: ${err.message}` } }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const responseBody = await anthropicResponse.text();

    return new Response(responseBody, {
      status: anthropicResponse.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
