import { Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BRAND } from "../config/brand";
import { useAppState } from "../state/AppState";

export function TopBar({ title, onMenu }: { title?: string; onMenu: () => void }) {
  const { notifications } = useAppState();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      <button className="icon-button icon-button--light" onClick={onMenu} aria-label="Abrir menu"><Menu /></button>
      <div className="topbar__title">{title ?? <><strong>{BRAND.wordmark}</strong> {BRAND.descriptor}</>}</div>
      <button className="notification-button" onClick={() => navigate("/notificacoes")} aria-label="Notificações">
        <Bell />{unread > 0 && <span>{unread}</span>}
      </button>
    </header>
  );
}
