import { Resend } from "resend"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Contact } from "@/lib/types"

interface PendingMessage {
  id: string
  user_id: string
  contact_id: string
  subject: string | null
  content: string
  template_id: string | null
}

interface SendOptions {
  fromName: string
  fromEmail: string
  resendApiKey: string
}

function personalize(text: string, contact: Contact): string {
  return text
    .replace(/\{\{first_name\}\}/g, contact.first_name)
    .replace(/\{\{last_name\}\}/g, contact.last_name || "")
    .replace(/\{\{email\}\}/g, contact.email || "")
    .replace(/\{\{company\}\}/g, contact.company || "")
}

/**
 * Send a batch of already-persisted messages via Resend, updating their status in place.
 * Used by both interactive send and the scheduled dispatcher.
 */
export async function dispatchMessages(
  supabase: SupabaseClient,
  messages: PendingMessage[],
  contactsById: Record<string, Contact>,
  options: SendOptions,
): Promise<{ sent: number; failed: number; errors: { messageId: string; error: string }[] }> {
  const resend = new Resend(options.resendApiKey)
  let sent = 0
  let failed = 0
  const errors: { messageId: string; error: string }[] = []

  for (const message of messages) {
    const contact = contactsById[message.contact_id]
    if (!contact) {
      failed++
      errors.push({ messageId: message.id, error: "Contact not found" })
      await supabase
        .from("messages")
        .update({ status: "failed", error_message: "Contact not found" })
        .eq("id", message.id)
      continue
    }
    if (!contact.email) {
      failed++
      errors.push({ messageId: message.id, error: "No email address" })
      await supabase
        .from("messages")
        .update({ status: "failed", error_message: "No email address" })
        .eq("id", message.id)
      continue
    }

    const personalizedContent = personalize(message.content, contact)
    const personalizedSubject = personalize(message.subject || "", contact)

    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: `${options.fromName} <${options.fromEmail}>`,
        to: contact.email,
        subject: personalizedSubject || `Message from ${options.fromName}`,
        text: personalizedContent,
      })

      if (emailError) throw emailError

      await supabase
        .from("messages")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          external_id: emailData?.id || null,
          subject: personalizedSubject,
          content: personalizedContent,
        })
        .eq("id", message.id)

      await supabase
        .from("contacts")
        .update({ last_contacted_at: new Date().toISOString() })
        .eq("id", contact.id)

      sent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      failed++
      errors.push({ messageId: message.id, error: msg })
      await supabase
        .from("messages")
        .update({ status: "failed", error_message: msg })
        .eq("id", message.id)
    }
  }

  return { sent, failed, errors }
}
