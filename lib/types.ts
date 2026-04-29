export interface Profile {
  id: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  user_id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  segment: string
  lead_score: number
  last_contacted_at: string | null
  notes: string | null
  tags: string[]
  source: string
  birthday: string | null
  property_purchase_date: string | null
  property_address: string | null
  property_value: number | null
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  user_id: string
  name: string
  subject: string | null
  content: string
  channel: 'email' | 'sms' | 'whatsapp'
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  contact_id: string
  template_id: string | null
  channel: 'email' | 'sms' | 'whatsapp'
  subject: string | null
  content: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced'
  scheduled_at: string | null
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  error_message: string | null
  external_id: string | null
  created_at: string
  updated_at: string
  contact?: Contact
}

export interface MarketEvent {
  id: string
  user_id: string
  contact_id: string | null
  event_type: 'price_change' | 'new_listing' | 'sold' | 'market_trend' | 'anniversary' | 'birthday'
  title: string
  description: string | null
  relevance_score: number
  is_read: boolean
  is_actionable: boolean
  metadata: Record<string, unknown>
  event_date: string
  created_at: string
  contact?: Contact
}

export interface Settings {
  id: string
  user_id: string
  email_notifications: boolean
  sms_notifications: boolean
  daily_digest: boolean
  auto_follow_up: boolean
  follow_up_days: number
  working_hours_start: string
  working_hours_end: string
  resend_api_key: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_contacts: number
  contacts_this_month: number
  messages_sent: number
  messages_opened: number
  open_rate: number
  pending_follow_ups: number
}
