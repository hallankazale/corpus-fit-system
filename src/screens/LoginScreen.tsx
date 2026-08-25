import { Eye, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { GoogleIcon } from "../components/BrandIcons";
import { Modal } from "../components/Modal";
import { authenticateDemo, DEMO_CREDENTIALS } from "../services/demoAuth";

export function LoginScreen() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || password.length < 6) {
      setError("Informe seu e-mail/telefone e uma senha válida.");
      return;
    }

    setLoading(true);
    const authenticated = await authenticateDemo(identifier, password);
    setLoading(false);

    if (!authenticated) {
      setError("E-mail/telefone ou senha incorretos.");
      return;
    }

    navigate("/", { replace: true });
  };

  const fillDemo = () => {
    setIdentifier(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero"><BrandLogo /><div className="auth-hero__curve" /></div>
      <form className="auth-card" onSubmit={submit}>
        <h1>Bem-vindo de volta</h1>
        <p>Acesse sua conta para continuar</p>

        <div className="demo-access-card">
          <div>
            <strong>Acesso de demonstração</strong>
            <small>{DEMO_CREDENTIALS.email}</small>
            <small>{DEMO_CREDENTIALS.password}</small>
          </div>
          <button type="button" onClick={fillDemo}>Usar acesso</button>
        </div>

        <label className="input-wrap"><UserRound /><input aria-label="E-mail ou CPF" placeholder="E-mail ou telefone" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></label>
        <label className="input-wrap input-wrap--action">
          <LockKeyhole />
          <input aria-label="Senha" placeholder="Senha" autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="field-icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}><Eye /></button>
        </label>

        <div className="form-row"><label className="check-label"><input type="checkbox" defaultChecked /> Lembrar-me</label><button type="button" className="text-link" onClick={() => setForgotOpen(true)}>Esqueci minha senha</button></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Validando..." : "Entrar"}</button>
        <div className="divider"><span>ou</span></div>
        <button type="button" className="outline-button google-button" onClick={() => setGoogleOpen(true)}><GoogleIcon /> Entrar com Google</button>
        <div className="auth-footer">Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></div>
      </form>

      {forgotOpen && (
        <Modal title="Recuperar senha" onClose={() => setForgotOpen(false)}>
          <div className="modal-content-stack">
            <p>Na integração real, enviaremos um link de recuperação para o e-mail cadastrado.</p>
            <button className="primary-button" onClick={() => setForgotOpen(false)}>Fechar</button>
          </div>
        </Modal>
      )}

      {googleOpen && (
        <Modal title="Login com Google" onClose={() => setGoogleOpen(false)}>
          <div className="modal-content-stack">
            <p>O login real com Google será ativado quando conectarmos o Supabase. Ele não libera mais o sistema sem autenticação.</p>
            <button className="primary-button" onClick={() => setGoogleOpen(false)}>Entendi</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
