import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth"
import { AuthModal } from "@/components/auth/auth-modal";
// 👇 1. 修改导入路径，指向 ui 目录下的 Sidebar
import Sidebar from "@/components/ui/sidebar";


export const metadata: Metadata = {
  title: "方圆智版 AI",
  description: "工业级极简打版计算与建议",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🎯 核心修复：添加 suppressHydrationWarning 压制脚本注入警告
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased flex h-screen overflow-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* 因为加了 flex，Provider 内部的内容默认也会横向排列，这正是我们需要的左右分栏效果 */}
          <AuthProvider>

            {/* 👇 3. 左侧：侧边栏组件 */}
            <Sidebar />

            {/* 👇 4. 右侧：主内容区域，使用 flex-1 撑满剩余空间，且允许内部纵向滚动 */}
            <main className="flex-1 h-full overflow-y-auto relative bg-background">
              {children}
            </main>

            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}