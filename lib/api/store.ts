import { useEffect, useState } from "react";

export type User = {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  institution: string;
};

export type AssessmentInputs = {
  sleepHours: number;
  stressLevel: number;
  studyHours: number;
  assignmentsDue: number;
  exerciseFrequency: number;
  screenTime: number;
  attendance: number;
  motivation: number;
  social: number;
};

export type Assessment = {
  id: string;
  date: string;
  inputs: AssessmentInputs;
  score: number;
  level: RiskLevel;
  factors: { label: string; contribution: number }[];
};

export type RiskLevel = "Low" | "Moderate" | "High" | "Severe";

export type CheckIn = { date: string; mood: 1 | 2 | 3 | 4 | 5 };

const KEYS = {
  user: "mt_user",
  users: "mt_users",
  assessments: "mt_assessments",
  checkins: "mt_checkins",
  plan: "mt_plan",
  theme: "mt_theme",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("mt:storage", { detail: { key } }));
}

function getScopedKey(baseKey: string): string {
  if (typeof window === "undefined") return baseKey;
  const userId = localStorage.getItem("mt_current_user_id");
  return userId ? `${baseKey}_${userId}` : baseKey;
}

export const store = {
  getUser: () => read<User | null>(KEYS.user, null),
  setUser: (u: User | null) => (u ? write(KEYS.user, u) : localStorage.removeItem(KEYS.user)),
  register: (u: User & { password: string }) => {
    const users = read<(User & { password: string })[]>(KEYS.users, []);
    if (users.find((x) => x.email === u.email)) throw new Error("Email already registered");
    users.push(u);
    write(KEYS.users, users);
    write(KEYS.user, { id: u.id, fullName: u.fullName, email: u.email, studentId: u.studentId, institution: u.institution });
  },
  login: (email: string, password: string) => {
    const users = read<(User & { password: string })[]>(KEYS.users, []);
    const found = users.find((x) => x.email === email && x.password === password);
    if (!found) throw new Error("Invalid email or password");
    write(KEYS.user, { id: found.id, fullName: found.fullName, email: found.email, studentId: found.studentId, institution: found.institution });
    return found;
  },
  logout: () => {
    localStorage.removeItem(KEYS.user);
    window.dispatchEvent(new CustomEvent("mt:storage", { detail: { key: KEYS.user } }));
  },
  getAssessments: () => read<Assessment[]>(getScopedKey(KEYS.assessments), []),
  addAssessment: (a: Assessment) => {
    const key = getScopedKey(KEYS.assessments);
    const all = read<Assessment[]>(key, []);
    all.unshift(a);
    write(key, all);

    // Sync to Supabase
    const userId = typeof window !== "undefined" ? localStorage.getItem("mt_current_user_id") : null;
    if (userId) {
      import("./store-supabase").then(({ addAssessment: supabaseAddAssessment }) => {
        supabaseAddAssessment({
          userId,
          date: a.date,
          inputs: a.inputs,
          score: a.score,
          level: a.level,
          factors: a.factors,
        }).catch((err) => console.error("Failed to sync assessment to Supabase:", err));
      });
    }
  },
  getCheckIns: () => read<CheckIn[]>(getScopedKey(KEYS.checkins), []),
  addCheckIn: (c: CheckIn) => {
    const key = getScopedKey(KEYS.checkins);
    const all = read<CheckIn[]>(key, []).filter((x) => x.date !== c.date);
    all.unshift(c);
    write(key, all);

    // Sync to Supabase
    const userId = typeof window !== "undefined" ? localStorage.getItem("mt_current_user_id") : null;
    if (userId) {
      import("./store-supabase").then(({ addCheckIn: supabaseAddCheckIn }) => {
        supabaseAddCheckIn({
          userId,
          date: c.date,
          mood: c.mood,
          notes: "",
        }).catch((err) => console.error("Failed to sync check-in to Supabase:", err));
      });
    }
  },
  getPlan: () => read<StudyPlan | null>(getScopedKey(KEYS.plan), null),
  setPlan: (p: StudyPlan) => {
    const key = getScopedKey(KEYS.plan);
    write(key, p);

    // Sync to Supabase
    const userId = typeof window !== "undefined" ? localStorage.getItem("mt_current_user_id") : null;
    if (userId) {
      import("./store-supabase").then(({ setPlan: supabaseSetPlan }) => {
        supabaseSetPlan(p, userId).catch((err) => console.error("Failed to sync study plan to Supabase:", err));
      });
    }
  },
};

export type StudyPlan = {
  createdAt: string;
  subjects: string[];
  examDate: string;
  hoursPerDay: number;
  days: { day: string; sessions: { time: string; subject: string; activity: string }[] }[];
};

export function useUser() {
  const [user, setUser] = useState<User | null>(() => store.getUser());
  useEffect(() => {
    const handler = () => setUser(store.getUser());
    window.addEventListener("mt:storage", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("mt:storage", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return user;
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(KEYS.theme) as "light" | "dark") || "light";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEYS.theme, theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
}

// Burnout prediction
export function predictBurnout(i: AssessmentInputs): { score: number; level: RiskLevel; factors: { label: string; contribution: number }[] } {
  const factors: { label: string; contribution: number }[] = [];
  let score = 0;

  const sleepContribution = Math.max(0, (7 - i.sleepHours) * 4);
  if (sleepContribution > 0) factors.push({ label: `Sleep ${i.sleepHours}h (below recommended)`, contribution: Math.round(sleepContribution) });
  score += sleepContribution;

  const stressContribution = i.stressLevel * 3;
  factors.push({ label: `Stress level ${i.stressLevel}/10`, contribution: Math.round(stressContribution) });
  score += stressContribution;

  const studyContribution = Math.max(0, (i.studyHours - 6) * 3);
  if (studyContribution > 0) factors.push({ label: `Heavy study load (${i.studyHours}h/day)`, contribution: Math.round(studyContribution) });
  score += studyContribution;

  const assignmentContribution = i.assignmentsDue * 2.5;
  if (assignmentContribution > 0) factors.push({ label: `${i.assignmentsDue} assignments due`, contribution: Math.round(assignmentContribution) });
  score += assignmentContribution;

  const exerciseDeficit = Math.max(0, (3 - i.exerciseFrequency) * 3);
  if (exerciseDeficit > 0) factors.push({ label: `Low exercise frequency`, contribution: Math.round(exerciseDeficit) });
  score += exerciseDeficit;

  const screenContribution = Math.max(0, (i.screenTime - 6) * 2);
  if (screenContribution > 0) factors.push({ label: `High screen time (${i.screenTime}h)`, contribution: Math.round(screenContribution) });
  score += screenContribution;

  const motivationContribution = (10 - i.motivation) * 2;
  if (motivationContribution > 0) factors.push({ label: `Low motivation (${i.motivation}/10)`, contribution: Math.round(motivationContribution) });
  score += motivationContribution;

  const socialContribution = Math.max(0, (5 - i.social) * 2);
  if (socialContribution > 0) factors.push({ label: `Limited social activity`, contribution: Math.round(socialContribution) });
  score += socialContribution;

  const attendanceContribution = Math.max(0, (80 - i.attendance) * 0.4);
  if (attendanceContribution > 0) factors.push({ label: `Attendance below 80%`, contribution: Math.round(attendanceContribution) });
  score += attendanceContribution;

  score = Math.min(100, Math.round(score));
  const level: RiskLevel = score < 30 ? "Low" : score < 55 ? "Moderate" : score < 75 ? "High" : "Severe";
  factors.sort((a, b) => b.contribution - a.contribution);
  return { score, level, factors: factors.slice(0, 5) };
}

export function recoveryPlan(level: RiskLevel, inputs: AssessmentInputs) {
  const today: string[] = [];
  const tomorrow: string[] = [];
  const week: string[] = [];

  if (inputs.sleepHours < 7) today.push("Sleep before 11 PM tonight — aim for 7–8 hours");
  if (inputs.stressLevel >= 7) today.push("Take a 10-minute breathing exercise");
  if (inputs.studyHours > 6) today.push("Cap study at 5h today, in 50/10 focus cycles");
  today.push("Drink water and step outside for a 15-minute walk");

  if (inputs.assignmentsDue > 2) tomorrow.push(`Prioritize the 2 most important of ${inputs.assignmentsDue} assignments`);
  tomorrow.push("Schedule a 1-hour deep work block in the morning");
  if (inputs.exerciseFrequency < 3) tomorrow.push("Add 20 minutes of light exercise");

  week.push("Plan 1 full rest day with no academic work");
  if (inputs.social < 5) week.push("Reach out to a friend or join a study group");
  if (level === "High" || level === "Severe") week.push("Consider talking to a counselor or mentor");
  week.push("Review your study plan and rebalance heavy subjects");

  return { today, tomorrow, week };
}

// Voice parsing — extract numeric values from natural speech
export function parseVoiceInput(text: string): Partial<AssessmentInputs> {
  const t = text.toLowerCase();
  const out: Partial<AssessmentInputs> = {};
  
  const num = (re: RegExp) => {
    const m = t.match(re);
    return m ? Number(m[1]) : undefined;
  };

  // Sleep hours
  const sleep = num(/sle(?:pt|ep)[^\d]*(\d+(?:\.\d+)?)/) || num(/(\d+(?:\.\d+)?)\s*h(?:our)?s?\s*sle(?:pt|ep)/);
  if (sleep !== undefined) out.sleepHours = sleep;

  // Stress level
  const stress = num(/stress[^\d]*(\d+)/) || num(/(\d+)\s*stress/);
  if (stress !== undefined) out.stressLevel = stress;

  // Daily study hours
  const study = num(/stud(?:y|ied|ying)[^\d]*(\d+(?:\.\d+)?)/) || num(/(\d+(?:\.\d+)?)\s*h(?:our)?s?\s*stud(?:y|ied|ying)/);
  if (study !== undefined) out.studyHours = study;

  // Assignments due (matches: "3 assignments" or "assignments due to 3" or "assignment due to 3")
  const assignments = num(/(\d+)\s*assignments?/) || num(/assignments?[^\d]*(\d+)/);
  if (assignments !== undefined) out.assignmentsDue = assignments;

  // Screen time
  const screen = num(/screen[^\d]*(\d+(?:\.\d+)?)/) || num(/(\d+(?:\.\d+)?)\s*screen/);
  if (screen !== undefined) out.screenTime = screen;

  // Exercise frequency
  const exercise = num(/exercise[^\d]*(\d+)/) || num(/(\d+)\s*exercise/);
  if (exercise !== undefined) out.exerciseFrequency = exercise;

  // Motivation level
  const motivation = num(/motivat[^\d]*(\d+)/) || num(/(\d+)\s*motivat/);
  if (motivation !== undefined) out.motivation = motivation;

  // Attendance (matches: "class attendance 95%", "attendance 95", "attend 95", etc.)
  const attendance = num(/attendance[^\d]*(\d+)/) || num(/attend[^\d]*(\d+)/) || num(/class[^\d]*(\d+)/);
  if (attendance !== undefined) out.attendance = attendance;

  // Social activity level (matches: "social level 7", "social 7", etc.)
  const social = num(/social[^\d]*(\d+)/) || num(/(\d+)\s*social/);
  if (social !== undefined) out.social = social;

  return out;
}

export function generateStudyPlan(subjects: string[], examDate: string, hoursPerDay: number, burnoutScore: number): StudyPlan {
  const adjusted = burnoutScore > 60 ? Math.max(2, hoursPerDay - 2) : hoursPerDay;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["09:00", "11:00", "14:00", "16:30", "19:00"];
  const out = days.map((day, di) => {
    const isRest = burnoutScore > 70 && day === "Sun";
    if (isRest) {
      return { day, sessions: [{ time: "All day", subject: "Rest day", activity: "Recovery, sleep, light walk" }] };
    }
    const sessions = [];
    const sessionCount = Math.min(slots.length, Math.max(1, Math.round(adjusted / 1.5)));
    for (let i = 0; i < sessionCount; i++) {
      const subject = subjects[(di + i) % subjects.length] || "Review";
      sessions.push({
        time: slots[i],
        subject,
        activity: i === sessionCount - 1 ? "Review & practice" : "Focused study (50/10)",
      });
    }
    return { day, sessions };
  });
  return { createdAt: new Date().toISOString(), subjects, examDate, hoursPerDay: adjusted, days: out };
}