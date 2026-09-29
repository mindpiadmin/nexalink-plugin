---
description: Resumen de tu día en NexaLink — lo que te devolvieron, tareas y tickets en curso y pendientes, en qué rama estás, PRs abiertos, reunión de hoy y días de reporte pendientes
disable-model-invocation: true
allowed-tools: Bash(git branch --show-current), Bash(git status --short), Bash(gh pr list --author @me --state open --json number,title,url,headRefName)
effort: low
---

Usa la skill **nexalink-work**, sección «Your day», para darme un resumen de mi día. No escribas
nada en NexaLink ni en git: solo lee y resume, y termina proponiendo el siguiente paso (un comando).
Lo devuelto (revisión o corrección de una reunión) va primero, con qué cambió.

## Repositorio (leído al lanzar el comando: no lo vuelvas a pedir)
- Rama: !`git branch --show-current 2>/dev/null || echo "(no es un repositorio git)"`
- Cambios sin commitear: !`git status --short 2>/dev/null | head -n 20 || true`
- Tus PRs abiertos: !`gh pr list --author @me --state open --json number,title,url,headRefName 2>/dev/null || echo "(sin gh, sin sesión o fuera de un repo de GitHub)"`
