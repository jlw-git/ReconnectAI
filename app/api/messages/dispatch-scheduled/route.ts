import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { dispatchMessages } from "@/lib/messaging/send-email"
import type { Contact } from "@/lib/types"

const AUTO_FOLLOWUP_LIMIT_PER_USER = 10

async function generateAutoFollowupDrafts(admin: SupabaseClient): Promise<number> {
  const { data: autoUsers } = await admin
    .from("settings")
    .select("user_id, follow_up_days")
    .eq("auto_follow_up", true)

  if (!autoUsers || autoUsers.length === 0) return 0

  let totalCreated = 0

  for (const u of autoUsers) {
    const followUpDays = u.follow_up_days || 7
    const cutoffIso = new Date(Date.now() - followUpDays * 86_400_000).toISOString()

    const { data: templates } = await admin
      .from("templates")
      .select("id, subject, content")
      .eq("user_id", u.user_id)
      .eq("is_active", true)
      .eq("channel", "email")
      .order("created_at", { ascending: true })
      .limit(1)

    if (!templates || templates.length === 0) continue
    const template = templates[0]

    const { data: candidates } = await admin
      .from("contacts")
      .select("id, last_contacted_at, created_at")
      .eq("user_id", u.user_id)
      .not("email", "is", null)
      .limit(100)

    if (!candidates || candidates.length === 0) continue

    const stale = candidates.filter((c) => {
      const ref = c.last_contacted_at || c.created_at
      return new Date(ref).getTime() < new Date(cutoffIso).getTime()
    })
    if (stale.length === 0) continue

    const { data: recent } = await admin
      .from("messages")
      .select("contact_id")
      .eq("user_id", u.user_id)
      .in(
        "contact_id",
        stale.map((c) => c.id),
      )
      .gt("created_at", cutoffIso)

    const recentSet = new Set((recent || []).map((r) => r.contact_id))
    const due = stale.filter((c) => !recentSet.has(c.id)).slice(0, AUTO_FOLLOWUP_LIMIT_PER_USER)
    if (due.length === 0) continue

    const drafts = due.map((c) => ({
      user_id: u.user_id,
      contact_id: c.id,
      template_id: template.id,
      subject: template.subject,
      content: template.content,
      status: "draft" as const,
      channel: "email" as const,
    }))

    const { data: inserted } = await admin.from("messages").insert(drafts).select("id")
    totalCreated += inserted?.length || 0
  }

  return totalCreated
}

/**
 * Cron-callable endpoint. Sends any messages with status='scheduled'
 * whose scheduled_at has passed. Auth via CRON_SECRET header.
 *
 * Example call:
 *   curl -X POST https://your-app/api/messages/dispatch-scheduled \
 *     -H "x-cron-secret: $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    )
  }
  if (request.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase service-role credentials not configured" },
      { status: 500 },
    )
  }

  const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: due, error: dueError } = await admin
    .from("messages")
    .select("id, user_id, contact_id, subject, content, template_id")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(500)

  if (dueError) {
    return NextResponse.json({ error: dueError.message }, { status: 500 })
  }

  const autoFollowupDrafts = await generateAutoFollowupDrafts(admin)

  if (!due || due.length === 0) {
    return NextResponse.json({ dispatched: 0, sent: 0, failed: 0, autoFollowupDrafts })
  }

  const userIds = [...new Set(due.map((m) => m.user_id))]
  const contactIds = [...new Set(due.map((m) => m.contact_id))]

  const [{ data: contacts }, { data: settings }, { data: profiles }] = await Promise.all([
    admin.from("contacts").select("*").in("id", contactIds),
    admin.from("settings").select("user_id, resend_api_key").in("user_id", userIds),
    admin.from("profiles").select("id, full_name").in("id", userIds),
  ])

  const contactsById = Object.fromEntries(
    ((contacts as Contact[]) || []).map((c) => [c.id, c]),
  )
  const apiKeyByUser = Object.fromEntries(
    (settings || []).map((s) => [s.user_id, s.resend_api_key as string | null]),
  )
  const profileByUser = Object.fromEntries(
    (profiles || []).map((p) => [p.id, p.full_name as string | null]),
  )

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
  let totalSent = 0
  let totalFailed = 0

  for (const userId of userIds) {
    const userMessages = due.filter((m) => m.user_id === userId)
    const resendApiKey = apiKeyByUser[userId] || process.env.RESEND_API_KEY
    if (!resendApiKey) {
      await admin
        .from("messages")
        .update({ status: "failed", error_message: "Email service not configured" })
        .in(
          "id",
          userMessages.map((m) => m.id),
        )
      totalFailed += userMessages.length
      continue
    }

    const result = await dispatchMessages(admin, userMessages, contactsById, {
      fromName: profileByUser[userId] || "ReconnectAI",
      fromEmail,
      resendApiKey,
    })
    totalSent += result.sent
    totalFailed += result.failed
  }

  return NextResponse.json({
    dispatched: due.length,
    sent: totalSent,
    failed: totalFailed,
    autoFollowupDrafts,
  })
}
