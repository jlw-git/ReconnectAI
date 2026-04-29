"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const SEGMENTS = [
  { value: "general", label: "General" },
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "investor", label: "Investor" },
  { value: "past_client", label: "Past Client" },
  { value: "referral", label: "Referral" },
  { value: "lead", label: "Lead" },
]

export function NewContactForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    const propertyValueRaw = formData.get("property_value") as string
    const { data, error: insertError } = await supabase
      .from("contacts")
      .insert({
        user_id: user.id,
        first_name: formData.get("first_name") as string,
        last_name: (formData.get("last_name") as string) || null,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        company: (formData.get("company") as string) || null,
        address: (formData.get("address") as string) || null,
        city: (formData.get("city") as string) || null,
        state: (formData.get("state") as string) || null,
        zip_code: (formData.get("zip_code") as string) || null,
        segment: (formData.get("segment") as string) || "general",
        notes: (formData.get("notes") as string) || null,
        birthday: (formData.get("birthday") as string) || null,
        property_purchase_date: (formData.get("property_purchase_date") as string) || null,
        property_address: (formData.get("property_address") as string) || null,
        property_value: propertyValueRaw ? parseFloat(propertyValueRaw) : null,
        source: "manual",
      })
      .select()
      .single()

    setIsLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push(`/dashboard/contacts/${data.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/contacts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Contact</h1>
          <p className="text-muted-foreground">Create a new contact in your database</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="first_name">First Name *</FieldLabel>
                <Input id="first_name" name="first_name" required placeholder="John" />
              </Field>
              <Field>
                <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                <Input id="last_name" name="last_name" placeholder="Doe" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="john@example.com" />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="company">Company</FieldLabel>
              <Input id="company" name="company" placeholder="Acme Inc." />
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input id="address" name="address" placeholder="123 Main St" />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input id="city" name="city" placeholder="New York" />
              </Field>
              <Field>
                <FieldLabel htmlFor="state">State</FieldLabel>
                <Input id="state" name="state" placeholder="NY" />
              </Field>
              <Field>
                <FieldLabel htmlFor="zip_code">ZIP</FieldLabel>
                <Input id="zip_code" name="zip_code" placeholder="10001" />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="segment">Segment</FieldLabel>
              <Select name="segment" defaultValue="general">
                <SelectTrigger>
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENTS.map((segment) => (
                    <SelectItem key={segment.value} value={segment.value}>
                      {segment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <Field>
                <FieldLabel htmlFor="birthday">Birthday</FieldLabel>
                <Input id="birthday" name="birthday" type="date" />
              </Field>
              <Field>
                <FieldLabel htmlFor="property_purchase_date">
                  Property Purchase Date
                </FieldLabel>
                <Input
                  id="property_purchase_date"
                  name="property_purchase_date"
                  type="date"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="property_address">Property Address</FieldLabel>
              <Input
                id="property_address"
                name="property_address"
                placeholder="456 Oak Ave, Springfield"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="property_value">Property Value (USD)</FieldLabel>
              <Input
                id="property_value"
                name="property_value"
                type="number"
                min="0"
                step="1000"
                placeholder="450000"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any additional notes about this contact..."
                rows={3}
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/contacts">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2 h-4 w-4" />}
                Add Contact
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
