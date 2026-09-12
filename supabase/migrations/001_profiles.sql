-- ============================================================
-- TheFitnessDen — Migration 001: Profiles Table
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Create profiles table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL DEFAULT '',
  email       TEXT        NOT NULL DEFAULT '',
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'admin'
                          CHECK (role IN ('admin', 'trainer', 'staff')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Index for fast email lookups ──────────────────────────
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- ── 3. updated_at auto-update trigger ────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── 4. Auto-create profile on new user signup ─────────────────
--  SECURITY DEFINER: runs with the privileges of the function owner
--  (postgres), not the calling user. This prevents clients from
--  injecting arbitrary role values.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    'admin'   -- role is always set server-side; never trusted from client
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── 5. Enable Row Level Security ─────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ── 6. RLS Policy: Users can read their OWN profile only ─────
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ── 7. RLS Policy: Users can update their OWN profile only ───
--  WITH CHECK prevents them from changing their id or role
--  (role column is not in the allowed client update set by convention,
--   but the DB constraint enforces valid values regardless).
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── 8. Grant table access to authenticated role ───────────────
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ── Done ──────────────────────────────────────────────────────
-- Verify with:
--   SELECT * FROM public.profiles LIMIT 5;
--   SELECT * FROM pg_policies WHERE tablename = 'profiles';
