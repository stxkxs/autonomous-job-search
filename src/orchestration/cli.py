"""
CLI for Orchestration System
============================

Command-line interface for managing job search agents.
"""

import argparse
import asyncio
import sys
from pathlib import Path

from .config import get_output_dir
from .coordinator import Coordinator, print_status
from .merger import merge_outputs, get_merge_stats
from .state import StateManager


def create_parser() -> argparse.ArgumentParser:
    """Create the argument parser."""
    parser = argparse.ArgumentParser(
        prog="python -m src.orchestration",
        description="Multi-agent job search orchestration",
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # start command
    start_parser = subparsers.add_parser("start", help="Start job search agents")
    start_parser.add_argument(
        "-n", "--agents",
        type=int,
        default=4,
        choices=[1, 2, 3, 4],
        help="Number of agents to start (default: 4)",
    )
    start_parser.add_argument(
        "-i", "--iterations",
        type=int,
        default=None,
        help="Max iterations per agent (default: unlimited)",
    )
    start_parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output directory (default: ./output)",
    )

    # status command
    status_parser = subparsers.add_parser("status", help="Show agent status")
    status_parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output directory (default: ./output)",
    )

    # merge command
    merge_parser = subparsers.add_parser("merge", help="Merge agent outputs")
    merge_parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output directory (default: ./output)",
    )

    # stop command
    stop_parser = subparsers.add_parser("stop", help="Stop running agents")
    stop_parser.add_argument(
        "-a", "--agent",
        type=int,
        default=None,
        help="Stop specific agent (default: all)",
    )
    stop_parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output directory (default: ./output)",
    )

    return parser


def cmd_start(args: argparse.Namespace) -> int:
    """Handle start command."""
    output_dir = Path(args.output) if args.output else None

    coordinator = Coordinator(
        output_dir=output_dir,
        max_iterations=args.iterations,
    )

    try:
        asyncio.run(coordinator.start_all(agent_count=args.agents))
        return 0
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        coordinator.stop_all()
        return 130


def cmd_status(args: argparse.Namespace) -> int:
    """Handle status command."""
    output_dir = Path(args.output) if args.output else None
    print_status(output_dir)

    # Also show merge stats
    stats = get_merge_stats(output_dir)
    if stats["merged_jobs"] > 0:
        print(f"Merged output: {stats['merged_jobs']} jobs")

    return 0


def cmd_merge(args: argparse.Namespace) -> int:
    """Handle merge command."""
    output_dir = Path(args.output) if args.output else None

    print("Merging agent outputs...")
    count = merge_outputs(output_dir)

    print(f"\nMerge complete: {count} unique jobs")
    return 0


def cmd_stop(args: argparse.Namespace) -> int:
    """Handle stop command."""
    output_dir = Path(args.output) if args.output else get_output_dir()

    state_manager = StateManager(output_dir)

    if args.agent:
        print(f"Sending stop signal (agent {args.agent} requested)...")
    else:
        print("Sending stop signal to all agents...")

    state_manager.set_stop_signal()
    print("Stop signal set. Agents will stop after current iteration.")

    return 0


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    parser = create_parser()
    args = parser.parse_args(argv)

    if not args.command:
        parser.print_help()
        return 1

    commands = {
        "start": cmd_start,
        "status": cmd_status,
        "merge": cmd_merge,
        "stop": cmd_stop,
    }

    handler = commands.get(args.command)
    if handler:
        return handler(args)
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())
