import logging
from functools import cache
from langchain_openai import ChatOpenAI
from core.config import settings

logger = logging.getLogger(__name__)

@cache
def get_model(model_name: str = None) -> ChatOpenAI:
    """
    根据模型名自动匹配供应商 URL 和 API Key。
    """
    model_name = model_name or settings.DEFAULT_MODEL
    
    # 1. 在供应商映射表中查找
    target_provider = None
    target_url = None
    
    for p_name, p_info in settings.PROVIDER_CONFIG.items():
        if model_name in p_info.get("models", []):
            target_provider = p_name
            target_url = p_info.get("base_url")
            break
            
    if not target_url:
        logger.error(f"未在 config.yaml 中找到模型 {model_name} 的配置")
        raise ValueError(f"Unsupported model: {model_name}")

    # 2. 动态获取对应的 API Key 变量
    # 例如：如果供应商是 dashscope，则寻找 DASHSCOPE_API_KEY
    api_key_attr = f"{target_provider.upper()}_API_KEY"
    api_key_secret = getattr(settings, api_key_attr, None)
    
    if not api_key_secret:
        raise ValueError(f"未配置环境变量: {api_key_attr}")

    logger.info(f"🤖 初始化 LLM: {model_name} (Provider: {target_provider})")

    return ChatOpenAI(
        model=model_name,
        base_url=target_url,
        api_key=api_key_secret,
        streaming=True,
        temperature=0.5,
        max_retries=3
    )