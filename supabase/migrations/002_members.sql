-- ============================================================
-- Migration 002: Members Table
-- TheFitnessDen
-- ============================================================

-- ── 1. Member ID sequence ─────────────────────────────────────
-- Safe incrementing sequence that survives concurrent inserts
CREATE SEQUENCE IF NOT EXISTS member_id_seq START WITH 1 INCREMENT BY 1;

-- Function to produce TFD-NNNN identifiers
CREATE OR REPLACE FUNCTION generate_member_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'TFD-' || LPAD(nextval('member_id_seq')::text, 4, '0');
END;
$$;

-- ── 2. members table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.members (
  id                      uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id               text         UNIQUE NOT NULL DEFAULT generate_member_id(),
  full_name               text         NOT NULL,
  email                   text,
  phone                   text,
  date_of_birth           date,
  gender                  text         CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address                 text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  profile_photo_url       text,
  height                  numeric      CHECK (height > 0),
  weight                  numeric      CHECK (weight > 0),
  fitness_goal            text         CHECK (fitness_goal IN (
                                         'weight_loss', 'muscle_gain', 'general_fitness',
                                         'strength', 'endurance'
                                       )),
  medical_notes           text,
  trainer_id              uuid,        -- will reference trainers(id) in a future migration
  status                  text         NOT NULL DEFAULT 'active'
                                       CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at              timestamptz  NOT NULL DEFAULT now(),
  updated_at              timestamptz  NOT NULL DEFAULT now()
);

-- ── 3. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS members_status_idx      ON public.members (status);
CREATE INDEX IF NOT EXISTS members_created_at_idx  ON public.members (created_at DESC);
CREATE INDEX IF NOT EXISTS members_full_name_idx   ON public.members USING gin (to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS members_email_idx       ON public.members (email) WHERE email IS NOT NULL;

-- ── 4. updated_at trigger ────────────────────────────────────
-- Reuse the same function defined in migration 001
CREATE TRIGGER members_set_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── 5. Row Level Security ────────────────────────────────────
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (gym staff/admins) may access member data
CREATE POLICY "Authenticated users can view members"
  ON public.members
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert members"
  ON public.members
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update members"
  ON public.members
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete members"
  ON public.members
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ── 6. Storage bucket for profile photos ────────────────────
-- Run this in Supabase Dashboard → Storage, or via the management API.
-- The SQL below is for reference; storage buckets are created via the
-- Supabase API / Dashboard, not standard SQL.
--
-- Bucket name:  member-photos
-- Public:       false  (serve via signed URL or Storage API)
-- File size:    5 MB max
-- MIME types:   image/jpeg, image/png, image/webp, image/gif
--
-- Storage RLS policy (add via Dashboard after creating the bucket):
--   Authenticated users can upload:
--     (bucket_id = 'member-photos' AND auth.role() = 'authenticated')
--   Authenticated users can read:
--     (bucket_id = 'member-photos' AND auth.role() = 'authenticated')

-- ── 7. Grant privileges to authenticated role ────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE member_id_seq TO authenticated;
