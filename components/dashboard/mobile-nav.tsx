"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  Zap,
  X,
} from "lucide-react"

interface MobileNavProps {
  open: boolean
  onClose: () => void
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

export function MobileNav({ open, onClose, profile }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="flex h-16 flex-row items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <SheetTitle className="text-lg font-semibold">ReconnectAI</SheetTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close navigation</span>
          </Button>
        </SheetHeader>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <div className="rounded-lg bg-accent p-4">
            <p className="text-sm font-medium">Welcome back</p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.full_name || "Agent"}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
