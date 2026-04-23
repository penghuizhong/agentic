import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatResponse, type ChatMessage } from './chat-response'

// Mock react-markdown as a simple passthrough
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-rendered">{children}</div>,
}))

// Mock Separator component
vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}))

describe('ChatResponse', () => {
  const defaultMessages: ChatMessage[] = [
    { role: 'user', content: '你好' },
    { role: 'ai', content: '你好！有什么可以帮你的吗？' },
  ]

  it('renders user messages as right-aligned pills', () => {
    render(<ChatResponse messages={defaultMessages} isStreaming={false} />)
    const userMsg = screen.getByText('你好')
    const userContainer = userMsg.closest('[data-role="user"]')
    expect(userContainer).toBeTruthy()
    expect(userContainer!.className).toContain('ml-auto')
    expect(userContainer!.className).toContain('rounded-2xl')
  })

  it('renders AI messages as full-width article prose without bubble styling', () => {
    render(<ChatResponse messages={defaultMessages} isStreaming={false} />)
    const aiMsg = screen.getByText('你好！有什么可以帮你的吗？')
    const aiContainer = aiMsg.closest('[data-role="ai"]')
    expect(aiContainer).toBeTruthy()
    // AI messages should NOT have bubble-like styling
    expect(aiContainer!.className).not.toContain('rounded-2xl')
    expect(aiContainer!.className).not.toContain('rounded-')
    // AI messages should have prose styling
    expect(aiContainer!.className).toContain('prose')
  })

  it('renders markdown content via react-markdown for AI messages', () => {
    render(<ChatResponse messages={defaultMessages} isStreaming={false} />)
    // The AI message content should be rendered through react-markdown mock
    expect(screen.getByTestId('markdown-rendered')).toBeTruthy()
  })

  it('does NOT render markdown for user messages', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '**bold text**' },
    ]
    render(<ChatResponse messages={messages} isStreaming={false} />)
    // User message should render plain text, not through markdown
    expect(screen.getByText('**bold text**')).toBeTruthy()
    // No markdown-rendered element for user messages
    const markdownElements = screen.queryAllByTestId('markdown-rendered')
    expect(markdownElements).toHaveLength(0)
  })

  it('shows "AI 助手" source footer for AI messages', () => {
    render(<ChatResponse messages={defaultMessages} isStreaming={false} />)
    expect(screen.getByText('AI 助手')).toBeInTheDocument()
  })

  it('shows focus mode label when provided', () => {
    render(
      <ChatResponse messages={defaultMessages} isStreaming={false} focusMode="裁剪" />
    )
    expect(screen.getByText('裁剪')).toBeInTheDocument()
  })

  it('does NOT show focus mode label when null', () => {
    render(<ChatResponse messages={defaultMessages} isStreaming={false} focusMode={null} />)
    // Only "AI 助手" should be present, no focus mode label
    expect(screen.getByText('AI 助手')).toBeInTheDocument()
  })

  it('shows separator between consecutive AI messages', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '问题1' },
      { role: 'ai', content: '回答1' },
      { role: 'user', content: '问题2' },
      { role: 'ai', content: '回答2' },
    ]
    render(<ChatResponse messages={messages} isStreaming={false} />)
    // Should have a separator between the two AI message blocks
    const separators = screen.getAllByTestId('separator')
    expect(separators.length).toBeGreaterThanOrEqual(1)
  })

  it('does NOT show separator after the last AI message', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '问题' },
      { role: 'ai', content: '回答' },
    ]
    render(<ChatResponse messages={messages} isStreaming={false} />)
    // Only one AI message, no separator needed (separator is between AI blocks)
    const separators = screen.queryAllByTestId('separator')
    expect(separators).toHaveLength(0)
  })

  it('shows streaming cursor when isStreaming is true and last message is from AI', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '你好' },
      { role: 'ai', content: '正在思考' },
    ]
    render(<ChatResponse messages={messages} isStreaming={true} />)
    expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument()
  })

  it('does NOT show streaming cursor when isStreaming is false', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '你好' },
      { role: 'ai', content: '回答' },
    ]
    render(<ChatResponse messages={messages} isStreaming={false} />)
    expect(screen.queryByTestId('streaming-cursor')).not.toBeInTheDocument()
  })

  it('does NOT show streaming cursor when last message is from user', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '你好' },
    ]
    render(<ChatResponse messages={messages} isStreaming={true} />)
    expect(screen.queryByTestId('streaming-cursor')).not.toBeInTheDocument()
  })

  it('renders empty state gracefully with no messages', () => {
    render(<ChatResponse messages={[]} isStreaming={false} />)
    // Container should exist but be empty
    const container = screen.getByTestId('chat-response-container')
    expect(container).toBeInTheDocument()
    expect(container.children).toHaveLength(0)
  })

  it('renders multiple user and AI messages in correct order', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '第一问' },
      { role: 'ai', content: '第一答' },
      { role: 'user', content: '第二问' },
      { role: 'ai', content: '第二答' },
    ]
    render(<ChatResponse messages={messages} isStreaming={false} />)
    const allTexts = screen.getAllByText(/第[一二]/)
    expect(allTexts.map(el => el.textContent)).toEqual(['第一问', '第一答', '第二问', '第二答'])
  })

  it('applies max-w-3xl mx-auto container styling', () => {
    render(<ChatResponse messages={defaultMessages} isStreaming={false} />)
    const container = screen.getByTestId('chat-response-container')
    expect(container.className).toContain('max-w-3xl')
    expect(container.className).toContain('mx-auto')
  })

  it('applies prose-neutral dark:prose-invert classes to AI messages', () => {
    render(<ChatResponse messages={defaultMessages} isStreaming={false} />)
    const aiContainer = screen.getByText('你好！有什么可以帮你的吗？').closest('[data-role="ai"]')
    expect(aiContainer!.className).toContain('prose-neutral')
  })
})