// components/chat/global-chat-shell.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { apiClient, ChatMessage } from "@/lib/api"
import { ChatInput } from "./chat-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// 👇 1. 引入 X 图标
import { X } from "lucide-react"

export function GlobalChatShell() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: isStreaming ? "auto" : "smooth"
        })
    }, [messages, isStreaming])

    // 👇 2. 新增：关闭当前聊天的函数
    const handleCloseChat = () => {
        // 清空消息记录，浮层会自动收起
        setMessages([])
        // 如果大模型正在输出，强制停止状态
        if (isStreaming) {
            setIsStreaming(false)
        }
    }

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return
        const userMsg = input; setInput(""); setIsStreaming(true)

        setMessages(prev => [...prev, { type: 'human', content: userMsg }, { type: 'ai', content: '' }])

        try {
            const stream = apiClient.stream({ message: userMsg, stream_tokens: true })
            let fullContent = ""
            for await (const event of stream) {
                if (event.type === 'token') {
                    fullContent += event.content
                    setMessages(prev => {
                        const next = [...prev]
                        next[next.length - 1].content = fullContent
                        return next
                    })
                }
            }
        } finally { setIsStreaming(false) }
    }

    return (
        <>
            {messages.length > 0 && (
                // 我们把背景透明度稍微调高一点 bg-background/95，避免背后的页面文字干扰阅读
                // <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-24 pb-40 animate-in fade-in duration-300">
                <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md px-4 pt-24 pb-40 animate-in fade-in duration-300">
                    {/* 👇 3. 新增：右上角悬浮的关闭按钮 */}
                    <button
                        onClick={handleCloseChat}
                        className="absolute top-6 right-6 md:top-8 md:right-8 p-3 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 z-50 hover:scale-105"
                        title="结束当前对话"
                    >
                        <X size={22} className="stroke-[2]" />
                    </button>

                    <ScrollArea className="h-full max-w-3xl mx-auto">
                        <div className="flex flex-col gap-8">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.type === 'human' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-4 px-6 rounded-[2rem] max-w-[85%] prose dark:prose-invert ${msg.type === 'human'
                                        ? 'bg-secondary rounded-tr-sm'
                                        : 'bg-muted border border-border shadow-md'
                                        }`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </div>
            )}

            <div className="absolute bottom-8 left-0 right-0 w-full max-w-3xl mx-auto px-4 z-40">
                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={handleSend}
                    isStreaming={isStreaming}
                />
            </div>
        </>
    )
}