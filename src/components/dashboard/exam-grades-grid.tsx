"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Award } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { computeGradeLetter, scoreTone } from "@/lib/grading"

interface ExamGradesGridProps {
  academicYearId: string
  classRoomId: string
  examType: "MIDTERM" | "FINAL"
}

export function ExamGradesGrid({ academicYearId, classRoomId, examType }: ExamGradesGridProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    trpc.examGrade.classSheet.queryOptions({ classRoomId, academicYearId, examType }),
  )

  const upsertGrade = useMutation(
    trpc.examGrade.upsert.mutationOptions({
      onError: (error) => toast.error(error.message),
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.examGrade.classSheet.queryKey() })
      },
    }),
  )

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (!data || data.subjects.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">لا توجد مواد متاحة لك في هذا الفصل</p>
  }
  if (data.rows.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">لا يوجد طلاب مسجلين في هذا الفصل</p>
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="text-primary size-5" />
          {examType === "MIDTERM" ? "امتحان نصف العام" : "امتحان آخر العام"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="bg-muted/50 sticky right-0 text-xs font-semibold">الطالب</TableHead>
              {data.subjects.map((s) => (
                <TableHead key={s.id} className="text-center text-xs font-semibold">
                  {s.name}
                  <div className="text-muted-foreground text-xs font-normal">/{s.maxScore}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.studentId} className="hover:bg-muted/30 transition-colors">
                <TableCell className="bg-background sticky right-0 font-medium">{row.studentName}</TableCell>
                {row.cells.map((cell, i) => {
                  const subject = data.subjects[i]!
                  const total = cell.practicalScore + cell.writtenScore
                  return (
                    <TableCell key={cell.subjectId} className="p-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            defaultValue={cell.practicalScore || ""}
                            placeholder="عملي"
                            className="h-8 w-14 text-center"
                            onBlur={(e) => {
                              const practicalScore = Number(e.target.value) || 0
                              if (practicalScore === cell.practicalScore) return
                              upsertGrade.mutate({
                                studentId: row.studentId,
                                subjectId: cell.subjectId,
                                classRoomId,
                                academicYearId,
                                examType,
                                practicalScore,
                                writtenScore: cell.writtenScore,
                              })
                            }}
                          />
                          <Input
                            type="number"
                            min={0}
                            defaultValue={cell.writtenScore || ""}
                            placeholder="تحريري"
                            className="h-8 w-14 text-center"
                            onBlur={(e) => {
                              const writtenScore = Number(e.target.value) || 0
                              if (writtenScore === cell.writtenScore) return
                              upsertGrade.mutate({
                                studentId: row.studentId,
                                subjectId: cell.subjectId,
                                classRoomId,
                                academicYearId,
                                examType,
                                practicalScore: cell.practicalScore,
                                writtenScore,
                              })
                            }}
                          />
                        </div>
                        {total > 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${scoreTone(total, subject.maxScore)}`}>
                            {total} — {computeGradeLetter(total, subject.maxScore)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
