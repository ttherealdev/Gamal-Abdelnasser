import Link from "next/link";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";
import { requireRole } from "@/lib/auth-guard";
import { PageHero } from "@/components/dashboard/page-hero";

export default async function UsersChooserPage() {
  await requireRole(["ADMIN", "DEVELOPER"]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-8">
      <PageHero
        eyebrow="الإدارة"
        title="إدارة المستخدمين"
        description="سجل المعلمين وسجل الطلاب — افتح اللي محتاجه"
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        <UserTypeCard
          href="/dashboard/users/teachers"
          icon={Users}
          title="معلم"
          description="إضافة وإدارة حسابات المعلمين"
        />
        <UserTypeCard
          href="/dashboard/users/students"
          icon={GraduationCap}
          title="طالب"
          description="إضافة وإدارة بيانات الطلاب"
        />
      </div>
    </div>
  );
}

function UserTypeCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block h-full"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
        <div className="h-1 w-full bg-primary/60" />

        <div className="flex flex-1 flex-col items-center gap-5 p-6 text-center sm:gap-6 sm:p-10">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15 sm:size-20">
            <Icon className="size-8 sm:size-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
            <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
          </div>

          <div className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-primary">
            <span>فتح</span>
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
