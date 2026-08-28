import { CheckCircle2, Clock3, Dumbbell, Play, RefreshCw, Weight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { ExerciseDemo } from "../components/ExerciseDemo";
import { ExerciseMedia } from "../components/ExerciseMedia";
import { MuscleBodyMap } from "../components/MuscleBodyMap";
import { listOwnWorkoutPrograms, type WorkoutExercise, type WorkoutProgram } from "../services/workoutService";
import { useAccount } from "../state/AccountContext";

export function WorkoutsScreen() {
  const navigate = useNavigate();
  const { account } = useAccount();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailExercise, setDetailExercise] = useState<WorkoutExercise | null>(null);

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
  useEffect(() => {
    if (!detailExercise) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDetailExercise(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailExercise]);

  const workout = useMemo(() => programs.find((item) => item.id === selectedId) ?? programs[0] ?? null, [programs, selectedId]);

  return <AppShell title="Treinos"><div className="page-pad student-workouts-page">
    <section className="hero-card user-summary"><BrandLogo compact/><div className="hero-card__divider"/><div><h2>{account?.profile.full_name || "Aluno"}</h2><span className="status-chip status-chip--success"><CheckCircle2 size={15}/> {account?.profile.status === "active" ? "Ativo" : "Inativo"}</span><p><Clock3 size={15}/> Matrícula #{account?.profile.membership_number ?? "—"}</p></div></section>

    {loading && <section className="section-card workout-empty-state"><RefreshCw className="spin"/><h2>Carregando sua ficha...</h2></section>}
    {!loading && error && <section className="section-card workout-empty-state"><Dumbbell/><h2>Não foi possível carregar</h2><p>{error}</p><button className="outline-button" onClick={() => void load()}>Tentar novamente</button></section>}
    {!loading && !error && programs.length === 0 && <section className="section-card workout-empty-state"><Dumbbell/><h2>Nenhum treino prescrito</h2><p>Quando o professor montar sua ficha, ela aparecerá aqui automaticamente.</p></section>}

    {!loading && !error && workout && <>
      <div className="segmented">{programs.map((item)=><button key={item.id} className={selectedId===item.id?"active":""} onClick={()=>setSelectedId(item.id)}>Treino {item.code}</button>)}</div>
      <section className="workout-header"><div className="round-icon green"><Dumbbell/></div><div><h2>{workout.title}</h2><p>{workout.subtitle || `${workout.workout_exercises.length} exercícios`}</p></div></section>

      <div className="student-exercise-grid">
        {workout.workout_exercises.map((exercise, index) => (
          <article key={exercise.id} className="student-exercise-card">
            <button
              className="student-exercise-image"
              onClick={() => setDetailExercise(exercise)}
              aria-label={`Ver demonstração de ${exercise.name}`}
              aria-haspopup="dialog"
            >
              <ExerciseMedia exercise={exercise} compact />
              <span className="student-exercise-number">{index + 1}</span>
              <span className="student-exercise-tap">Toque para ver como fazer</span>
            </button>
            <div className="student-exercise-copy">
              <h3>{exercise.name}</h3>
              <p><b>{exercise.sets} séries</b> de {exercise.reps_min}{exercise.reps_max !== exercise.reps_min ? ` a ${exercise.reps_max}` : ""} repetições</p>
            </div>
          </article>
        ))}
      </div>

      <button className="primary-button sticky-action" disabled={workout.workout_exercises.length === 0} onClick={()=>navigate(`/treinos/ativo?program=${workout.id}`)}><Play size={19}/> Iniciar treino</button>
    </>}

    {detailExercise && (
      <div className="exercise-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailExercise(null); }}>
        <section className="exercise-detail-modal" role="dialog" aria-modal="true" aria-label={`Como fazer ${detailExercise.name}`}>
          <div className="exercise-detail-head">
            <div><small>COMO FAZER</small><h2>{detailExercise.name}</h2></div>
            <button className="icon-button" onClick={() => setDetailExercise(null)} aria-label="Fechar demonstração"><X /></button>
          </div>

          <ExerciseDemo exercise={detailExercise} />

          <div className="exercise-detail-prescription">
            <div><Dumbbell/><span><small>Séries</small><b>{detailExercise.sets}</b></span></div>
            <div><CheckCircle2/><span><small>Repetições</small><b>{detailExercise.reps_min}{detailExercise.reps_max !== detailExercise.reps_min ? `–${detailExercise.reps_max}` : ""}</b></span></div>
            <div><Clock3/><span><small>Descanso</small><b>{detailExercise.rest_seconds}s</b></span></div>
            <div><Weight/><span><small>Carga</small><b>{detailExercise.suggested_load_kg == null ? "Livre" : `${detailExercise.suggested_load_kg} kg`}</b></span></div>
          </div>

          <div className="exercise-detail-section">
            <h3>Onde trabalha no corpo</h3>
            <MuscleBodyMap exercise={detailExercise} />
          </div>

          <div className="exercise-detail-section">
            <h3>Descrição</h3>
            <p>{detailExercise.notes || `Execute ${detailExercise.name} com movimento controlado e seguindo a orientação do professor.`}</p>
          </div>

          <button className="primary-button" onClick={() => setDetailExercise(null)}>Entendi</button>
        </section>
      </div>
    )}
  </div></AppShell>;
}

function readError(error: unknown, fallback: string) { if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || fallback); return fallback; }
