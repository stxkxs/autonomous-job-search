"""
Prompt Loading Utilities
========================

Load prompt templates from the prompts directory.
"""

import shutil
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def load_prompt(name: str) -> str:
    """Load a prompt template by name."""
    prompt_file = PROMPTS_DIR / f"{name}.md"
    if not prompt_file.exists():
        raise FileNotFoundError(f"Prompt not found: {prompt_file}")
    return prompt_file.read_text()


def get_initializer_prompt() -> str:
    """Load the initializer prompt for first session."""
    return load_prompt("initializer_prompt")


def get_coding_prompt() -> str:
    """Load the coding prompt for continuation sessions."""
    return load_prompt("coding_prompt")


def copy_spec_to_project(project_dir: Path, platform: str, skills: list[str]) -> None:
    """Copy and customize the app spec to the project directory."""
    spec_file = PROMPTS_DIR / "app_spec.txt"
    if spec_file.exists():
        dest = project_dir / "app_spec.txt"
        if not dest.exists():
            # Read template and customize
            content = spec_file.read_text()
            content = content.replace("{{PLATFORM}}", platform)
            content = content.replace("{{SKILLS}}", ", ".join(skills))
            dest.write_text(content)
            print(f"Created app_spec.txt at {dest}")
