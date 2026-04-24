"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
    Plus,
    Monitor,
    Folder,
    Settings,
    History,
    ArrowUpCircle,
    Bell,
    PanelLeftClose,
    PanelLeftOpen,
    Sun,
    Moon
} from "lucide-react";

export default function Sidebar() {
    // 控制侧边栏展开/折叠的状态
    const [isCollapsed, setIsCollapsed] = useState(false);

    // 主题切换状态
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // 解决 Next.js 首次渲染时的主题闪烁问题
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <aside
            className={`relative flex flex-col h-screen bg-[#1c1c1c] text-zinc-300 border-r border-zinc-800 transition-all duration-300 ease-in-out z-50 ${isCollapsed ? "w-[72px]" : "w-64"
                }`}
        >
            {/* 顶部区域：Logo 与折叠按钮 */}
            <div className="flex items-center justify-between p-4 h-16">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 font-semibold text-white text-lg tracking-wider">
                        <span>方圆之间</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ${isCollapsed ? "mx-auto" : ""
                        }`}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            {/* 新建按钮 */}
            <div className="px-3 mb-4">
                <button
                    className={`flex items-center justify-center w-full gap-2 p-2.5 rounded-md bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white transition-colors ${isCollapsed ? "px-0" : "px-3"
                        }`}
                >
                    <Plus size={18} />
                    {!isCollapsed && <span className="font-medium text-sm">新建对话</span>}
                </button>
            </div>

            {/* 中部导航菜单 */}
            <nav className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
                <NavItem icon={<Monitor size={18} />} label="工作台" isCollapsed={isCollapsed} />
                <NavItem icon={<Folder size={18} />} label="我的空间" isCollapsed={isCollapsed} />
                <NavItem icon={<Settings size={18} />} label="自定义" isCollapsed={isCollapsed} />
                <div className="pt-4 pb-2">
                    {!isCollapsed && <p className="text-xs font-medium text-zinc-500 px-2 mb-1">历史</p>}
                    <NavItem icon={<History size={18} />} label="历史记录" isCollapsed={isCollapsed} />
                </div>
            </nav>

            {/* 底部功能区：升级、通知、用户信息、主题切换 */}
            <div className="p-3 border-t border-zinc-800 flex flex-col gap-2">
                <button
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ${isCollapsed ? "justify-center" : ""
                        }`}
                >
                    <ArrowUpCircle size={18} />
                    {!isCollapsed && <span className="text-sm">升级计划</span>}
                </button>

                {/* 用户信息与操作图标容器 */}
                <div className={`flex items-center mt-2 ${isCollapsed ? "justify-center flex-col gap-3" : "justify-between gap-2"
                    }`}>

                    {/* 左侧/上方：头像与名称 */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            Z
                        </div>
                        {!isCollapsed && <span className="text-sm text-zinc-300 font-medium truncate">钟总</span>}
                    </div>

                    {/* 右侧/下方：操作小图标组 */}
                    <div className={`flex items-center gap-1 ${isCollapsed ? "flex-col" : ""}`}>
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                            title="切换主题"
                        >
                            {mounted ? (
                                theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
                            ) : (
                                <div className="w-[18px] h-[18px]" /> // 占位符，防止加载时图标闪烁跳动
                            )}
                        </button>

                        <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="通知">
                            <Bell size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// 内部封装的小组件，保持代码整洁
function NavItem({ icon, label, isCollapsed }: { icon: React.ReactNode; label: string; isCollapsed: boolean }) {
    return (
        <div
            className={`flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 cursor-pointer transition-colors ${isCollapsed ? "justify-center" : ""
                }`}
            title={isCollapsed ? label : ""}
        >
            {icon}
            {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
        </div>
    );
}