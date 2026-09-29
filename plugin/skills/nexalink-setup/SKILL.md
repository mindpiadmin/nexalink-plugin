---
name: nexalink-setup
description: Prepare this computer for NexaLink: the tools the agent needs (git, the GitHub CLI and its login, Node/npx, the Playwright browser, curl) and the NexaLink connection. Use when the user asks to set up, prepare or configure their computer or agent for NexaLink ("prepara mi equipo para NexaLink", "configura NexaLink", "instala lo que falta"), or when another NexaLink skill finds missing tools.
---

# NexaLink setup

You prepare the employee's computer so the `nexalink-daily-report` skill can do its full job:
read the day's commits, link PRs, walk the test steps in a browser and take screenshots.
Talk to the employee in their language (usually Spanish). Keep it short and friendly: they
are a developer, but this is a chore, not the point of their day.

Nothing here is required to send a report except the NexaLink connection. Everything else
makes the report better. Say so, and never block on an optional tool.

## Hard rules

- **Ask before installing anything.** Show the list of what's missing first; install only
  what the employee approves. One approval per tool is enough.
- **Never run `sudo` or anything that asks for a password on your own.** When a command needs
  it, give it to the employee to run (in Claude Code they can type `! <command>` so the output
  lands in the chat).
- **Don't upgrade, remove or reconfigure** anything that already works. No global npm installs
  beyond what is listed here.
- **Never handle credentials.** Logins (`gh auth login`, authorizing NexaLink) are done by the
  employee in their browser. Never ask for, print or store a token.
- Only use the official source of each tool (the OS package manager or the vendor's site).
- **One plain command per call** for the checks (`git --version`, then `gh --version`…): no `$(…)`,
  variables, loops or `;`/`&&`/`||` chains. Claude Code approves a simple read-only command on its
  own, but asks the employee about every compound one, so a chained check turns into a string of
  permission prompts.

## 1. Detect the system

Find the OS and the package manager with read-only commands:

- macOS: `uname -s` → `Darwin`; package manager `brew` (`brew --version`).
- Windows: PowerShell, `$env:OS` → `Windows_NT`; package manager `winget` (`winget --version`).
- Linux: `uname -s` → `Linux`; read `/etc/os-release`; package manager `apt`, `dnf` or `pacman`.
- Windows with Git Bash / MSYS: `uname -s` → `MINGW64_NT…` or `MSYS_NT…`. It's Windows: use
  `winget` (as `winget.exe` if needed) and Windows paths.
- WSL: `uname -s` → `Linux` and `/proc/version` mentions `microsoft`. It's Linux inside Windows:
  install **inside WSL** (apt), because that's where the agent runs; tools installed on the
  Windows side aren't visible here. Say it once so the employee isn't surprised.

Always install for the environment where **you** (the agent) are running, not where the
employee's browser is.

If there's no package manager (e.g. macOS without Homebrew), don't install one silently: explain
it and point to https://brew.sh, or give the vendor download link for each tool instead.

## 2. Check everything (read-only)

| Check | Command | What it's for |
|---|---|---|
| NexaLink connection | the NexaLink MCP tools are available and `get_report_status` answers | Reading and saving the report (**required**) |
| git | `git --version` | Reading the day's commits |
| GitHub CLI | `gh --version` | Linking PRs and commits in "Detalle técnico" |
| GitHub login | `gh auth status` | `gh` can see the work repositories |
| Node / npx | `node --version`, `npx --version` | Runs the Playwright MCP |
| Playwright MCP | the `browser_*` tools are available | Walking the test steps and taking screenshots |
| Playwright browser | open a page with the `browser_*` tools (`browser_navigate` to `about:blank`); "is not installed" / "not found" means it's missing | The browser Playwright drives |
| curl | `curl --version` | Uploading screenshots |
| `Refs:` in every commit (inside a work repository) | `git rev-parse --git-path hooks/prepare-commit-msg` is the hook git really runs (it honours `core.hooksPath`, even a global one); ready if that file contains `NexaLink · prepare-commit-msg` | Commits made from the IDE or by hand still cite the branch's task, so the daily report finds them |
| Clickable codes on GitHub (inside a GitHub repository, `gh` logged in) | `gh api repos/{owner}/{repo}/autolinks` lists a `TAR-` and a `TK-` prefix | Every TAR-/TK- code in commits and PRs links to NexaLink (needs a repository admin) |
| Plugin updates (Claude Code with the plugin) | read `extraKnownMarketplaces.nexalink.autoUpdate` in the user settings (`$CLAUDE_CONFIG_DIR/settings.json`, else `~/.claude/settings.json`); if it isn't set, `nexalink.autoUpdate` in `plugins/known_marketplaces.json` of the same folder. Off unless one says `true` | Improvements to the skills arrive on their own (off by default for any marketplace that isn't Anthropic's) |

Then show one short table to the employee: ✅ ready / ⚠️ missing, and one line on what each
missing one adds. When something is missing, END that reply by offering to install it, numbered,
and asking which ones (suggest "todo lo que falta") — never close the check with just the table.
Optional things are still offered; only say they're optional.

## 3. Install what was approved

Use the package manager you found. If a command fails, show the error in one line and move on
to the next tool; don't retry in a loop.

| Tool | macOS (brew) | Windows (winget) | Linux |
|---|---|---|---|
| git | `brew install git` | `winget install --id Git.Git -e` | `sudo apt install git` / `sudo dnf install git` / `sudo pacman -S git` |
| GitHub CLI | `brew install gh` | `winget install --id GitHub.cli -e` | `sudo dnf install gh` / `sudo pacman -S github-cli`; on Debian/Ubuntu follow https://github.com/cli/cli/blob/trunk/docs/install_linux.md |
| Node.js (LTS) | `brew install node` | `winget install --id OpenJS.NodeJS.LTS -e` | the distro's `nodejs` + `npm` packages, or https://nodejs.org |
| curl | already on macOS | already on Windows 10+ | `sudo apt install curl` / `sudo dnf install curl` |
| Playwright browser | `npx -y @playwright/mcp@0.0.82 install-browser chrome-for-testing` | `npx -y @playwright/mcp@0.0.82 install-browser chrome-for-testing` | `npx -y @playwright/mcp@0.0.82 install-browser chrome-for-testing`; if it then fails for missing system libraries: `sudo npx -y playwright install-deps chromium` (give it to the employee) |

Linux commands with `sudo` are for the employee to run. After a Windows install, a new terminal
may be needed for the command to be found: say so.

**Plugin updates** (Claude Code only): with the employee's OK, set `"autoUpdate": true` next to
`source` in `extraKnownMarketplaces.nexalink` of the user settings file you read; change nothing
else there. If that entry doesn't exist, the employee turns it on in Claude Code: `/plugin` →
Marketplaces → nexalink → «Enable auto-update». It applies from the next launch; until then
`claude plugin update nexalink@nexalink` updates by hand.

**`Refs:` in every commit** (per repository, inside it): the hook `prepare-commit-msg` in this
skill's folder (`${CLAUDE_SKILL_DIR}/git-hooks/prepare-commit-msg`) adds `Refs: TAR-XXXXX` when the
branch cites a task or ticket and the message doesn't; it skips merges and squashes and does
nothing on branches without a code. Install it where git really looks
(`git rev-parse --git-path hooks`):
- That folder is inside `.git/` and has no `prepare-commit-msg` → copy it there and `chmod +x` it.
- A `prepare-commit-msg` already exists (not ours) → never overwrite it: copy ours next to it as
  `prepare-commit-msg.nexalink` (`chmod +x`) and, with their OK, add one line at the end of theirs:
  `"$(dirname "$0")/prepare-commit-msg.nexalink" "$@"`.
- The folder is outside the repository (a global `core.hooksPath`) → it applies to every repository
  on the computer. Say so; it's harmless elsewhere (no code in the branch, nothing happens), so
  install it there if they agree, same rules.
- The repository manages its hooks with husky (`.husky/`), lefthook (`lefthook.yml`) or pre-commit
  (`.pre-commit-config.yaml`) → adding it there changes the team's repository (a file to commit).
  Explain it and do it only if they want; otherwise skip it.
Already ours (contains `NexaLink · prepare-commit-msg`) and different → replace it with the new one.
Claude Code treats `.git/hooks/` as a protected folder: before copying, tell the employee it will ask
for permission to write there. If that write is refused, don't look for another way: give them the
one command to run themselves (`! cp "<skill folder>/git-hooks/prepare-commit-msg" "<hooks
folder>/prepare-commit-msg" && chmod +x "<hooks folder>/prepare-commit-msg"`, with the real paths)
and check it afterwards.

**Clickable codes on GitHub** (per repository; needs a repository admin): the NexaLink address is
the origin of any link the NexaLink tools return (e.g. `testEnvironmentsUrl` in `get_work_context`).
With their OK run, inside the repository:
```
gh api repos/{owner}/{repo}/autolinks -f key_prefix='TAR-' -f url_template='<NexaLink>/interno/r/TAR-<num>' -F is_alphanumeric=true
gh api repos/{owner}/{repo}/autolinks -f key_prefix='TK-' -f url_template='<NexaLink>/interno/r/TK-<num>' -F is_alphanumeric=true
```
A 403/404 means they aren't admin: give them both commands for whoever administers the repository.

**Desktop notice** (Claude Code with the plugin, optional): a system notification when the agent is
waiting for their answer or their «sí» — handy while it tests in the browser. They turn it on in
`/config` → «Aviso de escritorio» (off by default). Offer it in one line; don't change it yourself.

**Playwright MCP** (only if the `browser_*` tools are missing):
- Claude Code with the NexaLink plugin: it's already in the plugin; after installing Node,
  `/reload-plugins` is enough.
- Claude Code without the plugin: `claude mcp add --scope user playwright -- npx @playwright/mcp@0.0.82 --browser chromium --output-dir /tmp/nexalink --file-paths absolute`
  (Windows: `--output-dir "%TEMP%\nexalink"` in cmd, `"$env:TEMP\nexalink"` in PowerShell).
- Codex: `codex mcp add playwright -- npx @playwright/mcp@0.0.82 --browser chromium --output-dir /tmp/nexalink --file-paths absolute` (same Windows note).

Always with `--browser chromium`: without it the MCP looks for Google Chrome installed in the system
(`/opt/google/chrome`, "Chromium distribution 'chrome' is not found") and the reviewer can't open
the browser. And with `--output-dir`: it is the only folder outside the repo where the browser may
save screenshots (the skills keep all their evidence under `/tmp/nexalink/`); without it the
browser writes `.playwright-mcp/` into the repo.

## 4. Logins the employee does

- **GitHub**: ask them to run `gh auth login` (Claude Code: `! gh auth login`) and choose
  GitHub.com → HTTPS → "Login with a web browser". Then check `gh auth status`. If they're inside
  a work repository, confirm access with `gh repo view --json name`.
- **NexaLink** (if the connection isn't working):
  - Claude Code: `/reload-plugins`, then `/mcp` → `plugin:nexalink:nexalink` (or `nexalink`) →
    Authenticate, and approve in the NexaLink page that opens.
  - Codex: `codex mcp login nexalink`.
  - Not connected at all: NexaLink → **Agentes** → "Conectar un agente" has the steps.

Some changes (a new MCP server, a new login) need `/reload-plugins` or a restart of the agent
to take effect. Say it when it applies.

## 5. Finish

Run the checks from step 2 again and show the final table. If everything is ready, say what they
can do now — `/nexalink:ayuda` lists the commands of their role (a supervisor starts with
`/nexalink:equipo`, an employee with `/nexalink:hoy` or "haz mi reporte diario"). If something
optional is still missing, say what they will lack without it, in one line.
