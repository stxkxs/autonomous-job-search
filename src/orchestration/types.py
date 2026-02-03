"""
Type Definitions for Orchestration System
==========================================

Dataclasses and type definitions used across the orchestration module.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any


class AgentStatus(str, Enum):
    """Status of an individual agent."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    STOPPED = "stopped"
    ERROR = "error"


class OrchestrationStatus(str, Enum):
    """Status of the overall orchestration session."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    STOPPED = "stopped"
    ERROR = "error"


@dataclass
class AgentConfig:
    """Configuration for a single agent."""
    id: int
    name: str
    platform: str
    domain: str
    prompt_file: str


@dataclass
class ScoringConfig:
    """Scoring configuration for job matching."""
    min_score: int = 70
    max_jobs_per_agent: int = 75


@dataclass
class OrchestrationConfig:
    """Full orchestration configuration."""
    agents: list[AgentConfig] = field(default_factory=list)
    scoring: ScoringConfig = field(default_factory=ScoringConfig)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "OrchestrationConfig":
        """Create config from dictionary."""
        agents = [
            AgentConfig(
                id=a["id"],
                name=a["name"],
                platform=a["platform"],
                domain=a["domain"],
                prompt_file=a["prompt_file"],
            )
            for a in data.get("agents", [])
        ]
        scoring_data = data.get("scoring", {})
        scoring = ScoringConfig(
            min_score=scoring_data.get("min_score", 70),
            max_jobs_per_agent=scoring_data.get("max_jobs_per_agent", 75),
        )
        return cls(agents=agents, scoring=scoring)


@dataclass
class Job:
    """A job posting found by an agent."""
    id: str
    job_url: str
    ats_platform: str
    company: str
    role: str
    location: str
    salary: str
    found_date: str
    match_score: int
    status: str = "new"
    requirements: list[str] = field(default_factory=list)
    tech_stack: list[str] = field(default_factory=list)
    responsibilities: list[str] = field(default_factory=list)
    company_size: str = ""
    glassdoor_rating: str = ""
    funding: str = ""
    why_good_fit: str = ""
    experience_to_highlight: list[str] = field(default_factory=list)
    questions_to_ask: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "job_url": self.job_url,
            "ats_platform": self.ats_platform,
            "company": self.company,
            "role": self.role,
            "location": self.location,
            "salary": self.salary,
            "found_date": self.found_date,
            "match_score": self.match_score,
            "status": self.status,
            "requirements": self.requirements,
            "tech_stack": self.tech_stack,
            "responsibilities": self.responsibilities,
            "company_size": self.company_size,
            "glassdoor_rating": self.glassdoor_rating,
            "funding": self.funding,
            "why_good_fit": self.why_good_fit,
            "experience_to_highlight": self.experience_to_highlight,
            "questions_to_ask": self.questions_to_ask,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Job":
        """Create from dictionary."""
        return cls(
            id=data.get("id", ""),
            job_url=data.get("job_url", ""),
            ats_platform=data.get("ats_platform", ""),
            company=data.get("company", ""),
            role=data.get("role", ""),
            location=data.get("location", ""),
            salary=data.get("salary", "Not listed"),
            found_date=data.get("found_date", ""),
            match_score=data.get("match_score", 0),
            status=data.get("status", "new"),
            requirements=data.get("requirements", []),
            tech_stack=data.get("tech_stack", []),
            responsibilities=data.get("responsibilities", []),
            company_size=data.get("company_size", ""),
            glassdoor_rating=data.get("glassdoor_rating", ""),
            funding=data.get("funding", ""),
            why_good_fit=data.get("why_good_fit", ""),
            experience_to_highlight=data.get("experience_to_highlight", []),
            questions_to_ask=data.get("questions_to_ask", []),
        )
