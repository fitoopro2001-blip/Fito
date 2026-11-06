'use client';

import { createContext, useContext, useId } from 'react';

const RadioGroupContext = createContext(null);

// Mirrors antd's shape: <Radio.Group value={} onChange={(e)=>e.target.value}>
// so call sites only need to change the import.
export default function Radio({ value, children, disabled = false, className = '' }) {
  const group = useContext(RadioGroupContext);
  const checked = group ? group.value === value : undefined;

  const handleChange = () => {
    group?.onChange?.({ target: { value } });
  };

  return (
    <label
      className={`inline-flex items-center gap-2 text-sm text-text-secondary mr-4 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <input
        type="radio"
        name={group?.name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="w-4 h-4 border-border-light bg-overlay accent-primary focus:ring-2 focus:ring-primary/30"
      />
      {children}
    </label>
  );
}

function RadioGroup({ value, onChange, children, className = '' }) {
  const name = useId();

  return (
    <RadioGroupContext.Provider value={{ value, onChange, name }}>
      <div className={`flex flex-wrap gap-x-4 gap-y-2 ${className}`}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

Radio.Group = RadioGroup;
