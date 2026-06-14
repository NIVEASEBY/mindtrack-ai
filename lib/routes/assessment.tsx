import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { parseVoiceInput, predictBurnout, store, type AssessmentInputs } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment")({
  head: () => ({ meta: [{ title: "Burnout assessment — MindTrack AI" }] }),
  component: () => (
    <RequireAuth>
      <Assessment />
    </RequireAuth>
  ),
});

const defaults: AssessmentInputs = {
  sleepHours: 7, stressLevel: 5, studyHours: 4, assignmentsDue: 2,
  exerciseFrequency: 3, screenTime: 5, attendance: 85, motivation: 6, social: 5,
};

function Assessment() {
  const [values, setValues] = useState<AssessmentInputs>(defaults);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const navigate = useNavigate();
  const recognitionRef = useRef<unknown>(null);

  const set = <K extends keyof AssessmentInputs>(k: K, v: number) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const toggleVoice = () => {
    type SR = { new (): { lang: string; interimResults: boolean; continuous: boolean; onresult: (e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void; onerror: (e: unknown) => void; onend: () => void; start: () => void; stop: () => void } };
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
      if (isFirefox) {
        toast.error("Voice input is not supported by default in Firefox. Please try Google Chrome, Microsoft Edge, or Safari for voice features.");
      } else {
        toast.error("Voice input isn't supported in this browser. Please try Chrome, Edge, or Safari.");
      }
      return;
    }
    if (listening) {
      const r = recognitionRef.current as { stop: () => void } | null;
      r?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (e) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
      setTranscript(full);
      const parsed = parseVoiceInput(full);
      if (Object.keys(parsed).length) setValues((prev) => ({ ...prev, ...parsed }));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = predictBurnout(values);
    const assessment = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      inputs: values,
      ...result,
    };
    store.addAssessment(assessment);
    toast.success("Assessment saved. Email report sent.");
    navigate({ to: "/recovery" });
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Burnout assessment</h1>
        <p className="mt-1 text-sm text-muted-foreground">Answer the form below or describe your day using voice.</p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={listening}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-full shadow-soft transition ${listening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary text-primary-foreground hover:opacity-90"}`}
            >
              {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground">Talk to MindTrack</h2>
              <p className="text-xs text-muted-foreground">
                Try: "I slept 5 hours, my stress is 8, I have 4 assignments due and studied 7 hours."
              </p>
              {transcript && (
                <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm text-foreground">{transcript}</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <SliderField id="sleepHours" label="Sleep hours (last night)" min={0} max={12} step={0.5} value={values.sleepHours} onChange={(v) => set("sleepHours", v)} suffix="h" />
          <SliderField id="stressLevel" label="Stress level" min={1} max={10} value={values.stressLevel} onChange={(v) => set("stressLevel", v)} suffix="/10" />
          <SliderField id="studyHours" label="Daily study hours" min={0} max={14} step={0.5} value={values.studyHours} onChange={(v) => set("studyHours", v)} suffix="h" />
          <SliderField id="assignmentsDue" label="Assignments due this week" min={0} max={15} value={values.assignmentsDue} onChange={(v) => set("assignmentsDue", v)} />
          <SliderField id="exerciseFrequency" label="Exercise sessions per week" min={0} max={7} value={values.exerciseFrequency} onChange={(v) => set("exerciseFrequency", v)} />
          <SliderField id="screenTime" label="Screen time (hours/day)" min={0} max={16} step={0.5} value={values.screenTime} onChange={(v) => set("screenTime", v)} suffix="h" />
          <SliderField id="attendance" label="Class attendance" min={0} max={100} step={5} value={values.attendance} onChange={(v) => set("attendance", v)} suffix="%" />
          <SliderField id="motivation" label="Motivation level" min={1} max={10} value={values.motivation} onChange={(v) => set("motivation", v)} suffix="/10" />
          <SliderField id="social" label="Social activity level" min={1} max={10} value={values.social} onChange={(v) => set("social", v)} suffix="/10" />

          <Button type="submit" className="mt-2 min-h-12 text-base">
            <Sparkles className="mr-2 h-4 w-4" /> Predict my burnout risk
          </Button>
        </form>
      </section>
    </AppShell>
  );
}

function SliderField({
  id, label, min, max, step = 1, value, onChange, suffix,
}: { id: string; label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-semibold text-foreground tabular-nums">{value}{suffix}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
}