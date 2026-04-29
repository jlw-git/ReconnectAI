import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Message, Contact } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface RecentActivityProps {
  messages: Array<Message & { contact: Pick<Contact, "first_name" | "last_name" | "email"> | null }>
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-warning/10 text-warning",
  sending: "bg-primary/10 text-primary",
  sent: "bg-chart-1/10 text-chart-1",
  delivered: "bg-chart-2/10 text-chart-2",
  opened: "bg-success/10 text-success",
  clicked: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  bounced: "bg-destructive/10 text-destructive",
}

export function RecentActivity({ messages }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest message activity and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {message.contact
                      ? `${message.contact.first_name} ${message.contact.last_name || ""}`
                      : "Unknown Contact"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {message.subject || message.content.substring(0, 50)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", statusColors[message.status])}
                  >
                    {message.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <p>No recent activity. Send your first message to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
