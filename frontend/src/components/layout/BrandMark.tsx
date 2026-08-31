/* Design philosophy: Diagnostic Terminal. The brand mark is two opposing angle brackets framing a single sightline, like a compact debugging instrument. */
export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span aria-hidden="true" className={`brand-mark ${compact ? 'brand-mark--compact' : ''}`}><span className="brand-mark__bracket brand-mark__bracket--left">‹</span><span className="brand-mark__sight"/><span className="brand-mark__bracket brand-mark__bracket--right">›</span></span>;
}
