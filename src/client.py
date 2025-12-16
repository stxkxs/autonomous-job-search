"""
Claude Agent SDK Client Configuration
=====================================

Configured client using Claude Code CLI (uses your existing authentication).
"""

import json
from pathlib import Path

from claude_agent_sdk import query, ClaudeAgentOptions

# System prompt for the freelance assistant agent
SYSTEM_PROMPT = """You are an expert freelance business assistant helping users find and win freelance work.

Your capabilities:
- Read, write, and edit files
- Execute bash commands (within allowed list)
- Search the web for job listings
- Analyze job requirements and match skills
- Draft professional proposals and cover letters
- Track applications and follow-ups

Guidelines:
1. Always read existing files before modifying them
2. Maintain organized records of all job searches and applications
3. Draft personalized proposals that highlight relevant experience
4. Track response rates and optimize approach over time
5. Focus on quality matches over quantity
6. Never apply to scam listings or suspicious job posts
7. Respect platform terms of service
8. Keep user credentials and personal info secure
"""


def create_client_options(project_dir: Path, model: str) -> ClaudeAgentOptions:
    """
    Create configured Claude Agent options.

    Uses your existing Claude Code CLI authentication - no API key needed.

    Args:
        project_dir: Working directory for the agent
        model: Claude model to use

    Returns:
        Configured ClaudeAgentOptions
    """
    # Write settings file
    settings = {
        "permissions": {
            "allow": ["./**"],
            "deny": ["../**", "~/**"],
        },
    }
    settings_path = project_dir / ".claude_settings.json"
    with open(settings_path, "w") as f:
        json.dump(settings, f, indent=2)

    # Create options - uses CLI authentication, fully autonomous
    return ClaudeAgentOptions(
        system_prompt=SYSTEM_PROMPT,
        max_turns=100,
        cwd=str(project_dir),
        allowed_tools=["Read", "Write", "Edit", "Glob", "Grep", "Bash", "WebSearch", "WebFetch", "TodoWrite"],
        permission_mode="acceptEdits",  # Auto-accept without prompting
    )


async def run_query(prompt: str, options: ClaudeAgentOptions):
    """
    Run a query using Claude Code CLI authentication.

    Args:
        prompt: The prompt to send
        options: Configured options

    Yields:
        Events from the Claude response
    """
    async for message in query(prompt=prompt, options=options):
        yield message
