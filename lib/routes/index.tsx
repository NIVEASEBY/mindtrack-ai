import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Activity, Brain, Calendar, HeartPulse, Mic, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindTrack AI — Predict burnout before it affects your studies" },
      { name: "description", content: "AI-powered burnout prediction, personalized study plans, and wellness tracking built for students." },
      { property: "og:title", content: "MindTrack AI" },
      { property: "og:description", content: "Predict burnout before it affects your studies." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Built for students, designed for calm
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Predict burnout before it affects your studies.
            </h1>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              MindTrack AI helps you spot stress early, build study plans that adapt to your energy, and recover with personalized guidance — all in one calm space.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
              >
                Start free assessment
              </Link>
              <Link
                to="/auth"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary/60"
              >
                I have an account
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card · 2-minute setup</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Your wellness co-pilot</h2>
          <p className="mt-3 text-muted-foreground">Six tools, one clear goal: keep you healthy while you study.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Activity, title: "Burnout prediction", body: "A transparent score that explains exactly what's draining you." },
            { icon: Mic, title: "Voice check-ins", body: "Speak naturally — we extract your sleep, stress, and workload." },
            { icon: HeartPulse, title: "Recovery plans", body: "Today, tomorrow, this week — small steps to feel better." },
            { icon: Calendar, title: "AI study planner", body: "Schedules adapt automatically when burnout risk rises." },
            { icon: Brain, title: "Wellness history", body: "Track trends and see improvement over time." },
            { icon: ShieldCheck, title: "Private by default", body: "Your data stays yours. Accessible and WCAG-friendly." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps, two minutes.</p>
          </div>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", title: "Share how you're doing", body: "Quick form or voice input — sleep, stress, workload." },
              { n: "02", title: "See your burnout risk", body: "A clear score with the factors that caused it." },
              { n: "03", title: "Follow your plan", body: "Personalized recovery + study schedule, delivered to your inbox." },
            ].map((s) => (
              <li key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="text-sm font-bold text-primary">{s.n}</div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-gradient-hero p-8 text-center shadow-soft sm:p-14">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Start your first check-in today.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Two minutes now could save your semester. It's free.
          </p>
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            Create my account
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
