'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async fetcher and tracks data/loading/error, re-running whenever
 * `deps` change. Stale responses are ignored so fast filter changes can't
 * render out-of-order results.
 *
 * `fallback` is returned as-is when `skip` is true, which is how the pages
 * keep working against dummy data while testing mode is on.
 */
export default function useApiResource(fetcher, deps = [], { skip = false, fallback = null } = {}) {
    const [data, setData] = useState(fallback);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    useEffect(() => {
        if (skip) {
            setData(fallback);
            setLoading(false);
            setError(null);
            return undefined;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetcher()
            .then((result) => {
                if (!cancelled) setData(result);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.response?.data?.message || err?.message || 'Request failed');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, reloadKey, ...deps]);

    return { data, loading, error, reload, setData };
}
