# 方圆智版 (Fang Yuan Zhi Ban) AI Platform

Educational AI platform with FastAPI backend and Next.js frontend.

## Architecture

```
/Users/mac/agentic/
├── api/                    # FastAPI backend
│   ├── src/
│   │   ├── agents/        # LangGraph AI agents (has its own AGENTS.md)
│   │   ├── core/          # Config, security, rate limiting, LLM
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schema/        # Pydantic schemas
│   │   ├── service/       # FastAPI service routes
│   │   ├── memory/        # PostgreSQL checkpointer/store
│   │   └── scripts/       # Data ingestion, seeds
│   ├── alembic/           # Database migrations
│   └── docker/            # Dockerfiles
└── web/                   # Next.js 16 frontend
    ├── app/               # App router
    ├── components/        # React components (shadcn/ui)
    ├── hooks/             # Custom React hooks
    └── lib/               # Utilities, API client, auth
```

## Quick Start

### Prerequisites
- Python 3.11+ (backend)
- Node.js + pnpm (frontend)
- Docker & Docker Compose (full stack)

### Development Commands

**Full stack (recommended for new developers):**
```bash
cd api && docker compose up --build
```

**Backend only:**
```bash
cd api
# Setup
python -m venv venv && source venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env  # Edit with your API keys

# Database (needs PostgreSQL + Redis running)
alembic upgrade head
python -m scripts.seed_runner

# Run
python -m run_service  # Or: uvicorn service.service:app --reload
```

**Frontend only:**
```bash
cd web
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # Vitest
pnpm lint       # ESLint
```

## Key Configuration

### Environment Variables (api/.env)

**Required for basic operation:**
- One LLM API key: `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `DASHSCOPE_API_KEY`, etc.
- `POSTGRES_*` - Database connection
- `REDIS_URL` - Cache and Celery broker

**Multi-provider LLM support:**
- `DEFAULT_MODEL` - Sets the default model (e.g., `qwen-turbo`, `gpt-5-nano`)
- Multiple providers can be enabled simultaneously
- Available models auto-detected from configured API keys

See `api/.env.example` for full configuration options.

## Database & Migrations

**Migration workflow:**
```bash
cd api
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1  # Rollback one
```

**Key tables (prefixed with `agent_server_`):**
- Users, roles, permissions (RBAC)
- Courses
- Checkpoints (LangGraph conversation state)
- Vector store (pgvector for RAG)

## Testing

**Backend:**
```bash
cd api
pytest
pytest --cov  # With coverage
```
- Config in `pyproject.toml`
- Fake model used for tests (`pytest_env` sets `OPENAI_API_KEY=fake`)

**Frontend:**
```bash
cd web
pnpm test          # Run once
pnpm test:watch    # Watch mode
```
- Vitest + React Testing Library + jsdom
- Config in `vitest.config.ts`

## Code Style

**Backend:**
- Ruff for linting/formatting (line-length: 100)
- MyPy for type checking
- Import sorting enabled (`extend-select = ["I", "U"]`)

**Frontend:**
- ESLint with Next.js config
- Tailwind CSS v4
- shadcn/ui components (radix-nova style)

## Key Conventions

### API (FastAPI)

**Agent system** (`src/agents/`):
- Registry pattern in `agents.py` - all agents registered with string ID
- Default agent: `"rag-assistant"`
- Lazy loading for agents with async setup (MCP clients, DB connections)
- Always `await load_agent(id)` before `get_agent(id)`
- Prompt injection safeguard mandatory for user-facing agents
- See `api/src/agents/AGENTS.md` for detailed agent conventions

**Models** (`src/schema/models.py`):
- Provider enum covers 12+ LLM providers
- Model names are StrEnum values (e.g., `OpenAIModelName.GPT_5_NANO`)
- Azure OpenAI requires deployment map configuration

**Authentication:**
- JWT tokens (access + refresh)
- HTTP Bearer token for API
- Rate limiting by user tier

### Web (Next.js 16 + React 19)

**App Router structure:**
- `app/page.tsx` - Course listing
- `app/course/[id]/page.tsx` - Course detail
- Global chat shell in `layout.tsx` (persistent across routes)

**State management:**
- Zustand for global state (notifications, auth)
- React hooks for data fetching (TanStack Query pattern)

**Components:**
- shadcn/ui base components in `components/ui/`
- Theme support via `next-themes` (default: dark)
- Geist font (Sans + Mono)

## Important Gotchas

1. **PostgreSQL with pgvector required** - Standard PostgreSQL won't work; needs vector extension for embeddings

2. **Agent loading order** - Services must call `load_agent()` during startup before handling requests. See lifespan in `service.py`.

3. **Docker Compose service dependencies** - `migrate` service must complete successfully before `ai_server` starts (seeds initial data)

4. **Redis is required** - Not optional; used for:
   - Rate limiting (SlowAPI)
   - Celery task queue
   - Caching layer

5. **Embeddings dimension** - Must match ingestion config (`embed_dim=1024` for DashScope). If changing embedding model, re-ingest all documents.

6. **Environment-specific hosts**:
   - Local dev: `POSTGRES_HOST=localhost`
   - Docker: `POSTGRES_HOST=postgres` (service name)

7. **Frontend API client** - Configured in `lib/api.ts` - points to backend at `http://localhost:8000` by default

## Celery Tasks

Async task processing:
```bash
# Start worker
celery -A core.celery_app worker --loglevel=info

# Start beat (scheduled tasks) - currently commented in compose
celery -A core.celery_app beat --loglevel=info
```

## Streamlit Admin

Separate admin interface at `http://localhost:8501`:
- Document ingestion UI
- Chunk viewer for RAG debugging
- Course management

## Deployment Notes

**Docker production considerations:**
- Change default `JWT_SECRET_KEY`
- Set `AUTH_SECRET` for API key protection
- Configure `POSTGRES_*` for external database
- Disable `MODE=dev` in production
- Redis and Celery for background jobs

**Frontend build:**
```bash
cd web && pnpm build
# Output: .next/ directory
```
