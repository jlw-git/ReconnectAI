import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TemplatesView } from "@/components/messages/templates-view"

export default async function TemplatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <TemplatesView templates={templates || []} />
}
