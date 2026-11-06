'use client';

import { useEffect, useState } from 'react';

// Delays propagating a fast-changing value (e.g. a search input) so callers
// can avoid firing a request per keystroke.
export default function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
