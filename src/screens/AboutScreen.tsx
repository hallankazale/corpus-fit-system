import { FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { Modal } from "../components/Modal";
import { BRAND } from "../config/brand";

export function AboutScreen() {
  const [content, setContent] = useState<"terms" | "privacy" | null>(null);

  return (
    <AppShell title="Sobre">
      <div className="page-pad about-page">
        <section className="about-hero"><BrandLogo /><h1>{BRAND.name}</h1><p>Versão 1.0.0</p></section>
        <section className="section-card"><h2>Sobre o sistema</h2><p>{BRAND.productDescription} O sistema integra acompanhamento de alunos, treinos, evolução, nutrição, pagamentos e rotinas administrativas em uma experiência única.</p></section>
        <section className="section-card about-links"><button onClick={() => setContent("terms")}><FileText /> Termos de Uso</button><button onClick={() => setContent("privacy")}><ShieldCheck /> Política de Privacidade</button></section>
        <section className="section-card"><h2>Privacidade por padrão</h2><p>Perfis públicos e informações de contato exigem consentimento explícito. Dados financeiros e credenciais não devem ser armazenados em texto puro no aplicativo.</p></section>
        <p className="copyright">© 2026 {BRAND.name}. Todos os direitos reservados.</p>

        {content && (
          <Modal title={content === "terms" ? "Termos de Uso" : "Política de Privacidade"} onClose={() => setContent(null)}>
            <div className="modal-content-stack">
              <p>{content === "terms" ? "Os termos de uso devem detalhar responsabilidades, regras da plataforma, pagamentos e utilização dos serviços contratados." : "A política de privacidade deve informar coleta de dados, base legal, consentimento, retenção, segurança, compartilhamento e direitos do titular conforme a LGPD."}</p>
              <button className="primary-button" onClick={() => setContent(null)}>Fechar</button>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
