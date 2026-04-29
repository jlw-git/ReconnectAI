import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { runEngine } from "@/lib/intelligence/engine"

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [{ data: contacts, error: contactsError }, { data: existingUnread }] =
    await Promise.all([
      supabase.from("contacts").select("*").eq("user_id", user.id),
      supabase
        .from("market_events")
        .select("contact_id, event_type")
        .eq("user_id", user.id)
        .eq("is_read", false),
    ])

  if (contactsError) {
    return NextResponse.json({ error: contactsError.message }, { status: 500 })
  }

  const detected = runEngine(contacts || [], existingUnread || [], {
    windowDays: 14,
    reconnectAfterDays: 90,
    now: new Date(),
  })

  if (detected.length === 0) {
    return NextResponse.json({ created: 0, scanned: contacts?.length || 0 })
  }

  const { error: insertError, data: inserted } = await supabase
    .from("market_events")
    .insert(detected)
    .select("id")

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({
    created: inserted?.length || 0,
    scanned: contacts?.length || 0,
  })
}
