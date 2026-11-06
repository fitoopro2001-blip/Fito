'use client';

import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';

// Purely client-side selection (matches the old beforeUpload={() => false}
// antd usage — nothing here ever hits a server). value/onChange carry plain
// File[] instead of antd's {fileList} wrapper.
//
// allowedTypes/maxSizeMB/maxFiles are optional — pass them to reject bad
// files here instead of letting them fail later in the multipart request
// (a big/oversized file used to just blow past the request timeout, or get
// rejected by multer with a raw "File too large" error).
export default function Upload({
  value = [],
  onChange,
  multiple = false,
  accept,
  allowedTypes,
  maxSizeMB,
  maxFiles,
  picture = false,
  triggerClassName = '',
  children,
  className = '',
}) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = value.map((file) =>
      file.type?.startsWith('image/') ? URL.createObjectURL(file) : null
    );
    setPreviews(urls);
    return () => urls.forEach((url) => url && URL.revokeObjectURL(url));
  }, [value]);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    if (!selected.length) return;

    const valid = [];
    selected.forEach((file) => {
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        message.error(`${file.name} isn't a supported file type.`);
        return;
      }
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        message.error(`${file.name} is larger than ${maxSizeMB}MB.`);
        return;
      }
      valid.push(file);
    });
    if (!valid.length) return;

    if (!multiple) {
      onChange?.(valid.slice(0, 1));
      return;
    }

    const room = maxFiles ? maxFiles - value.length : valid.length;
    if (room <= 0) {
      message.error(`You can upload up to ${maxFiles} files.`);
      return;
    }
    if (valid.length > room) {
      message.error(`Only ${room} of those file${room === 1 ? '' : 's'} were added — the limit is ${maxFiles}.`);
    }
    onChange?.([...value, ...valid.slice(0, room)]);
  };

  const removeAt = (index) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const defaultTriggerClasses = picture
    ? 'w-24 h-24 flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-light text-text-secondary hover:border-primary hover:text-text transition-colors text-xs'
    : 'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border-light text-text-secondary hover:border-primary hover:text-text transition-colors';

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />

      <div className={picture ? 'flex flex-wrap gap-3' : 'flex flex-col gap-3'}>

        {picture &&
          value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-border-light bg-overlay"
            >
              {previews[index] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[index]} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-text-muted p-1 text-center">
                  {file.name}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-scrim text-text-inverse text-xs flex items-center justify-center leading-none"
              >
                &times;
              </button>
            </div>
          ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={triggerClassName || defaultTriggerClasses}
        >
          {children}
        </button>

        {!picture && value.length > 0 && (
          <ul className="space-y-1.5">
            {value.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 bg-overlay rounded-md px-3 py-2 text-sm text-text-secondary"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="text-text-muted hover:text-danger shrink-0"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}
