import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Send, Users, FileText } from "lucide-react"

const actions = [
  {
    title: "Import Contacts",
    description: "Upload a CSV file",
    href: "/dashboard/contacts/import",
    icon: Upload,
  },
  {
    title: "New Message",
    description: "Send to contacts",
    href: "/dashboard/messages/compose",
    icon: Send,
  },
  {
    title: "Add Contact",
    description: "Manual entry",
    href: "/dashboard/contacts/new",
    icon: Users,
  },
  {
    title: "Create Template",
    description: "Reusable message",
    href: "/dashboard/templates/new",
    icon: FileText,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to manage your outreach
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Button
            key={action.href}
            variant="outline"
            className="justify-start h-auto py-3"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="mr-3 h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
