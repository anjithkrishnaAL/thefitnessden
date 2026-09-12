-- TheFitnessDen: members table and member photo storage setup
-- Run this once in Supabase Dashboard -> SQL Editor.
-- This script is idempotent and does not use service_role from the frontend.

-- Required by the profile migration and members updated_at trigger.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Safe, concurrency-friendly member identifiers: TFD-0001, TFD-0002, ...
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'TFD-' || LPAD(nextval('public.member_id_seq')::text, 4, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS public.members (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id               text UNIQUE NOT NULL DEFAULT public.generate_member_id(),
  full_name               text NOT NULL,
  email                   text,
  phone                   text,
  date_of_birth           date,
  gender                  text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address                 text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  profile_photo_url       text,
  height                  numeric CHECK (height > 0),
  weight                  numeric CHECK (weight > 0),
  fitness_goal            text CHECK (fitness_goal IN (
    'weight_loss', 'muscle_gain', 'general_fitness', 'strength', 'endurance'
  )),
  medical_notes           text,
  status                  text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS members_status_idx ON public.members (status);
CREATE INDEX IF NOT EXISTS members_created_at_idx ON public.members (created_at DESC);
CREATE INDEX IF NOT EXISTS members_full_name_idx
  ON public.members USING gin (to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS members_email_idx
  ON public.members (email) WHERE email IS NOT NULL;

DROP TRIGGER IF EXISTS members_set_updated_at ON public.members;
CREATE TRIGGER members_set_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
CREATE POLICY "Authenticated users can view members"
  ON public.members FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert members" ON public.members;
CREATE POLICY "Authenticated users can insert members"
  ON public.members FOR INSERT TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update members" ON public.members;
CREATE POLICY "Authenticated users can update members"
  ON public.members FOR UPDATE TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.members;
CREATE POLICY "Authenticated users can delete members"
  ON public.members FOR DELETE TO authenticated
  USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.member_id_seq TO authenticated;

-- Private bucket: authenticated users access objects through Storage RLS.
-- ON CONFLICT avoids creating a duplicate bucket.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-photos',
  'member-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Do not disable RLS on storage.objects. These policies grant access only
-- to authenticated users and only inside the member-photos bucket.
DROP POLICY IF EXISTS "Authenticated users can upload member photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload member photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read member photos" ON storage.objects;
CREATE POLICY "Authenticated users can read member photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'member-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update member photos" ON storage.objects;
CREATE POLICY "Authenticated users can update member photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'member-photos' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'member-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete member photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete member photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'member-photos' AND auth.role() = 'authenticated');

-- Verification queries: run after the script if desired.
SELECT to_regclass('public.members') AS members_table;
SELECT id, name, public FROM storage.buckets WHERE id = 'member-photos';
SELECT relrowsecurity AS members_rls_enabled
FROM pg_class
WHERE oid = 'public.members'::regclass;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'members' OR (schemaname = 'storage' AND tablename = 'objects' AND policyname ILIKE '%member%');
