import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-card__header"><h3>{title}</h3><button className="icon-button" onClick={onClose} aria-label="Fechar"><X /></button></div>
        {children}
      </div>
    </div>
  );
}
