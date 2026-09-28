create table if not exists public.workout_programs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id),
  code text not null check (code in ('A','B','C','D','E')),
  title text not null,
  subtitle text not null default '',
  notes text not null default '',
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, code)
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.workout_programs(id) on delete cascade,
  position integer not null check (position > 0),
  name text not null,
  muscle_group text not null default '',
  sets integer not null default 3 check (sets between 1 and 12),
  reps_min integer not null default 8 check (reps_min between 1 and 100),
  reps_max integer not null default 12 check (reps_max between 1 and 100),
  suggested_load_kg numeric(8,2),
  rest_seconds integer not null default 60 check (rest_seconds between 0 and 900),
  notes text not null default '',
  media_url text,
  media_type text not null default 'none' check (media_type in ('none','gif','video','image')),
  media_attribution text not null default '',
  created_at timestamptz not null default now(),
  unique(program_id, position),
  check (reps_max >= reps_min),
  constraint workout_exercises_media_url_https check (media_url is null or media_url = '' or media_url ~ '^https://')
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.workout_programs(id),
  status text not null default 'in_progress' check (status in ('in_progress','completed','cancelled')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.workout_exercises(id),
  set_number integer not null check (set_number > 0),
  load_kg numeric(8,2) not null default 0,
  reps integer not null default 0 check (reps between 0 and 200),
  completed boolean not null default false,
  completed_at timestamptz,
  unique(session_id, exercise_id, set_number)
);

create index if not exists workout_programs_student_idx on public.workout_programs(student_id, status);
create index if not exists workout_programs_trainer_idx on public.workout_programs(trainer_id, status);
create index if not exists workout_exercises_program_idx on public.workout_exercises(program_id, position);
create index if not exists workout_sessions_student_idx on public.workout_sessions(student_id, started_at desc);
create index if not exists workout_set_logs_session_idx on public.workout_set_logs(session_id, exercise_id);

alter table public.workout_programs enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_set_logs enable row level security;

drop policy if exists workout_programs_select on public.workout_programs;
create policy workout_programs_select on public.workout_programs for select to authenticated
using ((select auth.uid()) = student_id or private.can_manage_workouts());

drop policy if exists workout_programs_manage on public.workout_programs;
create policy workout_programs_manage on public.workout_programs for all to authenticated
using (private.can_manage_workouts()) with check (private.can_manage_workouts());

drop policy if exists workout_exercises_select on public.workout_exercises;
create policy workout_exercises_select on public.workout_exercises for select to authenticated
using (exists (
  select 1 from public.workout_programs p
  where p.id = workout_exercises.program_id
    and (p.student_id = (select auth.uid()) or private.can_manage_workouts())
));

drop policy if exists workout_exercises_manage on public.workout_exercises;
create policy workout_exercises_manage on public.workout_exercises for all to authenticated
using (private.can_manage_workouts()) with check (private.can_manage_workouts());

drop policy if exists workout_sessions_select on public.workout_sessions;
create policy workout_sessions_select on public.workout_sessions for select to authenticated
using (student_id = (select auth.uid()) or private.can_manage_workouts());

drop policy if exists workout_sessions_student_insert on public.workout_sessions;
create policy workout_sessions_student_insert on public.workout_sessions for insert to authenticated
with check (student_id = (select auth.uid()) and exists (
  select 1 from public.workout_programs p
  where p.id = program_id and p.student_id = (select auth.uid()) and p.status = 'active'
));

drop policy if exists workout_sessions_student_update on public.workout_sessions;
create policy workout_sessions_student_update on public.workout_sessions for update to authenticated
using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));

drop policy if exists workout_set_logs_select on public.workout_set_logs;
create policy workout_set_logs_select on public.workout_set_logs for select to authenticated
using (exists (
  select 1 from public.workout_sessions s
  where s.id = workout_set_logs.session_id
    and (s.student_id = (select auth.uid()) or private.can_manage_workouts())
));

drop policy if exists workout_set_logs_student_manage on public.workout_set_logs;
create policy workout_set_logs_student_manage on public.workout_set_logs for all to authenticated
using (exists (
  select 1 from public.workout_sessions s
  where s.id = workout_set_logs.session_id and s.student_id = (select auth.uid())
))
with check (exists (
  select 1 from public.workout_sessions s
  where s.id = workout_set_logs.session_id and s.student_id = (select auth.uid())
));

create or replace function public.set_workout_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists workout_programs_updated_at on public.workout_programs;
create trigger workout_programs_updated_at
before update on public.workout_programs
for each row execute function public.set_workout_updated_at();

create or replace function private.trainer_list_students_core()
returns table(id uuid, full_name text, membership_number bigint, status text)
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if not private.can_manage_workouts() then
    raise exception 'Acesso ao painel do professor negado.' using errcode = '42501';
  end if;
  return query
  select p.id, p.full_name, p.membership_number, p.status
  from public.profiles p
  where p.role = 'student'
  order by p.full_name;
end;
$$;

create or replace function private.trainer_save_program_core(
  p_student_id uuid,
  p_code text,
  p_title text,
  p_subtitle text default '',
  p_notes text default ''
)
returns public.workout_programs
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_program public.workout_programs;
begin
  if not private.can_manage_workouts() then
    raise exception 'Acesso ao painel do professor negado.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = p_student_id and role = 'student') then
    raise exception 'Aluno inválido.';
  end if;
  if p_code not in ('A','B','C','D','E') then raise exception 'Código de treino inválido.'; end if;
  if trim(coalesce(p_title,'')) = '' then raise exception 'Título do treino é obrigatório.'; end if;

  insert into public.workout_programs(student_id, trainer_id, code, title, subtitle, notes, status)
  values (p_student_id, auth.uid(), p_code, trim(p_title), trim(coalesce(p_subtitle,'')), trim(coalesce(p_notes,'')), 'active')
  on conflict (student_id, code) do update
  set trainer_id = auth.uid(),
      title = excluded.title,
      subtitle = excluded.subtitle,
      notes = excluded.notes,
      status = 'active'
  returning * into v_program;

  return v_program;
end;
$$;

create or replace function private.trainer_replace_exercises_core(p_program_id uuid, p_exercises jsonb)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_count integer := 0;
  v_item jsonb;
  v_media_url text;
  v_media_type text;
begin
  if not private.can_manage_workouts() then
    raise exception 'Acesso ao painel do professor negado.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.workout_programs where id = p_program_id) then
    raise exception 'Treino não encontrado.';
  end if;
  if jsonb_typeof(p_exercises) <> 'array' then
    raise exception 'Lista de exercícios inválida.';
  end if;

  delete from public.workout_exercises where program_id = p_program_id;

  for v_item in select * from jsonb_array_elements(p_exercises)
  loop
    v_count := v_count + 1;
    if trim(coalesce(v_item->>'name','')) = '' then
      raise exception 'Nome do exercício é obrigatório.';
    end if;

    v_media_url := nullif(trim(coalesce(v_item->>'media_url','')), '');
    v_media_type := coalesce(nullif(trim(coalesce(v_item->>'media_type','')), ''), 'none');

    if v_media_type not in ('none','gif','video','image') then
      raise exception 'Tipo de mídia inválido.';
    end if;
    if v_media_url is not null and v_media_url !~ '^https://' then
      raise exception 'A mídia do exercício deve usar HTTPS.';
    end if;
    if v_media_url is null then
      v_media_type := 'none';
    end if;

    insert into public.workout_exercises(
      program_id, position, name, muscle_group, sets, reps_min, reps_max,
      suggested_load_kg, rest_seconds, notes, media_url, media_type, media_attribution
    )
    values (
      p_program_id,
      v_count,
      trim(v_item->>'name'),
      trim(coalesce(v_item->>'muscle_group','')),
      greatest(1, least(12, coalesce((v_item->>'sets')::int,3))),
      greatest(1, least(100, coalesce((v_item->>'reps_min')::int,8))),
      greatest(1, least(100, coalesce((v_item->>'reps_max')::int,12))),
      nullif(v_item->>'suggested_load_kg','')::numeric,
      greatest(0, least(900, coalesce((v_item->>'rest_seconds')::int,60))),
      trim(coalesce(v_item->>'notes','')),
      v_media_url,
      v_media_type,
      trim(coalesce(v_item->>'media_attribution',''))
    );
  end loop;

  return v_count;
end;
$$;

create or replace function public.trainer_list_students()
returns table(id uuid, full_name text, membership_number bigint, status text)
language sql
security invoker
set search_path = pg_catalog, public, private
as $$ select * from private.trainer_list_students_core(); $$;

create or replace function public.trainer_save_program(
  p_student_id uuid,
  p_code text,
  p_title text,
  p_subtitle text default '',
  p_notes text default ''
)
returns public.workout_programs
language sql
security invoker
set search_path = pg_catalog, public, private
as $$ select private.trainer_save_program_core(p_student_id,p_code,p_title,p_subtitle,p_notes); $$;

create or replace function public.trainer_replace_exercises(p_program_id uuid, p_exercises jsonb)
returns integer
language sql
security invoker
set search_path = pg_catalog, public, private
as $$ select private.trainer_replace_exercises_core(p_program_id,p_exercises); $$;

revoke all on function public.set_workout_updated_at() from public, anon, authenticated;
revoke all on function private.trainer_list_students_core() from public, anon;
revoke all on function private.trainer_save_program_core(uuid,text,text,text,text) from public, anon;
revoke all on function private.trainer_replace_exercises_core(uuid,jsonb) from public, anon;
grant execute on function private.trainer_list_students_core() to authenticated;
grant execute on function private.trainer_save_program_core(uuid,text,text,text,text) to authenticated;
grant execute on function private.trainer_replace_exercises_core(uuid,jsonb) to authenticated;

revoke all on function public.trainer_list_students() from public, anon;
revoke all on function public.trainer_save_program(uuid,text,text,text,text) from public, anon;
revoke all on function public.trainer_replace_exercises(uuid,jsonb) from public, anon;
grant execute on function public.trainer_list_students() to authenticated;
grant execute on function public.trainer_save_program(uuid,text,text,text,text) to authenticated;
grant execute on function public.trainer_replace_exercises(uuid,jsonb) to authenticated;

revoke all on public.workout_programs, public.workout_exercises, public.workout_sessions, public.workout_set_logs from anon;
grant select, insert, update, delete on public.workout_programs, public.workout_exercises, public.workout_sessions, public.workout_set_logs to authenticated;
