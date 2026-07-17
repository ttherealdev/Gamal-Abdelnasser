import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  href?: string
}

export function StatCard({ title, value, icon: Icon, gradient, href }: StatCardProps) {
  const card = (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12]`} />
      <CardContent className="relative p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div
            className={`flex size-12 items-center justify-center self-start rounded-2xl bg-linear-to-br sm:size-14 ${gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            <Icon className="size-6 text-white sm:size-7" />
          </div>
          <div>
            <p className="text-foreground text-3xl font-bold sm:text-4xl">{value}</p>
            <p className="text-muted-foreground text-sm">{title}</p>
          </div>
          {href && (
            <div className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span>عرض التفاصيل</span>
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return href ? <Link href={href}>{card}</Link> : card
}
