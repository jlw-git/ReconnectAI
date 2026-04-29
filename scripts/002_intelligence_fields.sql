-- Adds fields needed by the market intelligence engine.
-- Idempotent: safe to re-run.

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS property_purchase_date DATE,
  ADD COLUMN IF NOT EXISTS property_address TEXT,
  ADD COLUMN IF NOT EXISTS property_value NUMERIC;

CREATE INDEX IF NOT EXISTS contacts_birthday_idx ON public.contacts(birthday);
CREATE INDEX IF NOT EXISTS contacts_property_purchase_date_idx ON public.contacts(property_purchase_date);
CREATE INDEX IF NOT EXISTS contacts_last_contacted_idx ON public.contacts(last_contacted_at);

-- Index for fast dedup lookups in the engine.
CREATE INDEX IF NOT EXISTS market_events_dedup_idx
  ON public.market_events(user_id, contact_id, event_type, is_read);
