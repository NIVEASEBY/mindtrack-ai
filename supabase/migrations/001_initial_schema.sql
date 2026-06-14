-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  institution TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inputs JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  level TEXT NOT NULL CHECK (level IN ('Low', 'Moderate', 'High', 'Severe')),
  factors JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create check-ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create study plans table
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subjects JSONB NOT NULL,
  exam_date DATE NOT NULL,
  hours_per_day INTEGER NOT NULL,
  days JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON public.assessments(date DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_level ON public.assessments(level);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON public.check_ins(date DESC);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institution ON public.user_profiles(institution);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin without causing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (public.is_admin());

-- RLS Policies for assessments
DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessments;
CREATE POLICY "Users can view own assessments" ON public.assessments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
CREATE POLICY "Users can insert own assessments" ON public.assessments
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all assessments" ON public.assessments;
CREATE POLICY "Admins can view all assessments" ON public.assessments
  FOR SELECT USING (public.is_admin());

-- RLS Policies for check_ins
DROP POLICY IF EXISTS "Users can view own check_ins" ON public.check_ins;
CREATE POLICY "Users can view own check_ins" ON public.check_ins
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own check_ins" ON public.check_ins;
CREATE POLICY "Users can insert own check_ins" ON public.check_ins
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own check_ins" ON public.check_ins;
CREATE POLICY "Users can update own check_ins" ON public.check_ins
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all check_ins" ON public.check_ins;
CREATE POLICY "Admins can view all check_ins" ON public.check_ins
  FOR SELECT USING (public.is_admin());

-- RLS Policies for study_plans
DROP POLICY IF EXISTS "Users can view own study_plans" ON public.study_plans;
CREATE POLICY "Users can view own study_plans" ON public.study_plans
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own study_plans" ON public.study_plans;
CREATE POLICY "Users can insert own study_plans" ON public.study_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own study_plans" ON public.study_plans;
CREATE POLICY "Users can update own study_plans" ON public.study_plans
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all study_plans" ON public.study_plans;
CREATE POLICY "Admins can view all study_plans" ON public.study_plans
  FOR SELECT USING (public.is_admin());

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, student_id, institution)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'student_id', 'STU' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'institution', 'Unknown')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_plans_updated_at ON public.study_plans;
CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON public.study_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
