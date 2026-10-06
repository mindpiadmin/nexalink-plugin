# NexaLink para tu agente de código

Plugin de NexaLink para **Claude Code** (y paquete para Codex y otros agentes MCP). Con él, tu
agente trabaja con NexaLink sin que copies nada:

- **Reporte diario** (EMPLEADO): prepara tu reporte a partir de lo que hiciste hoy y de tu repo.
  Tú revisas y apruebas cada entrada antes de enviarlo.
- **Tareas desde reuniones** (ADMIN, SUPERVISOR, EMPLEADO): durante una reunión conviertes lo que
  se pide en **borradores de tareas** con su captura; al terminar, el agente los completa con la
  grabación de **TalkToMeets**. Un ADMIN o SUPERVISOR los aprueba en la web.

## Qué trae

| Pieza | Para qué |
|---|---|
| Conexión con NexaLink (MCP) | Leer y guardar tu reporte, crear y completar borradores de tareas, abrir tus tareas y tickets y comentar en ellos, leer reuniones y transcripciones. Autorizas una vez en la web; no hay tokens que copiar. |
| Playwright (MCP) | Recorrer la app en el navegador y hacer capturas (evidencia del reporte, pantalla de una tarea). |
| Skill `nexalink-daily-report` | Cómo se hace un buen reporte diario. |
| Skill `nexalink-task` | Cómo se capturan tareas en una reunión y cómo se cierran con la transcripción. |
| Skill `nexalink-work` | Trabajar una tarea desde el repo con todo su contexto, y citarla en rama, commits y PR. |
| Skill `nexalink-setup` | Revisa tu equipo e instala lo que falte (con tu permiso). |
| Skill `nexalink-qa` | Probar una tarea o ticket en el navegador como lo haría una persona: en el entorno de pruebas, con su cuenta de pruebas, y con un resultado ✓ / ✗ / ? por criterio. |
| Skill `nexalink-review` | Para supervisores: revisar lo que espera revisión probándolo, y aprobarlo o devolverlo con tu «sí». Todo en lenguaje llano. |
| Subagente `nexalink-qa-tester` | Hace la prueba en el navegador en su propio contexto y devuelve el resultado por criterio con capturas. No cambia nada en NexaLink. |
| Primer uso (hook) | La primera vez que abres una sesión, el agente te ofrece `/nexalink:ayuda empezar`. |
| Avisos del plugin (hook) | Al abrir Claude Code, una vez: si hay una versión nueva del plugin, y tras actualizar, qué cambió (`CHANGELOG.md`). Se apagan en `/config` → «Avisos del plugin». |
| Sesión de una tarea (hook) | Si la rama cita una tarea o un ticket (`feature/TAR-01A0D-…`), la sesión se titula «TAR-01A0D · rama» y el agente sabe que «la tarea» es esa. |
| Aviso de escritorio (hook, opcional) | Un aviso del sistema cuando el agente espera tu respuesta o tu «sí» («TAR-01A0D necesita tu permiso para seguir»). Se enciende en `/config` → «Aviso de escritorio». |
| Guarda de producción (hook) | En una página de un entorno marcado como producción bloquea lo que escribe (teclear, enviar, borrar, pagar…): allí el agente solo mira. |
| Subagente `nexalink-report-reviewer` | Revisa el reporte antes de enviarlo: prueba los pasos en el navegador y comprueba commits y PR. |
| Subagente `nexalink-meeting-closer` | Lee la grabación completa de una reunión en su propio contexto y devuelve solo la propuesta de cierre (no escribe nada). |
| Subagente `nexalink-pr-reviewer` | Contrasta lo que hay en tu rama (commiteado o no) con la tarea (criterios, subtareas, capturas) y lo prueba en el navegador. Devuelve un informe; no modifica nada. |
| Comandos `/nexalink:tarea`, `/nexalink:nueva-tarea`, `/nexalink:borradores`, `/nexalink:correccion`, `/nexalink:reunion`, `/nexalink:cierre-reunion`, `/nexalink:hoy`, `/nexalink:siguiente`, `/nexalink:trabajar`, `/nexalink:commit`, `/nexalink:duda`, `/nexalink:ticket`, `/nexalink:revisar`, `/nexalink:pr`, `/nexalink:reporte`, `/nexalink:probar`, `/nexalink:por-revisar`, `/nexalink:equipo`, `/nexalink:metricas`, `/nexalink:novedades` y `/nexalink:ayuda` | Atajos (abajo). **`/nexalink:ayuda`** te dice para qué sirve cada uno (o `/nexalink:ayuda <comando>` para uno concreto). Solo se ejecutan cuando tú los escribes (salvo `/nexalink:ayuda`); pedirlo con tus palabras también funciona. |

## Instalar (Claude Code)

En NexaLink, **Agentes → Conectar un agente → Claude Code** te muestra los comandos con tu dominio:

```bash
claude plugin marketplace add https://<tu-dominio-nexalink>/agent-plugin/marketplace.json
claude plugin install nexalink@nexalink
```

Después, en Claude Code: `/reload-plugins`, luego `/mcp` → `plugin:nexalink:nexalink` →
**Authenticate**. Se abre NexaLink con tu sesión: apruebas y listo. Puedes ver y revocar tus
conexiones en **Agentes**.

**Activa las actualizaciones automáticas** (para cualquier marketplace que no sea de Anthropic vienen
apagadas): en Claude Code, `/plugin` → Marketplaces → nexalink → «Enable auto-update», o pide
«prepara mi equipo para NexaLink». Sin ellas, actualiza a mano con
`claude plugin update nexalink@nexalink` (y `/reload-plugins`); al abrir Claude Code te avisa cuando
hay una versión nueva.

**Codex y otros agentes:** NexaLink → **Agentes** muestra los pasos de cada uno (conexión MCP + copiar
las skills). Otros clientes MCP reciben las guías como los prompts `daily_report_guide` y `task_guide`.

## Cómo se usa

### Reporte diario

Pídele a tu agente: **«haz mi reporte diario»** (o «reporta el martes»). Te propone cada entrada,
genera una vista previa con las capturas y no sube ni envía nada hasta que digas «súbelo».

### Tareas desde una reunión

Abre tu agente **en el repositorio donde se hará el cambio**: así entiende qué implica cada pedido.
Las tareas se escriben siempre en **alto nivel, sin código**: qué cambia para quien usa el producto,
nunca archivos ni detalles técnicos.

1. **Durante la reunión**, rápido:
   ```
   /nexalink:tarea que el filtro de tickets recuerde la empresa elegida
   ```
   y pega o arrastra la captura. El agente busca si ya existe algo parecido, crea el borrador y te
   devuelve el enlace. Si no tienes captura, te ofrece hacerla él con Playwright (inicias sesión tú
   en la ventana del navegador).
   También vale decirlo con tus palabras: «crea una tarea con esto».

   La **primera** tarea de la sesión te pregunta de qué reunión es, mirando las que tu equipo ya
   abrió hoy («¿Es de «Sync Acme» (la abrió Luis · 3 borradores)?»), para que todos anoten
   en la misma. Las siguientes van a esa reunión sin preguntar, y cada confirmación la nombra.
   Para cambiarla: «cambia de reunión» o `/nexalink:reunion Revisión semanal` (sin nombre, te dice
   en cuál estás). Al día siguiente vuelve a preguntar.

2. **Al terminar la reunión:**
   ```
   /nexalink:cierre-reunion Sync Acme
   ```
   Cuando TalkToMeets termina de procesar la grabación avisa a NexaLink, que **prepara solo una
   propuesta de cierre** (y te avisa en la campana y por correo). El agente la trae y te la presenta;
   si todavía no hay propuesta, se la encarga al subagente `nexalink-meeting-closer`, que lee la
   grabación completa sin saturar tu conversación. La propuesta junta:
   - unir los borradores duplicados;
   - las tareas que TalkToMeets detectó y que se te escaparon (y descarta las vagas);
   - para cada tarea, los momentos en que se habló de ella: la **frase textual**, **quién** la dijo,
     el **minuto** y la **hora**, por ejemplo *Ana · min 12:34 · 10:26 — «que sea el filtro de cada
     uno»*.

   No aplica nada hasta que confirmas («todo», «todo menos el 3»…). Las tareas de TalkToMeets que
   uses o descartes quedan marcadas allí para no volver a proponerse.

   **Sin terminal:** un ADMIN o SUPERVISOR puede revisar la misma propuesta en la web
   (**Tareas → Borradores**, por reunión), marcar lo que quiere y pulsar **Aplicar**, regenerarla o
   descartarla. La propuesta la genera NexaLink con OpenAI (solo planes con automatización y con un
   tope diario por empresa).

3. **En la web**, un ADMIN o SUPERVISOR revisa **Tareas → Borradores**, ajusta, elige responsable y
   **aprueba** (se convierte en tarea normal) o **descarta**. También puede hacerlo desde su
   agente con `/nexalink:borradores`: aprueba (eligiendo el responsable) o descarta (con el
   motivo), ve cómo quedará y lo hace con su «sí».

**Tarea ya asignada, sin borrador (supervisores).** Un ADMIN o SUPERVISOR puede crear la tarea
directamente, como «Nueva tarea» en la web:
```
/nexalink:nueva-tarea para María: que el filtro de tickets recuerde la empresa elegida
```
Solo hacen falta el **título** y el **responsable**; prioridad, fecha, subtareas o proyecto, si los
dices. El agente te enseña cómo quedará y la crea con tu «sí»: al responsable le llega el aviso en
ese momento. Un empleado que lo use obtiene un borrador, como con `/nexalink:tarea`.

**Correcciones de una tarea que ya existe.** Si en la reunión revisan una tarea y piden cambios
(«al login le falta la versión celular»), no es un borrador:
```
/nexalink:correccion TAR-00T09 le falta la versión celular
```
El agente busca la tarea, escribe el cambio como subtareas (con la captura) y te enseña una vista
previa: qué añade, qué salta por repetido, qué quita y si vuelve a En progreso. Aplica solo con tu
«sí». Solo el **responsable** de la tarea o un **ADMIN/SUPERVISOR** pueden corregirla; si no es
tuya, queda como borrador normal. Solo se quitan subtareas pendientes, nunca las hechas. La tarea
en revisión (o ya aprobada) vuelve a En progreso y al responsable le llega el aviso; al día
siguiente `/nexalink:siguiente` se la muestra primero con lo que cambió.

La transcripción la conecta una sola vez el ADMIN de la empresa en **Agentes → Integraciones**.

### Trabajar una tarea desde el repo

- **`/nexalink:hoy`** — resumen de tu día: lo que te devolvieron (revisión o corrección, con qué
  cambió), tareas abiertas por prioridad, en qué rama y tarea estás,
  cambios sin commitear, PRs abiertos, reunión de hoy y días de reporte pendientes. Solo lee, y
  termina proponiendo el siguiente comando.
- **`/nexalink:siguiente`** — trae tu siguiente trabajo: primero lo que te devolvieron, luego lo
  empezado, luego lo más prioritario (y la fecha más cercana).
- **`/nexalink:trabajar TAR-01A0D`** (o su enlace) — trae esa tarea. También funciona con un ticket:
  **`/nexalink:trabajar TK-0B7C2`** trae su descripción, adjuntos y el hilo de respuestas (sus
  criterios son lo que piden la descripción y el hilo). Todos los comandos aceptan `TK-` igual que `TAR-`;
  lo que el agente escriba en un ticket es una respuesta en su hilo y llega por correo a quien lo
  abrió (si es un cliente, lo lee él), así que siempre te enseña el texto antes.

En los dos casos el agente te resume **quién la pidió, las frases textuales con minuto y hora, las
capturas** (las descarga y las mira) y las subtareas; propone una rama con el código
(`feature/TAR-01A0D-…`) y se pone a trabajar.

- **`/nexalink:commit`** — mira tus cambios, propone qué entra y el mensaje al estilo del repo con
  `Refs: TAR-01A0D`, y hace el commit solo cuando confirmas (sin push). También vale decir «commitea esto».
- **`/nexalink:duda`** — si algo de la tarea no está claro o te bloquea, redacta la pregunta en
  lenguaje llano (qué criterio o cita, qué viste, opciones y recomendación) y, cuando confirmas, la
  deja como comentario en la tarea para quien la pidió.
- **`/nexalink:ticket`** — abre un ticket (por ejemplo al proveedor de hosting o a otra área) con
  su captura: busca antes si ya hay uno igual, lo escribe para quien lo recibe y te enseña cómo
  quedará; solo lo abre cuando dices que sí.
- **`/nexalink:revisar`** — revisa lo que hay en tu rama (también lo no commiteado) contra la tarea
  con el subagente `nexalink-pr-reviewer`: por cada criterio, **cumple / no cumple / no
  verificable** con su evidencia (líneas del cambio y capturas en `/tmp/nexalink/review/<código>/`).
  No toca nada; arreglas y vuelves a revisar las veces que haga falta.
- **`/nexalink:pr`** — crea el PR con el enlace a la tarea, los criterios verificados de tu última
  revisión y las subtareas completadas como checklist; te enseña el texto antes de crearlo. Si no
  revisaste la rama (o cambió después), te propone revisarla primero.

Flujo completo: `/nexalink:siguiente` o `/nexalink:trabajar` → cambios → `/nexalink:commit` →
`/nexalink:revisar` (hasta que cumpla) → `/nexalink:pr` → `/nexalink:reporte TAR-01A0D`.

### Del PR al reporte (por tarea)

El reporte se carga **por tarea**: cada tarea asignada es una fila del día y cada una tiene su
entrada. **`/nexalink:reporte TAR-01A0D`** rellena solo esa fila, con su detalle técnico ya enlazado
(PR, commits de hoy con `Refs:` y rama, buscados por el código); sin código hace el día completo.
Si eres EMPLEADO, tras crear el PR el agente te ofrece lo mismo: dejar preparada la entrada de esa tarea en tu
reporte de hoy con lo que ya tiene: qué se logró, los pasos para probarlo con su captura, la
evidencia, el PR y sus commits como detalle técnico y las subtareas que confirmes. Te pregunta el
tiempo dedicado, genera la vista previa y **no sube nada hasta que digas «súbelo»**.

Así queda la trazabilidad completa **reunión → tarea → rama, commits y PR → reporte diario**: el
reporte reconoce solo qué commits son de cada tarea. Cada entrada lleva también **«Dónde
probarlo»**: la dirección del entorno de pruebas donde tu supervisor ve el trabajo.

### Probar en el navegador

**`/nexalink:probar TAR-01A0D`** (o `TK-…`) prueba lo pedido siguiendo los pasos de tu reporte, por
subtarea, y te da el resultado ✓ / ✗ / ? con capturas y un `revision.md` para abrir. Siempre en el
**entorno de pruebas**: el ADMIN los configura en NexaLink (**Agentes → Entornos de prueba**) con
una cuenta de pruebas, y el agente entra solo con ella. Si la dirección es de producción, prueba la
misma pantalla en pruebas; producción solo si se lo pides, y allí solo mira (te pregunta antes). No
cambia nada en NexaLink y nunca te pide tu contraseña.

### Revisar como supervisor

**`/nexalink:por-revisar`** (ADMIN y SUPERVISOR) te enseña lo que espera tu revisión, lo que más lleva
esperando primero. Eliges uno y el agente te cuenta qué se pidió y qué reportó la persona, lo prueba
en el entorno de pruebas y te dice en lenguaje llano qué cumple y qué no, con capturas. Luego
decides:
- **Aprobar**: la tarea queda completada o el ticket finalizado (si lo abrió un cliente, lo ve
  cerrado).
- **Devolver**: te redacta el comentario a partir de lo que no cumple, con sus capturas; si el
  ticket es de un cliente, lo escribe para el cliente. Te lo enseña antes.
- **Dejarla** como está.

Nada se aprueba ni se devuelve sin tu «sí». Sin código, PRs ni commits.

Además, para supervisores:
- **`/nexalink:equipo`** — cómo va tu equipo hoy: quién reportó y quién no, preguntas sin
  responder en sus tareas, lo vencido, lo que lleva más horas reportadas que las estimadas y lo que
  espera tu revisión. Solo mira.
- **`/nexalink:metricas`** («este mes», «la semana pasada») — los números del equipo: lo terminado
  y cuánto tardó, lo que se cumplió a tiempo, lo que espera revisión, horas por persona y reportes
  diarios. Solo mira.
- **`/nexalink:novedades`** («esta semana para Acme») — resumen de lo terminado, escrito
  para el cliente y con capturas, en un archivo que tú envías. No envía nada.

### Desde la web: «Abrir en mi agente»

En una tarea o un ticket, **Abrir en mi agente** abre Claude Code (en la terminal o en VS Code) con
`/nexalink:trabajar TAR-…` ya escrito — o `/nexalink:por-revisar TAR-…` si eres supervisor y espera
tu revisión — sin enviarlo. Si el proyecto tiene su repositorio de GitHub (Administración →
Proyectos), se abre en tu copia de ese repositorio. Y en GitHub, cada `TAR-…`/`TK-…` de un commit o
un PR enlaza a NexaLink si el repositorio tiene los enlaces automáticos (ver «prepara mi equipo»).

### Primer uso

La primera vez que abres Claude Code con el plugin, el agente te ofrece
**`/nexalink:ayuda empezar`**: comprueba la conexión, te dice qué puedes hacer con tu rol, ofrece
preparar tu equipo y, si eres ADMIN, te recuerda configurar los entornos de prueba.

## Permisos

Cada conexión solo ve lo que su rol permite:

| Permiso | Quién | Qué habilita |
|---|---|---|
| `daily_reports` | EMPLEADO | Herramientas del reporte diario |
| `tasks` | ADMIN, SUPERVISOR, EMPLEADO | Borradores de tareas, reuniones y transcripciones |

Si tu conexión es anterior a las tareas y no ves esas herramientas, crea una conexión nueva en
**Agentes** y revoca la vieja.

## Requisitos del equipo

- Claude Code (o tu agente MCP) con acceso al navegador para autorizar.
- `git`, `curl` y, para el reporte, la GitHub CLI con sesión (`gh auth login`).
- Node/`npx` para Playwright. Si falta su navegador:
  `npx -y @playwright/mcp@0.0.82 install-browser chrome-for-testing` (sin sudo).

¿Falta algo? Pídele a tu agente **«prepara mi equipo para NexaLink»**: revisa todo e instala lo que
falte con tu permiso.

## Problemas frecuentes

| Síntoma | Qué hacer |
|---|---|
| «needs authentication» / 401 | `/mcp` → `plugin:nexalink:nexalink` → Authenticate, y aprueba en NexaLink. |
| No aparecen las herramientas de tareas | Tu conexión es antigua: crea una nueva en **Agentes**. |
| «La integración de transcripciones no está conectada» | El ADMIN debe conectarla en **Agentes → Integraciones**. |
| Playwright: «is not installed» / «not found» | `npx -y @playwright/mcp@0.0.82 install-browser chrome-for-testing` |
| `claude plugin install` falla con «Archive URLs must use https» | Estás probando contra `localhost`: el plugin solo se instala desde un dominio https. |
