"""
State Management for Orchestration
===================================

Read and write state files for agents and orchestration sessions.
"""

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .types import AgentStatus, OrchestrationStatus


def now_iso() -> str:
    """Get current time as ISO format string."""
    return datetime.now(timezone.utc).isoformat()


@dataclass
class AgentState:
    """State of a single agent."""
    agent_id: int
    platform: str
    status: AgentStatus = AgentStatus.PENDING
    started_at: str = ""
    updated_at: str = ""
    iteration: int = 0
    jobs_found: int = 0
    last_search: str = ""
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "agent_id": self.agent_id,
            "platform": self.platform,
            "status": self.status.value,
            "started_at": self.started_at,
            "updated_at": self.updated_at,
            "iteration": self.iteration,
            "jobs_found": self.jobs_found,
            "last_search": self.last_search,
            "error": self.error,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "AgentState":
        """Create from dictionary."""
        return cls(
            agent_id=data.get("agent_id", 0),
            platform=data.get("platform", ""),
            status=AgentStatus(data.get("status", "pending")),
            started_at=data.get("started_at", ""),
            updated_at=data.get("updated_at", ""),
            iteration=data.get("iteration", 0),
            jobs_found=data.get("jobs_found", 0),
            last_search=data.get("last_search", ""),
            error=data.get("error"),
        )


@dataclass
class OrchestrationState:
    """State of the overall orchestration session."""
    session_id: str
    started_at: str = ""
    updated_at: str = ""
    agent_count: int = 4
    status: OrchestrationStatus = OrchestrationStatus.PENDING
    total_jobs_found: int = 0
    last_merge_at: str = ""

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "session_id": self.session_id,
            "started_at": self.started_at,
            "updated_at": self.updated_at,
            "agent_count": self.agent_count,
            "status": self.status.value,
            "total_jobs_found": self.total_jobs_found,
            "last_merge_at": self.last_merge_at,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "OrchestrationState":
        """Create from dictionary."""
        return cls(
            session_id=data.get("session_id", ""),
            started_at=data.get("started_at", ""),
            updated_at=data.get("updated_at", ""),
            agent_count=data.get("agent_count", 4),
            status=OrchestrationStatus(data.get("status", "pending")),
            total_jobs_found=data.get("total_jobs_found", 0),
            last_merge_at=data.get("last_merge_at", ""),
        )


class StateManager:
    """Manages state files for agents and orchestration."""

    def __init__(self, output_dir: Path):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def get_agent_state_path(self, agent_id: int) -> Path:
        """Get path to agent state file."""
        return self.output_dir / f"agent-{agent_id}" / "state.json"

    def get_orchestration_state_path(self) -> Path:
        """Get path to orchestration state file."""
        return self.output_dir / "orchestration-state.json"

    def get_stop_signal_path(self) -> Path:
        """Get path to stop signal file."""
        return self.output_dir / ".stop-signal"

    def read_agent_state(self, agent_id: int) -> AgentState | None:
        """Read agent state from file."""
        state_path = self.get_agent_state_path(agent_id)
        if not state_path.exists():
            return None

        try:
            with open(state_path) as f:
                data = json.load(f)
            return AgentState.from_dict(data)
        except (json.JSONDecodeError, KeyError):
            return None

    def write_agent_state(self, state: AgentState) -> None:
        """Write agent state to file."""
        state_path = self.get_agent_state_path(state.agent_id)
        state_path.parent.mkdir(parents=True, exist_ok=True)

        state.updated_at = now_iso()

        with open(state_path, "w") as f:
            json.dump(state.to_dict(), f, indent=2)

    def read_orchestration_state(self) -> OrchestrationState | None:
        """Read orchestration state from file."""
        state_path = self.get_orchestration_state_path()
        if not state_path.exists():
            return None

        try:
            with open(state_path) as f:
                data = json.load(f)
            return OrchestrationState.from_dict(data)
        except (json.JSONDecodeError, KeyError):
            return None

    def write_orchestration_state(self, state: OrchestrationState) -> None:
        """Write orchestration state to file."""
        state_path = self.get_orchestration_state_path()

        state.updated_at = now_iso()

        with open(state_path, "w") as f:
            json.dump(state.to_dict(), f, indent=2)

    def read_all_agent_states(self, agent_count: int = 4) -> list[AgentState | None]:
        """Read all agent states."""
        return [self.read_agent_state(i + 1) for i in range(agent_count)]

    def check_stop_signal(self) -> bool:
        """Check if stop signal has been set."""
        return self.get_stop_signal_path().exists()

    def set_stop_signal(self) -> None:
        """Set the stop signal."""
        stop_path = self.get_stop_signal_path()
        with open(stop_path, "w") as f:
            json.dump({"signal": "stop", "timestamp": now_iso()}, f)

    def clear_stop_signal(self) -> None:
        """Clear the stop signal."""
        stop_path = self.get_stop_signal_path()
        if stop_path.exists():
            stop_path.unlink()

    def count_jobs(self, agent_id: int) -> int:
        """Count jobs found by an agent."""
        jobs_path = self.output_dir / f"agent-{agent_id}" / "jobs.json"
        if not jobs_path.exists():
            return 0

        try:
            with open(jobs_path) as f:
                jobs = json.load(f)
            return len(jobs) if isinstance(jobs, list) else 0
        except (json.JSONDecodeError, KeyError):
            return 0

    def get_total_jobs(self, agent_count: int = 4) -> int:
        """Get total jobs found across all agents."""
        return sum(self.count_jobs(i + 1) for i in range(agent_count))
