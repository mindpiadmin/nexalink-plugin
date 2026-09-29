---
description: Prueba una tarea o ticket de NexaLink en el navegador — en el entorno de pruebas, con su cuenta de pruebas, siguiendo lo pedido y los pasos del reporte — y te da el resultado por criterio con capturas. No cambia nada en NexaLink
argument-hint: "<TAR-XXXXX | TK-XXXXX> [dirección donde probarlo]"
disable-model-invocation: true
---

Usa la skill **nexalink-qa** para probar: $ARGUMENTS

- Lo pedido: las subtareas y frases de la reunión de la tarea (o lo que pide el ticket). Los
  pasos: los de mi último reporte de esa tarea, por subtarea, si los hay.
- Dónde: la dirección que te di; si no, la de «Dónde probarlo» de mi último reporte; si no, el
  sistema de pruebas de la tarea; si tampoco hay, pregúntame. Siempre en el entorno de pruebas
  (`get_test_access`); en producción solo si te lo digo, y solo para mirar.
- Entra con la cuenta de pruebas de NexaLink; nunca me pidas mi contraseña.
- Dame el resultado ✓ / ✗ / ? por criterio con sus capturas y el `revision.md` para abrirlo.
- No guardes, envíes ni cambies nada en NexaLink.
