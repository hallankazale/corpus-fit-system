import { BRAND } from "../config/brand";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "brand-logo--compact" : ""}`} aria-label={BRAND.name}>
      <div className="brand-logo__mark">{BRAND.mark}</div>
      <div className="brand-logo__word">
        <strong>{BRAND.wordmark}</strong>
        <span>{BRAND.descriptor}</span>
      </div>
    </div>
  );
}
