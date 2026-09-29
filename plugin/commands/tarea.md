---
description: Crea un borrador de tarea en NexaLink a partir de una captura y una descripción (alto nivel, sin código)
argument-hint: "<qué se pidió> (y pega o arrastra la captura)"
disable-model-invocation: true
---

Usa la skill **nexalink-task** en **modo captura** para este pedido:

$ARGUMENTS

- Si la persona pegó o arrastró una captura (o dio una ruta), súbela y adjúntala al borrador.
- Si no hay captura pero se sabe qué pantalla es, ofrece hacerla tú con Playwright (la persona
  inicia sesión ella misma en la ventana del navegador, salvo en un entorno de pruebas de la empresa,
  donde entras con su cuenta de pruebas; nunca pidas ni escribas la contraseña de una persona).
- Usa el repositorio abierto solo para entender el alcance; en el borrador todo va en alto nivel,
  sin código, archivos ni detalles técnicos (ver `draft-format.md` de la skill).
- Crea el borrador sin pedir confirmación y responde en una o dos líneas con el título y el
  enlace. Solo título, descripción de alto nivel, proyecto y captura: prioridad, responsable,
  fecha y subtareas los decide quien aprueba.
- Si no hay descripción ni captura, pregunta en una línea qué se pidió.
