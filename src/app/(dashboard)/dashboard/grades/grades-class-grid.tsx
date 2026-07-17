"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { useSession } from "@/server/better-auth/client"
import { PageHero } from "@/components/dashboard/page-hero"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ClassCard } from "@/components/dashboard/class-card"
import { sortByClassCode } from "@/lib/sort"
import type { Role, StageLevel } from "@/generated/enums"
import type { RouterOutputs } from "@/trpc/types"

type ClassRoom = RouterOutputs["classRoom"]["list"][number]

const subjectDotColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
]

export function GradesClassGrid({ academicYearId }: { academicYearId: string }) {
  const { data: session } = useSession()
  const role = session?.user.role as Role | undefined

  if (!role) return <Skeleton className="h-48 w-full" />
  if (role === "TEACHER") return <TeacherClassGrid academicYearId={academicYearId} />
  return <AdminClassGrid academicYearId={academicYearId} />
}

// TEACHER — only their own classes, no stage tabs needed (their list is
// naturally short), clicking goes straight into the class detail page where
// the subject dropdown is already scoped to their own assignments.
function TeacherClassGrid({ academicYearId }: { academicYearId: string }) {
  const trpc = useTRPC()
  const router = useRouter()

  const { data: myClasses, isLoading } = useQuery(trpc.classRoom.listMine.queryOptions({ academicYearId }))

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        eyebrow="التقييمات الأسبوعية"
        title="الدرجات الأسبوعية"
        description="اختر أحد فصولك لإدخال ومتابعة الدرجات الأسبوعية"
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !myClasses || myClasses.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">لا توجد فصول مسندة إليك بعد</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {sortByClassCode(myClasses.map((m) => m.classRoom)).map((c) => (
            <ClassCard
              key={c.id}
              code={c.code}
              studentCount={0}
              onClick={() => router.push(`/dashboard/classes/${c.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ADMIN/DEVELOPER — every class, stage select lives in the header card,
// clicking opens the subject picker before navigating in — matches the same
// interaction as the classes page for consistency.
function AdminClassGrid({ academicYearId }: { academicYearId: string }) {
  const trpc = useTRPC()
  const router = useRouter()
  const [stage, setStage] = useState<StageLevel>("FIRST_SECONDARY")
  const [modalClass, setModalClass] = useState<ClassRoom | null>(null)

  const { data: classRooms, isLoading } = useQuery(trpc.classRoom.list.queryOptions({ academicYearId }))

  const { data: subjectsForModal } = useQuery({
    ...trpc.subject.list.queryOptions({
      stageLevel: modalClass?.stageLevel,
      track: modalClass?.track ?? "GENERAL",
      onlyActive: true,
    }),
    enabled: !!modalClass,
  })

  const visible = sortByClassCode((classRooms ?? []).filter((c) => c.stageLevel === stage))

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        eyebrow="التقييمات الأسبوعية"
        title="الدرجات الأسبوعية"
        description="اختر الفصل لإدخال ومتابعة الدرجات الأسبوعية"
        action={
          <Select value={stage} onValueChange={(v) => setStage(v as StageLevel)}>
            <SelectTrigger className="w-56 border-white/20 bg-white/10 text-white hover:bg-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="FIRST_SECONDARY">الأول الثانوي</SelectItem>
              <SelectItem value="SECOND_SECONDARY">الثاني الثانوي</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {visible.map((c) => (
            <ClassCard key={c.id} code={c.code} studentCount={c._count.enrollments} onClick={() => setModalClass(c)} />
          ))}
          {visible.length === 0 && (
            <p className="text-muted-foreground col-span-full py-8 text-center text-sm">لا توجد فصول في هذه المرحلة</p>
          )}
        </div>
      )}

      <Dialog open={!!modalClass} onOpenChange={(v) => !v && setModalClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اختر المادة — فصل {modalClass?.code}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {subjectsForModal?.map((subject, index) => (
              <button
                key={subject.id}
                onClick={() => {
                  const id = modalClass?.id
                  setModalClass(null)
                  if (id) router.push(`/dashboard/classes/${id}?subject=${subject.id}`)
                }}
                className="group bg-muted/50 hover:bg-muted flex items-center gap-3 rounded-xl p-3 text-right transition-colors"
              >
                <div className={`h-6 w-1.5 rounded-full ${subjectDotColors[index % subjectDotColors.length]}`} />
                <span className="text-foreground flex-1 text-sm font-medium">{subject.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
