import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Smart Contact Management",
    description: "Import contacts from CSV, segment automatically, and track engagement history.",
  },
  {
    icon: MessageSquare,
    title: "Automated Outreach",
    description: "Send personalized emails with templates, schedule messages, and track opens.",
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    description: "Get notified about market events and opportunities to reconnect with clients.",
  },
]

const benefits = [
  "Import unlimited contacts via CSV",
  "Personalized email templates with variables",
  "Real-time delivery and open tracking",
  "AI-powered reconnection suggestions",
  "Market event alerts for your sphere",
  "Mobile-friendly dashboard",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ReconnectAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-balance">
                Stay connected with your{" "}
                <span className="text-primary">sphere of influence</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground text-pretty">
                ReconnectAI helps real estate agents maintain meaningful relationships 
                through intelligent outreach, automated messaging, and market intelligence.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/login">Sign in to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything you need to nurture relationships</h2>
              <p className="mt-4 text-muted-foreground">
                A complete CRM solution designed specifically for real estate professionals.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-balance">
                  Built for agents who value relationships
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Stop letting valuable connections go cold. ReconnectAI ensures you never 
                  miss an opportunity to reach out at the perfect moment.
                </p>
                <ul className="mt-8 space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button asChild>
                    <Link href="/auth/sign-up">
                      Get Started Today
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border bg-card p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div>
                      <p className="font-medium">Total Contacts</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div>
                      <p className="font-medium">Messages This Month</p>
                      <p className="text-2xl font-bold">324</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div>
                      <p className="font-medium">Open Rate</p>
                      <p className="text-2xl font-bold">68%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to strengthen your client relationships?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of real estate agents who use ReconnectAI to stay top-of-mind 
              with their sphere of influence.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">ReconnectAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Intelligent CRM for Real Estate Professionals
          </p>
        </div>
      </footer>
    </div>
  )
}
