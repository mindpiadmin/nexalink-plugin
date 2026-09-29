# Final review (before asking for approval and sending)

Mandatory, after drafting and before approval/sending. No reviewer subagent installed? Do the same
6 points yourself. No browser automation? Ask the employee for the screenshots and mark the steps
"not verified" until they confirm they tested them. The checking work (browser + git) is done by
the **`nexalink-report-reviewer`** subagent so its large context stays out of this conversation.

## How to run it

1. Ask the employee (Checkpoint 3): base URL of a **local or test** environment (propose the
   entries' «Dónde probarlo»), and whether anything must not be touched. If the address is a
   company test environment, the reviewer logs in by itself with `get_test_access`; only
   otherwise the employee signs in in the browser window (never ask for their password).
   Production only with explicit permission, and there it only looks (nexalink-qa rules).
2. Launch the subagent with: the draft entries (key, title, text, test steps, techRefs, evidence),
   the report date and company timezone, the base URL (never a password), the repos to check,
   the list of subtasks of each task and the `completedItemIds` of each entry. Ask it to save screenshots in `/tmp/nexalink/review/<date>/`.
3. It returns only a report per entry:
   `[{ key, checks: [{ item, ok, detail }], suggestedFixes: [...], screenshots: [paths], stepScreenshots: [{ step, path }] }]`
   (`stepScreenshots` only for steps whose place on screen isn't obvious; you may offer them as step images).
4. Show the employee a readable summary: what is fine and what needs fixing, per entry, plus the
   screenshots. Apply fixes only with their OK, save, and review again what changed.

Do not send until the review is clean or the employee has explicitly accepted each open point.
The review prepares the decision; the employee decides.

## The 6 points, per entry

1. **Steps** — walked in the browser and each one works; complete (a step that was needed but not
   written → propose adding it; an unnecessary one → propose removing it); understandable without
   technical knowledge. Steps with real effects (real payment, email to customers, deleting real data)
   are **not executed**: marked "not verified", the employee must confirm they tested them.
2. **Text** — ≤ 2 sentences and ≤ 200 characters, business language, and faithful to what was
   seen: never "done/works" if the check showed something pending or broken.
3. **Technical detail** — every link exists on the remote (`gh`/HTTP 200), the PR/commits/branch are
   the employee's, dated that day (a PR: activity that day), and related to that task/ticket
   (mention its code or title, or the employee confirms). Remove what fails.
4. **Evidence** — shows the result of *that* entry; no passwords, tokens or personal data.
5. **Times** — given by the employee. Flag a day total > 12 h, or an entry with no commits and no
   evidence backing it, for the employee to confirm.
6. **Coherence** — does not repeat what was reported on earlier days; not-worked rows have a reason;
   subtasks named in the text exist in that task; the subtasks in `completedItemIds` are really
   finished (what was seen agrees) and the text doesn't call done a subtask that isn't there;
   "Otro trabajo" has a clear title; no `LINK` evidence points at localhost or a private address.

Results outside the browser (email, downloaded file): the reviewer checks up to where the browser
reaches, and you ask the employee for that screenshot.
