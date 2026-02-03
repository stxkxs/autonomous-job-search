"""
Configuration Loading for Orchestration
========================================

Load agent configurations from config files.
"""

import json
from pathlib import Path

from .types import AgentConfig, OrchestrationConfig, ScoringConfig

# Project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent


def get_config_path() -> Path:
    """Get path to agents.json config file."""
    return PROJECT_ROOT / "config" / "agents.json"


def load_config() -> OrchestrationConfig:
    """
    Load orchestration configuration from config/agents.json.

    Returns:
        OrchestrationConfig with agent and scoring settings
    """
    config_path = get_config_path()

    if not config_path.exists():
        # Return default config if file doesn't exist
        return get_default_config()

    with open(config_path) as f:
        data = json.load(f)

    return OrchestrationConfig.from_dict(data)


def get_default_config() -> OrchestrationConfig:
    """
    Get default orchestration configuration.

    Returns:
        Default OrchestrationConfig with 4 agents
    """
    return OrchestrationConfig(
        agents=[
            AgentConfig(
                id=1,
                name="GREENHOUSE",
                platform="greenhouse",
                domain="boards.greenhouse.io",
                prompt_file="prompts/agents/greenhouse-agent.md",
            ),
            AgentConfig(
                id=2,
                name="LEVER",
                platform="lever",
                domain="jobs.lever.co",
                prompt_file="prompts/agents/lever-agent.md",
            ),
            AgentConfig(
                id=3,
                name="ASHBY",
                platform="ashby",
                domain="jobs.ashbyhq.com",
                prompt_file="prompts/agents/ashby-agent.md",
            ),
            AgentConfig(
                id=4,
                name="WORKABLE",
                platform="workable",
                domain="apply.workable.com",
                prompt_file="prompts/agents/workable-agent.md",
            ),
        ],
        scoring=ScoringConfig(
            min_score=70,
            max_jobs_per_agent=75,
        ),
    )


def get_agent_config(agent_id: int) -> AgentConfig | None:
    """
    Get configuration for a specific agent.

    Args:
        agent_id: The agent ID (1-4)

    Returns:
        AgentConfig or None if not found
    """
    config = load_config()
    for agent in config.agents:
        if agent.id == agent_id:
            return agent
    return None


def get_agent_prompt(platform: str) -> str:
    """
    Load the prompt for a specific platform agent.

    Args:
        platform: Platform name (greenhouse, lever, ashby, workable)

    Returns:
        The prompt content as a string
    """
    prompt_file = PROJECT_ROOT / "prompts" / "agents" / f"{platform}-agent.md"

    if not prompt_file.exists():
        raise FileNotFoundError(f"Agent prompt not found: {prompt_file}")

    return prompt_file.read_text()


def get_output_dir() -> Path:
    """Get the base output directory."""
    return PROJECT_ROOT / "output"


def get_agent_output_dir(agent_id: int) -> Path:
    """Get output directory for a specific agent."""
    return get_output_dir() / f"agent-{agent_id}"
