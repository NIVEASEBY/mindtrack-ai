import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { store, type CheckIn } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkin")({
  head: () => ({ meta: [{ title: "Daily check-in — MindTrack AI" }] }),
  component: () => (
    <RequireAuth>
      <CheckInPage />
    </RequireAuth>
  ),
});

const moods: { mood: CheckIn["mood"]; emoji: string; label: string }[] = [
  { mood: 5, emoji: "😊", label: "Great" },
  { mood: 4, emoji: "🙂", label: "Good" },
  { mood: 3, emoji: "😐", label: "Okay" },
  { mood: 2, emoji: "😞", label: "Stressed" },
  { mood: 1, emoji: "😣", label: "Exhausted" },
];

function CheckInPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [recent, setRecent] = useState(store.getCheckIns().slice(0, 7));

  const submit = (mood: CheckIn["mood"]) => {
    store.addCheckIn({ date: today, mood });
    setRecent(store.getCheckIns().slice(0, 7));
    toast.success("Check-in saved. Thanks for taking care of yourself.");
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">How are you feeling today?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tap one — it'll only take a second.</p>

        <div className="mt-6 grid grid-cols-5 gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft sm:gap-3 sm:p-6">
          {moods.map((m) => (
            <button
              key={m.mood}
              onClick={() => submit(m.mood)}
              className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl bg-secondary/40 p-2 text-center transition hover:scale-105 hover:bg-accent"
              aria-label={`I feel ${m.label}`}
            >
              <span className="text-3xl sm:text-4xl" aria-hidden>{m.emoji}</span>
              <span className="text-xs font-medium text-foreground">{m.label}</span>
            </button>
          ))}
        </div>

        <h2 className="mt-10 text-lg font-semibold text-foreground">Last 7 check-ins</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing yet — your first one starts the streak.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((c) => {
              const m = moods.find((x) => x.mood === c.mood)!;
              return (
                <li key={c.date} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft">
                  <span className="text-2xl" aria-hidden>{m.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.date).toDateString()}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}