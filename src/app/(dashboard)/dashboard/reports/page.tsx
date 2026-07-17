import { requireRole } from "@/lib/auth-guard"
import { api } from "@/trpc/server"
import { getEffectiveMonth } from "@/server/api/services/academic-year.service"
import { PageHero } from "@/components/dashboard/page-hero"
import { ReportsWorkspace } from "./reports-workspace"

export default async function ReportsPage() {
  await requireRole(["ADMIN", "DEVELOPER"])

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

  const classRooms = await api.classRoom.list({ academicYearId: currentYear.id })

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4">
        <PageHero
          eyebrow="التقارير المطبوعة"
          title="التقارير"
          description="إنشاء تقرير درجات شهري لفصل كامل أو لطالب واحد، جاهز للطباعة"
        />
        <ReportsWorkspace
          academicYearId={currentYear.id}
          classRooms={classRooms}
          defaultMonth={getEffectiveMonth(currentYear)}
        />
      </div>
    </div>
  )
}
