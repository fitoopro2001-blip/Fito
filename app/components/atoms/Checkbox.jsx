'use client';

// Native checked/onChange(e) so it drops straight into antd Form.Item's
// valuePropName="checked" cloning without any adapter.
export default function Checkbox({
  children,
  checked,
  onChange,
  disabled = false,
  id,
  className = '',
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 text-sm text-text-secondary ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-border-light bg-overlay accent-primary focus:ring-2 focus:ring-primary/30"
      />
      {children}
    </label>
  );
}

function CheckboxGroup({ options = [], value = [], onChange, className = '' }) {
  const normalized = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const toggle = (optValue) => {
    const next = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange?.(next);
  };

  return (
    <div className={className}>
      {normalized.map((opt) => (
        <Checkbox
          key={opt.value}
          checked={value.includes(opt.value)}
          onChange={() => toggle(opt.value)}
        >
          {opt.label}
        </Checkbox>
      ))}
    </div>
  );
}

Checkbox.Group = CheckboxGroup;
