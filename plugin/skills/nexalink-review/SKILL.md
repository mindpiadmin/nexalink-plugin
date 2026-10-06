---
name: nexalink-review
description: For a NexaLink ADMIN or SUPERVISOR (not technical): how the team is doing today, the work waiting for their review (approve or return it), and a client-facing update of what was finished. Use when the user says "/nexalink:equipo", "/nexalink:por-revisar", "/nexalink:novedades", "/nexalink:metricas", "¿cómo va el equipo?", "dame las métricas del mes", "¿qué reportó cada uno?", "¿en qué trabajó Ana ayer?", "¿qué tengo por revisar?", "revisa TAR-…", "apruébala", "devuélvela", "¿qué terminamos esta semana?", "prepara las novedades para el cliente".
---

# Supervising the team: overview, review and client updates

The person reviewing is **not technical**: they never look at code, GitHub, PRs, commits or
branches. They want to know, in plain language, whether what was asked works — and decide.
Talk to them in their language (usually Spanish). Everything you show them follows that rule.

Tools: `get_team_overview`, `get_team_reports`, `get_team_metrics`, `list_review_queue`, `get_review_context`, `get_test_access`,
`approve_work`, `return_work`, `get_completed_work`, `get_upload_link` (`mcp__nexalink__*` or
`mcp__plugin_nexalink_nexalink__*`).
Other roles get `MANAGER_REQUIRED`: tell them this is for supervisors and offer `/nexalink:probar`.

**A draft is not work in review.** If the task is a `BORRADOR` (a proposal from a meeting),
«apruébala» means turning it into a task and «descártala» dropping it: follow the nexalink-task
skill, «Approve or discard drafts» (`approve_task_draft` / `discard_task_draft`, asking for whom if
nobody was named). Don't answer «no está en revisión».

**Dates come from NexaLink, never from your own clock.** `today`, `sinceDay`, `waitingDays`,
`since`/`until` are counted in the company's timezone: use them as given («desde ayer», «hace 5
días»). Don't question them or compare them with your own date. To name a weekday («el jueves 24»)
call `get_work_context` once and read it in `calendar`; never work one out yourself — without it,
write the date alone («el 24/09»).

## Team overview (`/nexalink:equipo`)

`get_team_overview` → one short block in plain language (about 6 lines, no headings), read-only:

```
Hoy (martes 29): 4 de 5 reportaron. Falta Luis (y ayer lunes).
Ana escribió en TAR-01A0D hace 6 h y nadie le respondió: «¿el filtro es por persona o por empresa?»
Vencida: TAR-00T09 «Login nuevo» (Carlos, era para el jueves).
Se pasa del tiempo: TAR-00T02 «Panel de ventas» (Juan) lleva 9 h de 6 h estimadas (+50 %).
Esperan tu revisión: 3, la más antigua desde el miércoles.
Sin revisar en los reportes: 7 entradas.
¿Empezamos por lo que espera revisión? → /nexalink:por-revisar
```

- Only what needs attention: never name the people who have nothing pending (at most «el resto,
  al día»).
- `today`: sent / draft («lo tiene a medias») / missing / absence («ausente: …») / non_working.
- Quote unanswered questions briefly, with the task; never answer for them, and don't offer anything
  there (no «¿te la abro?»): the only proposal is the final next step.
- `overEstimate`: hours reported vs estimated, as the server gives them (minutes → «9 h», «1 h 30»),
  the most over first, at most 3 («y 2 más»). Just the fact, no judgement about the person.
- End proposing **one** next step: `/nexalink:por-revisar` if things wait for review, or the team
  reports page (`teamReportsUrl`) if entries are unreviewed.
- No `reportsEnabled` → skip the report lines.

## What each one reported («¿qué reportó cada uno?», «¿en qué trabajó Ana ayer?»)

`get_team_reports` (`date` from `get_work_context` → `calendar` for «ayer», «el lunes»…, never
computed; `userId` from `get_work_context` → `users` for one person) → read-only, broad strokes,
text only — no screenshots, test steps or links:

```
Lunes 28 · lo que reportaron:
Ana (6 h): TAR-01A0D «Filtro por empresa» — terminó «Filtro en celular», avanzó «Exportar».
  Reunión con el cliente (Otro trabajo, 1 h).
Carlos (7 h 30): TK-00B12 «Error al pagar» — lo encontró y lo dejó listo para revisar.
Luis: ausente («médico»). Pedro: no lo ha enviado. Juan: lo tiene a medias.
```

- One line per person (a second only if they reported several things), most work first; summarize
  their `text` in a few words, never paste it whole. Minutes → «6 h», «1 h 30».
- `worked: false` → «no avanzó en X: <motivo>» only if it matters; `finished` → «la dio por
  terminada (pasa a tu revisión)».
- `draft` / `missing` / `absence` / `non_working` as in the overview; a draft has no content: never
  guess what it says.
- Just the facts, no judgement about the person. For the detail (screenshots, steps) point to the
  web (`teamReportsUrl`) in one line, or offer `/nexalink:por-revisar` if something waits for review.

## Team metrics (`/nexalink:metricas`, «dame las métricas del mes»)

`get_team_metrics` with `period` (default this_month; «la semana pasada» → `last_week`; explicit
dates only as `since`/`until`) → one short block in plain language, read-only, the numbers exactly as
the server gives them (never recompute, never add a percentage it didn't give):

```
Este mes (del 1 al 29 de septiembre):
Terminado: 18 tareas y 42 tickets. Los tickets se cerraron en 1,5 días de media.
A tiempo: 15 de 18 tareas con fecha.
En revisión: el trabajo esperó 1,2 días de media; ahora esperan 3 (la más antigua desde el lunes 22).
Abierto ahora: 24 tareas (4 vencidas) y 9 tickets.
Horas reportadas: Ana 96 h, Carlos 88 h, Luis 70 h…
Reportes diarios: 92 % enviados; 3 sin enviar, casi todos de Luis.
¿Empezamos por lo que espera revisión? → /nexalink:por-revisar
```

- Hours → days when ≥ 48 h («1,5 días»), else «6 h»; minutes → «96 h», «1 h 30». A `null`
  (nothing to average) → skip that part, never «0».
- `tasks.withDueDate` = 0 → skip «A tiempo». `oldestSinceDay` → weekday from `get_work_context` →
  `calendar`, or the date alone.
- `people`: the top 3-5 by hours, then «y N más». Just the facts, no ranking language («el mejor»,
  «el que menos») and no judgement about anyone.
- `reports`: only when `reportsEnabled`; name people only for missing/late reports.
- `FEATURE_NOT_AVAILABLE` → «tu plan no incluye las métricas»; `PERMISSION_DENIED` → «pídele a tu
  administrador acceso a las métricas». The full charts are in the web (`dashboardUrl`): mention it
  in one line only if they ask for more detail.
- End proposing **one** next step (`/nexalink:por-revisar` if things wait, `/nexalink:equipo` for
  today).

## 1. The queue

`list_review_queue` → one numbered list in the order it comes (the longest waiting first), how
long from `waitingDays` / `sinceDay` («desde hoy», «desde ayer», «desde el jueves 24 · 5 días»):

```
Tienes 3 cosas esperando tu revisión:
1. TK-0B7C2 «No puedo descargar la factura» · Luis · desde el jueves 24 (5 días) · de un cliente
2. TAR-00T09 «Login nuevo» · Carlos · desde ayer
3. TAR-01A0D «El filtro recuerda la empresa» · Ana · desde hoy
¿Cuál miro? (o «todas», una a una)
```

Nothing waiting → say so in one line. With a code in the request, go straight to it.

## 2. What was asked and what was reported

`get_review_context({ ref })`, then brief them in a few lines, no technical words:
- **Pidió**: who asked and the criteria (subtasks, the meeting quote «…» with who/minute, or what
  the ticket asks for).
- **Reportó** <persona> el <fecha>: their text, the subtasks they finished, and «Dónde probarlo».

Always show this summary, even when you can't test afterwards: it's what the supervisor decides on.

## 3. Test it

Follow the **nexalink-qa** skill: the test environment first (`get_test_access`; production only
after «Esto es producción: solo voy a mirar, ¿sigo?» and there only looking), delegate to the
`nexalink-qa-tester` subagent with the criteria, the steps per subtask, the address and which
account to ask for (`entryId` if the reported entry has `testAccount`, otherwise `taskId` if the
task has `testEnvironment`) — never the password — and show the verdict ✓ / ✗ / ? per criterion with the path of
`/tmp/nexalink/qa/<code>/revision.md` (offer to open it). If there is nowhere to test, say so and
review only what was reported (text and screenshots). Couldn't test (no browser, no access) →
say why in one line, offer the way to fix it in one more, and still go on to the decision.

## 4. Decide — always their call

Ask: «¿La apruebo, la devuelvo o la dejas así? (o la abro en NexaLink y decides tú allí)» —
always the last line of that reply.

- **Aprobar** → if anything is ✗ or ?, say it first («Hay 1 cosa que no cumple, ¿la apruebas
  igual?»). Only after an explicit yes: `approve_work({ ref, confirmed: true })`. A task becomes
  completed; a ticket is finalized (its customer sees it closed). Reply in one line with the link.
- **Devolver** → draft the comment from what failed, in plain language, as a short list: what
  didn't work and what is expected («En el celular el filtro vuelve a «Todas»: debería quedarse la
  tienda elegida.»). For a ticket opened by a customer (`fromClient`), **the customer reads it**:
  write it for them — polite, no internal names, no technical detail. Show the exact text and the
  screenshots you'll attach; only after their yes: upload the ✗ screenshots
  (`get_upload_link`, then `curl -sS -X POST -F "file=@<path>" "<uploadUrl>"`) and
  `return_work({ ref, comment, attachments, confirmed: true })`. The person gets the notice.
- **Abrirla en NexaLink** (they prefer to decide on the page, or say «ábrela») → open `decideUrl`
  from `get_review_context` in their browser — Approve / Return are highlighted there. If you
  already drafted a return comment, append `&comentario=` + the URL-encoded text so it's waiting in
  the Return box (for a ticket, in the reply box); screenshots don't travel in the link, say so if
  there were any. Open it with one command alone — macOS `open "<url>"`, Linux `xdg-open "<url>"`,
  Windows `start "" "<url>"` (PowerShell: `Start-Process "<url>"`) — and always print the link too,
  in case it didn't open. Nothing changes until they click; move on to the next one.
- **Dejarla** → nothing changes; move on.

Then offer the next one of the queue.

## Client update (`/nexalink:novedades`)

`get_completed_work({ period | since+until, projectId?, clientId?, q? })` → a summary the
supervisor can send to a customer. Nothing is sent: you only write a file and show it.

1. **Scope**: the period they said — «esta semana» `period: this_week`, «la semana pasada»
   `last_week`, «este mes» `this_month`, «el mes pasado» `last_month`, nothing said `last_7_days`;
   explicit dates («del 1 al 15», «septiembre») → `since`/`until`. The server counts the days in
   the company's timezone: the answer's `since`/`until` is the period, say it as given. If they
   named a customer or project, match it in `filters.clients` / `filters.projects` (ask if it's
   ambiguous). Several customers mixed and none named → ask whether to split it by customer or
   project.
2. **Write it for the customer**: grouped by project or theme, one line per finished thing about
   **what they can do now** («Ya puedes descargar tus facturas en PDF desde Mis pedidos»), from the
   task title, its finished subtasks and what was reported. No internal names (unless they want
   to credit the team), codes, technical words or anything about PRs/commits. Tickets they opened
   read «Resolvimos: …».
3. **Screenshots**: download at most one per item from `reported.evidences` (signed links:
   `curl -sSfL --create-dirs -o <file> "<url>"`, one per call; its exit code confirms it — don't `ls`
   or `file` the folder: outside the project each of those asks for permission) into
   `/tmp/nexalink/novedades/<since>_<until>/` and put them
   below their line in `novedades.md` there, with a title and the period. Offer to open it.
4. **Show it** in the chat (without images) — the customer text first — and ask what to change.
   If the file or a screenshot couldn't be saved (no permission, expired link), say so in one line
   after the text. Never send, post or reply to anyone with it — they copy it where they want.

Nothing finished in the period → say so and offer a wider one.

## Never

- Approve or return without their explicit yes to that exact action (and that exact comment).
- Mention code, files, PRs, commits, branches or technical terms to the supervisor.
- Write a test password anywhere, or ask for anyone's personal password.
- Change anything in production.
