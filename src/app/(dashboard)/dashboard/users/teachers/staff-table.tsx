"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Pencil, Plus, Search, Users } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ROLE_LABELS } from "@/lib/rbac";
import type { RouterOutputs } from "@/trpc/types";

type Staff = RouterOutputs["user"]["listStaff"];
type StaffMember = Staff[number];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "TEACHER" as "TEACHER" | "ADMIN",
  phone: "",
  subjectId: "",
};

export function StaffTable({ initialStaff }: { initialStaff: Staff }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", subjectId: "" });
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "ADMIN" | "TEACHER" | "DEVELOPER">("all");

  const { data: staff } = useQuery({
    ...trpc.user.listStaff.queryOptions({}),
    initialData: initialStaff,
  });

  const { data: subjects } = useQuery(trpc.subject.list.queryOptions({ onlyActive: true }));

  // The same real-world subject exists as a separate row per stage/track
  // (e.g. "الرياضيات" for stage 1 and again for stage 2 science) — the
  // teacher's specialty is conceptually one subject, so dedupe by name for
  // this picker instead of showing "الرياضيات" two or three times.
  const uniqueSubjects = useMemo(() => {
    const seen = new Map<string, NonNullable<typeof subjects>[number]>();
    for (const s of subjects ?? []) {
      if (!seen.has(s.name)) seen.set(s.name, s);
    }
    return Array.from(seen.values());
  }, [subjects]);

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesRole = filterRole === "all" || member.role === filterRole;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [staff, search, filterRole]);

  const createStaff = useMutation(
    trpc.user.createStaff.mutationOptions({
      onSuccess: () => {
        toast.success("تم إنشاء الحساب بنجاح");
        setForm(emptyForm);
        setDialogOpen(false);
        void queryClient.invalidateQueries({ queryKey: trpc.user.listStaff.queryKey() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const updateStaff = useMutation(
    trpc.user.updateStaff.mutationOptions({
      onSuccess: () => {
        toast.success("تم تحديث البيانات");
        setEditingStaff(null);
        void queryClient.invalidateQueries({ queryKey: trpc.user.listStaff.queryKey() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const setBanned = useMutation(
    trpc.user.setBanned.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.user.listStaff.queryKey() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">إدارة المعلمين</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
            إضافة وإدارة حسابات الأدمن والمعلمين
          </p>
        </div>
        <RoleGate allow={["ADMIN", "DEVELOPER"]}>
          <Button
            onClick={() => setDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="ms-2 size-4" />
            إضافة معلم جديد
          </Button>
        </RoleGate>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث بالاسم أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select
          value={filterRole}
          onValueChange={(v) => setFilterRole(v as typeof filterRole)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="تصفية حسب الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأدوار</SelectItem>
            <SelectItem value="DEVELOPER">{ROLE_LABELS.DEVELOPER}</SelectItem>
            <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
            <SelectItem value="TEACHER">{ROLE_LABELS.TEACHER}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-5 text-primary" />
            الطاقم ({filteredStaff.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-xs font-semibold">الاسم</TableHead>
                <TableHead className="text-xs font-semibold">المادة</TableHead>
                <TableHead className="text-xs font-semibold">البريد</TableHead>
                <TableHead className="text-xs font-semibold">الدور</TableHead>
                <TableHead className="text-xs font-semibold">الحالة</TableHead>
                <TableHead className="text-xs font-semibold">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    لا يوجد مستخدمين مطابقين للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow
                    key={member.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {member.name.trim().slice(0, 1)}
                        </div>
                        {member.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {subjects?.find((s) => s.id === member.subjectId)?.name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        dir="ltr"
                        className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground"
                      >
                        <Mail className="size-3.5 shrink-0" />
                        {member.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.banned ? "destructive" : "success"}>
                        {member.banned ? "موقوف" : "نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RoleGate allow={["ADMIN", "DEVELOPER"]}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditingStaff(member);
                              setEditForm({
                                name: member.name,
                                phone: member.phone ?? "",
                                subjectId: member.subjectId ?? "",
                              });
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {member.role !== "DEVELOPER" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setBanned.mutate({ userId: member.id, banned: !member.banned })
                              }
                              className={
                                member.banned
                                  ? ""
                                  : "text-destructive hover:bg-destructive/10 hover:text-destructive"
                              }
                            >
                              {member.banned ? "تفعيل" : "إيقاف"}
                            </Button>
                          )}
                        </div>
                      </RoleGate>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة معلم جديد</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              createStaff.mutate({ ...form, subjectId: form.subjectId || undefined });
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">كلمة المرور المبدئية</Label>
              <Input
                id="password"
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label>الدور</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as "TEACHER" | "ADMIN" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">معلم</SelectItem>
                  <RoleGate allow={["DEVELOPER"]}>
                    <SelectItem value="ADMIN">أدمن</SelectItem>
                  </RoleGate>
                </SelectContent>
              </Select>
            </div>
            {form.role === "TEACHER" && (
              <div className="grid gap-1.5">
                <Label>المادة التي يدرّسها</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => setForm({ ...form, subjectId: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المادة (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSubjects.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button
                type="submit"
                disabled={createStaff.isPending}
              >
                {createStaff.isPending ? "جارِ الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingStaff}
        onOpenChange={(v) => !v && setEditingStaff(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات {editingStaff?.name}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingStaff) return;
              updateStaff.mutate({
                userId: editingStaff.id,
                name: editForm.name,
                phone: editForm.phone || undefined,
                subjectId: editForm.subjectId || null,
              });
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name">الاسم</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            {editingStaff?.role === "TEACHER" && (
              <div className="grid gap-1.5">
                <Label>المادة التي يدرّسها</Label>
                <Select
                  value={editForm.subjectId}
                  onValueChange={(v) => setEditForm({ ...editForm, subjectId: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المادة (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSubjects.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button
                type="submit"
                disabled={updateStaff.isPending}
              >
                {updateStaff.isPending ? "جارِ الحفظ..." : "حفظ التعديلات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
