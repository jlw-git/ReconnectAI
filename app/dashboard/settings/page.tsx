import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("settings").select("*").eq("user_id", user.id).single(),
  ])

  if (!profile || !settings) {
    return (
      <div className="text-muted-foreground">
        Initializing your account... Please refresh in a moment.
      </div>
    )
  }

  return <SettingsForm profile={profile} settings={settings} email={user.email || ""} />
}
