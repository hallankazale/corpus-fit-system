import { Camera, Edit3, Eye, Globe2, Mail, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "../components/BrandIcons";
import { Modal } from "../components/Modal";
import { roleLabels } from "../services/accountService";
import { useAccount } from "../state/AccountContext";

type Draft = {
  fullName: string; phone: string; birthDate: string; gender: "" | "male" | "female" | "other" | "prefer_not_to_say";
  publicProfile: boolean; bio: string; instagram: string; facebook: string; tiktok: string; whatsapp: string;
  showInstagram: boolean; showFacebook: boolean; showTiktok: boolean; showWhatsapp: boolean;
};

const emptyDraft: Draft = { fullName: "", phone: "", birthDate: "", gender: "", publicProfile: false, bio: "", instagram: "", facebook: "", tiktok: "", whatsapp: "", showInstagram: false, showFacebook: false, showTiktok: false, showWhatsapp: false };

export function ProfileScreen() {
  const { account, loading, saveProfile } = useAccount();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"photo" | "details" | null>(null);

  useEffect(() => {
    if (!account) return;
    const p = account.profile;
    setDraft({
      fullName: p.full_name, phone: p.phone ?? "", birthDate: p.birth_date ?? "", gender: p.gender ?? "",
      publicProfile: p.public_profile, bio: p.bio ?? "", instagram: p.instagram ?? "", facebook: p.facebook ?? "", tiktok: p.tiktok ?? "", whatsapp: p.whatsapp ?? "",
      showInstagram: p.show_instagram, showFacebook: p.show_facebook, showTiktok: p.show_tiktok, showWhatsapp: p.show_whatsapp,
    });
  }, [account]);

  const initials = useMemo(() => makeInitials(draft.fullName), [draft.fullName]);
  const age = useMemo(() => calculateAge(draft.birthDate), [draft.birthDate]);
  const enabledIcons = [draft.showInstagram && draft.instagram && <InstagramIcon key="instagram" />, draft.showFacebook && draft.facebook && <FacebookIcon key="facebook" />, draft.showTiktok && draft.tiktok && <TikTokIcon key="tiktok" />, draft.showWhatsapp && draft.whatsapp && <WhatsAppIcon key="whatsapp" />].filter(Boolean);

  const save = async () => {
    if (!draft.fullName.trim()) return setError("Informe seu nome completo.");
    try {
      setSaving(true); setError("");
      await saveProfile({
        full_name: draft.fullName.trim(), phone: draft.phone.trim() || null, birth_date: draft.birthDate || null, gender: draft.gender || null,
        public_profile: draft.publicProfile, bio: draft.bio.trim(), instagram: draft.instagram.trim() || null, facebook: draft.facebook.trim() || null,
        tiktok: draft.tiktok.trim() || null, whatsapp: draft.whatsapp.trim() || null,
        show_instagram: draft.showInstagram, show_facebook: draft.showFacebook, show_tiktok: draft.showTiktok, show_whatsapp: draft.showWhatsapp,
      });
      setSaved(true); setModal(null); window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o perfil.");
    } finally { setSaving(false); }
  };

  if (loading && !account) return <AppShell><div className="page-pad"><div className="auth-loading">Carregando seu perfil...</div></div></AppShell>;
  if (!account) return <AppShell><div className="page-pad"><div className="form-error">Perfil não encontrado.</div></div></AppShell>;

  return (
    <AppShell>
      <div className="page-pad">
        <div className="page-heading"><h1>Meu perfil</h1><p>Seus dados agora estão ligados à sua conta real.</p></div>
        <section className="hero-card profile-hero">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-data">
            <h2>{draft.fullName || "Meu perfil"}</h2>
            <p>Matrícula: <b>#{account.profile.membership_number}</b></p>
            <div className="profile-chips"><span>✓ {account.profile.status === "active" ? "Ativo" : account.profile.status}</span><span>{roleLabels[account.profile.role]}</span>{age !== null && <span>{age} anos</span>}</div>
            <div className="profile-actions"><button onClick={() => setModal("photo")}><Camera /> Editar foto</button><button onClick={() => setModal("details")}><Edit3 /> Editar dados</button></div>
          </div>
        </section>

        <section className="section-card public-settings">
          <div className="setting-header"><div className="round-icon green"><Globe2 /></div><div><h2>Perfil público</h2><p>Escolha o que poderá aparecer para outros alunos.</p></div><label className="switch"><input type="checkbox" checked={draft.publicProfile} onChange={(e) => setDraft((d) => ({ ...d, publicProfile: e.target.checked }))} /><span /></label></div>
          <label className="bio-field"><b>Bio</b><textarea value={draft.bio} maxLength={150} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} /><small>{draft.bio.length}/150</small></label>
          <SocialRow label="Instagram" value={draft.instagram} placeholder="@seuusuario" on={draft.showInstagram} toggle={(v) => setDraft((d) => ({ ...d, showInstagram: v }))} change={(v) => setDraft((d) => ({ ...d, instagram: v }))} icon={<InstagramIcon size={22} />} />
          <SocialRow label="Facebook" value={draft.facebook} placeholder="Seu perfil" on={draft.showFacebook} toggle={(v) => setDraft((d) => ({ ...d, showFacebook: v }))} change={(v) => setDraft((d) => ({ ...d, facebook: v }))} icon={<FacebookIcon size={22} />} />
          <SocialRow label="TikTok" value={draft.tiktok} placeholder="@seuusuario" on={draft.showTiktok} toggle={(v) => setDraft((d) => ({ ...d, showTiktok: v }))} change={(v) => setDraft((d) => ({ ...d, tiktok: v }))} icon={<TikTokIcon size={22} />} />
          <SocialRow label="WhatsApp" value={draft.whatsapp} placeholder="(00) 00000-0000" on={draft.showWhatsapp} toggle={(v) => setDraft((d) => ({ ...d, showWhatsapp: v }))} change={(v) => setDraft((d) => ({ ...d, whatsapp: v }))} icon={<WhatsAppIcon size={22} />} />
        </section>

        <section className="section-card preview-card">
          <div className="setting-header"><div className="round-icon neutral"><Eye /></div><div><h2>Prévia do perfil público</h2><p>Assim seu perfil poderá ser visto.</p></div></div>
          <div className="public-preview"><div className="profile-avatar small">{initials}</div><div><h3>{draft.fullName}</h3><p>✓ {roleLabels[account.profile.role]} • Matrícula #{account.profile.membership_number}</p><span>{draft.bio || "Adicione uma bio para apresentar seu perfil."}</span><div className="social-icons">{enabledIcons.length > 0 ? enabledIcons : <small>Nenhuma rede social pública.</small>}</div></div></div>
        </section>

        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-button" disabled={saving} onClick={() => void save()}><Save /> {saving ? "Salvando..." : "Salvar perfil"}</button>
        {saved && <div className="toast">Perfil salvo no banco de dados.</div>}

        {modal === "photo" && <Modal title="Editar foto de perfil" onClose={() => setModal(null)}><div className="modal-content-stack"><p>O upload da foto será a próxima integração com o Supabase Storage.</p><button className="primary-button" onClick={() => setModal(null)}>Entendi</button></div></Modal>}
        {modal === "details" && <Modal title="Editar dados pessoais" onClose={() => setModal(null)}><div className="profile-form-modal"><label><span>Nome completo</span><input value={draft.fullName} onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))} /></label><label><span>E-mail</span><div className="readonly-input"><Mail size={17}/>{account.user.email}</div></label><label><span>Telefone</span><input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} /></label><label><span>Data de nascimento</span><input type="date" value={draft.birthDate} onChange={(e) => setDraft((d) => ({ ...d, birthDate: e.target.value }))} /></label><label><span>Gênero</span><select value={draft.gender} onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value as Draft['gender'] }))}><option value="">Não informado</option><option value="male">Masculino</option><option value="female">Feminino</option><option value="other">Outro</option><option value="prefer_not_to_say">Prefiro não informar</option></select></label><button className="primary-button" disabled={saving} onClick={() => void save()}><Save /> Salvar dados</button></div></Modal>}
      </div>
    </AppShell>
  );
}

function SocialRow({ label, value, placeholder, on, toggle, change, icon }: { label: string; value: string; placeholder: string; on: boolean; toggle: (value: boolean) => void; change: (value: string) => void; icon: React.ReactNode }) {
  return <div className="social-row"><span className="social-mark social-mark--brand">{icon}</span><div className="social-edit"><b>{label}</b><input value={value} placeholder={placeholder} onChange={(e) => change(e.target.value)} /></div><label className="switch"><input type="checkbox" checked={on} onChange={(e) => toggle(e.target.checked)} /><span /></label></div>;
}
function makeInitials(name:string){const parts=name.trim().split(/\s+/).filter(Boolean);return ((parts[0]?.[0]??'U')+(parts[1]?.[0]??'')).toUpperCase();}
function calculateAge(date:string){if(!date)return null;const birth=new Date(`${date}T12:00:00`);const today=new Date();let age=today.getFullYear()-birth.getFullYear();const m=today.getMonth()-birth.getMonth();if(m<0||(m===0&&today.getDate()<birth.getDate()))age--;return age;}
