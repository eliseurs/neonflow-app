#!/usr/bin/env node
// Valida a wiki docs-as-code do Neon Flow (wiki/). Sem dependências.
// Checa: frontmatter obrigatório, tipo/status permitidos, ID único e coerente
// com o nome do arquivo, links relativos e referências cruzadas (ADR/RN/SPEC/TC/RUN/PEN).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve, basename } from 'node:path';

const ROOT = resolve(process.argv[2] ?? 'wiki');
const SKIP_DIRS = new Set(['templates']);
const REQUIRED = ['id', 'title', 'type', 'status', 'owner', 'updated'];
const STATUS = {
  page: ['ativo', 'rascunho'],
  register: ['ativo'],
  adr: ['proposta', 'aceita', 'rejeitada', 'substituida', 'obsoleta'],
  rn: ['proposta', 'prototipo', 'aprovada', 'revogada'],
  spec: ['rascunho', 'bloqueada', 'em-revisao', 'aprovada', 'as-built', 'obsoleta'],
  'test-contract': ['rascunho', 'ativo', 'obsoleto'],
  runbook: ['rascunho', 'ativo'],
};
const PREFIX = { adr: 'ADR', rn: 'RN', spec: 'SPEC', 'test-contract': 'TC', runbook: 'RUN' };
const REF = /\b(ADR|RN|SPEC|TC|RUN)-(\d{4})\b|\bPEN-(\d{2})\b/g;

const errors = [];
const err = (file, msg) => errors.push(`${relative(process.cwd(), file)}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return SKIP_DIRS.has(name) ? [] : walk(p);
    return name.endsWith('.md') ? [p] : [];
  });
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
    else v = v.replace(/^["']|["']$/g, '');
    data[kv[1]] = v;
  }
  return { data, body: text.slice(m[0].length) };
}

if (!existsSync(ROOT)) {
  console.error(`Wiki não encontrada em ${ROOT}`);
  process.exit(1);
}

const files = walk(ROOT);
const docs = [];
const ids = new Map();

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const fm = parseFrontmatter(text);
  if (!fm) { err(file, 'sem frontmatter YAML'); continue; }
  const { data } = fm;
  for (const k of REQUIRED) if (!data[k]) err(file, `campo obrigatório ausente: ${k}`);
  const allowed = STATUS[data.type];
  if (data.type && !allowed) err(file, `type inválido: ${data.type} (use ${Object.keys(STATUS).join(', ')})`);
  else if (allowed && data.status && !allowed.includes(data.status)) err(file, `status "${data.status}" inválido para ${data.type} (use ${allowed.join(', ')})`);
  if (data.updated && !/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) err(file, `updated deve ser AAAA-MM-DD: ${data.updated}`);
  const prefix = PREFIX[data.type];
  if (prefix && data.id && !new RegExp(`^${prefix}-\\d{4}$`).test(data.id)) err(file, `id "${data.id}" deve seguir ${prefix}-NNNN`);
  if (prefix && data.id && !basename(file).startsWith(`${data.id}-`)) err(file, `nome do arquivo deve começar com "${data.id}-"`);
  if (data.id) {
    if (ids.has(data.id)) err(file, `id duplicado: ${data.id} (também em ${relative(process.cwd(), ids.get(data.id))})`);
    else ids.set(data.id, file);
  }
  docs.push({ file, text, data });
}

// Pendências: linhas "| PEN-NN |" do registro.
const pens = new Set();
for (const d of docs) for (const m of d.text.matchAll(/^\|\s*(PEN-\d{2})\s*\|/gm)) pens.add(m[1]);

for (const { file, text } of docs) {
  // Links relativos.
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    const target = resolve(dirname(file), href.split('#')[0]);
    if (!existsSync(target)) err(file, `link quebrado: ${href}`);
  }
  // Referências cruzadas.
  for (const m of text.matchAll(REF)) {
    const ref = m[0];
    if (ref.startsWith('PEN-')) { if (!pens.has(ref)) err(file, `referência a pendência inexistente: ${ref}`); }
    else if (!ids.has(ref)) err(file, `referência a documento inexistente: ${ref}`);
  }
}

if (errors.length) {
  console.error(`wiki:validate falhou com ${errors.length} erro(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`wiki:validate ok — ${docs.length} documentos, ${ids.size} IDs, ${pens.size} pendências.`);
