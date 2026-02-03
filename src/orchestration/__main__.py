"""
Entry point for orchestration module.

Usage:
    python -m src.orchestration <command>

Commands:
    start   - Start job search agents
    status  - Show agent status
    merge   - Merge agent outputs
    stop    - Stop running agents
"""

import sys
from .cli import main

if __name__ == "__main__":
    sys.exit(main())
