import { CheckCircle2, Clock3, Dumbbell, Play, Weight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { workouts } from "../mocks/data";
import { useAccount } from "../state/AccountContext";

export function WorkoutsScreen(){
  const navigate=useNavigate();
  const { account } = useAccount();
  const [selected,setSelected]=useState('B');
  const workout=workouts.find(w=>w.id===selected) ?? workouts[1];
  return <AppShell title="Treinos"><div className="page-pad">
    <section className="hero-card user-summary"><BrandLogo compact/><div className="hero-card__divider"/><div><h2>{account?.profile.full_name || 'Aluno'}</h2><span className="status-chip status-chip--success"><CheckCircle2 size={15}/> {account?.profile.status === 'active' ? 'Ativo' : 'Inativo'}</span><p><Clock3 size={15}/> Matrícula #{account?.profile.membership_number ?? '—'}</p></div></section>
    <div className="segmented">{workouts.map(w=><button key={w.id} className={selected===w.id?'active':''} onClick={()=>setSelected(w.id)}>{w.title}</button>)}</div>
    <section className="workout-header"><div className="round-icon green"><Dumbbell/></div><div><h2>{workout.title} • {workout.subtitle}</h2><p>{workout.exercises.length || 4} exercícios</p></div></section>
    <div className="exercise-list">{(workout.exercises.length?workout.exercises:workouts[1].exercises).map((ex,index)=><article key={ex.id} className="exercise-card"><div className="exercise-thumb"><Dumbbell/></div><span className="number-dot">{index+1}</span><div className="exercise-main"><h3>{ex.name}</h3><div className="exercise-meta"><span><Dumbbell size={16}/><small>Séries x reps</small><b>{ex.sets}</b></span><span><Weight size={16}/><small>Carga sugerida</small><b>{ex.suggestedLoad}</b></span><span><Clock3 size={16}/><small>Descanso</small><b>{ex.restSeconds} seg</b></span></div></div></article>)}</div>
    <button className="primary-button sticky-action" onClick={()=>navigate('/treinos/ativo')}><Play size={19}/> Iniciar treino</button>
  </div></AppShell>
}
