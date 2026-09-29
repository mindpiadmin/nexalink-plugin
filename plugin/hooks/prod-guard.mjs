#!/usr/bin/env node
// Guarda de producción del plugin NexaLink (hooks PreToolUse + PostToolUse sobre las herramientas de
// Playwright, también dentro de los subagentes). Si la página abierta es de un entorno marcado como
// PRODUCCIÓN en NexaLink, bloquea todo lo que escribe o cambia algo: teclear (también tecla a tecla),
// rellenar, elegir opciones, subir archivos, ejecutar código, arrastrar, clics con el ratón por
// coordenadas, aceptar diálogos y los clics en botones que crean, guardan, borran, envían, pagan,
// confirman o marcan casillas/interruptores, y en botones sin nombre legible. Navegar, mirar,
// moverse con Tab/flechas y los enlaces siempre pasan.
//
// - Página actual: PostToolUse lee «Page URL:» de CADA respuesta de Playwright (clics que navegan,
//   pestañas, atrás, redirecciones) y el snapshot de la página (rol y nombre real de cada ref). Antes
//   de que llegue la primera respuesta vale el destino de browser_navigate / browser_tabs new.
//   Estado en CLAUDE_PLUGIN_DATA/guard/<sesión>.json.
// - ¿Producción?: GET <NexaLink>/agent-plugin/production-check?origin= (URL de NexaLink en
//   hooks/nexalink.json, generado por dominio en el zip), con caché de 10 min y 3 s de espera.
//   localhost e IP privadas son siempre pruebas. Sin respuesta ni caché, deja pasar y avisa: la
//   primera capa es la regla de la skill nexalink-qa.
// Bloquear = salir con código 2 y el motivo por stderr (el agente lo ve).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'nexalink-plugin');
const DIR = path.join(DATA, 'guard');
const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 3000;
const MAX_REFS = 4000;

const WRITE_ACTIONS = new Set([
  'browser_type', 'browser_fill_form', 'browser_select_option', 'browser_file_upload',
  'browser_evaluate', 'browser_run_code_unsafe', 'browser_drag', 'browser_drop',
]);
// Ratón por coordenadas (capacidad «vision»): no se sabe qué hay debajo. Mover y la rueda solo miran.
const MOUSE_READONLY = new Set(['browser_mouse_move_xy', 'browser_mouse_wheel']);
// En producción solo pasan las teclas que mueven por la página; nunca las que escriben o activan
// (letras, Enter, Espacio, Borrar, atajos con Control/Meta/Alt…).
const NAV_KEY = /^(shift\+)?tab$|^(arrow(up|down|left|right)|pageup|pagedown|home|end|escape)$/i;
// Roles que cambian un valor al pulsarlos.
const TOGGLE_ROLES = new Set(['checkbox', 'switch', 'radio', 'menuitemcheckbox', 'menuitemradio', 'option', 'slider', 'spinbutton', 'treeitem']);
// Verbos de botones que cambian algo o lo confirman (es/en). Conservador: en producción el agente solo mira.
const DESTRUCTIVE = /(^|[^\p{L}])(guardar|grabar|crear|añadir|agregar|eliminar|borrar|quitar|enviar|mandar|pagar|comprar|confirmar|aceptar|aprobar|publicar|actualizar|finalizar|cerrar\s+(pedido|ticket|venta|caso)|cancelar\s+(pedido|orden|reserva|suscripci\p{L}*|cuenta|venta)|continuar|proceder|aplicar|reservar|firmar|subir|importar|descartar|archivar|restaurar|restablecer|responder|comentar|asignar|reasignar|marcar|invitar|registrar(se)?|devolver|reembolsar|transferir|sí|si|ok|okay|save|create|add|delete|remove|send|submit|pay|buy|purchase|checkout|confirm|accept|approve|publish|update|finish|continue|proceed|apply|book|upload|import|discard|archive|restore|reset|reply|comment|assign|reassign|mark|invite|register|sign\s*up|refund|transfer|yes|place\s+order|cancel\s+(order|subscription|booking|account))([^\p{L}]|$)/iu;
// Un nombre sin letras ni números (iconos de fuentes, vacío) no dice qué hace el botón.
const READABLE = /[\p{L}\p{N}]/u;
const CLOSE = /^\s*(×|✕|✖|x|cerrar|close|volver|back|atrás)\s*$/iu;

const readStdin = () => new Promise((resolve) => {
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { buf += c; });
  process.stdin.on('end', () => resolve(buf));
});
const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const writeJson = (file, value) => { try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(file, JSON.stringify(value)); } catch { /* sin disco: no bloquea */ } };
const originOf = (u) => { try { const x = new URL(String(u)); return /^https?:$/.test(x.protocol) ? x.origin : ''; } catch { return ''; } };

function isLocal(origin) {
  const host = new URL(origin).hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host === '::1' || host === '0.0.0.0') return true;
  const m = host.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}

async function isProduction(origin) {
  const cacheFile = path.join(DIR, 'origins.json');
  const cache = readJson(cacheFile, {});
  const hit = cache[origin];
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.production;
  const base = readJson(path.join(HERE, 'nexalink.json'), {}).url || process.env.NEXALINK_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${String(base).replace(/\/$/, '')}/agent-plugin/production-check?origin=${encodeURIComponent(origin)}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return hit ? hit.production : null;
    const production = (await res.json())?.production === true;
    cache[origin] = { production, at: Date.now() };
    writeJson(cacheFile, cache);
    return production;
  } catch {
    return hit ? hit.production : null;
  }
}

// ── Respuestas de Playwright (PostToolUse) ────────────────────────────────────
const responseText = (r) => {
  if (typeof r === 'string') return r;
  if (Array.isArray(r)) return r.map((x) => (typeof x === 'string' ? x : x?.text || '')).join('\n');
  if (r && Array.isArray(r.content)) return responseText(r.content);
  return '';
};

// «- button "Guardar" [ref=e45]» → { e45: ['button', 'Guardar'] }
function parseRefs(yaml) {
  const refs = {};
  let n = 0;
  for (const m of yaml.matchAll(/^\s*-\s+([a-z]+)(?:\s+"((?:[^"\\]|\\.)*)")?[^\n]*?\[ref=([^\]\s]+)\]/gm)) {
    refs[m[3]] = [m[1], (m[2] || '').replace(/\\"/g, '"')];
    if (++n >= MAX_REFS) break;
  }
  return refs;
}

// El snapshot llega en línea (```yaml) o como enlace a un .yml en la carpeta de salida.
function snapshotOf(text, cwd) {
  const inline = text.match(/```yaml\n([\s\S]*?)```/);
  if (inline) return inline[1];
  const link = text.match(/\[Snapshot\]\(([^)]+\.yml)\)/);
  if (!link) return '';
  try { return fs.readFileSync(path.resolve(cwd || process.cwd(), link[1]), 'utf8'); } catch { return ''; }
}

function track(event, stateFile) {
  const text = responseText(event.tool_response);
  const st = readJson(stateFile, {});
  const url = text.match(/^-\s*Page URL:\s*(\S+)/m)?.[1];
  const origin = url ? originOf(url) : '';
  if (origin && origin !== st.origin) st.refs = {};
  if (origin) Object.assign(st, { origin, url, at: Date.now() });
  const yaml = snapshotOf(text, event.cwd);
  if (yaml) st.refs = parseRefs(yaml);
  writeJson(stateFile, st);
}

// ── ¿Esta acción escribe? (PreToolUse) ────────────────────────────────────────
function clickWrites(input, refs) {
  const target = String(input?.target || input?.ref || '');
  const known = refs?.[target];
  if (known) {
    const [role, name] = known;
    if (TOGGLE_ROLES.has(role)) return `marcar o cambiar «${name || role}»`;
    if (DESTRUCTIVE.test(name)) return `pulsar «${name.trim().slice(0, 60)}»`;
    if (role === 'button' && !READABLE.test(name) && !CLOSE.test(name)) return 'pulsar un botón sin nombre (puede borrar o enviar algo)';
  }
  // Descripción del agente y selector (`button:has-text("Guardar")`) cuando no hay ref conocida.
  const label = `${input?.element || ''} ${known ? '' : target}`;
  if (DESTRUCTIVE.test(label)) return `pulsar «${String(input?.element || target).slice(0, 60)}»`;
  return null;
}

function writeReason(action, input, refs) {
  if (WRITE_ACTIONS.has(action)) return 'escribir ni enviar nada';
  if (action.startsWith('browser_mouse_') && !MOUSE_READONLY.has(action)) return 'pulsar por coordenadas';
  if (action === 'browser_press_key') return NAV_KEY.test(String(input?.key || '').trim()) ? null : `teclear «${String(input?.key || '').slice(0, 20)}»`;
  if (action === 'browser_handle_dialog') return input?.accept === true || input?.promptText ? 'aceptar el diálogo' : null;
  if (action === 'browser_click') return clickWrites(input, refs);
  return null;
}

async function main() {
  let event = {};
  try { event = JSON.parse(await readStdin() || '{}'); } catch { process.exit(0); }
  const tool = String(event.tool_name || '');
  const action = tool.replace(/^mcp__(plugin_[^_]+_)?playwright__/, '');
  const input = event.tool_input || {};
  const session = String(event.session_id || 'default').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'default';
  const stateFile = path.join(DIR, `${session}.json`);

  if (event.hook_event_name === 'PostToolUse') {
    track(event, stateFile);
    process.exit(0);
  }

  // Destino conocido antes de la respuesta (la respuesta lo corrige si hay redirección).
  const dest = action === 'browser_navigate' ? input.url : action === 'browser_tabs' && input.action === 'new' ? input.url : null;
  if (dest) {
    const origin = originOf(dest);
    if (origin) writeJson(stateFile, { origin, url: dest, at: Date.now(), refs: {} });
    process.exit(0);
  }

  const st = readJson(stateFile, {});
  const reason = writeReason(action, input, st.refs);
  if (!reason) process.exit(0);

  const origin = st.origin;
  if (!origin || isLocal(origin)) process.exit(0);
  const production = await isProduction(origin);
  if (production === true) {
    process.stderr.write(`${origin} está marcado como entorno de PRODUCCIÓN en NexaLink (Agentes → Entornos de prueba): solo lectura. No se puede ${reason} aquí, de ninguna forma. Prueba esto en el entorno de pruebas (get_test_access → testing) o márcalo en el veredicto como «no se puede comprobar en producción».\n`);
    process.exit(2);
  }
  if (production === null) {
    process.stderr.write(`[nexalink] No se pudo comprobar si ${origin} es producción; si lo es, no escribas nada allí.\n`);
  }
  process.exit(0);
}

main().catch(() => process.exit(0));
