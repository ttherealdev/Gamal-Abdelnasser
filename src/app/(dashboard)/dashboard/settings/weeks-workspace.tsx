"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CalendarCheck, Info } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { MONTH_NAMES } from "@/lib/months"
import type { RouterOutputs } from "@/trpc/types"

type AcademicYear = RouterOutputs["academicYear"]["list"][number]

export function WeeksWorkspace({ year }: { year: AcademicYear }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [month, setMonth] = useState<number>(year.activeMonth ?? new Date().getMonth() + 1)

  const { data: weeks, isLoading } = useQuery(trpc.weekWindow.list.queryOptions({ academicYearId: year.id, month }))

  const setOpen = useMutation(
    trpc.weekWindow.setOpen.mutationOptions({
      onMutate: async (vars) => {
        const key = trpc.weekWindow.list.queryKey({ academicYearId: year.id, month })
        await queryClient.cancelQueries({ queryKey: key })
        const previous = queryClient.getQueryData(key)
        queryClient.setQueryData(
          key,
          (old: typeof weeks) =>
            old?.map((w) => (w.weekInMonth === vars.weekInMonth ? { ...w, isOpen: vars.isOpen } : w)),
        )
        return { previous, key }
      },
      onError: (error, _vars, context) => {
        toast.error(error.message)
        if (context) queryClient.setQueryData(context.key, context.previous)
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.weekWindow.list.queryKey() })
      },
    }),
  )

  const openCount = weeks?.filter((w) => w.isOpen).length ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-primary/5 border-primary/10 flex gap-3 rounded-xl border p-4 text-sm">
        <Info className="text-primary size-5 shrink-0" />
        <p className="text-muted-foreground">
          كل شهر فيه 4 أسابيع بس — عادةً افتح أسبوع واحد بس في المرة (آخره تسليم المعلم في نهاية الأسبوع، وبعدها
          يتقفل تلقائياً من غير ما يقدر يعدّل تاني). تقدر تفتح أكتر من أسبوع مع بعض لو حصلت مشكلة واحتجت المعلمين
          يكملوا أكتر من أسبوع مرة واحدة.
        </p>
      </div>

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

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="text-primary size-5" />
            أسابيع {MONTH_NAMES[month]}
            {openCount > 1 && (
              <span className="text-muted-foreground text-xs font-normal">({openCount} أسابيع مفتوحة معاً)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {weeks?.map((week) => (
                <div
                  key={week.weekInMonth}
                  className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition-colors ${
                    week.isOpen ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"
                  }`}
                >
                  <span className="text-sm font-medium">أسبوع {week.weekInMonth}</span>
                  <Switch
                    checked={week.isOpen}
                    onCheckedChange={(checked) =>
                      setOpen.mutate({ academicYearId: year.id, month, weekInMonth: week.weekInMonth, isOpen: checked })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
