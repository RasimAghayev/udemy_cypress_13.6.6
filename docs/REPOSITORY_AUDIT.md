# Repository audit

Performed 2026-11-04 (Phase 3, `auditor`, docs-only — no code changed in this phase). Backup: see `projects/info/backups/` (created in the already-completed Phase 1/2 pass; not re-created here, no risk — read-only phase). Working clone: `projects/repos/udemy_cypress_13.6.6/` (on `master`, clean, up to date with `origin/master`). Dependency/vulnerability/CI-version findings already captured in `projects/info/deps/udemy_cypress_13.6.6.md` (Phase 2) are cited, not repeated in full.

## How each finding below was verified

No Docker container needed for this phase (reading tracked files, `git log`, and running host-side `grep`/`git` against the already-cloned working tree only — no install, no build, no execution of the suite itself, consistent with "docs only, no code changes"):

```bash
git status / git log --oneline -20 / git branch -a / git remote -v
git ls-files | sort                              # tracked-file inventory
grep -rn <selector/pattern> cypress/ --include=*.js
git log --format=%ad --date=short -- cypress/reports | sort -u
git log --all -p -- package.json | grep -c "dashboard:cy"   # secret-recurrence count only, no value printed
grep -rnE "(api[_-]?key|secret|password|token|AKIA...|BEGIN ... PRIVATE KEY|ghp_...|xox[baprs]-)" . --include=*.js --include=*.json --include=*.yml --include=*.txt
which gitleaks   # not installed on this host — manual pattern scan used instead, see Secret scan below
```

## Secret scan (redacted — locations only, values withheld)

- `which gitleaks` → not found on this host; no project-local gitleaks binary either. Fell back to a manual regex sweep (pattern above) across all tracked `.js`/`.json`/`.yml`/`.txt` files.
- **Confirmed (already reported by Phase 2, re-verified here): `package.json:14`.** The `dashboard:cy` script passes a literal Cypress Cloud record-key-shaped value as a `--key` CLI flag instead of reading `CYPRESS_RECORD_KEY` from the environment — the pattern the same repo's own `.github/workflows/cypress.yml:31` already uses correctly. Treated as **compromised**; rotation already requested of Rasim by the orchestrator per the Phase 2 handoff. Re-confirmed here that it is **not a one-off**: `git log --all -p -- package.json | grep -c "dashboard:cy"` → the line recurs across **4 commits** in this repo's history, meaning the value (whatever it was at each point) has been committed to git history multiple times, not just once. This raises the stakes on a Phase 4 history-audit decision (purging it from history is a **Gate 1** action, not something to decide here).
- `cypress/fixtures/Login.json:7` — contains a JWT. Decoded payload matches the well-known public jwt.io documentation example (`sub: "1234567890"`, `name: "John Doe"`) used verbatim as mock-fixture data for an `cy.intercept` stub, not a live credential. Flagged as a practice smell only (a real-looking token in a fixture reads as a secret to automated scanners and to a human skimming the repo) — no rotation needed, no action taken.
- Plaintext demo credentials (`cypressdemo@gmail.com` / `cypressdemo`, `admin123`) appear inline across ~10 spec files and in `cypress/fixtures/conduitLoginData.json`. These are credentials for the two **public, intentionally-open demo sandboxes** the course uses (`react-redux.realworld.io`, `opensource-demo.orangehrmlive.com`) — not production secrets, not treated as compromised. Still a consistency smell: some specs read credentials from a fixture/custom-command, others hardcode them directly in the spec body (see `docs/TECHNICAL_DEBT.md`).
- No `.npmrc`/`.yarnrc*`/`auth.json` (confirms Phase 2). No `.env`/`.env.*` tracked (confirms Phase 2). No AWS-key-shaped (`AKIA...`), GitHub-PAT-shaped (`ghp_...`), Slack-token-shaped (`xox...`), or PEM private-key-shaped strings found anywhere in the tracked tree.

## Key finding — one spec is a confirmed, historically-failing test, hidden inside a stale committed report

`cypress/e2e/Tc01_FirstScript.spec.cy.js:6` has a selector typo: `cy.get('a[href="#logisn"')` — **`#logisn`, not `#login`** (also missing the selector's closing `]`, a second, separate defect in the same line). This is not a guess: the repo's own committed `cypress/reports/mocha/mochawesome.json` / `cypress/reports/mochareports/report.json` (dated **2024-04-07**, i.e. generated almost 2.5 years ago and never refreshed since) record this exact test as `"state": "failed"`, with the failing code block quoted verbatim in the report and a matching committed failure screenshot at `cypress/reports/mochareports/assets/Tc01_FirstScript.spec.cy.js/Login functionality -- Login Test using Conduit (failed).png`. **The very first lesson's test has been broken since at least April 2024 and the broken result was committed to the repo instead of fixed or excluded.**

A second committed failure screenshot — `.../Tc04_DropDown.spec.cy.js/Dropdown Functionality -- Handling dynamic dropdown (failed).png` — corresponds to `Tc04_DropDown.spec.cy.js`'s "Handling dynamic dropdown" test, which drives a third-party Telerik demo page (`demos.telerik.com/aspnet-ajax/dropdownlist/...`) outside this project's control; markup drift on that external page over 2+ years is the likely cause, but this was not independently re-run in this phase (would require executing the suite, out of scope for a docs-only audit — flagged for Phase 5's baseline run).

Neither failure was found by "running the tests" (not done in this read-only phase) — both were found by actually reading the committed report JSON/screenshots, consistent with the audit discipline of verifying from real artifacts rather than assuming a test file passing means the test passes.

## Second finding — a real (if minor) runtime bug in the one Node-side plugin

`cypress/plugins/read-xlsx.js:3`: `const read = ({ file, sheet = Sheet1 }) => {` — the default value `Sheet1` is an **unquoted bare identifier**, not the string literal `"Sheet1"`. Since nothing in this file or its caller defines a `Sheet1` variable/global, calling `read()` without an explicit `sheet` property would throw `ReferenceError: Sheet1 is not defined` at the parameter-default-evaluation step, before the function body even runs. Currently latent (`Tc13_ReadExcel.spec.cy.js` always passes `sheet: "Sheet1"` explicitly), but a real defect in the plugin's own contract — the default simply does not work. See `docs/TECHNICAL_DEBT.md`.

## Third finding — 22 generated report files and 2 stray scratch files, all committed

- `cypress/reports/mocha/*.json` (18 files: `mochawesome.json` + `mochawesome_001.json`…`_017.json`) and `cypress/reports/mochareports/` (`report.html`, `report.json`, 2 failure-screenshot PNGs) — **22 files, 392 KB total, all committed on 2024-04-07/2024-04-08** (confirmed via `git log --format=%ad -- cypress/reports`) and never touched again. These are `mochawesome`/`mochawesome-merge`/`mochawesome-report-generator` *output*, regenerated fresh by every real test run (`npm run post-test`) — committing them makes the repo carry a permanently stale, misleading snapshot of one run from 2.5 years ago (including the two now-ambiguous failures above) instead of treating reports as build artifacts. `.gitignore` only excludes `/node_modules` — it was never extended to cover `cypress/reports/` or `cypress/videos`/`cypress/screenshots` (the latter two don't currently exist in the tree, but would hit the same gap the moment someone runs the suite with `video: true` or a failure outside the configured `screenshotsFolder`). Confirms and quantifies the Phase 2 deps-file's "22 committed generated report files" out-of-scope note. Candidate for Phase 7 (dead code / generated-artifact removal) — not deleted here.
- `command.txt` (repo root) — plain-text scratch notes: a literal shell history of `npm i -D ...` / `docker run ...` commands used while building the course. Not required by, or referenced from, any script, CI step, or doc. Confirms the Phase 2 note; candidate for Phase 7.
- `newFile.js` (repo root) — an abandoned draft of `cypress.config.js`. Not imported, required, or referenced anywhere (`grep -rn newFile` across the tracked tree returns only the file's own `git ls-files` entry). It is also internally broken: its `screenshotsFolder` value is `"cypress\reportsmochareportsassets"` — written as a plain (non-raw) JS string with single backslashes before `r`, `m`, `a`, which silently collapse during JS string parsing (no `\r`/`\m`/`\a` escape exists, so each becomes just the bare letter) — producing a nonsensical concatenated path. This is independent, additional confirmation that the file is a stale, never-executed draft, not working configuration. Candidate for Phase 7.

## Fourth finding — real duplication, not coincidental similarity

`cypress/e2e/Tc15_CustomCommand.spec.cy.js` and `cypress/e2e/Tc15.1_CustomCommand.spec.cy.js` have an identical test body (same `describe`, same two `it`s, same assertions calling `cy.conduItLogin`). The only difference is that `Tc15.1` carries an extra commented-out `Cypress.config({...})` block at the top. This reads as a lesson "before/after" pair where both the before-edit and after-edit versions of the file were committed, rather than one being removed. Candidate for Phase 7.

## Fifth finding — debug-only test markers committed

`cypress/e2e/Tc05_Alert.spec.cy.js` uses `it.only(...)` on **all four** of its test cases. `.only` is a Mocha/Cypress debugging aid meant to be temporary (run just this test while iterating); having it on every test in the file achieves nothing functionally (all four still run) but is a leftover smell indicating the file was never cleaned up after local debugging. Flag for Phase 7.

## Sixth finding — a likely-broken assertion that doesn't test what it claims to

`cypress/e2e/Tc19_Mock.spec.cy.js:27`, the "Login User Mock" test: `cy.get('a[href^=#@"]').should('contain','Rasim-Aghayev-Udemy')`. The selector `a[href^=#@"]` is not valid CSS attribute-selector syntax (`^=` must be followed by a quoted or unquoted value per spec, `#@"` is neither — it looks like a typo merging two different intended selectors). Whether this throws a Cypress selector-parse error or silently matches nothing was not verified by execution in this phase (would require running the suite); flagged for Phase 5's baseline run to confirm actual behavior, and for Phase 7/11 to fix or document.

## Other observations

- Default branch is `master`, not `main` — same Gate #4 candidate noted for other repos in this program (confirmed via `git branch -a` / `git remote -v`; `origin/HEAD -> origin/master`).
- 15 branches beyond `master` exist on `origin`: 10 course-section snapshot branches (`sc5`…`sc18`, non-contiguous — `sc5`-`sc18` with gaps), and 3 open Renovate branches (`renovate/cypress-16.x-lockfile`, `renovate/cypress-io-github-action-7.x`, `renovate/cypress-multi-reporters-2.x-lockfile`). No in-repo `renovate.json`/`.github/dependabot.yml` was found — these branches were produced by an externally-configured Renovate/Mend GitHub App, not a committed config file. Per-branch merged-vs-unmerged status against `master` was not individually checked in this phase (git hygiene is Phase 4's job, not this one) — listed here for Phase 4 to triage, not triaged here.
- `cypress/e2e/Tc12_FicturesTest.cpec.cy.js` — two typos in one filename: "Fictures" (→ Fixtures) and the extension `.cpec.cy.js` (→ `.spec.cy.js`). Whether Cypress's default spec glob (`**/*.cy.js`) still picks this file up despite the `.cpec` segment was not verified by running the suite in this phase — it ends in `.cy.js` so it likely is collected, but this needs confirmation in Phase 5's baseline run, not assumed.
- No root `engines` field in `package.json`, no `.nvmrc` — confirms Phase 2; `cypress@16.2.1`'s own `engines.node: "^22.0.0 || ^24.0.0 || >=26.0.0"` constraint is enforced nowhere in this repo's own config.
- No `LICENSE` file in the repo despite `package.json` declaring `"license": "ISC"` — the declared license has no accompanying license text.
- `README.md` is the Udemy course's lecture-by-lecture table of contents (copied from the course platform), not project documentation — no setup instructions, no "how to run the tests" section, no architecture description. Expected for this kind of repo, but a real gap if anyone other than the course author needs to onboard onto it.
- `.gitignore` is a single line (`/node_modules`) — no coverage of `cypress/reports/`, `cypress/videos/`, `cypress/screenshots/`, `.env*`, OS/editor files (`.DS_Store`, `Thumbs.db`), or `*.log`.
- `docker-compose.yml` sets both `image: cypress` and `build: .` on the same service — Compose will build the local Dockerfile and tag the result `cypress`; the `image:` key does nothing meaningful here (it doesn't pull a pre-built image, there's no registry push). Confusing/redundant, not a functional bug. Confirms Phase 2's note.
- All vulnerability, licence, dependency-currency, and CI-action-version findings are in `projects/info/deps/udemy_cypress_13.6.6.md` (Phase 2) — not re-verified or repeated in full here; cited directly in `docs/TECHNICAL_DEBT.md` below.

## No code changed

This phase is docs-only per its mandate. No branch was created, no commit was made, no file inside the repo other than the four new `docs/*.md` files was touched, no PR was opened, no dependency was installed or upgraded, no test was executed.

---

## Phase 7 reconciliation (added 2026-11-11, `cleaner`)

Every "candidate for Phase 7" item raised in this audit has been resolved below. The
original findings are preserved verbatim above for the audit trail; this section records
what happened to each and where the evidence lives.

| Audit finding | Resolution (Phase 7) |
|---|---|
| 22 committed generated report files (line 41) | **Deleted** in commit `2c35ab5` (`refactor: remove stale committed Cypress test reports`), 22 files / 2278 lines. `.gitignore` already covered `cypress/reports/` by this point (hardened in Phase 4), so nothing regenerates into tracking. |
| `command.txt` scratch notes (line 42) | **Deleted** in commit `f89743e` (`refactor: remove unreferenced scratch files`), alongside `newFile.js`. Zero references across the tracked tree (verified by scan, not assumed). |
| `newFile.js` broken draft of `cypress.config.js` (line 43) | **Deleted** in `f89743e`. Its `screenshotsFolder` backslash-collapse bug is moot once the file is gone. |
| `Tc15.1_CustomCommand.spec.cy.js` duplicate of `Tc15_CustomCommand.spec.cy.js` (line 47) | **Deleted** in commit `3112114` (`refactor: remove duplicate Tc15.1 spec and it.only debug markers`). Surviving `Tc15` is the course's final version; the deleted copy added only a commented-out `Cypress.config({...})` block. Confirmed by content comparison, not by name. |
| `it.only(...)` on all 4 tests in `Tc05_Alert.spec.cy.js` (line 51) | **Removed** in `3112114` — 4 `it.only` → `it`. All four tests still run (they ran before too; `.only` across a whole file is a no-op, but the marker is gone). |
| `Tc12_FicturesTest.cpec.cy.js` filename typos (line 61) | **Renamed** in commit `23cc42c` (`refactor: rename typo'd Tc12 spec to correct .spec.cy.js name`) to `Tc12_FixturesTest.spec.cy.js`. Baseline (`docs/BASELINE.md`) already confirmed the `.cpec.cy.js` file *was* collected by Cypress's glob, so the rename is behavior-neutral for the run and fixes the collection smell. |
| `read-xlsx.js` `sheet = Sheet1` bare identifier (line 37) | **Fixed** in commit `85b2900` (`refactor: remove unused fixtures and fix read-xlsx default param`) → `sheet = "Sheet1"`. Closes `TECHNICAL_DEBT.md` #4. |
| `xlsx` → `@e965/xlsx` incomplete migration (carried from Phase 6, `dc2de0d`) | **Completed** in commit `68781cb` (`refactor: complete the xlsx -> @e965/xlsx migration in the plugin require`): `require("xlsx")` → `require("@e965/xlsx")`. The old form aborted the entire suite at `setupNodeEvents` ("Cannot find module 'xlsx'") in any clean `npm ci` build; masked locally only by a stale, lockfile-absent `node_modules/xlsx@0.18.5` directory. Verified the `@e965/xlsx` export shape is the same SheetJS API before re-shaping. Closes `TECHNICAL_DEBT.md` #2 (migration note). |
| `scan.ps1` accidental commit (not in this audit, found during Phase 7) | **Deleted** in commit `7f9d293` (`refactor: remove scratch scan script`). It had been committed by `23cc42c` alongside the Tc12 rename and removed in the very next commit — a transient, never-referenced file. |
| Unused fixtures `example.json` / `profile.json` / `users.json` (not in this audit, found during Phase 7) | **Deleted** in commit `85b2900`. Zero references across the tracked tree (verified by scan, not assumed); the `example`/`profile`/`users` substring matches elsewhere were comments and URL substrings, not references. |
| Dead `"main": "index.js"` in `package.json` (knip "package entry not found") | **Removed** in the same cleanup commit. No `index.js` exists at the repo root and nothing resolves the package by its `main` (this is a test-tooling repo with no library entry point). |
| Stray `command.txt` / `newFile.js` lines in `.dockerignore` | **Removed** in the same cleanup commit — the file was still listing two deleted scratch files as build-context exclusions. |
