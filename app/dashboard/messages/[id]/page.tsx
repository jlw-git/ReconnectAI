import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, User, Calendar, Clock, CheckCircle2, Eye, XCircle } from "lucide-react"

interface MessagePageProps {
  params: Promise<{ id: string }>
}

export default async function MessagePage({ params }: MessagePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: message, error } = await supabase
    .from("messages")
    .select(`
      *,
      contacts (
        id,
        first_name,
        last_name,
        email,
        phone,
        company
      ),
      templates (
        id,
        name
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !message) {
    redirect("/dashboard/messages")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "opened":
      case "clicked":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "failed":
      case "bounced":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "opened":
      case "clicked":
        return <Eye className="h-5 w-5 text-blue-500" />
      case "failed":
      case "bounced":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Mail className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{message.subject || "No Subject"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={getStatusColor(message.status)}>
              {message.status}
            </Badge>
            {message.templates && (
              <Badge variant="secondary">
                Template: {message.templates.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Message Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-4 border-b">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-16">To:</span>
                      {message.contacts ? (
                        <Link 
                          href={`/dashboard/contacts/${message.contacts.id}`}
                          className="text-primary hover:underline"
                        >
                          {message.contacts.first_name} {message.contacts.last_name} 
                          {message.contacts.email && ` <${message.contacts.email}>`}
                        </Link>
                      ) : (
                        <span>Unknown contact</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-16">Subject:</span>
                      <span className="font-medium">{message.subject || "No subject"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-16">Channel:</span>
                      <span className="capitalize">{message.channel}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 min-h-[200px] bg-background">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(message.status)}
                <div>
                  <p className="font-medium capitalize">{message.status}</p>
                  {message.error_message && (
                    <p className="text-sm text-destructive">{message.error_message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(message.created_at).toLocaleString()}</span>
                </div>
                {message.sent_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Sent:</span>
                    <span>{new Date(message.sent_at).toLocaleString()}</span>
                  </div>
                )}
                {message.opened_at && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Opened:</span>
                    <span>{new Date(message.opened_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          {message.contacts && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Recipient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/dashboard/contacts/${message.contacts.id}`}
                  className="block hover:bg-muted/50 -mx-2 -my-1 px-2 py-1 rounded transition-colors"
                >
                  <p className="font-medium">
                    {message.contacts.first_name} {message.contacts.last_name}
                  </p>
                  {message.contacts.email && (
                    <p className="text-sm text-muted-foreground">{message.contacts.email}</p>
                  )}
                  {message.contacts.company && (
                    <p className="text-sm text-muted-foreground">{message.contacts.company}</p>
                  )}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
