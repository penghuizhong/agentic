# 方圆智版 (Fang Yuan Zhi Ban) AI Platform

一个面向教育的 AI 对话平台，结合 RAG（检索增强生成）技术与 LangGraph 工作流编排，为学习者提供智能化的知识问答体验。

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)

## ✨ 特性

- **多智能体对话系统** - 基于 LangGraph 的智能体工作流编排
- **RAG 知识检索** - 支持向量检索，提供准确的领域知识问答
- **多模型支持** - 支持 OpenAI、DeepSeek、通义千问等 12+ 大模型
- **课程管理** - 结构化的课程内容组织与检索
- **实时聊天** - WebSocket 流式响应，低延迟对话体验
- **权限管理** - 基于 RBAC 的角色权限系统
- **文档导入** - 支持 Markdown、PDF 等格式的文档自动切分与向量化
- **管理后台** - Streamlit 管理界面，方便内容维护

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Web)                          │
│  Next.js 16 + React 19 + TypeScript + Tailwind CSS v4       │
│  shadcn/ui 组件库 + Zustand 状态管理                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        API 网关层                            │
│  FastAPI + Uvicorn + Pydantic v2                            │
│  JWT 认证 + SlowAPI 限流                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      智能体服务层                             │
│  LangGraph + LangChain + LlamaIndex                         │
│  MCP (Model Context Protocol) 集成                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                               │
│  PostgreSQL + pgvector │ Redis │ Celery                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+ 和 pnpm
- Docker & Docker Compose

### 方式一：Docker 一键启动（推荐）

```bash
cd api
docker compose up --build
```

访问：
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- 管理后台: http://localhost:8501

### 方式二：本地开发模式

**1. 启动后端**

```bash
cd api

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -e ".[dev]"

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 API 密钥

# 初始化数据库
alembic upgrade head
python -m scripts.seed_runner

# 启动服务
python -m run_service
```

**2. 启动前端**

```bash
cd web
pnpm install
pnpm dev
```

**3. 启动管理后台（可选）**

```bash
cd api
streamlit run src/streamlit_admin.py
```

## ⚙️ 配置说明

### 必需的环境变量

在 `api/.env` 文件中配置：

```env
# LLM API 密钥（至少配置一个）
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
DASHSCOPE_API_KEY=your_dashscope_key

# 数据库
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ai_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT 密钥（生产环境务必修改）
JWT_SECRET_KEY=your-secret-key-here
```

完整配置选项请参考 `api/.env.example`。

### 默认模型配置

通过 `DEFAULT_MODEL` 环境变量设置默认使用的模型，例如：
- `qwen-turbo` - 通义千问 Turbo
- `gpt-5-nano` - GPT-5 Nano
- `deepseek-chat` - DeepSeek Chat

## 🧪 测试

**后端测试：**
```bash
cd api
pytest
pytest --cov  # 带覆盖率报告
```

**前端测试：**
```bash
cd web
pnpm test
pnpm test:watch  # 监听模式
```

## 📝 项目结构

```
.
├── api/                    # FastAPI 后端
│   ├── src/
│   │   ├── agents/        # LangGraph 智能体
│   │   ├── core/          # 核心配置、安全、LLM
│   │   ├── models/        # SQLAlchemy 数据模型
│   │   ├── schema/        # Pydantic 数据校验
│   │   ├── service/       # API 路由
│   │   ├── memory/        # PostgreSQL 检查点存储
│   │   └── scripts/       # 数据导入脚本
│   ├── alembic/           # 数据库迁移
│   └── docker/            # Docker 配置
│
└── web/                   # Next.js 前端
    ├── app/               # App Router
    ├── components/        # React 组件
    ├── hooks/             # 自定义 Hooks
    └── lib/               # 工具函数和 API 客户端
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [Apache License 2.0](LICENSE) 开源许可证。

## 🙏 致谢

- [LangChain](https://langchain.com/) - LLM 应用框架
- [LangGraph](https://langchain-ai.github.io/langgraph/) - 智能体工作流编排
- [LlamaIndex](https://www.llamaindex.ai/) - RAG 框架
- [FastAPI](https://fastapi.tiangolo.com/) - 高性能 Web 框架
- [Next.js](https://nextjs.org/) - React 全栈框架
- [shadcn/ui](https://ui.shadcn.com/) - 高质量的 UI 组件库

---

**作者**: 钟朋辉   
**项目地址**: https://github.com/penghuizhong/agentic
