import { requireRole } from "@/lib/auth-guard"
import { api, trpc, prefetch, HydrateClient } from "@/trpc/server"
import { StudentsTable } from "./students-table"

export default async function StudentsPage() {
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

  const [classRooms] = await Promise.all([
    api.classRoom.list({ academicYearId: currentYear.id }),
    prefetch(trpc.student.list.queryOptions({ academicYearId: currentYear.id, limit: 30 })),
  ])

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <HydrateClient>
          <StudentsTable academicYearId={currentYear.id} classRooms={classRooms} />
        </HydrateClient>
      </div>
    </div>
  )
}
