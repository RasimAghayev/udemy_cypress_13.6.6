# Improvement roadmap

Written 2026-11-04 (Phase 3). Reflects findings in `docs/REPOSITORY_AUDIT.md` / `docs/TECHNICAL_DEBT.md`. The full Phase 4–11 per-repo plan (what each phase concretely does here, what's `n/a`, risks, and where every CLAUDE.md standing decision lands) lives in `projects/info/analysis/udemy_cypress_13.6.6.md` — this file is the short, repo-local pointer + priority ordering; that file is the one the Orchestrator presents for Gate 10 approval.

## Classification

`REPOS_INDEX.md` lists this repo as a `module` (not `small-candidate`). Confirmed appropriate after reading the actual code: it's a self-contained Udemy course artifact — 19 specs, 4 page objects, fixtures, a Docker wrapper, and one CI workflow, ~1875 lines by the index's own count. It has no consumer (nothing else in `RasimAghayev`'s repos references it) and is not meant to be imported as a library. Whether it stays its own repo, gets archived, or is folded into a "courses"/"portfolio" umbrella is outside Phase 3's scope (Gate #3 territory if merging is ever considered) — not addressed here.

## Recommended order (highest priority first)

1. **Rotate the Cypress Cloud record key** (`docs/TECHNICAL_DEBT.md` #1) — already requested of Rasim via the Phase 2 handoff; re-flagged here because this phase independently re-confirmed it recurs across 4 commits in history. Nothing else below blocks on this, but it should not wait for Phase 4-11 to complete.
2. **Phase 4 git hygiene** — triage the 15 non-`master` branches (10 `sc*` snapshots + 3 Renovate), rename `master`→`main` (Gate 4), harden `.gitignore` (#20), add a secret-scan pre-commit hook.
3. **Phase 5 container baseline** — actually run the 19 specs in Docker for the first time in this audit process and record real, current pass/fail results in `docs/BASELINE.md` (not the stale 2024-04-07 numbers cited in this audit) — this is what turns the Tc01/Tc04/Tc19 suspicions in `docs/TECHNICAL_DEBT.md` from "flagged from a 2.5-year-old report" into "confirmed today."
4. **Phase 6 upgrades** — cypress/cypress-multi-reporters lockfile refresh, `neat-csv` major bump (#14), `cypress-xpath` deprecation migration (#6), Docker base image re-pin (#7), CI action version bumps (#16 first half).
5. **Phase 7 cleanup** — delete the 22 stale report files + `command.txt` + `newFile.js` (#8-10), resolve the `Tc15`/`Tc15.1` duplicate (#11), strip the committed `.only` markers (#12), fix the `read-xlsx.js` default-parameter bug (#4), and — pending the Orchestrator's scope call flagged in the Phase 3 plan — fix or document the two likely-broken specs (#3, #5).
6. **Phase 8 architecture** — judgment call only on the DRY/login-duplication question (#13); everything else (SOLID/Clean-Hexagonal/DDD/EDA/Modular-monolith) is `n/a` for this repo, documented with a one-line reason each in the Phase 3 plan.
7. **Phase 9 hardening** — the `xlsx` unfixed-HIGH-vulnerability accept/replace decision (#2), the record-key env-var fix (code side of #1), the other 8 Phase-2-flagged `npm audit` findings (non-breaking fixes available for all but the `glob`/`minimatch` one, which needs manual resolution, not `--force`), add gitleaks/secret-scan tooling.
8. **Phase 10 CI/CD** — SHA-pin actions, add explicit `setup-node`, add a `pull_request` trigger (currently `push`-only, so forked-PR contributions wouldn't get CI feedback before merge), add lint/secret-scan stage, add job timeouts, measure and record a real run's duration.
9. **Phase 11 tests** — per R8, the tester does not fix the pre-existing broken specs; it documents them against the Phase 5 baseline in `docs/TEST_REPORT.md` and hands any still-unfixed defect back to the Orchestrator.

## Not planned

- **Consolidating all 19 specs onto one test-authoring pattern** (custom command or POM everywhere). Rejected per the DRY-vs-pedagogy discussion in `docs/TECHNICAL_DEBT.md` — this course's structure deliberately shows inline → fixture → custom-command → POM as a progression; collapsing it would remove the thing the repo is for. Phase 8 may selectively address the worst duplication (#13) but a full rewrite is out of scope.
- **Replacing the third-party demo sites with a project-owned mock app.** Six specs intentionally target external sites for one-off UI-pattern lessons (`docs/ARCHITECTURE.md`); standing up and maintaining a replacement app for each is a materially different, much larger project than fixing this repo's own code, and would defeat the "here's how Cypress handles tables/iframes/alerts on a typical third-party page" teaching goal.
- **Deciding the umbrella-repo/archival question.** Noted under Classification above; explicitly deferred, not this phase's call (and Gate #3 if it ever becomes a merge).
- **Adding a database layer, HTTP API, or application code of this repo's own.** There is none today and none is warranted — this is a test-automation/course repo, not a service. Phase 9's "dual-mode independence" (`/health/live`, `openapi.yaml`, `MODE=standalone`) is `n/a` for the same reason the Phase 3 plan states for Phase 9: nothing here runs continuously or serves traffic.
