"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

interface ContactsFiltersProps {
  segments: string[]
}

export function ContactsFilters({ segments }: ContactsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set("search", term)
    } else {
      params.delete("search")
    }
    params.delete("page")
    router.push(`/dashboard/contacts?${params.toString()}`)
  }, 300)

  const handleSegmentChange = (segment: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (segment && segment !== "all") {
      params.set("segment", segment)
    } else {
      params.delete("segment")
    }
    params.delete("page")
    router.push(`/dashboard/contacts?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        defaultValue={searchParams.get("segment") || "all"}
        onValueChange={handleSegmentChange}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All segments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All segments</SelectItem>
          {segments.map((segment) => (
            <SelectItem key={segment} value={segment}>
              {segment.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
