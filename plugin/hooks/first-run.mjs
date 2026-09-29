#!/usr/bin/env node
// Primer uso del plugin NexaLink (hook SessionStart, solo al arrancar una sesión nueva). La primera
// vez en este equipo deja una marca en CLAUDE_PLUGIN_DATA y le pide al agente que, en su primera
// respuesta sobre NexaLink, ofrezca en UNA línea (al principio, para no tapar la pregunta con la
// que suele acabar) el recorrido de bienvenida (/nexalink:ayuda empezar). Las siguientes veces no
// dice nada. Las sesiones sin persona delante (`claude -p`, scripts, CI) no cuentan: ni aviso ni
// marca, así la primera sesión de verdad lo sigue teniendo. No toca la red ni NexaLink.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DATA = process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'nexalink-plugin');
const MARK = path.join(DATA, 'first-run.json');

// Claude Code marca así las sesiones sin nadie delante (-p / SDK).
if (process.env.CLAUDE_CODE_SESSION_ATTENDED === '0') process.exit(0);

try {
  if (fs.existsSync(MARK)) process.exit(0);
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(MARK, JSON.stringify({ at: new Date().toISOString() }));
} catch {
  process.exit(0); // sin disco no insistimos: mejor callar que repetirlo en cada sesión
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: 'The NexaLink plugin was just installed on this computer (first session). The first time in this session the person asks for something about NexaLink (a /nexalink: command, tasks, the daily report, a review…), answer it as usual but START that reply with ONE short line in their language offering the welcome tour, e.g. «¿Primera vez con NexaLink? /nexalink:ayuda empezar te enseña lo básico.» — at the start, so the question your reply ends with stays last. Say it only once; skip it if they already ran /nexalink:ayuda or the session is not about NexaLink.',
  },
}));
process.exit(0);
