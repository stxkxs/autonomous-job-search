"""
Agent Session Logic
===================

Core agent execution and session management for freelance assistance.
Uses Claude Code CLI authentication - no API key needed.
"""

import asyncio
from pathlib import Path

from claude_agent_sdk import ClaudeAgentOptions, AssistantMessage, TextBlock, ToolUseBlock

from .client import create_client_options, run_query
from .prompts import copy_spec_to_project, get_coding_prompt, get_initializer_prompt
from .progress import count_passing_tests, print_progress_summary, print_session_header


async def run_agent_session(
    options: ClaudeAgentOptions,
    prompt: str,
) -> None:
    """
    Run a single agent session.

    Args:
        options: Configured Claude Agent options
        prompt: The prompt to send to the agent
    """
    print(f"\nSending prompt ({len(prompt)} chars)...")
    print("-" * 50)

    async for message in run_query(prompt, options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    print(block.text, end="", flush=True)
                elif isinstance(block, ToolUseBlock):
                    print(f"\n[Tool: {block.name}]")
        else:
            # Handle other message types
            print(f"\n{message}")

    print("\n" + "-" * 50)


async def run_autonomous_agent(
    project_dir: Path,
    model: str,
    max_iterations: int | None = None,
    platform: str = "all",
    skills: list[str] | None = None,
) -> None:
    """
    Run the autonomous freelance assistant agent loop.

    Uses your existing Claude Code CLI authentication - no API key needed.

    Args:
        project_dir: Directory for the project
        model: Claude model to use
        max_iterations: Maximum iterations (None for unlimited)
        platform: Freelance platform to focus on
        skills: Skills to search for gigs
    """
    # Create project directory
    project_dir = Path(project_dir).resolve()
    project_dir.mkdir(parents=True, exist_ok=True)

    # Check if this is a continuation
    feature_list = project_dir / "feature_list.json"
    is_continuation = feature_list.exists()

    if is_continuation:
        print(f"\nContinuing existing project: {project_dir}")
        print_progress_summary(project_dir)
    else:
        print(f"\nStarting new freelance assistant project: {project_dir}")
        print(f"Platform: {platform}")
        print(f"Skills: {', '.join(skills or ['java', 'aws', 'devops'])}")
        copy_spec_to_project(project_dir, platform, skills or ["java", "aws", "devops"])

    # Create client options (uses CLI auth)
    options = create_client_options(project_dir, model)

    iteration = 0
    while max_iterations is None or iteration < max_iterations:
        iteration += 1

        # Determine prompt type
        if not is_continuation and iteration == 1:
            prompt = get_initializer_prompt()
            is_initializer = True
        else:
            prompt = get_coding_prompt()
            is_initializer = False

        print_session_header(iteration, is_initializer)

        # Run session
        await run_agent_session(options, prompt)

        # Show progress
        print_progress_summary(project_dir)

        # Check completion
        passing, total = count_passing_tests(project_dir)
        if total > 0 and passing == total:
            print("\n" + "=" * 70)
            print("  ALL TASKS COMPLETE - FREELANCE WORKFLOW READY!")
            print("=" * 70)
            break

        # Continue?
        if max_iterations is None or iteration < max_iterations:
            print("\nContinuing in 3 seconds... (Ctrl+C to stop)")
            await asyncio.sleep(3)
        is_continuation = True

    print("\n" + "=" * 70)
    print("  SESSION COMPLETE")
    print("=" * 70)
    print(f"\nProject directory: {project_dir}")
    print("\nTo continue later, run:")
    print(f"  python -m src.main --project-dir {project_dir}")
