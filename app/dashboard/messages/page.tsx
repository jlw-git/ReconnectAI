import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MessagesView } from "@/components/messages/messages-view"

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get messages with contact info
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      contacts (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  // Get message stats
  const { data: stats } = await supabase
    .from("messages")
    .select("status")
    .eq("user_id", user.id)

  const messageStats = {
    total: stats?.length || 0,
    sent: stats?.filter(m => m.status === "sent" || m.status === "delivered").length || 0,
    opened: stats?.filter(m => m.status === "opened" || m.status === "clicked").length || 0,
    failed: stats?.filter(m => m.status === "failed" || m.status === "bounced").length || 0,
    draft: stats?.filter(m => m.status === "draft").length || 0,
  }

  return <MessagesView messages={messages || []} stats={messageStats} />
}
