import type { LucideIcon } from "lucide-react";
export function MetricCard({ icon: Icon, label, value, sub, tone = "green" }: { icon: LucideIcon; label: string; value: string; sub: string; tone?: "green" | "yellow" | "blue" | "purple" }) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__icon"><Icon size={20} /></div>
      <div className="metric-card__label">{label}</div>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}
