"""
Agent Runner for Orchestration
==============================

Runs individual job search agents within the orchestration framework.
"""

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

from claude_agent_sdk import ClaudeAgentOptions, AssistantMessage, TextBlock, ToolUseBlock

from ..client import run_query
from .config import get_agent_prompt, PROJECT_ROOT
from .state import AgentState, StateManager, now_iso
from .types import AgentConfig, AgentStatus


class AgentRunner:
    """
    Runs a single job search agent.

    Adapts the existing agent logic for multi-agent orchestration.
    """

    def __init__(
        self,
        config: AgentConfig,
        output_dir: Path,
        state_manager: StateManager,
        max_iterations: int | None = None,
    ):
        """
        Initialize the agent runner.

        Args:
            config: Agent configuration
            output_dir: Output directory for this agent
            state_manager: State manager for reading/writing state
            max_iterations: Maximum iterations (None for unlimited)
        """
        self.config = config
        self.output_dir = Path(output_dir)
        self.state_manager = state_manager
        self.max_iterations = max_iterations
        self.state = AgentState(
            agent_id=config.id,
            platform=config.platform,
        )

    def _create_options(self) -> ClaudeAgentOptions:
        """Create Claude agent options for this agent."""
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Write settings file
        settings = {
            "permissions": {
                "allow": ["./**", "../prompts/**", "../config/**"],
                "deny": ["../../**", "~/**"],
            },
        }
        settings_path = self.output_dir / ".claude_settings.json"
        with open(settings_path, "w") as f:
            json.dump(settings, f, indent=2)

        # System prompt for job search agent
        system_prompt = f"""You are an autonomous job search agent for the {self.config.name} platform.

Your mission is to search {self.config.domain} for job opportunities matching the candidate profile.

Your capabilities:
- Read, write, and edit files
- Execute bash commands
- Search the web for job listings
- Fetch and analyze job postings
- Track your progress

Guidelines:
1. Focus exclusively on {self.config.domain}
2. Write all outputs to the current directory
3. Update jobs.json with each new job found
4. Log progress to session.log
5. Create complete.flag when done
6. If stuck, write to blocked.md and continue
"""

        return ClaudeAgentOptions(
            system_prompt=system_prompt,
            max_turns=100,
            cwd=str(self.output_dir),
            allowed_tools=["Read", "Write", "Edit", "Glob", "Grep", "Bash", "WebSearch", "WebFetch", "TodoWrite"],
            permission_mode="acceptEdits",
        )

    def _update_state(self, **updates) -> None:
        """Update and persist agent state."""
        for key, value in updates.items():
            if hasattr(self.state, key):
                setattr(self.state, key, value)

        # Update job count from file
        self.state.jobs_found = self.state_manager.count_jobs(self.config.id)

        self.state_manager.write_agent_state(self.state)

    def should_stop(self) -> bool:
        """Check if agent should stop."""
        return self.state_manager.check_stop_signal()

    def _log(self, message: str) -> None:
        """Append to session log."""
        log_file = self.output_dir / "session.log"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(log_file, "a") as f:
            f.write(f"[{timestamp}] {message}\n")

    async def run(self) -> None:
        """
        Run the agent loop.

        Loads the platform-specific prompt and runs iterations
        until complete or stopped.
        """
        print(f"\n[Agent {self.config.id}] Starting {self.config.name} agent...")

        # Initialize state
        self._update_state(
            status=AgentStatus.RUNNING,
            started_at=now_iso(),
        )
        self._log(f"Starting {self.config.name} job search")

        try:
            # Load platform-specific prompt
            prompt = get_agent_prompt(self.config.platform)

            # Create agent options
            options = self._create_options()

            iteration = 0
            while self.max_iterations is None or iteration < self.max_iterations:
                iteration += 1

                # Check for stop signal
                if self.should_stop():
                    print(f"\n[Agent {self.config.id}] Stop signal received")
                    self._update_state(status=AgentStatus.STOPPED)
                    self._log("Stopped by orchestrator")
                    break

                # Update state
                self._update_state(
                    iteration=iteration,
                    last_search=f"Iteration {iteration}",
                )
                self._log(f"Starting iteration {iteration}")

                print(f"\n[Agent {self.config.id}] Iteration {iteration}")

                # Run agent session
                try:
                    await self._run_session(options, prompt if iteration == 1 else self._get_continue_prompt())
                except Exception as e:
                    print(f"\n[Agent {self.config.id}] Session error: {e}")
                    self._log(f"Error in iteration {iteration}: {e}")
                    # Continue to next iteration

                # Check for completion flag
                complete_flag = self.output_dir / "complete.flag"
                if complete_flag.exists():
                    print(f"\n[Agent {self.config.id}] Completed!")
                    self._update_state(status=AgentStatus.COMPLETED)
                    self._log(f"Completed after {iteration} iterations")
                    break

                # Brief pause between iterations
                await asyncio.sleep(3)

            # Final state update
            if self.state.status == AgentStatus.RUNNING:
                self._update_state(status=AgentStatus.COMPLETED)
                self._log(f"Finished after {iteration} iterations")

        except Exception as e:
            print(f"\n[Agent {self.config.id}] Fatal error: {e}")
            self._update_state(
                status=AgentStatus.ERROR,
                error=str(e),
            )
            self._log(f"Fatal error: {e}")
            raise

    async def _run_session(self, options: ClaudeAgentOptions, prompt: str) -> None:
        """Run a single agent session."""
        async for message in run_query(prompt, options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        # Print abbreviated output
                        text = block.text[:200] + "..." if len(block.text) > 200 else block.text
                        print(f"[Agent {self.config.id}] {text}")
                    elif isinstance(block, ToolUseBlock):
                        print(f"[Agent {self.config.id}] [Tool: {block.name}]")

    def _get_continue_prompt(self) -> str:
        """Get prompt for continuation iterations."""
        return """Continue your job search.

Check your progress:
1. Read jobs.json to see what you've found so far
2. Look at session.log for your previous searches
3. Try new search queries you haven't done yet
4. Add any new jobs you find to jobs.json

If you've thoroughly searched the platform, create complete.flag with a summary.
If you encounter issues, write to blocked.md and try a different approach.
"""
