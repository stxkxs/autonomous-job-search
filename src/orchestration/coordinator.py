"""
Coordinator for Multi-Agent Orchestration
==========================================

Manages parallel job search agents using asyncio.
"""

import asyncio
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

from .agent_runner import AgentRunner
from .config import get_output_dir, load_config
from .merger import merge_outputs
from .state import AgentState, OrchestrationState, StateManager, now_iso
from .types import AgentConfig, AgentStatus, OrchestrationStatus


class Coordinator:
    """
    Coordinates multiple job search agents.

    Spawns agents as async tasks, monitors their progress,
    and triggers output merging when complete.
    """

    def __init__(
        self,
        output_dir: Path | None = None,
        max_iterations: int | None = None,
    ):
        """
        Initialize the coordinator.

        Args:
            output_dir: Base output directory (defaults to project output/)
            max_iterations: Max iterations per agent (None for unlimited)
        """
        self.output_dir = Path(output_dir) if output_dir else get_output_dir()
        self.max_iterations = max_iterations
        self.config = load_config()
        self.state_manager = StateManager(self.output_dir)
        self.session_id = str(uuid.uuid4())[:8]
        self.state = OrchestrationState(
            session_id=self.session_id,
            agent_count=len(self.config.agents),
        )
        self._tasks: list[asyncio.Task] = []

    def _setup_directories(self, agent_count: int) -> None:
        """Create output directories for agents."""
        self.output_dir.mkdir(parents=True, exist_ok=True)

        for i in range(agent_count):
            agent_dir = self.output_dir / f"agent-{i + 1}"
            agent_dir.mkdir(parents=True, exist_ok=True)

        merged_dir = self.output_dir / "merged"
        merged_dir.mkdir(parents=True, exist_ok=True)

    def _update_state(self, **updates) -> None:
        """Update and persist orchestration state."""
        for key, value in updates.items():
            if hasattr(self.state, key):
                setattr(self.state, key, value)

        # Update total jobs count
        self.state.total_jobs_found = self.state_manager.get_total_jobs(self.state.agent_count)

        self.state_manager.write_orchestration_state(self.state)

    async def start_all(self, agent_count: int = 4) -> None:
        """
        Start all agents in parallel.

        Args:
            agent_count: Number of agents to start (1-4)
        """
        # Limit to available agents
        agent_count = min(agent_count, len(self.config.agents))
        self.state.agent_count = agent_count

        print(f"\n{'=' * 60}")
        print(f"  Job Search Orchestration - Session {self.session_id}")
        print(f"  Starting {agent_count} agents")
        print(f"{'=' * 60}\n")

        # Setup directories
        self._setup_directories(agent_count)

        # Clear any previous stop signal
        self.state_manager.clear_stop_signal()

        # Initialize orchestration state
        self._update_state(
            status=OrchestrationStatus.RUNNING,
            started_at=now_iso(),
        )

        # Create agent runners
        runners: list[AgentRunner] = []
        for i in range(agent_count):
            agent_config = self.config.agents[i]
            agent_dir = self.output_dir / f"agent-{agent_config.id}"

            runner = AgentRunner(
                config=agent_config,
                output_dir=agent_dir,
                state_manager=self.state_manager,
                max_iterations=self.max_iterations,
            )
            runners.append(runner)

        # Start all agents as concurrent tasks
        self._tasks = [
            asyncio.create_task(runner.run(), name=f"agent-{runner.config.id}")
            for runner in runners
        ]

        # Start monitor task
        monitor_task = asyncio.create_task(
            self._monitor_loop(interval=30),
            name="monitor"
        )

        try:
            # Wait for all agent tasks to complete
            await asyncio.gather(*self._tasks, return_exceptions=True)
        except asyncio.CancelledError:
            print("\nOrchestration cancelled")
        finally:
            # Stop monitor
            monitor_task.cancel()
            try:
                await monitor_task
            except asyncio.CancelledError:
                pass

        # Final merge
        print("\n" + "=" * 60)
        print("  All agents complete - merging outputs")
        print("=" * 60)

        merged_count = merge_outputs(self.output_dir)

        self._update_state(
            status=OrchestrationStatus.COMPLETED,
            last_merge_at=now_iso(),
        )

        print(f"\n  Session complete: {merged_count} jobs found")
        print(f"  Output: {self.output_dir / 'merged' / 'jobs.json'}")
        print("=" * 60)

    async def _monitor_loop(self, interval: int = 30) -> None:
        """
        Monitor agent progress periodically.

        Args:
            interval: Seconds between status checks
        """
        while True:
            await asyncio.sleep(interval)
            self._print_status()
            self._update_state()

    def _print_status(self) -> None:
        """Print current status of all agents."""
        states = self.state_manager.read_all_agent_states(self.state.agent_count)

        print("\n" + "-" * 60)
        print("  Agent Status Update")
        print("-" * 60)

        total_jobs = 0
        running_count = 0

        for i, state in enumerate(states):
            agent_id = i + 1
            if state:
                status_str = state.status.value.upper()
                jobs = state.jobs_found
                iteration = state.iteration

                if state.status == AgentStatus.RUNNING:
                    running_count += 1

                total_jobs += jobs

                platform = self.config.agents[i].name if i < len(self.config.agents) else f"Agent {agent_id}"
                print(f"  Agent {agent_id} ({platform}): {status_str} | Iter {iteration} | {jobs} jobs")
            else:
                print(f"  Agent {agent_id}: NOT STARTED")

        print("-" * 60)
        print(f"  Total: {total_jobs} jobs | {running_count}/{self.state.agent_count} running")
        print("-" * 60 + "\n")

    def stop_all(self) -> None:
        """Signal all agents to stop gracefully."""
        print("\nSending stop signal to all agents...")
        self.state_manager.set_stop_signal()
        self._update_state(status=OrchestrationStatus.STOPPED)

    def stop_agent(self, agent_id: int) -> None:
        """
        Stop a specific agent.

        Note: Currently stops all agents. Per-agent stop would require
        separate signal files per agent.

        Args:
            agent_id: Agent to stop (1-4)
        """
        # For now, we use a global stop signal
        # A more sophisticated implementation would use per-agent signals
        print(f"\nNote: Stop signal affects all agents (agent {agent_id} requested)")
        self.stop_all()


def get_status(output_dir: Path | None = None) -> dict:
    """
    Get current orchestration status.

    Args:
        output_dir: Base output directory

    Returns:
        Dictionary with orchestration and agent states
    """
    if output_dir is None:
        output_dir = get_output_dir()

    state_manager = StateManager(output_dir)
    config = load_config()

    orch_state = state_manager.read_orchestration_state()
    agent_states = state_manager.read_all_agent_states(len(config.agents))

    return {
        "orchestration": orch_state.to_dict() if orch_state else None,
        "agents": [s.to_dict() if s else None for s in agent_states],
        "total_jobs": state_manager.get_total_jobs(len(config.agents)),
    }


def print_status(output_dir: Path | None = None) -> None:
    """
    Print formatted status to console.

    Args:
        output_dir: Base output directory
    """
    if output_dir is None:
        output_dir = get_output_dir()

    state_manager = StateManager(output_dir)
    config = load_config()

    orch_state = state_manager.read_orchestration_state()
    agent_states = state_manager.read_all_agent_states(len(config.agents))

    print()
    print("+" + "=" * 62 + "+")
    print("|" + " " * 18 + "Job Search Orchestration" + " " * 20 + "|")
    print("+" + "=" * 62 + "+")

    for i, state in enumerate(agent_states):
        agent_id = i + 1
        agent_config = config.agents[i] if i < len(config.agents) else None
        platform = agent_config.name if agent_config else f"Agent {agent_id}"

        if state:
            status = state.status.value.upper()[:8].ljust(8)
            iteration = f"Iter {state.iteration}".ljust(8)
            jobs = f"{state.jobs_found} jobs".ljust(8)

            # Calculate time ago
            if state.updated_at:
                try:
                    updated = datetime.fromisoformat(state.updated_at.replace("Z", "+00:00"))
                    delta = datetime.now(timezone.utc) - updated
                    mins = int(delta.total_seconds() / 60)
                    time_ago = f"{mins}m ago" if mins < 60 else f"{mins // 60}h ago"
                except:
                    time_ago = "?"
            else:
                time_ago = "?"

            print(f"| Agent {agent_id} ({platform:10}) | {status} | {iteration} | {jobs} | {time_ago:>6} |")
        else:
            print(f"| Agent {agent_id} ({platform:10}) | {'NONE':8} | {'---':8} | {'---':8} | {'---':>6} |")

    print("+" + "-" * 62 + "+")

    total_jobs = state_manager.get_total_jobs(len(config.agents))
    running = sum(1 for s in agent_states if s and s.status == AgentStatus.RUNNING)

    last_merge = ""
    if orch_state and orch_state.last_merge_at:
        try:
            merged = datetime.fromisoformat(orch_state.last_merge_at.replace("Z", "+00:00"))
            delta = datetime.now(timezone.utc) - merged
            mins = int(delta.total_seconds() / 60)
            last_merge = f"{mins}m ago" if mins < 60 else f"{mins // 60}h ago"
        except:
            last_merge = "?"
    else:
        last_merge = "never"

    print(f"| Total: {total_jobs} jobs found | {running}/{len(config.agents)} running | Last merge: {last_merge:>8} |")
    print("+" + "=" * 62 + "+")
    print()
