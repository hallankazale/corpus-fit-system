import { Bell, CalendarDays, ClipboardCheck, CreditCard, Dumbbell, Info, LogOut, Moon, Settings, UserRound, UsersRound, X, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { useAppState } from "../state/AppState";

const links = [
  ["/", "Início", Home],
  ["/treinos", "Treinos", Dumbbell],
  ["/evolucao", "Avaliações", ClipboardCheck],
  ["/aulas", "Aulas", CalendarDays],
  ["/pagamentos", "Pagamentos", CreditCard],
  ["/notificacoes", "Notificações", Bell],
  ["/perfil", "Meu Perfil", UserRound],
  ["/alunos", "Alunos", UsersRound],
  ["/configuracoes", "Configurações", Settings],
] as const;

export function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { notifications } = useAppState();
  const unread = notifications.filter((n) => !n.read).length;
  const go = (path: string) => { navigate(path); onClose(); };
  return (
    <div className={`drawer-backdrop ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden={!open}>
      <aside className={`side-drawer ${open ? "is-open" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="side-drawer__head">
          <BrandLogo compact />
          <button className="icon-button icon-button--light" onClick={onClose} aria-label="Fechar menu"><X /></button>
        </div>
        <h3>Hallan Fernando</h3><span className="role-chip">Aluno</span>
        <div className="side-drawer__links">
          {links.map(([path, label, Icon]) => (
            <button key={path} onClick={() => go(path)}><Icon size={21}/><span>{label}</span>{label === "Notificações" && unread > 0 && <b>{unread}</b>}</button>
          ))}
          <button><Moon size={21}/><span>Modo escuro</span><span className="mini-toggle" /></button>
          <button onClick={() => go("/sobre")}><Info size={21}/><span>Sobre</span></button>
          <button className="danger-link" onClick={() => go("/login")}><LogOut size={21}/><span>Sair</span></button>
        </div>
      </aside>
    </div>
  );
}
