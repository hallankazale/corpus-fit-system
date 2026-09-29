create table if not exists public.fitness_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  age smallint not null check (age between 16 and 100),
  weight_kg numeric(6,2) not null check (weight_kg between 30 and 300),
  height_cm smallint not null check (height_cm between 120 and 230),
  goal text not null check (goal in ('lose_fat','gain_muscle','recomposition','conditioning')),
  experience text not null check (experience in ('beginner','intermediate','advanced')),
  training_days smallint not null check (training_days between 2 and 6),
  session_minutes smallint not null check (session_minutes between 25 and 120),
  equipment_access text not null check (equipment_access in ('full_gym','basic_gym','home')),
  training_style text not null check (training_style in ('machines','free_weights','mixed','no_preference')),
  daily_activity text not null check (daily_activity in ('sedentary','light','moderate','high')),
  sleep_hours numeric(4,1) check (sleep_hours is null or sleep_hours between 0 and 12),
  dietary_pattern text not null check (dietary_pattern in ('omnivore','vegetarian','vegan','low_carb','no_preference')),
  meals_per_day smallint not null check (meals_per_day between 2 and 7),
  allergies text not null default '',
  foods_avoid text not null default '',
  injury_or_pain boolean not null default false,
  injury_details text not null default '',
  medical_restriction boolean not null default false,
  medical_details text not null default '',
  exertion_warning_signs boolean not null default false,
  warning_details text not null default '',
  consent_sensitive_data boolean not null default false,
  auto_plan_status text not null check (auto_plan_status in ('allowed','review_required')),
  training_recommendation text not null default '',
  nutrition_recommendation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists fitness_assessments_set_updated_at on public.fitness_assessments;
create trigger fitness_assessments_set_updated_at
before update on public.fitness_assessments
for each row execute function public.set_updated_at();

alter table public.fitness_assessments enable row level security;

drop policy if exists fitness_assessments_select_own on public.fitness_assessments;
create policy fitness_assessments_select_own
on public.fitness_assessments
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists fitness_assessments_insert_own on public.fitness_assessments;
create policy fitness_assessments_insert_own
on public.fitness_assessments
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists fitness_assessments_update_own on public.fitness_assessments;
create policy fitness_assessments_update_own
on public.fitness_assessments
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists fitness_assessments_delete_own on public.fitness_assessments;
create policy fitness_assessments_delete_own
on public.fitness_assessments
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.fitness_assessments from anon;
revoke all on public.fitness_assessments from authenticated;
grant select, insert, update, delete on public.fitness_assessments to authenticated;
