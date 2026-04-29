import { Suspense } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { ContactsFilters } from "@/components/contacts/contacts-filters"
import { Plus, Upload } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface ContactsPageProps {
  searchParams: Promise<{
    search?: string
    segment?: string
    page?: string
  }>
}

async function getContacts(userId: string, search?: string, segment?: string, page = 1) {
  const supabase = await createClient()
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (segment && segment !== "all") {
    query = query.eq("segment", segment)
  }

  const { data, count } = await query

  return {
    contacts: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  }
}

async function getSegments(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("contacts")
    .select("segment")
    .eq("user_id", userId)

  const segments = [...new Set(data?.map((c) => c.segment) || [])]
  return segments.filter(Boolean)
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const page = parseInt(params.page || "1")
  const [{ contacts, total, pages }, segments] = await Promise.all([
    getContacts(user.id, params.search, params.segment, page),
    getSegments(user.id),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your sphere of influence ({total} contacts)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/contacts/import">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/contacts/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Link>
          </Button>
        </div>
      </div>

      <ContactsFilters segments={segments} />

      <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
        <ContactsTable 
          contacts={contacts} 
          currentPage={page} 
          totalPages={pages} 
        />
      </Suspense>
    </div>
  )
}
