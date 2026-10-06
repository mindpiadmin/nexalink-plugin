# Closing a meeting with its transcript

Goal: when the approver opens each draft, it already carries what was decided in the meeting —
without them having to watch the recording.

## 1. Find the meeting and the recording

- NexaLink meeting: the one used during the session. If you don't know it, `list_meetings` shows
  NexaLink's meetings of that day (`nexalinkMeetings`); ask which one if there are several.
- Recording: `list_meetings({ date })` → `transcriptMeetings` (`id`, `title`, `startedAt`,
  `durationSec`). Match by title and time; if more than one could match, **ask**.
- If the NexaLink meeting already has `externalId`, the recording is known: skip the question.

## 2. Use the server's proposal first

When the recording has its transcript, TalkToMeets notifies NexaLink and NexaLink prepares a
**closing proposal** on the server (an ADMIN/SUPERVISOR can also review and apply it in the web:
Tareas → Borradores). Always start with `get_closing_proposal({ meetingId })`:

| status | What to do |
|---|---|
| `pending` | Present it (§ 6) with its ids, **exactly as it comes**, naming every task by its **code and title from `tasks`** (never a bare id like `t-102`; don't call `get_task` to guess it): don't add, drop or reword items (the server already verified every quote against the recording). Don't offer changes of your own either (a due date, a subtask, a new wording): if you think something is missing, the only thing you may offer is to review the recording for it, in one line at the end. **Don't call `get_meeting_transcript`**: the work is done. |
| `applied` | Say who applied it and when. Offer only what's still missing (new drafts since then). |
| `none` / `failed` | Build it: delegate to the **`nexalink-meeting-closer`** subagent with the `meetingId` (it reads everything in its own context and returns the proposal without writing). Without subagents, read it yourself (§ 2b). |

## 2b. Read (only when there's no proposal and no subagent)

- `get_meeting_transcript({ externalId, meetingId })` → lines `[mm:ss] Speaker: text`. It also
  links the meeting. `truncated: true` means it was cut at 200 000 characters: say so.
- `list_meeting_drafts({ meetingId })` → the tasks of that meeting, their subtasks and existing
  comments (don't repeat what's already there).
- `get_meeting_tasks({ meetingId })` → the tasks **TalkToMeets detected** in the recording
  (title, detail, `atSec`, assignee). Usually ~20 per meeting and many are noise. They are hints
  to cross-check, never a list to import. **Skip those whose `nexalink` is not null**: they were
  already linked to a NexaLink task or discarded.

**Speaker names:** in Zoom the same person often appears several times after reconnecting
("María", "María (2)", "maria lopez", an email). Before quoting, unify the variants
of each person into one name (the most complete one) and use it in every `speaker`. If two
variants could be different people, keep them apart and say so in the proposal.

## 3. Clean duplicates among the captured drafts

Captures are made in a hurry: the same request is often captured twice ("filtro de empresa" and
"que recuerde la empresa"). For each pair that is the same request, propose to **keep one** (the
clearer one), move into it the other's subtasks and screenshots (`update_task_draft` with the full
`items` and `attachments` lists), and add to the other a comment «Duplicado de «<título>»: se unió
allí.» so the approver discards it in the web. You never discard or delete.

## 4. Cross TalkToMeets' tasks with the drafts

Classify every detected task into exactly one group:

- **Same as a draft** (same request, even with other words) → don't duplicate. Use its detail,
  minute and assignee to enrich that draft (step 4 below).
- **New and concrete** (a clear request with a result someone can check, that nobody captured)
  → propose it as a new draft, rewritten high level (`draft-format.md`), with only the subtasks
  someone said (none if nobody broke it down).
- **Noise** (vague — "resolver problemas pendientes", "mejorar la lógica", "evaluar el impacto" —
  a remark, a repetition, personal, or about another client) → skip it.

When unsure whether two are the same, check the transcript around both minutes. Several detected
tasks can map to one draft; one detected task never becomes two drafts.

## 5. For each draft, find every moment it was discussed

Go draft by draft: search the whole transcript for the moments where that change was talked
about — by its words, synonyms, the screen it affects, or "eso que dijimos de…". A request is
often discussed more than once (asked at 12:34, clarified at 27:10, given a date at 48:02): bring
**each** of those moments, in order, each with its own `atSec`.

Only things that change what must be built or how it's judged:

- **Decisions** ("lo hacemos solo para administradores").
- **Acceptance criteria** ("tiene que funcionar también en el móvil").
- **Agreed dates** and **who asked / who will do it**. Show dates as dd/mm; add the weekday only from
  `get_work_context` → `calendar` — never work one out yourself (it went wrong: «martes 30/09»).
- **Open doubts** that someone must answer before starting.
- **Dropped requests**: something captured that the meeting later discarded or postponed.

Not relevant: small talk, other clients' topics, personal remarks, repetitions, anything already
in the draft.
Leave those out silently: don't mention them in the proposal, not even that they exist (a line
like «un comentario confidencial sobre otro cliente quedó fuera» points right at it).

## 6. One proposal, then wait

Show everything at once, numbered, so the person can answer "todo menos el 3":

```
Reunión «Sync Acme» · 25/09 · grabación de 52 min

0. Duplicado: «Que recuerde la empresa» es lo mismo que «El filtro de tickets recuerda la empresa»
   → uno ambos (paso su captura y su subtarea) y marco el otro para descartar.
1. «El filtro de tickets recuerda la empresa»
   · Ana · min 12:34 (10:26) — «cada vez que vuelvo a tickets me pierde la empresa»
   · Ana · min 27:10 (10:41) — «que sea el filtro de cada uno, no de toda la empresa»
   · Luis · min 48:02 (11:02) — «para el viernes lo tengo»
   → 3 comentarios y añadir la subtarea «Cada persona ve su propio filtro guardado».
2. (fecha límite) «El filtro de tickets recuerda la empresa» → 03/10
3. Nuevo borrador: «Exportar tickets a Excel» (Luis lo pidió en 31:10, sin fecha)
4. Aviso: «Modo oscuro en el portal de clientes» se descartó en 40:02 («lo dejamos para
   el año que viene»). Propongo el comentario: «En la reunión se pospuso al año que viene.»

TalkToMeets detectó 22 tareas:
- 3 son las de arriba (ya incluidas, sin duplicar).
- 2 nuevas que propongo como borradores:
  5. «Exportar la lista de pedidos a Excel» (min 31:10, Luis)
  6. «Avisar al cliente cuando su pedido cambie de estado» (min 44:20, Ana)
- 17 quedarían fuera por vagas o repetidas (no se crean; p. ej. «Resolver problemas pendientes»). ¿Quieres verlas?

¿Aplico todo?
```

Whether it comes from the server (`get_closing_proposal`), from the `nexalink-meeting-closer`
subagent or from your own reading, the shape is the same: duplicates, detected tasks (`existing`
→ enriches a draft, `new` → proposed draft, `noise` → only counted), quotes per draft and dates.
Keep each item's id (`d1`, `t3`, `q2`…) next to its number so you apply exactly what was chosen.
Speaker names must already be unified; if the proposal still has two names for one person, fix it
before showing it.

**Write it as a proposal, never as something done.** Everything is conditional until the person
answers: «se crearía», «quedarían fuera por vagas», «propongo»; never «descarté», «creé», «quedó
enlazada». Don't mention side effects of reading (e.g. that the recording got linked when you read
the transcript): they are internal, and they read as if something had already been applied. Keep
remarks after the list to at most two short lines (e.g. the meeting is from another day).

Nothing is applied until the person answers. A partial answer applies only what they named.
If an ADMIN/SUPERVISOR prefers the web, the same proposal can be reviewed and applied in
**Tareas → Borradores** (checkboxes per item); tell them so when they don't have time now.

## 7. Apply

**Server proposal (`pending`) and you are ADMIN/SUPERVISOR** → one call:
`apply_closing_proposal({ meetingId, selected: [<ids confirmed>], edits?, confirmed: true })`. It is
exactly the web's «Aplicar»: it marks the proposal as applied (so nobody applies it again from the
web, which would duplicate the comments) and updates TalkToMeets. Don't apply its items one by one.
`edits` only if the person changed a text or date. Then, for anything they asked that was NOT in the
proposal, use the tools below. Other roles (`MANAGER_REQUIRED`) apply the items with the tools below
and say that a supervisor will see the proposal in the web.

Otherwise, apply only the numbered items the person confirmed, in this order:

- **Duplicates** → `update_task_draft` on the draft you keep with the FULL `items` list (its own plus
  the other's, without repeats) and the FULL `attachments` list (both drafts' screenshots); then
  `add_task_comment` on the other: «Duplicado de «<título>» (<código>): se unió allí. Se puede
  descartar.» You never discard or delete while closing: the approver decides it (web or `/nexalink:borradores`).
- **Detected `existing`** → `add_task_comment({ taskId: <matched draft>, content: "«<cita>» — <detalle>",
  meetingId, atSec, speaker, externalTaskIds: [<id>] })` so TalkToMeets marks it as linked.
- **Detected `new`** → `create_task_draft` with the same meeting, following `draft-format.md`, and
  `externalTaskIds: [<id>]`; right after, `add_task_comment` with `content: "Detectada por TalkToMeets:
  «<cita>»"`, `meetingId`, `atSec`, `speaker`.
- **Corrections of an existing task** (the transcript shows feedback on a task already in review,
  done or in progress) → propose it as one item «Corregir <TAR-…> «<título>»: + «subtarea»…» and,
  when confirmed, apply it as SKILL.md «Corrections of an existing task» says: `correct_task` with
  `confirmed: false` first (it tells you what is skipped as duplicate), then `confirmed: true`, with
  `meetingId`, `atSec`, `speaker` and a `note` quoting the moment. Only the assignee or an
  ADMIN/SUPERVISOR can (`CORRECTION_FORBIDDEN` otherwise): then create a normal draft with the fix.
  An old draft that was captured as a correction of `TAR-…` → managers merge it with
  `merge_draft_into_task({ draftId, task })` (its subtasks and screenshots move into the task, the
  draft is discarded); other roles leave a comment on the draft «Corrección de <TAR-…>».
- **Noise** → nothing; just report how many you skipped.
- **Dates** → `update_task_draft({ taskId, dueDate })` plus a comment with the quote.
- **Quotes** → one `add_task_comment({ taskId, content, meetingId, atSec, speaker })` **per moment**,
  in the order they happened. `content` = the **exact phrase** said, short and in «», plus at most
  one line of context in plain language (no code): «que sea el filtro de cada uno, no de toda la
  empresa» — se decidió que el filtro guardado es personal. ≤ 2 000 chars; never long fragments.
  `atSec` is the second of the line (12:34 → 754) and is **mandatory** for transcript comments;
  `speaker` is who said it (unified name). NexaLink shows it as
  "Ana · min 12:34 · 10:26 — transcripción de «reunión»" (the real clock time comes from the
  recording start) and adds a mark at that second in TalkToMeets' player; don't repeat the time or
  the speaker in `content`.
- If a change fails with `TASK_NOT_DRAFT` (already approved), turn it into a comment and say so.
- Dropped requests → comment only. Never discard: the approver decides.

Finish with the list of what was applied and the links.

## Never

- Paste the whole transcript, or long fragments, into a comment or description.
- Put in a task something said about another client or person unrelated to it.
- Attribute a decision to someone the transcript doesn't show saying it.
