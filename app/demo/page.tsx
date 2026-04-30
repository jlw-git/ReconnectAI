"use client"

import { useState, useEffect } from "react"
import { track } from "@vercel/analytics"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Sparkles,
  Cake,
  Home,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react"

const STEP_NAMES = ["hero", "contacts", "intelligence", "email", "closer"] as const

const FAKE_CONTACTS = [
  { name: "David Tan", segment: "Past Client", lastContacted: "2 years ago", stale: true },
  { name: "Priya Sharma", segment: "Buyer", lastContacted: "8 months ago", stale: true },
  { name: "Marcus Lim", segment: "Past Client", lastContacted: "1 year ago", stale: true },
  { name: "Elena Wong", segment: "Investor", lastContacted: "Never", stale: true },
  { name: "Rashid Khan", segment: "Referral", lastContacted: "3 years ago", stale: true },
]

const INSIGHTS = [
  {
    icon: Home,
    title: "David Tan's 2-year home anniversary",
    detail: "in 5 days · purchased 12 Holland Road",
    color: "bg-pink-500/10 text-pink-500",
    contact: "David Tan",
  },
  {
    icon: Cake,
    title: "Priya Sharma's birthday",
    detail: "in 3 days",
    color: "bg-yellow-500/10 text-yellow-500",
    contact: "Priya Sharma",
  },
  {
    icon: Sparkles,
    title: "Reconnect with Rashid Khan",
    detail: "no contact in 3 years — likely ready to hear from you",
    color: "bg-blue-500/10 text-blue-500",
    contact: "Rashid Khan",
  },
]

export default function DemoPage() {
  const [step, setStep] = useState(0)
  const totalSteps = 5

  // Funnel tracking: fire one event per step entry. Step name is the property
  // we'll filter on in the Vercel Analytics dashboard.
  useEffect(() => {
    track("demo_step", { step, name: STEP_NAMES[step] })
    if (step === totalSteps - 1) {
      track("demo_completed")
    }
  }, [step])

  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">ReconnectAI</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Demo · {step + 1} / {totalSteps}
          </span>
        </div>
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-2xl px-4 py-8 pb-32">
        {step === 0 && <StepHero />}
        {step === 1 && <StepContacts />}
        {step === 2 && <StepIntelligence />}
        {step === 3 && <StepEmail />}
        {step === 4 && <StepCloser />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {step < totalSteps - 1 ? (
            <Button onClick={next} className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setStep(0)} variant="outline" className="gap-2">
              Restart demo
            </Button>
          )}
        </div>
      </nav>
    </div>
  )
}

function StepHero() {
  return (
    <div className="space-y-6 pt-8 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
        <Zap className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Your past clients are forgetting you.
      </h1>
      <p className="text-lg text-muted-foreground">
        <span className="font-semibold text-foreground">80%</span> of past clients say
        they&apos;d use their agent again. Only{" "}
        <span className="font-semibold text-foreground">12%</span> actually do.
      </p>
      <Card className="text-left">
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The gap isn&apos;t loyalty — it&apos;s memory. Most agents don&apos;t reach
            out because they don&apos;t know{" "}
            <span className="text-foreground">what to say</span>, or{" "}
            <span className="text-foreground">when</span>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            ReconnectAI watches every contact for the right moment, drafts the
            message, and gets out of your way.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function StepContacts() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Your past clients</h2>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s a slice of a typical agent&apos;s book. Notice anything?
        </p>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {FAKE_CONTACTS.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{c.name}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {c.segment}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Last contacted</p>
                <p
                  className={`text-sm ${
                    c.stale ? "text-destructive font-medium" : ""
                  }`}
                >
                  {c.lastContacted}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Most agents have <span className="font-semibold text-foreground">200+</span>{" "}
        contacts like these. Reaching out manually? Impossible. So nothing happens.
      </p>
    </div>
  )
}

function StepIntelligence() {
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)
  const [visible, setVisible] = useState(0)

  const startScan = () => {
    track("demo_scan_clicked")
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setDone(true)
    }, 1600)
  }

  useEffect(() => {
    if (!done) return
    const timers = INSIGHTS.map((_, i) => setTimeout(() => setVisible(i + 1), i * 300))
    return () => timers.forEach(clearTimeout)
  }, [done])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Now run intelligence</h2>
        <p className="mt-1 text-muted-foreground">
          We scan every contact for upcoming birthdays, home anniversaries, and
          long-quiet relationships.
        </p>
      </div>

      {!done && (
        <Card className="text-center">
          <CardContent className="space-y-4 py-10">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <Button size="lg" onClick={startScan} disabled={scanning} className="gap-2">
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning 200 contacts...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Scan contacts
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {done && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">
            ✨ Found 3 reasons to reach out this week
          </p>
          {INSIGHTS.slice(0, visible).map((insight) => {
            const Icon = insight.icon
            return (
              <Card
                key={insight.title}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <CardContent className="flex items-start gap-3 pt-6">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${insight.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.detail}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StepEmail() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">We draft it for you</h2>
        <p className="mt-1 text-muted-foreground">
          Tap on David&apos;s anniversary and the email is ready — personalized
          with what we know about him.
        </p>
      </div>

      <Card className="border-primary/40">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
              <Home className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">David Tan&apos;s 2-year home anniversary</p>
              <p className="text-xs text-muted-foreground">
                in 5 days · 12 Holland Road
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="w-14 text-muted-foreground">To</span>
              <span>david.tan@example.com</span>
            </div>
            <div className="flex gap-2">
              <span className="w-14 text-muted-foreground">Subject</span>
              <span className="font-medium">
                Happy 2 years at{" "}
                <span className="rounded bg-primary/15 px-1 text-primary">
                  12 Holland Road
                </span>
                ,{" "}
                <span className="rounded bg-primary/15 px-1 text-primary">David</span>!
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
            <p>
              Hi{" "}
              <span className="rounded bg-primary/15 px-1 text-primary">David</span>,
            </p>
            <p className="mt-3">
              Hard to believe it&apos;s been two years since you got the keys to{" "}
              <span className="rounded bg-primary/15 px-1 text-primary">
                12 Holland Road
              </span>
              ! Hope you&apos;re loving it as much as the day we walked in.
            </p>
            <p className="mt-3">
              Property values in{" "}
              <span className="rounded bg-primary/15 px-1 text-primary">Holland</span>{" "}
              have moved roughly 8% in the last year — happy to share a quick
              estimate if you&apos;re curious where yours stands.
            </p>
            <p className="mt-3">Always here if you need anything.</p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Personalized fields highlighted
            </p>
            <Button size="sm" className="gap-2" disabled>
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StepCloser() {
  return (
    <div className="space-y-6 pt-8 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>

      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Relevant contact &gt; frequent contact.
      </h2>

      <p className="text-lg text-muted-foreground">
        Clients don&apos;t need more emails. They need the right one, at the
        right moment.
      </p>

      <Card className="text-left">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
            <p className="text-sm">
              <span className="font-medium">Watches your book 24/7</span> for
              moments worth a message.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
            <p className="text-sm">
              <span className="font-medium">Drafts the email</span>, personalized
              with what you know about each client.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
            <p className="text-sm">
              <span className="font-medium">You stay in control</span> — review,
              tweak, send. Or set it on auto.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        That&apos;s the whole concept. What do you think?
      </p>
    </div>
  )
}
