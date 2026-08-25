import { CheckCircle2, Copy, CreditCard, FileText, History, Info, LockKeyhole, QrCode } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { Modal } from "../components/Modal";
import { payments } from "../mocks/data";
import { formatCurrency } from "../utils/format";

export function PaymentsScreen(){
 const [tab,setTab]=useState<'plan'|'methods'>('plan'); const [pixOpen,setPixOpen]=useState(false); const [copied,setCopied]=useState(false);
 return <AppShell title="Pagamentos" hideBottomNav><div className="page-pad payments-page"><div className="payment-tabs"><button className={tab==='plan'?'active':''} onClick={()=>setTab('plan')}>MEU PLANO</button><button className={tab==='methods'?'active':''} onClick={()=>setTab('methods')}>FORMAS DE PAGAMENTO</button></div>
 {tab==='methods'?<section className="section-card methods-card"><h2>Formas de pagamento</h2><p>PIX instantâneo e cartão salvo com tokenização do provedor. Nenhum dado completo de cartão deve ser armazenado no aplicativo.</p><button className="outline-button">Adicionar cartão</button></section>:<><section className="hero-card payment-plan"><BrandLogo compact/><div className="hero-card__divider"/><div><h2>Plano Mensal</h2><span className="status-chip status-chip--success"><CheckCircle2/> Pago</span><p>Próxima cobrança <b>08/09/2026</b></p><hr/><p>Valor mensal <strong>R$ 99,90</strong></p><span className="status-chip status-chip--success"><LockKeyhole/> Catraca liberada</span></div></section>
 <div className="three-actions"><button><CreditCard/><span>Pagar próxima mensalidade</span></button><button><FileText/><span>2ª via recibo</span></button><button><History/><span>Histórico</span></button></div>
 <h3 className="small-title">Pagamentos recentes</h3><section className="payment-list">{payments.map(p=><div className="payment-row" key={p.id}><CheckCircle2 className="paid-icon"/><span><b>{p.date}</b><small>Plano Mensal</small></span><span>{p.method==='PIX'?'◆ PIX':`● ${p.maskedCard}`}</span><strong>{formatCurrency(p.amount)}</strong><em>Pago</em></div>)}</section>
 <section className="pending-card"><div>⚠️</div><span><small>Próxima cobrança</small><b>08/09/2026</b><p>Plano Mensal</p></span><span><small>Valor</small><b>R$ 99,90</b><em>Aguardando pagamento</em></span><button className="yellow-button" onClick={()=>setPixOpen(true)}>Gerar PIX</button></section>
 <div className="info-strip"><Info/> Sua catraca será liberada após a confirmação do pagamento.</div></>}
 {pixOpen&&<Modal title="Pagamento via PIX" onClose={()=>setPixOpen(false)}><div className="pix-modal"><div className="fake-qr"><QrCode size={120}/></div><p>Escaneie o QR Code ou copie o código abaixo.</p><code>00020126...CORPUSFIT...6304ABCD</code><button className="primary-button" onClick={()=>{navigator.clipboard?.writeText('00020126CORPUSFIT6304ABCD');setCopied(true)}}><Copy/> {copied?'Código copiado':'Copiar código PIX'}</button></div></Modal>}
 </div></AppShell>
}
