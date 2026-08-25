import { Camera, Edit3, Eye, Globe2, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "../components/BrandIcons";
import { Modal } from "../components/Modal";
import { useAppState } from "../state/AppState";

export function ProfileScreen() {
  const { profile, setProfile } = useAppState();
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState<"photo" | "details" | null>(null);
  const toggle = (key: keyof typeof profile.social) => setProfile((p) => ({ ...p, social: { ...p.social, [key]: !p.social[key] } }));
  const enabledIcons = useMemo(
    () => [
      profile.social.instagram && <InstagramIcon key="instagram" />,
      profile.social.facebook && <FacebookIcon key="facebook" />,
      profile.social.tiktok && <TikTokIcon key="tiktok" />,
      profile.social.whatsapp && <WhatsAppIcon key="whatsapp" />,
    ].filter(Boolean),
    [profile.social.facebook, profile.social.instagram, profile.social.tiktok, profile.social.whatsapp],
  );

  return (
    <AppShell>
      <div className="page-pad">
        <div className="page-heading">
          <h1>Meu perfil</h1>
          <p>Gerencie suas informações e como você aparece para os outros.</p>
        </div>

        <section className="hero-card profile-hero">
          <div className="profile-avatar">HF</div>
          <div className="profile-data">
            <h2>Hallan Fernando Lehrbach</h2>
            <p>Matrícula: <b>6546</b></p>
            <div className="profile-chips"><span>✓ Ativo</span><span>Idade 35</span><span>Masculino</span></div>
            <div className="profile-actions">
              <button onClick={() => setModal("photo")}><Camera /> Editar foto</button>
              <button onClick={() => setModal("details")}><Edit3 /> Editar dados</button>
            </div>
          </div>
        </section>

        <section className="section-card public-settings">
          <div className="setting-header">
            <div className="round-icon green"><Globe2 /></div>
            <div>
              <h2>Perfil público</h2>
              <p>Defina as informações que deseja compartilhar com o público.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={profile.publicProfile} onChange={() => setProfile((p) => ({ ...p, publicProfile: !p.publicProfile }))} />
              <span />
            </label>
          </div>

          <label className="bio-field">
            <b>Bio</b>
            <textarea value={profile.bio} maxLength={150} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
            <small>{profile.bio.length}/150</small>
          </label>

          <SocialRow label="Instagram" value="@hallan.lehrbach" on={profile.social.instagram} toggle={() => toggle("instagram")} icon={<InstagramIcon size={22} />} />
          <SocialRow label="Facebook" value="Hallan Lehrbach" on={profile.social.facebook} toggle={() => toggle("facebook")} icon={<FacebookIcon size={22} />} />
          <SocialRow label="TikTok" value="@hallan.lehrbach" on={profile.social.tiktok} toggle={() => toggle("tiktok")} icon={<TikTokIcon size={22} />} />
          <SocialRow label="WhatsApp" value="(51) 99999-9999" on={profile.social.whatsapp} toggle={() => toggle("whatsapp")} icon={<WhatsAppIcon size={22} />} />
        </section>

        <section className="section-card preview-card">
          <div className="setting-header">
            <div className="round-icon neutral"><Eye /></div>
            <div>
              <h2>Prévia do perfil público</h2>
              <p>Assim seu perfil será visto por outros alunos.</p>
            </div>
          </div>
          <div className="public-preview">
            <div className="profile-avatar small">HF</div>
            <div>
              <h3>Hallan Fernando Lehrbach</h3>
              <p>✓ Ativo • 35 anos • Masculino</p>
              <span>{profile.bio}</span>
              <div className="social-icons">{enabledIcons.length > 0 ? enabledIcons : <small>Selecione pelo menos uma rede para exibir.</small>}</div>
            </div>
          </div>
        </section>

        <button className="primary-button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}>
          <Save /> Salvar perfil
        </button>
        {saved && <div className="toast">Perfil salvo com sucesso.</div>}

        {modal === "photo" && (
          <Modal title="Editar foto de perfil" onClose={() => setModal(null)}>
            <div className="modal-content-stack">
              <p>Na próxima fase vamos conectar upload real de imagem com armazenamento seguro.</p>
              <button className="primary-button" onClick={() => setModal(null)}>Entendi</button>
            </div>
          </Modal>
        )}

        {modal === "details" && (
          <Modal title="Editar dados pessoais" onClose={() => setModal(null)}>
            <div className="modal-content-stack">
              <p>Campos cadastrais serão integrados ao backend para atualização do nome, telefone e dados de contato.</p>
              <button className="primary-button" onClick={() => setModal(null)}>Fechar</button>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

function SocialRow({ label, value, on, toggle, icon }: { label: string; value: string; on: boolean; toggle: () => void; icon: React.ReactNode }) {
  return (
    <div className="social-row">
      <span className="social-mark social-mark--brand">{icon}</span>
      <div>
        <b>{label}</b>
        <small>{value}</small>
      </div>
      <label className="switch">
        <input type="checkbox" checked={on} onChange={toggle} />
        <span />
      </label>
    </div>
  );
}
