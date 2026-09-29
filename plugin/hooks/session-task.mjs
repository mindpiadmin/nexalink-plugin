#!/usr/bin/env node
// Sesión de una tarea (hook SessionStart, solo en sesiones nuevas): si la rama actual cita una tarea o
// un ticket de NexaLink (TAR-XXXXX / TK-XXXXX), titula la sesión «TAR-XXXXX · rama» — al retomar
// sesiones se ve cuál es de qué — y le dice al agente a qué tarea se refiere «la tarea». Sin repo o
// sin código en la rama, no hace nada. No toca la red ni NexaLink.
import { codeInBranch, currentBranch, readInput } from './branch.mjs';

const input = await readInput();
const branch = currentBranch(input.cwd || process.cwd());
const code = codeInBranch(branch);
if (!code) process.exit(0);

const opener = code.startsWith('TK-') ? 'get_ticket' : 'get_task';
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    sessionTitle: `${code} · ${branch}`,
    additionalContext: `This repository is on branch «${branch}», which belongs to NexaLink ${code}. When the person says «la tarea», «esta tarea» or «el ticket» without a code, they mean ${code} (open it with ${opener} only when you need its details).`,
  },
}));
process.exit(0);
