IMAGE := udemy-cypress-13-6-6
COMPOSE := docker compose

.PHONY: build test verify up run down logs shell lint format format-check security clean

## build: image through the run itself (reports produced, pass/fail NOT yet gated)
build:
	docker build --target test-run -t $(IMAGE):test-run .

## test: the gate — fails if the suite captured by `build` was red
test:
	docker build --target test -t $(IMAGE):test .

## verify: build + test, per the Docker standard
verify: build test

## up: this repo has no persistent service to bring up (every spec drives a
## public demo site directly, nothing of this repo's own to serve) — "up"
## means running the suite once via compose, gated behind verify first.
up: verify
	$(COMPOSE) up --build --abort-on-container-exit --exit-code-from e2e
	$(COMPOSE) down

## run: ad-hoc live re-run (does not require the test gate to have passed)
run: build
	$(COMPOSE) run --rm e2e

down:
	$(COMPOSE) down -v --remove-orphans

logs:
	$(COMPOSE) logs -f e2e

shell: build
	docker run --rm -it --entrypoint sh $(IMAGE):test-run

lint:
	npm run lint

format:
	npm run format

format-check:
	npm run format:check

security: build
	docker run --rm --entrypoint sh $(IMAGE):test-run -c "npm audit --audit-level=high || true"
	docker scout cves $(IMAGE):test-run

## clean: never deletes without an explicit confirm flag
clean:
ifndef CONFIRM
	@echo "Refusing to delete images/containers without CONFIRM=1 (e.g. 'make clean CONFIRM=1')."
else
	$(COMPOSE) down -v --remove-orphans
	-docker rmi $(IMAGE):test-run $(IMAGE):test
endif
