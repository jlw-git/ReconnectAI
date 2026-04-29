import { createClient } from "@/lib/supabase/server"
import { InsightsList } from "@/components/insights/insights-list"

export default async function InsightsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: events } = await supabase
    .from("market_events")
    .select("*, contact:contacts(id, first_name, last_name)")
    .eq("user_id", user.id)
    .order("event_date", { ascending: false })
    .limit(100)

  return <InsightsList events={events || []} />
}
