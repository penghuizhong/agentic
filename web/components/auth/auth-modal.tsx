"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { CheckCircle2 } from "lucide-react"

export function AuthModal() {
  const { isAuthModalOpen, hideAuthModal } = useAuth()
  const [view, setView] = useState<"login" | "register">("login")
  const [registerSuccess, setRegisterSuccess] = useState(false)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      hideAuthModal()
      setTimeout(() => {
        setView("login")
        setRegisterSuccess(false)
      }, 200)
    }
  }

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-zinc-900/90 backdrop-blur-xl border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>
            {registerSuccess ? "注册成功" : view === "login" ? "登录" : "注册"}
          </DialogTitle>
        </DialogHeader>
        {registerSuccess ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-primary" />
            <h3 className="text-xl font-semibold">注册成功！</h3>
            <p className="text-muted-foreground text-center">
              欢迎加入方圆智版
            </p>
            <Button
              onClick={() => handleOpenChange(false)}
              className="mt-4 w-full"
            >
              开始使用
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-1 rounded-full bg-muted p-1">
              <button
                onClick={() => setView("login")}
                className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${view === "login"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                登录
              </button>
              <button
                onClick={() => setView("register")}
                className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${view === "register"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                注册
              </button>
            </div>
            {view === "login" ? (
              <LoginForm embedded />
            ) : (
              <RegisterForm
                embedded
                onSuccess={() => setRegisterSuccess(true)}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}