import { CheckCircle2, Clock3, Dumbbell, Play, RefreshCw, Weight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { ExerciseMedia } from "../components/ExerciseMedia";
import { listOwnWorkoutPrograms, type WorkoutProgram } from "../services/workoutService";
import { useAccount } from "../state/AccountContext";

export function WorkoutsScreen() {
  const navigate = useNavigate();
  const { account } = useAccount();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const items = await listOwnWorkoutPrograms();
      setPrograms(items);
      setSelectedId((current) => items.some((item) => item.id === current) ? current : items[0]?.id ?? "");
    } catch (err) {
      setPrograms([]);
      setError(readError(err, "Não foi possível carregar seus treinos."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  const workout = useMemo(() => programs.find((item) => item.id === selectedId) ?? programs[0] ?? null, [programs, selectedId]);

  return <AppShell title="Treinos"><div className="page-pad">
    <section className="hero-card user-summary"><BrandLogo compact/><div className="hero-card__divider"/><div><h2>{account?.profile.full_name || "Aluno"}</h2><span className="status-chip status-chip--success"><CheckCircle2 size={15}/> {account?.profile.status === "active" ? "Ativo" : "Inativo"}</span><p><Clock3 size={15}/> Matrícula #{account?.profile.membership_number ?? "—"}</p></div></section>

    {loading && <section className="section-card workout-empty-state"><RefreshCw className="spin"/><h2>Carregando sua ficha...</h2></section>}
    {!loading && error && <section className="section-card workout-empty-state"><Dumbbell/><h2>Não foi possível carregar</h2><p>{error}</p><button className="outline-button" onClick={() => void load()}>Tentar novamente</button></section>}
    {!loading && !error && programs.length === 0 && <section className="section-card workout-empty-state"><Dumbbell/><h2>Nenhum treino prescrito</h2><p>Quando o professor montar sua ficha, ela aparecerá aqui automaticamente.</p></section>}

    {!loading && !error && workout && <>
      <div className="segmented">{programs.map((item)=><button key={item.id} className={selectedId===item.id?"active":""} onClick={()=>setSelectedId(item.id)}>Treino {item.code}</button>)}</div>
      <section className="workout-header"><div className="round-icon green"><Dumbbell/></div><div><h2>{workout.title}</h2><p>{workout.subtitle || `${workout.workout_exercises.length} exercícios`}</p></div></section>
      {workout.notes && <div className="info-strip">{workout.notes}</div>}
      <div className="exercise-list">{workout.workout_exercises.map((exercise,index)=><article key={exercise.id} className="exercise-card"><div className="exercise-thumb exercise-thumb--media"><ExerciseMedia exercise={exercise} compact /></div><span className="number-dot">{index+1}</span><div className="exercise-main"><h3>{exercise.name}</h3><p className="exercise-muscle">{exercise.muscle_group}</p><div className="exercise-meta"><span><Dumbbell size={16}/><small>Séries x reps</small><b>{exercise.sets} x {exercise.reps_min}{exercise.reps_max !== exercise.reps_min ? `-${exercise.reps_max}` : ""}</b></span><span><Weight size={16}/><small>Carga sugerida</small><b>{exercise.suggested_load_kg == null ? "Livre" : `${exercise.suggested_load_kg} kg`}</b></span><span><Clock3 size={16}/><small>Descanso</small><b>{exercise.rest_seconds} seg</b></span></div>{exercise.notes && <small className="exercise-note">{exercise.notes}</small>}</div></article>)}</div>
      <button className="primary-button sticky-action" disabled={workout.workout_exercises.length === 0} onClick={()=>navigate(`/treinos/ativo?program=${workout.id}`)}><Play size={19}/> Iniciar treino</button>
    </>}
  </div></AppShell>;
}

function readError(error: unknown, fallback: string) { if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || fallback); return fallback; }
