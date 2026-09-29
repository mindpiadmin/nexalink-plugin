---
description: Empieza a trabajar en una tarea de NexaLink (TAR-XXXXX) o ticket (TK-XXXXX) con su contexto y deja la rama citándola
argument-hint: "<TAR-XXXXX, TK-XXXXX o enlace>"
disable-model-invocation: true
---

Usa la skill **nexalink-work** para empezar a trabajar en: $ARGUMENTS

Abre la tarea con `get_task` (un ticket `TK-` con `get_ticket`), descarga y mira sus capturas, y resume quién la pidió, las frases
textuales con minuto y hora, las capturas y las subtareas (si me la devolvieron, empieza por qué
cambió). Márcala como empezada con `start_work`
(dímelo en una línea). Propón la rama con el código y un plan corto (qué subtareas primero y qué
cambiarías) y pregunta «¿Arranco?»: no toques ningún archivo hasta que la persona diga que sí, y
nunca los cambios sin commitear que ya estaban. Cita el código en cada commit (`Refs: TAR-XXXXX`) y
no hagas commit sin que la persona lo pida.
