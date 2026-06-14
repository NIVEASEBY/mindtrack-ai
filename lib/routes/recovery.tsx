import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { RiskGauge } from "@/components/risk-gauge";
import { recoveryPlan, store } from "@/lib/store";
import { CalendarDays, Check, Sun, Sunrise } from "lucide-react";

export const Route = createFileRoute("/recovery")({
  head: () => ({ meta: [{ title: "Recovery plan — MindTrack AI" }] }),
  component: () => (
    <RequireAuth>
      <Recovery />
    </RequireAuth>
  ),
});

function Recovery() {
  const latest = store.getAssessments()[0];

  if (!latest) {
    return (
      <AppShell>
        <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-2xl font-bold text-foreground">No assessment yet</h1>
          <p className="mt-2 text-muted-foreground">Take your first burnout check to see a personalized recovery plan.</p>
          <Link to="/assessment" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground">
            Start assessment
          </Link>
        </section>
      </AppShell>
    );
  }

  const plan = recoveryPlan(latest.level, latest.inputs);

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Your recovery plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generated from your latest assessment on {new Date(latest.date).toLocaleString()}.</p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[auto_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-col items-center">
              <RiskGauge score={latest.score} level={latest.level} />
              <p className="mt-3 text-center text-sm text-muted-foreground">Burnout risk: <span className="font-semibold text-foreground">{latest.level}</span></p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Why your risk is at {latest.score}</h2>
            <ul className="mt-4 space-y-3">
              {latest.factors.map((f, i) => (
                <li key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{f.label}</span>
                    <span className="font-semibold text-foreground tabular-nums">+{f.contribution}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, f.contribution * 2)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <PlanCard icon={Sun} title="Today" items={plan.today} tint="primary" />
          <PlanCard icon={Sunrise} title="Tomorrow" items={plan.tomorrow} tint="accent" />
          <PlanCard icon={CalendarDays} title="This week" items={plan.week} tint="secondary" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/planner" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">Generate matching study plan</Link>
          <Link to="/history" className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary/50">See history</Link>
        </div>
      </section>
    </AppShell>
  );
}

function PlanCard({
  icon: Icon, title, items, tint,
}: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[]; tint: "primary" | "accent" | "secondary" }) {
  const tintClass = tint === "primary" ? "bg-primary/15 text-primary" : tint === "accent" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tintClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}