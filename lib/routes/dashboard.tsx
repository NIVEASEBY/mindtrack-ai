import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { store, useUser } from "@/lib/store";
import { Activity, Calendar, HeartPulse, History, Mic, Smile } from "lucide-react";
import { RiskGauge } from "@/components/risk-gauge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MindTrack AI" }] }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

function Dashboard() {
  const { user } = useUser();
  const assessments = store.getAssessments();
  const latest = assessments[0];
  const checkins = store.getCheckIns();
  const todayCheck = checkins[0];
  const wellness = latest ? Math.max(0, 100 - latest.score) : null;

  if (!user) return null;

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Welcome back, {user.fullName.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's a quiet look at how you're doing today.</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* Burnout */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Today's burnout risk</h2>
              <Activity className="h-4 w-4 text-primary" aria-hidden />
            </div>
            {latest ? (
              <div className="flex flex-col items-center">
                <RiskGauge score={latest.score} level={latest.level} />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Based on your last check-in
                </p>
              </div>
            ) : (
              <EmptyAction label="No assessment yet" cta="Start one" to="/assessment" />
            )}
          </div>

          {/* Wellness score */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Wellness score</h2>
              <HeartPulse className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <div className="mt-2 text-5xl font-extrabold text-foreground">{wellness !== null ? wellness : "--"}</div>
            <p className="mt-1 text-sm text-muted-foreground">{wellness !== null ? "out of 100" : "no assessment yet"}</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${wellness !== null ? wellness : 0}%` }} />
            </div>
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Daily check-in</h3>
              {todayCheck ? (
                <p className="mt-2 text-sm text-foreground">You logged your mood today. Nice consistency.</p>
              ) : (
                <Link to="/checkin" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  <Smile className="h-4 w-4" /> How are you feeling today?
                </Link>
              )}
            </div>
          </div>

          {/* Recent + tasks */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Upcoming sessions</h2>
              <Calendar className="h-4 w-4 text-primary" aria-hidden />
            </div>
            {(() => {
              const plan = store.getPlan();
              if (!plan) return <EmptyAction label="No study plan yet" cta="Generate plan" to="/planner" />;
              const todaysSessions = plan.days[0]?.sessions ?? [];
              return (
                <ul className="space-y-3">
                  {todaysSessions.slice(0, 4).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-3 rounded-lg bg-secondary/40 p-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-card text-xs font-semibold text-primary">{s.time}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{s.subject}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.activity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="mt-10 text-lg font-semibold text-foreground">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickCard to="/assessment" icon={Mic} title="Start assessment" body="Form or voice — 2 minutes." />
          <QuickCard to="/planner" icon={Calendar} title="Generate study plan" body="Adapts to your energy." />
          <QuickCard to="/recovery" icon={HeartPulse} title="View recovery plan" body="Today, tomorrow, week." />
          <QuickCard to="/history" icon={History} title="View history" body="Track your trend." />
        </div>
      </section>
    </AppShell>
  );
}

function EmptyAction({ label, cta, to }: { label: string; cta: string; to: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Link to={to} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">{cta}</Link>
    </div>
  );
}

function QuickCard({ to, icon: Icon, title, body }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <Link to={to} className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </Link>
  );
}