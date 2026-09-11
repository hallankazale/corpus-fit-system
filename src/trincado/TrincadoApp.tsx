import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheckBig,
  Dumbbell,
  Flame,
  Gauge,
  RotateCcw,
  TimerReset,
  TrendingUp,
} from "lucide-react";
import { getTodayWorkoutCode, getWorkoutByCode, trincadoPlan, type TrincadoExercise, type WorkoutDayCode } from "./workoutPlan";
import "./trincado.css";

type CompletionMap = Record<string, boolean>;

const STORAGE_KEY = "corpus-fit-trincado-progress-v1";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function progressKey(day: WorkoutDayCode, exerciseId: string, setIndex: number) {
  return `${todayKey()}:${day}:${exerciseId}:${setIndex}`;
}

function loadProgress(): CompletionMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as CompletionMap;
  } catch {
    return {};
  }
}

function DetailField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="tr-detail-field">
      <span>{label}</span>
      <b className={strong ? "is-strong" : ""}>{value}</b>
    </div>
  );
}

function ExerciseCard({
  exercise,
  day,
  progress,
  onToggleSet,
}: {
  exercise: TrincadoExercise;
  day: WorkoutDayCode;
  progress: CompletionMap;
  onToggleSet: (exercise: TrincadoExercise, setIndex: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completed = Array.from({ length: exercise.sets }, (_, index) =>
    Boolean(progress[progressKey(day, exercise.id, index)]),
  ).filter(Boolean).length;

  return (
    <article className="tr-exercise-card">
      <div className="tr-media-wrap">
        <img src={`./gifs/${exercise.gif}`} alt={`Demonstração anatômica de ${exercise.name}`} loading="lazy" />
        <span className="tr-muscle-chip"><i /> {exercise.muscle}</span>
      </div>

      <div className="tr-exercise-body">
        <div className="tr-exercise-title">
          <div>
            <small>MOVIMENTO</small>
            <h3>{exercise.name}</h3>
          </div>
          <strong>{completed}/{exercise.sets}</strong>
        </div>

        <div className="tr-detail-primary">
          <DetailField label="Aparelho/Local" value={exercise.location} strong />
        </div>

        <div className="tr-detail-grid">
          <DetailField label="Séries/Repetições" value={`${exercise.sets} × ${exercise.reps}`} strong />
          <DetailField label="Velocidade" value={exercise.speed} />
          <DetailField label="Músculo alvo" value={exercise.muscle} />
          <DetailField label="Intervalo" value={exercise.rest ? `${exercise.rest} segundos` : "Sem intervalo"} />
        </div>

        <div className="tr-set-section">
          <div className="tr-set-heading">
            <span>Séries concluídas</span>
            <small>toque para marcar</small>
          </div>
          <div className="tr-set-row" aria-label={`Séries de ${exercise.name}`}>
            {Array.from({ length: exercise.sets }, (_, index) => {
              const key = progressKey(day, exercise.id, index);
              const checked = Boolean(progress[key]);
              return (
                <button
                  key={key}
                  type="button"
                  className={checked ? "is-done" : ""}
                  onClick={() => onToggleSet(exercise, index)}
                  aria-pressed={checked}
                >
                  {checked ? <Check size={18} /> : index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <button type="button" className="tr-technique" onClick={() => setExpanded((value) => !value)}>
          <span>Técnica correta</span>
          <ChevronDown size={18} className={expanded ? "is-open" : ""} />
        </button>
        {expanded && <p className="tr-cue">{exercise.cue}</p>}
      </div>
    </article>
  );
}

export function TrincadoApp() {
  const [selectedDay, setSelectedDay] = useState<WorkoutDayCode>(getTodayWorkoutCode());
  const [progress, setProgress] = useState<CompletionMap>(() => loadProgress());
  const [restSeconds, setRestSeconds] = useState(0);
  const [view, setView] = useState<"treino" | "metodo">("treino");
  const workout = getWorkoutByCode(selectedDay);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (restSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRestSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restSeconds]);

  const summary = useMemo(() => {
    const total = workout.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
    const done = workout.exercises.reduce((sum, exercise) => {
      const setsDone = Array.from({ length: exercise.sets }, (_, index) =>
        Boolean(progress[progressKey(selectedDay, exercise.id, index)]),
      ).filter(Boolean).length;
      return sum + setsDone;
    }, 0);
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [progress, selectedDay, workout]);

  const toggleSet = (exercise: TrincadoExercise, setIndex: number) => {
    const key = progressKey(selectedDay, exercise.id, setIndex);
    const wasDone = Boolean(progress[key]);
    setProgress((current) => ({ ...current, [key]: !wasDone }));
    if (!wasDone && exercise.rest > 0) setRestSeconds(exercise.rest);
  };

  const resetToday = () => {
    const prefix = `${todayKey()}:`;
    setProgress((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(prefix))),
    );
    setRestSeconds(0);
  };

  return (
    <div className="trincado-app">
      <header className="tr-header">
        <div>
          <div className="tr-brand"><Flame size={19} /> PROJETO TRINCADO</div>
          <h1>12 semanas para secar sem perder músculo</h1>
          <p>Musculação forte, cardio inteligente e progressão.</p>
        </div>
        <div className="tr-score" aria-label={`${summary.percent}% do treino concluído`}>
          <strong>{summary.percent}%</strong>
          <span>hoje</span>
        </div>
      </header>

      {restSeconds > 0 && (
        <button className="tr-rest-banner" type="button" onClick={() => setRestSeconds(0)}>
          <TimerReset size={20} />
          <span>Descanso</span>
          <strong>{Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, "0")}</strong>
          <small>toque para pular</small>
        </button>
      )}

      <nav className="tr-main-tabs" aria-label="Seções">
        <button type="button" className={view === "treino" ? "active" : ""} onClick={() => setView("treino")}>
          <Dumbbell size={18} /> Treino
        </button>
        <button type="button" className={view === "metodo" ? "active" : ""} onClick={() => setView("metodo")}>
          <TrendingUp size={18} /> Método
        </button>
      </nav>

      {view === "treino" ? (
        <main className="tr-main">
          <section className="tr-day-strip" aria-label="Dias de treino">
            {trincadoPlan.map((day) => (
              <button
                key={day.code}
                type="button"
                className={selectedDay === day.code ? "active" : ""}
                onClick={() => setSelectedDay(day.code)}
              >
                <small>{day.shortLabel}</small>
                <b>{day.code}</b>
              </button>
            ))}
          </section>

          <section className="tr-workout-hero">
            <div className="tr-workout-icon"><Dumbbell /></div>
            <div>
              <small>TREINO {workout.code}</small>
              <h2>{workout.title}</h2>
              <p>{workout.subtitle}</p>
            </div>
          </section>

          <section className="tr-progress-card">
            <div>
              <span>Progresso do treino</span>
              <b>{summary.done} de {summary.total} séries</b>
            </div>
            <div className="tr-progress-track"><i style={{ width: `${summary.percent}%` }} /></div>
          </section>

          {workout.cardio && (
            <section className="tr-cardio-note">
              <Gauge size={21} />
              <div><small>CARDIO DO DIA</small><p>{workout.cardio}</p></div>
            </section>
          )}

          <section className="tr-exercise-list">
            {workout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                day={selectedDay}
                progress={progress}
                onToggleSet={toggleSet}
              />
            ))}
          </section>

          <section className="tr-finish-card">
            {summary.percent === 100 ? <CircleCheckBig size={28} /> : <CalendarDays size={28} />}
            <div>
              <strong>{summary.percent === 100 ? "Treino concluído!" : "Consistência vence intensidade aleatória."}</strong>
              <p>{summary.percent === 100 ? "Bom trabalho. Agora recupere e volte forte no próximo treino." : "Marque cada série. O app salva o progresso neste aparelho."}</p>
            </div>
            <button type="button" onClick={resetToday}><RotateCcw size={16} /> Resetar hoje</button>
          </section>
        </main>
      ) : (
        <main className="tr-main tr-method">
          <section className="tr-method-hero">
            <small>METODOLOGIA</small>
            <h2>Secar sem virar escravo do cardio</h2>
            <p>O objetivo é reduzir gordura mantendo força e massa muscular. A definição vem do conjunto, não de centenas de abdominais.</p>
          </section>

          <section className="tr-phase-grid">
            <article><span>01</span><div><small>SEMANAS 1–4</small><h3>Base</h3><p>Domine técnica, registre cargas e termine a maioria das séries com 1–3 repetições na reserva.</p></div></article>
            <article><span>02</span><div><small>SEMANAS 5–8</small><h3>Progressão</h3><p>Quando atingir o topo da faixa de repetições com boa técnica, aumente a carga gradualmente.</p></div></article>
            <article><span>03</span><div><small>SEMANAS 9–12</small><h3>Definição</h3><p>Mantenha musculação forte e ajuste cardio/alimentação sem derrubar sua performance.</p></div></article>
          </section>

          <section className="tr-rules">
            <h3>Regras do projeto</h3>
            <div><b>1</b><p><strong>Musculação é prioridade.</strong> Cardio complementa o déficit; não substitui treino de força.</p></div>
            <div><b>2</b><p><strong>Progrida com controle.</strong> Mais carga só vale quando a execução continua boa.</p></div>
            <div><b>3</b><p><strong>Recupere.</strong> Sono e descanso fazem parte do programa.</p></div>
            <div><b>4</b><p><strong>Dor aguda não é meta.</strong> Interrompa o exercício se houver dor incomum, tontura ou mal-estar.</p></div>
          </section>
        </main>
      )}

      <footer className="tr-footer">
        <span>Corpus Fit • Projeto Trincado</span>
        <small>GIFs anatômicos e dados do treino ficam disponíveis offline.</small>
      </footer>
    </div>
  );
}
