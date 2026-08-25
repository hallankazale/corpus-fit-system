import type { ReactNode } from "react";

export function StatusChip({ children, tone = "success" }: { children: ReactNode; tone?: "success" | "warning" | "neutral" | "danger" }) {
  return <span className={`status-chip status-chip--${tone}`}>{children}</span>;
}
