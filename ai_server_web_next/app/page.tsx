// app/page.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiClient, ChatMessage, StreamEvent } from "@/lib/api"

import { Header } from "@/components/layout/header"
import { CourseList } from "@/components/course/course-list"
import { ChatInput } from "@/components/chat/chat-input"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [view, setView] = useState<'chat' | 'course'>('chat')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedThreadId = sessionStorage.getItem('chat_thread_id')
    if (savedThreadId) {
      setThreadId(savedThreadId)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput("")
    setError(null)

    const userChatMessage: ChatMessage = {
      type: 'human',
      content: userMessage,
    }
    setMessages(prev => [...prev, userChatMessage])
    setView('chat')
    setIsStreaming(true)

    const currentThreadId = threadId || crypto.randomUUID()
    if (!threadId) {
      setThreadId(currentThreadId)
      sessionStorage.setItem('chat_thread_id', currentThreadId)
    }

    abortControllerRef.current = new AbortController()

    try {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: '',
      }])

      const stream = apiClient.stream({
        message: userMessage,
        thread_id: currentThreadId,
        stream_tokens: true,
      })

      let accumulatedContent = ''

      for await (const event of stream) {
        if (abortControllerRef.current?.signal.aborted) {
          break
        }

        if (event.type === 'token') {
          accumulatedContent += event.content
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage?.type === 'ai') {
              lastMessage.content = accumulatedContent
            }
            return newMessages
          })
        } else if (event.type === 'message' && typeof event.content === 'object') {
          const msg = event.content as ChatMessage
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage?.type === 'ai') {
              lastMessage.content = msg.content
              lastMessage.run_id = msg.run_id
            }
            return newMessages
          })
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : '发送消息失败，请重试')
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1 || prev[i].type !== 'ai' || prev[i].content !== ''))
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background transition-colors duration-500 overflow-hidden relative">

      {/* 独立的导航模块 */}
      <Header />

      {view === 'course' ? (
        <>
          <ScrollArea className="flex-1 px-4 pt-32 pb-40 h-full">
            <CourseList />
          </ScrollArea>
        </>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16">
          <div className="w-full max-w-3xl flex flex-col items-center gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            <ChatInput value={input} onChange={setInput} onSend={handleSend} isStreaming={isStreaming} onStop={handleStop} />

            <div className="flex flex-wrap justify-center gap-6 mt-2">
              {['🧮 公式计算', '📖 学习课程', '🔍 查找资料'].map(item => (
                <Button
                  key={item}
                  variant="outline"
                  className="rounded-full text-xs h-8 text-muted-foreground bg-background/50 backdrop-blur-sm"
                  onClick={() => {
                    if (item === '📖 学习课程') {
                      setView('course')
                    } else {
                      setInput(item.split(' ')[1])
                    }
                  }}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 px-4 pt-32 pb-40 h-full">
            <div className="max-w-3xl mx-auto flex flex-col gap-8">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'human' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 px-6 rounded-[2rem] max-w-[85%] leading-relaxed shadow-sm ${msg.type === 'human' ? 'bg-secondary text-secondary-foreground rounded-tr-sm' : 'bg-transparent border border-muted/50'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {error && (
                <div className="flex justify-center">
                  <div className="p-3 px-4 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </>
      )}

      {(view === 'course' || messages.length > 0) && (
        <div className="absolute bottom-8 left-0 right-0 w-full max-w-3xl mx-auto px-4 z-40 animate-in slide-in-from-bottom-6 duration-500">
          <ChatInput value={input} onChange={setInput} onSend={handleSend} isStreaming={isStreaming} onStop={handleStop} />
        </div>
      )}
    </div>
  )
}