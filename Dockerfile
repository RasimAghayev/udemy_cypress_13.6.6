# syntax=docker/dockerfile:1.7
#
# Phase 5 container baseline for a Cypress E2E *test* repo — there is no app
# to build or serve here (the specs drive public demo sites: react-redux.realworld.io,
# demos.telerik.com, opensource-demo.orangehrmlive.com). The pipeline therefore stops
# at base -> deps -> test-run -> test; no build/runtime stage is invented.
#
# base image pinned by exact tag AND digest, matching the version already
# locked in package-lock.json (cypress@16.1.1) so this phase does not perform
# an upgrade (that is Phase 6's job) — it only containerizes the current,
# already-installed version.
FROM cypress/included:16.1.1@sha256:e652cda84399aaf99c68d1d0322085dc3faa7ca9ace88d9bb4f0f045d2ce6764 AS base

# The image ships Chrome/Electron with an already-created non-root `node`
# user (uid/gid 1000) and sets ENTRYPOINT ["cypress","run"] — verified at
# build-pin time that `cypress verify` and a real headless run both work as
# this non-root user with no sandbox flags, so the whole pipeline (deps
# install through the test run) executes as `node`, not root.
WORKDIR /app
ENV CI=true \
    NO_COLOR=1 \
    npm_config_cache=/home/node/.npm
RUN chown node:node /app
USER node

# ---------------------------------------------------------------------------
FROM base AS deps
COPY --chown=node:node package.json package-lock.json ./
# Reproducible install from the committed lockfile (not `npm install --force`,
# which is what the pre-existing Dockerfile did and which can silently drift
# from package-lock.json). --ignore-scripts: this repo has no lifecycle
# scripts that need a real .git checkout, kept for parity with the verified
# Node/npm Phase-5 pitfall (husky-style `prepare` scripts failing in a
# script-less build context) even though this repo has none today.
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    npm ci --no-audit --no-fund --ignore-scripts && \
    npx cypress verify

# ---------------------------------------------------------------------------
# test-run: actually executes the full suite headless and ALWAYS commits its
# layer (reports + recorded exit code), whether the suite passed or failed.
# This is deliberate: Phase 5's job is to capture the real, honest baseline
# (including any pre-existing red specs), not to let a failing spec abort
# the build before the evidence is written to disk.
FROM deps AS test-run
COPY --chown=node:node . .
# package.json's own "pretest" script (clean:reports:wn) is Windows-only
# (rmdir/mkdir with backslashes) and fails on Linux — reproduce the Linux
# variant (clean:reports:lx) directly instead of invoking the npm script.
RUN rm -rf cypress/reports && \
    mkdir -p cypress/reports/mocha cypress/reports/mochareports
# Full headless run, every spec Cypress's default glob picks up (not just
# the single spec package.json's own "test" script narrows to). Record the
# real exit code without letting it abort the Docker layer.
RUN npx cypress run ; echo $? > /app/.cypress-exit-code
# Always regenerate the merged + HTML report, pass or fail — this is part of
# the evidence this phase must produce, not just the raw per-spec JSON.
RUN npx mochawesome-merge cypress/reports/mocha/*.json > cypress/reports/mochareports/report.json 2>/app/.merge-stderr || true
RUN npx marge cypress/reports/mochareports/report.json -f report -o cypress/reports/mochareports --reportTitle "udemy_cypress_13.6.6" >/app/.report-gen.log 2>&1 || true

# ---------------------------------------------------------------------------
# test: the gate. Only succeeds if the run captured above was actually
# green. `docker build .` (no --target, i.e. this default final stage,
# since this repo has no build/runtime stage to chain further) therefore
# fails whenever the suite is red — per the Docker standard, "build fails
# if tests fail". A pre-existing red baseline is expected to make this
# stage (and make test / make verify) fail; that failure is the documented
# baseline (docs/BASELINE.md), not a regression introduced by this phase.
FROM test-run AS test
RUN test "$(cat /app/.cypress-exit-code)" = "0"

# `test` is deliberately the LAST stage in this file, so the default build
# target (`docker build .`, no --target) is the gate itself. Ad-hoc/live
# re-runs (`make run`, `docker compose run e2e`) target `test-run` explicitly
# instead (same image contents, but its own layer always commits regardless
# of the suite's result, and its ENTRYPOINT — inherited unchanged from the
# base image, `["cypress","run"]` — re-executes the suite live on `docker run`).
