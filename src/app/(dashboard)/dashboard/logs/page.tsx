import { requireRole } from "@/lib/auth-guard"
import { api } from "@/trpc/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const actionLabel: Record<string, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
}

export default async function LogsPage() {
  await requireRole(["DEVELOPER"])
  const { logs } = await api.audit.list({ limit: 50 })

  return (
    <div dir="ltr" className="flex flex-1 flex-col text-left">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <h1 className="text-foreground text-xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground mt-1 text-sm">Developer-only system activity trail</p>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table dir="ltr">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-left">Time</TableHead>
                <TableHead className="text-left">User</TableHead>
                <TableHead className="text-left">Action</TableHead>
                <TableHead className="text-left">Entity</TableHead>
                <TableHead className="text-left">Student</TableHead>
                <TableHead className="text-left">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                    No activity recorded yet
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(log.timestamp).toLocaleString("en-US")}
                  </TableCell>
                  <TableCell dir="auto">{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{actionLabel[log.action]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{log.entityType.replaceAll("_", " ")}</TableCell>
                  <TableCell dir="auto">{log.studentName ?? "—"}</TableCell>
                  <TableCell dir="auto" className="text-muted-foreground text-xs">
                    {log.note ?? (log.fieldChanged ? `${log.fieldChanged}: ${log.newValue ?? ""}` : "—")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
