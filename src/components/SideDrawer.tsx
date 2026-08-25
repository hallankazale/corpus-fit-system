import { Bell, CalendarDays, ClipboardCheck, CreditCard, Dumbbell, Info, LogOut, Moon, Settings, SunMedium, UserRound, UsersRound, X, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { useAppState } from "../state/AppState";
import { getCurrentUser, signOut } from "../services/authService";

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
  const [displayName, setDisplayName] = useState("Aluno");
  const unread = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (!open) return;
    getCurrentUser().then((user) => {
      if (!user) return;
      const name = String(user.user_metadata?.full_name ?? "").trim();
      setDisplayName(name || user.email || "Aluno");
    });
  }, [open]);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const logout = async () => {
    await signOut();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`drawer-backdrop ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden={!open}>
      <aside className={`side-drawer ${open ? "is-open" : ""}`} onClick={(event) => event.stopPropagation()}>
        <div className="side-drawer__head">
          <BrandLogo compact />
          <button className="icon-button icon-button--light" onClick={onClose} aria-label="Fechar menu"><X /></button>
        </div>
        <h3>{displayName}</h3>
        <span className="role-chip">Aluno</span>
        <div className="side-drawer__links">
          {links.map(([path, label, Icon]) => (
            <button key={path} className={location.pathname === path || (path !== "/" && location.pathname.startsWith(path)) ? "is-current" : ""} onClick={() => go(path)}>
              <Icon size={21} />
              <span>{label}</span>
              {label === "Notificações" && unread > 0 && <b>{unread}</b>}
            </button>
          ))}
          <button onClick={toggleTheme}>
            {theme === "dark" ? <SunMedium size={21} /> : <Moon size={21} />}
            <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
            <span className={`mini-toggle ${theme === "dark" ? "is-active" : ""}`} />
          </button>
          <button onClick={() => go("/sobre")}><Info size={21} /><span>Sobre</span></button>
          <button className="danger-link" onClick={logout}><LogOut size={21} /><span>Sair</span></button>
        </div>
      </aside>
    </div>
  );
}
