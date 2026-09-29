---
description: Hace commit de tus cambios citando la tarea de NexaLink (Refs: TAR-XXXXX), con el mensaje al estilo del repo
argument-hint: "[TAR-XXXXX | TK-XXXXX] [qué incluir o mensaje] (opcional)"
disable-model-invocation: true
allowed-tools: Bash(git branch --show-current), Bash(git status --short), Bash(git diff --stat), Bash(git diff --cached --stat), Bash(git log --oneline -n 8)
---

Usa la skill **nexalink-work**, sección «Commits», para hacer commit de este trabajo. $ARGUMENTS

## Estado del repositorio (leído al lanzar el comando: no lo vuelvas a pedir)
- Rama: !`git branch --show-current 2>/dev/null || echo "(no es un repositorio git)"`
- Cambios (`git status --short`):
!`git status --short 2>/dev/null | head -n 60 || true`
- Sin stage (`git diff --stat`): !`git diff --stat 2>/dev/null | tail -n 30 || true`
- En stage (`git diff --cached --stat`): !`git diff --cached --stat 2>/dev/null | tail -n 30 || true`
- Últimos commits (el estilo del repo):
!`git log --oneline -n 8 2>/dev/null || true`

Toma el código de la tarea de los argumentos, del nombre de la rama o de los commits anteriores
(`Refs:`); si no aparece, pregunta cuál es.

1. Con el estado de arriba, lee el `git diff` de lo que vayas a proponer. Si estás en `main`/`develop`, avisa y
   propón crear la rama de la tarea antes.
2. Propón qué entra en el commit y el mensaje siguiendo las convenciones del repo (idioma, prefijos
   tipo `feat:`, `git log` reciente) con el trailer `Refs: TAR-XXXXX` en el último párrafo, junto a
   cualquier otra línea de atribución y sin línea en blanco entre ellas (si no, git no lo lee como
   trailer). Si hay cambios que no son de
   esta tarea, sepáralos o pregúntame; no metas secretos, `.env` ni archivos generados.
3. Enséñame el mensaje y los archivos, y haz el commit solo cuando lo confirme. No hagas push.
