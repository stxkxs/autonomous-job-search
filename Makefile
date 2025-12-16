.PHONY: install dev test lint typecheck clean run

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

help:
	@echo "Available commands:"
	@echo "  make install    - Install package"
	@echo "  make dev        - Install with dev dependencies"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linter"
	@echo "  make format     - Format code"
	@echo "  make typecheck  - Run type checker"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make run        - Run the agent"
	@echo "  make run-upwork - Run focused on Upwork"
	@echo "  make run-fiverr - Run focused on Fiverr"
