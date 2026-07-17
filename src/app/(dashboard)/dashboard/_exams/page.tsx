import { api } from "@/trpc/server"
import { requireRole } from "@/lib/auth-guard"
import { PageHero } from "@/components/dashboard/page-hero"
import { ExamSheetWorkspace } from "./exam-sheet-workspace"

export default async function ExamsPage() {
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4">
        <PageHero
          eyebrow="امتحانات نصف وآخر العام"
          title="درجات الامتحانات"
          description="اختر الفصل ونوع الامتحان لإدخال درجات العملي والتحريري لكل مادة"
        />
        <ExamSheetWorkspace academicYearId={currentYear.id} />
      </div>
    </div>
  )
}
