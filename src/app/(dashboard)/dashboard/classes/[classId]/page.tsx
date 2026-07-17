import { notFound } from "next/navigation"
import { BookOpen } from "lucide-react"
import { api } from "@/trpc/server"
import { getEffectiveMonth } from "@/server/api/services/academic-year.service"
import { ClassDetailWorkspace } from "./class-detail-workspace"

const stageLabel: Record<string, string> = {
  FIRST_SECONDARY: "الأول الثانوي",
  SECOND_SECONDARY: "الثاني الثانوي",
}
const trackLabel: Record<string, string> = { SCIENCE: "علمي", ARTS: "أدبي", GENERAL: "عام" }

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ subject?: string }>
}) {
  const { classId } = await params
  const { subject: initialSubjectId } = await searchParams

  const years = await api.academicYear.list()
  const currentYear = years.find((y) => y.isCurrent) ?? years[0]
  if (!currentYear) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-muted-foreground p-4 text-sm">لا توجد سنة دراسية مفعّلة.</div>
      </div>
    )
  }

  const classRoom = await api.classRoom.byId({ id: classId }).catch(() => null)
  if (!classRoom) notFound()

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4">
        <div className="flex items-center gap-4">
          <div className="from-primary/20 to-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl bg-linear-to-br">
            <BookOpen className="size-7" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">فصل {classRoom.code}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {stageLabel[classRoom.stageLevel]} — {trackLabel[classRoom.track]} — {classRoom._count.enrollments} طالب
            </p>
          </div>
        </div>

        <ClassDetailWorkspace
          academicYearId={currentYear.id}
          classRoom={{ id: classRoom.id, stageLevel: classRoom.stageLevel, track: classRoom.track }}
          initialSubjectId={initialSubjectId}
          defaultMonth={getEffectiveMonth(currentYear)}
        />
      </div>
    </div>
  )
}
