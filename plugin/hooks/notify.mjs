#!/usr/bin/env node
// Aviso de escritorio (hook Notification, opcional: /config → «Aviso de escritorio», apagado por
// defecto). Cuando el agente espera a la persona — un permiso, una pregunta o su «sí» — muestra un
// aviso del sistema: «NexaLink · TAR-XXXXX necesita tu respuesta» (el código sale de la rama). Sirve
// mientras prueba en el navegador, que tarda minutos y la persona se va a otra cosa.
// macOS: osascript · Linux: notify-send · Windows: notificación de PowerShell. Sin notificador, nada.
// Los textos van como argumentos o variables de entorno, nunca pegados en un comando de shell.
import { spawn } from 'node:child_process';
import { codeInBranch, currentBranch, readInput } from './branch.mjs';

if (!/^(true|1|yes)$/i.test(process.env.CLAUDE_PLUGIN_OPTION_DESKTOP_NOTIFICATIONS || '')) process.exit(0);
if (process.env.CLAUDE_CODE_SESSION_ATTENDED === '0') process.exit(0);

const input = await readInput();
const code = codeInBranch(currentBranch(input.cwd || process.cwd()));
const what = code || 'Tu agente';
const body = {
  permission_prompt: `${what} necesita tu permiso para seguir.`,
  elicitation_dialog: `${what} te hace una pregunta.`,
  agent_needs_input: `${what} necesita tu respuesta.`,
  idle_prompt: `${what} te espera.`,
}[input.notification_type] || String(input.message || `${what} te espera.`).slice(0, 200);
const title = 'NexaLink';

const run = (cmd, args, env) => {
  try {
    const p = spawn(cmd, args, { stdio: 'ignore', detached: true, env: { ...process.env, ...env } });
    p.on('error', () => {});
    p.unref();
  } catch { /* sin notificador: no pasa nada */ }
};

if (process.platform === 'darwin') {
  run('osascript', ['-e', 'on run argv', '-e', 'display notification (item 2 of argv) with title (item 1 of argv)', '-e', 'end run', title, body]);
} else if (process.platform === 'win32') {
  const ps = [
    '$x=[Windows.UI.Notifications.ToastNotificationManager,Windows.UI.Notifications,ContentType=WindowsRuntime]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)',
    '$t=$x.GetElementsByTagName("text"); [void]$t.Item(0).AppendChild($x.CreateTextNode($env:NX_TITLE)); [void]$t.Item(1).AppendChild($x.CreateTextNode($env:NX_BODY))',
    '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe").Show([Windows.UI.Notifications.ToastNotification]::new($x))',
  ].join('; ');
  run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { NX_TITLE: title, NX_BODY: body });
} else {
  run('notify-send', ['--app-name=NexaLink', title, body]);
}
// Da tiempo a lanzar el proceso antes de salir.
setTimeout(() => process.exit(0), 50);
