# AGENTS.md

## OVERVIEW

方圆智版 (FYZB) — a dual-project monorepo: a Python FastAPI + LangGraph AI agent backend (`ai_server/`) and a Next.js 16 frontend (`ai_server_web_next/`). The backend exposes multi-agent chat APIs with RAG and prompt-injection safeguards; the frontend provides a Chinese-language tailoring AI assistant UI.

## STRUCTURE

```
project_opencode/
├── ai_server/                      # Python backend
│   ├── compose.yaml                 # Docker Compose (postgres + ai_server + streamlit_admin)
│   ├── docker/                      # Dockerfiles (Dockerfile.service, Dockerfile.streamlit)
│   ├── pyproject.toml               # uv project config, deps, ruff, pytest, mypy
│   ├── uv.lock                      # uv lockfile
│   ├── .env.example                 # All env vars with descriptions
│   └── src/
│       ├── run_service.py           # FastAPI entry point (uvicorn)
│       ├── streamlit_admin.py       # Streamlit admin entry (redirects to ingest_ui)
│       ├── agents/
│       │   ├── agents.py            # Agent registry (chatbot, rag-assistant)
│       │   ├── chatbot.py           # Simple chatbot (@entrypoint)
│       │   ├── rag_assistant.py     # RAG agent (StateGraph: guard -> model -> tools)
│       │   ├── safeguard.py         # Prompt injection detection (Safeguard class)
│       │   ├── tools.py             # database_search (LlamaIndex + DashScope embeddings)
│       │   └── lazy_agent.py        # Lazy-loading agent wrapper
│       ├── core/
│       │   ├── config.py            # Pydantic Settings (env vars, model registry)
│       │   └── llm.py               # LLM factory (get_model)
│       ├── memory/
│       │   └── postgres.py           # AsyncPostgresSaver + AsyncPostgresStore
│       ├── schema/
│       │   ├── models.py            # All model enums (OpenAI, DashScope, Anthropic, etc.)
│       │   └── schema.py            # API schemas (UserInput, StreamInput, ChatMessage, etc.)
│       ├── service/
│       │   ├── service.py           # FastAPI app, routes (/invoke, /stream, /history, /info)
│       │   └── utils.py             # Message conversion utilities
│       ├── scripts/
│       │   └── ingest.py            # Document ingestion (LlamaIndex → PGVector)
│       └── pages/
│           ├── ingest_ui.py         # Streamlit ingest UI
│           └── chunk_viewer.py      # Streamlit chunk viewer
│
├── ai_server_web_next/             # Next.js frontend
│   ├── package.json                # pnpm, React 19, Next 16, Tailwind 4, shadcn/ui
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── components.json            # shadcn/ui config (radix-nova style)
│   ├── app/
│   │   ├── layout.tsx              # Root layout (ThemeProvider, dark default)
│   │   ├── page.tsx                # Home page (chat + course list)
│   │   ├── globals.css
│   │   └── course/[id]/page.tsx    # Course detail page
│   ├── components/
│   │   ├── theme-provider.tsx
│   │   └── ui/                    # shadcn/ui primitives (button, input, card, sheet, scroll-area, avatar)
│   └── lib/
│       └── utils.ts                # cn() utility
```

## WHERE TO LOOK

| Task | Location |
|---|---|
| Add a new LLM provider/model | `ai_server/src/schema/models.py` → `ai_server/src/core/config.py` |
| Add a new API endpoint | `ai_server/src/service/service.py` |
| Add a new agent | `ai_server/src/agents/` → register in `agents.py` |
| Modify RAG retrieval logic | `ai_server/src/agents/tools.py` |
| Change prompt injection detection | `ai_server/src/agents/safeguard.py` |
| Modify agent system prompts | `ai_server/src/agents/rag_assistant.py` (instructions), `chatbot.py` |
| Change database schema/migrations | `ai_server/src/memory/postgres.py` + `compose.yaml` |
| Ingest documents into vector store | `ai_server/src/scripts/ingest.py` or Streamlit `pages/ingest_ui.py` |
| Add frontend pages/routes | `ai_server_web_next/app/` (Next.js App Router) |
| Add frontend UI components | `ai_server_web_next/components/ui/` (shadcn/ui) |
| Modify chat/course UI | `ai_server_web_next/app/page.tsx`, `app/course/[id]/page.tsx` |
| Change API schemas (request/response) | `ai_server/src/schema/schema.py` |
| Configure environment variables | `ai_server/.env.example` → copy to `.env` |
| Docker / infrastructure | `ai_server/compose.yaml`, `ai_server/docker/` |

## CONVENTIONS

- **Package manager (backend):** Use `uv` — never `pip install`. Run `uv add <pkg>` to add deps, `uv run` to execute commands, `uv sync` to install from lockfile.
- **Package manager (frontend):** Use `pnpm` — never `npm install`. Run `pnpm add <pkg>` to add deps.
- **Python version:** >=3.11, <3.14. Ruff line-length is 100.
- **Path alias (frontend):** `@/*` maps to project root (`ai_server_web_next/*`).
- **shadcn/ui style:** `radix-nova`. Run `pnpm dlx shadcn@latest add <component>` to add components.
- **Language:** Backend code comments and system prompts are in Chinese. API descriptions are bilingual. Frontend UI text is Chinese.
- **Agent routing:** Default agent is `rag-assistant`. Agent selection via URL path `/{agent_id}/invoke` or `/{agent_id}/stream`.
- **Stream protocol:** SSE with `data: {type: "message"\|"token"\|"error", content: ...}` lines, terminated by `data: [DONE]`.
- **Config pattern:** Pydantic `BaseSettings` with `.env` file. All secrets use `SecretStr`. Computed fields (`BASE_URL`, `is_dev()`) are methods, not env vars.
- **Docker dev mode:** `compose.yaml` uses `develop.watch` with `sync+restart` for hot-reload on `src/agent/`, `src/schema/`, `src/service/`, `src/core/`, `src/memory/`, `src/scripts/`.

## ANTI-PATTERNS

- **Reserved keys in `agent_config`:** The keys `thread_id`, `user_id`, and `model` are reserved by the service layer (`service.py:141`). Passing them in `agent_config` raises HTTP 422. They belong at the top level of `UserInput`.
- **Prompt injection detection:** The `Safeguard` class in `safeguard.py` classifies user input before the RAG agent processes it. It uses `DashScopeModelName.QWEN_TURBO` with a `skip_stream` tag. When `ENABLE_SAFEGUARD=false` or `DASHSCOPE_API_KEY` is unset, safeguard is disabled (returns `SAFE` for all input). Do NOT bypass or remove this check — it guards the RAG pipeline.
- **No tests:** `pytest` is configured (`pythonpath = ["src"]`, `pytest-asyncio`) but no test files exist. When adding tests, place them under `ai_server/tests/` and run with `uv run pytest`.
- **No CI/CD:** This project is local-development only. There are no GitHub Actions, no deploy pipelines. Docker Compose is the production-like runtime.
- **Don't use `pip`:** Always use `uv`. Mixing pip and uv will corrupt the lockfile.
- **Don't hardcode model names:** Use the enums from `schema/models.py` (e.g., `DashScopeModelName.QWEN_TURBO`), never raw strings.
- **Don't edit `uv.lock` manually:** Run `uv lock` or `uv sync` to update it.
- **Frontend don'ts:** Don't use `npm`. Don't install shadcn components manually — use the CLI. Don't import from `@shadcn/ui` directly; import from `@/components/ui/`.

## COMMANDS

### Backend (`ai_server/`)

```bash
uv sync                        # Install dependencies from lockfile
uv run python src/run_service.py   # Start FastAPI server locally
uv run streamlit run src/streamlit_admin.py  # Start Streamlit admin UI
uv run pytest                  # Run tests (none exist yet)
uv run ruff check .            # Lint
uv run ruff format .           # Format
uv run mypy src/               # Type check
uv add <package>               # Add a dependency
docker compose up --watch      # Start all services with hot-reload
docker compose up -d postgres  # Start PostgreSQL only
```

### Frontend (`ai_server_web_next/`)

```bash
pnpm install                   # Install dependencies
pnpm dev                       # Start Next.js dev server
pnpm build                     # Production build
pnpm lint                      # ESLint
pnpm dlx shadcn@latest add <component>  # Add a shadcn/ui component
```

## NOTES

- **Entry points:** Backend starts via `uvicorn` in `run_service.py` (not `uvicorn` CLI directly). Streamlit admin starts via `streamlit_admin.py` which redirects to `pages/ingest_ui.py`.
- **Database dependency:** Both the backend and Streamlit admin require PostgreSQL. Use `docker compose up -d postgres` to start it locally, or set `POSTGRES_HOST=localhost` in `.env`.
- **Table name prefix:** All app-created tables use the `agent_server_` prefix (configurable via `TABLE_NAME_PREFIX`). The RAG tool in `tools.py` uses this prefix to find the vector store table.
- **Embedding model:** Uses DashScope `text-embedding-v3` with dimension 1024. The same model must be used for ingestion (`ingest.py`) and retrieval (`tools.py`).
- **Multi-provider LLM:** The app auto-discovers available models from API keys present in `.env`. `DEFAULT_MODEL` falls back to the first available provider's default. DashScope/Qwen is the primary provider.
- **Auth:** Optional. If `AUTH_SECRET` is set in `.env`, all API endpoints require Bearer token. If unset, no auth is applied.
- **Observability:** Supports LangSmith tracing (`LANGCHAIN_TRACING_V2`) and Langfuse (`LANGFUSE_TRACING`). Both are opt-in via env vars.
- **Frontend is static:** The Next.js app currently uses `"use client"` components and mock data — no backend API integration yet. Course list is hardcoded in `page.tsx`.