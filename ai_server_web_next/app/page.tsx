// app/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// 引入我们刚刚拆分出来的组件
import { Header } from "@/components/layout/header"
import { CourseList } from "@/components/course/course-list"
import { ChatInput } from "@/components/chat/chat-input"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
  const [view, setView] = useState<'chat' | 'course'>('chat')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    setView('chat')
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

            {/* 独立的输入框模块 */}
            <ChatInput value={input} onChange={setInput} onSend={handleSend} />

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
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 px-6 rounded-[2rem] max-w-[85%] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground rounded-tr-sm' : 'bg-transparent border border-muted/50'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      {/* 当有消息时，底部的固定输入框 */}
      {(view === 'course' || messages.length > 0) && (
        <div className="absolute bottom-8 left-0 right-0 w-full max-w-3xl mx-auto px-4 z-40 animate-in slide-in-from-bottom-6 duration-500">
          <ChatInput value={input} onChange={setInput} onSend={handleSend} />
        </div>
      )}
    </div>
  )
}