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
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { 
  Plus, 
  FileEdit, 
  ArrowLeft,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Send
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Template } from "@/lib/types"

interface TemplatesViewProps {
  templates: Template[]
}

export function TemplatesView({ templates: initialTemplates }: TemplatesViewProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState(initialTemplates)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    is_active: true,
  })

  const resetForm = () => {
    setFormData({ name: "", subject: "", content: "", is_active: true })
    setError(null)
  }

  const handleCreate = async () => {
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

    // Extract variables from content
    const variableRegex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match
    while ((match = variableRegex.exec(formData.content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    const { data, error: insertError } = await supabase
      .from("templates")
      .insert({
        user_id: user.id,
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        is_active: formData.is_active,
        variables,
        channel: "email",
      })
      .select()
      .single()

    setIsLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setTemplates(prev => [data, ...prev])
    setIsCreateOpen(false)
    resetForm()
  }

  const handleUpdate = async () => {
    if (!editingTemplate) return
    if (!formData.name.trim() || !formData.content.trim()) {
      setError("Name and content are required")
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    // Extract variables from content
    const variableRegex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match
    while ((match = variableRegex.exec(formData.content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    const { error: updateError } = await supabase
      .from("templates")
      .update({
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        is_active: formData.is_active,
        variables,
      })
      .eq("id", editingTemplate.id)

    setIsLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setTemplates(prev =>
      prev.map(t =>
        t.id === editingTemplate.id
          ? { ...t, ...formData, variables }
          : t
      )
    )
    setEditingTemplate(null)
    resetForm()
  }

  const handleDelete = async () => {
    if (!deleteTemplate) return

    const supabase = createClient()
    await supabase.from("templates").delete().eq("id", deleteTemplate.id)
    
    setTemplates(prev => prev.filter(t => t.id !== deleteTemplate.id))
    setDeleteTemplate(null)
  }

  const handleDuplicate = async (template: Template) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("templates")
      .insert({
        user_id: user.id,
        name: `${template.name} (Copy)`,
        subject: template.subject,
        content: template.content,
        is_active: true,
        variables: template.variables,
        channel: template.channel,
      })
      .select()
      .single()

    if (!error && data) {
      setTemplates(prev => [data, ...prev])
    }
  }

  const openEdit = (template: Template) => {
    setFormData({
      name: template.name,
      subject: template.subject || "",
      content: template.content,
      is_active: template.is_active,
    })
    setEditingTemplate(template)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Message Templates</h1>
            <p className="text-muted-foreground">Create and manage reusable message templates</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileEdit className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No templates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create templates to speed up your outreach
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.subject && (
                      <CardDescription className="line-clamp-1">
                        {template.subject}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/messages/compose?template=${template.id}`}>
                          <Send className="h-4 w-4 mr-2" />
                          Use Template
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(template)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTemplate(template)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {template.content}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {template.variables && template.variables.length > 0 && (
                    <Badge variant="outline">
                      {template.variables.length} variable(s)
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={isCreateOpen || !!editingTemplate} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setEditingTemplate(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? "Update your message template"
                : "Create a reusable message template"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Welcome Email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Welcome {{first_name}}!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your template message here..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"}, {"{{company}}"} for personalization
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateOpen(false)
                setEditingTemplate(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingTemplate ? handleUpdate : handleCreate}
              disabled={isLoading}
            >
              {isLoading && <Spinner className="h-4 w-4 mr-2" />}
              {editingTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTemplate} onOpenChange={() => setDeleteTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTemplate?.name}&quot;? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
