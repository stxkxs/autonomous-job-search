# Job Search UI

Next.js frontend for browsing and tracking job applications.

## Quick Start

```bash
# From project root
make dev-full    # Starts database + UI with API mode

# Or manually:
cd ui
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Modes

### Static Mode (default)
Reads from `public/data/jobs.json`. No database required.

```bash
npm run dev
```

### API Mode
Uses PostgreSQL for persistence. Enables application tracking and interviews.

```bash
# Set in .env
NEXT_PUBLIC_USE_API=true
DATABASE_URL="postgresql://jobsearch:jobsearch@localhost:5432/jobsearch"

# Start database first
docker compose up -d db

# Push schema and start
npx prisma db push
npm run dev
```

## Features

### Job Browser
- Filter by status, score, tech stack, location
- Sort by match score or date
- Hide/unhide jobs
- Pagination

### Job Detail Panel (3 tabs)

**Overview Tab**
- Match score and company info
- Tech stack, requirements, responsibilities
- Why it's a good fit
- Questions to ask

**Application Tab**
- Status dropdown (New → Applied → Interviewing → Offer/Rejected)
- Next step with due date
- Application details (resume version, cover letter, referral, salary)
- Notes
- Timeline of events

**Interviews Tab**
- Add/edit/delete interviews
- Interview types: Phone Screen, Technical, Behavioral, System Design, etc.
- Track date, duration, location, interviewers
- Record outcome (Passed/Failed/Cancelled) and feedback

## Project Structure

```
ui/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── jobs/         # Job CRUD
│   │   │   ├── applications/ # Application CRUD
│   │   │   ├── interviews/   # Interview CRUD
│   │   │   └── stats/        # Dashboard stats
│   │   └── page.tsx          # Main page
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── job-card.tsx      # Job list item
│   │   ├── job-detail.tsx    # Detail panel with tabs
│   │   └── job-detail/       # Tab components
│   │       ├── overview-tab.tsx
│   │       ├── application-tab.tsx
│   │       ├── interviews-tab.tsx
│   │       └── interview-form.tsx
│   ├── hooks/
│   │   ├── use-jobs.ts       # Job fetching
│   │   ├── use-application.ts # Application state
│   │   └── use-interviews.ts # Interview CRUD
│   └── types/
│       ├── job.ts            # Job types
│       └── application.ts    # Application/Interview types
├── prisma/
│   └── schema.prisma         # Database schema
└── public/
    └── data/
        └── jobs.json         # Static job data
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/jobs` | List jobs (with filters) |
| GET | `/api/jobs/[id]` | Get job by ID |
| PATCH | `/api/jobs/[id]` | Update job (status, hidden) |
| GET | `/api/applications` | List applications |
| POST | `/api/applications` | Create/update application |
| PATCH | `/api/applications/[id]` | Update application |
| GET | `/api/interviews` | List interviews |
| POST | `/api/interviews` | Create interview |
| PATCH | `/api/interviews/[id]` | Update interview |
| DELETE | `/api/interviews/[id]` | Delete interview |
| GET | `/api/stats` | Dashboard statistics |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required for API mode |
| `NEXT_PUBLIC_USE_API` | Enable API mode | `false` |

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Prisma ORM
- PostgreSQL
- Framer Motion (animations)
