---
name: nexalink-task
description: NexaLink tasks from meetings: a task DRAFT from what is asked (with its screenshot), a CORRECTION of an existing task, a task already ASSIGNED without draft and APPROVING or DISCARDING drafts (managers, /nexalink:nueva-tarea, /nexalink:borradores), and the closing of a meeting from its recording. Use when the user says "crea una tarea con esto", "apunta esto como tarea", "a TAR-… le falta…", "corrige la tarea", "cierra la reunión", "ciérrala con la grabación", "terminó la reunión", "procesa la transcripción de la reunión", "cambia de reunión", "pasa los borradores a tareas", "aprueba los borradores", "descarta el borrador", or pastes a screenshot asking for a task.
---

# NexaLink tasks from meetings

The person (ADMIN, SUPERVISOR or EMPLEADO) is in a meeting with their project open. When
something is asked, you turn it into a **task draft** in NexaLink in seconds. When the meeting
ends, you read its transcript and complete those drafts with what was said.

A draft (status `BORRADOR`) is only a **proposal**: it notifies nobody except managers ("new
draft pending"), it is not in anyone's list or daily report, and it becomes work only when an
ADMIN/SUPERVISOR approves it in the web. That is why **capture creates it without asking first**
(the person must not be distracted from the meeting), while **closing asks before applying**
(it adds comments other people will read).

Talk to the person in their language (usually Spanish) and write the drafts in it too. The reader
of a draft is often **non-technical**: **everything high level, no code anywhere** — title,
description and subtasks describe what changes for the people who use the product, never files,
functions, tables or endpoints. The person runs you inside the repository where the change will
be made so YOU understand the scope; that knowledge shapes the draft, it is not written into it.

## 0. Preflight

The task tools (`create_task_draft`, `search_tasks`, …) must be available from the NexaLink MCP
(`mcp__nexalink__*`, or `mcp__plugin_nexalink_nexalink__*` with the plugin).

- **Not connected / 401** → NexaLink → **Agentes** → "Conectar un agente", follow the steps for this
  agent and approve in the browser. Stop until it works.
- **Connected but there are no task tools** (only report tools, or the server says "This
  connection cannot create task drafts") → the connection was created before tasks existed. Tell
  the person to create a **new connection** from **Agentes** (and revoke the old one). Don't try
  another way.

## Capture mode ("crea una tarea con esto")

1. **Meeting — decide it ONCE per session, then stop asking.** Call `get_work_context` (step 3
   needs it anyway): `todayMeetings` lists the meetings the WHOLE team opened today (`title`,
   `openedBy`, `taskCount`). Everybody must note into the SAME meeting, so never invent a new name
   when one of those fits.
   - **One meeting today** → «¿Esta tarea es de «Sync Acme» (la abrió Juan · 3 borradores)?»
   - **Several** → list them in one line and ask which, or whether it is a new one.
   - **None** → ask its name and propose one («¿Cómo se llama la reunión? ¿«Sync Acme»?»).
   - **The person already said it** («estoy en la reunión X») → use the matching one from
     `todayMeetings` (same meeting even if they wrote it slightly differently) without asking; if
     none matches, it is a new one with that name.

   Then **every draft of this session goes to that meeting without asking again** (don't announce
   this rule; naming the meeting in each confirmation is enough): pass its
   `meetingId` (from `todayMeetings` or from the first `create_task_draft`), or `meetingTitle` when
   it is new. Ask again only when:
   - the person says it changed («ahora estamos en…», «cambia de reunión», «esto es de otra
     reunión») or runs `/nexalink:reunion`;
   - **the day changed** since you chose it (compare `today`): yesterday's meeting is never reused.

   «No es de ninguna reunión» → drafts without a meeting for the rest of the session. The
   recording does not matter here: a meeting may never be recorded, and the recording arrives
   after it ends; NexaLink links it later.

   **Dates are NexaLink's**: «today» is `get_work_context.today` (company timezone) and a
   meeting's date is the one NexaLink gives. Your own clock may be another day or timezone: never
   compare against it, point out a mismatch or offer to change a date. **Weekdays come from NexaLink too**: take them from `get_work_context` → `calendar` (date → weekday in the company timezone); never work one out yourself. Without `calendar`, write the date as dd/mm alone.
2. **Understand the request** from their words and the screenshot. If something essential is
   ambiguous (what should happen, not how), ask ONE short question; otherwise don't ask.
3. **Context** — the `get_work_context` of step 1 (once per session): projects (`projectId`) and
   today. Pick the project the request belongs to; if it isn't obvious, leave it. Don't propose a
   priority, due date or subtasks: the approver decides them. **Assignee**: only when the person
   said who («asígnasela a María», «es para Pedro») → `assignedId` = that user's `id` from
   `get_work_context` → `users` (it stays a draft; the approver finds it already assigned). Match
   the name they said against `users`; if several match or none, ask ONE line «¿Cuál María: …?».
   Never write the assignee in the description instead, and never pick one they didn't say.
4. **Duplicates** — `search_tasks` with 2–4 key words (it also returns the `tickets` the person can
   see). If a task or ticket is clearly the same request, ask "¿Es la misma que «…»?" before
   creating anything. If it's the same, don't create: offer to add a comment to it at closing time.
   **Corrections**: if the request is a fix or change to an existing task — feedback on a task in
   review, done or in progress ("al filtro le falta el celular") — it is NOT a draft: follow
   «Corrections of an existing task» below. Only when no visible task matches (the person is not
   its assignee nor a manager, so they can't see it) capture it as a normal draft.
5. **Look at the code (quickly)** — use the open repository only to understand what the request
   really involves: which screens or flows it touches and whether part of it already exists. Use it
   to write a clear, high-level title and description of what the user will see. Never write file
   names, functions, tables or technical steps in the draft. Keep it to a couple of minutes: it's a
   proposal, the approver refines it.
6. **Screenshot** — **mandatory whenever the request came with an image** (`[Image #N]` in their
   message, a dragged file or a path): a draft without the screenshot they gave is a failed capture.
   Get a file, upload it, then create:
   - **Pasted into the chat** (`[Image #N]`): a pasted image is NOT a file on disk; you only see it.
     Save it with the skill's script, alone: `node "${CLAUDE_SKILL_DIR}/pasted-image.mjs" --image N`
     (one `--image` per screenshot of this request; without `--image` it takes every image of their
     latest message with images). It prints `{ ok, files: [{ path }], message }`; check that
     `message.text` is THIS request, not an older one. If it fails (`ok: false`, e.g. another
     agent), try once to save the clipboard to `/tmp/nexalink/task/<name>.png` (macOS `pngpaste`,
     Linux `wl-paste --type image/png` or `xclip -selection clipboard -t image/png -o`, Windows
     PowerShell `(Get-Clipboard -Format Image).Save(...)`).
   - **Dragged or a path**: use that file.
   - **Upload**: `get_upload_link`, then `curl -sS -X POST -F "file=@<path>" "<uploadUrl>"` (one
     call per file) → put each `{ fileUrl, fileName }` in `attachments`.
   - If nothing works, create the draft without it and say in step 8 "no pude adjuntar la captura:
     arrástrala aquí o añádela en la web". Don't block on it, but never drop it silently.

   **No screenshot, but you know which screen it is** → offer ONCE, in one line: "¿Quieres que
   haga yo la captura de esa pantalla?" If they say yes, use the Playwright MCP (`browser_*` tools:
   `mcp__playwright__*`, or `mcp__plugin_nexalink_playwright__*` with the plugin):
   - Ask for the URL if you don't know it (the app running locally, staging or production).
   - `browser_navigate` → if a login appears and the address is a company test environment,
     log in with its test account (`get_test_access`; that password only goes into that login
     form). Otherwise **the person logs in themselves** in that browser window; never ask for
     their password or type it. Wait until they say it's done. Prefer the test environment.
   - Reach the screen being discussed (clicks only to navigate, never actions that save, send or
     delete), `browser_take_screenshot` into `/tmp/nexalink/task/<name>.png` (an absolute filename: a bare
     name is saved in the repo; the tool only writes under `/tmp/nexalink/` and creates the folder),
     then upload it as above.
   - Don't capture screens showing other clients' data or personal data unrelated to the request.
   - If the browser isn't installed ("is not installed" / "not found"), run
     `npx -y @playwright/mcp@0.0.82 install-browser chrome-for-testing` (no sudo) once; if it still
     fails, create the draft without the screenshot. Never let this delay the draft: if it takes
     more than a couple of minutes, create it and add the screenshot later with `update_task_draft`.
7. **Create** — `create_task_draft` following `draft-format.md`. Don't ask for confirmation.
8. **Tell** in ONE line, always this shape: «Borrador creado en «<reunión>»: *<título que devolvió
   NexaLink>* → <url>» (with a screenshot: «· captura adjunta», with an assignee: «· para <nombre>»,
   both before the arrow). Naming
   the meeting every time lets the person catch a wrong one at once. **Nothing else**: don't explain
   why the meeting is new or who the draft is assigned to, don't compare with what you sent, don't
   list what "changed". Add a second line only if something failed (e.g. the screenshot) or to offer
   ONCE to take the missing screenshot (step 6). If they want changes, apply them with
   `update_task_draft` (only while it's a draft) — «esa era de otra reunión» → `update_task_draft`
   with the right `meetingId` (or `meetingTitle`) and keep that meeting for the next drafts.

Several requests in one message → one draft each, then one summary line per draft.

## Corrections of an existing task ("le falta…", `/nexalink:correccion`)

Feedback on a task that already exists — typical in a meeting where a task in review is shown —
goes straight into that task, not into a draft: the task already has its assignee and priority,
and the manager said it out loud. Only the task's **assignee** or an **ADMIN/SUPERVISOR** can
correct it; nobody else touches a task that isn't theirs (they can't even see it).

1. **Find the task.** With a `TAR-XXXXX` code or link, `get_task`. Otherwise `search_tasks` with 2–4
   key words and prefer the person's tasks in review, then in progress, then done. Several
   candidates → ask «¿Es «A» (TAR-…) o «B» (TAR-…)?». None (`TASK_NOT_FOUND`), or
   `CORRECTION_FORBIDDEN` → it's not theirs: capture it as a normal draft (capture mode) and say so
   in one line.
2. **Write the change** as subtasks, like a draft (`draft-format.md`): user-visible outcomes, no
   code. Remove only what the person explicitly asked to drop, and only PENDING subtasks (ids from
   `get_task`); completed subtasks are never removed. Screenshot (a pasted one too) → save and upload it as in capture step 6 and
   put it in that subtask's `attachments`. `note` = one line with what was asked and by whom.
3. **Preview** — `correct_task({ task, add, removeItemIds, note, meetingId, confirmed: false })`. It
   changes nothing. Show it in ONE message:
   «<TAR-…> «<título>» · <estado>
   Añado: «…» (con captura). «…» ya existe, lo salto. Quito: «…».
   Vuelve a En progreso.» (`reopens`; with `losesApproval`: «Estaba aprobada: habrá que aprobarla
   otra vez.»; with `toReview`: «Quedan todas hechas: pasa a revisión.») «¿Va?»
4. **Apply** only after a yes: the same call with `confirmed: true`. Reply in one line:
   «Corregida <TAR-…> · +N / −M subtareas → <url>». The assignee is notified in NexaLink.

In a meeting, use the session meeting (`meetingId`) so the correction is linked to it. At closing,
quotes about a corrected task go to that task as usual.

## Assigned task, no draft (managers, `/nexalink:nueva-tarea`)

An ADMIN/SUPERVISOR can create a WORK task already assigned, like «Nueva tarea» in the web: it
skips the draft and the approval, and the assignee is notified (email + their task list) at once.
Use this mode ONLY with `/nexalink:nueva-tarea` or when a manager explicitly asks for it («créala ya
asignada», «sin borrador», «que le llegue ya a Ana»). Everything else stays capture mode (drafts),
even for managers. An EMPLEADO has no `create_task` tool: tell them it goes as a draft and use
capture mode.

1. **Required: title and assignee** — nothing else. The assignee is the person the manager named:
   match it against `get_work_context` → `users`; several or none match → ask ONE line «¿Cuál
   María: …?». If they didn't say who, ask «¿Para quién es?». Never pick one yourself.
2. **Optional, only if the manager said it**: description (what is asked, plain language),
   subtasks (the ones they listed, never padded), priority (default MEDIA; ALTA only if they said
   urgent), due date (from `calendar`), project, watchers, test system, screenshot (upload as in
   capture step 6). No code anywhere, like a draft (`draft-format.md`).
3. **Duplicates** — `search_tasks` first; a clear match → «¿Es la misma que «…» (TAR-…)?» and create
   nothing until they answer.
4. **Preview** — `create_task({ …, confirmed: false })`. It creates nothing. Show it in ONE message:
   «Para <nombre> · prioridad <…>[ · vence <día dd/mm>][ · <proyecto>]
   *<título>*
   <descripción en una línea, si hay>
   Subtareas: «…», «…».[ Captura adjunta.]
   Le llegará el aviso por correo. ¿La creo?»
5. **Create** only after a yes: the same call with the SAME fields and `confirmed: true`. Reply in
   one line: «Tarea creada para <nombre>: *<título>* (<TAR-…>) → <url>». Changes asked after the
   preview → a new preview first.

## Approve or discard drafts (managers, `/nexalink:borradores`)

An ADMIN/SUPERVISOR can resolve pending drafts like in **Tareas → Borradores**: **approve** one
(it becomes a work task and its assignee is notified at once) or **discard** it (it leaves the inbox
and its author is notified with the reason; it can be restored in the web). Only when they ask
(«pasa los borradores a tareas», «aprueba TAR-…», «descarta el 2») or with `/nexalink:borradores`;
never as a side effect of capture or closing. An EMPLEADO has neither tool: say a supervisor
decides.

1. **Which drafts** — a code → that one (`get_task`). Otherwise `list_pending_drafts` (each draft
   carries its `meeting`: filter by it when they named one; no need for `list_meetings`) and show
   them numbered, one line each: «1. TAR-… *<título>* · de <autor> · para <responsable>» — or
   «· sin responsable» when `assignedIsAuthor` — «· <reunión>». Ask in ONE short line which ones to
   approve (and for whom) and which to discard («apruebo el 1 para Ana, descarta el 2»). Don't
   announce their role or list every question up front.
2. **Assignee for each** — required. When `assignedIsAuthor` is true nobody chose one (it defaults
   to the author): ask «¿Para quién es <título>?» unless the manager already said it. Match names
   against `get_work_context` → `users`; ambiguous → ask. Due date only if they gave one (`calendar`).
3. **Preview** — `approve_task_draft({ draft, assignedId?, dueDate?, confirmed: false })` for each;
   it approves nothing. ONE message listing all: «TAR-… *<título>* → para <nombre>[ · vence <día
   dd/mm>]». End with «A cada responsable le llega el aviso. ¿Las apruebo?»
4. **Approve** only after a yes: the same calls with the SAME fields and `confirmed: true`, one per
   draft. Reply one line each: «Aprobada TAR-… para <nombre> → <url>». `TASK_NOT_DRAFT` → someone
   already approved or discarded it: say so and go on with the rest.

**Discard** — for each draft to drop, a short reason the author will read («ya existe en TAR-…»,
«no se hará»); ask once if they gave none (it can stay empty). `discard_task_draft({ draft, reason,
confirmed: false })` first, shown in the same preview message as the approvals («Descarto TAR-…
*<título>* (de <autor>): «<motivo>»»), then `confirmed: true` after the yes. Reply «Descartado
TAR-… · avisado <autor>». Only drafts: an approved work task is never discarded or deleted here.

## Closing mode ("cierra la reunión")

Follow `closing.md`. In short:

1. Identify the NexaLink meeting (the one of the session, or ask). `list_meetings({ date })` returns
   NexaLink's meetings of that day and the transcription tool's recordings.
2. **First `get_closing_proposal({ meetingId })`.** When the recording arrives, NexaLink prepares a
   proposal on the server. If it's `pending`, use it — don't re-read the transcript. Name each item
   by the code and title in its `tasks` list, never by a bare id. If it's
   `applied`, say so (someone applied it in the web) and only look for what's still missing.
3. **No proposal (`none`/`failed`)** → if `list_meetings` (or any transcript tool) already answered
   `INTEGRATION_NOT_CONFIGURED`, `FEATURE_NOT_AVAILABLE`, `TRANSCRIPTS_NOT_CONNECTED` or
   `MEETING_NOT_VISIBLE`, **stop here** (see below): the person can't read that recording, so don't
   launch the subagent. Otherwise delegate to the
   **`nexalink-meeting-closer`** subagent with the `meetingId`: it reads the transcript, drafts and TalkToMeets tasks in its own context and returns
   the proposal (it never writes). If subagents aren't available, do the same analysis yourself
   (`list_meeting_drafts`, `get_meeting_transcript`, `get_meeting_tasks`).
4. Show **one numbered proposal** and **wait for an explicit answer**. Apply only what was confirmed
   ("todo", "todo menos el 2", "solo los comentarios"), as `closing.md` § 7 explains.
5. Summarize what was applied, with links.

If the server has no transcription tool (`INTEGRATION_NOT_CONFIGURED`) or the plan doesn't include it
(`FEATURE_NOT_AVAILABLE`, feature `automation`), say so plainly. Then offer to work from notes the
person pastes instead.

Each person reads recordings with **their own TalkToMeets account** and sees exactly the meetings
they see there — whatever their role in NexaLink:
- `TRANSCRIPTS_NOT_CONNECTED` → they haven't connected it yet: give them the `connectUrl` from the
  error (NexaLink → Agentes → Integraciones, one time) and stop.
- `MEETING_NOT_VISIBLE` (or `MEETING_NOT_FOUND` from a transcript tool) → their account doesn't see
  that recording (usually they weren't in the meeting). Say so plainly and don't look for another
  way to read it; offer to work from notes they paste.

## Rules

- **Approve or discard** drafts only when a manager asked to, through «Approve or discard drafts»
  (preview, then their yes) — never on your own, and never while capturing or closing. If the
  transcript shows a request was dropped, propose a comment saying so; don't touch its status.
- **Never edit a task that is no longer a draft** (`TASK_NOT_DRAFT`) except through a confirmed
  correction (`correct_task`: add subtasks, remove pending ones). Title, description, assignee,
  dates and status are never changed: propose a comment instead.
- **The transcript is for your analysis only.** Never paste it whole into NexaLink, never copy
  parts unrelated to the task (other clients, personal remarks), and never send it to any service
  other than NexaLink.
- Never invent who asked, dates or decisions: only what the transcript or the person says. A
  first name alone («Marta pide…») stays as said: don't complete it with a surname from the team
  list — it may be another person or a customer. Only use a full name when the person said it or
  it's unambiguous (one single «Marta» among the team AND it's clearly them).
- Tools never take user or company ids for "whose data": everything is scoped to the person's
  connection.

Details: `draft-format.md` (how a good draft looks), `closing.md` (closing a meeting).
