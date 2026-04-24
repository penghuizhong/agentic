# Repository Overview

A bilingual (Chinese/English) AI education platform with a FastAPI backend and Next.js frontend.

**方圆智版 (Fang Yuan Zhi Ban)** - AI-powered course generation and tutoring system.

## Monorepo Structure

```
/Users/mac/ai424/
├── ai_server/              # Python FastAPI backend
│   ├── src/
│   │   ├── agents/         # LangGraph AI agents (see agents/AGENTS.md)
│   │   ├── core/           # FastAPI app, config, celery
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schema/         # Pydantic schemas
│   │   ├── service/        # Business logic
│   │   ├── memory/         # Conversation memory
│   │   ├── scripts/        # Data ingestion, seeding
│   │   └── pages/          # Streamlit admin UI
│   ├── alembic/            # Database migrations
│   ├── docker/             # Dockerfiles
│   ├── compose.yaml        # Full stack orchestration
│   └── pyproject.toml      # Python dependencies (uv)
│
└── ai_server_web_next/     # Next.js 16 frontend
    ├── app/                # App router
    ├── components/         # React components (shadcn/ui)
    ├── hooks/              # Custom React hooks
    ├── lib/                # Utilities
    └── public/             # Static assets
```

## Quick Start

### Backend (ai_server/)

```bash
cd ai_server

# Setup (requires Python 3.11+)
uv sync --all-groups
source .venv/bin/activate

# Database (Docker required)
docker compose up postgres redis -d
alembic upgrade head
python -m scripts.seed_runner

# Run services
python run_service.py                    # FastAPI on :8000
streamlit run src/streamlit_admin.py     # Admin on :8501

# Or run everything with Docker
docker compose up -d
```

### Frontend (ai_server_web_next/)

```bash
cd ai_server_web_next

# Setup (requires pnpm)
pnpm install

# Development
pnpm dev          # Next.js on :3000
pnpm test         # Vitest run
pnpm test:watch   # Vitest watch mode
pnpm lint         # ESLint check
```

## Key Commands

| Task | Backend | Frontend |
|------|---------|----------|
| Install deps | `uv sync --all-groups` | `pnpm install` |
| Run dev | `python run_service.py` | `pnpm dev` |
| Run tests | `pytest` | `pnpm test` |
| Lint | `ruff check .` | `pnpm lint` |
| Type check | `mypy src/` | (built into next build) |
| DB migrate | `alembic upgrade head` | N/A |

## Architecture Notes

### Backend Stack
- **FastAPI** - Web framework with Pydantic v2
- **LangGraph** - AI agent workflow orchestration
- **LangChain** - LLM integrations (OpenAI, Anthropic, Google, etc.)
- **LlamaIndex** - RAG retrieval (uses PGVector)
- **PostgreSQL + pgvector** - Database and vector store
- **Redis** - Cache and Celery broker
- **Celery** - Background task queue
- **Alembic** - Database migrations
- **Streamlit** - Admin dashboard

### Frontend Stack
- **Next.js 16** - React framework (App Router)
- **React 19** - UI library
- **Tailwind CSS 4** - Styling (PostCSS-based)
- **shadcn/ui** - Component library (Radix + Tailwind)
- **Vitest** - Testing framework
- **Geist** - Font

## Environment Setup

Both packages require `.env` files:

**ai_server/.env** (copy from .env.example):
- `POSTGRES_*` - Database connection
- `REDIS_URL` - Redis connection
- API keys: `OPENAI_API_KEY`, `DASHSCOPE_API_KEY`, etc.
- `LANGSMITH_API_KEY` - For LangGraph observability

**ai_server_web_next/.env.local**:
- `NEXT_PUBLIC_API_URL` - Backend API endpoint

## Testing

**Backend:**
```bash
pytest                    # Run all tests
pytest -xvs             # Verbose, stop on first failure
pytest --cov=src        # With coverage
```

**Frontend:**
```bash
pnpm test               # Single run
pnpm test:watch         # Watch mode
```

## Docker Development

The `compose.yaml` orchestrates the full stack:
- `postgres` - PostgreSQL 16 with pgvector
- `redis` - Redis 7
- `migrate` - One-time Alembic migrations + seeding
- `ai_server` - FastAPI backend (:8000)
- `streamlit_admin` - Admin panel (:8501)
- `celery_worker` - Background task processor

**Watch mode** is configured for hot reload of source changes.

## Code Conventions

### Python (ai_server/)
- **Ruff** for linting and import sorting
- **MyPy** for type checking (Pydantic plugin enabled)
- Line length: 100 characters
- Target Python: 3.11+
- Source lives in `src/`, run with `pythonpath = ["src"]`

### TypeScript (ai_server_web_next/)
- **ESLint** with Next.js core-web-vitals + TypeScript configs
- Path alias `@/*` maps to root
- Vitest configured with `@testing-library/jest-dom`

## Important Constraints

1. **Database migrations** - Always run `alembic upgrade head` before starting the backend
2. **Agent registry** - Agents are registered in `src/agents/agents.py` (see `src/agents/AGENTS.md` for details)
3. **Lazy loading** - Agents requiring async setup must use `load_agent()` before `get_agent()`
4. **Prompt injection** - All user-facing agents must route through the Safeguard check
5. **Vector embeddings** - Must match dimension used during ingestion (1024 for DashScope)

## References

- Backend agents: `ai_server/src/agents/AGENTS.md`
- Python deps: `ai_server/pyproject.toml`
- Frontend deps: `ai_server_web_next/package.json`
- Docker setup: `ai_server/compose.yaml`
