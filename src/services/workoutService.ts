import { supabase } from "../lib/supabase";

export type WorkoutStudent = {
  id: string;
  full_name: string;
  membership_number: number;
  status: string;
};

export type WorkoutExercise = {
  id: string;
  program_id: string;
  position: number;
  name: string;
  muscle_group: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  suggested_load_kg: number | null;
  rest_seconds: number;
  notes: string;
  media_url: string | null;
  media_type: "none" | "gif" | "video" | "image";
  media_attribution: string;
};

export type WorkoutProgram = {
  id: string;
  student_id: string;
  trainer_id: string;
  code: "A" | "B" | "C" | "D" | "E";
  title: string;
  subtitle: string;
  notes: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  workout_exercises: WorkoutExercise[];
};

export type WorkoutExerciseDraft = {
  name: string;
  muscle_group: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  suggested_load_kg: number | null;
  rest_seconds: number;
  notes: string;
  media_url: string;
  media_type: WorkoutExercise["media_type"];
  media_attribution: string;
};

export type WorkoutSession = {
  id: string;
  student_id: string;
  program_id: string;
  status: "in_progress" | "completed" | "cancelled";
  started_at: string;
  completed_at: string | null;
};

function client() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

function normalizeProgram(row: Record<string, unknown>): WorkoutProgram {
  const exercises = ((row.workout_exercises ?? []) as WorkoutExercise[])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((exercise) => ({
      ...exercise,
      media_url: exercise.media_url || null,
      media_type: exercise.media_type || "none",
      media_attribution: exercise.media_attribution || "",
    }));
  return { ...(row as unknown as WorkoutProgram), workout_exercises: exercises };
}

export async function listOwnWorkoutPrograms(): Promise<WorkoutProgram[]> {
  const api = client();
  const { data: userData, error: userError } = await api.auth.getUser();
  if (userError || !userData.user) return [];
  const { data, error } = await api
    .from("workout_programs")
    .select("*, workout_exercises(*)")
    .eq("student_id", userData.user.id)
    .eq("status", "active")
    .order("code", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeProgram);
}

export async function fetchOwnWorkoutProgram(programId: string): Promise<WorkoutProgram> {
  const api = client();
  const { data, error } = await api
    .from("workout_programs")
    .select("*, workout_exercises(*)")
    .eq("id", programId)
    .eq("status", "active")
    .single();
  if (error) throw error;
  return normalizeProgram(data as Record<string, unknown>);
}

export async function listWorkoutStudents(): Promise<WorkoutStudent[]> {
  const api = client();
  const { data, error } = await api.rpc("trainer_list_students");
  if (error) throw error;
  return (data ?? []) as WorkoutStudent[];
}

export async function listStudentWorkoutPrograms(studentId: string): Promise<WorkoutProgram[]> {
  const api = client();
  const { data, error } = await api
    .from("workout_programs")
    .select("*, workout_exercises(*)")
    .eq("student_id", studentId)
    .order("code", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeProgram);
}

export async function saveWorkoutProgram(input: {
  studentId: string;
  code: WorkoutProgram["code"];
  title: string;
  subtitle: string;
  notes: string;
  exercises: WorkoutExerciseDraft[];
}): Promise<WorkoutProgram> {
  const api = client();
  const { data: program, error: programError } = await api.rpc("trainer_save_program", {
    p_student_id: input.studentId,
    p_code: input.code,
    p_title: input.title.trim(),
    p_subtitle: input.subtitle.trim(),
    p_notes: input.notes.trim(),
  });
  if (programError) throw programError;
  const saved = program as WorkoutProgram;
  const payload = input.exercises.map((item) => ({
    name: item.name.trim(),
    muscle_group: item.muscle_group.trim(),
    sets: item.sets,
    reps_min: item.reps_min,
    reps_max: item.reps_max,
    suggested_load_kg: item.suggested_load_kg,
    rest_seconds: item.rest_seconds,
    notes: item.notes.trim(),
    media_url: item.media_url.trim(),
    media_type: item.media_url.trim() ? item.media_type : "none",
    media_attribution: item.media_attribution.trim(),
  }));
  const { error: exerciseError } = await api.rpc("trainer_replace_exercises", {
    p_program_id: saved.id,
    p_exercises: payload,
  });
  if (exerciseError) throw exerciseError;
  const refreshed = await listStudentWorkoutPrograms(input.studentId);
  const result = refreshed.find((item) => item.id === saved.id);
  if (!result) throw new Error("Treino salvo, mas não foi possível recarregar a ficha.");
  return result;
}

export async function startWorkoutSession(programId: string): Promise<WorkoutSession> {
  const api = client();
  const { data: userData, error: userError } = await api.auth.getUser();
  if (userError || !userData.user) throw new Error("Sessão do aluno não encontrada.");
  const { data, error } = await api
    .from("workout_sessions")
    .insert({ student_id: userData.user.id, program_id: programId, status: "in_progress" })
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkoutSession;
}

export async function saveWorkoutSet(input: {
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  loadKg: number;
  reps: number;
  completed: boolean;
}) {
  const api = client();
  const { error } = await api.from("workout_set_logs").upsert({
    session_id: input.sessionId,
    exercise_id: input.exerciseId,
    set_number: input.setNumber,
    load_kg: input.loadKg,
    reps: input.reps,
    completed: input.completed,
    completed_at: input.completed ? new Date().toISOString() : null,
  }, { onConflict: "session_id,exercise_id,set_number" });
  if (error) throw error;
}

export async function completeWorkoutSession(sessionId: string) {
  const api = client();
  const { error } = await api
    .from("workout_sessions")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
}
