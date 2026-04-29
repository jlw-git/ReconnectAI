import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ContactDetail } from "@/components/contacts/contact-detail"

interface ContactPageProps {
  params: Promise<{ id: string }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: contact, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !contact) {
    redirect("/dashboard/contacts")
  }

  // Get message history for this contact
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get market events for this contact
  const { data: marketEvents } = await supabase
    .from("market_events")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <ContactDetail 
      contact={contact} 
      messages={messages || []} 
      marketEvents={marketEvents || []}
    />
  )
}
