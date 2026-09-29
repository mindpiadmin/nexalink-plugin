---
description: Prepara tu reporte diario de NexaLink — la entrada de una tarea (TAR-XXXXX) o de una de sus subtareas con su detalle técnico enlazado, o el día completo
argument-hint: "[TAR-XXXXX [subtarea] | TK-XXXXX | fecha] (sin nada: el día de hoy completo)"
disable-model-invocation: true
allowed-tools: Bash(git branch --show-current), Bash(git config user.email), Bash(git log --all --since=36.hours --date=iso-strict:*)
---

Usa la skill **nexalink-daily-report** para: $ARGUMENTS

- **Con un código de tarea o ticket** (`TAR-XXXXX` / `TK-XXXXX`, o si no hay argumento pero la rama
  o la conversación son de una tarea y te digo «de esta tarea»): sigue la sección «One task» —
  prepara solo la entrada de esa tarea en el reporte de hoy, con su detalle técnico ya enlazado
  (PR, commits de hoy con `Refs:` y rama), las subtareas que confirme como terminadas y, si en esta
  sesión se revisó la rama con `/nexalink:revisar`, sus pasos para probarlo y capturas.
- **Con una subtarea** (`TAR-XXXXX versión celular`), o si la tarea tiene varias abiertas y no la
  digo (pregúntame cuál): la entrada es de esa subtarea — texto, pasos con sus capturas y tiempo.
  Si esa tarea ya tiene entrada hoy, **súmale** lo nuevo sin borrar lo que había.
- **Con una fecha, o sin nada**: el flujo completo del día (o de ese día pendiente).

Vista previa primero; no guardes ni subas nada hasta que diga «súbelo».

## Repositorio (leído al lanzar el comando)
- Rama: !`git branch --show-current 2>/dev/null || echo "(no es un repositorio git)"`
- Tu correo de git: !`git config user.email 2>/dev/null || echo "(sin configurar)"`
- Commits de las últimas 36 h en todas las ramas (hash · fecha con zona · autor · mensaje; quédate con
  los de tu correo y cuenta el día en la zona de la empresa, no en la de este ordenador; para un día
  anterior, haz la consulta de la skill):
!`git log --all --since=36.hours --date=iso-strict --pretty='%h %ad %ae %s' -n 40 2>/dev/null || true`
