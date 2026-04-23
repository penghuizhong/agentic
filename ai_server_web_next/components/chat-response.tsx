"use client"

import React from "react"
import Markdown from "react-markdown"
import { Separator } from "@/components/ui/separator"

export interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

interface ChatResponseProps {
  messages: ChatMessage[]
  isStreaming: boolean
  focusMode?: string | null
}

const ALLOWED_ELEMENTS = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h3', 'h4']

function StreamingCursor() {
  return (
    <span
      data-testid="streaming-cursor"
      className="inline-block w-2 h-5 ml-0.5 bg-foreground/70 animate-pulse rounded-sm align-text-bottom"
    />
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div
      data-role="user"
      className="bg-secondary/50 rounded-2xl px-4 py-2 ml-auto max-w-[70%] text-sm leading-relaxed"
    >
      {content}
    </div>
  )
}

function AiMessage({ content, focusMode }: { content: string; focusMode?: string | null }) {
  return (
    <div data-role="ai" className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed">
      <Markdown allowedElements={ALLOWED_ELEMENTS} unwrapDisallowed>
        {content}
      </Markdown>
      <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2 not-prose">
        <span>AI 助手</span>
        {focusMode && (
          <>
            <span>·</span>
            <span>{focusMode}</span>
          </>
        )}
      </div>
    </div>
  )
}

export function ChatResponse({ messages, isStreaming, focusMode }: ChatResponseProps) {
  const lastMessage = messages[messages.length - 1]
  const showStreamingCursor = isStreaming && lastMessage?.role === 'ai'

  const aiMessageIndices = messages
    .map((msg, i) => (msg.role === 'ai' ? i : -1))
    .filter(i => i !== -1)

  return (
    <div data-testid="chat-response-container" className="max-w-3xl mx-auto flex flex-col gap-6">
      {messages.map((msg, i) => {
        const isLastAi = i === aiMessageIndices[aiMessageIndices.length - 1]
        const needsSeparator = msg.role === 'ai' && !isLastAi

        return (
          <React.Fragment key={i}>
            {msg.role === 'user' ? (
              <UserMessage content={msg.content} />
            ) : (
              <AiMessage content={msg.content} focusMode={focusMode} />
            )}
            {showStreamingCursor && isLastAi && (
              <StreamingCursor />
            )}
            {needsSeparator && <Separator />}
          </React.Fragment>
        )
      })}
    </div>
  )
}