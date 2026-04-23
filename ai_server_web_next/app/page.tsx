"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
// 🎯 增加了 Check 图标用于复选框
import {
  Moon, Sun, ArrowUp, ArrowRight, Plus,
  Mic, Paperclip, Image as ImageIcon, Lightbulb, Check
} from "lucide-react"
import { useRouter } from "next/navigation"

// 模拟课程数据
const COURSE_LIST = [
  { id: 1, title: '西装领口高级工艺', desc: '掌握 2% 缩水率的核心换算，解决领口不服帖的工业级难题。', price: '¥299', tag: '高阶推荐' },
  { id: 2, title: '女装袖口收尖规程', desc: '从原型到成衣，15年打版实战经验总结。', price: '¥199', tag: '实战进阶' },
  { id: 3, title: '男裤立裆换算公式', desc: '告别死记硬背，一套公式吃透男裤立裆结构。', price: '¥99', tag: '基础必修' },
  { id: 4, title: '连袖结构与腋下折痕', desc: '处理连袖腋下堆量的独家几何切展方法。', price: '¥159', tag: '细节精讲' }
]

export default function Home() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
  const [view, setView] = useState<'chat' | 'course'>('chat')

  // 🎯 菜单显示状态与复选框状态
  const [showMenu, setShowMenu] = useState(false)
  const [isThinking, setIsThinking] = useState(false)

  // 🎯 使用 Ref 彻底解决点击外围关闭的 Bug
  const menuRef = useRef<HTMLDivElement>(null)
  const plusBtnRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    // 工业级点击外围处理逻辑
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

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    setView('chat')
  }

  // ================= 🎯 修复 Bug 并增加复选框的输入组件 =================
  const ChatInput = (
    <div className="relative w-full max-w-3xl mx-auto drop-shadow-xl">

      {/* 悬浮弹出菜单 */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute bottom-full left-0 mb-3 w-[260px] bg-white dark:bg-[#202020] rounded-[1.5rem] p-2 shadow-2xl border border-black/5 dark:border-white/10 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex flex-col">

            {/* 1. 添加照片和文件 (带快捷键) */}
            <button className="flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-[#323232] rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors" />
                <span className="text-[15px] font-medium text-gray-700 dark:text-gray-200">添加照片和文件</span>
              </div>
            </button>

            <div className="h-[1px] bg-gray-200 dark:bg-white/5 mx-3 my-1" />

            {/* 2. 创建图片 */}
            <button className="flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-[#323232] rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors" />
                <span className="text-[15px] font-medium text-gray-700 dark:text-gray-200">创建图片</span>
              </div>
            </button>

            {/* 3. 思考一下 (带您需要的复选框) */}
            <button
              onClick={() => setIsThinking(!isThinking)}
              className="flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-[#323232] rounded-xl transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Lightbulb className={`h-5 w-5 transition-colors ${isThinking ? 'text-[#4db8a6]' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`} />
                <span className="text-[15px] font-medium text-gray-700 dark:text-gray-200">思考一下</span>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* 主输入框背景药丸 */}
      <div className="flex items-center w-full bg-gray-100 dark:bg-[#2f2f2f] rounded-[2rem] pl-2 pr-2.5 py-2 border border-black/5 dark:border-white/5 transition-all focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-500">

        {/* 左侧加号按钮 (已绑定 Ref 解决 Bug) */}
        <button
          ref={plusBtnRef}
          onClick={() => setShowMenu(!showMenu)}
          className={`p-3 transition-colors rounded-full ${showMenu ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
          <Plus className={`h-6 w-6 stroke-[1.5] transition-transform duration-300 ${showMenu ? 'rotate-45' : 'rotate-0'}`} />
        </button>

        {/* 核心文本输入区 */}
        <input
          className="flex-1 bg-transparent border-none shadow-none focus:outline-none text-[16px] px-2 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400/80"
          placeholder="有问题，尽管问"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />

        {/* 右侧麦克风 */}
        <button className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors rounded-full">
          <Mic className="h-[22px] w-[22px] stroke-[1.5]" />
        </button>

        {/* 极致显眼的发送按钮 */}
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`ml-1 h-11 w-11 min-w-[44px] rounded-full flex items-center justify-center transition-all duration-300 ${input.trim()
            ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 shadow-md'
            : 'bg-gray-300 dark:bg-[#404040] text-gray-500 dark:text-[#808080] cursor-not-allowed opacity-80'
            }`}
        >
          <ArrowUp className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  )
  // =====================================================================

  return (
    <div className="flex flex-col h-screen w-full bg-background transition-colors duration-500 overflow-hidden relative">

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

      {view === 'course' ? (
        <>
          <ScrollArea className="flex-1 px-4 pt-32 pb-40 h-full">
            <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="mb-6 pt-4">
                <h1 className="text-3xl font-bold tracking-tight">进阶课程</h1>
                <p className="text-muted-foreground mt-2">打磨 15 年的工业级经验，现已全面开放。</p>
              </div>
              {COURSE_LIST.map((course) => (
                <Card key={course.id} className="rounded-[2rem] border-muted/30 bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer border-t border-white/10 shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-medium text-muted-foreground mb-3 px-3 py-1 bg-background/50 rounded-full w-fit">
                        {course.tag}
                      </div>
                      <div className="text-2xl font-bold">{course.price}</div>
                    </div>
                    <CardTitle className="text-xl md:text-2xl leading-relaxed">{course.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{course.desc}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end pt-2 pb-6 pr-6">
                    <Button
                      className="rounded-full px-6 bg-foreground text-background font-semibold"
                      onClick={() => router.push(`/course/${course.id}`)}
                    >
                      立即学习
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="absolute bottom-8 left-0 right-0 w-full max-w-3xl mx-auto px-4 z-40 animate-in slide-in-from-bottom-6 duration-500">
            {ChatInput}
          </div>
        </>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16">
          <div className="w-full max-w-3xl flex flex-col items-center gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {ChatInput}

            <div className="flex flex-wrap justify-center gap-6 mt-2">
              {['🧮 公式计算', '📖 学习课程', '🔍 查找资料'].map(item => (
                <Button
                  key={item}
                  variant="outline"
                  className="rounded-full text-xs h-8 text-muted-foreground bg-background/50 backdrop-blur-sm"
                  onClick={() => {
                    // 这里的逻辑也帮您顺便优化了：点击“学习课程”切换视图，其他则填入输入框
                    if (item === '📖 学习课程') {
                      setView('course')
                    } else {
                      // 去掉图标，只保留文字填入输入框
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
                  <div className={`p-4 px-6 rounded-[2rem] max-w-[85%] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground rounded-tr-sm' : 'bg-transparent border border-muted/50'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="absolute bottom-8 left-0 right-0 w-full max-w-3xl mx-auto px-4 z-40 animate-in slide-in-from-bottom-6 duration-500">
            {ChatInput}
          </div>
        </>
      )}
    </div>
  )
}