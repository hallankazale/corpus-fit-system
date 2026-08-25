import { CalendarDays, Dumbbell, Home, TrendingUp, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/treinos", label: "Treinos", icon: Dumbbell },
  { to: "/aulas", label: "Aulas", icon: CalendarDays },
  { to: "/evolucao", label: "Evolução", icon: TrendingUp },
  { to: "/perfil", label: "Perfil", icon: UserRound },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `bottom-nav__item ${isActive ? "is-active" : ""}`}>
          <Icon size={22} /><span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
