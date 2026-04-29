"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
]

export function NewTemplateForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    channel: "email",
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.content.trim()) {
      setError("Name and content are required")
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    const variableRegex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match
    while ((match = variableRegex.exec(formData.content)) !== null) {
      if (!variables.includes(match[1])) variables.push(match[1])
    }

    const { error: insertError } = await supabase.from("templates").insert({
      user_id: user.id,
      name: formData.name,
      subject: formData.subject || null,
      content: formData.content,
      is_active: formData.is_active,
      variables,
      channel: formData.channel,
    })

    setIsLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push("/dashboard/templates")
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/templates">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Template</h1>
          <p className="text-muted-foreground">Reusable message template for outreach</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Welcome Email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData((p) => ({ ...p, channel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.channel === "email" && (
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g., Welcome {{first_name}}!"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">Message Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write your template message here..."
                rows={10}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"}, {"{{company}}"} for personalization
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/templates">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2 h-4 w-4" />}
                Create Template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
