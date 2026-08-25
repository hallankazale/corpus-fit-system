import { CalendarCheck2, Clock3, Dumbbell, Info, UsersRound } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useAppState } from "../state/AppState";

export function ClassesScreen(){
 const {classes,reserveClass}=useAppState();
 return <AppShell title="Aulas"><div className="page-pad"><section className="hero-card next-class"><div className="round-icon yellow large"><CalendarCheck2/></div><div><p>Próxima reserva</p><h2>Funcional</h2><span><Clock3 size={16}/> Hoje • 19:00</span><span><UsersRound size={16}/> 3 vagas restantes</span></div><b className="yellow-badge">Confirmada</b></section>
 <div className="days-row">{['Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=><button className={d==='Qui'?'active':''} key={d}>{d}</button>)}</div>
 <section className="classes-panel"><h2><CalendarCheck2/> Quinta-feira, 07 de junho</h2>{classes.map(c=><article className="class-card" key={c.id}><div className={`round-icon ${c.title==='Mobilidade'?'green':'yellow'} large`}>{c.title==='Mobilidade'?<UsersRound/>:<Dumbbell/>}</div><div className="class-info"><h3>{c.title}</h3><p>{c.instructor}</p><span><UsersRound size={15}/> {c.status==='reserved'?'Reserva confirmada':c.vacancies>0?`${c.vacancies} vagas disponíveis`:'Lista de espera'}</span></div><div className="class-action"><b><Clock3 size={16}/>{c.time}</b><button className={c.status==='reserved'?'reserved':c.status==='waitlist'?'waitlist':'reserve'} onClick={()=>reserveClass(c.id)}>{c.status==='reserved'?'Reservada':c.status==='waitlist'?'Entrar na fila':'Reservar'}</button></div></article>)}<div className="info-strip"><Info/> As vagas das aulas são liberadas 1 hora antes do início da aula.</div></section>
 </div></AppShell>
}
