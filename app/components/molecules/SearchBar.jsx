'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Popover } from 'antd';
import Icon from '../atoms/Icon';
import Spinner from '../atoms/Spinner';
import useDebounce from '../../hooks/useDebounce';
import { getProducts } from '../../services/product.service';
import imageUrl from '../../utils/imageUrl';

const MAX_RESULTS = 6;

// Search icon that expands into a Popover holding the input and, once there's
// a query, a dropdown of matching products underneath it.
export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return undefined;
    }
    // The input isn't mounted yet on the click that opens the popover.
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const products = await getProducts({ search: trimmed });
        if (!cancelled) setResults((products ?? []).slice(0, MAX_RESULTS));
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const content = (
    <div className="w-72 max-w-[85vw]">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
          <Icon name="search" className="w-4 h-4" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
        />
      </div>

      {query.trim() && (
        <div className="mt-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner className="w-5 h-5" />
            </div>
          ) : results.length > 0 ? (
            <ul className="flex flex-col">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.slug || product.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-1 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="relative w-10 h-10 rounded-lg overflow-hidden bg-overlay shrink-0">
                      <Image
                        src={imageUrl(product.image)}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-text truncate">{product.name}</span>
                      <span className="block text-xs text-text-muted">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-sm text-text-muted">
              No products found for &quot;{debouncedQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      content={content}
      arrow={false}
    >
      <button aria-label="Search" className="text-text-secondary hover:text-text transition-colors">
        <Icon name="search" className="w-5 h-5" />
      </button>
    </Popover>
  );
}
