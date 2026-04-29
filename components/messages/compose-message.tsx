"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Send, FileEdit, X, Check, ChevronsUpDown, Users, Clock } from "lucide-react"
import type { Contact, Template } from "@/lib/types"

type SendMode = "now" | "scheduled" | "draft"

interface ComposeMessageProps {
  contacts: Pick<Contact, "id" | "first_name" | "last_name" | "email">[]
  templates: Template[]
  selectedContact: Contact | null
  selectedTemplate: Template | null
}

export function ComposeMessage({ 
  contacts, 
  templates, 
  selectedContact, 
  selectedTemplate 
}: ComposeMessageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    selectedContact ? [selectedContact.id] : []
  )
  const [contactOpen, setContactOpen] = useState(false)
  
  const [templateId, setTemplateId] = useState<string>(selectedTemplate?.id || "")
  const [subject, setSubject] = useState(selectedTemplate?.subject || "")
  const [content, setContent] = useState(selectedTemplate?.content || "")
  const [mode, setMode] = useState<SendMode>("now")
  const [scheduledAt, setScheduledAt] = useState("")

  // Update subject and content when template changes
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        setSubject(template.subject || "")
        setContent(template.content)
      }
    }
  }, [templateId, templates])

  const handleSubmit = async () => {
    if (selectedContacts.length === 0) {
      setError("Please select at least one recipient")
      return
    }
    if (mode !== "draft" && !content.trim()) {
      setError("Please enter a message")
      return
    }
    if (mode === "scheduled") {
      if (!scheduledAt) {
        setError("Pick a date and time to schedule")
        return
      }
      if (new Date(scheduledAt).getTime() <= Date.now()) {
        setError("Scheduled time must be in the future")
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactIds: selectedContacts,
          templateId: templateId || null,
          subject,
          content,
          mode,
          scheduledAt: mode === "scheduled" ? new Date(scheduledAt).toISOString() : undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit message")
      }

      router.push("/dashboard/messages")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit message")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const removeContact = (contactId: string) => {
    setSelectedContacts(prev => prev.filter(id => id !== contactId))
  }

  const getContactById = (id: string) => contacts.find(c => c.id === id)

  // Replace template variables with contact data
  const getPreviewContent = () => {
    if (selectedContacts.length === 0) return content

    const firstContact = getContactById(selectedContacts[0])
    if (!firstContact) return content

    return content
      .replace(/\{\{first_name\}\}/g, firstContact.first_name)
      .replace(/\{\{last_name\}\}/g, firstContact.last_name || "")
      .replace(/\{\{email\}\}/g, firstContact.email || "")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Compose Message</h1>
          <p className="text-muted-foreground">Send an email to your contacts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Form */}
        <Card>
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
            <CardDescription>Fill in the message details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipients */}
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Popover open={contactOpen} onOpenChange={setContactOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={contactOpen}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {selectedContacts.length === 0
                        ? "Select recipients..."
                        : `${selectedContacts.length} recipient(s) selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search contacts..." />
                    <CommandList>
                      <CommandEmpty>No contacts found.</CommandEmpty>
                      <CommandGroup>
                        {contacts.map((contact) => (
                          <CommandItem
                            key={contact.id}
                            value={`${contact.first_name} ${contact.last_name} ${contact.email}`}
                            onSelect={() => toggleContact(contact.id)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedContacts.includes(contact.id) ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div>
                              <p>{contact.first_name} {contact.last_name}</p>
                              <p className="text-sm text-muted-foreground">{contact.email}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Selected contacts badges */}
              {selectedContacts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedContacts.map((contactId) => {
                    const contact = getContactById(contactId)
                    if (!contact) return null
                    return (
                      <Badge key={contactId} variant="secondary" className="gap-1">
                        {contact.first_name} {contact.last_name}
                        <button
                          onClick={() => removeContact(contactId)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Template */}
            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your message here..."
                rows={10}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"} for personalization
              </p>
            </div>

            {/* Send mode */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Delivery</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={mode === "now" ? "default" : "outline"}
                  onClick={() => setMode("now")}
                  className="justify-start"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button
                  type="button"
                  variant={mode === "scheduled" ? "default" : "outline"}
                  onClick={() => setMode("scheduled")}
                  className="justify-start"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button
                  type="button"
                  variant={mode === "draft" ? "default" : "outline"}
                  onClick={() => setMode("draft")}
                  className="justify-start"
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </div>

              {mode === "scheduled" && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="scheduled_at">Send at</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Times use your local timezone. The dispatcher runs every few minutes.
                  </p>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : mode === "now" ? (
                  <Send className="h-4 w-4 mr-2" />
                ) : mode === "scheduled" ? (
                  <Clock className="h-4 w-4 mr-2" />
                ) : (
                  <FileEdit className="h-4 w-4 mr-2" />
                )}
                {mode === "now"
                  ? "Send Message"
                  : mode === "scheduled"
                  ? "Schedule Message"
                  : "Save Draft"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              How your message will appear to recipients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              {/* Email header */}
              <div className="bg-muted/50 p-4 border-b">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16">To:</span>
                    <span>
                      {selectedContacts.length > 0
                        ? selectedContacts.map(id => {
                            const c = getContactById(id)
                            return c?.email
                          }).filter(Boolean).join(", ")
                        : "No recipients selected"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16">Subject:</span>
                    <span className="font-medium">{subject || "No subject"}</span>
                  </div>
                </div>
              </div>
              
              {/* Email body */}
              <div className="p-4 min-h-[300px] bg-background">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {getPreviewContent() ? (
                    <p className="whitespace-pre-wrap">{getPreviewContent()}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Your message will appear here...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
