# ReconnectAI

CRM-agnostic AI layer that helps real estate agents reactivate dormant client databases through personalized market insights and automated outreach.

> "Clients don't need frequent contact — they need relevant contact."

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Radix primitives)
- **Supabase** — Postgres, Auth (email/password), RLS
- **Resend** — transactional email
- **Recharts**, **react-hook-form**, **zod**, **PapaParse**, **sonner**

## Prerequisites

- Node 20+ and `pnpm` (`npm install -g pnpm`)
- A Supabase project
- A [Resend](https://resend.com) API key (for sending email)

## Setup

```bash
pnpm install
```

Create a `.env` file at the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service-role key>   # used by /api/messages/dispatch-scheduled

# Resend
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=onboarding@resend.dev        # or your verified domain

# Cron / scheduler auth
CRON_SECRET=<openssl rand -hex 32>             # required for the dispatcher endpoint
```

Run the SQL migrations in order from the Supabase SQL editor:

1. `scripts/001_create_schema.sql` — tables, RLS policies, triggers
2. `scripts/002_intelligence_fields.sql` — birthday + property fields

Both scripts are idempotent (safe to re-run).

## Running locally

```bash
pnpm dev
```

App runs at `http://localhost:3000`.

## Project layout

```
app/                          Next.js routes
  auth/                       Sign-up, login, callback, error
  dashboard/                  Protected app (KPI cards, contacts, messages, templates, insights, settings)
  api/
    messages/
      send/                   Send Now / Schedule / Save Draft endpoint
      dispatch-scheduled/     Cron-callable: sends due scheduled and auto follow-ups
    intelligence/run/         Runs the rules engine for the current user

components/
  contacts/                   List, detail, new, CSV import
  messages/                   Compose, history, templates
  insights/                   Market events feed
  settings/                   Profile + preferences
  dashboard/                  Header, sidebar, stats, charts
  ui/                         shadcn primitives

lib/
  supabase/                   Browser/server clients + auth proxy helper
  intelligence/engine.ts      Pure rules engine (birthday, anniversary, reconnect)
  messaging/send-email.ts     Shared Resend dispatcher
  types.ts                    Shared TypeScript types

scripts/                      SQL migrations
```

## Core flows

**Contacts** — manual add, CSV import (auto-mapping + dedup by email), edit (incl. birthday, property purchase date, address, value).

**Templates** — reusable messages with `{{first_name}}` etc. variable interpolation.

**Compose** — three modes:

- **Send Now** — emails go out immediately via Resend
- **Schedule** — persisted with `status='scheduled'` + `scheduled_at`; dispatcher picks them up
- **Save Draft** — persisted with `status='draft'`

**Insights / Intelligence** — a "Run Intelligence" button on `/dashboard/insights` invokes the rules engine. Detects:

- Upcoming birthdays (14-day window)
- Home-purchase anniversaries (14-day window)
- Reconnect prompts (no contact in 90+ days)

Engine is a pure function in `lib/intelligence/engine.ts` (easily testable).

**Auto follow-up** — if Settings → Auto follow-up is on, the dispatcher generates draft follow-up messages for contacts not contacted in `follow_up_days` days.

## The dispatcher

`POST /api/messages/dispatch-scheduled` is the single cron entry point. It:

1. Authenticates with the `x-cron-secret` header
2. Sends any scheduled messages whose `scheduled_at` has passed
3. (If enabled) creates auto follow-up drafts for stale contacts

Trigger it manually:

```bash
curl -X POST http://localhost:3000/api/messages/dispatch-scheduled \
  -H "x-cron-secret: $CRON_SECRET"
```

In production, hook it up to Vercel Cron, Supabase pg_cron, or any external scheduler — every 5 minutes is reasonable.

## Roadmap

Not yet built (in priority order):

- WhatsApp / SMS channel (Twilio) — schema supports it, only email implemented
- Two-way conversation threading (reply parsing)
- Property data enrichment from external feeds (the "real" market intelligence)
- CRM connectors (Salesforce, HubSpot)
