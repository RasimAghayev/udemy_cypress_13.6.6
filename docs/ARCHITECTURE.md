# Architecture

Analyzed 2026-11-04 (Phase 3). Builds on `projects/info/deps/udemy_cypress_13.6.6.md` (Phase 2) — not re-derived here.

## What this is

A **Cypress E2E test-automation repo that is itself Udemy course material** ("Cypress V13.6.6 - Docker + Cucumber + Jenkins"), not an application with tests. There is no application source under test living in this repo; every spec drives a public third-party demo site over the network. The repo's own "product" is the test code, fixtures, page objects, Docker wrapper, and CI pipeline — the teaching artifact *is* the deliverable.

Despite the repo name and course title referencing Cypress 13.6.6, the actual `package.json`/lockfile pin **Cypress 16.x** (already noted in the Phase 2 deps file; the name is stale, not the dependency — a Phase 14/15 doc-cleanup item, not addressed here).

## Targets under test (plural, not one app)

Specs do not exercise one cohesive application. They fall into two groups:

1. **Conduit RealWorld demo (`https://react-redux.realworld.io/`)** — the `baseUrl` configured in `cypress.config.js`, and the actual target of the "framework design" specs: `Tc01`, `Tc08`, `Tc10` (generic), `Tc12`–`Tc15`, `Tc17`, `Tc19`. These build up login, fixtures, custom commands, Page Object Model, Excel/CSV-driven data, and API mocking against one real external app.
2. **Six unrelated third-party demo pages**, each used for exactly one UI-pattern lesson and never revisited: `seleniumbase.io/demo_page`, `demos.telerik.com` (dropdown), `demo.mobiscroll.com` (multi-select), `demos.jquerymobile.com` (radio/checkbox), `the-internet.herokuapp.com` (alerts, tables, iframes), `opensource-demo.orangehrmlive.com` (hooks lesson), plus `reqres.in/api` for the pure-API lesson (`Tc18`). These are deliberate per-topic teaching choices, not a defect — but it means roughly a third of the suite depends on uptime/markup stability of sites this project does not control, outside the configured `baseUrl`.

## Structure

```
cypress/
  e2e/                  19 numbered spec files (Tc01–Tc19, one gap: no Tc16) + pages/ (4 Page Object classes)
  fixtures/             static JSON/CSV/XLSX test data (login creds, mock API responses)
  plugins/              index.js (task registration) + read-xlsx.js (XLSX→JSON task)
  support/              commands.js (one custom command: conduItLogin) + e2e.js (global hooks, cypress-xpath import)
  reports/              mocha/*.json + mochareports/ — generated at run time, gitignored (the stale committed copies were removed in Phase 7, see REPOSITORY_AUDIT.md)
cypress.config.js        Cypress 16 defineConfig — baseUrl, reporter wiring, screenshot-on-failure
Dockerfile, docker-compose.yml   multi-stage (base -> deps -> test-run -> test), FROM cypress/included:16.2.1 pinned by tag+digest
.github/workflows/cypress.yml    one job, matrix-parallelized (2 containers), push-triggered only
package.json              9 devDependencies, 0 runtime deps — see deps file
README.md                 Udemy course syllabus/table of contents, not project docs
```

## Test-authoring patterns used (and their inconsistency)

Across the 19 specs, four different patterns for driving the same login flow coexist, each introduced as its own lesson:
- Inline raw selectors repeated in the spec body (`Tc01`, `Tc02`–`Tc09` for their own topics, `Tc13`, `Tc14`, `Tc19`)
- Fixture-backed inline selectors (`Tc12`)
- A custom command (`cy.conduItLogin`, `Tc15`)
- Full Page Object Model (`Tc17`, the only spec using `cypress/e2e/pages/*.js`)

This is intentional progression for a course (each lesson demonstrates the *next* technique), but it means the suite never converges on one reusable login path — 11 of 19 specs re-type the same raw `cy.get('a[href="#login"')` / email / password / submit sequence instead of using the custom command or POM introduced later in the same course. See `docs/TECHNICAL_DEBT.md` and the DRY discussion in the Phase 3 plan (`projects/info/analysis/udemy_cypress_13.6.6.md`) for where this is flagged as a real (not cosmetic) duplication.

## Data flow for the two "data-driven" lessons

- `Tc13_ReadExcel`: `cy.task("readXlsx", {...})` → `cypress/plugins/index.js` → `cypress/plugins/read-xlsx.js` (`fs.readFileSync` + `@e965/xlsx` package's `XLSX.read`/`sheet_to_json`) → row array consumed in the spec. Only task-based (Node-side) I/O in the repo.
- `Tc14_ReadCsv`: `cy.fixture("ConduitCsv.csv").then(neatCsv)` — browser-side fixture read, parsed by `neat-csv` directly in the test runner, no Node task needed.

## Database layer

**Not applicable.** This repo has no database, no ORM, no SQL, no migrations, no connection string, and no persistence layer of its own. The only "data" it manages is static test fixtures (JSON/CSV/XLSX files under `cypress/fixtures/`) and the external Conduit demo app's own backend, which this repo does not own or configure. Any Phase that assumes a database layer (schema review, migrations, N+1, backup/recovery) is `n/a` for this repo — stated explicitly here rather than silently skipped, per the audit instructions.

## CI/CD

One GitHub Actions workflow, `.github/workflows/cypress.yml`: `push`-triggered (no `pull_request` trigger — see Phase 10 plan), 2-way matrix via `cypress-io/github-action@v7.4.6` with `record: true`/`parallel: true` recording to Cypress Cloud using `secrets.CYPRESS_RECORD_KEY` (the env-var path the committed `package.json` `dashboard:cy` script should also use — see `docs/TECHNICAL_DEBT.md` #1). No explicit `actions/setup-node` step — Node version is whatever `ubuntu-latest` ships at run time, unpinned. No lint/secret-scan/build/image-scan stages — just the one Cypress-run job.

## Not present

No application server, no HTTP API of this project's own (the only `baseUrl`/endpoints hit are third-party), no build step beyond `npm ci`, `.env.example` present (empty placeholder for `CYPRESS_RECORD_KEY` only), a `Makefile` (build/test/verify/up/run/down — see Phase 5), root `engines.node` set to the pinned Docker image's Node version (`^26.13.0`, Phase 6), and a `LICENSE.md` (MIT, added Phase 4 — note `package.json` still *declares* `"ISC"`, a license-declaration mismatch not yet reconciled; see out-of-scope finding in the Phase 7 handoff).

## Design principles applied (Phase 8)

This is a flat Cypress E2E course repo, not a layered application — it has no services, no database, no HTTP API of its own, and no internal module boundaries worth formalizing. The following design principles were assessed at Phase 8; each is either `n/a` with a stated reason, or a deliberate judgment call:

| Principle | Applicability | Reason |
|---|---|---|
| DRY | Judgment call — deferred | 11 of 19 specs repeat the same raw Conduit-login selector sequence inline instead of reusing the `cy.conduItLogin` custom command or the Page Object Model. Collapsing it is legitimate DRY, but it would also erase the course's deliberate inline → fixture → custom-command → POM progression, which is the thing the repo exists to teach. YAGNI/KISS win: leave as-is, document here, revisit only if a future phase needs to touch those specs. |
| KISS / YAGNI | Applied | No speculative abstraction is introduced anywhere in this phase. The repo already does one thing (run 19 Cypress specs against demo sites) and nothing more is added. |
| SOLID | n/a | The only classes are 4 trivial Page Object wrappers, each already single-responsibility; nothing here has "several reasons to change." No inheritance, no interfaces, no dependency inversion boundary. |
| Clean / Hexagonal architecture | n/a | No external system (DB, queue, other service) that this repo owns and might need to swap behind an interface. The sites under test are consumed over the network, not integrated with. |
| DDD | n/a | No domain complexity or invariants belong to this repo; the "domain" (Conduit's own business rules) belongs to a different project entirely. This repo's domain is "how to write Cypress tests," which is already the structure. |
| EDA | n/a | No async reactions or cross-service integration originate from this repo; it runs to completion and exits. |
| Modular monolith | n/a | Single-purpose, single-repo test tooling; no deployable with internal module boundaries worth formalizing. |
| GoF patterns | n/a beyond POM | The Page Object Model already in use (one spec, `cypress/e2e/pages/`) is a recognized test-automation pattern, not a GoF pattern, and is already correctly scoped to where it's used. No other GoF pattern is applicable or missing. |

See `docs/adr/ADR-0001.md` for the recorded decision on the DRY/login-duplication question.
