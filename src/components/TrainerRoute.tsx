import { Navigate } from "react-router-dom";
import { useAccount } from "../state/AccountContext";

export function TrainerRoute({ children }: { children: React.ReactNode }) {
  const { account, loading } = useAccount();
  if (loading) return <div className="route-loading">Carregando...</div>;
  const role = account?.profile.role;
  if (role !== "trainer" && role !== "manager" && role !== "owner") return <Navigate to="/" replace />;
  return <>{children}</>;
}
