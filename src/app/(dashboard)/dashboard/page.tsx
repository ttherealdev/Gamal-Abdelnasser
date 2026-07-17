import { Activity, GraduationCap, Layers, School, Shield, Users } from "lucide-react"
import Link from "next/link"
import { api } from "@/trpc/server"
import { requireSession } from "@/lib/auth-guard"
import { PageHero } from "@/components/dashboard/page-hero"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLE_LABELS } from "@/lib/rbac"
import type { Role } from "@/generated/enums"

const roleIcon: Record<Role, React.ComponentType<{ className?: string }>> = {
  DEVELOPER: Shield,
  ADMIN: Shield,
  TEACHER: Users,
  PARENT: Users,
}
const roleTone: Record<Role, string> = {
  DEVELOPER: "text-violet-500 bg-violet-500/10",
  ADMIN: "text-amber-500 bg-amber-500/10",
  TEACHER: "text-blue-500 bg-blue-500/10",
  PARENT: "text-emerald-500 bg-emerald-500/10",
}

const actionLabel: Record<string, string> = { CREATE: "+", UPDATE: "~", DELETE: "-" }
const actionTone: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-500",
  UPDATE: "bg-blue-500/10 text-blue-500",
  DELETE: "bg-red-500/10 text-red-500",
}

export default async function DashboardOverviewPage() {
  const session = await requireSession()
  const role = session.user.role as Role

  const years = await api.academicYear.list()
  const currentYear = years.find((y) => y.isCurrent) ?? years[0]

  if (!currentYear) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-muted-foreground p-4 text-sm">
          لا توجد سنة دراسية مفعّلة، فعّل سنة من الإعدادات أولاً.
        </div>
      </div>
    )
  }

  const stats = await api.dashboard.stats({ academicYearId: currentYear.id })
  const recentLogs = role === "DEVELOPER" ? (await api.audit.list({ limit: 5 })).logs : null

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 sm:gap-8">
        <PageHero
          eyebrow="لوحة التحكم الرئيسية"
          title={`مرحباً بك، ${session.user.name}`}
          description={`نظام إدارة مدرسة جمال عبدالناصر — السنة الدراسية ${currentYear.id}`}
        />

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.scope === "school" ? (
            <>
              <StatCard
                title="إجمالي الطلاب"
                value={stats.totalStudents}
                icon={GraduationCap}
                gradient="from-emerald-500 to-emerald-600"
                href="/dashboard/users/students"
              />
              <StatCard
                title="إجمالي المعلمين"
                value={stats.totalTeachers}
                icon={Users}
                gradient="from-blue-500 to-blue-600"
                href="/dashboard/users/teachers"
              />
              <StatCard
                title="عدد الفصول"
                value={stats.totalClasses}
                icon={School}
                gradient="from-amber-500 to-orange-500"
                href="/dashboard/classes"
              />
              <StatCard
                title="عدد المواد"
                value={stats.totalSubjects}
                icon={Layers}
                gradient="from-rose-500 to-pink-500"
              />
            </>
          ) : (
            <>
              <StatCard
                title="فصولي"
                value={stats.myClasses}
                icon={School}
                gradient="from-amber-500 to-orange-500"
                href="/dashboard/grades"
              />
              <StatCard
                title="موادي"
                value={stats.mySubjects}
                icon={Layers}
                gradient="from-rose-500 to-pink-500"
              />
              <StatCard
                title="طلابي"
                value={stats.myStudents}
                icon={GraduationCap}
                gradient="from-emerald-500 to-emerald-600"
              />
            </>
          )}
        </div>

        {stats.scope === "school" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                  <Users className="text-primary size-5" />
                  توزيع المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {stats.roleCounts.map(({ role: r, count }) => {
                    const Icon = roleIcon[r]
                    return (
                      <div
                        key={r}
                        className="from-muted/30 group flex items-center gap-4 rounded-2xl bg-linear-to-l to-transparent p-4 transition-all duration-300 hover:from-muted/50"
                      >
                        <div
                          className={`flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${roleTone[r]}`}
                        >
                          <Icon className="size-7" />
                        </div>
                        <div className="flex-1">
                          <p className="text-muted-foreground mb-1 text-sm">{ROLE_LABELS[r]}</p>
                          <p className="text-foreground text-3xl font-bold">{count}</p>
                        </div>
                        <div className="from-primary/50 to-primary/10 h-16 w-1 rounded-full bg-linear-to-b" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {recentLogs && (
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                    <Activity className="text-primary size-5" />
                    آخر النشاطات
                  </CardTitle>
                  <Link
                    href="/dashboard/logs"
                    className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
                  >
                    عرض الكل
                  </Link>
                </CardHeader>
                <CardContent className="pt-4">
                  {recentLogs.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="bg-muted/50 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                        <Activity className="text-muted-foreground/50 size-8" />
                      </div>
                      <p className="text-muted-foreground text-sm">لا توجد نشاطات مسجلة حتى الآن</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentLogs.map((log) => (
                        <div
                          key={log.id}
                          className="from-muted/30 flex items-start gap-3 rounded-xl bg-linear-to-l to-transparent p-3 transition-all duration-300 hover:from-muted/50"
                        >
                          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${actionTone[log.action]}`}>
                            <span className="text-sm font-bold">{actionLabel[log.action]}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground text-sm leading-relaxed">
                              {log.note ?? `${log.fieldChanged ?? log.entityType}: ${log.newValue ?? ""}`}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">{log.userName}</span>
                              <span className="bg-muted-foreground/30 size-1 rounded-full" />
                              <span className="text-muted-foreground text-xs">
                                {new Date(log.timestamp).toLocaleString("ar-EG")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
