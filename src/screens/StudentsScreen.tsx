import { Filter, MapPin, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Modal } from "../components/Modal";
import { publicProfiles } from "../mocks/data";
import { useAppState } from "../state/AppState";

export function StudentsScreen(){
 const [query,setQuery]=useState(''); const [filter,setFilter]=useState('Todos'); const {selectedPublicProfile,setSelectedPublicProfile}=useAppState();
 const profiles=useMemo(()=>publicProfiles.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).filter(p=>filter==='Todos'||filter==='Novos'&&p.isNew||filter==='Mais ativos'&&(p.activityScore??0)>=85),[query,filter]);
 return <AppShell><div className="page-pad"><section className="community-banner"><div className="community-brand"><UsersRound/><div><h2>Comunidade <span>que inspira</span></h2><p>Pessoas reais. Resultados reais.<br/>Juntos somos mais fortes.</p></div></div></section><div className="community-title"><h1>💪 Quem treina com a gente 💪</h1><p>* Alunos com perfil público</p></div><div className="search-row"><label><Search/><input aria-label="Buscar aluno" placeholder="Buscar aluno..." value={query} onChange={(e)=>setQuery(e.target.value)}/></label><button><Filter/></button></div><div className="filter-chips">{['Todos','Novos','Mais ativos'].map(f=><button className={filter===f?'active':''} key={f} onClick={()=>setFilter(f)}>{f}</button>)}</div><div className="student-grid">{profiles.map((p,index)=><article className="student-card" key={p.id}><div className={`student-photo palette-${index%4}`}>{p.initials}</div><div className="student-card__body"><h3>{p.name}</h3><span className="activity-tag">{p.activity}</span><p><MapPin/> {p.city}</p><button onClick={()=>setSelectedPublicProfile(p)}>Ver perfil</button></div></article>)}</div>{selectedPublicProfile&&<Modal title="Perfil público" onClose={()=>setSelectedPublicProfile(null)}><div className="profile-modal"><div className="student-photo large">{selectedPublicProfile.initials}</div><h2>{selectedPublicProfile.name}</h2><span className="activity-tag">{selectedPublicProfile.activity}</span><p><MapPin/> {selectedPublicProfile.city}</p><p>Perfil público demonstrativo. Dados de contato só aparecem quando o aluno autoriza explicitamente.</p></div></Modal>}</div></AppShell>
}
