import { CheckCircle2, ChevronRight, Clock3, Dumbbell, Minus, Plus, TimerReset, Weight } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";

export function ActiveWorkoutScreen(){
  const [sets,setSets]=useState([{kg:40,reps:10,done:true},{kg:40,reps:10,done:true},{kg:40,reps:10,done:false},{kg:40,reps:10,done:false}]);
  const update=(i:number,key:'kg'|'reps',delta:number)=>setSets(s=>s.map((row,index)=>index===i?{...row,[key]:Math.max(0,row[key]+delta)}:row));
  const toggle=(i:number)=>setSets(s=>s.map((row,index)=>index===i?{...row,done:!row.done}:row));
  return <AppShell title="Treino em andamento"><div className="page-pad active-workout">
    <div className="workout-progress"><span>Exercício 1 de 4</span><b><Clock3 size={17}/> 06:42</b><div><i/></div></div>
    <section className="active-hero"><div className="exercise-photo-placeholder"><Dumbbell size={72}/><span>Supino reto</span></div><div><h1>Supino reto</h1><p>Grupos musculares</p><div className="muscle-tags"><span>Peitoral maior</span><span>Tríceps</span></div><div className="active-meta"><span><Dumbbell/><small>Séries x reps</small><b>4 x 10</b></span><span><Weight/><small>Carga sugerida</small><b>40 kg</b></span><span><Clock3/><small>Descanso</small><b>60 s</b></span></div></div></section>
    <section className="sets-card"><h2>Suas séries</h2><div className="sets-head"><span>Série</span><span>Carga (kg)</span><span>Repetições</span><span>Status</span></div>{sets.map((row,i)=><div className="set-row" key={i}><button className={`set-number ${row.done?'done':''}`} onClick={()=>toggle(i)}>{i+1}</button><div className="stepper"><button onClick={()=>update(i,'kg',-1)}><Minus/></button><b>{row.kg}</b><button onClick={()=>update(i,'kg',1)}><Plus/></button></div><div className="stepper"><button onClick={()=>update(i,'reps',-1)}><Minus/></button><b>{row.reps}</b><button onClick={()=>update(i,'reps',1)}><Plus/></button></div><button className={`set-status ${row.done?'done':''}`} onClick={()=>toggle(i)}>{row.done?<><CheckCircle2/> Concluída</>:<><Clock3/> Pendente</>}</button></div>)}
      <button className="primary-button" onClick={()=>{const pending=sets.findIndex(s=>!s.done); if(pending>=0) toggle(pending)}}><CheckCircle2/> Concluir exercício</button><button className="outline-button">Próximo exercício <ChevronRight/></button>
    </section><div className="rest-timer"><TimerReset/><strong>00:60</strong><span>Descanso</span></div>
  </div></AppShell>
}
