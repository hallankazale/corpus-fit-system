import { CheckCircle2, ChevronRight, Clock3, Dumbbell, Minus, Plus, TimerReset, Weight } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";

const exerciseQueue = [
  { name: "Supino reto", muscles: ["Peitoral maior", "Tríceps"], load: "40 kg", rest: "60 s" },
  { name: "Crucifixo inclinado", muscles: ["Peitoral superior", "Deltoide anterior"], load: "14 kg", rest: "45 s" },
  { name: "Tríceps pulley", muscles: ["Tríceps lateral", "Tríceps longo"], load: "25 kg", rest: "45 s" },
  { name: "Mergulho no banco", muscles: ["Tríceps", "Peitoral"], load: "Peso corporal", rest: "60 s" },
];

const baseSets = [
  { kg: 40, reps: 10, done: true },
  { kg: 40, reps: 10, done: true },
  { kg: 40, reps: 10, done: false },
  { kg: 40, reps: 10, done: false },
];

export function ActiveWorkoutScreen() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [sets, setSets] = useState(baseSets);
  const [feedback, setFeedback] = useState("");
  const exercise = exerciseQueue[exerciseIndex];
  const update = (i: number, key: "kg" | "reps", delta: number) => setSets((s) => s.map((row, index) => index === i ? { ...row, [key]: Math.max(0, row[key] + delta) } : row));
  const toggle = (i: number) => setSets((s) => s.map((row, index) => index === i ? { ...row, done: !row.done } : row));
  const completedSets = useMemo(() => sets.filter((item) => item.done).length, [sets]);

  const completeExercise = () => {
    const pending = sets.findIndex((s) => !s.done);
    if (pending >= 0) {
      toggle(pending);
      return;
    }
    setFeedback("Todas as séries já foram concluídas.");
    setTimeout(() => setFeedback(""), 1800);
  };

  const nextExercise = () => {
    if (exerciseIndex >= exerciseQueue.length - 1) {
      setFeedback("Treino finalizado com sucesso.");
      setTimeout(() => setFeedback(""), 1800);
      return;
    }
    setExerciseIndex((current) => current + 1);
    setSets(baseSets.map((item, index) => ({ ...item, done: index < 2 })));
    setFeedback("Próximo exercício carregado.");
    setTimeout(() => setFeedback(""), 1800);
  };

  return <AppShell title="Treino em andamento"><div className="page-pad active-workout">
    <div className="workout-progress"><span>Exercício {exerciseIndex + 1} de {exerciseQueue.length}</span><b><Clock3 size={17} /> 06:42</b><div><i style={{ width: `${((exerciseIndex + completedSets / sets.length) / exerciseQueue.length) * 100}%` }} /></div></div>
    <section className="active-hero"><div className="exercise-photo-placeholder"><Dumbbell size={72} /><span>{exercise.name}</span></div><div><h1>{exercise.name}</h1><p>Grupos musculares</p><div className="muscle-tags">{exercise.muscles.map((muscle) => <span key={muscle}>{muscle}</span>)}</div><div className="active-meta"><span><Dumbbell /><small>Séries x reps</small><b>4 x 10</b></span><span><Weight /><small>Carga sugerida</small><b>{exercise.load}</b></span><span><Clock3 /><small>Descanso</small><b>{exercise.rest}</b></span></div></div></section>
    <section className="sets-card"><h2>Suas séries</h2><div className="sets-head"><span>Série</span><span>Carga (kg)</span><span>Repetições</span><span>Status</span></div>{sets.map((row, i) => <div className="set-row" key={i}><button className={`set-number ${row.done ? 'done' : ''}`} onClick={() => toggle(i)}>{i + 1}</button><div className="stepper"><button onClick={() => update(i, 'kg', -1)}><Minus /></button><b>{row.kg}</b><button onClick={() => update(i, 'kg', 1)}><Plus /></button></div><div className="stepper"><button onClick={() => update(i, 'reps', -1)}><Minus /></button><b>{row.reps}</b><button onClick={() => update(i, 'reps', 1)}><Plus /></button></div><button className={`set-status ${row.done ? 'done' : ''}`} onClick={() => toggle(i)}>{row.done ? <><CheckCircle2 /> Concluída</> : <><Clock3 /> Pendente</>}</button></div>)}
      <button className="primary-button" onClick={completeExercise}><CheckCircle2 /> Concluir exercício</button><button className="outline-button" onClick={nextExercise}>Próximo exercício <ChevronRight /></button>
    </section><div className="rest-timer"><TimerReset /><strong>00:60</strong><span>Descanso</span></div>{feedback && <div className="toast">{feedback}</div>}
  </div></AppShell>;
}
