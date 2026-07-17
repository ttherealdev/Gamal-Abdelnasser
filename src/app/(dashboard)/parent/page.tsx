import { api } from "@/trpc/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { monthName } from "@/lib/months"

export default async function ParentPage() {
  const years = await api.academicYear.list()
  const currentYear = years.find((y) => y.isCurrent) ?? years[0]

  if (!currentYear) {
    return <p className="text-muted-foreground text-sm">لا توجد سنة دراسية مفعّلة حالياً</p>
  }

  const [weekly, exams] = await Promise.all([
    api.weeklyEvaluation.forMyChild({ academicYearId: currentYear.id }),
    api.monthlyExam.forMyChild({ academicYearId: currentYear.id }),
  ])

  if (weekly.length === 0 && exams.length === 0) {
    return <p className="text-muted-foreground p-4 text-center text-sm">لا توجد درجات مسجلة بعد</p>
  }

  // Group into subject -> month -> component totals, same shape the
  // printed reports use — one combined row per month, not per week.
  const bySubject = new Map<
    string,
    { subjectName: string; months: Map<number, { behavior: number; notebook: number; test: number; exam: number | null }> }
  >()

  for (const row of weekly) {
    const entry = bySubject.get(row.subject.id) ?? { subjectName: row.subject.name, months: new Map() }
    const month = entry.months.get(row.month) ?? { behavior: 0, notebook: 0, test: 0, exam: null }
    month.behavior += row.behaviorScore
    month.notebook += row.notebookScore
    month.test += row.testScore
    entry.months.set(row.month, month)
    bySubject.set(row.subject.id, entry)
  }
  for (const exam of exams) {
    const entry = bySubject.get(exam.subject.id) ?? { subjectName: exam.subject.name, months: new Map() }
    const month = entry.months.get(exam.month) ?? { behavior: 0, notebook: 0, test: 0, exam: null }
    month.exam = exam.score
    entry.months.set(exam.month, month)
    bySubject.set(exam.subject.id, entry)
  }

  const subjects = Array.from(bySubject.values())

  return (
    <div className="flex flex-col gap-4">
      {subjects.map((subject) => {
        const months = Array.from(subject.months.entries()).sort((a, b) => a[0] - b[0])
        return (
          <Card key={subject.subjectName}>
            <CardHeader>
              <CardTitle>{subject.subjectName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الشهر</TableHead>
                    <TableHead>سلوك ومواظبة</TableHead>
                    <TableHead>كشكول وواجب</TableHead>
                    <TableHead>تقييم أسبوعي</TableHead>
                    <TableHead>اختبار الشهر</TableHead>
                    <TableHead>المجموع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {months.map(([month, totals]) => (
                    <TableRow key={month}>
                      <TableCell className="font-medium">{monthName(month)}</TableCell>
                      <TableCell>{totals.behavior}</TableCell>
                      <TableCell>{totals.notebook}</TableCell>
                      <TableCell>{totals.test}</TableCell>
                      <TableCell>{totals.exam ?? "—"}</TableCell>
                      <TableCell className="font-semibold">
                        {totals.behavior + totals.notebook + totals.test + (totals.exam ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
