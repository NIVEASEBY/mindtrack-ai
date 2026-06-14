import { supabase } from '../supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export type User = {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  institution: string;
  isAdmin?: boolean;
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
  userId: string;
  date: string;
  inputs: AssessmentInputs;
  score: number;
  level: RiskLevel;
  factors: { label: string; contribution: number }[];
};

export type RiskLevel = "Low" | "Moderate" | "High" | "Severe";

export type CheckIn = { 
  id: string;
  userId: string;
  date: string; 
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
};

export type StudyPlan = {
  id: string;
  userId: string;
  createdAt: string;
  subjects: string[];
  examDate: string;
  hoursPerDay: number;
  days: { day: string; sessions: { time: string; subject: string; activity: string }[] }[];
};

// Get current user from Supabase Auth
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // Try to create the profile on the fly if it's missing (e.g. trigger didn't run or user created before migration)
    const newProfile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || 'User',
      student_id: user.user_metadata?.student_id || 'STU-' + user.id.substring(0, 8),
      institution: user.user_metadata?.institution || 'Unknown',
    };

    const { data: insertedProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile on the fly:', insertError);
      return null;
    }

    return {
      id: insertedProfile.id,
      fullName: insertedProfile.full_name,
      email: insertedProfile.email,
      studentId: insertedProfile.student_id,
      institution: insertedProfile.institution,
      isAdmin: insertedProfile.is_admin,
    };
  }

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    studentId: profile.student_id,
    institution: profile.institution,
    isAdmin: profile.is_admin,
  };
}

// User operations
export async function register(userData: User & { password: string }): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        full_name: userData.fullName,
        student_id: userData.studentId,
        institution: userData.institution,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Registration failed');

  return {
    id: data.user.id,
    fullName: userData.fullName,
    email: userData.email,
    studentId: userData.studentId,
    institution: userData.institution,
  };
}

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Login failed');

  const profile = await getCurrentUser();
  if (!profile) throw new Error('Failed to fetch user profile');

  return profile;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// Assessment operations
export async function getAssessments(userId: string): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(a => ({
    id: a.id,
    userId: a.user_id,
    date: a.date,
    inputs: a.inputs as AssessmentInputs,
    score: a.score,
    level: a.level as RiskLevel,
    factors: a.factors as { label: string; contribution: number }[],
  }));
}

export async function addAssessment(assessment: Omit<Assessment, 'id'>): Promise<Assessment> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: assessment.userId,
      date: assessment.date,
      inputs: assessment.inputs,
      score: assessment.score,
      level: assessment.level,
      factors: assessment.factors,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create assessment');

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    inputs: data.inputs as AssessmentInputs,
    score: data.score,
    level: data.level as RiskLevel,
    factors: data.factors as { label: string; contribution: number }[],
  };
}

// Check-in operations
export async function getCheckIns(userId: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(c => ({
    id: c.id,
    userId: c.user_id,
    date: c.date,
    mood: c.mood as 1 | 2 | 3 | 4 | 5,
    notes: c.notes,
  }));
}

export async function addCheckIn(checkIn: Omit<CheckIn, 'id'>): Promise<CheckIn> {
  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: checkIn.userId,
      date: checkIn.date,
      mood: checkIn.mood,
      notes: checkIn.notes,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create check-in');

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    mood: data.mood as 1 | 2 | 3 | 4 | 5,
    notes: data.notes,
  };
}

// Study plan operations
export async function getPlan(userId: string): Promise<StudyPlan | null> {
  const { data, error } = await supabase
    .from('study_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    subjects: data.subjects as string[],
    examDate: data.exam_date,
    hoursPerDay: data.hours_per_day,
    days: data.days as { day: string; sessions: { time: string; subject: string; activity: string }[] }[],
  };
}

export async function setPlan(plan: Omit<StudyPlan, 'id' | 'userId'>, userId: string): Promise<StudyPlan> {
  const { data, error } = await supabase
    .from('study_plans')
    .insert({
      user_id: userId,
      created_at: plan.createdAt,
      subjects: plan.subjects,
      exam_date: plan.examDate,
      hours_per_day: plan.hoursPerDay,
      days: plan.days,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create study plan');

  return {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    subjects: data.subjects as string[],
    examDate: data.exam_date,
    hoursPerDay: data.hours_per_day,
    days: data.days as { day: string; sessions: { time: string; subject: string; activity: string }[] }[],
  };
}

// Admin operations
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(u => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    studentId: u.student_id,
    institution: u.institution,
    isAdmin: u.is_admin,
  }));
}

export async function getAllAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*, user_profiles(full_name, email)')
    .order('date', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(a => ({
    id: a.id,
    userId: a.user_id,
    date: a.date,
    inputs: a.inputs as AssessmentInputs,
    score: a.score,
    level: a.level as RiskLevel,
    factors: a.factors as { label: string; contribution: number }[],
  }));
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId);

  if (error) throw error;
}

// Real-time subscription helper
export function subscribeToAssessments(userId: string, callback: (assessments: Assessment[]) => void): RealtimeChannel {
  return supabase
    .channel('assessments_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'assessments',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const assessments = await getAssessments(userId);
        callback(assessments);
      }
    )
    .subscribe();
}

export function subscribeToCheckIns(userId: string, callback: (checkIns: CheckIn[]) => void): RealtimeChannel {
  return supabase
    .channel('check_ins_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'check_ins',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const checkIns = await getCheckIns(userId);
        callback(checkIns);
      }
    )
    .subscribe();
}

export async function syncSupabaseToLocalStorage(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const [assessments, checkins, plan] = await Promise.all([
      getAssessments(userId),
      getCheckIns(userId),
      getPlan(userId),
    ]);

    localStorage.setItem(`mt_assessments_${userId}`, JSON.stringify(assessments));
    localStorage.setItem(`mt_checkins_${userId}`, JSON.stringify(checkins.map(c => ({ date: c.date, mood: c.mood }))));
    if (plan) {
      localStorage.setItem(`mt_plan_${userId}`, JSON.stringify(plan));
    } else {
      localStorage.removeItem(`mt_plan_${userId}`);
    }
  } catch (error) {
    console.error("Failed to sync Supabase data to localStorage cache:", error);
  }
}

// React hooks for Supabase
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            localStorage.setItem("mt_current_user_id", currentUser.id);
            await syncSupabaseToLocalStorage(currentUser.id);
            window.dispatchEvent(new CustomEvent("mt:storage", { detail: { key: "mt_user" } }));
          } else {
            localStorage.removeItem("mt_current_user_id");
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            localStorage.setItem("mt_current_user_id", currentUser.id);
            await syncSupabaseToLocalStorage(currentUser.id);
            window.dispatchEvent(new CustomEvent("mt:storage", { detail: { key: "mt_user" } }));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          localStorage.removeItem("mt_current_user_id");
          window.dispatchEvent(new CustomEvent("mt:storage", { detail: { key: "mt_user" } }));
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("mt_theme") as "light" | "dark") || "light";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("mt_theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
}
