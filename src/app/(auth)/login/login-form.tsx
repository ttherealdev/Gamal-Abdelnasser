"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/server/better-auth/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginMode = "staff" | "parent"

export function LoginForm() {
  const [mode, setMode] = useState<LoginMode>("staff")
  const [error, setError] = useState("")

  return (
    <div className="flex min-h-svh">
      <DecorativePanel />

      <div className="flex w-full flex-col lg:w-1/2">
        <div className="p-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
          >
            <ArrowRight className="size-4" />
            <span className="text-sm">العودة للرئيسية</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <div className="mb-4 inline-flex items-center gap-3">
                <div className="bg-primary flex size-12 items-center justify-center rounded-xl">
                  <GraduationCap className="text-primary-foreground size-7" />
                </div>
                <span className="text-foreground text-xl font-bold">مدرسة جمال عبدالناصر</span>
              </div>
            </div>

            <div className="mb-8 text-center">
              <h2 className="text-foreground mb-2 text-2xl font-bold sm:text-3xl">مرحباً بك</h2>
              <p className="text-muted-foreground">سجّل الدخول للوصول إلى حسابك</p>
            </div>

            <div className="bg-muted mb-8 flex gap-2 rounded-xl p-1.5">
              <ModeButton
                active={mode === "staff"}
                onClick={() => {
                  setMode("staff")
                  setError("")
                }}
                icon={Users}
                label="لوحة التحكم"
              />
              <ModeButton
                active={mode === "parent"}
                onClick={() => {
                  setMode("parent")
                  setError("")
                }}
                icon={KeyRound}
                label="ولي الأمر"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2 mb-6 rounded-xl border p-4 text-center text-sm duration-200">
                {error}
              </div>
            )}

            {mode === "staff" ? (
              <StaffLoginForm onError={setError} />
            ) : (
              <ParentLoginForm onError={setError} />
            )}
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} مدرسة جمال عبدالناصر. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  )
}

function DecorativePanel() {
  return (
    <div className="bg-primary relative hidden overflow-hidden lg:flex lg:w-1/2">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 size-64 rounded-full border-[40px] border-white/20" />
        <div className="absolute bottom-40 left-10 size-96 rounded-full border-[60px] border-white/10" />
        <div className="absolute top-1/2 right-1/3 size-48 rounded-full border-[30px] border-white/15" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-white">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <GraduationCap className="size-12 text-white" />
        </div>

        <h1 className="text-balance mb-4 text-center text-4xl font-bold">مدرسة جمال عبدالناصر</h1>
        <p className="text-pretty mb-12 max-w-md text-center text-xl text-white/80">
          نظام إدارة المدرسة العسكرية الثانوية بنين — الطلاب والمعلمون وأولياء الأمور
        </p>

        <div className="w-full max-w-sm space-y-4">
          <FeatureRow icon={BookOpen} title="متابعة الدرجات" description="تقييمات أسبوعية وامتحانات في مكان واحد" />
          <FeatureRow icon={Users} title="تواصل فعّال" description="ربط أولياء الأمور بنتائج أبنائهم أولاً بأول" />
        </div>
      </div>
    </div>
  )
}

function FeatureRow({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white/20">
        <Icon className="size-6" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function StaffLoginForm({ onError }: { onError: (message: string) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onError("")
    setLoading(true)
    const { error } = await authClient.signIn.email({ email, password })
    if (error) {
      setLoading(false)
      onError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
      return
    }
    window.location.assign("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in space-y-5 duration-200">
      <div className="space-y-2">
        <Label htmlFor="staff-email">البريد الإلكتروني</Label>
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 right-3 size-5 -translate-y-1/2" />
          <Input
            id="staff-email"
            type="email"
            dir="ltr"
            placeholder="teacher@school.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-muted/50 focus-visible:bg-background focus-visible:ring-primary/20 h-12 pr-11 text-base"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="staff-password">كلمة المرور</Label>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 right-3 size-5 -translate-y-1/2" />
          <Input
            id="staff-password"
            type={showPassword ? "text" : "password"}
            dir="ltr"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-muted/50 focus-visible:bg-background focus-visible:ring-primary/20 h-12 pr-11 pl-11 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </div>

      <SubmitButton loading={loading} idleLabel="تسجيل الدخول" loadingLabel="جارِ تسجيل الدخول..." />
    </form>
  )
}

function ParentLoginForm({ onError }: { onError: (message: string) => void }) {
  const [studentCode, setStudentCode] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onError("")
    setLoading(true)
    const res = await fetch("/api/auth/parent-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentCode: studentCode.trim(), password }),
    })
    if (!res.ok) {
      setLoading(false)
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      onError(body?.error ?? "بيانات الدخول غير صحيحة")
      return
    }
    window.location.assign("/parent")
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in space-y-5 duration-200">
      <div className="space-y-2">
        <Label htmlFor="student-code">كود الطالب</Label>
        <div className="relative">
          <KeyRound className="text-muted-foreground absolute top-1/2 right-3 size-5 -translate-y-1/2" />
          <Input
            id="student-code"
            type="text"
            dir="ltr"
            placeholder="مثال: 207"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            required
            autoComplete="off"
            className="bg-muted/50 focus-visible:bg-background focus-visible:ring-primary/20 h-14 pr-11 text-center font-mono text-lg tracking-widest"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent-password">كلمة المرور</Label>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 right-3 size-5 -translate-y-1/2" />
          <Input
            id="parent-password"
            type="password"
            dir="ltr"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-muted/50 focus-visible:bg-background focus-visible:ring-primary/20 h-12 pr-11 text-base"
          />
        </div>
      </div>

      <SubmitButton loading={loading} idleLabel="دخول" loadingLabel="جارِ الدخول..." />

      <div className="border-border mt-8 border-t pt-6">
        <div className="bg-primary/5 rounded-xl p-4">
          <h4 className="text-foreground mb-2 text-sm font-medium">لأولياء الأمور</h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            كود الطالب موجود على شهادة الدرجات. كلمة المرور تحصل عليها من إدارة المدرسة عند تفعيل بوابة ولي الأمر
            لأول مرة.
          </p>
        </div>
      </div>
    </form>
  )
}

function SubmitButton({
  loading,
  idleLabel,
  loadingLabel,
}: {
  loading: boolean
  idleLabel: string
  loadingLabel: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/35 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-base font-medium shadow-lg transition-all duration-200 disabled:opacity-70"
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {loading ? loadingLabel : idleLabel}
    </button>
  )
}
