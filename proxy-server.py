#!/usr/bin/env python3
"""
Servidor proxy local — EmbrapAI / Embrapa Maranhão
Serve os arquivos estáticos e faz proxy das chamadas à API Anthropic,
eliminando a restrição de CORS do navegador em localhost (HTTP).
"""
import http.server
import urllib.request
import urllib.error
import json
import os
import sys

PORT = 8080


class ProxyHandler(http.server.SimpleHTTPRequestHandler):

    # ── Preflight CORS ────────────────────────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    # ── POST: só /proxy/messages é tratado; resto rejeita ────────────────────
    def do_POST(self):
        if self.path == '/proxy/messages':
            self._proxy_anthropic()
        else:
            self.send_error(404, 'Not found')

    # ── Cabeçalhos CORS permissivos (apenas para localhost) ───────────────────
    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers',
                         'Content-Type, x-api-key, anthropic-version, '
                         'anthropic-dangerous-client-side-request-allow')

    # ── Proxy para a API Anthropic ────────────────────────────────────────────
    def _proxy_anthropic(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body   = self.rfile.read(length) if length > 0 else b'{}'
            api_key = self.headers.get('x-api-key', '')

            req = urllib.request.Request(
                'https://api.anthropic.com/v1/messages',
                data=body,
                method='POST',
                headers={
                    'Content-Type':      'application/json',
                    'x-api-key':         api_key,
                    'anthropic-version': '2023-06-01',
                }
            )

            with urllib.request.urlopen(req, timeout=60) as resp:
                result = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._cors_headers()
                self.end_headers()
                self.wfile.write(result)

        except urllib.error.HTTPError as e:
            result = e.read()
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self._cors_headers()
            self.end_headers()
            self.wfile.write(result)

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self._cors_headers()
            self.end_headers()
            self.wfile.write(
                json.dumps({'error': {'message': str(e)}}).encode()
            )

    # ── Silencia logs de arquivos estáticos; mostra só chamadas da API ────────
    def log_message(self, fmt, *args):
        msg = fmt % args if args else fmt
        if '/proxy/' in msg:
            print(f'  [API] {msg}')


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(('', PORT), ProxyHandler)
    print(f'\n  ╔══════════════════════════════════════╗')
    print(f'  ║  EmbrapAI — Servidor local           ║')
    print(f'  ║  http://localhost:{PORT}               ║')
    print(f'  ║  Ctrl+C para encerrar                ║')
    print(f'  ╚══════════════════════════════════════╝\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Servidor encerrado.')
