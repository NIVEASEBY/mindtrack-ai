import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { store } from "@/lib/store";
import { Award, TrendingDown, TrendingUp, Minus } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Wellness history — MindTrack AI" }] }),
  component: () => (
    <RequireAuth>
      <History />
    </RequireAuth>
  ),
});

function History() {
  const all = store.getAssessments().slice().reverse(); // oldest -> newest for chart
  const max = 100;
  const trend = (() => {
    if (all.length < 2) return { label: "Stable", icon: Minus, color: "text-muted-foreground" };
    const last = all[all.length - 1].score;
    const prev = all[all.length - 2].score;
    if (last < prev - 3) return { label: "Improving", icon: TrendingDown, color: "text-[color:var(--risk-low)]" };
    if (last > prev + 3) return { label: "Declining", icon: TrendingUp, color: "text-[color:var(--risk-high)]" };
    return { label: "Stable", icon: Minus, color: "text-muted-foreground" };
  })();

  const width = 600, height = 200, padX = 30, padY = 20;
  const points = all.map((a, i) => {
    const x = padX + (all.length === 1 ? width / 2 : (i / (all.length - 1)) * (width - padX * 2));
    const y = height - padY - (a.score / max) * (height - padY * 2);
    return { x, y, a };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const badges = computeBadges(all.length, all);

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Wellness history</h1>
        <p className="mt-1 text-sm text-muted-foreground">A quiet log of how you've been showing up.</p>

        {all.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-muted-foreground">No history yet. Your first assessment will show here.</p>
            <Link to="/assessment" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">Take assessment</Link>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Burnout trend</h2>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${trend.color}`}>
                    <trend.icon className="h-4 w-4" /> {trend.label}
                  </span>
                </div>
                <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" role="img" aria-label="Burnout score over time">
                  <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="var(--color-border)" />
                  <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--color-primary)" />
                  ))}
                </svg>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Badges</h2>
                <ul className="mt-4 space-y-3">
                  {badges.map((b) => (
                    <li key={b.title} className={`flex items-center gap-3 rounded-xl p-3 ${b.earned ? "bg-accent/60" : "bg-secondary/40 opacity-60"}`}>
                      <span className={`grid h-10 w-10 place-items-center rounded-xl ${b.earned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Award className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{b.title}</p>
                        <p className="text-xs text-muted-foreground">{b.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <h2 className="mt-10 text-lg font-semibold text-foreground">Past assessments</h2>
            <ul className="mt-4 space-y-3">
              {store.getAssessments().map((a) => (
                <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{new Date(a.date).toLocaleString()}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.factors.slice(0, 2).map((f) => f.label).join(" · ") || "Balanced day"}</p>
                  </div>
                  <div className="shrink-0 text-right sm:ml-auto">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{a.score}</p>
                    <p className="text-xs font-medium text-muted-foreground">{a.level}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </AppShell>
  );
}

function computeBadges(count: number, all: { score: number }[]) {
  return [
    { title: "Healthy study streak", body: "3+ assessments logged", earned: count >= 3 },
    { title: "Stress reducer", body: "Lower score than last time", earned: all.length >= 2 && all[all.length - 1].score < all[all.length - 2].score },
    { title: "Consistent learner", body: "5+ assessments", earned: count >= 5 },
    { title: "Wellness champion", body: "A score below 30", earned: all.some((a) => a.score < 30) },
  ];
}