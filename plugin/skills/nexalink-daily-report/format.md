# Entry format

The platform accepts up to 150 words per entry. **Do not use it.** Earlier agent-written reports
were long and nobody read them. Write far below the limit.

## Worked entry (task, ticket or "Otro trabajo")

| Field | Rule |
|---|---|
| `content` | **Max 2 sentences and 200 characters.** What now works / what problem stopped happening, and what is still missing if relevant. Business language. No process, no lists, no commit summaries. Employee's language. |
| `minutesSpent` | Whole minutes, given or confirmed by the employee. Never estimated by you. |
| `evidences` | At least one **visual** proof: uploaded screenshot/video (`FILE`) or a `LINK` to where the result can be seen. Never a PR/commit/branch link. |
| `testSteps` | Only what is needed to see it working: 1–2 for a small change, up to 10 for a long flow. One on-screen action per step (where to go, what to click, what should appear). No filler ("open the browser", "log in"). No commands. Each ≤ 200 chars. A step may carry its own screenshot: `{ "text": "…", "image": "/uploads/…" }` — only where the place on screen isn't obvious. When the entry covers several subtasks, each step says which one it tests: `{ "text": "…", "itemId": "<subtask id>" }`; keep each subtask's steps together. |
| `completedItemIds` | TASK entries only: ids of the subtasks (row `items`, `isCompleted: false`) the employee **finished** that day, e.g. 3 of 5. Completed in the task when the report is sent. Tickets have no subtasks. Optional. |
| `finished` | TASK entries **without subtasks** only: `true` when the employee says they **finished the task** that day. When the entry is sent the task goes to review (the supervisor approves or returns it). Tasks with subtasks go to review when all of them are completed, so never set it there. Only with the employee's yes. |
| `progressItemIds` | TASK entries only: ids of the subtasks the employee **worked on without finishing** that day (never the same ids as `completedItemIds`). Nothing changes in the task; the supervisor sees «Avanzó». Optional. |
| `testUrl` | «Dónde probarlo»: the exact address where the supervisor sees this work, in the company's **test environment** (the ones `get_test_access` knows; if you tested in production, the same page in testing). Not a PR/commit link, never localhost or a private address. Optional, but the supervisor's agent tests from it. |
| `testAccount` | Optional `{ username, password }` of a TEST account to check this entry when it needs a specific user (e.g. a test customer) — only if the employee gives it, never their personal account. Usually not needed: the task's system (`testEnvironment`) already has the shared test account. Re-saving an entry without it removes it; send `{ username }` to keep it. |
| `techRefs` | PR, commits and branch **published on the remote**, with `label` ("PR #43", commit subject); other system traces (pipeline, deploy, external issue) as `OTHER`. For internal audit; the supervisor sees it folded. |
| `title` ("Otro trabajo" only) | Short and clear: "Reunión de planificación", "Soporte telefónico a cliente", "Bug de login en Safari (sin ticket)". |

## Not worked ("hoy no")

`worked: false` + `notWorkedReason`: one short sentence (≤ 140 chars) given by the employee.
If the row has `previousReason`, you may offer it for reuse; do not write it yourself.

## Unanswered

Leave the row out (or `worked` unset). It doesn't block sending and isn't saved in a sent report;
the employee can answer it later within the 24 h window. Sending with nothing answered and no
absence fails with `DAILY_REPORT_EMPTY`.

## Language: no jargon

Avoid file/function/library names, endpoints, "refactor", "webhook", "merge", "deploy", "PR",
"endpoint", "API", "migración", "fix" in `content` and `testSteps`.

| Bad | Good |
|---|---|
| "Implementé el webhook de Stripe y el endpoint de confirmación, refactoricé el servicio de pedidos y añadí tests." | "Ya se puede pagar con tarjeta en el checkout y el pedido queda confirmado al instante. Falta PayPal." |
| "Fix del bug de CORS en /api/login para Safari (commit a1b2c3)." | "Los usuarios de Safari ya pueden iniciar sesión." |
| "Trabajé en la tarea, avancé bastante con la parte del formulario y estuve revisando cosas del diseño con el equipo, además…" | "El formulario de alta ya guarda los datos del cliente. Falta la validación del NIF." |

## Test steps

Good (flow): `1) Entrar a Tienda` `2) Añadir un producto al carrito` `3) Pagar con la tarjeta de prueba 4242…` `4) Ver el pedido como «Pagado» en Mis pedidos`

Good (small change): `1) Entrar a Ajustes → Perfil` `2) Ver el texto «Guardar cambios» corregido`

Bad: `npm run dev`, `Abrir el navegador`, `Iniciar sesión`, `Revisar que el endpoint devuelva 200`.

**Several subtasks in one entry** (a big task where you finished «Versión celular» and «Botón de
entrar» the same day): each subtask gets its own steps, tagged with its `itemId` — HOW TO GET THERE,
with a step screenshot where useful (the last step's screenshot can show that subtask done). The
entry's `evidences` stay the general RESULT («it's ready»). Steps without `itemId` are general.
```json
"testSteps": [
  { "text": "Abrir el login en el celular", "itemId": "i-cel" },
  { "text": "Ver el formulario a una columna", "itemId": "i-cel", "image": "/uploads/…" },
  { "text": "En el login, pulsar «Entrar» sin datos", "itemId": "i-btn" },
  { "text": "Ver el aviso «Completa tu correo»", "itemId": "i-btn" }
]
```

## Checks before saving

- Each `content` ≤ 200 characters and ≤ 2 sentences (count them).
- No PR/commit/branch link in `evidences` (GitHub/GitLab/Bitbucket `/pull/`, `/commit/`, `/tree/`… → `techRefs`).
- No `localhost` / `127.0.0.1` / private-IP `LINK` evidence (the supervisor can't open it).
- `completedItemIds` only with subtasks the employee confirmed as finished, and the text doesn't
  call a subtask done if it isn't in that list. Subtasks worked on but not finished go in
  `progressItemIds`, never in both.
- Times come from the employee.
- One entry per task/ticket; "Otro trabajo" split by activity.
