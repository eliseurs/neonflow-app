// Testes do servidor estático (server.mjs). Sobe o processo real em uma porta livre.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer, request } from 'node:http';
import { fileURLToPath } from 'node:url';

const SERVER = fileURLToPath(new URL('../server.mjs', import.meta.url));
const children = [];
after(() => children.forEach((c) => c.kill()));

function freePort() {
  return new Promise((ok) => {
    const s = createServer().listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => ok(port)); });
  });
}

async function start(env = {}) {
  const port = await freePort();
  const child = spawn(process.execPath, [SERVER], { env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ...env } });
  children.push(child);
  await new Promise((ok, fail) => {
    child.stdout.on('data', (d) => d.toString().includes('Neon Flow') && ok());
    child.on('exit', (code) => fail(new Error(`servidor saiu com código ${code}`)));
  });
  return port;
}

// Usa http.request cru para que caminhos como /../ não sejam normalizados pelo cliente.
function get(port, path, headers = {}, method = 'GET') {
  return new Promise((ok, fail) => {
    const req = request({ host: '127.0.0.1', port, path, method, headers }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => ok({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', fail);
    req.end();
  });
}

const basic = (u, p) => ({ Authorization: `Basic ${Buffer.from(`${u}:${p}`).toString('base64')}` });

test('serve index.html na raiz com headers de segurança', async () => {
  const port = await start();
  const r = await get(port, '/');
  assert.equal(r.status, 200);
  assert.match(r.headers['content-type'], /text\/html/);
  assert.match(r.body, /Neon Flow/);
  assert.equal(r.headers['x-content-type-options'], 'nosniff');
  assert.equal(r.headers['x-frame-options'], 'DENY');
});

test('serve os assets com o tipo correto', async () => {
  const port = await start();
  assert.match((await get(port, '/app.js')).headers['content-type'], /text\/javascript/);
  assert.match((await get(port, '/style.css')).headers['content-type'], /text\/css/);
});

test('healthcheck responde 200', async () => {
  const port = await start();
  const r = await get(port, '/healthz');
  assert.equal(r.status, 200);
  assert.equal(r.body, 'ok');
});

test('bloqueia travessia de diretório e arquivos ocultos', async () => {
  const port = await start();
  for (const path of ['/../package.json', '/..%2fpackage.json', '/%2e%2e/server.mjs', '/.trinca/x', '/.env', '/inexistente.js']) {
    assert.equal((await get(port, path)).status, 404, path);
  }
});

test('rejeita métodos de escrita', async () => {
  const port = await start();
  assert.equal((await get(port, '/', {}, 'POST')).status, 405);
});

test('basic auth: exige credencial quando configurado, exceto no healthcheck', async () => {
  const port = await start({ BASIC_AUTH_USER: 'demo', BASIC_AUTH_PASSWORD: 's3nha' });
  assert.equal((await get(port, '/')).status, 401);
  assert.equal((await get(port, '/', basic('demo', 'errada'))).status, 401);
  assert.equal((await get(port, '/', basic('outro', 's3nha'))).status, 401);
  assert.equal((await get(port, '/', basic('demo', 's3nha'))).status, 200);
  assert.equal((await get(port, '/healthz')).status, 200);
});
