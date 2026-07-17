"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, ChevronLeft, Sparkles, X } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleGate } from "@/components/auth/role-gate";
import { ClassCard } from "@/components/dashboard/class-card";
import { sortByClassCode } from "@/lib/sort";
import type { RouterOutputs } from "@/trpc/types";

type ClassRoom = RouterOutputs["classRoom"]["list"][number];
type Teacher = RouterOutputs["user"]["listStaff"];

const stageLabel: Record<string, string> = {
  FIRST_SECONDARY: "الأول الثانوي",
  SECOND_SECONDARY: "الثاني الثانوي",
};

const subjectDotColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export function ClassesTable({
  academicYearId,
  initialClassRooms,
  teachers,
}: {
  academicYearId: string;
  initialClassRooms: ClassRoom[];
  teachers: Teacher;
}) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [stage, setStage] = useState<"FIRST_SECONDARY" | "SECOND_SECONDARY">("FIRST_SECONDARY");
  const [modalClass, setModalClass] = useState<ClassRoom | null>(null);

  const { data: classRooms } = useQuery({
    ...trpc.classRoom.list.queryOptions({ academicYearId }),
    initialData: initialClassRooms,
  });

  const { data: subjectsForModal } = useQuery({
    ...trpc.subject.list.queryOptions({
      stageLevel: modalClass?.stageLevel,
      track: modalClass?.track ?? "GENERAL",
      onlyActive: true,
    }),
    enabled: !!modalClass,
  });

  useEffect(() => {
    document.body.style.overflow = modalClass ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalClass]);

  const visibleClasses = sortByClassCode(classRooms.filter((c) => c.stageLevel === stage));

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary to-primary/90 p-6 sm:p-8">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white/90">
              <Sparkles className="size-3.5" />
              <span>إدارة الفصول</span>
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">الفصول والمواد</h1>
            <p className="mt-1 text-sm text-white/80 sm:mt-2 sm:text-base">
              اختر المرحلة ثم الفصل لإدارة الدرجات
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={stage}
              onValueChange={(v) => setStage(v as typeof stage)}
            >
              <SelectTrigger className="w-56 border-white/20 bg-white/10 text-white hover:bg-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="FIRST_SECONDARY">الأول الثانوي</SelectItem>
                <SelectItem value="SECOND_SECONDARY">الثاني الثانوي</SelectItem>
              </SelectContent>
            </Select>
            <RoleGate allow={["ADMIN", "DEVELOPER"]}>
              <Button
                variant="secondary"
                onClick={() => setCreateOpen(true)}
                className="shrink-0 bg-white/90 text-primary hover:bg-white"
              >
                إضافة فصل
              </Button>
            </RoleGate>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {visibleClasses.map((c) => (
          <ClassCard
            key={c.id}
            code={c.code}
            studentCount={c._count.enrollments}
            onClick={() => setModalClass(c)}
          />
        ))}
        {visibleClasses.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            لا توجد فصول في هذه المرحلة بعد
          </p>
        )}
      </div>

      {modalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalClass(null)}
          />

          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="relative bg-primary px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-white/20">
                    <BookOpen className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">فصل {modalClass.code}</h3>
                    <p className="text-sm text-white/80">اختر المادة الدراسية</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalClass(null)}
                  className="flex size-10 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {subjectsForModal?.map((subject, index) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setModalClass(null);
                      router.push(`/dashboard/classes/${modalClass.id}?subject=${subject.id}`);
                    }}
                    className="group flex items-center gap-3 rounded-xl bg-muted/50 p-3.5 text-right transition-colors hover:bg-muted active:scale-[0.98]"
                  >
                    <div
                      className={`h-8 w-1.5 rounded-full ${subjectDotColors[index % subjectDotColors.length]}`}
                    />
                    <span className="flex-1 font-medium text-foreground">{subject.name}</span>
                    <ChevronLeft className="size-4 rotate-180 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border bg-muted/50 px-6 py-3">
              <p className="text-center text-sm text-muted-foreground">
                {subjectsForModal?.length ?? 0} مادة دراسية
              </p>
            </div>
          </div>
        </div>
      )}

      <CreateClassDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        academicYearId={academicYearId}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: trpc.classRoom.list.queryKey() });
        }}
      />
    </div>
  );
}

function CreateClassDialog({
  open,
  onOpenChange,
  academicYearId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYearId: string;
  onCreated: () => void;
}) {
  const trpc = useTRPC();
  const [code, setCode] = useState("");
  const [stageLevel, setStageLevel] = useState<"FIRST_SECONDARY" | "SECOND_SECONDARY">(
    "FIRST_SECONDARY",
  );
  const [track, setTrack] = useState<"GENERAL" | "SCIENCE" | "ARTS">("GENERAL");
  const [capacity, setCapacity] = useState(40);

  const createClass = useMutation(
    trpc.classRoom.create.mutationOptions({
      onSuccess: () => {
        toast.success("تم إنشاء الفصل");
        setCode("");
        onOpenChange(false);
        onCreated();
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة فصل جديد</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createClass.mutate({ code, stageLevel, track, capacity, academicYearId });
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="code">كود الفصل (مثال: 1/1)</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label>المرحلة</Label>
            <Select
              value={stageLevel}
              onValueChange={(v) => {
                setStageLevel(v as typeof stageLevel);
                if (v === "FIRST_SECONDARY") setTrack("GENERAL");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIRST_SECONDARY">الأول الثانوي</SelectItem>
                <SelectItem value="SECOND_SECONDARY">الثاني الثانوي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {stageLevel === "SECOND_SECONDARY" && (
            <div className="grid gap-1.5">
              <Label>الشعبة</Label>
              <Select
                value={track}
                onValueChange={(v) => setTrack(v as typeof track)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCIENCE">علمي</SelectItem>
                  <SelectItem value="ARTS">أدبي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="capacity">السعة</Label>
            <Input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={1}
              max={80}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={createClass.isPending}
            >
              {createClass.isPending ? "جارِ الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
