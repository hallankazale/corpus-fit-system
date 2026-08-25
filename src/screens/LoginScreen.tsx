import { Eye, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";

export function LoginScreen() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || password.length < 4) return setError("Informe seu e-mail/CPF e uma senha válida.");
    navigate("/");
  };
  return (
    <div className="auth-shell">
      <div className="auth-hero"><BrandLogo /><div className="auth-hero__curve" /></div>
      <form className="auth-card" onSubmit={submit}>
        <h1>Bem-vindo de volta</h1><p>Acesse sua conta para continuar</p>
        <label className="input-wrap"><UserRound /><input aria-label="E-mail ou CPF" placeholder="E-mail ou CPF" value={identifier} onChange={(e)=>setIdentifier(e.target.value)} /></label>
        <label className="input-wrap"><LockKeyhole /><input aria-label="Senha" placeholder="Senha" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /><Eye /></label>
        <div className="form-row"><label className="check-label"><input type="checkbox" defaultChecked/> Lembrar-me</label><button type="button" className="text-link">Esqueci minha senha</button></div>
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button" type="submit">Entrar</button>
        <div className="divider"><span>ou</span></div>
        <button type="button" className="outline-button google-button"><span className="google-g">G</span> Entrar com Google</button>
        <div className="auth-footer">Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></div>
      </form>
    </div>
  );
}
