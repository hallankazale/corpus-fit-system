import { Eye, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { GoogleIcon } from "../components/BrandIcons";
import { Modal } from "../components/Modal";

export function LoginScreen() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || password.length < 4) return setError("Informe seu e-mail/CPF e uma senha válida.");
    navigate("/");
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero"><BrandLogo /><div className="auth-hero__curve" /></div>
      <form className="auth-card" onSubmit={submit}>
        <h1>Bem-vindo de volta</h1>
        <p>Acesse sua conta para continuar</p>
        <label className="input-wrap"><UserRound /><input aria-label="E-mail ou CPF" placeholder="E-mail ou CPF" value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></label>
        <label className="input-wrap input-wrap--action">
          <LockKeyhole />
          <input aria-label="Senha" placeholder="Senha" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="field-icon-button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}><Eye /></button>
        </label>
        <div className="form-row"><label className="check-label"><input type="checkbox" defaultChecked /> Lembrar-me</label><button type="button" className="text-link" onClick={() => setForgotOpen(true)}>Esqueci minha senha</button></div>
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button" type="submit">Entrar</button>
        <div className="divider"><span>ou</span></div>
        <button type="button" className="outline-button google-button" onClick={() => navigate("/")}><GoogleIcon /> Entrar com Google</button>
        <div className="auth-footer">Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></div>
      </form>

      {forgotOpen && (
        <Modal title="Recuperar senha" onClose={() => setForgotOpen(false)}>
          <div className="modal-content-stack">
            <p>Na integração real, enviaremos um link de recuperação para o seu e-mail cadastrado.</p>
            <button className="primary-button" onClick={() => setForgotOpen(false)}>Fechar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
