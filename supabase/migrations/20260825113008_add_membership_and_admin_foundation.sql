create sequence if not exists public.membership_number_seq start with 1000;

alter table public.profiles add column if not exists membership_number bigint;
alter table public.profiles add column if not exists status text not null default 'active' check (status in ('active','inactive','blocked'));
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists gender text check (gender in ('male','female','other','prefer_not_to_say'));
alter table public.profiles add column if not exists instagram text;
alter table public.profiles add column if not exists facebook text;
alter table public.profiles add column if not exists tiktok text;
alter table public.profiles add column if not exists whatsapp text;

update public.profiles set membership_number = nextval('public.membership_number_seq') where membership_number is null;
alter table public.profiles alter column membership_number set default nextval('public.membership_number_seq');
alter table public.profiles alter column membership_number set not null;

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.memberships enable row level security;
insert into public.memberships (user_id) select id from public.profiles on conflict (user_id) do nothing;

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('receptionist','manager','owner') and status = 'active');
$$;
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_select_authorized on public.profiles;
drop policy if exists profiles_update_authorized on public.profiles;
create policy profiles_select_authorized on public.profiles for select to authenticated using ((select auth.uid()) = id or (select public.is_staff()));
create policy profiles_update_authorized on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists memberships_select_authorized on public.memberships;
create policy memberships_select_authorized on public.memberships for select to authenticated using ((select auth.uid()) = user_id or (select public.is_staff()));

revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, public_profile, bio, birth_date, gender, instagram, facebook, tiktok, whatsapp) on public.profiles to authenticated;
grant select on public.memberships to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'phone', '')) on conflict (id) do nothing;
  insert into public.memberships (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace function public.set_membership_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at before update on public.memberships for each row execute procedure public.set_membership_updated_at();
