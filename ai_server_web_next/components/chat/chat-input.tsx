// components/chat/chat-input.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowUp, Plus, Mic, Paperclip, Image as ImageIcon, Lightbulb, Square } from "lucide-react"

interface ChatInputProps {
    value: string
    onChange: (val: string) => void
    onSend: () => void
    isStreaming?: boolean
    onStop?: () => void
}

export function ChatInput({ value, onChange, onSend, isStreaming, onStop }: ChatInputProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [isThinking, setIsThinking] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const plusBtnRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target as Node) &&
                plusBtnRef.current && !plusBtnRef.current.contains(e.target as Node)
            ) {
                setShowMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative w-full max-w-3xl mx-auto drop-shadow-xl">
            {/* 悬浮菜单 */}
            {showMenu && (
                <div ref={menuRef} className="absolute bottom-full left-0 mb-3 w-[260px] bg-white dark:bg-[#202020] rounded-[1.5rem] p-2 shadow-2xl border border-black/5 dark:border-white/10 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex flex-col">
                        <button className="flex items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-[#323232] rounded-xl transition-colors text-left group">
                            <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200" />
                            <span className="text-[15px] font-medium text-gray-700 dark:text-gray-200">添加照片和文件</span>
                        </button>
                        <div className="h-[1px] bg-gray-200 dark:bg-white/5 mx-3 my-1" />
                        <button className="flex items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-[#323232] rounded-xl transition-colors text-left group">
                            <ImageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200" />
                            <span className="text-[15px] font-medium text-gray-700 dark:text-gray-200">创建图片</span>
                        </button>
                        <button
                            onClick={() => setIsThinking(!isThinking)}
                            className="flex items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-[#323232] rounded-xl transition-colors text-left group"
                        >
                            <Lightbulb className={`h-5 w-5 transition-colors ${isThinking ? 'text-[#4db8a6]' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`} />
                            <span className="text-[15px] font-medium text-gray-700 dark:text-gray-200">思考一下</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 主输入框背景药丸 */}
            <div className="flex items-center w-full bg-gray-100 dark:bg-[#2f2f2f] rounded-[2rem] pl-2 pr-2.5 py-2 border border-black/5 dark:border-white/5 transition-all focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-500">
                <button
                    ref={plusBtnRef}
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-3 transition-colors rounded-full ${showMenu ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                    <Plus className={`h-6 w-6 stroke-[1.5] transition-transform duration-300 ${showMenu ? 'rotate-45' : 'rotate-0'}`} />
                </button>

                <input
                    className="flex-1 bg-transparent border-none shadow-none focus:outline-none text-[16px] px-2 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400/80 disabled:opacity-50"
                    placeholder="有问题，尽管问"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isStreaming && onSend()}
                    disabled={isStreaming}
                />

                <button className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors rounded-full disabled:opacity-50" disabled={isStreaming}>
                    <Mic className="h-[22px] w-[22px] stroke-[1.5]" />
                </button>

                {isStreaming ? (
                    <button
                        onClick={onStop}
                        className="ml-1 h-11 w-11 min-w-[44px] rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-all duration-300 shadow-md"
                    >
                        <Square className="h-5 w-5 fill-current" />
                    </button>
                ) : (
                    <button
                        onClick={onSend}
                        disabled={!value.trim()}
                        className={`ml-1 h-11 w-11 min-w-[44px] rounded-full flex items-center justify-center transition-all duration-300 ${value.trim()
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 shadow-md'
                            : 'bg-gray-300 dark:bg-[#404040] text-gray-500 dark:text-[#808080] cursor-not-allowed opacity-80'
                            }`}
                    >
                        <ArrowUp className="h-6 w-6 stroke-[2.5]" />
                    </button>
                )}
            </div>
        </div>
    )
}