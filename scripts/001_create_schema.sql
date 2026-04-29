-- ReconnectAI Database Schema
-- Run this script to create all necessary tables

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  segment TEXT DEFAULT 'general',
  lead_score INTEGER DEFAULT 0,
  last_contacted_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select_own" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_own" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_own" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_own" ON public.contacts;
CREATE POLICY "contacts_select_own" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contacts_insert_own" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_update_own" ON public.contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contacts_delete_own" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_segment_idx ON public.contacts(segment);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON public.contacts(email);

-- Message templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'whatsapp')),
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_select_own" ON public.templates;
DROP POLICY IF EXISTS "templates_insert_own" ON public.templates;
DROP POLICY IF EXISTS "templates_update_own" ON public.templates;
DROP POLICY IF EXISTS "templates_delete_own" ON public.templates;
CREATE POLICY "templates_select_own" ON public.templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "templates_insert_own" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "templates_update_own" ON public.templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "templates_delete_own" ON public.templates FOR DELETE USING (auth.uid() = user_id);

-- Messages table (sent/scheduled messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'whatsapp')),
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_update_own" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "messages_delete_own" ON public.messages FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS messages_user_id_idx ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS messages_contact_id_idx ON public.messages(contact_id);
CREATE INDEX IF NOT EXISTS messages_status_idx ON public.messages(status);

-- Market events table (for intelligence/alerts)
CREATE TABLE IF NOT EXISTS public.market_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('price_change', 'new_listing', 'sold', 'market_trend', 'anniversary', 'birthday')),
  title TEXT NOT NULL,
  description TEXT,
  relevance_score INTEGER DEFAULT 50,
  is_read BOOLEAN DEFAULT false,
  is_actionable BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  event_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.market_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "market_events_select_own" ON public.market_events;
DROP POLICY IF EXISTS "market_events_insert_own" ON public.market_events;
DROP POLICY IF EXISTS "market_events_update_own" ON public.market_events;
DROP POLICY IF EXISTS "market_events_delete_own" ON public.market_events;
CREATE POLICY "market_events_select_own" ON public.market_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "market_events_insert_own" ON public.market_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "market_events_update_own" ON public.market_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "market_events_delete_own" ON public.market_events FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS market_events_user_id_idx ON public.market_events(user_id);
CREATE INDEX IF NOT EXISTS market_events_contact_id_idx ON public.market_events(contact_id);

-- User settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  daily_digest BOOLEAN DEFAULT true,
  auto_follow_up BOOLEAN DEFAULT false,
  follow_up_days INTEGER DEFAULT 7,
  working_hours_start TIME DEFAULT '09:00',
  working_hours_end TIME DEFAULT '17:00',
  resend_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_own" ON public.settings;
DROP POLICY IF EXISTS "settings_insert_own" ON public.settings;
DROP POLICY IF EXISTS "settings_update_own" ON public.settings;
DROP POLICY IF EXISTS "settings_delete_own" ON public.settings;
CREATE POLICY "settings_select_own" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert_own" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update_own" ON public.settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "settings_delete_own" ON public.settings FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile and settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS contacts_updated_at ON public.contacts;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS templates_updated_at ON public.templates;
CREATE TRIGGER templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS messages_updated_at ON public.messages;
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS settings_updated_at ON public.settings;
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
