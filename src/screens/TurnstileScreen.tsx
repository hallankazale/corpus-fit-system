import { AlertTriangle, CheckCircle2, DoorOpen, LockKeyhole, RefreshCw, RotateCcw, ShieldCheck, TestTube2, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { listTurnstileCommands, retryTurnstileCommand, simulateTurnstileCommand, type TurnstileCommand } from "../services/turnstileService";

export function TurnstileScreen() {
  const [commands, setCommands] = useState<TurnstileCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setCommands(await listTurnstileCommands());
    } catch (error) {
      setFeedback({ tone: "error", text: readError(error, "Não foi possível carregar a fila da catraca.") });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const metrics = useMemo(() => ({
    pending: commands.filter((item) => item.status === "pending").length,
    processed: commands.filter((item) => item.status === "processed").length,
    failed: commands.filter((item) => item.status === "failed").length,
  }), [commands]);

  const process = async (item: TurnstileCommand, success: boolean) => {
    try {
      setProcessing(item.id);
      setFeedback(null);
      await simulateTurnstileCommand(item.id, success);
      setFeedback({ tone: success ? "success" : "error", text: success ? "Comando processado pelo simulador." : "Falha simulada registrada para testar recuperação." });
      await load();
    } catch (error) {
      setFeedback({ tone: "error", text: readError(error, "Não foi possível processar o comando.") });
    } finally {
      setProcessing(null);
    }
  };

  const retry = async (item: TurnstileCommand) => {
    try {
      setProcessing(item.id);
      await retryTurnstileCommand(item.id);
      setFeedback({ tone: "success", text: "Comando devolvido para a fila." });
      await load();
    } catch (error) {
      setFeedback({ tone: "error", text: readError(error, "Não foi possível reenviar o comando.") });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AppShell title="Catraca" hideBottomNav>
      <div className="page-pad turnstile-page">
        <div className="page-heading admin-heading">
          <div><h1>Controle de acesso</h1><p>Fila de liberação e bloqueio preparada para a catraca física.</p></div>
          <button className="icon-button" onClick={() => void load()} aria-label="Atualizar fila"><RefreshCw /></button>
        </div>

        <section className="section-card turnstile-warning">
          <WifiOff />
          <div><b>Gateway físico ainda não conectado</b><p>Esta tela está em modo de simulação. Nenhum equipamento físico será acionado até configurarmos o modelo/protocolo da catraca.</p></div>
        </section>

        <div className="admin-metrics">
          <Metric label="Pendentes" value={metrics.pending} />
          <Metric label="Processados" value={metrics.processed} />
          <Metric label="Falhas" value={metrics.failed} />
          <Metric label="Modo" value="SIM" />
        </div>

        <section className="section-card admin-security-note"><ShieldCheck /><div><b>Fluxo preparado</b><p>Pagamento ou ação da recepção gera um comando. O gateway da academia consumirá esta fila e devolverá a resposta do equipamento.</p></div></section>

        {feedback && <div className={feedback.tone === "success" ? "form-success" : "form-error"} role="status">{feedback.text}</div>}

        <section className="section-card turnstile-queue">
          <div className="section-heading"><h2><DoorOpen size={20} /> Fila de comandos</h2><span>{commands.length}</span></div>
          {loading && <div className="admin-empty">Carregando fila...</div>}
          {!loading && commands.length === 0 && <div className="admin-empty">Nenhum comando gerado ainda. Libere ou bloqueie um aluno no painel administrativo para criar o primeiro.</div>}
          {!loading && commands.map((item) => (
            <article className="turnstile-command" key={item.id}>
              <div className={`turnstile-command__icon ${item.command === "grant" ? "grant" : "revoke"}`}>
                {item.command === "grant" ? <DoorOpen /> : <LockKeyhole />}
              </div>
              <div className="turnstile-command__body">
                <div className="turnstile-command__top">
                  <div><h3>{item.student_name}</h3><p>{item.membership_number ? `Matrícula #${item.membership_number}` : "Matrícula não encontrada"}</p></div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="turnstile-command__meta">
                  <span>{item.command === "grant" ? "LIBERAR" : "BLOQUEAR"}</span>
                  <span>{sourceLabel(item.source)}</span>
                  <span>{formatDateTime(item.created_at)}</span>
                </div>
                {item.reason && <p className="turnstile-reason">{item.reason}</p>}
                <div className="turnstile-actions">
                  {item.status === "pending" && <>
                    <button className="primary-button compact" disabled={processing === item.id} onClick={() => void process(item, true)}><TestTube2 /> {processing === item.id ? "Processando..." : "Simular sucesso"}</button>
                    <button className="outline-button compact" disabled={processing === item.id} onClick={() => void process(item, false)}><AlertTriangle /> Simular falha</button>
                  </>}
                  {item.status === "failed" && <button className="outline-button compact" disabled={processing === item.id} onClick={() => void retry(item)}><RotateCcw /> Reenviar</button>}
                  {item.status === "processed" && <span className="turnstile-processed"><CheckCircle2 /> Processado {item.processed_at ? formatDateTime(item.processed_at) : ""}</span>}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) { return <div className="admin-metric"><small>{label}</small><strong>{value}</strong></div>; }
function StatusBadge({ status }: { status: TurnstileCommand["status"] }) {
  return <span className={`turnstile-status ${status}`}>{status === "pending" ? "Pendente" : status === "processed" ? "Processado" : "Falhou"}</span>;
}
function sourceLabel(source: string) { return source === "payment_webhook" ? "Pagamento automático" : source === "staff" ? "Recepção" : source; }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
function readError(error: unknown, fallback: string) { if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || fallback); return fallback; }
