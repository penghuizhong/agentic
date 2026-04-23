import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth"
import { AuthModal } from "@/components/auth/auth-modal";
// 👇 1. 修改导入路径，指向 ui 目录下的 Sidebar
import Sidebar from "@/components/ui/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  // variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      {/* 👇 2. 在 body 加上 flex h-screen overflow-hidden 实现全屏且禁止全局滚动 */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen overflow-hidden`}>
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