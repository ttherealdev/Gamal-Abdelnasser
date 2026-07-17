"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { sortByClassCode } from "@/lib/sort";
import type { StageLevel } from "@/generated/enums";

interface ClassOption {
  id: string;
  code: string;
  stageLevel: StageLevel;
}

interface ClassPickerProps {
  classRooms: ClassOption[];
  value: string;
  onChange: (classRoomId: string) => void;
  placeholder?: string;
}

export function ClassPicker({
  classRooms,
  value,
  onChange,
  placeholder = "اختر الفصل",
}: ClassPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<StageLevel>("FIRST_SECONDARY");

  const selected = classRooms.find((c) => c.id === value);

  const grouped = useMemo(() => {
    const filtered = classRooms.filter(
      (c) => c.stageLevel === stage && c.code.includes(search.trim()),
    );
    return sortByClassCode(filtered);
  }, [classRooms, stage, search]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-48 justify-between font-normal"
      >
        <span className={selected ? "" : "text-muted-foreground"}>
          {selected ? `فصل ${selected.code}` : placeholder}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>اختر الفصل</DialogTitle>
          </DialogHeader>

          <Tabs
            value={stage}
            onValueChange={(v) => setStage(v as StageLevel)}
          >
            <TabsList className="w-full">
              <TabsTrigger
                value="FIRST_SECONDARY"
                className="flex-1"
              >
                الأول الثانوي
              </TabsTrigger>
              <TabsTrigger
                value="SECOND_SECONDARY"
                className="flex-1"
              >
                الثاني الثانوي
              </TabsTrigger>
            </TabsList>

            <div className="relative mt-3">
              <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث عن فصل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
                autoFocus
              />
            </div>

            {(["FIRST_SECONDARY", "SECOND_SECONDARY"] as const).map((s) => (
              <TabsContent
                key={s}
                value={s}
                className="mt-3"
              >
                <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                  {grouped.length === 0 ? (
                    <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                      لا توجد فصول مطابقة
                    </p>
                  ) : (
                    grouped.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onChange(c.id);
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          c.id === value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {c.code}
                      </button>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
