import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileSearch } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
      <div className="max-w-2xl w-full bg-card border border-border rounded-lg shadow p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <FileSearch className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">الصفحة غير موجودة</h1>
        <p className="text-sm text-muted-foreground mb-4">يبدو أن الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.</p>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button className="bg-primary text-primary-foreground">العودة إلى الصفحة الرئيسية</Button>
          </Link>
          {/* <Link href="/contact">
            <Button variant="ghost">تواصل معنا</Button>
          </Link> */}
        </div>
      </div>
    </div>
  )
}
