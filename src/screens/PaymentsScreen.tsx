import { AlertTriangle, CheckCircle2, CreditCard, FileText, History, Info, LockKeyhole, LockOpen, PlusCircle, ReceiptText, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { Modal } from "../components/Modal";
import { listOwnPayments, membershipStatusLabels, paymentMethodLabels, type PaymentRecord } from "../services/accountService";
import { useAccount } from "../state/AccountContext";
import { formatCurrency } from "../utils/format";

export function PaymentsScreen() {
  const { account, loading: accountLoading, refreshAccount } = useAccount();
  const [tab, setTab] = useState<"plan" | "methods">("plan");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [message, setMessage] = useState<{ title: string; text: string } | null>(null);
  const membership = account?.membership ?? null;

  useEffect(() => {
    let mounted = true;
    setLoadingPayments(true);
    listOwnPayments()
      .then((items) => { if (mounted) setPayments(items); })
      .catch(() => { if (mounted) setPayments([]); })
      .finally(() => { if (mounted) setLoadingPayments(false); });
    return () => { mounted = false; };
  }, [account?.user.id]);

  const lastPayment = payments[0] ?? null;
  const membershipTone = membership?.status === "active" ? "success" : membership?.status === "overdue" ? "danger" : "warning";
  const dueLabel = membership?.next_due_date ? formatDate(membership.next_due_date) : "Não definido";
  const valueLabel = membership ? formatCurrency(membership.amount_cents / 100) : "R$ 0,00";

  const onlinePaymentMessage = useMemo(() => ({
    title: "Pagamento online",
    text: "O histórico e a confirmação pela recepção já são reais. O PIX/cartão automático será conectado ao gateway de pagamento na próxima etapa; por enquanto, a recepção registra o recebimento no painel administrativo.",
  }), []);

  return (
    <AppShell title="Pagamentos" hideBottomNav>
      <div className="page-pad payments-page">
        <div className="payment-tabs"><button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>MEU PLANO</button><button className={tab === "methods" ? "active" : ""} onClick={() => setTab("methods")}>FORMAS DE PAGAMENTO</button></div>

        {tab === "methods" ? (
          <section className="section-card methods-card">
            <div className="admin-action-title"><WalletCards /><div><h2>Formas de pagamento</h2><p>PIX, cartão, dinheiro e transferência já podem ser registrados pela recepção.</p></div></div>
            <p>O pagamento direto pelo aplicativo ainda não envia dinheiro: essa parte exige um gateway financeiro com webhook seguro para confirmar a transação.</p>
            <button className="outline-button" onClick={() => setMessage(onlinePaymentMessage)}><PlusCircle /> Ver próxima integração</button>
          </section>
        ) : accountLoading ? (
          <section className="section-card admin-empty">Carregando seu plano...</section>
        ) : !membership ? (
          <section className="section-card empty-plan-card">
            <WalletCards />
            <h2>Nenhum plano atribuído</h2>
            <p>Quando a recepção cadastrar seu plano, valor e vencimento, eles aparecerão aqui automaticamente.</p>
            <button className="outline-button" onClick={() => void refreshAccount()}>Atualizar</button>
          </section>
        ) : (
          <>
            <section className="hero-card payment-plan">
              <BrandLogo compact />
              <div className="hero-card__divider" />
              <div>
                <h2>{membership.plan_name}</h2>
                <span className={`status-chip status-chip--${membershipTone}`}>{membership.status === "active" ? <CheckCircle2 /> : <AlertTriangle />}{membershipStatusLabels[membership.status]}</span>
                <p>Próximo vencimento <b>{dueLabel}</b></p>
                <hr />
                <p>Valor <strong>{valueLabel}</strong></p>
                <span className={`status-chip ${membership.access_enabled ? "status-chip--success" : "status-chip--danger"}`}>{membership.access_enabled ? <LockOpen /> : <LockKeyhole />}{membership.access_enabled ? "Acesso liberado" : "Acesso bloqueado"}</span>
              </div>
            </section>

            <div className="three-actions">
              <button onClick={() => setMessage(onlinePaymentMessage)}><CreditCard /><span>Pagar mensalidade</span></button>
              <button onClick={() => lastPayment ? setMessage({ title: "Último recibo", text: `Pagamento de ${formatCurrency(lastPayment.amount_cents / 100)} em ${formatDate(lastPayment.paid_at ?? lastPayment.created_at)} via ${paymentMethodLabels[lastPayment.method]}. Registro: ${lastPayment.id.slice(0, 8).toUpperCase()}.` }) : setMessage({ title: "Recibo", text: "Ainda não há pagamento registrado para gerar recibo." })}><FileText /><span>Último recibo</span></button>
              <button onClick={() => document.getElementById("payment-history")?.scrollIntoView({ behavior: "smooth", block: "start" })}><History /><span>Histórico</span></button>
            </div>

            <h3 className="small-title" id="payment-history">Pagamentos registrados</h3>
            <section className="payment-list real-payment-list">
              {loadingPayments && <div className="admin-empty">Carregando pagamentos...</div>}
              {!loadingPayments && payments.length === 0 && <div className="admin-empty"><ReceiptText /> Nenhum pagamento registrado ainda.</div>}
              {!loadingPayments && payments.map((payment) => (
                <div className="payment-row" key={payment.id}>
                  <CheckCircle2 className="paid-icon" />
                  <span><b>{formatDate(payment.paid_at ?? payment.created_at)}</b><small>{membership.plan_name}</small></span>
                  <span>{paymentMethodLabels[payment.method]}</span>
                  <strong>{formatCurrency(payment.amount_cents / 100)}</strong>
                  <em>{payment.status === "paid" ? "Pago" : payment.status}</em>
                </div>
              ))}
            </section>

            <section className="pending-card real-due-card">
              <div>{membership.status === "active" ? "📅" : "⚠️"}</div>
              <span><small>Próximo vencimento</small><b>{dueLabel}</b><p>{membership.plan_name}</p></span>
              <span><small>Valor</small><b>{valueLabel}</b><em>{membershipStatusLabels[membership.status]}</em></span>
              <button className="yellow-button" onClick={() => setMessage(onlinePaymentMessage)}>Como pagar</button>
            </section>
            <div className="info-strip"><Info /> Pagamentos confirmados pela recepção atualizam o plano e o acesso automaticamente.</div>
          </>
        )}

        {message && <Modal title={message.title} onClose={() => setMessage(null)}><div className="modal-content-stack"><p>{message.text}</p><button className="primary-button" onClick={() => setMessage(null)}>Fechar</button></div></Modal>}
      </div>
    </AppShell>
  );
}

function formatDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}
