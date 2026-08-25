import { RefreshCw, ShieldCheck, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { listAdminAccounts, roleLabels, type AdminAccount } from "../services/accountService";

export function AdminScreen() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAccounts(await listAdminAccounts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a administração.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => ({
    total: accounts.length,
    students: accounts.filter((item) => item.role === "student").length,
    activePlans: accounts.filter((item) => item.membership?.status === "active").length,
    access: accounts.filter((item) => item.membership?.access_enabled).length,
  }), [accounts]);

  return (
    <AppShell title="Administração" hideBottomNav>
      <div className="page-pad admin-page">
        <div className="page-heading admin-heading">
          <div><h1>Painel administrativo</h1><p>Visão segura dos usuários e planos cadastrados.</p></div>
          <button className="icon-button" onClick={() => void load()} aria-label="Atualizar painel"><RefreshCw /></button>
        </div>
        <div className="admin-metrics">
          <AdminMetric label="Usuários" value={stats.total} />
          <AdminMetric label="Alunos" value={stats.students} />
          <AdminMetric label="Planos ativos" value={stats.activePlans} />
          <AdminMetric label="Acessos liberados" value={stats.access} />
        </div>
        <section className="section-card admin-security-note"><ShieldCheck /><div><b>Permissões ativas</b><p>Somente equipe autorizada pode consultar esta área.</p></div></section>
        <section className="section-card admin-users-card">
          <div className="section-heading"><h2><UsersRound size={19}/> Usuários cadastrados</h2><span>{accounts.length}</span></div>
          {loading && <div className="admin-empty">Carregando usuários...</div>}
          {error && <div className="form-error" role="alert">{error}</div>}
          {!loading && !error && accounts.length === 0 && <div className="admin-empty">Nenhum usuário cadastrado.</div>}
          {!loading && !error && accounts.map((item) => (
            <article className="admin-user-row" key={item.id}>
              <div className="profile-avatar admin-avatar">{initials(item.full_name)}</div>
              <div className="admin-user-main"><h3>{item.full_name || "Usuário sem nome"}</h3><p>Matrícula #{item.membership_number}</p><div className="admin-user-tags"><span>{roleLabels[item.role]}</span><span>{item.status === "active" ? "Ativo" : item.status}</span></div></div>
              <div className="admin-user-plan"><b>{item.membership?.plan_name ?? "Sem plano"}</b><small>{membershipLabel(item.membership?.status)}</small><span>{item.membership?.access_enabled ? "Acesso liberado" : "Acesso bloqueado"}</span></div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function AdminMetric({ label, value }: { label: string; value: number }) { return <div className="admin-metric"><small>{label}</small><strong>{value}</strong></div>; }
function initials(name: string) { const parts = name.trim().split(/\s+/).filter(Boolean); return (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? ""); }
function membershipLabel(status?: string) { if (status === "active") return "Plano ativo"; if (status === "overdue") return "Pagamento pendente"; if (status === "cancelled") return "Plano cancelado"; return "Aguardando plano"; }
