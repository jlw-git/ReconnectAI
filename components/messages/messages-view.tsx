"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Send, 
  Mail, 
  CheckCircle2, 
  Eye, 
  XCircle, 
  FileEdit,
  Search,
  Plus
} from "lucide-react"
import type { Message, Contact } from "@/lib/types"

interface MessageWithContact extends Message {
  contacts: Pick<Contact, "id" | "first_name" | "last_name" | "email"> | null
}

interface MessagesViewProps {
  messages: MessageWithContact[]
  stats: {
    total: number
    sent: number
    opened: number
    failed: number
    draft: number
  }
}

export function MessagesView({ messages, stats }: MessagesViewProps) {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject?.toLowerCase().includes(search.toLowerCase()) ||
      message.contacts?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      message.contacts?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      message.contacts?.email?.toLowerCase().includes(search.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "sent") return matchesSearch && (message.status === "sent" || message.status === "delivered")
    if (activeTab === "opened") return matchesSearch && (message.status === "opened" || message.status === "clicked")
    if (activeTab === "draft") return matchesSearch && message.status === "draft"
    if (activeTab === "failed") return matchesSearch && (message.status === "failed" || message.status === "bounced")
    return matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "opened":
      case "clicked":
        return <Eye className="h-4 w-4 text-blue-500" />
      case "failed":
      case "bounced":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "draft":
        return <FileEdit className="h-4 w-4 text-muted-foreground" />
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      sent: "bg-green-500/10 text-green-500 border-green-500/20",
      delivered: "bg-green-500/10 text-green-500 border-green-500/20",
      opened: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      clicked: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      failed: "bg-red-500/10 text-red-500 border-red-500/20",
      bounced: "bg-red-500/10 text-red-500 border-red-500/20",
      draft: "bg-muted text-muted-foreground",
      scheduled: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    }
    return variants[status] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Manage and track your outreach</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/templates">
              <FileEdit className="h-4 w-4 mr-2" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/messages/compose">
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Sent</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Opened</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.opened}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Drafts</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Message History</CardTitle>
              <CardDescription>View and manage your sent messages</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="opened">Opened</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium mb-1">No messages found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {search ? "Try adjusting your search" : "Start by composing your first message"}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/messages/compose">
                      <Send className="h-4 w-4 mr-2" />
                      Compose Message
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMessages.map((message) => (
                    <Link 
                      key={message.id} 
                      href={`/dashboard/messages/${message.id}`}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(message.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {message.contacts 
                              ? `${message.contacts.first_name} ${message.contacts.last_name || ""}`
                              : "Unknown Contact"}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground truncate">
                            {message.contacts?.email || "No email"}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {message.subject || "No subject"}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {message.content}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <Badge variant="outline" className={getStatusBadge(message.status)}>
                          {message.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {message.sent_at 
                            ? new Date(message.sent_at).toLocaleDateString()
                            : new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
