# Testing strategy — udemy_cypress_13.6.6

## Scope and nature of the system

This repository is a Cypress E2E course/teaching artifact, not an application under test owned by this codebase. Specs drive third-party public demo sites directly (configured `baseUrl` `https://react-redux.realworld.io/` plus `demos.jquerymobile.com`, `seleniumbase.io`, `demo.mobiscroll.com`, `the-internet.herokuapp.com`, `opensource-demo.orangehrmlive.com`, `reqres.in`). There is no first-party runtime, API, or database to unit/integration test in isolation.

## Test layers

- **E2E (Cypress, in Docker):** the primary suite in `cypress/e2e/**` exercises UI flows and a small API sample against external targets. This is the behavior contract captured in `docs/BASELINE.md`.
- **Plugin/tasks:** Node-side support in `cypress/plugins/` (e.g. `read-xlsx`) is exercised indirectly by specs such as `Tc13_ReadExcel.spec.cy.js` when the suite runs.
- **Quality gates:** `npm run lint` (ESLint) and `npm run format:check` (Prettier) run in CI and are available in the test image.

## Execution and verification

- Canonical verification: `make verify` (Docker), which builds the `test-run` image, executes `npx cypress run`, records the exit code, and gates the `test` target on a zero exit (`docs/BASELINE.md` describes the split).
- Container image: `cypress/included:16.2.1` pinned by digest (see `Dockerfile`).
- Reports: Mochawesome JSON/HTML generated into `cypress/reports/` inside the image during the run.

## Known external dependency and baseline

A large portion of the suite depends on `https://react-redux.realworld.io/`. That host is unavailable (deleted S3 bucket / 404) and produces pre-existing failures unrelated to repository changes. The suite is therefore red at baseline by external conditions, not by regressions introduced in this repo; this is documented in `docs/BASELINE.md` and `docs/TEST_REPORT.md`. Fixing or stabilizing those external-site flows requires either restoring/mocking the target or rewriting specs (defect/content work outside adding tests), and must not be claimed as fixed without evidence.

## Determinism and limits

- Specs that hit live third-party sites are inherently non-deterministic (availability, content/markup drift, rate limits). `Tc18_APITesting.spec.cy.js` targets `reqres.in` and may vary with that service.
- `Tc19_Mock.spec.cy.js` demonstrates interception but also visits the dead `react-redux.realworld.io` base URL and contains a pre-existing invalid selector in its final assertion (tracked in `docs/TECHNICAL_DEBT.md`); two tests in that suite are skipped when a hook fails.
- `cypress-xpath` is deprecated but still used by `Tc08_xPath.spec.cy.js` (tracked debt).

## Adding or changing tests

- New tests should prefer deterministic targets (local fixtures, `cy.intercept`/mocks, or stable public endpoints) to avoid introducing false greens/reds.
- Do not weaken existing assertions to manufacture a green result against the external-site baseline.
- Record real run outcomes (PASS/FAIL/BLOCKED/SKIPPED/NOT RUN) and environment in `docs/TEST_REPORT.md` when the suite is re-baselined.
