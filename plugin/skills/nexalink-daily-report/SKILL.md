---
name: nexalink-daily-report
description: The employee's NexaLink daily report («reporte diario») through the NexaLink MCP server. Use when the user asks to do, fill, prepare, review or send their daily report, report a pending day, report the work of one task («reporta TAR-…», «carga lo de esta tarea»), or mark a NexaLink subtask as done.
---

# NexaLink daily report

You help a developer (role EMPLEADO) write their daily report in NexaLink. The reader is a
**non-technical, visual supervisor**: short business-language results, screenshots, and
on-screen steps to try it. Technical traces (PR, commits, branch) go only in `techRefs`
("Detalle técnico"), for internal audit.

Write the report content in the employee's language (usually Spanish). Talk to the employee
in their language too.

The employee is responsible for what is sent in their name. You propose; they decide.
Never invent times, evidence, links or references.

## 0. Preflight (always, before anything else)

**Required** — if one fails, say which one and how to fix it, and **stop** until it is fixed:

| Requirement | Check | Fix |
|---|---|---|
| NexaLink MCP connected | `get_report_status` works (no 401 / "needs authentication") | In NexaLink → **Agentes** → "Conectar un agente": run the command shown there (no token in it), then authorize in the browser — Claude Code: install the **NexaLink plugin** (it brings this connection, Playwright, this skill and the reviewer), then `/mcp` → `plugin:nexalink:nexalink` (or `nexalink` if it was added by hand) → Authenticate; Codex: `codex mcp login nexalink`. The browser opens NexaLink's "Autorizar agente" page with the employee's session; they approve and the agent is connected. **Only if the client can't open a browser (no OAuth support):** the fold "¿Tu agente no abre el navegador?" generates a manual token (`NEXALINK_TOKEN`) |

**Recommended** — if one is missing, tell the employee once what it would add and how to install
it, then **continue** without it:

| Tool | Without it | Fix |
|---|---|---|
| git | you can't read the day's commits: ask the employee what they did | Install git |
| GitHub CLI | no PR/commit links in `techRefs` unless the employee pastes them | `gh auth login` (account with access to the work repos) |
| Playwright MCP (`browser_*` tools) + reviewer subagent | no automatic walk-through or screenshots: ask the employee for the evidence | Claude Code: both come with the NexaLink plugin (if the browser is missing — error "is not installed" / "not found" — run `npx -y @playwright/mcp@0.0.82 install-browser chrome-for-testing`, no sudo). Without the plugin: `claude mcp add --scope user playwright -- npx @playwright/mcp@0.0.82 --browser chromium`, `npx -y @playwright/mcp@0.0.82 install-browser chrome-for-testing`, copy `agents/nexalink-report-reviewer.md` into `~/.claude/agents/`, restart Claude Code |
| curl | you can't upload screenshots: use LINK evidence or ask the employee to attach files in the web | Install curl |

If something is missing, offer the **`nexalink-setup`** skill once ("¿quieres que prepare tu equipo? instalo lo que falta"): it checks and installs these tools with the employee's approval. If they say no, continue without them.

If everything is there, continue without asking about it.

## Flow

1. **Days** — `get_report_status`. Offer today and any `missing` days (oldest first). Ask which day.
   Name days as dd/mm; a weekday only as NexaLink gives it (`weekday` of each day and `todayWeekday`
   here, or `get_work_context` → `calendar`) — never work one out yourself.
   **Nothing goes to NexaLink until the employee says yes at the end** (step 10): no saves, no
   uploads. Work locally and show everything in the preview (step 9).
   **Is that day already sent?** `get_daily_report` returns `report.submittedAt` set. Then a save
   **publishes the entry to the supervisor at once** (there is no draft): at step 10 ask "¿lo añado
   a tu reporte ya enviado? tu supervisor lo verá al momento", save once, and don't call
   `submit_daily_report`. Don't include the entries already sent unless the employee asks to change
   them (the save merges by key; omitted entries stay as they are).
2. **Read** — `get_daily_report({ date })`. `rows` are the tasks/tickets the employee is **working
   on** (started / in progress, plus anything with an entry that day); `available` are their other
   open assigned tasks/tickets (not started yet, or waiting for review) with the same shape.
   Also saved entries, "Otro trabajo" entries with their `clientKey`, and the limits. **Task rows
   carry their subtasks** in `items` (`id`, `title`, `isCompleted`); tickets have no subtasks. If
   the day's git or the employee shows work on something in `available`, propose adding it: saving
   it as worked marks it started. The employee may have **no rows at all**: then the report is made
   of what they add from `available` and/or "Otro trabajo" entries, and that's fine.
3. **Gather the day's work** from the sources below. Only work dated that day (company timezone).
4. **Checkpoint 1 – what was worked**:
   - **No rows and nothing in `available`**: say so plainly first — "No tienes tareas ni tickets
     asignados en NexaLink. Cuéntame qué hiciste hoy y reviso tu git (commits y PR) para
     completarlo." — then build "Otro trabajo" entries from their answer and git.
   - **No rows but `available` has items**: "No tienes nada empezado. Tus asignadas son: …" (code
     «title»); ask which ones they worked on today (those get added and marked started) and build
     "Otro trabajo" for the rest.
   - **Rows**: list them as "code «title»" (for tasks, with how many open subtasks), then ask which
     ones they worked on. Propose which look worked and why (commits carry `Refs: TAR-XXXXX` / `TK-XXXXX` when made with the `nexalink-work` skill; a commit/branch/PR mentions the code
     like `TAR-8F3A1` or the title). Wait for the employee
   to confirm or correct. Never mark a row worked / not worked on your own. For each not-worked
   row ask for a short reason (≤ 140 chars); if the row has `previousReason`, offer to reuse it.
   Rows the employee doesn't want to answer can stay unanswered: they are left out of the sent
   report and can be added within 24 h. Entries are independent: sending needs at least one
   answered row (yes or no) or an "Otro trabajo".
   **Subtasks**: for every worked task row with open subtasks (`isCompleted: false`), list them and
   ask which ones were **finished** and which ones were **advanced without finishing** that day ("De
   «Checkout» tiene 5 subtareas; ¿cuáles terminaste hoy y en cuáles avanzaste?"). Propose from what you saw (a commit or PR naming the subtask), but only the
   employee decides; never infer completion from a merged PR. Already completed subtasks are not
   offered. The confirmed ids go in that entry's `completedItemIds`: when the report is sent they
   are completed in the task too (the entry's time is split evenly among them). The advanced ones
   go in `progressItemIds` (nothing changes in the task). For a worked task **without** subtasks,
   ask «¿La dejaste terminada? Pasará a revisión» → `finished: true` only on a yes (when the report
   is sent the task goes to review; otherwise it stays in progress).
5. **History + Otro trabajo** — `get_item_history` for each worked row so today's text only
   covers today's progress. Anything with no assigned task/ticket becomes "Otro trabajo".
6. **Draft** — write each entry (see Format) and **Checkpoint 2 – times** (ask; never estimate).
   Keep the draft locally — don't save it yet. **Check it with the validator** (same rules as
   NexaLink; the server's `pendingIssues`/`styleIssues` only come back when you save at step 10):
   write the entries exactly as you'll save them to `/tmp/nexalink/review/<date>/draft.json`
   (screenshots not uploaded yet go as `{ "kind": "FILE", "path": "<local file>" }`, a step image as
   its local path) and run, alone, `node "${CLAUDE_SKILL_DIR}/validate.mjs" /tmp/nexalink/review/<date>/draft.json`.
   Exit 0 = fine; otherwise fix every item of `errors`, `blocking`, `style` and `advice` (a missing
   time or evidence is a question for the employee, never an invention) and run it again. If the
   validator isn't there (another agent, no Node), check `format.md` yourself instead. Run it again
   on the final entries just before saving at step 10.
7. **Final review (mandatory, before approval)** — run the `nexalink-report-reviewer` subagent
   (see `review-checklist.md`). If it isn't installed, do the same review yourself with the same 6
   points; if there's no browser automation either, ask the employee for the screenshots and mark
   the steps "not verified" until they confirm them. First **Checkpoint 3 – environment**: ask where to verify
   (local or test URL). In a company test environment the reviewer logs in with its test account
   (`get_test_access`); never ask for the employee's password. Production only with explicit
   permission, and there it only looks (see the nexalink-qa skill).
   Then **Checkpoint 4 – screenshots**: show every screenshot before uploading it; the employee
   can discard it or ask for another. "Hazlas tú" means *take* them, not *approve* them: still show
   them and wait for an OK before uploading. The screenshots are shown to the employee in the
   **preview** (step 9) and uploaded only after the final yes (step 10): the result screenshot goes
   in `evidences`; a screenshot of a step whose place on screen isn't obvious can go on that step
   (`testSteps: [{ text, image }]`, optional — it never replaces the evidence). Propose
   **«Dónde probarlo»** (`testUrl`): the address of the test environment where you (or the
   reviewer) checked it; the employee can change it.
   By default, the screen in the task's system (`get_task` → `testEnvironment`). Only if the
   employee gives a specific test account for this entry, add `testAccount` (see `format.md`).
8. **Fix** everything the review reports, with the employee's OK. Any change after an approval ⇒
   that entry must be approved again.
9. **Preview + Checkpoint 5 – each entry**: the terminal can't show images, so write a **preview
   file** with every entry exactly as the supervisor will see it, screenshots embedded — follow
   `preview.md`. Save it in the review folder, next to the screenshots, **never inside the repo**:
   `/tmp/nexalink/review/<date>/preview.md` (Windows: `%TEMP%\nexalink\review\<date>\preview.md`).
   If you can't write files, show the full preview in the chat instead and say why.
   Tell the employee the path and how to open it ("ábrela en VS Code con Ctrl+Shift+V, o en
   cualquier visor de Markdown"), plus a 2–3 line summary in the chat. Then get an explicit
   approval, correction or removal per entry. On any change, update the preview and ask again.
   For steps the reviewer marked "not verified", the employee must confirm they tested them.
10. **Checkpoint 6 – "¿Lo subo?"**: ask to upload ("¿Lo subo a NexaLink?"; for an already sent day:
   "¿lo añado a tu reporte ya enviado? tu supervisor lo verá al momento"). Only on an explicit yes:
   upload the approved screenshots (`get_upload_link`, see `evidence.md`), save the entries with
   their final evidence and step images, and read `pendingIssues`/`styleIssues`: if there are any,
   fix them, update the preview and ask again before going on. Then — if the day wasn't sent —
   `submit_daily_report({ date, confirmed: true })`. Then delete the review folder, preview included (see `evidence.md`),
   and confirm what was sent.
11. **Only if asked**: `complete_task_item` completes one subtask right away with its own real time
    and note (outside the report). Use it only when the employee wants that, one item at a time
    after a yes; the normal path is `completedItemIds` in the entry (step 4).

A generic "ok" or "hazlo y envíalo" given before the final version, or silence, is **not**
approval: still stop at every checkpoint. Never submit a report with worked entries whose
steps were not validated.

## One task

The report is **per task**: each assigned task/ticket is a row, and each answered row is an entry
with its own content, time, evidence, subtasks, technical detail, 24 h edit window and review. The
day only groups them. So when the employee asks for one task («reporta TAR-01A0D», «carga lo de
esta tarea», `/nexalink:reporte TAR-01A0D`, or the offer after `/nexalink:pr`), fill **only that
row** in today's report — don't walk every row of the day:

1. `get_report_status` (today; company timezone) and `get_daily_report({ date: today })`. Find the
   row of that code in `rows`, or in `available` if it isn't started yet (saving it as worked marks
   it started — say so). Not in either (not assigned to them, completed, or a draft) → say so and
   offer "Otro trabajo" instead. If the row already has a sent entry, say what's in it and that a change
   is only possible while it's `editable` (24 h); a closed entry can't be changed.
   **Which subtask** — a big task is often reported one subtask at a time. If the employee named
   one («/nexalink:reporte TAR-01A0D versión celular»), match it to the row's `items`. If they
   didn't and the task has 2+ open subtasks, ask once: «¿De cuál subtarea es? 1) … 2) … (o varias,
   o la tarea en general)». From here on, the text, steps, screenshots and time are about THAT
   subtask (or those).
   **Already an entry for this task today** (the row's `entry`, draft or sent) → it's the same
   entry (one per task per day): **add to it, never replace it**. Keep everything it has and add
   the new subtask's part: content «<lo de antes> · <lo nuevo>» rewritten to fit the 200 characters,
   minutes = previous + this subtask's, `completedItemIds`/`progressItemIds` = previous + the new
   ones (a subtask advanced in the morning and finished now moves to `completedItemIds`), steps and
   evidence appended, techRefs merged without repeats. The preview says «Ya tenías: … / Añado: …».
2. **Technical detail of that task, automatically** (→ `techRefs`, never evidence). Search by its
   code, in the current repo and any other the employee names:
   ```bash
   # commits of that task made today (company timezone); <email> = what `git config user.email` printed
   TZ=<tz> git log --all --author="<email>" --since="<date> 00:00" --until="<date> 23:59" \
     --grep="<TAR-XXXXX>" -i --date=iso-local --pretty='%H %ad %s'
   git branch -a --list "*<TAR-XXXXX>*" -i          # its branch (name carries the code)
   gh pr list --author @me --state all --search "<TAR-XXXXX>" --json number,title,url,headRefName,state
   ```
   Commits: only today's, as `COMMIT` links when the remote is on GitHub/GitLab (`<repo url>/commit/<sha>`),
   otherwise mention them in the text. Branch → `BRANCH`, PR → `PR` (even if opened another day: it's
   the trace of this work). Uncommitted work isn't technical detail. Show what you found and let
   the employee drop anything.
3. **Content** from what you already have in the session — the PR's «Qué cambia», the
   `/nexalink:revisar` verdict with its test steps and screenshots — plus `get_item_history` for
   that row so the text covers only today's progress. If there's no review, gather the steps and
   screenshots as in step 7 of the flow (reviewer subagent or by hand).
4. **Subtasks**: with one subtask chosen, ask «¿La terminaste hoy?»; otherwise list the row's open
   `items` and ask which ones were finished today → `completedItemIds`, and which ones were only
   advanced → `progressItemIds`. A task without subtasks: «¿La terminaste? Pasará a revisión» →
   `finished: true` on a yes. Test steps of each subtask
   carry its `itemId` (see `format.md` → «Several subtasks in one entry»): steps with their
   screenshots are HOW TO GET THERE per subtask, the entry's evidence is the general result.
5. **Time**: ask for THIS subtask's time; never guess. When adding to an existing entry, the entry's
   time is the sum — NexaLink then gives each finished subtask its own part (the one finished in the
   morning keeps its time; the new one gets the difference).
6. Same checkpoints as the full flow for that single entry: the validator (step 6 of the flow),
   preview `.md` with its screenshots, explicit approval, and nothing uploaded or saved until «súbelo». Save with
   `save_daily_report_draft` in merge mode **only with that entry** (key `TASK:<id>` / `TICKET:<id>`):
   the other rows stay as they are.
7. **Send**: if today's report was already sent, the save publishes the entry at once (ask «¿lo
   añado a tu reporte ya enviado? tu supervisor lo verá al momento»). If it wasn't, ask whether to
   send it now with only this entry — the other rows stay unanswered and can be added within 24 h
   of the first send — or keep it as a draft to finish the day later. Only on an explicit yes:
   `submit_daily_report({ date, confirmed: true })`.

## Sources of the day's work

Use either or both:

- **What the employee tells you** ("hoy hice…"). Condense it; show them the result.
- **git** (company timezone from `get_report_status`), in the current repo and in every other
  repo the employee names — always ask which other repos to check:
  ```bash
  # the day is the COMPANY's day: pass its timezone (from get_report_status) so git doesn't use yours
  git config user.email                   # run it alone first; use what it prints as <email>
  TZ=<company timezone, e.g. America/Chicago> git log --all --author="<email>" --since="<date> 00:00" --until="<date> 23:59" --date=iso-local --pretty='%H %ad %s'
  git branch -r --contains <sha>          # published? (remote branch)
  gh pr list --author @me --state all --search "updated:<date>" --json number,title,url,headRefName,state
  ```
**Whose commits?** `git config user.email` must be the employee's. If git shows another author
(shared machine, another account) or none of their commits, ask which email/author they commit
with instead of assuming; never report someone else's commits as theirs.

Git only sees code: **always ask** whether there was work without commits (meetings, support,
testing, reviews). Group by task/ticket or activity — never one entry per commit.
Only **commits and PRs** count as git evidence. Uncommitted changes (`git status`, `git diff`) are
not confirmed work: don't use them to propose rows or to write the text. If the employee says they
worked on something that isn't committed yet, report it from what they tell you, with no
technical detail.

**Links** — ask for them when useful and put each one in its place:
- Where the supervisor can **see the result** (the app screen in a test/staging environment, a
  shared document, a video) → `evidences` as `LINK`. Never `localhost`/`127.0.0.1` or a private
  IP: the supervisor can't open it — take a screenshot instead.
- **PR / commit / branch** → `techRefs` (`PR`, `COMMIT`, `BRANCH`).
- Other system traces (CI pipeline, deploy, issue in another tracker, design file) → `techRefs`
  with kind `OTHER` and a clear `label`.

## Rules

- **Simple Bash calls**: never `$(…)`, and don't mix non-git commands (`ls`, `grep`, `curl`…) into
  one call — Claude Code then asks the employee for permission every time. Chaining only git
  commands is fine.

- **One entry per task/ticket per day.** Several pieces of work or subtasks on the same task that
  day → one entry: the text names the subtasks advanced, time summed, all evidence, all PRs.
- **Don't repeat earlier days** (check `get_item_history`). Pending day → only that day's work.
- **"Otro trabajo"**: one entry per distinct activity (a meeting, a support call, a bug without
  ticket), with a clear title. Work on someone else's task → "Otro trabajo" mentioning its code
  in the title. Never create tasks; if it will go on for days, suggest asking their lead to create one.
- **Sent entries** can only be corrected during 24 h after each one was sent, and new entries can be added only during 24 h after the day was first sent. Leave entries with `locked: true` out of your saves; on `DAILY_REPORT_LOCKED` tell the employee which ones, don't retry.
- **Absence**: only when the employee says so, always with a reason (`absence: { reason }`).
- **Keys**: rows are `TASK:<itemId>` / `TICKET:<itemId>`; free work is `FREE:<clientKey>`. Use the
  keys of the latest response (`renamedKeys` maps new free entries to their stable key).
- **Technical detail only from the remote**: PR / commit / branch URLs that exist on the remote.
  No local hashes, file paths or unpublished branches. If work is not pushed, offer to push or
  open a PR; if not, save the entry without technical detail (it never blocks sending).
- The server blocks sending while there are `styleIssues` (text > 200 characters, PR/commit/branch
  used as evidence).

Details: `format.md` (limits, good/bad examples), `examples.md` (full reports),
`evidence.md` (screenshots, upload, technical detail), `review-checklist.md` (final review),
`preview.md` (the preview file the employee approves).
