"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Award, Lock } from "lucide-react"
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
import { monthlyExamName } from "@/lib/months"

interface MonthlyExamGridProps {
  academicYearId: string
  classRoomId: string
  subjectId: string
  month: number
}

export function MonthlyExamGrid({ academicYearId, classRoomId, subjectId, month }: MonthlyExamGridProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    trpc.monthlyExam.grid.queryOptions({ academicYearId, classRoomId, subjectId, month }),
  )

  const upsertScore = useMutation(
    trpc.monthlyExam.upsertScore.mutationOptions({
      onError: (error) => toast.error(error.message),
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.monthlyExam.grid.queryKey() })
      },
    }),
  )

  if (isLoading) return <Skeleton className="h-40 w-full" />
  if (!data || data.rows.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">لا يوجد طلاب مسجلين في هذا الفصل</p>
  }

  return (
    <Card className="shadow-lg">
      <CardHeader >
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="text-primary size-5" />
          {monthlyExamName(month)} — من {data.maxScore}
          {!data.isOpen && <Lock className="text-muted-foreground size-3.5" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader >
            <TableRow className="bg-muted/50 hover:bg-muted/50 ">
              <TableHead className="text-xs font-semibold">الطالب</TableHead>
              <TableHead className="w-32 text-center text-xs font-semibold">الدرجة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.studentId} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{row.studentName}</TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min={0}
                    max={data.maxScore}
                    defaultValue={row.score ?? ""}
                    disabled={!data.isOpen}
                    className="mx-auto h-8 w-20 text-center"
                    onBlur={(e) => {
                      if (e.target.value === "") return
                      const value = Number(e.target.value)
                      if (value === row.score) return
                      upsertScore.mutate({
                        studentId: row.studentId,
                        classRoomId,
                        subjectId,
                        academicYearId,
                        month,
                        score: value,
                      })
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
