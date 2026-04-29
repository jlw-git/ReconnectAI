"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  Send,
  MessageSquare,
  Bell,
  Cake,
  Home,
  CircleDollarSign,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Contact, Message, MarketEvent } from "@/lib/types"

interface ContactDetailProps {
  contact: Contact
  messages: Message[]
  marketEvents: MarketEvent[]
}

const SEGMENTS = [
  { value: "general", label: "General" },
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "investor", label: "Investor" },
  { value: "past_client", label: "Past Client" },
  { value: "referral", label: "Referral" },
  { value: "lead", label: "Lead" },
]

export function ContactDetail({ contact, messages, marketEvents }: ContactDetailProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(contact)

  const handleSave = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("contacts")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        segment: formData.segment,
        notes: formData.notes,
        birthday: formData.birthday || null,
        property_purchase_date: formData.property_purchase_date || null,
        property_address: formData.property_address || null,
        property_value: formData.property_value ?? null,
      })
      .eq("id", contact.id)

    setIsLoading(false)

    if (!error) {
      setIsEditing(false)
      router.refresh()
    }
  }

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from("contacts").delete().eq("id", contact.id)
    router.push("/dashboard/contacts")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return "bg-green-500/10 text-green-500"
      case "opened":
      case "clicked":
        return "bg-blue-500/10 text-blue-500"
      case "failed":
      case "bounced":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/contacts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {contact.first_name} {contact.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{contact.segment || "general"}</Badge>
              {contact.lead_score && contact.lead_score > 0 && (
                <Badge variant="outline">Score: {contact.lead_score}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {contact.first_name} {contact.last_name}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button asChild>
                <Link href={`/dashboard/messages/compose?contact=${contact.id}`}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading && <Spinner className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip_code">ZIP Code</Label>
                      <Input
                        id="zip_code"
                        value={formData.zip_code || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="segment">Segment</Label>
                    <Select
                      value={formData.segment || "general"}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, segment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEGMENTS.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="birthday">Birthday</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={formData.birthday || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property_purchase_date">Property Purchase Date</Label>
                      <Input
                        id="property_purchase_date"
                        type="date"
                        value={formData.property_purchase_date || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, property_purchase_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_address">Property Address</Label>
                    <Input
                      id="property_address"
                      value={formData.property_address || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
                      placeholder="456 Oak Ave, Springfield"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_value">Property Value (USD)</Label>
                    <Input
                      id="property_value"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.property_value ?? ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        property_value: e.target.value ? parseFloat(e.target.value) : null,
                      }))}
                      placeholder="450000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contact.phone}`} className="hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.company}</span>
                    </div>
                  )}
                  {(contact.address || contact.city || contact.state) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {[contact.address, contact.city, contact.state, contact.zip_code]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Added {new Date(contact.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {(contact.birthday ||
                    contact.property_purchase_date ||
                    contact.property_address ||
                    contact.property_value !== null) && (
                    <div className="pt-4 border-t space-y-3">
                      <p className="text-sm font-medium">Personal & Property</p>
                      {contact.birthday && (
                        <div className="flex items-center gap-3">
                          <Cake className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Birthday:{" "}
                            {new Date(contact.birthday).toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      {contact.property_purchase_date && (
                        <div className="flex items-center gap-3">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Purchased:{" "}
                            {new Date(contact.property_purchase_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {contact.property_address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.property_address}</span>
                        </div>
                      )}
                      {contact.property_value !== null && (
                        <div className="flex items-center gap-3">
                          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            ${contact.property_value.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {contact.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message History
              </CardTitle>
              <CardDescription>
                Recent messages sent to this contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages sent yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href={`/dashboard/messages/compose?contact=${contact.id}`}>
                      Send your first message
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{message.subject || "No subject"}</span>
                          <Badge variant="outline" className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {message.sent_at 
                            ? new Date(message.sent_at).toLocaleString()
                            : new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages Sent</span>
                <span className="font-medium">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open Rate</span>
                <span className="font-medium">
                  {messages.length > 0
                    ? `${Math.round((messages.filter(m => m.opened_at).length / messages.length) * 100)}%`
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Contact</span>
                <span className="font-medium">
                  {contact.last_contacted_at
                    ? new Date(contact.last_contacted_at).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Market Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Market Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No market events for this contact
                </p>
              ) : (
                <div className="space-y-3">
                  {marketEvents.map((event) => (
                    <div key={event.id} className="text-sm">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
