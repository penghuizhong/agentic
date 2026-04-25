from decimal import Decimal
from typing import Any, Literal, NotRequired

from pydantic import BaseModel, Field, SerializeAsAny
from typing_extensions import TypedDict

from schema.models import AllModelEnum, DeepseekModelName, DashScopeModelName


class AgentInfo(BaseModel):
    """关于可用代理的信息。"""

    key: str = Field(
        description="代理键名。",
        examples=["research-assistant"],
    )
    description: str = Field(
        description="代理的描述。",
        examples=["用于生成研究论文的研究助手。"],
    )


class ServiceMetadata(BaseModel):
    """服务的元数据，包括可用的代理和模型。"""

    agents: list[AgentInfo] = Field(
        description="可用代理列表。",
    )
    models: list[AllModelEnum] = Field(
        description="可用的LLM模型列表。",
    )
    default_agent: str = Field(
        description="未指定时使用的默认代理。",
        examples=["research-assistant"],
    )
    default_model: AllModelEnum = Field(
        description="未指定时使用的默认模型。",
    )


class UserInput(BaseModel):
    """代理的基本用户输入。"""

    message: str = Field(
        description="用户输入到代理的消息。",
        examples=["裙装原型的制版方法?"],
    )
    model: SerializeAsAny[AllModelEnum] | None = Field(
        title="模型",
        description="代理使用的LLM模型。默认为服务设置中设置的默认模型。",
        default=None,
        examples=[DeepseekModelName.DEEPSEEK_CHAT,DeepseekModelName.DEEPSEEK_CHAT],
    )
    thread_id: str | None = Field(
        description="用于持久化和继续多轮对话的线程ID。",
        default=None,
        examples=["847c6285-8fc9-4560-a83f-4e6285809254"],
    )
    user_id: str | None = Field(
        description="用于跨多个线程持久化和继续对话的用户ID。",
        default=None,
        examples=["847c6285-8fc9-4560-a83f-4e6285809254"],
    )
    agent_config: dict[str, Any] = Field(
        description="传递给代理的额外配置。",
        default={},
        examples=[{"spicy_level": 0.8}],
    )


class StreamInput(UserInput):
    """用于流式传输代理响应的用户输入。"""

    stream_tokens: bool = Field(
        description="是否将LLM令牌流式传输到客户端。",
        default=True,
    )


class ToolCall(TypedDict):
    """表示调用工具的请求。"""

    name: str
    """要调用的工具名称。"""
    args: dict[str, Any]
    """工具调用的参数。"""
    id: str | None
    """与工具调用关联的标识符。"""
    type: NotRequired[Literal["tool_call"]]


class ChatMessage(BaseModel):
    """聊天中的消息。"""

    type: Literal["human", "ai", "tool", "custom"] = Field(
        description="消息的角色。",
        examples=["human", "ai", "tool", "custom"],
    )
    content: str = Field(
        description="消息的内容。",
        examples=["Hello, world!"],
    )
    tool_calls: list[ToolCall] = Field(
        description="消息中的工具调用。",
        default=[],
    )
    tool_call_id: str | None = Field(
        description="此消息正在响应的工具调用。",
        default=None,
        examples=["call_Jja7J89XsjrOLA5r!MEOW!SL"],
    )
    run_id: str | None = Field(
        description="消息的运行ID。",
        default=None,
        examples=["847c6285-8fc9-4560-a83f-4e6285809254"],
    )
    response_metadata: dict[str, Any] = Field(
        description="响应元数据。例如：响应头、logprobs、令牌计数。",
        default={},
    )
    custom_data: dict[str, Any] = Field(
        description="自定义消息数据。",
        default={},
    )

    def pretty_repr(self) -> str:
        """获取消息的漂亮表示形式。"""
        base_title = self.type.title() + " Message"
        padded = " " + base_title + " "
        sep_len = (80 - len(padded)) // 2
        sep = "=" * sep_len
        second_sep = sep + "=" if len(padded) % 2 else sep
        title = f"{sep}{padded}{second_sep}"
        return f"{title}\n\n{self.content}"

    def pretty_print(self) -> None:
        """打印消息的漂亮表示形式。"""
        print(self.pretty_repr())  # noqa: T201


class Feedback(BaseModel):  # type: ignore[no-redef]
    """用于记录到LangSmith的运行反馈。"""

    run_id: str = Field(
        description="要记录反馈的运行ID。",
        examples=["847c6285-8fc9-4560-a83f-4e6285809254"],
    )
    key: str = Field(
        description="反馈键。",
        examples=["human-feedback-stars"],
    )
    score: float = Field(
        description="反馈分数。",
        examples=[0.8],
    )
    kwargs: dict[str, Any] = Field(
        description="传递给LangSmith的额外反馈参数。",
        default={},
        examples=[{"comment": "内联人工反馈"}],
    )


class FeedbackResponse(BaseModel):
    """反馈响应。"""

    status: Literal["success"] = "success"


class ChatHistoryInput(BaseModel):
    """用于检索聊天历史的输入。"""

    thread_id: str = Field(
        description="用于持久化和继续多轮对话的线程ID。",
        examples=["847c6285-8fc9-4560-a83f-4e6285809254"],
    )


class ChatHistory(BaseModel):
    """聊天历史。"""

    messages: list[ChatMessage]


# Authentication schemas
class RegisterInput(BaseModel):
    """用户注册输入。"""

    username: str = Field(min_length=3, max_length=50)
    email: str = Field(pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password: str = Field(min_length=8, max_length=100)


class LoginInput(BaseModel):
    """用户登录输入。"""

    username: str
    password: str


class TokenResponse(BaseModel):
    """Token响应。"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshInput(BaseModel):
    """刷新token输入。"""

    refresh_token: str


class UserResponse(BaseModel):
    """用户信息响应。"""

    id: str
    username: str
    email: str
    is_active: bool
    is_superuser: bool
    created_at: str
    roles: list[str] = []


# Course schemas
class CourseCreate(BaseModel):
    """创建课程输入。"""

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=10)
    price: Decimal = Field(gt=0)
    tag: str = Field(min_length=1, max_length=50)


class CourseUpdate(BaseModel):
    """更新课程输入（部分更新）。"""

    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, min_length=10)
    price: Decimal | None = Field(None, gt=0)
    tag: str | None = Field(None, min_length=1, max_length=50)


class CourseResponse(BaseModel):
    """课程信息响应。"""

    id: str
    title: str
    description: str
    price: str
    tag: str
    created_at: str


class CourseListResponse(BaseModel):
    """课程列表响应（含分页）。"""

    total: int
    items: list[CourseResponse]
    skip: int
    limit: int
