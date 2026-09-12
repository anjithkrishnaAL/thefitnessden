-- TheFitnessDen — Migration 004: Payment records

CREATE TABLE IF NOT EXISTS public.payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  membership_id  uuid REFERENCES public.memberships(id) ON DELETE SET NULL,
  amount         numeric(10,2) NOT NULL CHECK (amount >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer')),
  payment_date   date NOT NULL DEFAULT current_date,
  status         text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  transaction_id text,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_member_id_idx ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS payments_membership_id_idx ON public.payments(membership_id);
CREATE INDEX IF NOT EXISTS payments_payment_date_idx ON public.payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_transaction_id_idx ON public.payments(transaction_id) WHERE transaction_id IS NOT NULL;

DROP TRIGGER IF EXISTS payments_set_updated_at ON public.payments;
CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
CREATE POLICY "Authenticated users can view payments"
  ON public.payments FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.payments;
CREATE POLICY "Authenticated users can insert payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update payments" ON public.payments;
CREATE POLICY "Authenticated users can update payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete payments" ON public.payments;
CREATE POLICY "Authenticated users can delete payments"
  ON public.payments FOR DELETE TO authenticated
  USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
