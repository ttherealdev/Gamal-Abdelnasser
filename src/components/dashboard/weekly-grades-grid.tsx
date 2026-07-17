"use client";

import { Fragment } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardList, Lock } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyGradesGridProps {
  academicYearId: string;
  classRoomId: string;
  subjectId: string;
  month: number;
}

type Component = "behaviorScore" | "notebookScore" | "testScore";

const componentLabel: Record<Component, string> = {
  behaviorScore: "سلوك",
  notebookScore: "كشكول",
  testScore: "تقييم",
};

export function WeeklyGradesGrid({
  academicYearId,
  classRoomId,
  subjectId,
  month,
}: WeeklyGradesGridProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.weeklyEvaluation.grid.queryOptions({ academicYearId, classRoomId, subjectId, month }),
  );

  const upsertScore = useMutation(
    trpc.weeklyEvaluation.upsertScore.mutationOptions({
      onError: (error) => toast.error(error.message),
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.weeklyEvaluation.grid.queryKey() });
      },
    }),
  );

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data || data.weeks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        لا توجد أسابيع مفتوحة للتعديل حالياً — راجع صفحة الإعدادات
      </p>
    );
  }
  if (data.rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        لا يوجد طلاب مسجلين في هذا الفصل
      </p>
    );
  }

  const openWeeks = new Set(data.openWeeks);

  function handleBlur(
    studentId: string,
    weekInMonth: number,
    current: { behaviorScore: number; notebookScore: number; testScore: number } | null,
    field: Component,
    rawValue: string,
  ) {
    if (rawValue === "") return;
    const value = Number(rawValue);
    const next = {
      behaviorScore: current?.behaviorScore ?? 0,
      notebookScore: current?.notebookScore ?? 0,
      testScore: current?.testScore ?? 0,
      [field]: value,
    };
    if (current && current[field] === value) return;
    upsertScore.mutate({
      studentId,
      classRoomId,
      subjectId,
      academicYearId,
      month,
      weekInMonth,
      ...next,
    });
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="size-5 text-primary" />
          الدرجات الأسبوعية — سلوك /{data.maxima.behavior} · كشكول /{data.maxima.notebook} · تقييم /
          {data.maxima.test}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/90 hover:bg-muted">
              <TableHead
                rowSpan={2}
                className="sticky right-0 bg-muted/90 align-bottom text-xl font-semibold"
              >
                الطالب
              </TableHead>
              {data.weeks.map((w) => {
                const closed = !openWeeks.has(w);
                return (
                  <TableHead
                    key={w}
                    colSpan={3}
                    className="border-s text-center text-xs font-semibold"
                  >
                    <span className="inline-flex items-center gap-1">
                      أسبوع {w}
                      {closed && <Lock className="size-3 text-muted-foreground" />}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {data.weeks.map((w) => (
                <Fragment key={w}>
                  <TableHead className="border-s text-center text-xs font-normal text-muted-foreground">
                    سلوك
                  </TableHead>
                  <TableHead className="text-center text-xs font-normal text-muted-foreground">
                    كشكول
                  </TableHead>
                  <TableHead className="text-center text-xs font-normal text-muted-foreground">
                    تقييم
                  </TableHead>
                </Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow
                key={row.studentId}
                className="transition-colors hover:bg-muted/30"
              >
                <TableCell className="sticky right-0 bg-background font-medium">
                  {row.studentName}
                </TableCell>
                {row.scores.map((cell, i) => {
                  const week = data.weeks[i]!;
                  return (
                    <Fragment key={week}>
                      {(["behaviorScore", "notebookScore", "testScore"] as Component[]).map(
                        (field, fi) => (
                          <TableCell
                            key={`${week}-${field}`}
                            className={`p-1 text-center ${fi === 0 ? "border-s" : ""}`}
                          >
                            <Input
                              type="number"
                              min={0}
                              max={
                                data.maxima[
                                  field === "behaviorScore"
                                    ? "behavior"
                                    : field === "notebookScore"
                                      ? "notebook"
                                      : "test"
                                ]
                              }
                              defaultValue={cell?.[field] ?? ""}
                              className="mx-auto h-8 w-14 text-center"
                              title={componentLabel[field]}
                              onBlur={(e) =>
                                handleBlur(row.studentId, week, cell, field, e.target.value)
                              }
                            />
                          </TableCell>
                        ),
                      )}
                    </Fragment>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
