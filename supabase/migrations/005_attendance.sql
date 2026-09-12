-- TheFitnessDen — Migration 005: Attendance

CREATE TABLE IF NOT EXISTS public.attendance (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in   timestamptz NOT NULL DEFAULT now(),
  check_out  timestamptz,
  date       date NOT NULL DEFAULT current_date,
  status     text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'completed', 'absent')),
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_checkout_after_checkin CHECK (check_out IS NULL OR check_out >= check_in)
);

CREATE INDEX IF NOT EXISTS attendance_member_id_idx ON public.attendance(member_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON public.attendance(date DESC);
CREATE INDEX IF NOT EXISTS attendance_check_in_idx ON public.attendance(check_in DESC);
CREATE INDEX IF NOT EXISTS attendance_status_idx ON public.attendance(status);
CREATE UNIQUE INDEX IF NOT EXISTS attendance_one_open_visit_per_member_idx
  ON public.attendance(member_id) WHERE check_out IS NULL;

DROP TRIGGER IF EXISTS attendance_set_updated_at ON public.attendance;
CREATE TRIGGER attendance_set_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view attendance" ON public.attendance;
CREATE POLICY "Authenticated users can view attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert attendance" ON public.attendance;
CREATE POLICY "Authenticated users can insert attendance"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update attendance" ON public.attendance;
CREATE POLICY "Authenticated users can update attendance"
  ON public.attendance FOR UPDATE TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete attendance" ON public.attendance;
CREATE POLICY "Authenticated users can delete attendance"
  ON public.attendance FOR DELETE TO authenticated
  USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
