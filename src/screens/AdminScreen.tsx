import { CheckCircle2, CreditCard, LockKeyhole, LockOpen, RefreshCw, Search, Settings2, ShieldCheck, UserCheck, UsersRound, WalletCards } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Modal } from "../components/Modal";
import {
  adminRegisterPayment,
  adminSetAccess,
  adminSetMembership,
  adminSetProfileStatus,
  listAdminAccounts,
  listAdminPayments,
  membershipStatusLabels,
  paymentMethodLabels,
  profileStatusLabels,
  roleLabels,
  type AdminAccount,
  type MembershipStatus,
  type PaymentMethod,
  type PaymentRecord,
  type ProfileStatus,
} from "../services/accountService";
import { formatCurrency } from "../utils/format";

export function AdminScreen() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminAccount | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [action, setAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("active");
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [planStatus, setPlanStatus] = useState<MembershipStatus>("pending");
  const [nextDueDate, setNextDueDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [paymentNextDueDate, setPaymentNextDueDate] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [accessReason, setAccessReason] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const next = await listAdminAccounts();
      setAccounts(next);
      return next;
    } catch (err) {
      setError(readError(err, "Não foi possível carregar a administração."));
      return [] as AdminAccount[];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => ({
    total: accounts.length,
    students: accounts.filter((item) => item.role === "student").length,
    activePlans: accounts.filter((item) => item.role === "student" && item.membership?.status === "active").length,
    access: accounts.filter((item) => item.role === "student" && item.membership?.access_enabled).length,
  }), [accounts]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter((item) => item.full_name.toLowerCase().includes(term) || String(item.membership_number).includes(term));
  }, [accounts, query]);

  const openManage = async (item: AdminAccount) => {
    if (item.role !== "student") return;
    setSelected(item);
    setFeedback(null);
    setProfileStatus(item.status);
    setPlanName(item.membership?.plan_name === "Sem plano" ? "" : (item.membership?.plan_name ?? ""));
    setPlanAmount(item.membership?.amount_cents ? (item.membership.amount_cents / 100).toFixed(2).replace(".", ",") : "");
    setPlanStatus(item.membership?.status ?? "pending");
    setNextDueDate(item.membership?.next_due_date ?? "");
    setPaymentAmount(item.membership?.amount_cents ? (item.membership.amount_cents / 100).toFixed(2).replace(".", ",") : "");
    setPaymentMethod("pix");
    setPaymentNextDueDate(item.membership?.next_due_date ?? "");
    setPaymentNote("");
    setAccessReason("");
    try { setPayments(await listAdminPayments(item.id)); } catch { setPayments([]); }
  };

  const refreshSelected = async (message: string) => {
    const next = await load();
    if (!selected) return;
    const updated = next.find((item) => item.id === selected.id) ?? null;
    setSelected(updated);
    if (updated) {
      setProfileStatus(updated.status);
      setPlanStatus(updated.membership?.status ?? "pending");
      setPlanName(updated.membership?.plan_name === "Sem plano" ? "" : (updated.membership?.plan_name ?? ""));
      setPlanAmount(updated.membership?.amount_cents ? (updated.membership.amount_cents / 100).toFixed(2).replace(".", ",") : "");
      setNextDueDate(updated.membership?.next_due_date ?? "");
      setPayments(await listAdminPayments(updated.id));
    }
    setFeedback({ tone: "success", text: message });
  };

  const runAction = async (name: string, work: () => Promise<unknown>, success: string) => {
    try {
      setAction(name);
      setFeedback(null);
      await work();
      await refreshSelected(success);
    } catch (err) {
      setFeedback({ tone: "error", text: readError(err, "Não foi possível concluir a ação.") });
    } finally {
      setAction(null);
    }
  };

  const savePlan = () => {
    if (!selected) return;
    const cents = toCents(planAmount);
    if (!planName.trim()) return setFeedback({ tone: "error", text: "Informe o nome do plano." });
    if (cents < 0) return setFeedback({ tone: "error", text: "Informe um valor válido." });
    void runAction("plan", () => adminSetMembership({
      userId: selected.id,
      planName,
      amountCents: cents,
      status: planStatus,
      nextDueDate: nextDueDate || null,
      accessEnabled: Boolean(selected.membership?.access_enabled) && planStatus === "active",
    }), "Plano atualizado com sucesso.");
  };

  const saveStatus = () => {
    if (!selected) return;
    void runAction("status", () => adminSetProfileStatus(selected.id, profileStatus), "Situação do cadastro atualizada.");
  };

  const registerPayment = () => {
    if (!selected) return;
    const cents = toCents(paymentAmount);
    if (cents <= 0) return setFeedback({ tone: "error", text: "Informe o valor recebido." });
    void runAction("payment", () => adminRegisterPayment({
      userId: selected.id,
      amountCents: cents,
      method: paymentMethod,
      nextDueDate: paymentNextDueDate || null,
      note: paymentNote,
    }), "Pagamento registrado. Plano e acesso foram regularizados.");
  };

  const toggleAccess = () => {
    if (!selected?.membership) return;
    const enabled = !selected.membership.access_enabled;
    void runAction("access", () => adminSetAccess({ userId: selected.id, enabled, reason: accessReason }), enabled ? "Acesso liberado." : "Acesso bloqueado.");
  };

  return (
    <AppShell title="Administração" hideBottomNav>
      <div className="page-pad admin-page">
        <div className="page-heading admin-heading">
          <div><h1>Painel administrativo</h1><p>Alunos, planos, pagamentos e acesso em um só lugar.</p></div>
          <button className="icon-button" onClick={() => void load()} aria-label="Atualizar painel"><RefreshCw /></button>
        </div>

        <div className="admin-metrics">
          <AdminMetric label="Usuários" value={stats.total} />
          <AdminMetric label="Alunos" value={stats.students} />
          <AdminMetric label="Planos ativos" value={stats.activePlans} />
          <AdminMetric label="Acessos liberados" value={stats.access} />
        </div>

        <section className="section-card admin-security-note"><ShieldCheck /><div><b>Gestão protegida</b><p>As ações abaixo passam pelas permissões do Supabase e ficam vinculadas à sessão da equipe.</p></div></section>

        <label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou matrícula" aria-label="Buscar usuário" /></label>

        <section className="section-card admin-users-card">
          <div className="section-heading"><h2><UsersRound size={19}/> Usuários cadastrados</h2><span>{filtered.length}</span></div>
          {loading && <div className="admin-empty">Carregando usuários...</div>}
          {error && <div className="form-error" role="alert">{error}</div>}
          {!loading && !error && filtered.length === 0 && <div className="admin-empty">Nenhum usuário encontrado.</div>}
          {!loading && !error && filtered.map((item) => (
            <article className="admin-user-row" key={item.id}>
              <div className="profile-avatar admin-avatar">{initials(item.full_name)}</div>
              <div className="admin-user-main">
                <h3>{item.full_name || "Usuário sem nome"}</h3>
                <p>Matrícula #{item.membership_number}</p>
                <div className="admin-user-tags"><span>{roleLabels[item.role]}</span><span className={item.status === "blocked" ? "danger" : ""}>{profileStatusLabels[item.status]}</span></div>
              </div>
              <div className="admin-user-plan">
                <b>{item.role === "student" ? (item.membership?.plan_name ?? "Sem plano") : "Conta interna"}</b>
                <small>{item.role === "student" ? (item.membership ? membershipStatusLabels[item.membership.status] : "Plano não atribuído") : "Equipe da academia"}</small>
                {item.role === "student" && <span className={item.membership?.access_enabled ? "access-on" : "access-off"}>{item.membership?.access_enabled ? "Acesso liberado" : "Acesso bloqueado"}</span>}
              </div>
              {item.role === "student" ? (
                <button className="outline-button admin-manage-button" onClick={() => void openManage(item)}><Settings2 size={17}/> Gerenciar</button>
              ) : (
                <span className="admin-help">Conta da equipe</span>
              )}
            </article>
          ))}
        </section>

        {selected && (
          <Modal title={`Gerenciar #${selected.membership_number}`} onClose={() => setSelected(null)}>
            <div className="admin-manage-modal">
              <div className="admin-person-summary">
                <div className="profile-avatar admin-avatar">{initials(selected.full_name)}</div>
                <div><h3>{selected.full_name}</h3><p>{roleLabels[selected.role]} • {profileStatusLabels[selected.status]}</p></div>
              </div>

              {feedback && <div className={feedback.tone === "success" ? "form-success" : "form-error"} role="status">{feedback.text}</div>}

              <section className="admin-action-section">
                <div className="admin-action-title"><UserCheck /><div><b>Situação do cadastro</b><small>Ative, desative ou bloqueie o usuário.</small></div></div>
                <div className="admin-inline-form">
                  <select value={profileStatus} onChange={(event) => setProfileStatus(event.target.value as ProfileStatus)} aria-label="Situação do cadastro">
                    {Object.entries(profileStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button className="primary-button compact" disabled={Boolean(action)} onClick={saveStatus}>{action === "status" ? "Salvando..." : "Atualizar"}</button>
                </div>
              </section>

              <section className="admin-action-section">
                <div className="admin-action-title"><WalletCards /><div><b>Plano do aluno</b><small>Defina valor, vencimento e situação.</small></div></div>
                <div className="admin-form-grid">
                  <label><span>Plano</span><input value={planName} onChange={(event) => setPlanName(event.target.value)} placeholder="Ex.: Plano Mensal" /></label>
                  <label><span>Valor (R$)</span><input inputMode="decimal" value={planAmount} onChange={(event) => setPlanAmount(event.target.value)} placeholder="99,90" /></label>
                  <label><span>Status</span><select value={planStatus} onChange={(event) => setPlanStatus(event.target.value as MembershipStatus)}>{Object.entries(membershipStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>Próximo vencimento</span><input type="date" value={nextDueDate} onChange={(event) => setNextDueDate(event.target.value)} /></label>
                </div>
                <button className="primary-button" disabled={Boolean(action)} onClick={savePlan}>{action === "plan" ? "Salvando plano..." : "Salvar plano"}</button>
              </section>

              <section className="admin-action-section">
                <div className="admin-action-title"><CreditCard /><div><b>Registrar pagamento</b><small>Confirma o recebimento e regulariza o acesso.</small></div></div>
                <div className="admin-form-grid">
                  <label><span>Valor recebido (R$)</span><input inputMode="decimal" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} placeholder="99,90" /></label>
                  <label><span>Forma</span><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>{Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>Novo vencimento</span><input type="date" value={paymentNextDueDate} onChange={(event) => setPaymentNextDueDate(event.target.value)} /></label>
                  <label><span>Observação</span><input value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} placeholder="Opcional" /></label>
                </div>
                <button className="primary-button" disabled={Boolean(action) || !selected.membership} onClick={registerPayment}><CheckCircle2 /> {action === "payment" ? "Registrando..." : "Confirmar pagamento"}</button>
                {!selected.membership && <small className="admin-help">Primeiro atribua um plano ao usuário.</small>}
              </section>

              <section className="admin-action-section">
                <div className="admin-action-title">{selected.membership?.access_enabled ? <LockOpen /> : <LockKeyhole />}<div><b>Controle de acesso</b><small>Liberação manual para a futura integração com catraca.</small></div></div>
                <label className="admin-wide-label"><span>Motivo</span><input value={accessReason} onChange={(event) => setAccessReason(event.target.value)} placeholder="Ex.: liberação pela recepção" /></label>
                <button className={selected.membership?.access_enabled ? "danger-button" : "primary-button"} disabled={Boolean(action) || !selected.membership || (!selected.membership.access_enabled && selected.membership.status !== "active")} onClick={toggleAccess}>
                  {selected.membership?.access_enabled ? <><LockKeyhole /> {action === "access" ? "Bloqueando..." : "Bloquear acesso"}</> : <><LockOpen /> {action === "access" ? "Liberando..." : "Liberar acesso"}</>}
                </button>
                {selected.membership && !selected.membership.access_enabled && selected.membership.status !== "active" && <small className="admin-help">Para liberar, o plano precisa estar ativo.</small>}
              </section>

              <section className="admin-action-section">
                <div className="admin-action-title"><WalletCards /><div><b>Pagamentos recentes</b><small>Registros reais deste usuário.</small></div></div>
                <div className="admin-payment-history">
                  {payments.length === 0 && <div className="admin-empty compact">Nenhum pagamento registrado.</div>}
                  {payments.map((payment) => <div className="admin-payment-item" key={payment.id}><span><b>{formatDate(payment.paid_at ?? payment.created_at)}</b><small>{paymentMethodLabels[payment.method]}</small></span><strong>{formatCurrency(payment.amount_cents / 100)}</strong></div>)}
                </div>
              </section>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

function AdminMetric({ label, value }: { label: string; value: number }) { return <div className="admin-metric"><small>{label}</small><strong>{value}</strong></div>; }
function initials(name: string) { const parts = name.trim().split(/\s+/).filter(Boolean); return ((parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "")).toUpperCase(); }
function toCents(value: string) { const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, ""); const number = Number(normalized); return Number.isFinite(number) ? Math.round(number * 100) : -1; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }
function readError(error: unknown, fallback: string) { if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || fallback); return fallback; }
