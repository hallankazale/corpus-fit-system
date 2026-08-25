import { Eye, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { GoogleIcon } from "../components/BrandIcons";
import { Modal } from "../components/Modal";
import { requestPasswordReset, signInWithEmail } from "../services/authService";
import "../styles/login-security.css";

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || password.length < 6) {
      setError("Informe seu e-mail e uma senha válida.");
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate("/", { replace: true });
  };

  const sendReset = async () => {
    setResetMessage("");
    if (!email.includes("@")) {
      setResetMessage("Digite seu e-mail na tela de login antes de solicitar a recuperação.");
      return;
    }
    setResetLoading(true);
    const result = await requestPasswordReset(email);
    setResetLoading(false);
    setResetMessage(result.ok ? "E-mail de recuperação enviado. Verifique sua caixa de entrada." : result.error);
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero"><BrandLogo /><div className="auth-hero__curve" /></div>
      <form className="auth-card" onSubmit={submit}>
        <h1>Bem-vindo de volta</h1>
        <p>Acesse sua conta para continuar</p>

        <label className="input-wrap"><Mail /><input aria-label="E-mail" placeholder="E-mail" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="input-wrap input-wrap--action">
          <LockKeyhole />
          <input aria-label="Senha" placeholder="Senha" autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} />
          <button type="button" className="field-icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}><Eye /></button>
        </label>

        <div className="form-row"><label className="check-label"><input type="checkbox" defaultChecked /> Lembrar-me</label><button type="button" className="text-link" onClick={() => { setForgotOpen(true); setResetMessage(""); }}>Esqueci minha senha</button></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        <div className="divider"><span>ou</span></div>
        <button type="button" className="outline-button google-button" onClick={() => setGoogleOpen(true)}><GoogleIcon /> Entrar com Google</button>
        <div className="auth-footer">Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></div>
      </form>

      {forgotOpen && <Modal title="Recuperar senha" onClose={() => setForgotOpen(false)}><div className="modal-content-stack"><p>Enviaremos um link de recuperação para <b>{email || "seu e-mail cadastrado"}</b>.</p>{resetMessage && <div className="form-error">{resetMessage}</div>}<button className="primary-button" onClick={sendReset} disabled={resetLoading}>{resetLoading ? "Enviando..." : "Enviar recuperação"}</button><button className="outline-button" onClick={() => setForgotOpen(false)}>Fechar</button></div></Modal>}
      {googleOpen && <Modal title="Login com Google" onClose={() => setGoogleOpen(false)}><div className="modal-content-stack"><p>O login por Google será ativado depois que configurarmos o provedor Google no Supabase. O acesso por e-mail e senha já usa autenticação real.</p><button className="primary-button" onClick={() => setGoogleOpen(false)}>Entendi</button></div></Modal>}
    </div>
  );
}
