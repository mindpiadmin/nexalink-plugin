---
description: Al terminar una reunión, completa sus borradores de tareas con lo que se dijo en la grabación (con minuto y hora)
argument-hint: "[nombre de la reunión] (opcional)"
disable-model-invocation: true
---

Carga primero la skill **nexalink-task** (herramienta Skill) y sigue su **modo cierre de reunión** (`closing.md`). No empieces sin ella, ni siquiera para delegar en el subagente.

Reunión: $ARGUMENTS

- Si no se indica la reunión, usa la de esta sesión o pregunta cuál entre las de hoy.
- **Primero** pide la propuesta que NexaLink ya preparó al llegar la grabación
  (`get_closing_proposal`). Si está pendiente, preséntala tal cual, nombrando cada tarea por su
  código y título (lista `tasks`), sin volver a leer la transcripción.
- Si no hay propuesta, encarga el análisis al subagente **`nexalink-meeting-closer`** (lee la
  transcripción en su propio contexto y no escribe nada); si no hay subagentes, hazlo tú. Pero si
  el servidor no tiene la herramienta de transcripción (`INTEGRATION_NOT_CONFIGURED`) o el plan no
  la incluye, **no lances el subagente**: dilo, y ofrece preparar la propuesta con las notas que me pegue.
- Cada persona lee las grabaciones con **su propia cuenta de TalkToMeets** (ve lo mismo que allí,
  sea cual sea su rol). `TRANSCRIPTS_NOT_CONNECTED` → pásale el `connectUrl` del error para
  conectarla (una vez) y para. `MEETING_NOT_VISIBLE` → su cuenta no ve esa grabación: dilo y no
  busques otra forma de leerla.
- La propuesta junta: duplicados a unir, tareas que detectó TalkToMeets (ya existe → enriquece,
  nueva → borrador, vaga → solo se cuenta), citas por borrador (frase textual corta, quién y minuto;
  NexaLink añade la hora real) y fechas límite.
- Todo en alto nivel, sin código. Presenta la propuesta numerada y **no apliques nada** hasta que la
  persona confirme («todo», «todo menos el 3»…).
