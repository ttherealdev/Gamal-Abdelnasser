import { api } from "@/trpc/server"
import { GradesClassGrid } from "./grades-class-grid"

export default async function GradesPage() {
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
        <GradesClassGrid academicYearId={currentYear.id} />
      </div>
    </div>
  )
}
