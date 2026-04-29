import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dispatchMessages } from "@/lib/messaging/send-email"
import type { Contact } from "@/lib/types"

type Mode = "now" | "scheduled" | "draft"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      contactIds,
      templateId,
      subject,
      content,
      mode = "now",
      scheduledAt,
    }: {
      contactIds: string[]
      templateId: string | null
      subject: string
      content: string
      mode?: Mode
      scheduledAt?: string
    } = body

    if (!contactIds || contactIds.length === 0) {
      return NextResponse.json({ error: "No recipients specified" }, { status: 400 })
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }
    if (mode === "scheduled") {
      if (!scheduledAt) {
        return NextResponse.json(
          { error: "scheduledAt is required for scheduled mode" },
          { status: 400 },
        )
      }
      if (new Date(scheduledAt).getTime() <= Date.now()) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 },
        )
      }
    }

    const status = mode === "draft" ? "draft" : mode === "scheduled" ? "scheduled" : "sending"
    const rows = contactIds.map((contactId) => ({
      user_id: user.id,
      contact_id: contactId,
      template_id: templateId || null,
      subject: subject || null,
      content,
      status,
      scheduled_at: mode === "scheduled" ? scheduledAt : null,
      channel: "email" as const,
    }))

    const { data: inserted, error: insertError } = await supabase
      .from("messages")
      .insert(rows)
      .select("id, user_id, contact_id, subject, content, template_id")

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: insertError?.message || "Failed to create messages" },
        { status: 500 },
      )
    }

    if (mode !== "now") {
      return NextResponse.json({
        success: true,
        mode,
        created: inserted.length,
      })
    }

    const { data: settings } = await supabase
      .from("settings")
      .select("resend_api_key")
      .eq("user_id", user.id)
      .single()

    const resendApiKey = settings?.resend_api_key || process.env.RESEND_API_KEY
    if (!resendApiKey) {
      await supabase
        .from("messages")
        .update({ status: "failed", error_message: "Email service not configured" })
        .in(
          "id",
          inserted.map((m) => m.id),
        )
      return NextResponse.json(
        { error: "Email service not configured. Add Resend API key in settings." },
        { status: 400 },
      )
    }

    const { data: contacts } = await supabase
      .from("contacts")
      .select("*")
      .in("id", contactIds)
      .eq("user_id", user.id)

    const contactsById = Object.fromEntries(
      ((contacts as Contact[]) || []).map((c) => [c.id, c]),
    )

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()

    const result = await dispatchMessages(supabase, inserted, contactsById, {
      fromName: profile?.full_name || "ReconnectAI",
      fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      resendApiKey,
    })

    return NextResponse.json({
      success: true,
      mode: "now",
      ...result,
    })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
