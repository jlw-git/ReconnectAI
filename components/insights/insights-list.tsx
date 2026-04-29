"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Home,
  CircleDollarSign,
  PartyPopper,
  Cake,
  Sparkles,
  CheckCircle2,
  Send,
  RefreshCw,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { MarketEvent } from "@/lib/types"

interface InsightsListProps {
  events: (MarketEvent & { contact?: { id: string; first_name: string; last_name: string | null } | null })[]
}

const EVENT_META: Record<
  MarketEvent["event_type"],
  { icon: typeof TrendingUp; label: string; color: string }
> = {
  price_change: { icon: CircleDollarSign, label: "Price Change", color: "text-blue-500" },
  new_listing: { icon: Home, label: "New Listing", color: "text-green-500" },
  sold: { icon: TrendingUp, label: "Sold", color: "text-purple-500" },
  market_trend: { icon: Sparkles, label: "Market Trend", color: "text-orange-500" },
  anniversary: { icon: PartyPopper, label: "Anniversary", color: "text-pink-500" },
  birthday: { icon: Cake, label: "Birthday", color: "text-yellow-500" },
}

export function InsightsList({ events: initialEvents }: InsightsListProps) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [filter, setFilter] = useState<"all" | "unread" | "actionable">("all")
  const [running, setRunning] = useState(false)

  const runIntelligence = async () => {
    setRunning(true)
    try {
      const res = await fetch("/api/intelligence/run", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to run intelligence")
        return
      }
      toast.success(
        data.created > 0
          ? `Found ${data.created} new event${data.created === 1 ? "" : "s"} across ${data.scanned} contact${data.scanned === 1 ? "" : "s"}`
          : `Scanned ${data.scanned} contacts — no new events`,
      )
      router.refresh()
    } finally {
      setRunning(false)
    }
  }

  const filtered = events.filter((e) => {
    if (filter === "unread") return !e.is_read
    if (filter === "actionable") return e.is_actionable && !e.is_read
    return true
  })

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from("market_events").update({ is_read: true }).eq("id", id)
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, is_read: true } : e)))
    router.refresh()
  }

  const unreadCount = events.filter((e) => !e.is_read).length
  const actionableCount = events.filter((e) => e.is_actionable && !e.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground">
            Market events and opportunities for your contacts
          </p>
        </div>
        <Button onClick={runIntelligence} disabled={running}>
          <RefreshCw className={`h-4 w-4 mr-2 ${running ? "animate-spin" : ""}`} />
          {running ? "Scanning..." : "Run Intelligence"}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({events.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "actionable" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("actionable")}
        >
          Actionable ({actionableCount})
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No insights yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {events.length === 0
                ? "Click 'Run Intelligence' to scan your contacts for upcoming birthdays, home anniversaries, and reconnect opportunities."
                : "No events match this filter."}
            </p>
            {events.length === 0 && (
              <Button onClick={runIntelligence} disabled={running} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${running ? "animate-spin" : ""}`} />
                Run Intelligence
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const meta = EVENT_META[event.event_type]
            const Icon = meta.icon
            return (
              <Card key={event.id} className={event.is_read ? "opacity-60" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${meta.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {meta.label}
                            </Badge>
                            {!event.is_read && (
                              <Badge className="text-xs">New</Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {event.contact && (
                              <Link
                                href={`/dashboard/contacts/${event.contact.id}`}
                                className="hover:underline"
                              >
                                {event.contact.first_name} {event.contact.last_name}
                              </Link>
                            )}
                            <span>
                              Relevance: {event.relevance_score}/100
                            </span>
                            <span>
                              {new Date(event.event_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {event.is_actionable && event.contact && (
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/messages/compose?contact=${event.contact.id}`}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Reach Out
                              </Link>
                            </Button>
                          )}
                          {!event.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(event.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
