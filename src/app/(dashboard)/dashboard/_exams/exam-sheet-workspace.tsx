"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassPicker } from "@/components/dashboard/class-picker";
import { ExamGradesGrid } from "@/components/dashboard/exam-grades-grid";

export function ExamSheetWorkspace({ academicYearId }: { academicYearId: string }) {
  const trpc = useTRPC();
  const [classRoomId, setClassRoomId] = useState("");
  const [examType, setExamType] = useState<"MIDTERM" | "FINAL">("MIDTERM");

  const { data: classRooms } = useQuery(trpc.classRoom.list.queryOptions({ academicYearId }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ClassPicker
          classRooms={classRooms ?? []}
          value={classRoomId}
          onChange={setClassRoomId}
        />

        <Select
          value={examType}
          onValueChange={(v) => setExamType(v as "MIDTERM" | "FINAL")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MIDTERM">امتحان نصف العام</SelectItem>
            <SelectItem value="FINAL">امتحان آخر العام</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {classRoomId ? (
        <ExamGradesGrid
          academicYearId={academicYearId}
          classRoomId={classRoomId}
          examType={examType}
        />
      ) : (
        <p className="text-sm text-muted-foreground">اختر الفصل لعرض كشف الدرجات</p>
      )}
    </div>
  );
}
