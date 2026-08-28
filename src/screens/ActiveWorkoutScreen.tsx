import { CheckCircle2, ChevronRight, Clock3, Dumbbell, Minus, Plus, TimerReset, Weight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ExerciseMedia } from "../components/ExerciseMedia";
import {
  completeWorkoutSession,
  fetchOwnWorkoutProgram,
  saveWorkoutSet,
  startWorkoutSession,
  type WorkoutExercise,
  type WorkoutProgram,
  type WorkoutSession,
} from "../services/workoutService";

type SetRow = { kg: number; reps: number; done: boolean };

export function ActiveWorkoutScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const programId = params.get("program") ?? "";
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [sets, setSets] = useState<SetRow[]>([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (restLeft <= 0) return;
    const timer = window.setInterval(() => setRestLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [restLeft]);

  useEffect(() => {
    if (!programId) {
      setError("Treino não informado.");
      setLoading(false);
      return;
    }
    let mounted = true;
    const boot = async () => {
      try {
        const loaded = await fetchOwnWorkoutProgram(programId);
        if (!mounted) return;
        setProgram(loaded);
        if (!startedRef.current) {
          startedRef.current = true;
          const created = await startWorkoutSession(programId);
          if (mounted) setSession(created);
        }
      } catch (err) {
        if (mounted) setError(readError(err, "Não foi possível iniciar este treino."));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void boot();
    return () => { mounted = false; };
  }, [programId]);

  const exercise = program?.workout_exercises[exerciseIndex] ?? null;

  useEffect(() => {
    if (!exercise) return;
    setSets(buildSets(exercise));
    setRestLeft(0);
  }, [exercise?.id]);

  const completedSets = useMemo(() => sets.filter((item) => item.done).length, [sets]);
  const progress = program && exercise ? ((exerciseIndex + (sets.length ? completedSets / sets.length : 0)) / Math.max(1, program.workout_exercises.length)) * 100 : 0;

  const update = (index: number, key: "kg" | "reps", delta: number) => {
    setSets((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: Math.max(0, row[key] + delta) } : row));
  };

  const toggle = async (index: number) => {
    if (!exercise || !session) return;
    const row = sets[index];
    if (!row) return;
    const next = { ...row, done: !row.done };
    setSets((current) => current.map((item, rowIndex) => rowIndex === index ? next : item));
    try {
      await saveWorkoutSet({ sessionId: session.id, exerciseId: exercise.id, setNumber: index + 1, loadKg: next.kg, reps: next.reps, completed: next.done });
      if (next.done) setRestLeft(exercise.rest_seconds);
    } catch (err) {
      setFeedback(readError(err, "Não foi possível salvar a série."));
    }
  };

  const completeExercise = async () => {
    if (!exercise || !session) return;
    const next = sets.map((row) => ({ ...row, done: true }));
    setSets(next);
    try {
      await Promise.all(next.map((row, index) => saveWorkoutSet({ sessionId: session.id, exerciseId: exercise.id, setNumber: index + 1, loadKg: row.kg, reps: row.reps, completed: true })));
      setRestLeft(exercise.rest_seconds);
      setFeedback("Exercício concluído e salvo.");
      window.setTimeout(() => setFeedback(""), 1800);
    } catch (err) {
      setFeedback(readError(err, "Não foi possível concluir o exercício."));
    }
  };

  const nextExercise = async () => {
    if (!program || !session) return;
    if (exerciseIndex < program.workout_exercises.length - 1) {
      setExerciseIndex((current) => current + 1);
      setFeedback("Próximo exercício carregado.");
      window.setTimeout(() => setFeedback(""), 1400);
      return;
    }
    try {
      await completeWorkoutSession(session.id);
      setFinished(true);
      setRestLeft(0);
      setFeedback("Treino finalizado e registrado no seu histórico.");
    } catch (err) {
      setFeedback(readError(err, "Não foi possível finalizar o treino."));
    }
  };

  if (loading) return <AppShell title="Treino em andamento"><div className="page-pad"><section className="section-card workout-empty-state"><TimerReset className="spin"/><h2>Preparando treino...</h2></section></div></AppShell>;
  if (error || !program || !exercise) return <AppShell title="Treino em andamento"><div className="page-pad"><section className="section-card workout-empty-state"><Dumbbell/><h2>Treino indisponível</h2><p>{error || "A ficha não possui exercícios."}</p><button className="outline-button" onClick={() => navigate("/treinos")}>Voltar</button></section></div></AppShell>;

  if (finished) return <AppShell title="Treino concluído"><div className="page-pad"><section className="section-card workout-finished"><CheckCircle2/><h1>Treino concluído!</h1><p>{program.title} foi registrado com duração de {formatDuration(elapsed)}.</p><button className="primary-button" onClick={() => navigate("/treinos")}>Voltar aos treinos</button></section></div></AppShell>;

  return <AppShell title="Treino em andamento"><div className="page-pad active-workout">
    <div className="workout-progress"><span>Exercício {exerciseIndex + 1} de {program.workout_exercises.length}</span><b><Clock3 size={17} /> {formatDuration(elapsed)}</b><div><i style={{ width: `${Math.min(100, progress)}%` }} /></div></div>
    <section className="active-hero"><div className="active-exercise-media"><ExerciseMedia exercise={exercise} /></div><div><h1>{exercise.name}</h1><p>Grupo muscular</p><div className="muscle-tags"><span>{exercise.muscle_group || "Geral"}</span></div><div className="active-meta"><span><Dumbbell /><small>Séries x reps</small><b>{exercise.sets} x {exercise.reps_min}{exercise.reps_max !== exercise.reps_min ? `-${exercise.reps_max}` : ""}</b></span><span><Weight /><small>Carga sugerida</small><b>{exercise.suggested_load_kg == null ? "Livre" : `${exercise.suggested_load_kg} kg`}</b></span><span><Clock3 /><small>Descanso</small><b>{exercise.rest_seconds} s</b></span></div>{exercise.notes && <div className="info-strip active-note">{exercise.notes}</div>}</div></section>
    <section className="sets-card"><h2>Suas séries</h2><div className="sets-head"><span>Série</span><span>Carga (kg)</span><span>Repetições</span><span>Status</span></div>{sets.map((row, index) => <div className="set-row" key={index}><button className={`set-number ${row.done ? "done" : ""}`} onClick={() => void toggle(index)}>{index + 1}</button><div className="stepper"><button onClick={() => update(index, "kg", -1)}><Minus /></button><b>{row.kg}</b><button onClick={() => update(index, "kg", 1)}><Plus /></button></div><div className="stepper"><button onClick={() => update(index, "reps", -1)}><Minus /></button><b>{row.reps}</b><button onClick={() => update(index, "reps", 1)}><Plus /></button></div><button className={`set-status ${row.done ? "done" : ""}`} onClick={() => void toggle(index)}>{row.done ? <><CheckCircle2 /> Concluída</> : <><Clock3 /> Pendente</>}</button></div>)}
      <button className="primary-button" onClick={() => void completeExercise()}><CheckCircle2 /> Concluir exercício</button><button className="outline-button" onClick={() => void nextExercise()}>{exerciseIndex === program.workout_exercises.length - 1 ? "Finalizar treino" : "Próximo exercício"} <ChevronRight /></button>
    </section>
    <div className={`rest-timer ${restLeft > 0 ? "is-running" : ""}`}><TimerReset /><strong>{formatTimer(restLeft || exercise.rest_seconds)}</strong><span>{restLeft > 0 ? "Descansando" : "Descanso"}</span></div>
    {feedback && <div className="toast">{feedback}</div>}
  </div></AppShell>;
}

function buildSets(exercise: WorkoutExercise): SetRow[] {
  return Array.from({ length: exercise.sets }, () => ({ kg: Number(exercise.suggested_load_kg ?? 0), reps: exercise.reps_min, done: false }));
}
function formatDuration(seconds: number) { const minutes = Math.floor(seconds / 60); const rest = seconds % 60; return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`; }
function formatTimer(seconds: number) { return `00:${String(Math.max(0, seconds)).padStart(2, "0")}`; }
function readError(error: unknown, fallback: string) { if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || fallback); return fallback; }
