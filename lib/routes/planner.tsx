import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateStudyPlan, store, type StudyPlan } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "AI study planner — MindTrack AI" }] }),
  component: () => (
    <RequireAuth>
      <Planner />
    </RequireAuth>
  ),
});

const SUGGESTED_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "History",
  "Geography",
  "Spanish",
  "French"
];

function Planner() {
  const [subjectList, setSubjectList] = useState<string[]>(() => {
    const savedPlan = store.getPlan();
    return savedPlan?.subjects && savedPlan.subjects.length > 0
      ? savedPlan.subjects
      : ["Mathematics", "Physics", "Chemistry"];
  });
  const [newSubject, setNewSubject] = useState("");
  
  const [examDate, setExamDate] = useState(() => {
    const savedPlan = store.getPlan();
    if (savedPlan?.examDate) return savedPlan.examDate.slice(0, 10);
    const d = new Date(); d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  });
  
  const [hours, setHours] = useState(() => {
    const savedPlan = store.getPlan();
    return savedPlan?.hoursPerDay ?? 5;
  });
  
  const [plan, setPlan] = useState<StudyPlan | null>(() => store.getPlan());

  const addSubject = (subjectName: string) => {
    const clean = subjectName.trim();
    if (!clean) return;
    if (subjectList.map(s => s.toLowerCase()).includes(clean.toLowerCase())) {
      toast.error(`${clean} is already added!`);
      return;
    }
    setSubjectList(prev => [...prev, clean]);
    setNewSubject("");
  };

  const removeSubject = (index: number) => {
    setSubjectList(prev => prev.filter((_, i) => i !== index));
  };

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectList.length) { 
      toast.error("Please add at least one subject"); 
      return; 
    }
    const latest = store.getAssessments()[0];
    const score = latest?.score ?? 30;
    const newPlan = generateStudyPlan(subjectList, examDate, hours, score);
    store.setPlan(newPlan);
    setPlan(newPlan);
    toast.success(score > 60 ? "Plan generated — load reduced for recovery." : "Study plan ready!");
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">AI study planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">We'll adapt your plan to your current burnout risk.</p>

        <form onSubmit={handle} className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6 md:grid-cols-3">
          <div className="md:col-span-3">
            <Label htmlFor="subject-input">Subjects</Label>
            
            {/* Added subjects badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {subjectList.map((sub, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary border border-primary/20"
                >
                  {sub}
                  <button
                    type="button"
                    onClick={() => removeSubject(idx)}
                    className="rounded-full hover:bg-primary/20 p-0.5 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {subjectList.length === 0 && (
                <span className="text-sm text-muted-foreground italic">No subjects added yet. Add some below!</span>
              )}
            </div>

            {/* Input field to add custom subject */}
            <div className="mt-3 flex gap-2">
              <Input 
                id="subject-input" 
                placeholder="Type a subject or language (e.g. History, Spanish, English)" 
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubject(newSubject);
                  }
                }}
                className="min-h-11"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => addSubject(newSubject)}
                className="min-h-11 px-4"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {/* Suggested quick-add subjects */}
            <div className="mt-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Add Suggestions:</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SUGGESTED_SUBJECTS.map((sub) => {
                  const alreadyAdded = subjectList.map(s => s.toLowerCase()).includes(sub.toLowerCase());
                  return (
                    <button
                      key={sub}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addSubject(sub)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition ${
                        alreadyAdded 
                          ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50" 
                          : "bg-background text-foreground border-border hover:bg-secondary"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="exam">Exam date</Label>
            <Input id="exam" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="mt-1.5 min-h-11" />
          </div>
          <div>
            <Label htmlFor="hours">Hours per day</Label>
            <Input id="hours" type="number" min={1} max={12} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-1.5 min-h-11" />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full min-h-11">Generate plan</Button>
          </div>
        </form>

        {plan && (
          <div className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">This week</h2>
              <p className="text-sm text-muted-foreground">{plan.hoursPerDay}h/day · exam {new Date(plan.examDate).toLocaleDateString()}</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {plan.days.map((d) => (
                <div key={d.day} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-primary">{d.day}</h3>
                  <ul className="mt-3 space-y-2">
                    {d.sessions.map((s, i) => (
                      <li key={i} className="rounded-lg bg-secondary/40 p-2.5">
                        <p className="text-xs font-semibold text-muted-foreground">{s.time}</p>
                        <p className="text-sm font-medium text-foreground">{s.subject}</p>
                        <p className="text-xs text-muted-foreground">{s.activity}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}