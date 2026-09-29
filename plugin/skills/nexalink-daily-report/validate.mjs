#!/usr/bin/env node
// Revisa el borrador del reporte diario ANTES de guardarlo, con las mismas reglas que NexaLink, para
// no ir y volver por los `pendingIssues` / `styleIssues` de save_daily_report_draft.
//
//   node validate.mjs <borrador.json>      (o el JSON por stdin)
//
// El borrador es lo que irá en save_daily_report_draft: `{ date?, entries: [...], absence? }` o solo
// el array de entradas. Antes de subirlas, una captura puede ser local: `{ kind: 'FILE', path }` y un
// paso `{ text, image: '<ruta local>' }`; se comprueba que el archivo existe, que es imagen o vídeo y
// su tamaño. Ya subida: `fileUrl` empieza por /uploads/.
//
// Salida: JSON { ok, errors, blocking, style, advice } — `errors`: la herramienta rechazaría la
// llamada; `blocking`: no se podría enviar el día; `style`: el servidor lo bloquea al enviar;
// `advice`: reglas de la skill (p. ej. «Dónde probarlo» en localhost). Código de salida
// 0 si está todo bien, 1 si hay algo que arreglar, 2 si no se pudo leer el borrador.
// Los límites son copia de los del servidor (backend/src/utils/dailyReportsService.ts y
// routes/mcp.ts); `npm run validate:agent-plugin` falla si se desalinean.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIMITS = {
  maxWords: 150, styleMaxChars: 200, maxReasonChars: 140, maxAbsenceReasonChars: 300,
  maxTestSteps: 10, maxTestStepChars: 200, maxFreeEntries: 10, maxFreeTitleChars: 120,
  maxTechRefs: 20, maxTechLabelChars: 120, maxEvidences: 20, maxEvidenceBytes: 50 * 1024 * 1024,
  maxTestUrlChars: 500, maxMinutes: 24 * 60,
};

const MEDIA = /\.(png|jpe?g|gif|webp|avif|bmp|mp4|webm|mov|m4v|ogv)$/i;
const TECH_HOSTS = /(^|\.)(github\.com|gitlab\.com|bitbucket\.org)$/i;
const TECH_PATH = /\/(pull|merge_requests|commit|commits|tree|compare|branch|branches)(\/|$)/i;
const LOCAL_HOST = /^(localhost|127\.|0\.0\.0\.0|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i;

const MESSAGES = {
  DAILY_REPORT_TEXT_REQUIRED: 'Falta el texto: qué se consiguió.',
  DAILY_REPORT_WORD_LIMIT: `El texto supera las ${LIMITS.maxWords} palabras.`,
  DAILY_REPORT_TIME_REQUIRED: 'Falta el tiempo (minutos enteros, de 1 a 1440).',
  DAILY_REPORT_EVIDENCE_REQUIRED: 'Falta al menos una evidencia (captura, vídeo o enlace al resultado).',
  DAILY_REPORT_EVIDENCE_INVALID: 'Una evidencia no es válida.',
  DAILY_REPORT_REASON_REQUIRED: `Falta el motivo de «hoy no» (máximo ${LIMITS.maxReasonChars} caracteres).`,
  DAILY_REPORT_TITLE_REQUIRED: 'Falta el título de «Otro trabajo».',
  DAILY_REPORT_EMPTY: 'No hay ninguna entrada respondida ni ausencia.',
  DAILY_REPORT_DUPLICATE_ENTRY: 'Hay dos entradas para lo mismo: una por tarea o ticket y día.',
  STYLE_TEXT_TOO_LONG: `El texto pasa de ${LIMITS.styleMaxChars} caracteres (máximo 2 frases).`,
  STYLE_TECH_LINK_AS_EVIDENCE: 'Un PR, commit o rama no es evidencia: va en techRefs.',
  SCHEMA: 'La herramienta rechazaría la llamada.',
  TEST_URL_INVALID: '«Dónde probarlo» no es una dirección http(s): NexaLink la descartaría.',
  TEST_URL_LOCAL: '«Dónde probarlo» es local: el supervisor no puede abrirla. Usa el entorno de pruebas.',
  TEST_URL_TECH: '«Dónde probarlo» es un PR o un commit: tiene que ser la pantalla donde se ve el trabajo.',
};

const countWords = (s) => (typeof s === 'string' ? s.trim().split(/\s+/).filter(Boolean).length : 0);
const isHttp = (u) => { try { return /^https?:$/.test(new URL(String(u)).protocol); } catch { return false; } };
const isTechLink = (u) => { try { const x = new URL(u); return TECH_HOSTS.test(x.hostname) && TECH_PATH.test(x.pathname); } catch { return false; } };
const isLocalUrl = (u) => { try { return LOCAL_HOST.test(new URL(u).hostname); } catch { return false; } };

/** Un archivo local (antes de subirlo) o ya subido: null si vale, el motivo si no. */
function fileProblem(ref, baseDir) {
  if (typeof ref !== 'string' || !ref) return 'sin archivo';
  if (ref.startsWith('/uploads/')) return null;
  const file = path.resolve(baseDir, ref);
  let st;
  try { st = fs.statSync(file); } catch { return `no existe ${ref}`; }
  if (!st.isFile()) return `no es un archivo: ${ref}`;
  if (!MEDIA.test(file)) return `no es imagen ni vídeo: ${ref}`;
  if (st.size > LIMITS.maxEvidenceBytes) return `pasa de 50 MB: ${ref}`;
  return null;
}

export function validateDraft(draft, { baseDir = process.cwd() } = {}) {
  const entries = Array.isArray(draft) ? draft : Array.isArray(draft?.entries) ? draft.entries : [];
  const absence = Array.isArray(draft) ? undefined : draft?.absence;
  const errors = [], blocking = [], style = [], advice = [];
  const add = (list, key, code, detail) => list.push({ key, code, message: MESSAGES[code] || code, ...(detail ? { detail } : {}) });
  const seen = new Set();
  let free = 0;

  for (const [i, e] of entries.entries()) {
    const isFree = e?.kind === 'FREE';
    const key = isFree ? `FREE:${e.clientKey ?? `nueva-${free + 1}`}` : `${e?.kind}:${e?.itemId}`;
    if (!isFree && !['TASK', 'TICKET'].includes(e?.kind)) { add(errors, `#${i + 1}`, 'SCHEMA', 'kind debe ser TASK, TICKET o FREE'); continue; }
    if (!isFree && !e.itemId) { add(errors, key, 'SCHEMA', 'falta itemId (el de la fila de get_daily_report)'); continue; }
    if (!isFree && typeof e.worked !== 'boolean') { add(errors, key, 'SCHEMA', 'worked debe ser true o false'); continue; }
    if (seen.has(key)) add(errors, key, 'DAILY_REPORT_DUPLICATE_ENTRY');
    seen.add(key);
    if (isFree && ++free > LIMITS.maxFreeEntries) add(errors, key, 'SCHEMA', `máximo ${LIMITS.maxFreeEntries} entradas de «Otro trabajo»`);

    if (!isFree && e.worked === false) {
      const reason = typeof e.notWorkedReason === 'string' ? e.notWorkedReason.trim() : '';
      if (!reason) add(blocking, key, 'DAILY_REPORT_REASON_REQUIRED');
      else if (reason.length > LIMITS.maxReasonChars) add(errors, key, 'SCHEMA', `el motivo tiene ${reason.length}/${LIMITS.maxReasonChars} caracteres`);
      continue;
    }

    if (isFree) {
      const title = typeof e.title === 'string' ? e.title.trim() : '';
      if (!title) add(blocking, key, 'DAILY_REPORT_TITLE_REQUIRED');
      else if (title.length > LIMITS.maxFreeTitleChars) add(errors, key, 'SCHEMA', `el título tiene ${title.length}/${LIMITS.maxFreeTitleChars} caracteres`);
    }
    if (!isFree && e.kind !== 'TASK' && Array.isArray(e.completedItemIds) && e.completedItemIds.length) {
      add(errors, key, 'SCHEMA', 'completedItemIds solo va en entradas de tareas (TASK)');
    }
    if (!isFree && e.kind !== 'TASK' && Array.isArray(e.progressItemIds) && e.progressItemIds.length) {
      add(errors, key, 'SCHEMA', 'progressItemIds solo va en entradas de tareas (TASK)');
    }
    if (e.finished === true && (isFree || e.kind !== 'TASK')) add(errors, key, 'SCHEMA', 'finished solo va en entradas de tareas (TASK) sin subtareas');
    if (e.finished === true && ((Array.isArray(e.completedItemIds) && e.completedItemIds.length) || (Array.isArray(e.progressItemIds) && e.progressItemIds.length))) {
      add(errors, key, 'SCHEMA', 'finished es para tareas sin subtareas: con subtareas, la tarea pasa a revisión al completarlas todas');
    }
    const done = Array.isArray(e.completedItemIds) ? e.completedItemIds : [];
    const prog = Array.isArray(e.progressItemIds) ? e.progressItemIds : [];
    const both = prog.filter(id => done.includes(id));
    if (both.length) add(errors, key, 'SCHEMA', `una subtarea no puede estar terminada y avanzada a la vez: ${both.join(', ')}`);

    const content = typeof e.content === 'string' ? e.content.trim() : '';
    const words = countWords(content);
    if (!words) add(blocking, key, 'DAILY_REPORT_TEXT_REQUIRED');
    else if (words > LIMITS.maxWords) add(blocking, key, 'DAILY_REPORT_WORD_LIMIT', `${words}/${LIMITS.maxWords} palabras`);
    if (content.length > LIMITS.styleMaxChars) add(style, key, 'STYLE_TEXT_TOO_LONG', `${content.length}/${LIMITS.styleMaxChars}`);

    const m = e.minutesSpent;
    if (m === undefined || m === null) add(blocking, key, 'DAILY_REPORT_TIME_REQUIRED');
    else if (!Number.isInteger(m) || m < 1 || m > LIMITS.maxMinutes) add(errors, key, 'SCHEMA', `minutesSpent debe ser un entero de 1 a ${LIMITS.maxMinutes}`);

    const evidences = Array.isArray(e.evidences) ? e.evidences : [];
    if (!evidences.length) add(blocking, key, 'DAILY_REPORT_EVIDENCE_REQUIRED');
    if (evidences.length > LIMITS.maxEvidences) add(errors, key, 'SCHEMA', `máximo ${LIMITS.maxEvidences} evidencias`);
    for (const ev of evidences) {
      if (ev?.kind === 'LINK') {
        if (!isHttp(ev.url)) add(blocking, key, 'DAILY_REPORT_EVIDENCE_INVALID', `enlace no http(s): ${ev.url}`);
        else if (isTechLink(ev.url)) add(style, key, 'STYLE_TECH_LINK_AS_EVIDENCE', ev.url);
      } else if (ev?.kind === 'FILE') {
        const why = fileProblem(ev.fileUrl ?? ev.path, baseDir);
        if (why) add(blocking, key, 'DAILY_REPORT_EVIDENCE_INVALID', why);
      } else add(errors, key, 'SCHEMA', 'cada evidencia es { kind: FILE, fileUrl|path } o { kind: LINK, url }');
    }

    const steps = Array.isArray(e.testSteps) ? e.testSteps : [];
    if (steps.length > LIMITS.maxTestSteps) add(errors, key, 'SCHEMA', `${steps.length}/${LIMITS.maxTestSteps} pasos`);
    steps.forEach((s, n) => {
      const text = typeof s === 'string' ? s : s?.text;
      if (typeof text !== 'string' || !text.trim()) add(errors, key, 'SCHEMA', `el paso ${n + 1} está vacío`);
      else if (text.length > LIMITS.maxTestStepChars) add(errors, key, 'SCHEMA', `el paso ${n + 1} tiene ${text.length}/${LIMITS.maxTestStepChars} caracteres`);
      if (s && typeof s === 'object' && s.image) {
        const why = fileProblem(s.image, baseDir);
        if (why) add(errors, key, 'SCHEMA', `captura del paso ${n + 1}: ${why}`);
      }
    });

    const refs = Array.isArray(e.techRefs) ? e.techRefs : [];
    if (refs.length > LIMITS.maxTechRefs) add(errors, key, 'SCHEMA', `${refs.length}/${LIMITS.maxTechRefs} referencias técnicas`);
    for (const r of refs) {
      if (!['PR', 'COMMIT', 'BRANCH', 'OTHER'].includes(r?.kind) || !isHttp(r?.url)) add(errors, key, 'SCHEMA', `techRef no válida: ${JSON.stringify(r)}`);
      else if (typeof r.label === 'string' && r.label.length > LIMITS.maxTechLabelChars) add(errors, key, 'SCHEMA', `etiqueta de ${r.label.length}/${LIMITS.maxTechLabelChars} caracteres`);
    }

    if (e.testUrl !== undefined && e.testUrl !== null && e.testUrl !== '') {
      if (String(e.testUrl).length > LIMITS.maxTestUrlChars) add(errors, key, 'SCHEMA', `«Dónde probarlo» pasa de ${LIMITS.maxTestUrlChars} caracteres`);
      else if (!isHttp(e.testUrl)) add(advice, key, 'TEST_URL_INVALID', e.testUrl);
      else if (isLocalUrl(e.testUrl)) add(advice, key, 'TEST_URL_LOCAL', e.testUrl);
      else if (isTechLink(e.testUrl)) add(advice, key, 'TEST_URL_TECH', e.testUrl);
    }
  }

  if (absence && typeof absence === 'object') {
    const reason = typeof absence.reason === 'string' ? absence.reason.trim() : '';
    if (!reason) add(blocking, 'absence', 'DAILY_REPORT_REASON_REQUIRED');
    else if (reason.length > LIMITS.maxAbsenceReasonChars) add(errors, 'absence', 'SCHEMA', `motivo de ${reason.length}/${LIMITS.maxAbsenceReasonChars} caracteres`);
  } else if (!entries.some(e => e?.kind === 'FREE' || typeof e?.worked === 'boolean')) {
    add(blocking, 'report', 'DAILY_REPORT_EMPTY');
  }

  return { ok: !errors.length && !blocking.length && !style.length && !advice.length, errors, blocking, style, advice };
}

// Uso desde la línea de comandos.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  let raw;
  try { raw = file ? fs.readFileSync(file, 'utf8') : fs.readFileSync(0, 'utf8'); } catch (e) {
    process.stdout.write(`${JSON.stringify({ ok: false, error: `No se pudo leer el borrador: ${e.message}` })}\n`);
    process.exit(2);
  }
  let draft;
  try { draft = JSON.parse(raw); } catch (e) {
    process.stdout.write(`${JSON.stringify({ ok: false, error: `El borrador no es JSON válido: ${e.message}` })}\n`);
    process.exit(2);
  }
  const result = validateDraft(draft, { baseDir: file ? path.dirname(path.resolve(file)) : process.cwd() });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.ok ? 0 : 1);
}
