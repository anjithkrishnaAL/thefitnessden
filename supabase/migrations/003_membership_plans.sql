-- TheFitnessDen — Migration 003: Membership plans and member memberships

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  duration_months integer NOT NULL CHECK (duration_months > 0),
  price           numeric(10,2) NOT NULL CHECK (price >= 0),
  description     text,
  features        jsonb NOT NULL DEFAULT '[]'::jsonb,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memberships (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  uuid NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  plan_id    uuid NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date   date NOT NULL,
  price      numeric(10,2) NOT NULL CHECK (price >= 0),
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memberships_dates_valid CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS membership_plans_status_idx ON public.membership_plans(status);
CREATE INDEX IF NOT EXISTS memberships_member_id_idx ON public.memberships(member_id);
CREATE INDEX IF NOT EXISTS memberships_plan_id_idx ON public.memberships(plan_id);
CREATE INDEX IF NOT EXISTS memberships_status_idx ON public.memberships(status);
CREATE INDEX IF NOT EXISTS memberships_end_date_idx ON public.memberships(end_date);

DROP TRIGGER IF EXISTS membership_plans_set_updated_at ON public.membership_plans;
CREATE TRIGGER membership_plans_set_updated_at
  BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS memberships_set_updated_at ON public.memberships;
CREATE TRIGGER memberships_set_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view membership plans" ON public.membership_plans;
CREATE POLICY "Authenticated users can view membership plans"
  ON public.membership_plans FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage membership plans" ON public.membership_plans;
CREATE POLICY "Authenticated users can manage membership plans"
  ON public.membership_plans FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view memberships" ON public.memberships;
CREATE POLICY "Authenticated users can view memberships"
  ON public.memberships FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage memberships" ON public.memberships;
CREATE POLICY "Authenticated users can manage memberships"
  ON public.memberships FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.membership_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
