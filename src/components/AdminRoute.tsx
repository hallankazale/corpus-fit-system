import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { canAccessAdmin } from "../services/accountService";
import { useAccount } from "../state/AccountContext";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { account, loading } = useAccount();

  if (loading) {
    return <div className="phone-shell"><div className="auth-loading">Carregando permissões...</div></div>;
  }

  if (!account || !canAccessAdmin(account.profile.role)) return <Navigate to="/" replace />;
  return children;
}
