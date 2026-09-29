# Evidence and technical detail

## Visual evidence (what the supervisor sees)

Every worked entry needs at least one:

- **Screenshot or short video of the result** (preferred). Taken by the `nexalink-report-reviewer`
  subagent with Playwright while it walks the test steps, or provided by the employee.
- **LINK to where the result can be seen**: a page of the app, a shared document, a Loom/Drive video.

Never use a PR, commit, branch or pipeline link as evidence — those go in `techRefs`.

No screen (background job, report, email, generated file)? Show its **effect**: a screenshot of the
data now correct, of the generated file, of the email received. If the browser can't reach it
(email inbox, downloaded file), ask the employee for that screenshot. If nothing can be shown, save
the draft anyway: the server lists `DAILY_REPORT_EVIDENCE_REQUIRED` in `pendingIssues` and the
report cannot be sent until the employee provides evidence. Never invent evidence.

### Screenshot rules

- Only in the environment the employee named (local/test). Production only with explicit permission.
- No real effects: no real payments, no emails to customers, no deleting/modifying real data.
- No passwords, tokens, API keys or personal data visible. Retake or crop, or discard.
- The employee sees every screenshot **before** it is uploaded.
- **Clean up**: screenshots (and the preview) may show client data. When the report is saved (or
  the employee drops it), delete the local copies: `rm -rf /tmp/nexalink/review/<date>` (Windows:
  `Remove-Item -Recurse -Force "$env:TEMP\nexalink\review\<date>"`). Say that you did it.

### Upload

Ask the MCP for an upload link with `get_upload_link` (valid 15 min, reusable in that time) and
send the file to it with curl — no token needed, the link is signed for this connection:

```bash
curl -sS -X POST -F "file=@/tmp/nexalink/review/pedido-pagado.png" "<uploadUrl>"
# → {"fileUrl":"/uploads/1727…-pedido-pagado.png","fileName":"pedido-pagado.png","mimeType":"image/png","sizeBytes":123456}
```

One image or video per call, ≤ 50 MB. Errors: `DAILY_REPORT_EVIDENCE_INVALID` (not image/video),
`FILE_TOO_LARGE`, `RATE_LIMITED`, `UPLOAD_LINK_INVALID` (expired: ask for a new link). Then use it in the entry:

```json
{ "kind": "FILE", "fileUrl": "/uploads/1727…-pedido-pagado.png", "fileName": "pedido-pagado.png", "mimeType": "image/png" }
```

### Step screenshots (optional)

The entry evidence shows the RESULT. Each test step can also carry its own screenshot showing how
to get there: `"testSteps": [{ "text": "Entrar a Novedades", "image": "/uploads/…-paso1.png" }, "Elegir un proyecto"]`.
Upload each one the same way (images only). Same rules as any screenshot: the employee sees it
first, no credentials or personal data. They're optional and never replace the evidence.

## Technical detail (`techRefs`, internal audit)

`[{ "kind": "PR" | "COMMIT" | "BRANCH" | "OTHER", "url": "https://…", "label": "…" }]`, max 20.

Only URLs that exist on the remote and belong to that task/ticket, by the employee, dated that day
(or, for a PR, with activity that day):

```bash
# commits of the day by the employee (company timezone)
TZ=America/Chicago git log --all --author="$(git config user.email)" --since="2026-09-24 00:00" --until="2026-09-24 23:59" --pretty='%H %s'
# is the commit published?
git branch -r --contains <sha>
# remote URL → https://github.com/<owner>/<repo>
gh repo view --json url -q .url
# PRs of the employee touched that day
gh pr list --author @me --state all --search "updated:2026-09-24" --json number,title,url,headRefName
# a commit URL: <repo-url>/commit/<sha> ; a branch URL: <repo-url>/tree/<branch>
```

Never local-only hashes, file paths or unpublished branches. Not pushed → offer to push/open a PR;
otherwise save without technical detail (it never blocks sending).
