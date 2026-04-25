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

logger = logging.getLogger(__name__)

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

    def model_post_init(self, __context: Any) -> None:
        """初始化后自动读取项目根目录下的 config.yaml"""
        # 定位 api/ 根目录
        project_root = Path(__file__).parent.parent.parent
        yaml_path = project_root / "config.yaml"

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

settings = Settings()