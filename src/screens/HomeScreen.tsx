import { CalendarDays, CheckCircle2, CreditCard, Dumbbell, LockKeyhole, Target, UserRound, Weight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { LineChart } from "../components/LineChart";
import { SectionCard } from "../components/SectionCard";
import { StatusChip } from "../components/StatusChip";

export function HomeScreen() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="page-pad dashboard">
        <div className="welcome"><h1>Olá, <span>Hallan</span></h1><p>Seu painel da academia</p></div>
        <section className="hero-card hero-card--membership">
          <BrandLogo compact />
          <div className="hero-card__divider" />
          <div><h2>Plano Mensal</h2><div className="chip-row"><StatusChip><CheckCircle2 size={15}/> Pagamento em dia</StatusChip><StatusChip><LockKeyhole size={15}/> Catraca liberada</StatusChip><StatusChip tone="neutral"><CalendarDays size={15}/> Vencimento 08/09/2026</StatusChip></div></div>
        </section>
        <div className="two-col">
          <SectionCard className="action-card"><div className="round-icon green"><Dumbbell /></div><div><b className="green-text">Treino de hoje</b><h3>Treino B</h3><p>Peito e tríceps</p></div><button className="primary-button compact" onClick={()=>navigate('/treinos')}>Ver treino</button></SectionCard>
          <SectionCard className="action-card"><div className="round-icon yellow"><CalendarDays /></div><div><b className="yellow-text">Próxima aula</b><h3>Funcional</h3><p>19:00</p></div><button className="yellow-button compact" onClick={()=>navigate('/aulas')}>Reservar</button></SectionCard>
        </div>
        <SectionCard className="progress-card"><div className="section-heading"><h3>Minha evolução</h3><span className="select-pill">30 dias</span></div><div className="progress-grid"><div className="metric-stack"><div className="mini-metric green-bg"><Weight/><span>Peso atual<strong>82,4 kg</strong></span></div><div className="mini-metric yellow-bg"><Target/><span>Meta<strong>78 kg</strong></span></div></div><LineChart/></div><div className="motivational">🏆 Foco e consistência! Você está no caminho certo.</div></SectionCard>
        <section><h3 className="small-title">Acesso rápido</h3><div className="quick-grid"><Quick icon={<Dumbbell/>} label="Treinos" onClick={()=>navigate('/treinos')}/><Quick icon={<CalendarDays/>} label="Aulas" onClick={()=>navigate('/aulas')}/><Quick icon={<CreditCard/>} label="Pagamentos" onClick={()=>navigate('/pagamentos')}/><Quick icon={<UserRound/>} label="Perfil" onClick={()=>navigate('/perfil')}/></div></section>
      </div>
    </AppShell>
  );
}
function Quick({icon,label,onClick}:{icon:React.ReactNode;label:string;onClick:()=>void}){return <button className="quick-card" onClick={onClick}>{icon}<span>{label}</span></button>}
