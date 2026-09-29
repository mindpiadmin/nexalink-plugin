---
description: Corrige una tarea de NexaLink que ya existe (lo que te pidieron cambiar en la reunión) — añade o quita subtareas pendientes y vuelve a En progreso, con vista previa antes
argument-hint: "[TAR-XXXXX] <qué hay que cambiar> (y pega o arrastra la captura)"
disable-model-invocation: true
---

Usa la skill **nexalink-task**, sección «Corrections of an existing task», para esta corrección:

$ARGUMENTS

- Busca la tarea (con el código `TAR-` si lo di; si no, entre mis tareas en revisión, en progreso
  o hechas). Si hay dudas entre varias, pregunta cuál en una línea.
- Escribe el cambio como subtareas de alto nivel, sin código. Si pegué o arrastré una captura,
  súbela y adjúntala a su subtarea. Quita subtareas solo si lo pedí y solo pendientes.
- Primero `correct_task` con `confirmed: false`: enséñame la vista previa en un solo mensaje
  (qué añades, qué saltas por repetida, qué quitas y si vuelve a En progreso o pierde la
  aprobación) y espera mi «sí». Luego aplica con `confirmed: true` y dame el enlace.
- Si estamos en una reunión, usa la reunión de la sesión.
- Si no soy su responsable ni manager (no la encuentras o `CORRECTION_FORBIDDEN`), no insistas:
  anótalo como borrador normal y dímelo en una línea.
