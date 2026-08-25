import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { GoogleIcon } from "../components/BrandIcons";
import { Modal } from "../components/Modal";
import { signUpWithEmail } from "../services/authService";

export function RegisterScreen() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const phone = String(data.get("phone") ?? "");

    if (!fullName.trim() || !email.trim() || !phone.trim()) return setError("Preencha seus dados obrigatórios.");
    if (!email.includes("@")) return setError("Informe um e-mail válido.");
    if (password.length < 8 || password !== confirm) return setError("As senhas devem ser iguais e ter ao menos 8 caracteres.");
    if (!accepted) return setError("Aceite os Termos de Uso e a Política de Privacidade.");

    setLoading(true);
    const result = await signUpWithEmail({ fullName, email, phone, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setConfirmationOpen(true);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="auth-shell auth-shell--register">
      <div className="register-head"><BrandLogo compact /><div><h1>Criar conta</h1><p>Preencha seus dados para começar</p></div></div>
      <form className="register-card" onSubmit={submit}>
        <FormInput name="name" label="Nome completo" placeholder="Digite seu nome completo" icon={<UserRound />} autoComplete="name" />
        <FormInput name="email" label="E-mail" placeholder="Digite seu e-mail" icon={<Mail />} type="email" autoComplete="email" />
        <FormInput name="phone" label="Telefone" placeholder="Digite seu telefone" icon={<Phone />} autoComplete="tel" />
        <FormInput name="password" label="Senha" placeholder="Crie uma senha segura" icon={<LockKeyhole />} type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <FormInput name="confirm" label="Confirmar senha" placeholder="Confirme sua senha" icon={<LockKeyhole />} type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <label className="terms-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /> Li e aceito os <button type="button" className="inline-link-button" onClick={() => setTermsOpen(true)}><b>Termos de Uso</b> e <b>Política de Privacidade</b></button></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Criando conta..." : "Criar conta"}</button>
        <div className="divider"><span>ou</span></div>
        <button type="button" className="outline-button google-button" onClick={() => setGoogleOpen(true)}><GoogleIcon /> Continuar com Google</button>
      </form>
      <div className="auth-footer auth-footer--outside">Já tenho conta <Link to="/login">Entrar</Link></div>

      {termsOpen && <Modal title="Termos e privacidade" onClose={() => setTermsOpen(false)}><div className="modal-content-stack"><p>Seus dados pessoais serão usados para autenticação, cadastro, comunicação da academia e funcionamento do serviço. O acesso ao banco é protegido por políticas RLS.</p><button className="primary-button" onClick={() => setTermsOpen(false)}>Entendi</button></div></Modal>}
      {googleOpen && <Modal title="Cadastro com Google" onClose={() => setGoogleOpen(false)}><div className="modal-content-stack"><p>Primeiro ativamos o cadastro real por e-mail. O Google será conectado em uma etapa separada porque exige credenciais OAuth próprias.</p><button className="primary-button" onClick={() => setGoogleOpen(false)}>Entendi</button></div></Modal>}
      {confirmationOpen && <Modal title="Confirme seu e-mail" onClose={() => setConfirmationOpen(false)}><div className="modal-content-stack"><p>Sua conta foi criada no Supabase. Abra o e-mail de confirmação enviado para você e confirme o endereço antes do primeiro login.</p><button className="primary-button" onClick={() => navigate("/login", { replace: true })}>Ir para o login</button></div></Modal>}
    </div>
  );
}

function FormInput({ name, label, placeholder, icon, type = "text", value, onChange, autoComplete }: { name: string; label: string; placeholder: string; icon: React.ReactNode; type?: string; value?: string; onChange?: (value: string) => void; autoComplete?: string }) {
  return <label className="field-block"><span>{label}</span><div className="input-wrap">{icon}<input name={name} placeholder={placeholder} type={type} value={value} autoComplete={autoComplete} onChange={onChange ? (event) => onChange(event.target.value) : undefined} /></div></label>;
}
