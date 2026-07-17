"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CalendarRange, Info } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MONTH_NAMES } from "@/lib/months"
import type { RouterOutputs } from "@/trpc/types"

type AcademicYear = RouterOutputs["academicYear"]["list"][number]

export function MonthWorkspace({ year }: { year: AcademicYear }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [month, setMonth] = useState<number>(year.activeMonth ?? new Date().getMonth() + 1)

  const save = useMutation(
    trpc.academicYear.updateActiveMonth.mutationOptions({
      onSuccess: () => {
        toast.success("تم تحديث الشهر الحالي")
        void queryClient.invalidateQueries({ queryKey: trpc.academicYear.list.queryKey() })
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-primary/5 border-primary/10 flex gap-3 rounded-xl border p-4 text-sm">
        <Info className="text-primary size-5 shrink-0" />
        <p className="text-muted-foreground">
          الشهر الحالي هو اللي المعلمين هيشتغلوا عليه في الدرجات الأسبوعية والشهرية بدون ما يختاروا حاجة. الأدمن
          يقدر دايماً يستعرض أي شهر تاني من صفحة الفصل لتصحيح درجة قديمة.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="text-primary size-5" />
            الشهر الحالي
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Object.entries(MONTH_NAMES).map(([value, label]) => {
              const m = Number(value)
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonth(m)}
                  className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                    month === m ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-border"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <Button
            onClick={() => save.mutate({ academicYearId: year.id, month })}
            disabled={save.isPending || month === year.activeMonth}
            className="w-full sm:w-fit"
          >
            {save.isPending ? "جارِ الحفظ..." : "حفظ"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
