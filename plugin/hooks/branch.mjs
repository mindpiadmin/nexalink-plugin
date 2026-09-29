// Utilidades de los hooks que miran la rama (título de la sesión, aviso de escritorio): la rama
// actual y el código de NexaLink que cita (TAR-XXXXX / TK-XXXXX). Sin git, sin repo o sin código: null.
import { execFileSync } from 'node:child_process';

const CODE = /(?:^|[^A-Z0-9])((?:TAR|TK)-[0-9A-F]{5})(?![0-9A-Z])/;

export function currentBranch(cwd) {
  try {
    return execFileSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000,
    }).trim() || null;
  } catch { return null; }
}

export const codeInBranch = (branch) => (branch ? CODE.exec(branch.toUpperCase())?.[1] ?? null : null);

/** La entrada JSON del hook (stdin); {} si no llega o no se entiende. */
export function readInput() {
  return new Promise((resolve) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { buf += c; });
    process.stdin.on('end', () => { try { resolve(buf ? JSON.parse(buf) : {}); } catch { resolve({}); } });
    process.stdin.on('error', () => resolve({}));
  });
}
