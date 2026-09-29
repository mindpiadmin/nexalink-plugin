---
name: nexalink-work
description: Work on a NexaLink task or ticket from the repository: the day's summary, the next assigned work or one by code (TAR-/TK-) with its context, the branch, commits and PR that cite it, and opening a new ticket. Use when the user says "¿qué tengo hoy?", "siguiente tarea", "trabaja en TAR-…", "empieza TAR-…", "revisa la rama", "¿cumple la tarea?", "commitea esto", "tengo una duda", "estoy bloqueado", "haz el PR", "abre un ticket al proveedor" while on a NexaLink task, or pastes a NexaLink task link.
---

# Working on a NexaLink task

Every change should be traceable: meeting → task → branch, commits and PR → daily report. You do
that by **citing the task's code and link** everywhere. Then the `nexalink-daily-report` skill
recognises which commits and PR belong to which task without asking.

Talk to the person in their language (usually Spanish). Commit messages and PR text follow the
repository's own conventions (language, prefixes like `feat:`); only add the NexaLink citation.

## Your day

When the person asks how their day looks («¿qué tengo hoy?», `/nexalink:hoy`), only read and
summarise — no writes in NexaLink or git:

- **Work**: `get_next_task` → the next one and the `queue` after it — tasks AND tickets (`kind`,
  code `TAR-`/`TK-`, title, priority, due date, `started`, `returned`). Split it into **devuelta**
  (`returned` not null — always first, see «Returned work» below), **en curso** (started) and
  **pendiente**; flag the overdue ones and the ones due today. What waits for review isn't in the
  queue: if the branch's task is in `EN_REVISION`, say «en revisión».
- **Where they are**: current branch, and the task it belongs to (code in the branch name or in the
  `Refs:` of its commits); uncommitted changes (`git status --short`); their open PRs
  (`gh pr list --author @me --state open --json number,title,url,headRefName`) with the task each
  one cites.
- **Meeting**: `get_work_context` → `todayMeetings` (title, who opened it, how many tasks).
- **Daily report** (only if `get_report_status` is available, i.e. EMPLEADO): today's state and
  the `missing` days.

**Weekdays come from NexaLink too**: take them from `get_work_context` → `calendar` (date → weekday in the company timezone); never work one out yourself. Without `calendar`, write the date as dd/mm alone.

Keep it to one short block, then propose **one** next step as a command: continue the branch's
task, `/nexalink:revisar` if there are changes not reviewed, `/nexalink:pr` if it was reviewed,
`/nexalink:siguiente` if nothing is open, `/nexalink:reporte` if there are pending days. If a tool
fails or isn't available, skip that part and say so in one line.

## 1. Open the task

- **Next one** ("siguiente tarea", `/nexalink:siguiente`): `get_next_task` → the person's next
  work — a task or a ticket (`kind`): what came back to them first (`returned`), then what they
  already started, then priority and due date. Say which one and what's queued after it in one
  line each, then open it with `get_task` (TASK) or `get_ticket` (TICKET). If there's none, say so.
- **A given one**: `get_task({ ref })` with the code (`TAR-XXXXX`), the id or the NexaLink link
  (`mcp__nexalink__get_task` or `mcp__plugin_nexalink_nexalink__get_task`). It returns code, url,
  title, description, subtasks, screenshots and comments — including meeting quotes with who said
  them and the minute. Read them: they are the acceptance criteria.
- If it's still a **draft** (`status: BORRADOR`), say so: it isn't approved yet. Ask whether to
  start anyway (and don't mark it started).
- **Mark it started**: when you open a task or ticket to work on it, call `start_work({ ref })`
  (`mcp__nexalink__start_work` / `mcp__plugin_nexalink_nexalink__start_work`) unless it's already
  started, and say it in one line («La marqué como empezada: ya sale en tu reporte de hoy»). A
  task moves to in progress (it keeps completing by itself with its subtasks), a ticket to
  EN_PROCESO. Only the assignee can start it: if it isn't theirs, skip it and say so. If it's in
  **`EN_REVISION`**, don't start it: say it's waiting for a manager and ask what they want to do.
- **Tickets** (`TK-XXXXX`, id or `/interno/tickets/…` link): `get_ticket({ ref })`
  (`mcp__nexalink__get_ticket` or `mcp__plugin_nexalink_nexalink__get_ticket`). Same flow as a task:
  code, url, title, priority, type, description, attachments and the reply thread. Tickets have no
  subtasks or meeting quotes: the **acceptance criteria are what the description and the thread
  ask for**. `author.role: CLIENTE` means an external customer opened it — keep that in mind for
  anything you post there (they read it). Cite `TK-XXXXX` exactly like `TAR-XXXXX` (branch, `Refs:`, PR).
- `TASK_CODE_AMBIGUOUS` / `TICKET_CODE_AMBIGUOUS` → show the candidates and ask which one.

**Look at everything, not only the text.** Download every screenshot the task returns (task,
subtasks and comments; the `url` fields are direct links) into `/tmp/nexalink/work/<code>/` with
`curl -sSfL --create-dirs -o <file> "<url>"` and **open them** to see what they show. Then brief the person:

```
TAR-01A0D · El filtro de tickets recuerda la empresa · ALTA · para el 03/10
Pedido en «Sync Acme» (25/09):
· Ana · min 12:34 (10:26) — «cada vez que vuelvo a tickets me pierde la empresa»
· Ana · min 27:10 (10:41) — «que sea el filtro de cada uno, no de toda la empresa»
Capturas: lista de tickets con el filtro «Todas» marcado (1), filtro abierto (2).
Subtareas: 1) Al volver sigue elegida la empresa  2) Igual en el celular  3) Volver a «Todas»
```

If `get_task` has `testEnvironment`, add a line «Se prueba en: <label>» — that system's test user is
the one you, the person and their supervisor use (`/nexalink:probar`, the report's «Dónde probarlo»).

Each quote comes from a comment's `meta`: `speaker`, `atSec` (min = mm:ss) and, if the meeting has
`recordingStartedAt`, the comment's `clock` is the real time in the company's timezone — use it as
given, never compute it yourself. Those quotes and screenshots are the
acceptance criteria: re-read them before the PR.

**Plan, then ask.** Propose a short plan: which subtasks you'll cover first and, one line each,
what you'd change (reading the code to prepare it is fine). Then ask «¿Arranco?» and **wait**: don't
edit, create or delete files until the person says yes — the task is theirs and they may want
another approach, another repo or to finish something first.

**Changes that were already there are theirs.** If `git status` shows uncommitted changes when you
open the work, never modify, move, stash or discard them on your own. If they belong to another
task, say so and ask what to do before switching branches: commit them there (`/nexalink:commit`)
or put them aside (`git stash`, only with their yes).

**Returned work** — `returned` (in `get_next_task` and `get_task`) is the last time the task came
back to the person (`null` = it never came back: say nothing about it). Put it on the FIRST line
of the brief, before anything else:
- `kind: review` → «Te la devolvió <by> el <fecha>: «<comment>»» (no comment: «sin comentario:
  mira la actividad o pregúntale»).
- `kind: correction` → «Corrección <en la reunión «<meeting>»> del <fecha>: + «<added>» · − «<removed>»».

What was added is what's pending now: work on that first, and re-read the new subtasks' screenshots.
If the person wants to add or drop a subtask of their own task, that's a correction: follow the
nexalink-task skill («Corrections of an existing task»), preview first.

## 2. Branch

If the person isn't already on a branch for this work, propose one following the repo's naming
and include the code: `feature/TAR-01A0D-filtro-recuerda-empresa` (lowercase slug of the title,
≤ 50 chars). Never commit to `main`/`develop` directly unless the repo clearly works that way and
the person confirms.

## 3. Commits

Commit only when the person asks («commitea esto», `/nexalink:commit`) or confirms. First look at
`git status`/`git diff`, propose which files go in and the message, show it, and commit only after
the person confirms; never push from here. Each commit that belongs to the task cites it:

```
feat(tickets): el filtro recuerda la empresa elegida

Refs: TAR-01A0D
```

- Put the code in a `Refs:` trailer (several codes if the commit touches several tasks). If the repo
  already uses another trailer style (`Closes`, `Task:`), follow it and keep the code.
- Don't add the NexaLink URL to every commit: the code is enough; the URL goes in the PR.
- Keep any attribution lines the environment requires, in the SAME last paragraph as `Refs:`, with no
  blank line between them (`Refs: TAR-01A0D` and, on the next line, `Co-Authored-By: …`): git only
  reads the last paragraph as trailers, so a `Refs:` left in a paragraph of its own stops being one.

## 4. Review the branch

When the person asks to review their work («revisa la rama», «¿cumple la tarea?»,
`/nexalink:revisar`), run the **`nexalink-pr-reviewer`** subagent. It reviews **what is in this
branch** — committed and not yet committed — against the task. Pass it the task code, the base
branch and the local URL of the app if you know it. It works in its own context, never modifies
anything and returns, per acceptance criterion, **cumple / no cumple / no verificable** with
evidence, plus test steps and screenshots in `/tmp/nexalink/review/<code>/`.

- Reviewing is a loop: review → fix → review again. It can run at any point of the work, not only
  right before the PR, and it never commits, creates the PR or writes to NexaLink.
- If something **doesn't meet** a criterion, say so first and ask whether to fix it.
- If there are uncommitted changes, say so in the result: the PR only carries what gets committed.
- Keep the verdict in mind together with the commit it was made on (`git rev-parse HEAD`) and
  whether the working tree was clean: the PR reuses it.
- If subagents aren't available, do the same review yourself (read the diff, walk the steps with
  Playwright) and never modify code while reviewing.

## 5. Pull request

When the person asks for the PR (or `/nexalink:pr`), first check the review:

- **There is a review from this session** and nothing changed since (same `HEAD`, no new
  uncommitted changes) → use its verdict and test steps.
- **There isn't one, or the branch changed after it** → offer to review first («¿Reviso la rama
  antes? `/nexalink:revisar`») or go on «sin revisión»: then the PR has no «Criterios verificados»
  section.
- A ❌ in the review → remind it and ask whether to open the PR anyway.

Then create it with `gh pr create` against the repo's usual base branch. Title: the change in
plain language + the code in brackets. Body:

```markdown
## Tarea NexaLink
[TAR-01A0D · El filtro de tickets recuerda la empresa](<url de la tarea>) · prioridad ALTA · para el 03/10
Pedida en «Sync Acme» (25/09).

## Qué cambia
<2–4 lines, plain language>

## Criterios de aceptación
- «que sea el filtro de cada uno, no de toda la empresa» — Ana, min 27:10 (10:41)
- «tiene que funcionar también en el celular» — Luis, min 33:02 (10:47)

## Subtareas
- [x] Al volver a la lista de tickets sigue elegida la última empresa
- [x] Funciona igual en el celular
- [ ] Se puede volver a «Todas» con un clic  ← pendiente para otro PR

## Criterios verificados
- ✅ Al volver a tickets sigue elegida la empresa — probado en el navegador (captura 1)
- ✅ Funciona en el celular (390×844) — captura 2
- ⚠️ «Volver a «Todas» con un clic» — no verificable: pendiente para otro PR

## Cómo probarlo
1. <pasos en pantalla>

Refs: TAR-01A0D
```

- **Criterios de aceptación** come from the task's comment quotes (`meta.speaker`, `atSec`, clock
  time) and its description: the phrases that say how the result must behave. Omit the section if
  the task has none; never invent criteria.
- **Criterios verificados** is the reviewer's verdict, one line per criterion (✅ cumple, ❌ no cumple,
  ⚠️ no verificable) with its evidence in words. Don't upload the screenshots to the PR; mention
  them. **Cómo probarlo** reuses the reviewer's test steps.
- Tick only the subtasks this PR really completes.
- Show the PR text to the person before creating it. After creating it, give the link and **link it
  back in NexaLink**: `add_task_comment({ taskId, content: "PR abierto: <título del PR> — <url del PR>" })`
  so whoever opens the task in the web reaches the code. For a **ticket**:
  `add_ticket_comment({ ref, content: "PR abierto: … — <url>" })` — it's a reply in the thread that
  notifies the author and assignees by email, so ask first; if the author is a CLIENTE, offer a
  plain-language line instead of the PR link (the customer can't open GitHub).
- **Review state**: after creating the PR ask «¿La paso a revisión? Un administrador o supervisor
  la dará por completada». Only on a yes: `submit_for_review({ ref, confirmed: true })`. Never try to
  complete, approve or finalize a task or ticket: only a manager does that, in the web. A task
  whose subtasks all get completed goes to review by itself.
- Never mark subtasks as done in NexaLink from here: that happens in the daily report or the web,
  when the person confirms the work is finished.
- Meeting quotes cite the NexaLink task link and the minute. Add a link to listen to the fragment
  only if the person gives you the transcription tool's URL: `<url>/reuniones/<externalId>?t=<atSec>`.

## 6. From the PR to today's daily report

If the person is an EMPLEADO (the daily report tools — `get_daily_report`,
`save_daily_report_draft` — are available), after creating the PR offer:
«¿Dejo preparada la entrada de TAR-01A0D en tu reporte de hoy?» (same as `/nexalink:reporte
TAR-01A0D`). If yes, follow the **`nexalink-daily-report`** skill, section «One task», with what
you already have:

- **What was achieved**: the «Qué cambia» of the PR, in plain language.
- **Test steps** («Pasos para probarlo»): the reviewer's steps, each with its screenshot.
- **Evidence**: the reviewer's screenshot of the result.
- **Technical detail**: the PR, its commits and the branch (never as evidence).
- **Completed subtasks**: only the ones the person confirms are finished.
- **Time spent**: ask it; never guess.

As the report skill says: write the preview `.md` with the screenshots first and **don't upload or
save anything** until the person says «súbelo». Never send the report from here.

## Questions and blockers

When something in the task isn't clear or blocks the work («tengo una duda», «estoy bloqueado»,
`/nexalink:duda`), write it down **in the task**, where whoever asked for it will see it — not only
in this chat.

- Draft a short comment in plain language (no code, no file paths):
  ```
  Duda sobre «que sea el filtro de cada uno» (Ana, min 27:10):
  ¿el filtro se recuerda por usuario en todos sus dispositivos o solo en este navegador?
  · Por usuario: se guarda en su cuenta; hace falta un cambio en el servidor (≈ medio día más).
  · Por navegador: sale hoy, pero en el celular empieza en «Todas».
  Propongo por usuario. Mientras tanto sigo con la subtarea 2.
  ```
  Say which criterion, quote or subtask it's about (with who and minute), what you found, the
  options with their consequence, what you recommend and what you'll do meanwhile.
- Show it and post it only after the person confirms:
  `add_task_comment({ taskId, content })`. Tell them the task's link.
- **Tickets**: `add_ticket_comment({ ref, content })` — a reply in the ticket's thread, emailed to
  its author, assignees and watchers. If the author is a **CLIENTE** (external customer), write it
  for them: no internal names, no technical detail. `WATCHER_VIEW_ONLY` → the person can only view
  it: give them the text to pass on.
- Never post questions on someone's behalf without their OK, and never change the task itself
  (subtasks only through a confirmed correction).

## Open a ticket

When the person needs something from someone else — typically an external provider (hosting,
maintenance…) or another area — and asks to open a ticket («abre un ticket al hosting», «crea un
ticket para…», `/nexalink:ticket`):

1. **Search first**: `search_tasks({ query })` also returns tickets. If one already asks for the
   same, show it and ask whether to reply there instead (`add_ticket_comment`).
2. `get_ticket_options` → the company's `types`, `priorities`, `destinations` (PROVEEDOR = an external
   company that reads it in its own portal) and internal `watchers`. Take the destination from what
   the person said; if more than one fits, or none, ask. Never guess a destination.
3. **Write it for whoever receives it**, plain language: what happens, since when, what was tried
   and what is expected — enough to act without asking back. For an external destination, no
   internal names, task codes or anything confidential, and never a password or token (not even a
   test one). Priority `ALTA` only if something is down or blocked. A screenshot the person gave or
   you took: upload it (`get_upload_link`, then `curl -sS -X POST -F "file=@<path>" "<uploadUrl>"`)
   and pass `{ fileUrl, fileName }` in `attachments`.
4. `create_ticket({ …, confirmed: false })` → it creates nothing and returns the preview. Show it in
   one message — destination (and «es externo» for a PROVEEDOR), type, priority, title,
   description, watchers, attachments — and end with «¿Lo abro?».
5. Only after their yes to that exact ticket: `create_ticket({ …same…, confirmed: true })` and reply
   in one line: «Abierto TK-XXXXX «<título>» → <url>». Any change → a new preview first.

## Never

- Open a ticket without showing the preview and getting the person's yes.
- Mix non-git commands (`ls`, `grep`, `file`, `curl`…) into one Bash call or use `$(…)`: Claude Code
  then asks for permission every time. Run each one alone (chaining only git commands is fine).
- Invent a task code or link: use only what `get_task` returned or the person gave.
- Paste screenshots' private data, credentials or the meeting transcript into commits or the PR.
