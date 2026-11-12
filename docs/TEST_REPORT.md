# Test report — udemy_cypress_13.6.6

## Run context

- Date (UTC): 2026-11-12T05:52:53Z (verification run started 2026-11-12T05:52:45Z)
- Phase: 12 (test-engineer)
- Commit baseline: `e88f1f1` (main, includes PR #55 / Phase 11 docs)
- Command: `make verify` (Docker `--target test-run` + gate `--target test`)
- Image base: `cypress/included:16.2.1` (digest-pinned per `Dockerfile`)
- Environment: Docker Desktop on Windows host (win32), headless Electron as bundled by image
- Gate result: **exit 2** (`[test 1/1]` fails because captured Cypress exit code != 0)

## Aggregate results (from `/app/cypress/reports/mochareports/report.json` in `test-run` image)

| Metric | Value |
| --- | ---: |
| Suites | 17 |
| Tests | 32 |
| Passes | 19 |
| Failures | 11 |
| Pending | 0 |
| Skipped | 2 |
| Pass % | 59.375% |
| Duration | 124415 ms |
| Recorded Cypress exit code | 12 |

## Comparison to documented baseline

`docs/BASELINE.md` (Phase 7/10 reference): 17 suites / 32 tests / 19 pass / 11 fail / 2 skipped, exit 12, with failures attributed to the dead external site `https://react-redux.realworld.io/` (S3 bucket deleted / 404). This run reproduces the same aggregate signature and exit code. **No regression observed** relative to that documented pre-existing red baseline.

## Failure classification

- **External / pre-existing (not a regression):** Specs that visit `https://react-redux.realworld.io/` fail at `cy.visit()` with 404/unreachable-target behavior from that dead site (see `docs/BASELINE.md` for per-spec breakdown and root cause). The two skipped tests are in `Tc19_Mock.spec.cy.js` where a hook failure skips remaining tests in that suite.
- **Spec-level defects (pre-existing, tracked):** `Tc01_FirstScript.spec.cy.js` contains a selector typo (`#logisn`) and `Tc19_Mock.spec.cy.js` contains an invalid selector in its final assertion; both are documented in `docs/TECHNICAL_DEBT.md` and may be masked or surfaced depending on site state/order but remain known issues.
- **No new failures introduced by Phase 12 changes.** Phase 12 changes in this cycle are documentation/test-reporting artifacts only; production/spec code was not modified.

## Quality checks (Docker image)

- `npm run lint` → exit 0
- `npm run format:check` → exit 0

## Coverage

Cypress E2E runs are not instrumented for line/branch coverage in this repository. Reported coverage: **not measured** (N/A for current setup). Effective coverage is described by the executed spec set and the aggregate pass/fail counts above.

## Known limitations

- Results for specs targeting live third-party sites depend on external availability and content stability; they are not fully deterministic.
- `make verify` is expected to remain red while `react-redux.realworld.io` is unavailable and the affected specs continue to visit it.
- Mock/intercept demonstrations (`Tc19`) still depend on an initial visit to the unavailable base URL in current form.

## Not run

- Host-native Cypress execution (verification is Docker-canonical per project standards).
- Additional network-isolated reruns beyond the recorded Docker verification.
