import { Bell, CalendarDays, Check, CreditCard, Dumbbell, Megaphone } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { useAppState } from "../state/AppState";

export function NotificationsScreen(){
 const {notifications,markRead,markAllRead}=useAppState(); const [filter,setFilter]=useState('Todas'); const visible=filter==='Todas'?notifications:notifications.filter(n=>n.category===filter);
 const icon=(title:string)=>title.includes('Pagamento')?<CreditCard/>:title.includes('aula')?<CalendarDays/>:title.includes('treino')?<Dumbbell/>:<Megaphone/>;
 return <AppShell><div className="page-pad"><div className="page-heading page-heading--inline"><div><h1>Notificações</h1><p>Acompanhe avisos importantes</p></div><button className="text-link" onClick={markAllRead}>Marcar todas</button></div><div className="filter-chips">{['Todas','Pagamentos','Aulas','Academia'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div><div className="notification-list">{visible.map(n=><article className={`notification-card ${!n.read?'unread':''}`} key={n.id}><div className="round-icon green">{icon(n.title)}</div><div><h3>{n.title}</h3><p>{n.message}</p><small>{n.time}</small></div>{!n.read?<button className="mark-read" onClick={()=>markRead(n.id)}><Check/> Ler</button>:<span className="read-dot"/>}</article>)}</div><div className="empty-end"><Bell/> Fim dos avisos</div></div></AppShell>
}
