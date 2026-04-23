"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { FocusSelector, FocusMode } from "@/components/focus-selector"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSend: () => void
  isStreaming: boolean
  focusMode?: FocusMode
  setFocusMode?: (mode: FocusMode) => void
  onSwitchToCourse?: () => void
}

export function ChatInput({ input, setInput, onSend, isStreaming, focusMode, setFocusMode, onSwitchToCourse }: ChatInputProps) {
  return (
    <div className="chat-input-focus bg-white dark:bg-[#212121] rounded-[2rem] p-2 flex flex-col gap-2 border border-black/5 dark:border-white/5 focus-within:border-black/20 dark:focus-within:border-white/20 transition-all shadow-2xl w-full">
      <Input
        className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg px-4 h-12 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        placeholder="输入你的想象..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !isStreaming && onSend()}
        disabled={isStreaming}
      />
      <div className="flex justify-between items-center px-2 pb-1">
        <div className="flex gap-2">
          {setFocusMode && onSwitchToCourse && (
            <FocusSelector
              focusMode={focusMode || null}
              setFocusMode={setFocusMode}
              onSwitchToCourse={onSwitchToCourse}
            />
          )}
        </div>
        <Button
          size="icon"
          className={`rounded-full h-10 w-10 transition-all ${input.trim() ? 'opacity-100 scale-100 bg-black dark:bg-white text-white dark:text-black' : 'opacity-30 scale-95 bg-gray-300 dark:bg-gray-700'}`}
          onClick={onSend}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
