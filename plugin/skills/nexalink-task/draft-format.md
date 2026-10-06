# How a good task draft looks

The approver reads the draft days later, without the meeting in their head, and may not be
technical. The draft must stand on its own.

**Everything is high level. No code anywhere** — not in the title, the description or the
subtasks: no file or folder names, no functions, classes, components, tables, endpoints, branches,
libraries or technical jargon. Describe what changes for the people who use the product and how
someone would check it on screen. The code you read in the repository is for YOU to understand
the scope; it never goes into the draft. Whoever implements it will decide the how.

## Fields

A capture is high level: title, description, project, screenshot and meeting — plus the assignee only when the person said who. Nothing else.

| Field | What goes there | Limit |
|---|---|---|
| `title` | The outcome, as a short sentence a non-technical person understands. Starts with what changes for the user. | ≤ 200 chars, ideally ≤ 70 |
| `description` | Who asked, what they want to happen and why, in plain language. 2–5 lines. If several results were asked for, say them here in a sentence. No file paths, code or class names. | ≤ 10 000 |
| `projectId` | The project it belongs to (id from `get_work_context`). If it isn't obvious, leave it. | |
| `assignedId` | ONLY if the person said who it's for («asígnasela a María»): that user's `id` from `get_work_context` → `users`. Otherwise leave it. Never in the description. | |
| `attachments` | The screenshot(s), uploaded with `get_upload_link`. | ≤ 20 |
| `meetingTitle` / `meetingDate` / `meetingId` | The meeting of the session. | title ≤ 120 |

## Good

```json
{
  "title": "El filtro de tickets recuerda la empresa elegida",
  "description": "Ana (Acme) pidió en la reunión que, al volver a la lista de tickets, siga filtrada por la empresa que eligió la última vez. Hoy cada vez vuelve a «Todas» y pierde tiempo.",
  "projectId": "<id de «App Acme» en get_work_context>",
  "meetingTitle": "Sync Acme"
}
```

## Bad

- Title `"Fix filtro"` / `"Cambiar ProviderTicketsView.vue"` → not understandable, or technical.
- Description with code, file paths or a literal copy of what was said.
- Implementation steps in the description (`"guardar el filtro en localStorage"`) → write what
  the user will see instead: `"la lista recuerda la empresa elegida"`.
- Priority, due date, subtasks or estimates: not part of a capture. Whoever approves the draft
  decides them. An assignee nobody mentioned, too.
- «Asignar a María» written in the description → it goes in `assignedId`.
- Several unrelated requests merged into one draft → create one draft each.

## System where it's tested

If the request is clearly about one of the company's systems (`get_work_context` →
`testEnvironments`, e.g. «App Acme»), pass its test environment's `id` as
`testEnvironmentId` (prefer the testing one, not production). If it's not clear, leave it: the
approver sets it.
