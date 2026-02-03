.PHONY: install dev test lint typecheck clean run orchestrate monitor merge ui reset reset-all db-reset docker-up docker-down db-migrate db-seed run-full dev-full agents-start agents-status agents-merge agents-stop search

# Package manager
PM := uv

install:
	$(PM) pip install -e .

dev:
	$(PM) pip install -e ".[dev]"

test:
	pytest tests/ -v

lint:
	ruff check src tests
	ruff format --check src tests

format:
	ruff format src tests

typecheck:
	mypy src

clean:
	rm -rf __pycache__ .pytest_cache .mypy_cache .ruff_cache
	rm -rf *.egg-info dist build
	find . -type d -name __pycache__ -exec rm -rf {} +

run:
	python -m src.main --project-dir ./output

run-upwork:
	python -m src.main --project-dir ./output --platform upwork

run-fiverr:
	python -m src.main --project-dir ./output --platform fiverr

# Python Multi-Agent Orchestration (self-contained)
agents-start:
	$(PM) run python -m src.orchestration start

agents-start-2:
	$(PM) run python -m src.orchestration start -n 2

agents-status:
	$(PM) run python -m src.orchestration status

agents-merge:
	$(PM) run python -m src.orchestration merge

agents-stop:
	$(PM) run python -m src.orchestration stop

# Quick alias for job search
search: agents-start

# Legacy Orchestration commands (zellij-based)
ORCH_DIR := $(HOME)/.claude/orchestration/scripts
SESSION_NAME ?= job-search-$(shell date +%Y%m%d)

orchestrate:
	@echo "Launching 4-agent job search orchestration..."
	$(ORCH_DIR)/init.sh job-search $(SESSION_NAME) $(shell pwd)

orchestrate-attach:
	@echo "Attaching to most recent job-search session..."
	zellij attach $$(zellij list-sessions | grep job-search | head -1 | awk '{print $$1}')

orchestrate-kill:
	@echo "Killing all job-search sessions..."
	zellij list-sessions | grep job-search | awk '{print $$1}' | xargs -I {} zellij delete-session {}

orchestrate-worktrees:
	@echo "Launching 4-agent job search with git worktrees..."
	$(ORCH_DIR)/init.sh job-search $(SESSION_NAME) $(shell pwd) --worktrees

monitor:
	$(ORCH_DIR)/monitor.sh

merge:
	$(ORCH_DIR)/merge-outputs.sh $(shell pwd)

pause:
	@if [ -z "$(AGENT)" ]; then echo "Usage: make pause AGENT=1"; exit 1; fi
	$(ORCH_DIR)/pause-agent.sh $(AGENT)

resume:
	@if [ -z "$(AGENT)" ]; then echo "Usage: make resume AGENT=1"; exit 1; fi
	$(ORCH_DIR)/resume-agent.sh $(AGENT)

query:
	@if [ -z "$(AGENT)" ] || [ -z "$(MSG)" ]; then echo "Usage: make query AGENT=1 MSG='your message'"; exit 1; fi
	$(ORCH_DIR)/query-agent.sh $(AGENT) "$(MSG)"

# Data management
reset:
	@echo "Resetting job search data..."
	rm -rf output/agent-*/jobs.json output/agent-*/companies.json output/agent-*/session.log
	rm -rf output/agent-*/complete.flag output/agent-*/blocked.md
	rm -rf output/merged/*
	@echo "Agent outputs cleared. UI data preserved."
	@echo "To also reset UI data: make reset-all"

# Full reset - clears all job data including state files and UI data
reset-all: reset
	@echo "Resetting UI data and state files..."
	rm -rf output/agent-*/state.json
	rm -f output/orchestration-state.json output/.stop-signal
	echo "[]" > ui/public/data/jobs.json
	@echo "All data cleared. Run 'make search' to start fresh."

# Database reset (if docker running)
db-reset:
	@echo "Resetting database..."
	cd ui && DATABASE_URL="postgresql://jobsearch:jobsearch@localhost:5432/jobsearch" ./node_modules/.bin/prisma db push --force-reset
	@echo "Database reset complete."

# UI commands
ui:
	cd ui && npm run dev

ui-build:
	cd ui && npm run build

# Docker commands
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-reset:
	docker compose down -v
	docker compose up -d

# Database commands
db-migrate:
	cd ui && ./node_modules/.bin/prisma migrate dev

db-push:
	cd ui && ./node_modules/.bin/prisma db push

db-seed:
	cd ui && ./node_modules/.bin/prisma db seed

db-studio:
	cd ui && ./node_modules/.bin/prisma studio

# Import jobs from agent outputs to database
import-jobs:
	curl -X POST http://localhost:3000/api/import -H "Content-Type: application/json" -d '{"source": "merged"}'

# Full workflow: start stack, run orchestration, merge, import
run-full:
	@echo "Starting database..."
	docker compose up -d db
	@echo "Waiting for database to be ready..."
	@sleep 5
	@echo "Starting app..."
	docker compose up -d app
	@echo "Waiting for app to be ready..."
	@sleep 10
	@echo "Pushing database schema..."
	docker compose exec app ./node_modules/.bin/prisma db push --accept-data-loss
	@echo ""
	@echo "Stack is ready! Now run:"
	@echo "  make orchestrate"
	@echo ""
	@echo "When agents have found jobs:"
	@echo "  make merge && make import-jobs"
	@echo ""
	@echo "View at http://localhost:3000"

# Quick start: just database + local dev
dev-full:
	docker compose up -d db
	@sleep 3
	cd ui && npm install && ./node_modules/.bin/prisma db push && npm run dev

help:
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install    - Install package"
	@echo "  make dev        - Install with dev dependencies"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linter"
	@echo "  make format     - Format code"
	@echo "  make typecheck  - Run type checker"
	@echo "  make clean      - Clean build artifacts"
	@echo ""
	@echo "Single Agent:"
	@echo "  make run        - Run the single-agent searcher"
	@echo "  make run-upwork - Run focused on Upwork"
	@echo "  make run-fiverr - Run focused on Fiverr"
	@echo ""
	@echo "Multi-Agent Orchestration (Python):"
	@echo "  make agents-start     - Start 4 parallel job search agents"
	@echo "  make agents-start-2   - Start only 2 agents"
	@echo "  make agents-status    - Show agent status"
	@echo "  make agents-merge     - Merge agent outputs"
	@echo "  make agents-stop      - Stop all agents"
	@echo "  make search           - Alias for agents-start"
	@echo ""
	@echo "Legacy Orchestration (zellij-based):"
	@echo "  make orchestrate           - Launch 4-agent parallel search"
	@echo "  make orchestrate-worktrees - Launch with git worktree isolation"
	@echo "  make monitor               - Open monitoring dashboard"
	@echo "  make merge                 - Merge agent outputs to UI"
	@echo "  make pause AGENT=N         - Pause agent N"
	@echo "  make resume AGENT=N        - Resume agent N"
	@echo "  make query AGENT=N MSG=... - Send message to agent N"
	@echo ""
	@echo "UI:"
	@echo "  make ui         - Start UI development server"
	@echo "  make ui-build   - Build UI for production"
	@echo ""
	@echo "Docker (Full Stack with Database):"
	@echo "  make docker-up    - Start PostgreSQL + App"
	@echo "  make docker-down  - Stop containers"
	@echo "  make docker-logs  - View logs"
	@echo "  make docker-reset - Reset database and restart"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate   - Run Prisma migrations"
	@echo "  make db-push      - Push schema to database"
	@echo "  make db-studio    - Open Prisma Studio"
	@echo "  make db-reset     - Reset database (clear all jobs)"
	@echo "  make import-jobs  - Import agent outputs to database"
	@echo ""
	@echo "Data Reset:"
	@echo "  make reset        - Clear agent outputs only"
	@echo "  make reset-all    - Clear ALL data (agents, merged, UI, state)"
	@echo ""
	@echo "Full Workflow:"
	@echo "  make run-full     - Start stack, then run orchestrate"
	@echo "  make dev-full     - Start DB + local dev server"
