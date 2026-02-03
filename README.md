# autonomous-job-search

> Autonomous job search agent powered by Claude. Searches multiple ATS platforms in parallel, researches companies, and prepares application materials - you just apply.

## Quick Start

```bash
# Install
git clone https://github.com/stxkxs/autonomous-job-search.git
cd autonomous-job-search
uv pip install -e .

# Configure your profile
cp prompts/initializer_prompt.md.example prompts/resume.md
# Edit prompts/resume.md with YOUR details (skills, experience, target roles)

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
- Docker (optional, for web UI with database)

### Claude Code Authentication

This tool uses the Claude Agent SDK which authenticates through your existing Claude Code CLI session. No separate API key configuration is needed - just ensure you're logged into Claude Code:

```bash
claude  # This will prompt for login if not authenticated
```

## Configuration

### Candidate Profile (`prompts/resume.md`)

This is the most important file - it defines who you are and what jobs to find. Copy the example and customize:

```bash
cp prompts/initializer_prompt.md.example prompts/resume.md
```

Your profile should include:
- **Personal info**: Name, location, remote preferences
- **Target roles**: Job titles you're looking for (in priority order)
- **Technical skills**: Languages, cloud platforms, tools (with proficiency levels)
- **Experience highlights**: Key achievements with metrics
- **Scoring criteria**: What makes a job 90+ vs 80+ vs skip
- **Company preferences**: Industries to target or avoid
- **Compensation expectations**: Salary range, equity preferences

### Agent Configuration (`config/agents.json`)

Controls which ATS platforms to search and scoring thresholds:

```json
{
  "agents": [
    {
      "id": 1,
      "name": "GREENHOUSE",
      "platform": "greenhouse",
      "domain": "boards.greenhouse.io",
      "prompt_file": "prompts/agents/greenhouse-agent.md"
    }
    // ... more agents
  ],
  "scoring": {
    "min_score": 65,       // Jobs below this score are skipped
    "max_jobs_per_agent": 100
  }
}
```

### Adding a Custom ATS Platform

1. Create a new agent prompt file in `prompts/agents/`:
   ```bash
   cp prompts/agents/greenhouse-agent.md prompts/agents/myplatform-agent.md
   ```

2. Edit the prompt to use the correct domain and search patterns

3. Add the agent to `config/agents.json`:
   ```json
   {
     "id": 5,
     "name": "MYPLATFORM",
     "platform": "myplatform",
     "domain": "jobs.myplatform.com",
     "prompt_file": "prompts/agents/myplatform-agent.md"
   }
   ```

4. Run with the new agent count: `make agents-start` or `python -m src.orchestration start -n 5`

## CLI Options

```bash
# Multi-agent orchestration (recommended)
python -m src.orchestration start           # Start all 4 agents
python -m src.orchestration start -n 2      # Start only 2 agents
python -m src.orchestration start -i 5      # Limit to 5 iterations per agent
python -m src.orchestration status          # Show status dashboard
python -m src.orchestration merge           # Merge outputs now
python -m src.orchestration stop            # Stop all agents

# Single-agent mode (searches all platforms sequentially)
python -m src.main --project-dir ./output
python -m src.main --max-iterations 10

# Platform-specific single-agent modes
python -m src.main --platform upwork        # Search Upwork freelance jobs
python -m src.main --platform fiverr        # Search Fiverr gigs
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

### Match Scoring

Jobs are scored 0-100 based on fit with your profile. The scoring criteria are defined in `prompts/resume.md`:

| Score | Level | Meaning |
|-------|-------|---------|
| 90-100 | Priority | Perfect match - apply immediately |
| 85-89 | High | Strong match - high interest |
| 80-84 | Good | Good match - worth considering |
| 70-79 | Moderate | Partial match - review carefully |
| <70 | Low | Weak match - usually skipped |

The `min_score` in `config/agents.json` (default: 65) filters out low-scoring jobs.

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

### Static vs API Mode

The UI supports two data modes:

| Mode | When to Use | Setup |
|------|-------------|-------|
| **Static** | Quick viewing, no persistence | Just `make ui` - reads from `ui/public/data/jobs.json` |
| **API** | Full tracking, persistence | `make dev-full` - requires PostgreSQL |

To switch modes, set `NEXT_PUBLIC_USE_API` in `ui/.env`:
```bash
NEXT_PUBLIC_USE_API=false  # Static mode (default)
NEXT_PUBLIC_USE_API=true   # API mode (requires database)
```

## Environment Variables

### Root Directory (`.env`)

```bash
# Not typically needed - Claude Agent SDK uses Claude Code CLI auth
# Only set if using direct API access
ANTHROPIC_API_KEY=your-api-key-here
```

### UI Directory (`ui/.env`)

```bash
# Database connection (required for API mode)
DATABASE_URL="postgresql://jobsearch:jobsearch@localhost:5432/jobsearch"

# Enable API mode (set to true to use database instead of static JSON)
NEXT_PUBLIC_USE_API=true
```

## Development

```bash
# Install with dev dependencies
make dev

# Run tests
make test

# Lint code
make lint

# Format code
make format

# Type check
make typecheck

# Clean build artifacts
make clean

# See all available commands
make help
```

## Troubleshooting

### Agents not finding jobs

1. **Check your profile**: Ensure `prompts/resume.md` exists and has relevant keywords
2. **Lower the score threshold**: Edit `config/agents.json` and reduce `min_score`
3. **Check agent logs**: Look at `output/agent-N/session.log` for errors
4. **Check blocked status**: If an agent gets stuck, it writes to `output/agent-N/blocked.md`

### Authentication errors

```bash
# Re-authenticate with Claude Code
claude --login

# Verify authentication works
claude --version
```

### Database connection issues

```bash
# Check if PostgreSQL is running
docker compose ps

# Reset the database
make docker-reset

# Or just restart
make docker-down && make docker-up
```

### UI not loading jobs

1. **Static mode**: Ensure `ui/public/data/jobs.json` exists and has jobs
2. **API mode**: Run `make import-jobs` after agents complete
3. **Check browser console**: Look for network errors

### Clearing all data to start fresh

```bash
# Clear agent outputs only (preserves UI data)
make reset

# Clear everything including database
make reset-all
make db-reset  # If using API mode
```

### Rate limiting

Agents wait 3-5 seconds between requests by default. If you're still getting rate-limited:
1. Reduce the number of parallel agents: `make agents-start-2`
2. Increase iteration delay in agent prompts

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

## How It Compares to Manual Job Search

| Aspect | Manual Search | autonomous-job-search |
|--------|---------------|----------------------|
| Time to search 4 ATS platforms | 2-4 hours | 20-30 minutes (parallel) |
| Company research | Per-job, often skipped | Automatic for every job |
| Application prep | Start from scratch | Tailored talking points ready |
| Score consistency | Varies by mood | Consistent criteria |
| Coverage | Miss opportunities | Systematic scanning |

## Contributing

Contributions welcome! Some ideas:

- Add support for new ATS platforms (BambooHR, Jobvite, etc.)
- Improve job deduplication logic
- Add resume tailoring features
- Create browser extension for one-click apply

## Acknowledgments

- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) - Powers the autonomous agents
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) - Handles authentication

## License

MIT
