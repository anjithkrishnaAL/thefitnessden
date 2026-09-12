-- TheFitnessDen: Notifications and Reminders
create sequence if not exists public.notification_id_seq;
create sequence if not exists public.reminder_id_seq;
create or replace function public.generate_notification_id() returns text language plpgsql security definer set search_path = public as $$ begin return 'NOT-' || lpad(nextval('public.notification_id_seq')::text, 4, '0'); end; $$;
create or replace function public.generate_reminder_id() returns text language plpgsql security definer set search_path = public as $$ begin return 'REM-' || lpad(nextval('public.reminder_id_seq')::text, 4, '0'); end; $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), notification_id text unique not null default public.generate_notification_id(), title text not null, message text not null,
  type text not null check (type in ('Membership Expiry','Payment','Attendance','New Member','Workout Plan','Progress','System')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  member_id uuid references public.members(id) on delete cascade, related_membership_id uuid references public.memberships(id) on delete cascade, related_payment_id uuid references public.payments(id) on delete cascade,
  is_read boolean not null default false, created_at timestamptz not null default now(), read_at timestamptz, dedupe_key text unique
);
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(), reminder_id text unique not null default public.generate_reminder_id(), title text not null, description text,
  reminder_type text not null check (reminder_type in ('Membership Renewal','Payment Follow-up','Progress Check','Workout Review','Member Follow-up','General')),
  member_id uuid references public.members(id) on delete cascade, due_date date not null, due_time time,
  status text not null default 'pending' check (status in ('pending','completed','cancelled')), priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists notifications_created_idx on public.notifications(created_at desc);
create index if not exists notifications_read_idx on public.notifications(is_read);
create index if not exists notifications_member_idx on public.notifications(member_id);
create index if not exists reminders_due_idx on public.reminders(due_date, status);
create index if not exists reminders_member_idx on public.reminders(member_id);
drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at before update on public.reminders for each row execute function public.set_updated_at();
alter table public.notifications enable row level security;
alter table public.reminders enable row level security;
drop policy if exists "Authenticated notifications access" on public.notifications;
create policy "Authenticated notifications access" on public.notifications for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated reminders access" on public.reminders;
create policy "Authenticated reminders access" on public.reminders for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.notifications, public.reminders to authenticated;
grant usage, select on sequence public.notification_id_seq, public.reminder_id_seq to authenticated;
notify pgrst, 'reload schema';
