#!/usr/bin/env node
// Avisos del plugin NexaLink al abrir Claude Code (hook SessionStart, solo en sesiones nuevas). Se
// muestran a la persona (systemMessage), no al agente:
// 1. Novedades: si el CHANGELOG.md de esta versión tiene entradas («## …») que aún no vio en este
//    equipo, las enseña una vez. En la primera sesión solo guarda la marca (ya hay bienvenida).
// 2. Versión nueva: una vez al día compara la versión instalada (Claude Code nombra la carpeta del
//    plugin con los 12 primeros caracteres del sha256 del zip) con la del marketplace de este
//    NexaLink. Si hay otra y la actualización automática del marketplace está apagada, avisa con el
//    comando. Con --plugin-dir o un marketplace local la carpeta no es un sha y no se compara; la copia
//    de GitHub (hooks/nexalink.json source: 'github') tampoco: allí la versión es el commit.
// Nada si la persona los apagó (userConfig update_notices, en /config) ni en sesiones sin nadie
// delante (`claude -p`, scripts, CI). Sin red o sin respuesta, calla y lo intenta en la próxima sesión.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.dirname(HERE);
const DATA = process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'nexalink-plugin');
const STATE = path.join(DATA, 'updates.json');
const CONFIG = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const MARKETPLACE = 'nexalink';
const DAY_MS = 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 3000;
const MAX_SECTIONS = 3;
const MAX_CHARS = 1500;

if (process.env.CLAUDE_CODE_SESSION_ATTENDED === '0') process.exit(0);
if (/^(false|0|no)$/i.test(process.env.CLAUDE_PLUGIN_OPTION_UPDATE_NOTICES || '')) process.exit(0);

const readJson = (f, fallback) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } };
const state = readJson(STATE, {});
const messages = [];

// ── Novedades ────────────────────────────────────────────────────────────────
// Secciones «## título» del CHANGELOG, de la más nueva a la más vieja.
function sections() {
  let text;
  try { text = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8'); } catch { return []; }
  const out = [];
  for (const block of text.split(/^## /m).slice(1)) {
    const [title, ...body] = block.split('\n');
    out.push({ title: title.trim(), body: body.join('\n').trim() });
  }
  return out;
}
const all = sections();
if (all.length) {
  if (state.seenChangelog && state.seenChangelog !== all[0].title) {
    const seenAt = all.findIndex(s => s.title === state.seenChangelog);
    const fresh = all.slice(0, seenAt === -1 ? 1 : Math.min(seenAt, MAX_SECTIONS));
    let text = fresh.map(s => `${s.title}\n${s.body}`).join('\n\n');
    if (text.length > MAX_CHARS) text = `${text.slice(0, MAX_CHARS).replace(/\s+\S*$/, '')}…`;
    messages.push(`Novedades del plugin NexaLink:\n${text}`);
  }
  state.seenChangelog = all[0].title;
}

// ── Versión nueva ────────────────────────────────────────────────────────────
function autoUpdateOn() {
  const fromSettings = readJson(path.join(CONFIG, 'settings.json'), {})?.extraKnownMarketplaces?.[MARKETPLACE]?.autoUpdate;
  if (typeof fromSettings === 'boolean') return fromSettings;
  return readJson(path.join(CONFIG, 'plugins', 'known_marketplaces.json'), {})?.[MARKETPLACE]?.autoUpdate === true;
}

const installed = path.basename(ROOT);
const due = !state.checkedAt || Date.now() - Date.parse(state.checkedAt) > DAY_MS;
const { url: base, source } = readJson(path.join(HERE, 'nexalink.json'), {});
if (source !== 'github' && /^[0-9a-f]{12}$/.test(installed) && due && base && !autoUpdateOn()) {
  try {
    const res = await fetch(`${String(base).replace(/\/$/, '')}/agent-plugin/marketplace.json`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.ok) {
      const latest = String((await res.json())?.plugins?.[0]?.source?.sha256 || '').slice(0, 12);
      state.checkedAt = new Date().toISOString();
      if (latest && latest !== installed) {
        messages.push('Hay una versión nueva del plugin NexaLink. Actualízalo con `claude plugin update nexalink@nexalink` en la terminal y luego /reload-plugins. Para no tener que hacerlo a mano: /plugin → Marketplaces → nexalink → «Enable auto-update».');
      }
    }
  } catch { /* sin red: se vuelve a intentar en la próxima sesión */ }
}

try {
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(state));
} catch { process.exit(0); } // sin disco, mejor callar que repetir el aviso en cada sesión

if (messages.length) process.stdout.write(JSON.stringify({ systemMessage: messages.join('\n\n') }));
process.exit(0);
