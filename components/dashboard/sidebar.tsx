"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  Zap,
} from "lucide-react"

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contacts", href: "/dashboard/contacts", icon: Users },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Templates", href: "/dashboard/templates", icon: FileText },
  { name: "Insights", href: "/dashboard/insights", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">ReconnectAI</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent p-4">
          <p className="text-sm font-medium text-sidebar-accent-foreground">
            Welcome back
          </p>
          <p className="text-xs text-sidebar-foreground/70 truncate">
            {profile?.full_name || "Agent"}
          </p>
        </div>
      </div>
    </aside>
  )
}
