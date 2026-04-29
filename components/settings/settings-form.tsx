"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import type { Profile, Settings } from "@/lib/types"

interface SettingsFormProps {
  profile: Profile
  settings: Settings
  email: string
}

export function SettingsForm({ profile, settings, email }: SettingsFormProps) {
  const router = useRouter()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  const [profileForm, setProfileForm] = useState({
    full_name: profile.full_name || "",
    company_name: profile.company_name || "",
    phone: profile.phone || "",
    timezone: profile.timezone || "UTC",
  })

  const [settingsForm, setSettingsForm] = useState({
    email_notifications: settings.email_notifications,
    sms_notifications: settings.sms_notifications,
    daily_digest: settings.daily_digest,
    auto_follow_up: settings.auto_follow_up,
    follow_up_days: settings.follow_up_days,
    working_hours_start: settings.working_hours_start,
    working_hours_end: settings.working_hours_end,
    resend_api_key: settings.resend_api_key || "",
  })

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update(profileForm)
      .eq("id", profile.id)
    setSavingProfile(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Profile updated")
    router.refresh()
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("settings")
      .update({
        ...settingsForm,
        resend_api_key: settingsForm.resend_api_key || null,
      })
      .eq("user_id", profile.id)
    setSavingSettings(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Settings updated")
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileForm.full_name}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, full_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company</Label>
                <Input
                  id="company_name"
                  value={profileForm.company_name}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, company_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={profileForm.timezone}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, timezone: e.target.value }))
                }
                placeholder="UTC, America/New_York, etc."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile && <Spinner className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications & Automation</CardTitle>
          <CardDescription>
            Control how and when you and your contacts receive messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications">Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts when contacts engage
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settingsForm.email_notifications}
                  onCheckedChange={(c) =>
                    setSettingsForm((p) => ({ ...p, email_notifications: c }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms_notifications">SMS notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive text alerts (requires Twilio)
                  </p>
                </div>
                <Switch
                  id="sms_notifications"
                  checked={settingsForm.sms_notifications}
                  onCheckedChange={(c) =>
                    setSettingsForm((p) => ({ ...p, sms_notifications: c }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily_digest">Daily digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily summary of new insights and engagement
                  </p>
                </div>
                <Switch
                  id="daily_digest"
                  checked={settingsForm.daily_digest}
                  onCheckedChange={(c) =>
                    setSettingsForm((p) => ({ ...p, daily_digest: c }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto_follow_up">Auto follow-up</Label>
                  <p className="text-sm text-muted-foreground">
                    Send follow-up messages automatically
                  </p>
                </div>
                <Switch
                  id="auto_follow_up"
                  checked={settingsForm.auto_follow_up}
                  onCheckedChange={(c) =>
                    setSettingsForm((p) => ({ ...p, auto_follow_up: c }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="follow_up_days">Follow-up after (days)</Label>
                <Input
                  id="follow_up_days"
                  type="number"
                  min={1}
                  max={365}
                  value={settingsForm.follow_up_days}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      follow_up_days: parseInt(e.target.value) || 7,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="working_hours_start">Working hours start</Label>
                <Input
                  id="working_hours_start"
                  type="time"
                  value={settingsForm.working_hours_start}
                  onChange={(e) =>
                    setSettingsForm((p) => ({ ...p, working_hours_start: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="working_hours_end">Working hours end</Label>
                <Input
                  id="working_hours_end"
                  type="time"
                  value={settingsForm.working_hours_end}
                  onChange={(e) =>
                    setSettingsForm((p) => ({ ...p, working_hours_end: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="resend_api_key">Resend API Key</Label>
              <Input
                id="resend_api_key"
                type="password"
                value={settingsForm.resend_api_key}
                onChange={(e) =>
                  setSettingsForm((p) => ({ ...p, resend_api_key: e.target.value }))
                }
                placeholder="re_xxxxxxxxxxxx"
              />
              <p className="text-xs text-muted-foreground">
                Used to send email through your own Resend account. Leave blank to use the system default.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingSettings}>
                {savingSettings && <Spinner className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
