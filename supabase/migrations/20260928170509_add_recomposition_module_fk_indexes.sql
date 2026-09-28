create index if not exists workout_sessions_program_id_idx
  on public.workout_sessions(program_id);
create index if not exists workout_set_logs_exercise_id_idx
  on public.workout_set_logs(exercise_id);
create index if not exists nutrition_plans_trainer_id_idx
  on public.nutrition_plans(trainer_id);
create index if not exists cardio_plans_trainer_id_idx
  on public.cardio_plans(trainer_id);
create index if not exists body_measurements_created_by_idx
  on public.body_measurements(created_by);
