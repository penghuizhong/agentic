import logging
from typing import List
from langchain_core.tools import tool

# ✨ 核心改动：用 LlamaIndex 原装组件替换 LangChain 的 PGVector
from llama_index.core import VectorStoreIndex
from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.embeddings.dashscope import DashScopeEmbedding

from core import settings

logger = logging.getLogger(__name__)

if settings.POSTGRES_PASSWORD is None:
    raise ValueError("POSTGRES_PASSWORD 未配置")

@tool
def database_search(query: str) -> str:
    """
    搜索 AcmeTech 员工手册数据库。用于回答公司制度、流程和福利相关问题。
    """
    try:
        # 1. 使用与入库完全一致的 LlamaIndex Embedding 模型
        embed_model = DashScopeEmbedding(
            model_name="text-embedding-v3",
            api_key=settings.DASHSCOPE_API_KEY.get_secret_value()
        )

        # 2. 初始化原汁原味的 LlamaIndex PGVector 连接
        # 注意：这里直接填表名前缀即可，LlamaIndex 会自动去寻找对应的 data_employee_handbook 表
        vector_store = PGVectorStore.from_params(
            host=settings.POSTGRES_HOST,
            port=str(settings.POSTGRES_PORT),
            database=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD.get_secret_value(),
            table_name=settings.TABLE_NAME_PREFIX,  # 只需要表名前缀，LlamaIndex 会自动寻找对应的表
            embed_dim=1024  # 必须保持与入库时相同的维度
        )

        # 3. 构造 LlamaIndex 检索器
        index = VectorStoreIndex.from_vector_store(
            vector_store=vector_store,
            embed_model=embed_model
        )
        
        # 提取最相关的 4 个切片
        retriever = index.as_retriever(similarity_top_k=4)
        nodes = retriever.retrieve(query)

        if not nodes:
            return "未找到相关手册内容。"

        # 4. 格式化输出，将纯文本“喂”给后端的 LangGraph Agent
        formatted_results = []
        for i, node_with_score in enumerate(nodes):
            # 获取实际的 Node 对象
            node = node_with_score.node
            
            # 提取元数据
            page_num = node.metadata.get("page_label") or node.metadata.get("page", "未知")
            file_name = node.metadata.get("file_name", "员工手册")
            
            content = node.get_content().strip().replace("\n", " ")
            
            result_item = (
                f"--- 来源 [{i+1}] ({file_name} 第 {page_num} 页) ---\n"
                f"{content}"
            )
            formatted_results.append(result_item)

        return f"针对问题 '{query}'，我找到了以下参考信息：\n\n" + "\n\n".join(formatted_results)

    except Exception as e:
        logger.error(f"检索失败: {e}", exc_info=True)
        return f"查询出错: {str(e)}"