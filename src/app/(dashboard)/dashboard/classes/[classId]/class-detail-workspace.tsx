"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { GraduationCap } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useSession } from "@/server/better-auth/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WeeklyGradesGrid } from "@/components/dashboard/weekly-grades-grid"
import { MonthlyExamGrid } from "@/components/dashboard/monthly-exam-grid"
import { MONTH_NAMES } from "@/lib/months"
import type { Role, StageLevel, Track } from "@/generated/enums"

interface ClassDetailWorkspaceProps {
  academicYearId: string
  classRoom: { id: string; stageLevel: StageLevel; track: Track }
  initialSubjectId?: string
  defaultMonth: number
}

// NOTE: exam grades (midterm/final) are intentionally not shown here — see
// the _exams folder and manageExams capability. The school isn't running
// that workflow yet (seating-number rollout still pending), so it's hidden
// from every page, but the service/router/schema code is untouched and
// ready to re-enable later.
export function ClassDetailWorkspace({
  academicYearId,
  classRoom,
  initialSubjectId,
  defaultMonth,
}: ClassDetailWorkspaceProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const role = session?.user.role as Role | undefined
  const isStaffAdmin = role === "ADMIN" || role === "DEVELOPER"

  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "")
  const [month, setMonth] = useState<number>(defaultMonth)
  const [pickingTeacher, setPickingTeacher] = useState(false)
  const [teacherToAssign, setTeacherToAssign] = useState("")

  const { data: assignments } = useQuery(
    trpc.teacherAssignment.listForClass.queryOptions({ classRoomId: classRoom.id, academicYearId }),
  )

  const { data: allSubjects } = useQuery({
    ...trpc.subject.list.queryOptions({
      stageLevel: classRoom.stageLevel,
      track: classRoom.track,
      onlyActive: true,
    }),
    enabled: isStaffAdmin,
  })

  const { data: allTeachers } = useQuery({
    ...trpc.user.listStaff.queryOptions({ role: "TEACHER" }),
    enabled: isStaffAdmin && pickingTeacher,
  })

  // TEACHER only ever sees the subject(s) they're actually assigned in this
  // class — matches the same restriction the grid itself enforces
  // server-side, so the picker never offers a choice that would 403 anyway.
  const subjectOptions = useMemo(() => {
    if (isStaffAdmin) return allSubjects ?? []
    if (!session?.user || !assignments) return []
    const mine = assignments.filter((a) => a.user.id === session.user.id)
    return mine.map((a) => a.subject)
  }, [isStaffAdmin, allSubjects, assignments, session?.user])

  // A teacher who only teaches one subject in this class has nothing to
  // choose — auto-select it so they land straight on the grades grid
  // instead of picking from a dropdown with a single option.
  useEffect(() => {
    if (!isStaffAdmin && !subjectId && subjectOptions.length === 1) {
      setSubjectId(subjectOptions[0]!.id)
    }
  }, [isStaffAdmin, subjectId, subjectOptions])

  const showSubjectPicker = isStaffAdmin || subjectOptions.length > 1

  // Only teachers whose specialty subject NAME matches show up here —
  // assigning "اللغة العربية" only offers Arabic-specialty teachers. Matched
  // by name rather than exact subject id, since the same subject exists as
  // a separate row per stage/track (a teacher's specialty in "الرياضيات"
  // should still count when assigning the SECOND_SECONDARY variant of it).
  const targetSubjectName = subjectOptions.find((s) => s.id === subjectId)?.name
  const eligibleTeachers = useMemo(
    () => allTeachers?.filter((t) => t.subject?.name === targetSubjectName) ?? [],
    [allTeachers, targetSubjectName],
  )

  const teacherForSubject = assignments?.find((a) => a.subject.id === subjectId)?.user

  const assignTeacher = useMutation(
    trpc.teacherAssignment.create.mutationOptions({
      onSuccess: () => {
        toast.success("تم إسناد المعلم")
        setPickingTeacher(false)
        setTeacherToAssign("")
        void queryClient.invalidateQueries({ queryKey: trpc.teacherAssignment.listForClass.queryKey() })
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const removeAssignment = useMutation(
    trpc.teacherAssignment.remove.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.teacherAssignment.listForClass.queryKey() })
      },
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      {showSubjectPicker && (
        <div className="flex flex-wrap items-center gap-2">
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="اختر المادة" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {subjectId && (
        <Card className="from-primary/5 to-primary/[0.02] border-primary/10 border bg-linear-to-br">
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">المادة الحالية</p>
              <p className="text-foreground mt-1 text-lg font-bold sm:text-xl">
                {subjectOptions.find((s) => s.id === subjectId)?.name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">معلم المادة</p>
              {!pickingTeacher ? (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-foreground flex items-center gap-2 text-lg font-bold sm:text-xl">
                    <GraduationCap className="text-primary size-5" />
                    {teacherForSubject?.name ?? "لا يوجد"}
                  </p>
                  {isStaffAdmin && (
                    <Button size="sm" variant="outline" onClick={() => setPickingTeacher(true)}>
                      {teacherForSubject ? "تغيير" : "إسناد"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <Select value={teacherToAssign} onValueChange={setTeacherToAssign}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={eligibleTeachers.length ? "اختر المعلم" : "لا يوجد معلم لهذه المادة"} />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleTeachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!teacherToAssign || assignTeacher.isPending}
                    onClick={() => {
                      const existing = assignments?.find((a) => a.subject.id === subjectId)
                      if (existing) removeAssignment.mutate({ id: existing.id })
                      assignTeacher.mutate({ userId: teacherToAssign, subjectId, classRoomId: classRoom.id, academicYearId })
                    }}
                  >
                    حفظ
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPickingTeacher(false)}>
                    إلغاء
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!subjectId ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {!isStaffAdmin && subjectOptions.length === 0
            ? "لم يتم إسناد أي مادة لك في هذا الفصل"
            : "اختر مادة لعرض الدرجات"}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {isStaffAdmin && (
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MONTH_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <WeeklyGradesGrid
            academicYearId={academicYearId}
            classRoomId={classRoom.id}
            subjectId={subjectId}
            month={month}
          />
          <MonthlyExamGrid
            academicYearId={academicYearId}
            classRoomId={classRoom.id}
            subjectId={subjectId}
            month={month}
          />
        </div>
      )}
    </div>
  )
}
