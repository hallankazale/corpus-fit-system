create or replace function private.can_manage_health()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('trainer','manager','owner')
      and status = 'active'
  );
$$;

revoke all on function private.can_manage_health() from public;
grant execute on function private.can_manage_health() to authenticated;

create table if not exists public.nutrition_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  objective text not null default '',
  calories_target integer check (calories_target is null or calories_target between 800 and 7000),
  protein_g integer check (protein_g is null or protein_g between 0 and 500),
  carbs_g integer check (carbs_g is null or carbs_g between 0 and 1000),
  fat_g integer check (fat_g is null or fat_g between 0 and 400),
  water_ml integer check (water_ml is null or water_ml between 500 and 10000),
  notes text not null default '',
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists nutrition_plans_one_active_per_student on public.nutrition_plans(student_id) where status = 'active';
create index if not exists nutrition_plans_student_idx on public.nutrition_plans(student_id, updated_at desc);

create table if not exists public.nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.nutrition_plans(id) on delete cascade,
  position integer not null check (position > 0),
  name text not null,
  time_label text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (plan_id, position)
);

create table if not exists public.nutrition_meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.nutrition_meals(id) on delete cascade,
  position integer not null check (position > 0),
  food_name text not null,
  quantity numeric(8,2) check (quantity is null or quantity > 0),
  unit text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (meal_id, position)
);

create table if not exists public.cardio_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  objective text not null default '',
  notes text not null default '',
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists cardio_plans_one_active_per_student on public.cardio_plans(student_id) where status = 'active';
create index if not exists cardio_plans_student_idx on public.cardio_plans(student_id, updated_at desc);

create table if not exists public.cardio_sessions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.cardio_plans(id) on delete cascade,
  position integer not null check (position > 0),
  weekday smallint not null check (weekday between 1 and 7),
  activity text not null,
  duration_min integer not null check (duration_min between 5 and 180),
  intensity text not null check (intensity in ('light','moderate','vigorous')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (plan_id, position)
);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg numeric(6,2) check (weight_kg is null or weight_kg between 20 and 400),
  waist_cm numeric(6,2) check (waist_cm is null or waist_cm between 30 and 250),
  body_fat_percent numeric(5,2) check (body_fat_percent is null or body_fat_percent between 1 and 70),
  notes text not null default '',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, measured_at),
  check (weight_kg is not null or waist_cm is not null or body_fat_percent is not null)
);
create index if not exists body_measurements_student_date_idx on public.body_measurements(student_id, measured_at desc);

drop trigger if exists nutrition_plans_set_updated_at on public.nutrition_plans;
create trigger nutrition_plans_set_updated_at before update on public.nutrition_plans for each row execute function public.set_updated_at();
drop trigger if exists cardio_plans_set_updated_at on public.cardio_plans;
create trigger cardio_plans_set_updated_at before update on public.cardio_plans for each row execute function public.set_updated_at();
drop trigger if exists body_measurements_set_updated_at on public.body_measurements;
create trigger body_measurements_set_updated_at before update on public.body_measurements for each row execute function public.set_updated_at();

alter table public.nutrition_plans enable row level security;
alter table public.nutrition_meals enable row level security;
alter table public.nutrition_meal_items enable row level security;
alter table public.cardio_plans enable row level security;
alter table public.cardio_sessions enable row level security;
alter table public.body_measurements enable row level security;

grant select, insert, update, delete on public.nutrition_plans, public.nutrition_meals, public.nutrition_meal_items, public.cardio_plans, public.cardio_sessions, public.body_measurements to authenticated;
revoke all on public.nutrition_plans, public.nutrition_meals, public.nutrition_meal_items, public.cardio_plans, public.cardio_sessions, public.body_measurements from anon;

drop policy if exists nutrition_plans_select on public.nutrition_plans;
create policy nutrition_plans_select on public.nutrition_plans for select to authenticated using ((select auth.uid()) = student_id or private.can_manage_health());
drop policy if exists nutrition_plans_manage on public.nutrition_plans;
create policy nutrition_plans_manage on public.nutrition_plans for all to authenticated using (private.can_manage_health()) with check (private.can_manage_health());

drop policy if exists nutrition_meals_select on public.nutrition_meals;
create policy nutrition_meals_select on public.nutrition_meals for select to authenticated using (exists (select 1 from public.nutrition_plans p where p.id = plan_id and (p.student_id = (select auth.uid()) or private.can_manage_health())));
drop policy if exists nutrition_meals_manage on public.nutrition_meals;
create policy nutrition_meals_manage on public.nutrition_meals for all to authenticated using (private.can_manage_health()) with check (private.can_manage_health());

drop policy if exists nutrition_meal_items_select on public.nutrition_meal_items;
create policy nutrition_meal_items_select on public.nutrition_meal_items for select to authenticated using (exists (select 1 from public.nutrition_meals m join public.nutrition_plans p on p.id = m.plan_id where m.id = meal_id and (p.student_id = (select auth.uid()) or private.can_manage_health())));
drop policy if exists nutrition_meal_items_manage on public.nutrition_meal_items;
create policy nutrition_meal_items_manage on public.nutrition_meal_items for all to authenticated using (private.can_manage_health()) with check (private.can_manage_health());

drop policy if exists cardio_plans_select on public.cardio_plans;
create policy cardio_plans_select on public.cardio_plans for select to authenticated using ((select auth.uid()) = student_id or private.can_manage_health());
drop policy if exists cardio_plans_manage on public.cardio_plans;
create policy cardio_plans_manage on public.cardio_plans for all to authenticated using (private.can_manage_health()) with check (private.can_manage_health());

drop policy if exists cardio_sessions_select on public.cardio_sessions;
create policy cardio_sessions_select on public.cardio_sessions for select to authenticated using (exists (select 1 from public.cardio_plans p where p.id = plan_id and (p.student_id = (select auth.uid()) or private.can_manage_health())));
drop policy if exists cardio_sessions_manage on public.cardio_sessions;
create policy cardio_sessions_manage on public.cardio_sessions for all to authenticated using (private.can_manage_health()) with check (private.can_manage_health());

drop policy if exists body_measurements_select on public.body_measurements;
create policy body_measurements_select on public.body_measurements for select to authenticated using (student_id = (select auth.uid()) or private.can_manage_health());
drop policy if exists body_measurements_insert on public.body_measurements;
create policy body_measurements_insert on public.body_measurements for insert to authenticated with check ((student_id = (select auth.uid()) or private.can_manage_health()) and created_by = (select auth.uid()));
drop policy if exists body_measurements_update on public.body_measurements;
create policy body_measurements_update on public.body_measurements for update to authenticated using (student_id = (select auth.uid()) or private.can_manage_health()) with check (student_id = (select auth.uid()) or private.can_manage_health());
drop policy if exists body_measurements_delete on public.body_measurements;
create policy body_measurements_delete on public.body_measurements for delete to authenticated using (student_id = (select auth.uid()) or private.can_manage_health());
