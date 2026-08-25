import { Bell, Fingerprint, LockKeyhole, Moon, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";

export function SettingsScreen(){
 const [settings,setSettings]=useState({push:true,classReminders:true,payments:true,dark:false,biometric:false,publicData:false});
 const toggle=(key:keyof typeof settings)=>setSettings(s=>({...s,[key]:!s[key]}));
 return <AppShell title="Configurações"><div className="page-pad"><div className="page-heading"><h1>Configurações</h1><p>Preferências, privacidade e segurança.</p></div><SettingsGroup title="Notificações"><Setting icon={<Bell/>} label="Notificações push" value={settings.push} onChange={()=>toggle('push')}/><Setting icon={<Bell/>} label="Lembretes de aula" value={settings.classReminders} onChange={()=>toggle('classReminders')}/><Setting icon={<Smartphone/>} label="Avisos de pagamento" value={settings.payments} onChange={()=>toggle('payments')}/></SettingsGroup><SettingsGroup title="Aparência e privacidade"><Setting icon={<Moon/>} label="Modo escuro" value={settings.dark} onChange={()=>toggle('dark')}/><Setting icon={<ShieldCheck/>} label="Compartilhar dados públicos" value={settings.publicData} onChange={()=>toggle('publicData')}/></SettingsGroup><SettingsGroup title="Segurança"><Setting icon={<Fingerprint/>} label="Acesso por biometria" value={settings.biometric} onChange={()=>toggle('biometric')}/><button className="settings-action"><LockKeyhole/> Alterar senha</button><button className="settings-action"><UserRound/> Gerenciar sessão</button></SettingsGroup></div></AppShell>
}
function SettingsGroup({title,children}:{title:string;children:React.ReactNode}){return <section className="section-card settings-group"><h2>{title}</h2>{children}</section>}
function Setting({icon,label,value,onChange}:{icon:React.ReactNode;label:string;value:boolean;onChange:()=>void}){return <div className="setting-row"><span>{icon}{label}</span><label className="switch"><input type="checkbox" checked={value} onChange={onChange}/><span/></label></div>}
