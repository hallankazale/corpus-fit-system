import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";

export function RegisterScreen() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!data.get("name") || !data.get("email") || !data.get("phone")) return setError("Preencha seus dados obrigatórios.");
    if (password.length < 6 || password !== confirm) return setError("As senhas devem ser iguais e ter ao menos 6 caracteres.");
    if (!accepted) return setError("Aceite os Termos de Uso e a Política de Privacidade.");
    navigate("/");
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
        <label className="terms-check"><input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)} /> Li e aceito os <b>Termos de Uso</b> e <b>Política de Privacidade</b></label>
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button" type="submit">Criar conta</button>
        <div className="divider"><span>ou</span></div>
        <button type="button" className="outline-button google-button"><span className="google-g">G</span> Continuar com Google</button>
      </form>
      <div className="auth-footer auth-footer--outside">Já tenho conta <Link to="/login">Entrar</Link></div>
    </div>
  );
}

function FormInput({ name, label, placeholder, icon, type="text", value, onChange }: { name:string; label:string; placeholder:string; icon:React.ReactNode; type?:string; value?:string; onChange?:(v:string)=>void }) {
  return <label className="field-block"><span>{label}</span><div className="input-wrap">{icon}<input name={name} placeholder={placeholder} type={type} value={value} onChange={onChange ? (e)=>onChange(e.target.value) : undefined}/></div></label>;
}
