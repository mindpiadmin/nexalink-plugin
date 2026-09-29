---
description: Muestra en qué reunión de NexaLink se están anotando los borradores y deja cambiarla
argument-hint: "[nombre de la reunión, o vacío para ver la actual]"
disable-model-invocation: true
effort: low
---

Usa la skill **nexalink-task** (modo captura, paso 1 «Meeting»):

$ARGUMENTS

- Si no hay argumento: di en una línea en qué reunión se están anotando los borradores de esta
  sesión (o que todavía no se eligió ninguna) y pregunta si quiere cambiarla.
- Para elegir o cambiar: llama a `get_work_context` y ofrece las reuniones que el equipo abrió hoy
  (`todayMeetings`: título, quién la abrió, cuántos borradores) o una nueva con el nombre que diga.
  Si el argumento coincide con una de hoy, usa esa sin preguntar.
- Desde ahí, todos los borradores de la sesión van a esa reunión. No crees ningún borrador ahora.
