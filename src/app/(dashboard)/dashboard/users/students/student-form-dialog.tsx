"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { RouterOutputs } from "@/trpc/types"

type StudentListItem = RouterOutputs["student"]["list"]["students"][number]

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  academicYearId: string
  classRoomId: string
  editingStudent?: StudentListItem | null
  onSaved: () => void
}

type FormState = {
  studentCode: string
  firstName: string
  fatherName: string
  grandfatherName: string
  familyName: string
  nationalId: string
  phone: string
  gender: "MALE" | "FEMALE"
  religion: "ISLAM" | "CHRISTIANITY" | ""
  secondLanguage: "FRENCH" | "GERMAN" | "SPANISH" | ""
}

const emptyForm: FormState = {
  studentCode: "",
  firstName: "",
  fatherName: "",
  grandfatherName: "",
  familyName: "",
  nationalId: "",
  phone: "",
  gender: "MALE",
  religion: "",
  secondLanguage: "",
}

function studentToForm(student: StudentListItem): FormState {
  return {
    studentCode: student.studentCode,
    firstName: student.firstName,
    fatherName: student.fatherName,
    grandfatherName: student.grandfatherName,
    familyName: student.familyName,
    nationalId: student.nationalId ?? "",
    phone: student.phone ?? "",
    gender: student.gender,
    religion: student.religion ?? "",
    secondLanguage: student.secondLanguage ?? "",
  }
}

export function StudentFormDialog({
  open,
  onOpenChange,
  academicYearId,
  classRoomId,
  editingStudent,
  onSaved,
}: StudentFormDialogProps) {
  const trpc = useTRPC()
  const isEditing = !!editingStudent
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (open) setForm(editingStudent ? studentToForm(editingStudent) : emptyForm)
  }, [open, editingStudent])

  const createStudent = useMutation(
    trpc.student.create.mutationOptions({
      onSuccess: () => {
        toast.success("تم إضافة الطالب بنجاح")
        onOpenChange(false)
        onSaved()
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const updateStudent = useMutation(
    trpc.student.update.mutationOptions({
      onSuccess: () => {
        toast.success("تم تحديث بيانات الطالب")
        onOpenChange(false)
        onSaved()
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      firstName: form.firstName,
      fatherName: form.fatherName,
      grandfatherName: form.grandfatherName,
      familyName: form.familyName,
      nationalId: form.nationalId || undefined,
      phone: form.phone || undefined,
      gender: form.gender,
      religion: form.religion || undefined,
      secondLanguage: form.secondLanguage || undefined,
    }

    if (isEditing && editingStudent) {
      updateStudent.mutate({ id: editingStudent.id, ...payload })
      return
    }

    createStudent.mutate({ ...payload, studentCode: form.studentCode, classRoomId, academicYearId })
  }

  const isPending = createStudent.isPending || updateStudent.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid max-h-[70vh] gap-4 overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="studentCode">كود الطالب</Label>
              <Input
                id="studentCode"
                value={form.studentCode}
                onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                disabled={isEditing}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nationalId">الرقم القومي</Label>
              <Input
                id="nationalId"
                value={form.nationalId}
                onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                maxLength={14}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName">الاسم الأول</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fatherName">اسم الأب</Label>
              <Input
                id="fatherName"
                value={form.fatherName}
                onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="grandfatherName">اسم الجد</Label>
              <Input
                id="grandfatherName"
                value={form.grandfatherName}
                onChange={(e) => setForm({ ...form, grandfatherName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="familyName">اسم العائلة</Label>
              <Input
                id="familyName"
                value={form.familyName}
                onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>النوع</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm({ ...form, gender: v as "MALE" | "FEMALE" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">ذكر</SelectItem>
                  <SelectItem value="FEMALE">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>الديانة</Label>
              <Select
                value={form.religion}
                onValueChange={(v) => setForm({ ...form, religion: v as FormState["religion"] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الديانة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISLAM">مسلم</SelectItem>
                  <SelectItem value="CHRISTIANITY">مسيحي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>اللغة الثانية</Label>
              <Select
                value={form.secondLanguage}
                onValueChange={(v) => setForm({ ...form, secondLanguage: v as FormState["secondLanguage"] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRENCH">فرنساوي</SelectItem>
                  <SelectItem value="GERMAN">ألماني</SelectItem>
                  <SelectItem value="SPANISH">إسباني</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جارِ الحفظ..." : isEditing ? "حفظ التعديلات" : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
