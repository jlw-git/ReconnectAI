import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ComposeMessage } from "@/components/messages/compose-message"

interface ComposePageProps {
  searchParams: Promise<{ contact?: string; template?: string }>
}

export default async function ComposePage({ searchParams }: ComposePageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get contacts for selection
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email")
    .eq("user_id", user.id)
    .order("first_name")

  // Get templates
  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name")

  // Get pre-selected contact if provided
  let selectedContact = null
  if (params.contact) {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", params.contact)
      .eq("user_id", user.id)
      .single()
    selectedContact = data
  }

  // Get pre-selected template if provided
  let selectedTemplate = null
  if (params.template) {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("id", params.template)
      .eq("user_id", user.id)
      .single()
    selectedTemplate = data
  }

  return (
    <ComposeMessage
      contacts={contacts || []}
      templates={templates || []}
      selectedContact={selectedContact}
      selectedTemplate={selectedTemplate}
    />
  )
}
