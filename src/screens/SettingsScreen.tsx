import { Bell, Fingerprint, LockKeyhole, Moon, RotateCcw, ShieldCheck, Smartphone, SunMedium, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Modal } from "../components/Modal";
import { useAppState } from "../state/AppState";

export function SettingsScreen() {
  const { theme, setTheme, resetDemoData } = useAppState();
  const [settings, setSettings] = useState({ push: true, classReminders: true, payments: true, dark: theme === "dark", biometric: false, publicData: false });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettings((current) => ({ ...current, dark: theme === "dark" }));
  }, [theme]);

  const toggle = (key: keyof typeof settings) => {
    setSettings((current) => {
      const next = !current[key];
      if (key === "dark") setTheme(next ? "dark" : "light");
      return { ...current, [key]: next };
    });
  };

  return (
    <AppShell title="Configurações">
      <div className="page-pad">
        <div className="page-heading"><h1>Configurações</h1><p>Preferências, privacidade e segurança.</p></div>
        <SettingsGroup title="Notificações">
          <Setting icon={<Bell />} label="Notificações push" value={settings.push} onChange={() => toggle("push")} />
          <Setting icon={<Bell />} label="Lembretes de aula" value={settings.classReminders} onChange={() => toggle("classReminders")} />
          <Setting icon={<Smartphone />} label="Avisos de pagamento" value={settings.payments} onChange={() => toggle("payments")} />
        </SettingsGroup>
        <SettingsGroup title="Aparência e privacidade">
          <Setting icon={settings.dark ? <SunMedium /> : <Moon />} label="Modo escuro" value={settings.dark} onChange={() => toggle("dark")} />
          <Setting icon={<ShieldCheck />} label="Compartilhar dados públicos" value={settings.publicData} onChange={() => toggle("publicData")} />
        </SettingsGroup>
        <SettingsGroup title="Segurança">
          <Setting icon={<Fingerprint />} label="Acesso por biometria" value={settings.biometric} onChange={() => toggle("biometric")} />
          <button className="settings-action" onClick={() => setMessage("Fluxo de alteração de senha será conectado ao backend seguro na próxima etapa.")}><LockKeyhole /> Alterar senha</button>
          <button className="settings-action" onClick={() => setMessage("Aqui vamos mostrar dispositivos conectados e permitir encerrar sessões ativas.")}><UserRound /> Gerenciar sessão</button>
          <button className="settings-action settings-action--danger" onClick={() => { resetDemoData(); setMessage("Dados de demonstração restaurados com sucesso."); }}><RotateCcw /> Restaurar dados de demonstração</button>
        </SettingsGroup>

        {message && <Modal title="Configurações" onClose={() => setMessage(null)}><div className="modal-content-stack"><p>{message}</p><button className="primary-button" onClick={() => setMessage(null)}>Fechar</button></div></Modal>}
      </div>
    </AppShell>
  );
}
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) { return <section className="section-card settings-group"><h2>{title}</h2>{children}</section>; }
function Setting({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: boolean; onChange: () => void }) { return <div className="setting-row"><span>{icon}{label}</span><label className="switch"><input type="checkbox" checked={value} onChange={onChange} /><span /></label></div>; }
