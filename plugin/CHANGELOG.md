# Novedades del plugin NexaLink

Al abrir Claude Code después de actualizar el plugin, se enseñan una vez las entradas que aún no has
visto. La más nueva va arriba. Cada entrada empieza por `## ` y su título no se cambia después de
publicarla: es la marca de «ya visto».

## 2026-10-06 · Una cuenta por rol en los entornos de prueba
- En **Agentes → Entornos de prueba** cada app tiene ahora varias cuentas, una por rol (admin, empleado, cliente…), con una principal. La cuenta que ya tenías pasa a llamarse «General» y sigue siendo la principal.
- Al probar, el agente entra con el rol que pide la tarea («como cliente») y te dice con cuál probó cada cosa. Si falta ese rol, te lo indica.

## 2026-10-06 · Crear tareas y resolver borradores desde el agente
- Para supervisores: `/nexalink:nueva-tarea para María: …` crea la tarea directamente, sin borrador ni aprobación, como «Nueva tarea» en la web. Solo hacen falta el título y el responsable.
- `/nexalink:borradores` (o «pasa los borradores a tareas») te enseña los borradores pendientes: los apruebas eligiendo el responsable de cada uno, o los descartas con el motivo (le llega a quien lo escribió).
- En los dos casos te enseña cómo quedará y solo lo hace con tu «sí»: al responsable le llega el aviso en ese momento.

## 2026-10-05 · Métricas del equipo
- Para supervisores: `/nexalink:metricas` (o «dame las métricas del mes») te da los números del equipo en un periodo, en lenguaje llano: lo terminado y cuánto tardó, lo que se cumplió a tiempo, cuánto espera el trabajo tu revisión, horas por persona y si llegan los reportes diarios.
- Las mismas reglas que el tablero de la web: tu plan debe incluir las métricas y, si eres supervisor, tu administrador debe darte acceso.

## 2026-10-05 · Qué reportó cada uno
- Para supervisores: pregúntale a tu agente «¿qué reportó cada uno?» o «¿en qué trabajó Ana ayer?» y te lo resume persona por persona, a grandes rasgos y solo texto: en qué trabajó, cuánto tiempo y qué terminó. Quién no lo ha enviado o estuvo ausente, también.

## 2026-10-05 · La captura pegada y el responsable llegan al borrador
- Si pegas una captura en el chat al pedir una tarea (`/nexalink:tarea`) o una corrección (`/nexalink:correccion`), ahora se adjunta. Antes se quedaba en el chat y llegaba sin foto.
- Si por algo no se puede adjuntar, el agente te lo dice en vez de crear el borrador sin ella en silencio.
- Si dices a quién va («asígnasela a María»), el borrador queda ya asignado a esa persona, no escrito en la descripción. Sigue siendo borrador: quien aprueba la ve puesta.

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
