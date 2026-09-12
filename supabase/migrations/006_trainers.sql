-- TheFitnessDen — Trainer management
-- Apply this migration to the connected Supabase project before using the module.

create sequence if not exists public.trainer_id_seq;

create or replace function public.generate_trainer_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  return 'TRN-' || lpad(nextval('public.trainer_id_seq')::text, 4, '0');
end;
$$;

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  trainer_id text unique not null default public.generate_trainer_id(),
  full_name text not null,
  email text,
  phone text,
  profile_photo_url text,
  specialization text,
  experience_years numeric check (experience_years >= 0),
  certifications text,
  bio text,
  salary numeric(10,2) check (salary >= 0),
  status text not null default 'active' check (status in ('active', 'inactive', 'on_leave')),
  joining_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trainers_status_idx on public.trainers(status);
create index if not exists trainers_specialization_idx on public.trainers(specialization);
create index if not exists trainers_created_at_idx on public.trainers(created_at desc);

drop trigger if exists trainers_set_updated_at on public.trainers;
create trigger trainers_set_updated_at
before update on public.trainers
for each row execute function public.set_updated_at();

-- Existing members normally have NULL trainer_id. Any non-null values must already
-- reference a trainer; the constraint intentionally fails rather than silently
-- changing existing assignments.
alter table public.members
  add column if not exists trainer_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'members_trainer_id_fkey'
  ) then
    alter table public.members
      add constraint members_trainer_id_fkey
      foreign key (trainer_id) references public.trainers(id) on delete set null;
  end if;
end $$;

alter table public.trainers enable row level security;
drop policy if exists "Authenticated users can view trainers" on public.trainers;
drop policy if exists "Authenticated users can create trainers" on public.trainers;
drop policy if exists "Authenticated users can update trainers" on public.trainers;
drop policy if exists "Authenticated users can delete trainers" on public.trainers;
create policy "Authenticated users can view trainers" on public.trainers for select to authenticated using (true);
create policy "Authenticated users can create trainers" on public.trainers for insert to authenticated with check (true);
create policy "Authenticated users can update trainers" on public.trainers for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete trainers" on public.trainers for delete to authenticated using (true);

grant select, insert, update, delete on public.trainers to authenticated;
grant usage, select on sequence public.trainer_id_seq to authenticated;

insert into storage.buckets (id, name, public)
values ('trainer-photos', 'trainer-photos', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload trainer photos" on storage.objects;
drop policy if exists "Authenticated users can read trainer photos" on storage.objects;
drop policy if exists "Authenticated users can update trainer photos" on storage.objects;
drop policy if exists "Authenticated users can delete trainer photos" on storage.objects;
create policy "Authenticated users can upload trainer photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'trainer-photos');
create policy "Authenticated users can read trainer photos" on storage.objects
  for select to authenticated using (bucket_id = 'trainer-photos');
create policy "Authenticated users can update trainer photos" on storage.objects
  for update to authenticated using (bucket_id = 'trainer-photos') with check (bucket_id = 'trainer-photos');
create policy "Authenticated users can delete trainer photos" on storage.objects
  for delete to authenticated using (bucket_id = 'trainer-photos');

-- Ask PostgREST to refresh its schema cache immediately after applying this migration.
notify pgrst, 'reload schema';
