import { requireRole } from "@/lib/auth-guard";
import { api } from "@/trpc/server";
import { ClassesTable } from "./classes-table";

export default async function ClassesPage() {
  await requireRole(["ADMIN", "DEVELOPER"]);

  const years = await api.academicYear.list();
  const currentYear = years.find((y) => y.isCurrent) ?? years[0];

  if (!currentYear) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="p-4 text-sm text-muted-foreground">
          لا توجد سنة دراسية مفعّلة، فعّل سنة من الإعدادات أولاً.
        </div>
      </div>
    );
  }

  const [classRooms, staff] = await Promise.all([
    api.classRoom.list({ academicYearId: currentYear.id }),
    api.user.listStaff({ role: "TEACHER" }),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4">
        <ClassesTable
          academicYearId={currentYear.id}
          initialClassRooms={classRooms}
          teachers={staff}
        />
      </div>
    </div>
  );
}
