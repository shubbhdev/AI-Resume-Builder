-- supabase/migrations/001_initial_schema.sql
-- CareerAI initial database schema

-- ─────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────
CREATE TYPE subscription_plan   AS ENUM ('free', 'trial', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');
CREATE TYPE billing_interval    AS ENUM ('monthly', 'annual');
CREATE TYPE interview_type      AS ENUM ('behavioral', 'technical', 'frontend', 'react', 'system_design');
CREATE TYPE application_status  AS ENUM (
  'bookmarked', 'applied', 'phone_screen',
  'interview', 'offer', 'rejected', 'withdrawn'
);

-- ─────────────────────────────────────────────────────────
-- TABLE: profiles
-- Auto-created on signup via trigger
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  email         TEXT NOT NULL,
  phone         TEXT,
  linkedin_url  TEXT,
  website_url   TEXT,
  location      TEXT,
  bio           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- TABLE: subscriptions
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                 subscription_plan   NOT NULL DEFAULT 'trial',
  status               subscription_status NOT NULL DEFAULT 'active',
  billing_interval     billing_interval,
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_sub_id      TEXT,
  amount_paise         INTEGER,
  trial_ends_at        TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────────────────────
-- TABLE: resumes
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.resumes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'My Resume',
  template    TEXT NOT NULL DEFAULT 'modern',
  content     JSONB NOT NULL DEFAULT '{}',
  is_primary  BOOLEAN DEFAULT FALSE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- TABLE: ats_scans
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.ats_scans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id        UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  job_description  TEXT,
  overall_score    INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  scores           JSONB NOT NULL DEFAULT '{}',
  keywords_found   TEXT[],
  keywords_missing TEXT[],
  suggestions      JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- TABLE: cover_letters
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.cover_letters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id       UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  title           TEXT NOT NULL DEFAULT 'Cover Letter',
  company_name    TEXT,
  job_title       TEXT,
  job_description TEXT,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- TABLE: interview_sessions
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.interview_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  type          interview_type NOT NULL DEFAULT 'behavioral',
  total_score   INTEGER,
  max_score     INTEGER,
  completed     BOOLEAN DEFAULT FALSE NOT NULL,
  duration_secs INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at  TIMESTAMPTZ
);

CREATE TABLE public.interview_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  user_answer TEXT,
  ai_feedback TEXT,
  score       INTEGER CHECK (score BETWEEN 0 AND 10),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- TABLE: job_applications
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.job_applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id      UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  company_name   TEXT NOT NULL,
  job_title      TEXT NOT NULL,
  job_url        TEXT,
  location       TEXT,
  salary_range   TEXT,
  status         application_status DEFAULT 'applied' NOT NULL,
  applied_date   DATE,
  follow_up_date DATE,
  notes          TEXT,
  contacts       JSONB DEFAULT '[]' NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_scans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications  ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users own their profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- Subscriptions
CREATE POLICY "Users own their subscription"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Resumes
CREATE POLICY "Users own their resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id);

-- ATS Scans
CREATE POLICY "Users own their scans"
  ON public.ats_scans FOR ALL
  USING (auth.uid() = user_id);

-- Cover Letters
CREATE POLICY "Users own their cover letters"
  ON public.cover_letters FOR ALL
  USING (auth.uid() = user_id);

-- Interview Sessions
CREATE POLICY "Users own their sessions"
  ON public.interview_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Interview Answers (via session ownership)
CREATE POLICY "Users own answers via session"
  ON public.interview_answers FOR ALL
  USING (
    auth.uid() = (
      SELECT user_id FROM public.interview_sessions WHERE id = session_id
    )
  );

-- Job Applications
CREATE POLICY "Users own their job applications"
  ON public.job_applications FOR ALL
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────
-- TRIGGER: Auto-create profile + trial subscription on signup
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create 7-day trial subscription
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (
    NEW.id,
    'trial',
    'active',
    NOW() + INTERVAL '7 days'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────
-- TRIGGER: Auto-update updated_at timestamps
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON public.cover_letters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────────────────
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_ats_scans_user_id ON public.ats_scans(user_id);
CREATE INDEX idx_cover_letters_user_id ON public.cover_letters(user_id);
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
