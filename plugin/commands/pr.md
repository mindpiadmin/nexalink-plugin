---
description: Crea el pull request citando la tarea de NexaLink (código, enlace, criterios verificados y subtareas completadas)
argument-hint: "[TAR-XXXXX | TK-XXXXX] (opcional si la rama ya lo tiene)"
disable-model-invocation: true
---

Usa la skill **nexalink-work**, sección «Pull request», para crear el PR de este trabajo. $ARGUMENTS

Toma el código de la tarea de los argumentos, del nombre de la rama o de los commits (`Refs:`); si
no aparece, pregunta cuál es.

1. Si en esta sesión ya revisaste la rama con `/nexalink:revisar` y no hay cambios después, usa ese
   veredicto. Si no hay revisión, o cambió algo desde entonces, sugiere revisar primero
   (`/nexalink:revisar`) o seguir «sin revisión».
2. Incluye criterios de aceptación (citas de la reunión con quién y minuto), «Criterios verificados»
   con el veredicto de la revisión, subtareas como checklist y cómo probarlo.
3. Enséñame el texto antes de crearlo y, al crearlo, deja el enlace del PR como comentario en la
   tarea de NexaLink.
4. Pregúntame si la paso a revisión («¿La paso a revisión?») y solo con un sí llama a
   `submit_for_review`. Nunca la completes ni la finalices: eso lo hace un manager en la web.
5. Si tengo reporte diario, ofrece dejar preparada la entrada de hoy de esta tarea (vista previa
   primero; nada se sube hasta que diga «súbelo»).
