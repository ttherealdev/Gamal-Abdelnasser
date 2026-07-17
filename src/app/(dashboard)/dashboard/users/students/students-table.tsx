"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeftRight, GraduationCap, KeyRound, Pencil, Plus, Search, Users } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleGate } from "@/components/auth/role-gate"
import { ClassPicker } from "@/components/dashboard/class-picker"
import { StudentFormDialog } from "./student-form-dialog"
import { TransferStudentDialog } from "./transfer-student-dialog"
import { ParentPortalDialog } from "./parent-portal-dialog"
import type { RouterOutputs } from "@/trpc/types"

type ClassRoom = RouterOutputs["classRoom"]["list"][number]
type StudentListItem = RouterOutputs["student"]["list"]["students"][number]

const secondLanguageLabel: Record<string, string> = {
  FRENCH: "فرنساوي",
  GERMAN: "ألماني",
  SPANISH: "إسباني",
}
const religionLabel: Record<string, string> = {
  ISLAM: "مسلم",
  CHRISTIANITY: "مسيحي",
}

export function StudentsTable({
  academicYearId,
  classRooms,
}: {
  academicYearId: string
  classRooms: ClassRoom[]
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [classRoomId, setClassRoomId] = useState("")
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentListItem | null>(null)
  const [transferringStudent, setTransferringStudent] = useState<StudentListItem | null>(null)
  const [portalStudent, setPortalStudent] = useState<StudentListItem | null>(null)

  const { data, isLoading } = useQuery({
    ...trpc.student.list.queryOptions({ academicYearId, classRoomId, search: search || undefined, limit: 100 }),
    enabled: !!classRoomId,
  })

  const selectedClass = classRooms.find((c) => c.id === classRoomId)

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-primary rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-primary-foreground text-2xl font-bold sm:text-3xl">بيانات الطلاب</h1>
            <p className="text-primary-foreground/70 mt-1 text-sm">اختر الفصل أولاً لعرض وإدارة طلابه</p>
          </div>
          <div className="[&_button]:border-white/20 [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20">
            <ClassPicker classRooms={classRooms} value={classRoomId} onChange={setClassRoomId} />
          </div>
        </div>
      </div>

      {!classRoomId ? (
        <p className="text-muted-foreground py-16 text-center text-sm">اختر الفصل من الأعلى لعرض طلابه</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="ابحث بالاسم أو الكود..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <RoleGate allow={["ADMIN", "DEVELOPER"]}>
              <Button
                onClick={() => {
                  setEditingStudent(null)
                  setDialogOpen(true)
                }}
              >
                <Plus className="ms-2 size-4" />
                إضافة طالب لفصل {selectedClass?.code}
              </Button>
            </RoleGate>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="text-primary size-5" />
                طلاب فصل {selectedClass?.code} ({data?.students.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-xs font-semibold">الكود</TableHead>
                    <TableHead className="text-xs font-semibold">الاسم</TableHead>
                    <TableHead className="text-xs font-semibold">النوع</TableHead>
                    <TableHead className="text-xs font-semibold">اللغة الثانية</TableHead>
                    <TableHead className="text-xs font-semibold">الديانة</TableHead>
                    <RoleGate allow={["ADMIN", "DEVELOPER"]}>
                      <TableHead className="w-32" />
                    </RoleGate>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="p-4" colSpan={6}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoading && data?.students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                        لا يوجد طلاب في هذا الفصل
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <span dir="ltr" className="text-foreground block text-right font-mono text-xs">
                          {student.studentCode}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="text-primary size-4 shrink-0" />
                          {student.fullName}
                        </div>
                      </TableCell>
                      <TableCell>{student.gender === "MALE" ? "ذكر" : "أنثى"}</TableCell>
                      <TableCell>
                        {student.secondLanguage ? (
                          <Badge variant="outline">{secondLanguageLabel[student.secondLanguage]}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.religion ? (
                          <Badge variant="outline">{religionLabel[student.religion]}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <RoleGate allow={["ADMIN", "DEVELOPER"]}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              title="تعديل بيانات الطالب"
                              onClick={() => {
                                setEditingStudent(student)
                                setDialogOpen(true)
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              title="نقل لفصل آخر"
                              onClick={() => setTransferringStudent(student)}
                            >
                              <ArrowLeftRight className="size-4" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              title="بوابة ولي الأمر"
                              onClick={() => setPortalStudent(student)}
                            >
                              <KeyRound className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </RoleGate>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        academicYearId={academicYearId}
        classRoomId={classRoomId}
        editingStudent={editingStudent}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: trpc.student.list.queryKey() })
        }}
      />

      {transferringStudent && (
        <TransferStudentDialog
          open={!!transferringStudent}
          onOpenChange={(v) => !v && setTransferringStudent(null)}
          academicYearId={academicYearId}
          studentId={transferringStudent.id}
          studentName={transferringStudent.fullName}
          currentClassRoomId={classRoomId}
          classRooms={classRooms}
          onTransferred={() => setTransferringStudent(null)}
        />
      )}

      {portalStudent && (
        <ParentPortalDialog
          open={!!portalStudent}
          onOpenChange={(v) => !v && setPortalStudent(null)}
          studentId={portalStudent.id}
          studentName={portalStudent.fullName}
          studentCode={portalStudent.studentCode}
        />
      )}
    </div>
  )
}
