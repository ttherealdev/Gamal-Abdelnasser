import type { ReactNode } from "react"
import { Sparkles } from "lucide-react"

interface PageHeroProps {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function PageHero({ eyebrow, title, description, action }: PageHeroProps) {
  return (
    <div className="from-primary via-primary to-primary/80 relative overflow-hidden rounded-3xl bg-linear-to-br p-6 text-primary-foreground sm:p-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[2rem_2rem]" />
      <div className="absolute top-0 left-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="size-4" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">{title}</h1>
          <p className="mt-2 max-w-lg text-sm text-white/80 sm:text-base">{description}</p>
        </div>
        {action}
      </div>
    </div>
  )
}
