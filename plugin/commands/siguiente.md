---
description: Trae tu siguiente trabajo de NexaLink (tarea o ticket; lo devuelto y lo empezado primero) con todo su contexto, lo marca como empezado y te pones con él
disable-model-invocation: true
---

Usa la skill **nexalink-work**: pide el siguiente trabajo con `get_next_task` (tareas y tickets),
ábrelo con `get_task` o `get_ticket`, descarga y mira sus capturas, y resúmeme quién lo pidió, las
frases textuales con minuto y hora (o lo que pide el ticket), las capturas y las subtareas. Si
me la devolvieron (`returned`), empieza por eso: quién, cuándo y qué cambió (si no, no digas nada
de devoluciones). Dime en una línea qué viene después en la cola (`queue`).
Márcalo como empezado con `start_work` y dímelo en una línea. Luego propón la rama con el código
y un plan corto (qué subtareas primero y qué cambiarías) y pregúntame «¿Arranco?»: no toques ningún
archivo hasta que te diga que sí, y nunca los cambios sin commitear que ya estaban. No hagas commit
sin que te lo pida.
