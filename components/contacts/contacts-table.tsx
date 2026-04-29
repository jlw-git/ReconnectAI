"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { Contact } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Mail, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface ContactsTableProps {
  contacts: Contact[]
  currentPage: number
  totalPages: number
}

const segmentColors: Record<string, string> = {
  general: "bg-muted text-muted-foreground",
  buyer: "bg-chart-1/10 text-chart-1",
  seller: "bg-chart-2/10 text-chart-2",
  investor: "bg-chart-3/10 text-chart-3",
  past_client: "bg-chart-4/10 text-chart-4",
  referral: "bg-chart-5/10 text-chart-5",
  hot_lead: "bg-destructive/10 text-destructive",
}

export function ContactsTable({ contacts, currentPage, totalPages }: ContactsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/dashboard/contacts?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return
    
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from("contacts").delete().eq("id", id)
    router.refresh()
    setDeletingId(null)
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground mb-4">No contacts found</p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/contacts/import">Import CSV</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/contacts/new">Add Contact</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Segment</TableHead>
              <TableHead className="hidden lg:table-cell">Last Contact</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => {
              const initials = `${contact.first_name[0]}${contact.last_name?.[0] || ""}`.toUpperCase()
              return (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link 
                      href={`/dashboard/contacts/${contact.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.company && (
                          <p className="text-xs text-muted-foreground">{contact.company}</p>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contact.email || "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="secondary"
                      className={segmentColors[contact.segment] || segmentColors.general}
                    >
                      {contact.segment.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {contact.last_contacted_at
                      ? formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={deletingId === contact.id}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/contacts/${contact.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {contact.email && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/messages/compose?contact=${contact.id}`}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(contact.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
