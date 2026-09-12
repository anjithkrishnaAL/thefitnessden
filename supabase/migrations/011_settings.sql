-- TheFitnessDen: Gym settings and user notification preferences
create table if not exists public.gym_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null default 'default' unique,
  gym_name text not null default 'TheFitnessDen',
  tagline text default 'Train. Track. Transform.',
  email text, phone text, address text, city text, state text, country text, postal_code text, website text, logo_url text,
  currency text not null default 'INR', timezone text not null default 'Asia/Kolkata',
  default_membership_duration integer not null default 1, default_payment_method text not null default 'cash', default_member_status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(), user_id uuid unique not null references auth.users(id) on delete cascade,
  membership_expiry boolean not null default true, payment_notifications boolean not null default true, new_member_notifications boolean not null default true,
  workout_plan_notifications boolean not null default true, progress_notifications boolean not null default true, reminder_notifications boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into public.gym_settings (singleton_key) values ('default') on conflict (singleton_key) do nothing;
drop trigger if exists gym_settings_set_updated_at on public.gym_settings;
create trigger gym_settings_set_updated_at before update on public.gym_settings for each row execute function public.set_updated_at();
drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at before update on public.notification_preferences for each row execute function public.set_updated_at();
alter table public.gym_settings enable row level security;
alter table public.notification_preferences enable row level security;
drop policy if exists "Authenticated gym settings access" on public.gym_settings;
create policy "Authenticated gym settings access" on public.gym_settings for all to authenticated using (true) with check (true);
drop policy if exists "Users own notification preferences" on public.notification_preferences;
create policy "Users own notification preferences" on public.notification_preferences for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.gym_settings, public.notification_preferences to authenticated;
insert into storage.buckets (id, name, public) values ('gym-assets', 'gym-assets', false) on conflict (id) do nothing;
drop policy if exists "Authenticated gym asset uploads" on storage.objects;
drop policy if exists "Authenticated gym asset reads" on storage.objects;
drop policy if exists "Authenticated gym asset updates" on storage.objects;
drop policy if exists "Authenticated gym asset deletes" on storage.objects;
create policy "Authenticated gym asset uploads" on storage.objects for insert to authenticated with check (bucket_id = 'gym-assets');
create policy "Authenticated gym asset reads" on storage.objects for select to authenticated using (bucket_id = 'gym-assets');
create policy "Authenticated gym asset updates" on storage.objects for update to authenticated using (bucket_id = 'gym-assets') with check (bucket_id = 'gym-assets');
create policy "Authenticated gym asset deletes" on storage.objects for delete to authenticated using (bucket_id = 'gym-assets');
notify pgrst, 'reload schema';
