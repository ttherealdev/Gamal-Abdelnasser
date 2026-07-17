"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { KeyRound } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ParentPortalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  studentName: string
  studentCode: string
}

export function ParentPortalDialog({ open, onOpenChange, studentId, studentName, studentCode }: ParentPortalDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [password, setPassword] = useState("")

  const enable = useMutation(
    trpc.user.enableParentPortal.mutationOptions({
      onSuccess: () => {
        toast.success("تم تفعيل بوابة ولي الأمر — سلّم كود الطالب وكلمة المرور دي لولي الأمر")
        onOpenChange(false)
        setPassword("")
        void queryClient.invalidateQueries()
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const reset = useMutation(
    trpc.user.resetParentPassword.mutationOptions({
      onSuccess: () => {
        toast.success("تم تغيير كلمة المرور")
        onOpenChange(false)
        setPassword("")
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>بوابة ولي الأمر — {studentName}</DialogTitle>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <p className="text-muted-foreground">
            ولي الأمر بيسجّل دخول بكود الطالب (<span className="font-mono">{studentCode}</span>) وكلمة المرور اللي
            تحطها هنا. لو البوابة مفعّلة بالفعل، إدخال كلمة مرور جديدة هيغيّرها.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="parent-password">كلمة المرور (8 أحرف على الأقل)</Label>
          <Input
            id="parent-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            placeholder="اكتب كلمة مرور لولي الأمر"
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            disabled={password.length < 8 || enable.isPending}
            onClick={() => enable.mutate({ studentId, password })}
          >
            <KeyRound className="ms-2 size-4" />
            تفعيل البوابة بهذه الكلمة
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={password.length < 8 || reset.isPending}
            onClick={() => reset.mutate({ studentId, newPassword: password })}
          >
            إعادة تعيين كلمة المرور (لو مفعّلة بالفعل)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
