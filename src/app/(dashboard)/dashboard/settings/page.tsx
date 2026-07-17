import { requireRole } from "@/lib/auth-guard"
import { api } from "@/trpc/server"
import { PageHero } from "@/components/dashboard/page-hero"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeeksWorkspace } from "./weeks-workspace"
import { MonthWorkspace } from "./month-workspace"

export default async function SettingsPage() {
  await requireRole(["ADMIN", "DEVELOPER"])

  const years = await api.academicYear.list()
  const currentYear = years.find((y) => y.isCurrent) ?? years[0]

  if (!currentYear) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-muted-foreground p-4 text-sm">
          لا توجد سنة دراسية مفعّلة، فعّل سنة من الإعدادات أولاً.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4">
        <PageHero
          eyebrow="الإدارة"
          title="إعدادات النظام"
          description="إدارة الشهر الحالي والأسابيع المفتوحة للتعديل"
        />

        <Tabs defaultValue="weeks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weeks">إدارة الأسابيع</TabsTrigger>
            <TabsTrigger value="month">الشهر الحالي</TabsTrigger>
          </TabsList>
          <TabsContent value="weeks" className="mt-6">
            <WeeksWorkspace year={currentYear} />
          </TabsContent>
          <TabsContent value="month" className="mt-6">
            <MonthWorkspace year={currentYear} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
