"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { sortByClassCode } from "@/lib/sort"
import type { RouterOutputs } from "@/trpc/types"

type ClassRoom = RouterOutputs["classRoom"]["list"][number]

interface TransferStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  academicYearId: string
  studentId: string
  studentName: string
  currentClassRoomId: string
  classRooms: ClassRoom[]
  onTransferred: () => void
}

export function TransferStudentDialog({
  open,
  onOpenChange,
  academicYearId,
  studentId,
  studentName,
  currentClassRoomId,
  classRooms,
  onTransferred,
}: TransferStudentDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const transfer = useMutation(
    trpc.student.transfer.mutationOptions({
      onSuccess: () => {
        toast.success("تم نقل الطالب بنجاح")
        onOpenChange(false)
        onTransferred()
        void queryClient.invalidateQueries({ queryKey: trpc.student.list.queryKey() })
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const otherClasses = sortByClassCode(classRooms.filter((c) => c.id !== currentClassRoomId))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>نقل {studentName} إلى فصل آخر</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {otherClasses.length === 0 ? (
            <p className="text-muted-foreground col-span-full py-6 text-center text-sm">لا توجد فصول أخرى</p>
          ) : (
            otherClasses.map((c) => (
              <button
                key={c.id}
                disabled={transfer.isPending}
                onClick={() =>
                  transfer.mutate({ studentId, academicYearId, toClassRoomId: c.id })
                }
                className="hover:bg-muted border-border rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {c.code}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
