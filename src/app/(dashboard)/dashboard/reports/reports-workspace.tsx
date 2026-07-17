"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Hash, Printer, User, Users } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClassPicker } from "@/components/dashboard/class-picker"
import { SearchPicker } from "@/components/dashboard/search-picker"
import {
  buildClassMonthlyReportHtml,
  buildStudentMonthlyReportHtml,
  openPrintWindow,
} from "@/lib/print-report"
import { MONTH_NAMES, monthName } from "@/lib/months"
import type { RouterOutputs } from "@/trpc/types"

type ClassRoom = RouterOutputs["classRoom"]["list"][number]

// NOTE: midterm/final exam reports are intentionally not offered here — see
// the NOTE in class-detail-workspace.tsx. Only month-based reports are
// exposed until that workflow is re-enabled.
export function ReportsWorkspace({
  academicYearId,
  classRooms,
  defaultMonth,
}: {
  academicYearId: string
  classRooms: ClassRoom[]
  defaultMonth: number
}) {
  return (
    <Tabs defaultValue="class">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="class" className="gap-2">
          <Users className="size-4" />
          تقرير فصل
        </TabsTrigger>
        <TabsTrigger value="student" className="gap-2">
          <User className="size-4" />
          تقرير طالب
        </TabsTrigger>
      </TabsList>

      <TabsContent value="class" className="mt-6">
        <ClassMonthlyReportTab academicYearId={academicYearId} classRooms={classRooms} defaultMonth={defaultMonth} />
      </TabsContent>
      <TabsContent value="student" className="mt-6">
        <StudentMonthlyReportTab academicYearId={academicYearId} classRooms={classRooms} />
      </TabsContent>
    </Tabs>
  )
}

function ReportCardShell({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="from-primary/10 bg-gradient-to-l via-primary/5 border-b to-transparent">
        <CardTitle className="flex items-center gap-3">
          <div className="from-primary to-primary/80 flex size-10 items-center justify-center rounded-xl bg-linear-to-br shadow-md">
            <Icon className="text-primary-foreground size-5" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 p-6">{children}</CardContent>
    </Card>
  )
}

function ClassMonthlyReportTab({
  academicYearId,
  classRooms,
  defaultMonth,
}: {
  academicYearId: string
  classRooms: ClassRoom[]
  defaultMonth: number
}) {
  const trpc = useTRPC()
  const [classRoomId, setClassRoomId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [month, setMonth] = useState<number>(defaultMonth)
  const [generating, setGenerating] = useState(false)

  const selectedClass = classRooms.find((c) => c.id === classRoomId)

  const { data: subjects } = useQuery({
    ...trpc.subject.list.queryOptions({
      stageLevel: selectedClass?.stageLevel,
      track: selectedClass?.track ?? "GENERAL",
      onlyActive: true,
    }),
    enabled: !!selectedClass,
  })

  const { refetch: refetchWeekly } = useQuery({
    ...trpc.weeklyEvaluation.grid.queryOptions({ academicYearId, classRoomId, subjectId, month }),
    enabled: false,
  })
  const { refetch: refetchExam } = useQuery({
    ...trpc.monthlyExam.grid.queryOptions({ academicYearId, classRoomId, subjectId, month }),
    enabled: false,
  })

  async function handleGenerate() {
    const subject = subjects?.find((s) => s.id === subjectId)
    if (!selectedClass || !subject) {
      toast.error("اختر الفصل والمادة أولاً")
      return
    }
    setGenerating(true)
    const [{ data: weekly, error: weeklyError }, { data: exam, error: examError }] = await Promise.all([
      refetchWeekly(),
      refetchExam(),
    ])
    setGenerating(false)
    if (weeklyError || examError || !weekly || !exam) {
      toast.error("تعذّر جلب الدرجات")
      return
    }
    if (weekly.rows.length === 0) {
      toast.error("لا يوجد طلاب في هذا الفصل")
      return
    }

    const examByStudent = new Map(exam.rows.map((r) => [r.studentId, r.score]))
    const rows = weekly.rows.map((row) => ({
      studentName: row.studentName,
      studentCode: row.studentCode,
      behaviorTotal: row.scores.reduce((sum, s) => sum + (s?.behaviorScore ?? 0), 0),
      notebookTotal: row.scores.reduce((sum, s) => sum + (s?.notebookScore ?? 0), 0),
      testTotal: row.scores.reduce((sum, s) => sum + (s?.testScore ?? 0), 0),
      examScore: examByStudent.get(row.studentId) ?? null,
    }))

    openPrintWindow(
      buildClassMonthlyReportHtml({
        classCode: selectedClass.code,
        academicYearId,
        monthLabel: monthName(month),
        subjectName: subject.name,
        maxima: {
          behavior: weekly.maxima.behavior * 4,
          notebook: weekly.maxima.notebook * 4,
          test: weekly.maxima.test * 4,
          exam: exam.maxScore,
        },
        rows,
      }),
    )
  }

  return (
    <ReportCardShell icon={Users} title="تقرير فصل شهري">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ClassPicker
          classRooms={classRooms}
          value={classRoomId}
          onChange={(id) => {
            setClassRoomId(id)
            setSubjectId("")
          }}
        />
        <Select value={subjectId} onValueChange={setSubjectId} disabled={!classRoomId}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="اختر المادة" />
          </SelectTrigger>
          <SelectContent>
            {subjects?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="h-12 rounded-xl">
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
      </div>

      <Button
        onClick={handleGenerate}
        disabled={generating || !subjectId}
        size="lg"
        className="h-14 gap-3 rounded-xl text-base font-semibold"
      >
        <Printer className="size-5" />
        {generating ? "جارِ الإنشاء..." : "إنشاء وطباعة التقرير"}
      </Button>
    </ReportCardShell>
  )
}

function StudentMonthlyReportTab({
  academicYearId,
  classRooms,
}: {
  academicYearId: string
  classRooms: ClassRoom[]
}) {
  const trpc = useTRPC()
  const [classRoomId, setClassRoomId] = useState("")
  const [studentId, setStudentId] = useState("")
  const [studentCode, setStudentCode] = useState("")
  const [foundStudent, setFoundStudent] = useState<{ id: string; fullName: string; studentCode: string; classCode: string } | null>(null)
  const [generating, setGenerating] = useState(false)

  const selectedClass = classRooms.find((c) => c.id === classRoomId)

  const { data: studentsData } = useQuery({
    ...trpc.student.list.queryOptions({ academicYearId, classRoomId, limit: 100 }),
    enabled: !!classRoomId,
  })

  const { refetch: lookupByCode, isFetching: lookingUp } = useQuery({
    ...trpc.student.byCode.queryOptions({ studentCode, academicYearId }),
    enabled: false,
  })

  const { refetch: refetchWeekly } = useQuery({
    ...trpc.weeklyEvaluation.forStudent.queryOptions({ studentId: foundStudent?.id ?? studentId, academicYearId }),
    enabled: false,
  })
  const { refetch: refetchExams } = useQuery({
    ...trpc.monthlyExam.forStudent.queryOptions({ studentId: foundStudent?.id ?? studentId, academicYearId }),
    enabled: false,
  })

  async function handleCodeSearch() {
    if (!studentCode.trim()) return
    const { data, error } = await lookupByCode()
    if (error || !data) {
      toast.error("لم يتم العثور على طالب بهذا الكود")
      setFoundStudent(null)
      return
    }
    setFoundStudent({
      id: data.id,
      fullName: data.fullName,
      studentCode: data.studentCode,
      classCode: data.enrollments[0]?.classRoom.code ?? "—",
    })
    setStudentId("")
  }

  async function handleGenerate() {
    const activeStudentId = foundStudent?.id ?? studentId
    const activeStudentName = foundStudent?.fullName ?? studentsData?.students.find((s) => s.id === studentId)?.fullName
    const activeStudentCode = foundStudent?.studentCode ?? studentsData?.students.find((s) => s.id === studentId)?.studentCode
    const activeClassCode = foundStudent?.classCode ?? selectedClass?.code

    if (!activeStudentId || !activeStudentName || !activeStudentCode) {
      toast.error("اختر الطالب أو أدخل كوده أولاً")
      return
    }

    setGenerating(true)
    const [{ data: weekly, error: weeklyError }, { data: exams, error: examsError }] = await Promise.all([
      refetchWeekly(),
      refetchExams(),
    ])
    setGenerating(false)
    if (weeklyError || examsError || !weekly || !exams) {
      toast.error("تعذّر جلب الدرجات")
      return
    }
    if (weekly.length === 0 && exams.length === 0) {
      toast.error("لا توجد درجات مسجلة لهذا الطالب بعد")
      return
    }

    // Group weekly rows by subject+month, sum the 4 weeks, then add that
    // month's exam score — never a week-by-week breakdown in the report.
    const bySubject = new Map<string, { subjectName: string; months: Map<number, number> }>()
    for (const row of weekly) {
      const entry = bySubject.get(row.subject.id) ?? { subjectName: row.subject.name, months: new Map() }
      const weekTotal = row.behaviorScore + row.notebookScore + row.testScore
      entry.months.set(row.month, (entry.months.get(row.month) ?? 0) + weekTotal)
      bySubject.set(row.subject.id, entry)
    }
    for (const exam of exams) {
      const entry = bySubject.get(exam.subject.id) ?? { subjectName: exam.subject.name, months: new Map() }
      entry.months.set(exam.month, (entry.months.get(exam.month) ?? 0) + exam.score)
      bySubject.set(exam.subject.id, entry)
    }

    const subjects = Array.from(bySubject.values()).map((s) => ({
      subjectName: s.subjectName,
      maxPerMonth: 0,
      months: Array.from(s.months.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([month, total]) => ({ month, monthLabel: monthName(month), total })),
    }))

    openPrintWindow(
      buildStudentMonthlyReportHtml({
        studentName: activeStudentName,
        studentCode: activeStudentCode,
        classCode: activeClassCode ?? "—",
        academicYearId,
        subjects,
      }),
    )
  }

  return (
    <ReportCardShell icon={User} title="تقرير طالب — كل الشهور مجمّعة">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ClassPicker
            classRooms={classRooms}
            value={classRoomId}
            onChange={(id) => {
              setClassRoomId(id)
              setStudentId("")
              setFoundStudent(null)
            }}
          />
          <SearchPicker
            items={studentsData?.students ?? []}
            value={studentId}
            onChange={(id) => {
              setStudentId(id)
              setFoundStudent(null)
            }}
            getId={(s) => s.id}
            getLabel={(s) => s.fullName}
            getSubLabel={(s) => s.studentCode}
            placeholder="اختر الطالب من الفصل"
            dialogTitle="اختر الطالب"
            disabled={!classRoomId}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">أو</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Hash className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="أدخل كود الطالب مباشرة"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="pr-9"
              dir="ltr"
            />
          </div>
          <Button type="button" variant="outline" onClick={handleCodeSearch} disabled={lookingUp || !studentCode.trim()}>
            بحث
          </Button>
        </div>

        {foundStudent && (
          <div className="bg-primary/5 border-primary/10 rounded-lg border p-3 text-sm">
            <span className="font-medium">{foundStudent.fullName}</span>
            <span className="text-muted-foreground"> — فصل {foundStudent.classCode}</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={generating || (!studentId && !foundStudent)}
        size="lg"
        className="h-14 gap-3 rounded-xl text-base font-semibold"
      >
        <Printer className="size-5" />
        {generating ? "جارِ الإنشاء..." : "إنشاء وطباعة التقرير"}
      </Button>
    </ReportCardShell>
  )
}
