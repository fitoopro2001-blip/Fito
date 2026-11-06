export default function Divider({ label, vertical = false, className = '' }) {
  if (vertical) {
    return <span className={`inline-block w-px self-stretch bg-border-light ${className}`} />;
  }

  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="h-px flex-1 bg-border-light" />
        <span className="text-xs uppercase tracking-wide text-text-muted">{label}</span>
        <span className="h-px flex-1 bg-border-light" />
      </div>
    );
  }

  return <hr className={`border-t border-border-light ${className}`} />;
}
