import { createClient } from "@/lib/supabase/server"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { MessageChart } from "@/components/dashboard/message-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Users, MessageSquare, TrendingUp, Clock } from "lucide-react"

async function getDashboardStats(userId: string) {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [contactsResult, messagesResult, openedResult, eventsResult] = await Promise.all([
    supabase.from("contacts").select("id, created_at", { count: "exact" }).eq("user_id", userId),
    supabase.from("messages").select("id", { count: "exact" }).eq("user_id", userId).in("status", ["sent", "delivered", "opened", "clicked"]),
    supabase.from("messages").select("id", { count: "exact" }).eq("user_id", userId).in("status", ["opened", "clicked"]),
    supabase.from("market_events").select("id", { count: "exact" }).eq("user_id", userId).eq("is_actionable", true).eq("is_read", false),
  ])

  const totalContacts = contactsResult.count || 0
  const contactsThisMonth = contactsResult.data?.filter(
    (c) => new Date(c.created_at) >= new Date(startOfMonth)
  ).length || 0
  const messagesSent = messagesResult.count || 0
  const messagesOpened = openedResult.count || 0
  const openRate = messagesSent > 0 ? Math.round((messagesOpened / messagesSent) * 100) : 0
  const pendingFollowUps = eventsResult.count || 0

  return {
    total_contacts: totalContacts,
    contacts_this_month: contactsThisMonth,
    messages_sent: messagesSent,
    messages_opened: messagesOpened,
    open_rate: openRate,
    pending_follow_ups: pendingFollowUps,
  }
}

async function getRecentMessages(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("messages")
    .select("*, contact:contacts(first_name, last_name, email)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  return data || []
}

async function getMessageChartData(userId: string) {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data } = await supabase
    .from("messages")
    .select("created_at, status")
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .in("status", ["sent", "delivered", "opened", "clicked"])

  // Group by week
  const weeks: Record<string, { sent: number; opened: number }> = {}
  const messages = data || []

  messages.forEach((msg) => {
    const date = new Date(msg.created_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split("T")[0]

    if (!weeks[weekKey]) {
      weeks[weekKey] = { sent: 0, opened: 0 }
    }
    weeks[weekKey].sent += 1
    if (msg.status === "opened" || msg.status === "clicked") {
      weeks[weekKey].opened += 1
    }
  })

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-4)
    .map(([week, data]) => ({
      week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sent: data.sent,
      opened: data.opened,
    }))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [stats, recentMessages, chartData] = await Promise.all([
    getDashboardStats(user.id),
    getRecentMessages(user.id),
    getMessageChartData(user.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your outreach performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Contacts"
          value={stats.total_contacts}
          description={`+${stats.contacts_this_month} this month`}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Messages Sent"
          value={stats.messages_sent}
          description="Last 30 days"
          icon={MessageSquare}
        />
        <StatsCard
          title="Open Rate"
          value={`${stats.open_rate}%`}
          description="Email engagement"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Pending Follow-ups"
          value={stats.pending_follow_ups}
          description="Action required"
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <MessageChart data={chartData} />
        </div>
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>

      <RecentActivity messages={recentMessages} />
    </div>
  )
}
