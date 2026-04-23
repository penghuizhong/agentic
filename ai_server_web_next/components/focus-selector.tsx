"use client"

import { Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type FocusMode = "裁剪建议" | "缩水率查询" | "面料知识" | "课程学习" | null

export interface FocusSelectorProps {
  focusMode: FocusMode
  setFocusMode: (mode: FocusMode) => void
  onSwitchToCourse: () => void
}

const FOCUS_MODES = [
  { value: "裁剪建议" as const, emoji: "✂️", label: "裁剪建议" },
  { value: "缩水率查询" as const, emoji: "📐", label: "缩水率查询" },
  { value: "面料知识" as const, emoji: "🧵", label: "面料知识" },
  { value: "课程学习" as const, emoji: "📖", label: "课程学习" },
]

export function FocusSelector({ focusMode, setFocusMode, onSwitchToCourse }: FocusSelectorProps) {
  const handleSelect = (mode: NonNullable<FocusMode>) => {
    if (mode === focusMode) {
      setFocusMode(null)
    } else {
      setFocusMode(mode)
      if (mode === "课程学习") {
        onSwitchToCourse()
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="选择专注模式"
            className="rounded-full h-8 w-8 inline-flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="rounded-2xl min-w-48"
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            专注模式
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FOCUS_MODES.map((mode) => (
            <DropdownMenuItem
              key={mode.value}
              className={`cursor-pointer rounded-xl ${focusMode === mode.value ? "bg-primary/10 text-primary" : ""}`}
              onSelect={(e) => {
                e.preventDefault()
                handleSelect(mode.value)
              }}
            >
              <span className="mr-2">{mode.emoji}</span>
              <span>{mode.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {focusMode && (
        <Badge
          variant="secondary"
          role="button"
          tabIndex={0}
          aria-label={focusMode}
          className="bg-primary/10 text-primary text-xs cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() => setFocusMode(null)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFocusMode(null) } }}
        >
          {FOCUS_MODES.find((m) => m.value === focusMode)?.emoji}{" "}
          {focusMode}
        </Badge>
      )}
    </div>
  )
}