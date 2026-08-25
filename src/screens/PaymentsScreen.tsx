import { AlertTriangle, CheckCircle2, Copy, CreditCard, FileText, History, Info, Loader2, LockKeyhole, LockOpen, PlusCircle, QrCode, ReceiptText, RefreshCw, WalletCards } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { Modal } from "../components/Modal";
import { createPixCharge, getOwnPaymentOrder, listOwnPayments, membershipStatusLabels, paymentMethodLabels, type PaymentRecord, type PixCharge } from "../services/accountService";
import { useAccount } from "../state/AccountContext";
import { formatCurrency } from "../utils/format";

export function PaymentsScreen() {
  const { account, loading: accountLoading, refreshAccount } = useAccount();
  const [tab, setTab] = useState<"plan" | "methods">("plan");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [message, setMessage] = useState<{ title: string; text: string } | null>(null);
  const [pixOpen, setPixOpen] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const membership = account?.membership ?? null;

  const loadPayments = useCallback(async () => {
    try { setLoadingPayments(true); setPayments(await listOwnPayments()); }
    catch { setPayments([]); }
    finally { setLoadingPayments(false); }
  }, []);

  useEffect(() => { void loadPayments(); }, [loadPayments, account?.user.id]);

  useEffect(() => {
    if (!pixOpen || !pixCharge || pixCharge.status !== "pending" || import.meta.env.MODE === "test") return;
    const timer = window.setInterval(async () => {
      try {
        const order = await getOwnPaymentOrder(pixCharge.orderId);
        if (!order) return;
        setPixCharge((current) => current ? { ...current, status: order.status, expiresAt: order.expires_at } : current);
        if (order.status === "paid") {
          window.clearInterval(timer);
          await Promise.all([refreshAccount(), loadPayments()]);
        }
      } catch { /* polling tenta novamente */ }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [pixOpen, pixCharge?.orderId, pixCharge?.status, refreshAccount, loadPayments]);

  const lastPayment = payments[0] ?? null;
  const membershipTone = membership?.status === "active" ? "success" : membership?.status === "overdue" ? "danger" : "warning";
  const dueLabel = membership?.next_due_date ? formatDate(membership.next_due_date) : "Não definido";
  const valueLabel = membership ? formatCurrency(membership.amount_cents / 100) : "R$ 0,00";

  const openPix = async () => {
    setPixOpen(true);
    setPixLoading(true);
    setPixError(null);
    setCopied(false);
    try { setPixCharge(await createPixCharge()); }
    catch (error) { setPixCharge(null); setPixError(readError(error, "Não foi possível gerar o PIX.")); }
    finally { setPixLoading(false); }
  };

  const copyPix = async () => {
    if (!pixCharge?.qrCode) return;
    try { await navigator.clipboard.writeText(pixCharge.qrCode); setCopied(true); }
    catch { setPixError("Não foi possível copiar automaticamente. Selecione o código abaixo e copie manualmente."); }
  };

  return (
    <AppShell title="Pagamentos" hideBottomNav>
      <div className="page-pad payments-page">
        <div className="payment-tabs"><button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>MEU PLANO</button><button className={tab === "methods" ? "active" : ""} onClick={() => setTab("methods")}>FORMAS DE PAGAMENTO</button></div>

        {tab === "methods" ? (
          <section className="section-card methods-card">
            <div className="admin-action-title"><WalletCards /><div><h2>Formas de pagamento</h2><p>PIX direto pelo aplicativo e registro presencial pela recepção.</p></div></div>
            <p>O PIX é criado no servidor e a confirmação chega por webhook. Dados e segredos do Mercado Pago não ficam expostos no celular.</p>
            <button className="primary-button" disabled={!membership || membership.amount_cents <= 0} onClick={() => void openPix()}><QrCode /> Gerar PIX</button>
            <button className="outline-button" onClick={() => setMessage({ title: "Cartão", text: "O cartão será a próxima forma online. A mesma arquitetura de webhook e confirmação automática já está preparada para receber essa integração." })}><PlusCircle /> Cartão — próxima etapa</button>
          </section>
        ) : accountLoading ? (
          <section className="section-card admin-empty">Carregando seu plano...</section>
        ) : !membership ? (
          <section className="section-card empty-plan-card">
            <WalletCards />
            <h2>Nenhum plano atribuído</h2>
            <p>Quando a recepção cadastrar seu plano, valor e vencimento, eles aparecerão aqui automaticamente.</p>
            <button className="outline-button" onClick={() => void refreshAccount()}><RefreshCw /> Atualizar</button>
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
              <button onClick={() => void openPix()} disabled={membership.amount_cents <= 0}><CreditCard /><span>Pagar mensalidade</span></button>
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
              <button className="yellow-button" onClick={() => void openPix()}>Pagar com PIX</button>
            </section>
            <div className="info-strip"><Info /> PIX confirmado automaticamente ativa o plano, atualiza o vencimento e gera a liberação de acesso.</div>
          </>
        )}

        {pixOpen && (
          <Modal title="Pagamento via PIX" onClose={() => setPixOpen(false)}>
            <div className="pix-live-modal">
              {pixLoading && <div className="pix-loading"><Loader2 className="spin" /><b>Gerando PIX seguro...</b><span>A cobrança é criada no servidor.</span></div>}
              {!pixLoading && pixError && <div className="form-error" role="alert">{pixError}</div>}
              {!pixLoading && pixCharge && pixCharge.status === "paid" && <div className="pix-paid"><CheckCircle2 /><h3>Pagamento confirmado!</h3><p>Seu plano e seu acesso foram atualizados automaticamente.</p></div>}
              {!pixLoading && pixCharge && pixCharge.status === "pending" && (
                <>
                  <div className="pix-amount"><small>Valor da mensalidade</small><strong>{formatCurrency(pixCharge.amountCents / 100)}</strong></div>
                  {pixCharge.qrCodeBase64 ? <img className="pix-qr-image" src={`data:image/png;base64,${pixCharge.qrCodeBase64}`} alt="QR Code PIX" /> : <div className="fake-qr"><QrCode size={116} /></div>}
                  <p className="pix-help">Escaneie o QR Code no aplicativo do seu banco ou copie o PIX abaixo.</p>
                  <code className="pix-copy-code">{pixCharge.qrCode ?? "Código PIX indisponível"}</code>
                  <button className="primary-button" disabled={!pixCharge.qrCode} onClick={() => void copyPix()}><Copy /> {copied ? "PIX copiado" : "Copiar PIX"}</button>
                  {pixCharge.expiresAt && <small className="pix-expiry">Válido até {formatDateTime(pixCharge.expiresAt)}</small>}
                  <div className="pix-waiting"><Loader2 className="spin" /> Aguardando confirmação do Mercado Pago...</div>
                </>
              )}
              {!pixLoading && !pixCharge && pixError && <button className="outline-button" onClick={() => void openPix()}><RefreshCw /> Tentar novamente</button>}
            </div>
          </Modal>
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function readError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || fallback);
  return fallback;
}
