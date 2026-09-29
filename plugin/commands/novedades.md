---
description: Para supervisores — resumen de lo terminado en un periodo (tareas aprobadas y tickets finalizados), listo para contárselo a un cliente, con capturas. No envía nada
argument-hint: "[cliente, proyecto o tema] [periodo: «esta semana», «septiembre», «del 1 al 15»]"
disable-model-invocation: true
---

Usa la skill **nexalink-review**, sección «Client update», para preparar las novedades de:
$ARGUMENTS

- Sin periodo: los últimos 7 días. Los días los cuenta NexaLink (`period`), no tú. Sin cliente ni proyecto: todo lo terminado (pregúntame si lo
  separo por cliente o proyecto cuando haya varios).
- Escríbelo para el cliente: lo que ahora puede hacer, sin nombres internos ni nada técnico.
- Déjalo en un archivo con las capturas y enséñamelo; no lo envíes a nadie.
