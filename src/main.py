#!/usr/bin/env python3
"""
autoopposearch
===================

Autonomous agent that helps find freelance gigs, draft proposals, and manage projects.

Usage:
    python -m src.main --project-dir ./my_project
    python -m src.main --project-dir ./my_project --max-iterations 10
"""

import argparse
import asyncio
from pathlib import Path

from .agent import run_autonomous_agent

DEFAULT_MODEL = "claude-sonnet-4-5-20250514"
DEFAULT_MAX_ITERATIONS = 50


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Autonomous agent that helps find freelance gigs, draft proposals, and manage projects.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Start fresh project
  python -m src.main --project-dir ./my_project

  # Limit iterations
  python -m src.main --project-dir ./my_project --max-iterations 10

  # Use a specific model
  python -m src.main --project-dir ./my_project --model claude-sonnet-4-5-20250514

Environment Variables:
  ANTHROPIC_API_KEY    Your Anthropic API key (required)
        """,
    )

    parser.add_argument(
        "--project-dir",
        type=Path,
        default=Path("./output"),
        help="Directory for the project output (default: ./output)",
    )

    parser.add_argument(
        "--max-iterations",
        type=int,
        default=DEFAULT_MAX_ITERATIONS,
        help=f"Maximum agent iterations (default: {DEFAULT_MAX_ITERATIONS})",
    )

    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"Claude model to use (default: {DEFAULT_MODEL})",
    )

    parser.add_argument(
        "--platform",
        type=str,
        choices=["upwork", "fiverr", "freelancer", "toptal", "all"],
        default="all",
        help="Freelance platform to focus on (default: all)",
    )

    parser.add_argument(
        "--skills",
        type=str,
        nargs="+",
        default=["java", "spring-boot", "aws", "kubernetes", "platform-engineer", "sre", "devops", "observability"],
        help="Skills to search for jobs",
    )

    return parser.parse_args()


def main() -> None:
    """Main entry point."""
    args = parse_args()

    # Uses your existing Claude Code CLI authentication - no API key needed!
    print("Using Claude Code CLI authentication...")

    try:
        asyncio.run(
            run_autonomous_agent(
                project_dir=args.project_dir,
                model=args.model,
                max_iterations=args.max_iterations,
                platform=args.platform,
                skills=args.skills,
            )
        )
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        print("To resume, run the same command again")
    except Exception as e:
        print(f"\nFatal error: {e}")
        raise


if __name__ == "__main__":
    main()
