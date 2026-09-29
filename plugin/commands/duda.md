---
description: Deja una duda o un bloqueo en la tarea de NexaLink para quien la pidió, con su contexto (criterio, qué viste y opciones)
argument-hint: "[TAR-XXXXX | TK-XXXXX] [la duda, con tus palabras] (opcional)"
disable-model-invocation: true
---

Usa la skill **nexalink-work**, sección «Questions and blockers», para: $ARGUMENTS

Toma el código de la tarea de los argumentos, del nombre de la rama o de los commits (`Refs:`); si
no aparece, pregunta cuál es. Si no me dijiste la duda, pregúntamela.

Redacta un comentario corto y en lenguaje llano: qué criterio o cita de la tarea no está claro (con
quién y minuto), qué encontraste, las opciones con su consecuencia y cuál recomiendas. Enséñamelo
y, solo cuando lo confirme, déjalo en la tarea con `add_task_comment` (en un ticket, `add_ticket_comment`: es una respuesta en su
hilo y le llega por correo a quien lo abrió).
