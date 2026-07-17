"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchPickerProps<T> {
  items: T[]
  value: string
  onChange: (id: string) => void
  getId: (item: T) => string
  getLabel: (item: T) => string
  getSubLabel?: (item: T) => string | undefined
  placeholder?: string
  dialogTitle?: string
  disabled?: boolean
}

export function SearchPicker<T>({
  items,
  value,
  onChange,
  getId,
  getLabel,
  getSubLabel,
  placeholder = "اختر...",
  dialogTitle = "اختر من القائمة",
  disabled,
}: SearchPickerProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selected = items.find((item) => getId(item) === value)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => getLabel(item).toLowerCase().includes(q))
  }, [items, search, getLabel])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="w-full justify-between font-normal sm:w-56"
      >
        <span className={selected ? "" : "text-muted-foreground"}>{selected ? getLabel(selected) : placeholder}</span>
        <ChevronDown className="text-muted-foreground size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="ابحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
              autoFocus
            />
          </div>

          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">لا توجد نتائج</p>
            ) : (
              filtered.map((item) => {
                const id = getId(item)
                const subLabel = getSubLabel?.(item)
                return (
                  <button
                    key={id}
                    onClick={() => {
                      onChange(id)
                      setOpen(false)
                      setSearch("")
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                      id === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium">{getLabel(item)}</span>
                    {subLabel && <span className="text-xs opacity-70">{subLabel}</span>}
                  </button>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
