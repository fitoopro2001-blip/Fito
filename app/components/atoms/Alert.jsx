'use client';

const TYPE_STYLES = {
  info: 'bg-info/10 border-info/30',
  success: 'bg-success/10 border-success/30',
  warning: 'bg-warning/10 border-warning/30',
  error: 'bg-danger/10 border-danger/30',
};

export default function Alert({
  type = 'info',
  message,
  description,
  icon,
  className = '',
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        TYPE_STYLES[type] || TYPE_STYLES.info
      } ${className}`}
    >
      {icon && <span className="mt-0.5 shrink-0 text-text">{icon}</span>}
      <div className="text-sm text-text-secondary">
        {message && <div className="font-medium text-text">{message}</div>}
        {description && <div className="mt-1">{description}</div>}
      </div>
    </div>
  );
}
