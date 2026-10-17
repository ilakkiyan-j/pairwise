import Link from "next/link";
import {
  Sparkles,
  UserPlus,
  Users,
  MessageSquareHeart,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-card sm:p-12">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/80 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AGENTIC MATCHMAKING PLATFORM
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Let your agents meet <br />
            <span className="text-primary">before you do.</span>
          </h1>

          <p className="text-base leading-relaxed text-muted sm:text-lg">
            PairWise represents consenting individuals with dedicated AI agents. Agents examine
            permitted LinkedIn and Instagram source content, hold simulated dating conversations, and
            compute transparent, evidence-backed compatibility rankings.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/people"
              className="inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white shadow-subtle transition-all hover:bg-primary-hover active:scale-[0.98]"
            >
              <Users className="h-4 w-4" />
              Explore Participants
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/people/new"
              className="inline-flex items-center gap-2 rounded-btn border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-surface-muted"
            >
              <UserPlus className="h-4 w-4 text-primary" />
              Add Participant
            </Link>
          </div>
        </div>

        {/* Live Metrics Summary Panel */}
        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-8 sm:grid-cols-4">
          <div className="space-y-1">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">25</span>
            <p className="text-xs font-medium text-muted">Demo Participants</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">2</span>
            <p className="text-xs font-medium text-muted">Sources / Person</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">100%</span>
            <p className="text-xs font-medium text-muted">Consented & Audited</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">5-Factor</span>
            <p className="text-xs font-medium text-muted">Transparent Scoring</p>
          </div>
        </div>
      </section>

      {/* How It Works Strip */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Workflow</span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">How PairWise Works</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-card transition-all hover:border-primary/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">1. Build a Profile</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Add a consenting participant’s LinkedIn and public Instagram URLs. The profile analyst extracts stated goals, hobbies, lifestyle preferences, and explicit evidence without unauthorized scraping.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-card transition-all hover:border-primary/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-soft text-secondary">
              <MessageSquareHeart className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">2. Agents Date</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Two separately prompted agents represent their participants’ priorities. They conduct an alternating, multi-turn conversation, explore differences, and generate independent directional evaluations.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-card transition-all hover:border-primary/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">3. Explore Rankings</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Inspect deterministic compatibility rankings grounded in relationship goals, lifestyle values, shared interests, communication, and date interaction quality with clear reasoning and transcript links.
            </p>
          </div>
        </div>
      </section>

      {/* Ethical Guardrails Banner */}
      <section className="rounded-card border border-border bg-surface-muted/60 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
              <ShieldCheck className="h-4 w-4" />
              Privacy & Consent Principles
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-muted sm:text-sm">
              We never infer protected traits, bypass platform access controls, or profile non-consenting individuals. Compatibility scores are transparent estimates based on supported evidence.
            </p>
          </div>
          <Link
            href="/people/new"
            className="inline-flex items-center gap-2 rounded-btn border border-secondary/30 bg-surface px-4 py-2.5 text-xs font-semibold text-secondary shadow-subtle hover:bg-secondary-soft sm:text-sm"
          >
            Review Consent & Add Person
          </Link>
        </div>
      </section>
    </div>
  );
}
