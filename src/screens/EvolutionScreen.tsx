import { Activity, CalendarDays, Dumbbell, Ruler, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { LineChart } from "../components/LineChart";
import { MetricCard } from "../components/MetricCard";
import { Modal } from "../components/Modal";
import { SectionCard } from "../components/SectionCard";

export function EvolutionScreen() {
  const [period, setPeriod] = useState("3 meses");
  const [historyOpen, setHistoryOpen] = useState(false);

  return <AppShell><div className="page-pad"><div className="page-heading"><h1>Evolução</h1><p>Acompanhe sua evolução e resultados</p></div>
    <div className="metric-grid"><MetricCard icon={Scale} label="Peso" value="82,4 kg" sub="↓ 2,1 kg" /><MetricCard icon={Activity} label="Gordura" value="18%" sub="↓ 1,8%" tone="yellow" /><MetricCard icon={Dumbbell} label="Massa magra" value="63 kg" sub="↑ 1,7 kg" tone="blue" /><MetricCard icon={Ruler} label="IMC" value="25,1" sub="● Adequado" tone="purple" /></div>
    <div className="segmented period-selector">{["30 dias", "3 meses", "1 ano"].map((p) => <button key={p} className={period === p ? "active" : ""} onClick={() => setPeriod(p)}>{p}</button>)}</div>
    <SectionCard className="chart-card"><h3>Evolução do peso (kg)</h3><LineChart /><div className="chart-labels"><span>07/03</span><span>28/03</span><span>18/04</span><span>09/05</span><span>07/06</span></div><div className="motivational">🏆 Você perdeu <b>2,1 kg</b> nos últimos 3 meses. <b>Continue assim!</b></div></SectionCard>
    <SectionCard className="assessment-card"><div className="section-heading"><h3>Última avaliação</h3><span><CalendarDays size={16} /> 07/06/2026</span></div><div className="professional"><div className="avatar-circle">LA</div><div><h3>Dr. Lucas Almeida</h3><p>Educador Físico</p><small>CREF: 123456-G/SP</small></div></div><div className="measurement-grid"><Measure icon={<Dumbbell />} label="Braço" value="31,5 cm" /><Measure icon={<Ruler />} label="Cintura" value="80,0 cm" /><Measure icon={<TrendingDown />} label="Quadril" value="96,0 cm" /><Measure icon={<TrendingUp />} label="Coxa" value="58,0 cm" /></div></SectionCard>
    <button className="primary-button" onClick={() => setHistoryOpen(true)}>Ver histórico completo</button>
    {historyOpen && <Modal title="Histórico de avaliações" onClose={() => setHistoryOpen(false)}><div className="modal-content-stack"><p>Na próxima etapa vamos exibir a linha do tempo completa de avaliações, medidas corporais e comparativos por período.</p><button className="primary-button" onClick={() => setHistoryOpen(false)}>Fechar</button></div></Modal>}
  </div></AppShell>;
}
function Measure({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="measure-item">{icon}<span>{label}<b>{value}</b></span></div>; }
