import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { GoogleIcon } from "../components/BrandIcons";
import { Modal } from "../components/Modal";
import { registerDemoAccount } from "../services/demoAuth";

export function RegisterScreen() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const phone = String(data.get("phone") ?? "");

    if (!name.trim() || !email.trim() || !phone.trim()) return setError("Preencha seus dados obrigatórios.");
    if (password.length < 6 || password !== confirm) return setError("As senhas devem ser iguais e ter ao menos 6 caracteres.");
    if (!accepted) return setError("Aceite os Termos de Uso e a Política de Privacidade.");

    setLoading(true);
    await registerDemoAccount({ name, email, phone, password });
    setLoading(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="auth-shell auth-shell--register">
      <div className="register-head"><BrandLogo compact /><div><h1>Criar conta</h1><p>Preencha seus dados para começar</p></div></div>
      <form className="register-card" onSubmit={submit}>
        <FormInput name="name" label="Nome completo" placeholder="Digite seu nome completo" icon={<UserRound />} />
        <FormInput name="email" label="E-mail" placeholder="Digite seu e-mail" icon={<Mail />} type="email" />
        <FormInput name="phone" label="Telefone" placeholder="Digite seu telefone" icon={<Phone />} />
        <FormInput name="password" label="Senha" placeholder="Digite sua senha" icon={<LockKeyhole />} type="password" value={password} onChange={setPassword} />
        <FormInput name="confirm" label="Confirmar senha" placeholder="Confirme sua senha" icon={<LockKeyhole />} type="password" value={confirm} onChange={setConfirm} />
        <label className="terms-check"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /> Li e aceito os <button type="button" className="inline-link-button" onClick={() => setTermsOpen(true)}><b>Termos de Uso</b> e <b>Política de Privacidade</b></button></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Criando conta..." : "Criar conta"}</button>
        <div className="divider"><span>ou</span></div>
        <button type="button" className="outline-button google-button" onClick={() => setGoogleOpen(true)}><GoogleIcon /> Continuar com Google</button>
      </form>
      <div className="auth-footer auth-footer--outside">Já tenho conta <Link to="/login">Entrar</Link></div>

      {termsOpen && <Modal title="Termos e privacidade" onClose={() => setTermsOpen(false)}><div className="modal-content-stack"><p>Seus dados pessoais serão usados apenas para cadastro, comunicação da academia e funcionamento do plano contratado.</p><button className="primary-button" onClick={() => setTermsOpen(false)}>Entendi</button></div></Modal>}
      {googleOpen && <Modal title="Cadastro com Google" onClose={() => setGoogleOpen(false)}><div className="modal-content-stack"><p>O cadastro real com Google será ativado junto com o Supabase. Nesta versão ele não cria sessão sem autenticação.</p><button className="primary-button" onClick={() => setGoogleOpen(false)}>Entendi</button></div></Modal>}
    </div>
  );
}

function FormInput({ name, label, placeholder, icon, type = "text", value, onChange }: { name: string; label: string; placeholder: string; icon: React.ReactNode; type?: string; value?: string; onChange?: (v: string) => void }) {
  return <label className="field-block"><span>{label}</span><div className="input-wrap">{icon}<input name={name} placeholder={placeholder} type={type} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} /></div></label>;
}
