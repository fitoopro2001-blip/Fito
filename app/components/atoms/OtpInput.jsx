'use client';

import { useEffect, useMemo, useRef } from 'react';

// A row of individual digit "cells" instead of one plain text field — the
// standard OTP entry pattern. Controlled like any other form atom: `value` is
// the full code as a string, `onChange` receives the full code back, so it
// drops straight into antd Form.Item's value/onChange cloning with no adapter.
export default function OtpInput({
  length = 6,
  value = '',
  onChange,
  autoFocus = true,
  error = false,
  className = '',
}) {
  const inputRefs = useRef([]);
  const digits = useMemo(() => {
    const chars = value.split('').slice(0, length);
    return Array.from({ length }, (_, i) => chars[i] || '');
  }, [value, length]);

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
    // Only on mount — this shouldn't re-steal focus every time `value` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (nextDigits) => onChange?.(nextDigits.join(''));

  const handleChange = (index, raw) => {
    const incoming = raw.replace(/\D/g, '');

    if (incoming.length > 1) {
      // A full code landed in one cell — autofill (mobile SMS suggestion,
      // password manager, or a paste that slipped through onChange instead
      // of onPaste) distributes it across the remaining cells.
      const next = [...digits];
      let cursor = index;
      for (const char of incoming) {
        if (cursor >= length) break;
        next[cursor] = char;
        cursor += 1;
      }
      emit(next);
      inputRefs.current[Math.min(cursor, length - 1)]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = incoming;
    emit(next);

    if (incoming && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      emit(next);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] || '');
    emit(next);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`
            w-12 h-14 sm:w-14 sm:h-16
            rounded-xl bg-overlay border text-text
            text-xl sm:text-2xl font-bold text-center
            outline-none transition-all duration-150
            ${digit ? 'border-primary bg-primary/10' : 'border-border-light'}
            ${error ? '!border-danger' : ''}
            focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]
          `}
        />
      ))}
    </div>
  );
}
