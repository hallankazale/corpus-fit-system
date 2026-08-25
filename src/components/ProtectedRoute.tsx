import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSessionStatus, subscribeToAuth } from "../services/authService";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "guest">("loading");

  useEffect(() => {
    let mounted = true;
    getSessionStatus().then((authenticated) => {
      if (mounted) setStatus(authenticated ? "authenticated" : "guest");
    });

    const unsubscribe = subscribeToAuth((authenticated) => {
      if (mounted) setStatus(authenticated ? "authenticated" : "guest");
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return <div className="phone-shell"><div className="auth-loading">Verificando sua sessão...</div></div>;
  }

  if (status === "guest") return <Navigate to="/login" replace />;
  return children;
}
