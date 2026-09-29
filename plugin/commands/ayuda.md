---
description: Para qué sirve cada comando de NexaLink y cuándo usarlo — la lista según tu rol, la explicación de uno concreto («/nexalink:ayuda correccion») o el recorrido de primer uso («/nexalink:ayuda empezar»)
argument-hint: "[empezar | comando | pregunta] (sin nada: todos los comandos)"
effort: low
---

Explícame los comandos de NexaLink. Pregunta: $ARGUMENTS

**Solo explica: no ejecutes ningún comando ni herramienta que escriba.** Háblame en lenguaje
llano, sin nada técnico si no hace falta.

Mi rol: si está disponible, `get_work_context` (el usuario `me` en `users`); si no, no lo supongas
y marca lo que es solo para supervisores.

## Sin pregunta: la lista

Una pantalla, agrupada, **una línea por comando** (qué hace, no cómo). A un EMPLEADO no le
ofrezcas los de «Supervisores»; a un ADMIN o SUPERVISOR pon «Supervisores» primero y di que el
reporte diario es de los empleados. Termina con **un** comando que me toque ahora (normalmente
`/nexalink:hoy`) y «pregúntame por cualquiera: `/nexalink:ayuda <comando>`».

**Tu día**
- `/nexalink:hoy` — resumen de tu día: lo que te devolvieron, lo que tienes en curso y pendiente, tu rama, tus PRs, la reunión de hoy y los reportes que te faltan. Solo mira.
- `/nexalink:siguiente` — te trae tu siguiente trabajo (tarea o ticket) con todo su contexto y lo marca como empezado.
- `/nexalink:trabajar TAR-XXXXX` — lo mismo con una tarea o ticket (`TK-`) concreto.

**Mientras trabajas**
- `/nexalink:duda` — deja una pregunta o un bloqueo en la tarea para quien la pidió (te enseña el texto antes).
- `/nexalink:ticket` — abre un ticket (por ejemplo al proveedor de hosting) con su captura; te enseña cómo quedará y lo abre con tu «sí».
- `/nexalink:commit` — propone qué entra y el mensaje citando la tarea; hace el commit con tu OK y nunca hace push.
- `/nexalink:probar TAR-XXXXX` — lo prueba en el navegador, en el entorno de pruebas, y te dice qué funciona y qué no, con capturas. No cambia nada.
- `/nexalink:revisar` — revisa tu rama (también lo no guardado en commits) contra lo que pide la tarea. Solo mira.
- `/nexalink:pr` — crea el PR citando la tarea y te pregunta si la pasa a revisión.

**Reporte diario** (empleados)
- `/nexalink:reporte` — prepara tu reporte del día; con `TAR-XXXXX` (y una subtarea) solo esa entrada. Te enseña una vista previa y no sube nada hasta que digas «súbelo».

**Reuniones**
- `/nexalink:tarea` — anota lo que se pide como borrador de tarea (con captura); un supervisor lo aprueba.
- `/nexalink:correccion` — corrige una tarea que ya existe (añade o quita subtareas); solo su responsable o un supervisor. Vista previa antes.
- `/nexalink:reunion` — te dice en qué reunión se están anotando las tareas y deja cambiarla.
- `/nexalink:cierre-reunion` — al terminar, completa las tareas con lo que se dijo en la grabación. Aplica solo lo que confirmes.

**Supervisores**
- `/nexalink:equipo` — cómo va tu equipo hoy: quién reportó, preguntas sin responder, lo vencido, lo que se pasa del tiempo estimado y lo que espera revisión. Solo mira.
- `/nexalink:por-revisar` — lo que espera tu revisión: lo prueba, te dice en lenguaje llano qué cumple y qué no, y lo apruebas o devuelves con tu «sí».
- `/nexalink:novedades` — resumen de lo terminado en un periodo para contárselo a un cliente, con capturas. No envía nada.

**Además**
- «prepara mi equipo para NexaLink» — revisa tu equipo e instala lo que falte (con tu permiso).

## «empezar»: primer uso

Un recorrido corto en UNA respuesta (no te pares a mitad a esperar):
1. **Conexión** — llama `get_work_context`. Si las herramientas de NexaLink no están, explícame
   cómo conectar: `/mcp` → `plugin:nexalink:nexalink` → Authenticate, y aprobar en NexaLink. Si
   faltan las de tareas, que cree una conexión nueva en **Agentes** y revoque la vieja.
2. **Quién soy** — mi nombre y rol (el usuario `me` en `users`), y qué puedo hacer con él.
3. **Mis comandos** — la lista de arriba, solo los de mi rol.
4. **Entornos de prueba** — mira `testEnvironments`: si no hay ninguno, o una plataforma solo tiene
   producción, dime que los añada en `testEnvironmentsUrl` (cualquiera de la empresa puede) para que
   los agentes prueben solos (cuenta de pruebas; producción sin cuenta).
5. **Por dónde empezar** — un comando: EMPLEADO `/nexalink:hoy`, SUPERVISOR o ADMIN `/nexalink:equipo`.
6. **Termina con esta pregunta, tal cual** (git y gh sirven a quien programa; el navegador de pruebas,
   a todos): «¿Quieres que revise tu ordenador y te instale lo que falte? Solo instalo lo que me
   digas.» No revises ni instales nada hasta que diga que sí; entonces sigue la skill nexalink-setup.

## Con una pregunta o un comando

Explica solo ese (o el que responde a la pregunta; si son varios, el más adecuado y menciona el
otro): **para qué sirve**, **cuándo usarlo**, **qué te pide o te enseña antes de hacer algo**
(lo que nunca hace sin tu «sí») y **un ejemplo** de cómo escribirlo. Cinco o seis líneas. Si no
existe un comando para eso, dilo y sugiere el más cercano.
