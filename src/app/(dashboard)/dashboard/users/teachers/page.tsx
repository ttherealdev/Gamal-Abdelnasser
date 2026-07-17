import { requireRole } from "@/lib/auth-guard"
import { api } from "@/trpc/server"
import { StaffTable } from "./staff-table"

export default async function TeachersPage() {
  await requireRole(["ADMIN", "DEVELOPER"])

  const staff = await api.user.listStaff({})

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <StaffTable initialStaff={staff} />
      </div>
    </div>
  )
}
