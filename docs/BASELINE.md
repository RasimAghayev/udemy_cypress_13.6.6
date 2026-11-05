# Docker baseline — behavior contract (Phase 5)

Established 2026-11-05 (`container-engineer`, Phase 5). This is the honest,
as-run-today baseline this repo's Cypress suite produces inside Docker. It is
**not** a target to hit — it is what exists right now. Nothing below was
fixed or papered over; broken specs stay broken (fixing specs is Phase 11
`tester` territory, or a dependency-version question for Phase 6).

## What this repo is, for Docker purposes

A Cypress 16 E2E course repo with **no app of its own** — every spec drives a
public, third-party demo site directly (`react-redux.realworld.io`,
`demos.jquerymobile.com`, `seleniumbase.io`, `demo.mobiscroll.com`,
`the-internet.herokuapp.com`, `opensource-demo.orangehrmlive.com`,
`reqres.in`). There is therefore no `build`/`runtime` stage in the Dockerfile
— inventing a service for this repo to serve would not reflect what the repo
actually is. The pipeline is `base -> deps -> test-run -> test`, and `test`
(the gate) is deliberately the last stage in the file, so `docker build .`
with no `--target` IS the gate.

## Pipeline design (why a 2-stage split after `deps`)

- `test-run`: runs the full suite and **always** commits its layer — the
  real cypress exit code is captured to `/app/.cypress-exit-code` via
  `RUN npx cypress run ; echo $? > /app/.cypress-exit-code` (the `;`, not
  `&&`, is what lets a failing suite still produce a successful RUN/layer).
  The merged JSON + HTML report is regenerated in this same stage,
  unconditionally (`|| true`), so evidence exists even on a fully red run.
- `test`: `FROM test-run`, adds one gate line —
  `RUN test "$(cat /app/.cypress-exit-code)" = "0"` — which fails the build
  whenever the captured run was not clean. This is what makes `make test` /
  `make verify` / a bare `docker build .` fail on a pre-existing red
  baseline, per the Docker standard ("build fails if tests fail"), while
  still leaving the real evidence extractable from `test-run` even when
  `test` itself won't build.

Verified both directions of the gate's own shell logic in isolation
(`test "$(cat f)" = "0"` on a file containing `0` → exit 0; on a file
containing `15` → exit 1) — see handoff Evidence table.

## Real result, this run (2026-11-05, headless, Electron, in-container)

Base image: `cypress/included:16.1.1` (matches the exact `cypress` version
already locked in `package-lock.json` — this phase containerizes the
existing version, it does not upgrade it). Bundled Node `v24.21.0`, Cypress
binary `16.1.1`, Electron `41.7.0` — Node version satisfies this repo's own
undeclared-but-real `cypress@16.1.1` engines constraint
(`^22.0.0 || ^24.0.0 || >=26.0.0`).

```
19 of 19 specs ran. 10 of 19 specs failed (53%).
Tests: 36   Passing: 19   Failing: 15   Pending: 0   Skipped: 2
Duration: ~2m05s
```

| Spec | Result | Tests | Pass | Fail | Skip |
|---|---|---|---|---|---|
| Tc01_FirstScript.spec.cy.js | FAIL | 1 | - | 1 | - |
| Tc02_RadioButton.spec.cy.js | pass | 1 | 1 | - | - |
| Tc03_CheckBox.spec.cy.js | pass | 1 | 1 | - | - |
| Tc04_DropDown.spec.cy.js | pass | 3 | 3 | - | - |
| Tc05_Alert.spec.cy.js | pass | 4 | 4 | - | - |
| Tc06_WebTables.spec.cy.js | pass | 1 | 1 | - | - |
| Tc07_Iframes.spec.cy.js | pass | 1 | 1 | - | - |
| Tc08_xPath.spec.cy.js | FAIL | 1 | - | 1 | - |
| Tc09_BrowserControl.spec.cy.js | FAIL | 1 | - | 1 | - |
| Tc10_HooksBasic.spec.cy.js | pass | 3 | 3 | - | - |
| Tc11_HooksImplentation.spec.cy.js | pass | 1 | 1 | - | - |
| Tc12_FicturesTest.cpec.cy.js | FAIL | 2 | - | 2 | - |
| Tc13_ReadExcel.spec.cy.js | FAIL | 2 | - | 2 | - |
| Tc14_ReadCsv.spec.cy.js | FAIL | 2 | - | 2 | - |
| Tc15.1_CustomCommand.spec.cy.js | FAIL | 2 | - | 2 | - |
| Tc15_CustomCommand.spec.cy.js | FAIL | 2 | - | 2 | - |
| Tc17_POM_Implementation.spec.cy.js | FAIL | 1 | - | 1 | - |
| Tc18_APITesting.spec.cy.js | pass | 4 | 4 | - | - |
| Tc19_Mock.spec.cy.js | FAIL | 3 | - | 1 | 2 |

Recorded exit code (`/app/.cypress-exit-code`): `15` (Cypress's own
convention — the exit code equals the failed-test count, not a bare `1`).
`mochawesome-merge`'s own `stats`, extracted from the built image, match
exactly: `suites: 19, tests: 36, passes: 19, failures: 15, skipped: 2,
pending: 0`. The HTML report (`cypress/reports/mochareports/report.html`)
was generated successfully in the same run.

## Root cause — one real cause explains 9 of the 10 failing specs

Every one of the 9 non-`Tc01` failing specs (`Tc08`, `Tc09`, `Tc12`, `Tc13`,
`Tc14`, `Tc15`, `Tc15.1`, `Tc17`, `Tc19`) — plus `Tc01` itself — calls
`cy.visit("https://react-redux.realworld.io/")` either directly or through
the `conduItLogin` custom command (which visits `/`, resolved against
`cypress.config.js`'s `baseUrl`, the same host). **That host no longer
serves the course's demo app.** Verified independently, outside the
container, from the host:

```
$ curl -sI https://react-redux.realworld.io/
HTTP/1.1 404 Not Found
...
x-amz-error-code: NoSuchBucket
x-amz-error-message: The specified bucket does not exist
x-amz-error-detail-bucketname: react-redux.realworld.io
Server: cloudflare
```

The domain now resolves to a Cloudflare-fronted S3 bucket that has been
deleted (`NoSuchBucket`) — this is not a container networking/DNS artifact,
not a flaky demo server, and not caused by anything in this phase. It is an
external site genuinely gone. Every spec that targets it fails with the
identical `CypressError: cy.visit() failed trying to load ... 404: Not
Found`, inside a `before`/`beforeEach` hook for `Tc19` (hence its 2
"skipped" — Cypress skips the remaining tests in a suite once a
`beforeEach` hook itself fails) and directly inside the test body for the
other 8.

**This supersedes part of Phase 3's audit** (`docs/REPOSITORY_AUDIT.md`,
"Key finding" section), which — correctly, from a read-only review without
executing anything — identified `Tc01`'s `cy.get('a[href="#logisn"')`
selector typo as a historical, already-documented failure (from a stale
2024 report) and flagged `Tc04`/`Tc19` as "needs confirmation by running the
suite." Running the suite now shows: `Tc04` actually **passes** today. The Phase 3
audit's Telerik-drift worry referred to a 2024 report whose `Tc04` failure
screenshot shows a `demos.telerik.com` URL; the spec as it exists today
instead visits `seleniumbase.io/demo_page` and `demo.mobiscroll.com` — the
spec itself was edited to a different target sometime after that old
report was generated, which is also why the stale committed report (Phase
7's problem, not this phase's) is misleading evidence for `Tc04` specifically.
`Tc01`'s selector typo is still
a real latent defect in the spec, but it is not today's proximate failure
cause — `cy.visit()` itself throws on the dead site before the typo'd
selector is ever reached. `Tc19`'s separately-flagged invalid-CSS-selector
syntax (`a[href^=#@"]`) is in the same position: real, but masked — its
`beforeEach` hook dies on the same dead site before that test body (which
contains the bad selector) ever runs.

**Newly confirmed by actually running the suite** (none of these were
predicted by the Phase 3 read-only audit): `Tc08`, `Tc09`, `Tc12`, `Tc13`,
`Tc14`, `Tc15`, `Tc15.1`, `Tc17` all fail for the identical dead-site reason.
Whether any of them also carry their own latent, masked defects (the way
`Tc01`/`Tc19` do) was not re-investigated here — that determination needs
the site reachable (or a local mock of it), which is Phase 6/11 territory,
not Phase 5's.

**`Tc12_FicturesTest.cpec.cy.js`'s `.cpec.cy.js` filename typo does not
exclude it from the run** — confirmed directly: it appears in the 19-spec
list above and ran like every other spec. Cypress's default spec glob only
requires the `.cy.js` suffix.

## Passing specs — what "pass" actually covers here

`Tc02`, `Tc03` (jquerymobile demos), `Tc04` (seleniumbase/mobiscroll demos),
`Tc05`, `Tc06`, `Tc07` (the-internet.herokuapp.com), `Tc10` (no external
site — pure `cy.log` hook demonstration), `Tc11` (opensource-demo.
orangehrmlive.com), `Tc18` (reqres.in REST API, via `cy.request`, no
browser navigation at all) — 9 specs, 19 tests, all genuinely green against
their real, independent, still-live third-party targets. None of these
share the dead `react-redux.realworld.io` dependency, which is exactly why
they still pass while the other 10 don't.

## Secrets — handled, not touched

`package.json`'s `dashboard:cy` script contains a hardcoded Cypress Cloud
record key — a known, already-tracked, parked finding (Gate 1,
`projects/info/state/APPROVALS.md`, opened by Phase 2/3, not new here).
Per that item's status, rotation is Rasim's action, not yet done. This
phase's Dockerfile/Makefile/compose file **never invoke** `dashboard:cy`,
`report:ci`, or `report:local` (the only scripts that reference `--record
--key`) — the suite is run directly via `npx cypress run` with no record
flag, so nothing in this phase's own work reads, prints, or transmits that
value. `.env.example` documents `CYPRESS_RECORD_KEY` as an empty
placeholder only, with an explicit note not to fill it with the known-leaked
value. `docker-compose.yml` passes the var through from the environment
(`${CYPRESS_RECORD_KEY:-}`) only so the already-correct CI pattern
(`.github/workflows/cypress.yml`, which reads `secrets.CYPRESS_RECORD_KEY`)
has a local equivalent — nothing in this repo's Docker/Make setup sets or
reads that variable by default.

## Characterization tests

None added. Per Phase 5's own scope ("add minimal characterization tests
only where critical paths have no tests"): every behavior this phase can
observe (19 specs, 36 assertions, exercising logins, forms, tables,
iframes, alerts, dropdowns, xpath, fixtures, custom commands, API
requests, and intercept-based mocking) already has a test — the test
*coverage* is not the gap here; the external *target* is. Writing a new
test to characterize "react-redux.realworld.io returns 404" would just
restate the `curl` output above, not characterize anything about this
repo's own code. No new test was written.

## Image

| Stage | On-disk size | Notes |
|---|---|---|
| `base` | 4.81 GB | `cypress/included:16.1.1`, unmodified Debian 13 (trixie) + Chrome/Electron/Firefox bundle |
| `deps` | 4.89 GB | + 245 npm packages (`npm ci --ignore-scripts`) |
| `test-run` | 4.90 GB | + full repo source + generated reports |

`docker scout cves udemy-cypress-13-6-6:test-run`: **423 vulnerabilities
across 140 packages** — 5 Critical, 121 High, 98 Medium, 197 Low, 2
Unspecified. This is overwhelmingly the base image's own OS/browser surface
(Debian 13 packages, Chrome, Electron, Firefox, perl, glib2.0, unzip, …),
not anything introduced by this phase's `deps`/`test-run` layers (`npm ci`
added 245 packages on top of an already-huge base). `cypress/included`
images are large by design (they bundle multiple real browsers for
headless/headed E2E testing) — out of this phase's scope to slim down; a
future Phase 6 bump to a newer `cypress/included` tag is the natural lever,
tracked as an out-of-scope finding in the handoff.

## Not built, and why

No `build`/`runtime` stage, no `HEALTHCHECK`, no published port from this
repo's reserved `20000-20009` block. All three are consequences of the same
fact: this repo has no service of its own. `make up` is mapped to "run the
suite once via compose" rather than "start a long-lived process" — the
closest honest equivalent in a repo with no persistent service, documented
in the Makefile.
