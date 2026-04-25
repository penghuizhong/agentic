import logging
from pathlib import Path
from typing import Annotated, Any

import yaml
from dotenv import find_dotenv
from pydantic import (
    BeforeValidator,
    Field,
    HttpUrl,
    SecretStr,
    TypeAdapter,
    computed_field,
)
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("uvicorn")


def check_str_is_http(x: str) -> str:
    http_url_adapter = TypeAdapter(HttpUrl)
    return str(http_url_adapter.validate_python(x))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=find_dotenv(),
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    # 基础服务配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # 敏感 API Keys (从 .env 读取)
    DASHSCOPE_API_KEY: SecretStr | None = None
    DEEPSEEK_API_KEY: SecretStr | None = None
    OPENAI_API_KEY: SecretStr | None = None
    AUTH_SECRET: SecretStr | None = None

    # 数据库配置
    POSTGRES_USER: str | None = None
    POSTGRES_PASSWORD: SecretStr | None = None
    POSTGRES_HOST: str | None = None
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str | None = None
    TABLE_NAME_PREFIX: str = "agent_server_"

    # 安全防护开关
    ENABLE_SAFEGUARD: bool = True

    # 💡 动态加载的配置项
    DEFAULT_MODEL: str = "qwen-turbo"
    AVAILABLE_MODELS: list[str] = []
    PROVIDER_CONFIG: dict[str, dict] = {}

    # 应用程序模式
    MODE: str = ""

    # SQLAlchemy 连接池配置
    SQLALCHEMY_POOL_SIZE: int = 5
    SQLALCHEMY_MAX_OVERFLOW: int = 10

    # PostgreSQL 连接池优化
    POSTGRES_POOL_OPEN_TIMEOUT: int = 30
    POSTGRES_POOL_CLOSE_TIMEOUT: int = 10
    POSTGRES_POOL_MAX_IDLE_TIME: int = 300
    POSTGRES_MIN_CONNECTIONS_PER_POOL: int = 1
    POSTGRES_MAX_CONNECTIONS_PER_POOL: int = 3
    POSTGRES_APPLICATION_NAME: str = "agent_service"

    # Redis 配置
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_MAX_CONNECTIONS: int = 50

    # JWT 认证配置
    JWT_SECRET_KEY: SecretStr | None = None
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # 限流配置
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_ANONYMOUS: str = "10/minute"
    RATE_LIMIT_AUTHENTICATED: str = "60/minute"

    # Celery 配置
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    CELERY_WORKER_CONCURRENCY: int = 4

    # Langfuse 配置（可选）
    LANGFUSE_TRACING: bool = False

    # 优雅关闭超时
    GRACEFUL_SHUTDOWN_TIMEOUT: int = 30

    def model_post_init(self, __context: Any) -> None:
        """初始化后自动读取项目根目录下的 config.yaml"""
        # 定位 api/ 根目录 - 支持本地开发和 Docker 两种结构
        # 本地: src/core/config.py -> src/ -> api/
        # Docker: core/config.py -> /
        current_file = Path(__file__).resolve()

        # 尝试两种路径结构
        possible_roots = [
            current_file.parent.parent.parent,  # 本地开发结构: api/src/core/config.py -> api/
            current_file.parent.parent,  # Docker 结构: /app/core/config.py -> /app/
        ]

        yaml_path = None
        for root in possible_roots:
            candidate = root / "config.yaml"
            if candidate.exists():
                yaml_path = candidate
                break

        # 如果都找不到，使用默认路径（用于日志记录）
        if yaml_path is None:
            yaml_path = current_file.parent.parent.parent / "config.yaml"

        if yaml_path.exists():
            try:
                with open(yaml_path, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f) or {}
                    self.PROVIDER_CONFIG = data.get("providers", {})

                    # 自动汇总所有模型名称
                    models = []
                    for p_val in self.PROVIDER_CONFIG.values():
                        models.extend(p_val.get("models", []))
                    self.AVAILABLE_MODELS = models

                    # 设置默认模型
                    self.DEFAULT_MODEL = data.get("default_model", self.DEFAULT_MODEL)
                logger.info(f"✅ 成功从 {yaml_path} 加载配置")
            except Exception as e:
                logger.error(f"❌ 加载 config.yaml 失败: {e}")
        else:
            logger.warning(f"⚠️ 未找到 {yaml_path}, 将使用代码内硬编码的默认值")

    @computed_field
    @property
    def BASE_URL(self) -> str:
        return f"http://{self.HOST}:{self.PORT}"

    def is_dev(self) -> bool:
        return self.MODE.lower() == "dev"


settings = Settings()
