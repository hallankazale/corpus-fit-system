import { Bell, CalendarDays, ClipboardCheck, CreditCard, DoorOpen, Dumbbell, GraduationCap, Home, Info, LogOut, Moon, Settings, ShieldCheck, SunMedium, UserRound, UsersRound, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { useAppState } from "../state/AppState";
import { signOut } from "../services/authService";
import { canAccessAdmin, roleLabels } from "../services/accountService";
import { useAccount } from "../state/AccountContext";

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
  const location = useLocation();
  const { notifications, theme, toggleTheme } = useAppState();
  const { account } = useAccount();
  const unread = notifications.filter((notification) => !notification.read).length;
  const displayName = account?.profile.full_name || account?.user.email || "Usuário";
  const role = account?.profile.role;
  const canManageWorkouts = role === "trainer" || role === "manager" || role === "owner";

  const go = (path: string) => { navigate(path); onClose(); };
  const logout = async () => { await signOut(); onClose(); navigate("/login", { replace: true }); };

  return (
    <div className={`drawer-backdrop ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden={!open}>
      <aside className={`side-drawer ${open ? "is-open" : ""}`} onClick={(event) => event.stopPropagation()}>
        <div className="side-drawer__head"><BrandLogo compact /><button className="icon-button icon-button--light" onClick={onClose} aria-label="Fechar menu"><X /></button></div>
        <h3>{displayName}</h3>
        <span className="role-chip">{account ? roleLabels[account.profile.role] : "Usuário"}</span>
        <div className="side-drawer__links">
          {links.map(([path, label, Icon]) => <button key={path} className={location.pathname === path || (path !== "/" && location.pathname.startsWith(path)) ? "is-current" : ""} onClick={() => go(path)}><Icon size={21} /><span>{label}</span>{label === "Notificações" && unread > 0 && <b>{unread}</b>}</button>)}
          {canManageWorkouts && <button className={location.pathname.startsWith("/professor") ? "is-current" : ""} onClick={() => go("/professor")}><GraduationCap size={21}/><span>Professor</span></button>}
          {canAccessAdmin(role) && <>
            <button className={location.pathname.startsWith("/admin") ? "is-current" : ""} onClick={() => go("/admin")}><ShieldCheck size={21}/><span>Administração</span></button>
            <button className={location.pathname.startsWith("/catraca") ? "is-current" : ""} onClick={() => go("/catraca")}><DoorOpen size={21}/><span>Catraca</span></button>
          </>}
          <button onClick={toggleTheme}>{theme === "dark" ? <SunMedium size={21} /> : <Moon size={21} />}<span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span><span className={`mini-toggle ${theme === "dark" ? "is-active" : ""}`} /></button>
          <button onClick={() => go("/sobre")}><Info size={21} /><span>Sobre</span></button>
          <button className="danger-link" onClick={() => void logout()}><LogOut size={21} /><span>Sair</span></button>
        </div>
      </aside>
    </div>
  );
}
