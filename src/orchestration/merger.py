"""
Output Merging for Orchestration
================================

Merge job outputs from multiple agents into a single deduplicated list.
"""

import json
from pathlib import Path
from typing import Any

from .config import get_output_dir, PROJECT_ROOT


def merge_outputs(output_dir: Path | None = None) -> int:
    """
    Merge outputs from all agents into a single file.

    1. Read all output/agent-*/jobs.json
    2. Combine into single list
    3. Deduplicate by job_url
    4. Sort by match_score descending
    5. Write to output/merged/jobs.json

    Args:
        output_dir: Base output directory (defaults to project output/)

    Returns:
        Count of merged jobs
    """
    if output_dir is None:
        output_dir = get_output_dir()
    else:
        output_dir = Path(output_dir)

    all_jobs: list[dict[str, Any]] = []
    seen_urls: set[str] = set()

    # Read jobs from each agent directory
    for agent_dir in sorted(output_dir.glob("agent-*")):
        jobs_file = agent_dir / "jobs.json"
        if not jobs_file.exists():
            continue

        try:
            with open(jobs_file) as f:
                jobs = json.load(f)

            if not isinstance(jobs, list):
                continue

            for job in jobs:
                job_url = job.get("job_url", "")
                if job_url and job_url not in seen_urls:
                    seen_urls.add(job_url)
                    all_jobs.append(job)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not read {jobs_file}: {e}")
            continue

    # Sort by match_score descending
    all_jobs.sort(key=lambda j: j.get("match_score", 0), reverse=True)

    # Write merged output
    merged_dir = output_dir / "merged"
    merged_dir.mkdir(parents=True, exist_ok=True)

    merged_file = merged_dir / "jobs.json"
    with open(merged_file, "w") as f:
        json.dump(all_jobs, f, indent=2)

    print(f"Merged {len(all_jobs)} unique jobs to {merged_file}")

    # Also copy to UI static data for non-API mode
    ui_data_file = PROJECT_ROOT / "ui" / "public" / "data" / "jobs.json"
    ui_data_file.parent.mkdir(parents=True, exist_ok=True)
    with open(ui_data_file, "w") as f:
        json.dump(all_jobs, f, indent=2)
    print(f"Copied to UI static data: {ui_data_file}")

    # Also merge companies if present
    merge_companies(output_dir)

    return len(all_jobs)


def merge_companies(output_dir: Path) -> int:
    """
    Merge company data from all agents.

    Args:
        output_dir: Base output directory

    Returns:
        Count of merged companies
    """
    all_companies: dict[str, dict[str, Any]] = {}

    # Read companies from each agent directory
    for agent_dir in sorted(output_dir.glob("agent-*")):
        companies_file = agent_dir / "companies.json"
        if not companies_file.exists():
            continue

        try:
            with open(companies_file) as f:
                companies = json.load(f)

            # Handle both list and dict formats
            if isinstance(companies, list):
                for company in companies:
                    name = company.get("name", "")
                    if name:
                        all_companies[name] = company
            elif isinstance(companies, dict):
                for name, data in companies.items():
                    all_companies[name] = data
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not read {companies_file}: {e}")
            continue

    if not all_companies:
        return 0

    # Write merged output
    merged_dir = output_dir / "merged"
    merged_dir.mkdir(parents=True, exist_ok=True)

    merged_file = merged_dir / "companies.json"
    with open(merged_file, "w") as f:
        json.dump(list(all_companies.values()), f, indent=2)

    print(f"Merged {len(all_companies)} companies to {merged_file}")

    return len(all_companies)


def get_merge_stats(output_dir: Path | None = None) -> dict[str, Any]:
    """
    Get statistics about merged outputs.

    Args:
        output_dir: Base output directory

    Returns:
        Dictionary with merge statistics
    """
    if output_dir is None:
        output_dir = get_output_dir()
    else:
        output_dir = Path(output_dir)

    merged_jobs_file = output_dir / "merged" / "jobs.json"
    merged_companies_file = output_dir / "merged" / "companies.json"

    stats = {
        "merged_jobs": 0,
        "merged_companies": 0,
        "agents": {},
    }

    if merged_jobs_file.exists():
        try:
            with open(merged_jobs_file) as f:
                jobs = json.load(f)
            stats["merged_jobs"] = len(jobs)
        except (json.JSONDecodeError, IOError):
            pass

    if merged_companies_file.exists():
        try:
            with open(merged_companies_file) as f:
                companies = json.load(f)
            stats["merged_companies"] = len(companies)
        except (json.JSONDecodeError, IOError):
            pass

    # Get per-agent stats
    for agent_dir in sorted(output_dir.glob("agent-*")):
        agent_name = agent_dir.name
        jobs_file = agent_dir / "jobs.json"

        agent_jobs = 0
        if jobs_file.exists():
            try:
                with open(jobs_file) as f:
                    jobs = json.load(f)
                agent_jobs = len(jobs) if isinstance(jobs, list) else 0
            except (json.JSONDecodeError, IOError):
                pass

        stats["agents"][agent_name] = {"jobs": agent_jobs}

    return stats
