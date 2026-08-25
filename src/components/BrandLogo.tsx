export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "brand-logo--compact" : ""}`} aria-label="Corpus Academia">
      <div className="brand-logo__mark">C</div>
      <div className="brand-logo__word">
        <strong>CORPUS</strong>
        <span>ACADEMIA</span>
      </div>
    </div>
  );
}
