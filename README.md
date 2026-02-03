# autonomous-job-search

> Autonomous job search agent powered by Claude. Searches multiple ATS platforms in parallel, researches companies, and prepares application materials - you just apply.

## Quick Start

```bash
# Install
git clone https://github.com/stxkxs/autonomous-job-search.git
cd autonomous-job-search
uv pip install -e .

# Configure your profile (edit with your skills/experience)
cp prompts/resume.md.example prompts/resume.md
# Edit prompts/resume.md with YOUR details

# Run 4 parallel agents
make search
```

That's it. Four agents search Greenhouse, Lever, Ashby, and Workable simultaneously. Results merge to `output/merged/jobs.json`.

## How It Works

This tool uses the **Claude Agent SDK** with your existing **Claude Code CLI** authentication. No API keys needed.

```
┌─────────────────────────────────────────────────────────────┐
│                    Coordinator (Python)                      │
│  - Spawns 4 agent tasks via asyncio                         │
│  - Monitors progress via state files                        │
│  - Triggers merge when agents complete                      │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ Agent 1 │   │ Agent 2 │   │ Agent 3 │   │ Agent 4 │
    │Greenhouse│   │  Lever  │   │  Ashby  │   │Workable │
    └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
    output/         output/         output/         output/
    agent-1/        agent-2/        agent-3/        agent-4/
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │   Merger        │
                    │ Dedupes by URL  │
                    │ Sorts by score  │
                    └────────┬────────┘
                             │
                             ▼
                    output/merged/jobs.json
```

## Commands

```bash
# Multi-Agent Orchestration
make search           # Start all 4 agents (alias for agents-start)
make agents-start     # Start all 4 agents
make agents-start-2   # Start only 2 agents
make agents-status    # Show agent status dashboard
make agents-merge     # Merge outputs manually
make agents-stop      # Stop all agents gracefully

# View Results
make docker-up        # Start PostgreSQL
make import-jobs      # Import merged jobs to database
make ui               # Start web UI at localhost:3000

# Cleanup
make docker-down      # Stop database
make reset            # Clear agent outputs
```

## Supported ATS Platforms

Each agent searches one platform in parallel:

| Agent | Platform | Domain | Example Companies |
|-------|----------|--------|-------------------|
| 1 | **Greenhouse** | `boards.greenhouse.io` | Stripe, Airbnb, Datadog, Figma, Notion |
| 2 | **Lever** | `jobs.lever.co` | Netflix, Shopify, Twitch, Lyft, Atlassian |
| 3 | **Ashby** | `jobs.ashbyhq.com` | Ramp, OpenAI, Deel, Vercel, Linear |
| 4 | **Workable** | `apply.workable.com` | Various startups and mid-size companies |

Configure agents in `config/agents.json`.

## Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- Docker (optional, for web UI database)

## CLI Options

```bash
# Multi-agent orchestration (recommended)
python -m src.orchestration start           # Start all 4 agents
python -m src.orchestration start -n 2      # Start only 2 agents
python -m src.orchestration start -i 5      # Limit to 5 iterations per agent
python -m src.orchestration status          # Show status dashboard
python -m src.orchestration merge           # Merge outputs now
python -m src.orchestration stop            # Stop all agents

# Single-agent mode (legacy)
python -m src.main --project-dir ./output
python -m src.main --max-iterations 10
```

## Output

```
output/
├── agent-1/                 # Greenhouse agent
│   ├── state.json          # Agent status
│   ├── jobs.json           # Jobs found
│   └── session.log         # Activity log
├── agent-2/                 # Lever agent
├── agent-3/                 # Ashby agent
├── agent-4/                 # Workable agent
├── merged/
│   ├── jobs.json           # Combined, deduplicated
│   └── companies.json      # Combined company data
└── orchestration-state.json # Session status
```

### Job Entry Example

```json
{
  "id": "job-001",
  "job_url": "https://boards.greenhouse.io/company/jobs/12345",
  "ats_platform": "greenhouse",
  "company": "TechCorp",
  "role": "Senior Platform Engineer",
  "location": "Remote (US)",
  "salary": "$180k-220k",
  "found_date": "2025-01-15",
  "match_score": 92,
  "requirements": ["Python", "AWS", "Kubernetes", "5+ years"],
  "tech_stack": ["Python", "Go", "AWS", "Terraform", "Kubernetes"],
  "responsibilities": [
    "Design and build internal developer platform",
    "Lead migration from ECS to Kubernetes",
    "Establish SLOs and observability standards"
  ],
  "glassdoor_rating": "4.2",
  "company_size": "500-1000",
  "funding": "Series C ($120M)",
  "why_good_fit": "Strong platform focus using your exact stack. Team is building greenfield K8s platform - matches your migration experience at Previous Co.",
  "experience_to_highlight": [
    "Led EKS platform serving 200+ microservices at Previous Co",
    "AWS Solutions Architect Pro certification",
    "Built self-service deployment pipeline reducing deploy time 80%"
  ],
  "questions_to_ask": [
    "What's the current state of the K8s migration and timeline?",
    "How does the platform team interact with product engineering?",
    "What observability stack are you using or evaluating?"
  ]
}
```

## Status Dashboard

Check agent progress anytime:

```bash
make agents-status
```

```
+==============================================================+
|                  Job Search Orchestration                    |
+==============================================================+
| Agent 1 (GREENHOUSE) | RUNNING  | Iter 5   | 12 jobs  |  10m |
| Agent 2 (LEVER     ) | RUNNING  | Iter 3   |  8 jobs  |   5m |
| Agent 3 (ASHBY     ) | COMPLETE | Iter 7   | 15 jobs  |   2m |
| Agent 4 (WORKABLE  ) | RUNNING  | Iter 4   | 10 jobs  |   8m |
+--------------------------------------------------------------+
| Total: 45 jobs found | 3/4 running | Last merge:    5m ago |
+==============================================================+
```

## Web UI

Browse your job catalog with the Next.js frontend:

```bash
# Start database and UI with API mode
make dev-full

# Or manually:
make docker-up        # Start PostgreSQL
make import-jobs      # Import merged jobs
make ui               # Start UI (static mode)
```

Open [http://localhost:3000](http://localhost:3000) to:
- Browse all discovered jobs with filtering and sorting
- View match scores and detailed job information
- Filter by ATS platform, tech stack, location
- Hide/unhide jobs you're not interested in

### Application Tracking

The job detail panel has three tabs:

| Tab | Features |
|-----|----------|
| **Overview** | Job details, tech stack, requirements, why it's a good fit |
| **Application** | Status tracking, next steps, resume version, referral info, notes, timeline |
| **Interviews** | Schedule interviews, track outcomes, add notes and feedback |

To track an application:
1. Select a job from the list
2. Go to the **Application** tab
3. Change the status (e.g., "Applied") - this creates the application record
4. Add next steps, notes, referral info as needed
5. Go to **Interviews** tab to schedule and track interviews

## Project Structure

```
autonomous-job-search/
├── src/
│   ├── main.py              # Single-agent CLI entry
│   ├── agent.py             # Agent session loop
│   ├── client.py            # Claude Agent SDK config
│   ├── prompts.py           # Prompt loading
│   └── orchestration/       # Multi-agent orchestration
│       ├── __main__.py      # CLI: python -m src.orchestration
│       ├── coordinator.py   # Spawns & monitors agents
│       ├── agent_runner.py  # Per-agent execution
│       ├── merger.py        # Dedupe & merge outputs
│       └── state.py         # State file management
├── config/
│   └── agents.json          # Agent definitions
├── prompts/
│   ├── resume.md            # Your profile (gitignored)
│   └── agents/              # Platform-specific prompts
│       ├── greenhouse-agent.md
│       ├── lever-agent.md
│       ├── ashby-agent.md
│       └── workable-agent.md
├── ui/                      # Next.js job catalog viewer
└── output/                  # Generated outputs
    ├── agent-1/             # Greenhouse agent output
    ├── agent-2/             # Lever agent output
    ├── agent-3/             # Ashby agent output
    ├── agent-4/             # Workable agent output
    └── merged/              # Combined, deduplicated jobs
        └── jobs.json
```

## License

MIT
