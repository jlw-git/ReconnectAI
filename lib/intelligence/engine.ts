import type { Contact, MarketEvent } from "@/lib/types"

export type DetectedEvent = Pick<
  MarketEvent,
  "user_id" | "contact_id" | "event_type" | "title" | "description" | "relevance_score" | "is_actionable"
> & {
  metadata: Record<string, unknown>
  event_date: string
}

export interface EngineConfig {
  windowDays: number
  reconnectAfterDays: number
  now: Date
}

export const DEFAULT_CONFIG: EngineConfig = {
  windowDays: 14,
  reconnectAfterDays: 90,
  now: new Date(),
}

function daysUntilNextOccurrence(monthDay: { month: number; day: number }, now: Date): number {
  const thisYear = new Date(Date.UTC(now.getUTCFullYear(), monthDay.month, monthDay.day))
  let target = thisYear
  if (target.getTime() < startOfDayUTC(now).getTime()) {
    target = new Date(Date.UTC(now.getUTCFullYear() + 1, monthDay.month, monthDay.day))
  }
  return Math.round((target.getTime() - startOfDayUTC(now).getTime()) / (1000 * 60 * 60 * 24))
}

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function parseDateOnly(s: string): { month: number; day: number; year: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (!m) return null
  return { year: parseInt(m[1]), month: parseInt(m[2]) - 1, day: parseInt(m[3]) }
}

function nextOccurrenceISO(monthDay: { month: number; day: number }, now: Date): string {
  const days = daysUntilNextOccurrence(monthDay, now)
  const target = new Date(startOfDayUTC(now).getTime() + days * 24 * 60 * 60 * 1000)
  return target.toISOString()
}

function daysSince(iso: string, now: Date): number {
  return Math.round((now.getTime() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Detect events for a single contact. Pure: no DB access.
 * Caller is responsible for filtering against existing unread events.
 */
export function detectEventsForContact(
  contact: Contact,
  config: EngineConfig = DEFAULT_CONFIG,
): DetectedEvent[] {
  const events: DetectedEvent[] = []
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(" ")

  if (contact.birthday) {
    const parsed = parseDateOnly(contact.birthday)
    if (parsed) {
      const days = daysUntilNextOccurrence(parsed, config.now)
      if (days <= config.windowDays) {
        events.push({
          user_id: contact.user_id,
          contact_id: contact.id,
          event_type: "birthday",
          title:
            days === 0
              ? `${fullName}'s birthday is today`
              : `${fullName}'s birthday in ${days} day${days === 1 ? "" : "s"}`,
          description: `Send a personalized birthday message.`,
          relevance_score: days === 0 ? 95 : Math.max(60, 90 - days * 2),
          is_actionable: true,
          metadata: { days_until: days, source: "birthday" },
          event_date: nextOccurrenceISO(parsed, config.now),
        })
      }
    }
  }

  if (contact.property_purchase_date) {
    const parsed = parseDateOnly(contact.property_purchase_date)
    if (parsed) {
      const days = daysUntilNextOccurrence(
        { month: parsed.month, day: parsed.day },
        config.now,
      )
      if (days <= config.windowDays) {
        const yearsOwned = config.now.getUTCFullYear() - parsed.year
        events.push({
          user_id: contact.user_id,
          contact_id: contact.id,
          event_type: "anniversary",
          title:
            days === 0
              ? `${fullName}'s ${yearsOwned}-year home anniversary today`
              : `${fullName}'s ${yearsOwned}-year home anniversary in ${days} day${days === 1 ? "" : "s"}`,
          description: contact.property_address
            ? `Purchased ${contact.property_address}`
            : `Reach out to celebrate the milestone.`,
          relevance_score: days === 0 ? 90 : Math.max(55, 85 - days * 2),
          is_actionable: true,
          metadata: {
            days_until: days,
            years_owned: yearsOwned,
            property_address: contact.property_address,
            source: "purchase_anniversary",
          },
          event_date: nextOccurrenceISO(
            { month: parsed.month, day: parsed.day },
            config.now,
          ),
        })
      }
    }
  }

  const lastContactRef = contact.last_contacted_at || contact.created_at
  if (lastContactRef) {
    const days = daysSince(lastContactRef, config.now)
    if (days >= config.reconnectAfterDays) {
      events.push({
        user_id: contact.user_id,
        contact_id: contact.id,
        event_type: "market_trend",
        title: `Reconnect with ${fullName}`,
        description: `No contact in ${days} days — they may be ready to hear from you.`,
        relevance_score: Math.min(85, 40 + Math.floor(days / 10)),
        is_actionable: true,
        metadata: { days_since_contact: days, source: "reconnect_window" },
        event_date: config.now.toISOString(),
      })
    }
  }

  return events
}

/**
 * Run engine across all contacts and filter out duplicates of existing unread events.
 * An existing unread event with the same (contact_id, event_type) suppresses a new one.
 */
export function runEngine(
  contacts: Contact[],
  existingUnread: Pick<MarketEvent, "contact_id" | "event_type">[],
  config: EngineConfig = DEFAULT_CONFIG,
): DetectedEvent[] {
  const existingKey = new Set(
    existingUnread.map((e) => `${e.contact_id}::${e.event_type}`),
  )
  return contacts
    .flatMap((c) => detectEventsForContact(c, config))
    .filter((e) => !existingKey.has(`${e.contact_id}::${e.event_type}`))
}
