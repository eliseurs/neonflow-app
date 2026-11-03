#!/usr/bin/env node
// Servidor estático do protótipo Neon Flow (dist/). Sem dependências.
// Pensado para o Railway: escuta em $PORT e 0.0.0.0, expõe /healthz e encerra limpo em SIGTERM.
// Proteção opcional por Basic Auth: defina BASIC_AUTH_USER e BASIC_AUTH_PASSWORD.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const AUTH_USER = process.env.BASIC_AUTH_USER || '';
const AUTH_PASS = process.env.BASIC_AUTH_PASSWORD || '';
const AUTH_ON = Boolean(AUTH_USER && AUTH_PASS);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Robots-Tag': 'noindex, nofollow',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}

function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function authorized(req) {
  if (!AUTH_ON) return true;
  const [scheme, value] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Basic' || !value) return false;
  const decoded = Buffer.from(value, 'base64').toString('utf8');
  const i = decoded.indexOf(':');
  if (i < 0) return false;
  // Avalia as duas comparações sempre, para não vazar qual falhou pelo tempo.
  const userOk = safeEqual(decoded.slice(0, i), AUTH_USER);
  const passOk = safeEqual(decoded.slice(i + 1), AUTH_PASS);
  return userOk && passOk;
}

// Resolve o caminho pedido dentro de dist/. Retorna null para travessia ou arquivo oculto.
function resolvePath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  if (decoded.includes('\0')) return null;
  const rel = normalize(decoded).replace(/^([/\\])+/, '');
  if (rel.split(/[/\\]/).some((part) => part.startsWith('.'))) return null;
  const full = join(ROOT, rel || 'index.html');
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null;
  return full;
}

export function createApp() {
  return createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (pathname === '/healthz') return send(res, 200, 'ok', { 'Cache-Control': 'no-store' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método não permitido', { Allow: 'GET, HEAD' });
    if (!authorized(req)) {
      return send(res, 401, 'Autenticação necessária', { 'WWW-Authenticate': 'Basic realm="Neon Flow", charset="UTF-8"' });
    }

    let file = resolvePath(pathname);
    if (!file) return send(res, 404, 'Não encontrado');
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': type,
        'Content-Length': body.length,
        'Cache-Control': type.startsWith('text/html') ? 'no-cache' : 'public, max-age=300',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      send(res, 404, 'Não encontrado');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApp();
  server.listen(PORT, HOST, () => {
    console.log(`Neon Flow (demo) em http://${HOST}:${PORT} — basic auth ${AUTH_ON ? 'ativo' : 'desligado'}`);
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
