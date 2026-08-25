import { FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { Modal } from "../components/Modal";

export function AboutScreen() {
  const [content, setContent] = useState<"terms" | "privacy" | null>(null);

  return (
    <AppShell title="Sobre">
      <div className="page-pad about-page">
        <section className="about-hero"><BrandLogo /><h1>Corpus Fit System</h1><p>Versão 1.0.0</p></section>
        <section className="section-card"><h2>Sobre o sistema</h2><p>Plataforma de experiência do aluno e gestão de academia. Esta primeira versão utiliza dados demonstrativos e foi estruturada para receber autenticação, banco de dados, pagamentos e integração com catraca nas próximas fases.</p></section>
        <section className="section-card about-links"><button onClick={() => setContent("terms")}><FileText /> Termos de Uso</button><button onClick={() => setContent("privacy")}><ShieldCheck /> Política de Privacidade</button></section>
        <section className="section-card"><h2>Privacidade por padrão</h2><p>Perfis públicos e informações de contato devem exigir consentimento explícito. Dados financeiros e credenciais nunca devem ser armazenados em texto puro no aplicativo.</p></section>
        <p className="copyright">© 2026 Corpus Fit System. Protótipo de implementação.</p>

        {content && (
          <Modal title={content === "terms" ? "Termos de Uso" : "Política de Privacidade"} onClose={() => setContent(null)}>
            <div className="modal-content-stack">
              <p>{content === "terms" ? "Este ambiente é demonstrativo. No produto final, os termos vão detalhar responsabilidades, uso do app, regras de pagamento e uso dos serviços da academia." : "A política de privacidade do produto final cobrirá coleta de dados, consentimento, retenção, segurança, compartilhamento e direitos do titular."}</p>
              <button className="primary-button" onClick={() => setContent(null)}>Fechar</button>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
