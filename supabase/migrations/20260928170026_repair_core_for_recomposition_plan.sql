create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create sequence if not exists public.membership_number_seq start with 1000;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'student' check (role in ('student','trainer','receptionist','manager','owner')),
  public_profile boolean not null default false,
  bio text not null default '',
  membership_number bigint not null default nextval('public.membership_number_seq'),
  status text not null default 'active' check (status in ('active','inactive','blocked')),
  birth_date date,
  gender text check (gender in ('male','female','other','prefer_not_to_say')),
  instagram text,
  facebook text,
  tiktok text,
  whatsapp text,
  show_instagram boolean not null default false,
  show_facebook boolean not null default false,
  show_tiktok boolean not null default false,
  show_whatsapp boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_membership_number_key') then
    alter table public.profiles add constraint profiles_membership_number_key unique (membership_number);
  end if;
end $$;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  plan_name text not null default 'Sem plano',
  status text not null default 'pending' check (status in ('pending','active','overdue','cancelled')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  next_due_date date,
  access_enabled boolean not null default false,
  billing_interval_months integer not null default 1 check (billing_interval_months between 1 and 24),
  last_payment_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;

  insert into public.memberships (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute procedure public.set_updated_at();

insert into public.profiles (id, full_name, phone)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'phone', '')
from auth.users u
on conflict (id) do nothing;

insert into public.memberships (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('receptionist','manager','owner')
      and status = 'active'
  );
$$;

create or replace function private.can_manage_workouts()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('trainer','manager','owner')
      and status = 'active'
  );
$$;

create or replace function private.can_manage_health()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('trainer','manager','owner')
      and status = 'active'
  );
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function private.is_staff() from public;
revoke all on function private.can_manage_workouts() from public;
revoke all on function private.can_manage_health() from public;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.can_manage_workouts() to authenticated;
grant execute on function private.can_manage_health() to authenticated;

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;

drop policy if exists profiles_select_authorized on public.profiles;
create policy profiles_select_authorized
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select private.is_staff()));

drop policy if exists profiles_update_authorized on public.profiles;
create policy profiles_update_authorized
on public.profiles for update to authenticated
using (((select auth.uid()) = id) or (select private.is_staff()))
with check (((select auth.uid()) = id) or (select private.is_staff()));

drop policy if exists memberships_select_authorized on public.memberships;
create policy memberships_select_authorized
on public.memberships for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_staff()));

revoke all on public.profiles from anon;
revoke all on public.memberships from anon;
grant select on public.profiles to authenticated;
grant update (full_name, phone, public_profile, bio, birth_date, gender, instagram, facebook, tiktok, whatsapp, show_instagram, show_facebook, show_tiktok, show_whatsapp) on public.profiles to authenticated;
grant select on public.memberships to authenticated;
