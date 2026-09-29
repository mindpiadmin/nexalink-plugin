# Novedades del plugin NexaLink

Al abrir Claude Code después de actualizar el plugin, se enseñan una vez las entradas que aún no has
visto. La más nueva va arriba. Cada entrada empieza por `## ` y su título no se cambia después de
publicarla: es la marca de «ya visto».

## 2026-09-29 · Borradores más simples
- Al anotar una tarea en una reunión (`/nexalink:tarea`), el borrador lleva solo lo importante: **título, qué se pidió, el proyecto y la captura**.
- Prioridad, responsable, fecha y subtareas ya no se proponen: los decide quien aprueba el borrador.

## 2026-09-29 · Subtareas avanzadas en el reporte
- En una tarea con subtareas ya puedes decir en cuáles **avanzaste** sin terminarlas, no solo cuáles terminaste. Tu supervisor lo ve como «Avanzó».
- Una tarea **sin subtareas** que terminaste pasa a revisión al enviar el reporte: el agente te pregunta «¿La terminaste?» y, con tu sí, tu supervisor recibe el aviso para aprobarla.

## 2026-09-28 · Cada uno ve sus reuniones de TalkToMeets
- Las grabaciones de TalkToMeets se leen ahora con **tu propia cuenta**: el agente ve exactamente las reuniones que tú ves allí, ni una más.
- Conéctala una vez en NexaLink → **Agentes → Integraciones**, sin esperar al administrador. Te llegan los avisos de tus reuniones. Si no la has conectado, el agente te da el enlace.
- La propuesta de cierre de una reunión solo la ves (y la aplicas) si tu cuenta de TalkToMeets ve esa grabación.

## 2026-09-28 · Tickets desde el agente, «Abrir en mi agente» y sesiones por tarea
- `/nexalink:ticket` abre un ticket (por ejemplo al proveedor de hosting) con su captura: te enseña cómo quedará y solo lo abre con tu «sí».
- En la web, cada tarea y ticket tiene **Abrir en mi agente**: abre Claude Code con `/nexalink:trabajar TAR-…` ya escrito, en el repositorio del proyecto si lo tiene.
- Si tu rama cita una tarea (`feature/TAR-…`), la sesión se titula con su código y «la tarea» es esa.
- `/nexalink:commit`, `/nexalink:hoy` y `/nexalink:reporte` arrancan con el estado de git ya leído: menos pasos.
- El reporte se revisa con las mismas reglas que NexaLink antes de guardarlo: menos idas y vueltas.
- Supervisores: `/nexalink:equipo` avisa de lo que lleva más horas que las estimadas, y al revisar puedes abrir la tarea en NexaLink y decidir allí (con el comentario ya escrito).
- Opcional: aviso de escritorio cuando el agente espera tu respuesta (`/config` → «Aviso de escritorio»). Y «prepara mi equipo para NexaLink» ahora ofrece añadir `Refs: TAR-…` a los commits que hagas fuera del agente.
- Un ticket que te devuelven sale el primero en `/nexalink:hoy` y `/nexalink:siguiente`, con el comentario de quien lo devolvió. Las correcciones que haces tú en tu propia tarea ya no aparecen como «te la devolvieron».
- Las citas de una reunión en una tarea traen siempre de qué reunión son y a qué hora se dijeron, aunque la tarea naciera en otra.
- Al cerrar una reunión, cada momento de la grabación se comenta una sola vez en cada tarea.
- «prepara mi equipo para NexaLink» te pide menos permisos y termina ofreciéndote instalar lo que falta.

## 2026-09-28 · Avisos de versión y comandos que solo lanzas tú
- Los comandos `/nexalink:…` solo se ejecutan cuando tú los escribes: el agente ya no lanza uno por su cuenta (por ejemplo, un `/nexalink:commit`). Pedirlo con tus palabras («¿qué tengo hoy?», «commitea esto») sigue funcionando igual.
- Al abrir Claude Code te avisa si hay una versión nueva del plugin y, después de actualizar, te enseña aquí qué cambió. Puedes apagar estos avisos en `/config` → «Avisos del plugin».
- Mejor aún: activa las actualizaciones automáticas (`/plugin` → Marketplaces → nexalink → «Enable auto-update») o pide «prepara mi equipo para NexaLink».

## 2026-09-27 · Revisión de supervisores y correcciones
- Supervisores: `/nexalink:equipo` (cómo va el equipo hoy), `/nexalink:por-revisar` (lo prueba en el entorno de pruebas y lo apruebas o devuelves con tu «sí») y `/nexalink:novedades` (resumen de lo terminado para un cliente).
- `/nexalink:probar TAR-…` prueba una tarea o un ticket en el navegador con la cuenta de pruebas.
- `/nexalink:correccion` añade o quita subtareas de una tarea que ya existe, con vista previa antes.
- El reporte diario acepta pasos para probarlo por subtarea y «Dónde probarlo».
