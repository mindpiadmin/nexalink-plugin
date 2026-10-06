#!/usr/bin/env node
// Guarda en disco la captura que la persona PEGÓ en el chat de Claude Code, para poder subirla con
// get_upload_link. Una imagen pegada no existe como archivo: solo vive en el historial de la sesión
// (<config>/projects/<proyecto>/<sesión>.jsonl, en base64), así que el agente no tenía qué pasarle a curl.
//
//   node pasted-image.mjs                 → todas las imágenes del último mensaje de la persona que traiga alguna
//   node pasted-image.mjs --image 2       → solo la que aparece en el chat como [Image #2] (repetible)
//   opciones: --out <carpeta> (por defecto ${TEMP:-/tmp}/nexalink/task), --session <id>
//
// Salida: JSON { ok: true, files: [{ path, mediaType, image, bytes }], message: { at, text } } y código 0;
// { ok: false, error } y código 1 si no hay sesión, historial o imagen (el agente prueba entonces el
// portapapeles). `message` es el texto del mensaje de donde salieron, para comprobar que es la captura
// de ESTE pedido y no una vieja.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

function args(argv) {
  const out = { images: [], dir: path.join(process.env.TEMP || '/tmp', 'nexalink', 'task'), session: process.env.CLAUDE_CODE_SESSION_ID || '' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--image') out.images.push(Number(argv[++i]));
    else if (argv[i] === '--out') out.dir = argv[++i];
    else if (argv[i] === '--session') out.session = argv[++i];
  }
  return out;
}

function fail(error) {
  process.stdout.write(JSON.stringify({ ok: false, error }) + '\n');
  process.exit(1);
}

function transcriptOf(session) {
  const root = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'projects');
  let dirs = [];
  try { dirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()); } catch { return null; }
  for (const d of dirs) {
    const f = path.join(root, d.name, `${session}.jsonl`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

const { images: wanted, dir, session } = args(process.argv.slice(2));
if (!session) fail('Sin sesión de Claude Code (CLAUDE_CODE_SESSION_ID): prueba con el portapapeles.');
const file = transcriptOf(session);
if (!file) fail(`No encuentro el historial de la sesión ${session}.`);

// Mensajes de la persona con imágenes pegadas, del más reciente al más viejo. Las imágenes que
// devuelven las herramientas van dentro de un tool_result, no sueltas, así que no se cuelan.
const lines = fs.readFileSync(file, 'utf8').split('\n');
let picked = null;
for (let i = lines.length - 1; i >= 0 && !picked; i--) {
  if (!lines[i].includes('"image"')) continue;
  let row;
  try { row = JSON.parse(lines[i]); } catch { continue; }
  const content = row.type === 'user' ? row.message?.content : null;
  if (!Array.isArray(content)) continue;
  const blocks = content.filter((b) => b?.type === 'image' && b.source?.type === 'base64' && b.source.data);
  if (!blocks.length) continue;
  // imagePasteIds[n] es el número con que el chat muestra la imagen n del mensaje ([Image #N]).
  const ids = Array.isArray(row.imagePasteIds) ? row.imagePasteIds : [];
  const all = blocks.map((b, n) => ({ block: b, image: ids[n] ?? null }));
  const chosen = wanted.length ? all.filter((x) => wanted.includes(x.image)) : all;
  if (!chosen.length) continue;
  const text = content.filter((b) => b?.type === 'text').map((b) => b.text).join(' ').trim();
  picked = { chosen, at: row.timestamp || null, text: text.slice(0, 200) };
}
if (!picked) fail(wanted.length ? `No encuentro [Image #${wanted.join(', #')}] en esta sesión.` : 'No hay ninguna imagen pegada en esta sesión.');

fs.mkdirSync(dir, { recursive: true });
const stamp = (picked.at || new Date().toISOString()).replace(/\D/g, '').slice(0, 14);
const files = picked.chosen.map(({ block, image }, n) => {
  const mediaType = block.source.media_type || 'image/png';
  const p = path.join(dir, `captura-${stamp}-${image ?? n + 1}.${EXT[mediaType] || 'png'}`);
  const data = Buffer.from(block.source.data, 'base64');
  fs.writeFileSync(p, data);
  // En Windows, con «/»: curl (Git Bash o curl.exe) y Node la entienden igual y no hay «\» que escapar.
  return { path: p.split(path.sep).join('/'), mediaType, image, bytes: data.length };
});
process.stdout.write(JSON.stringify({ ok: true, files, message: { at: picked.at, text: picked.text } }) + '\n');
