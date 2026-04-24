// components/layout/header.tsx
"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, ArrowRight } from "lucide-react"

export function Header() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    return (
        <>
            {/* 顶部居中导航与通知 */}
            <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-6 z-40 pointer-events-none">
                <div className="pointer-events-auto flex flex-col items-center">
                    <nav className="flex justify-center gap-6 md:gap-8 text-[15px] font-medium text-muted-foreground mb-4">
                        <span className="text-foreground cursor-pointer">发现</span>
                        <span className="hover:text-foreground cursor-pointer transition-colors">时尚</span>
                        <span className="hover:text-foreground cursor-pointer transition-colors">课程</span>
                        <span className="hover:text-foreground cursor-pointer transition-colors">工具</span>
                        <span className="hover:text-foreground cursor-pointer transition-colors">我们</span>
                    </nav>

                    <div className="flex items-center bg-background/40 backdrop-blur-md border border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer">
                        <span className="bg-[#1f2f32] dark:bg-[#1a2b2e] text-[#4db8a6] px-3 py-1 rounded-full text-[11px] font-medium tracking-wide mr-3">
                            New
                        </span>
                        <span className="text-sm text-foreground/90 mr-3">服装结构设计系统课程已上线...</span>
                        <div className="w-[1px] h-4 bg-muted-foreground/30 mr-3"></div>
                        <span className="text-muted-foreground flex items-center text-sm hover:text-foreground transition-colors">
                            升级 <ArrowRight size={14} className="ml-1 opacity-80" />
                        </span>
                    </div>
                </div>
            </div>

            {/* 右上角主题切换 */}
            <header className="absolute top-0 w-full p-4 flex justify-end items-center z-50 pointer-events-none">
                <Button
                    variant="outline"
                    className="rounded-full w-28 bg-background/50 backdrop-blur-md pointer-events-auto"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {mounted ? (
                        <>
                            {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                            {theme === "dark" ? "极简白" : "极夜黑"}
                        </>
                    ) : (
                        <span className="opacity-0">载入中</span>
                    )}
                </Button>
            </header>
        </>
    )
}