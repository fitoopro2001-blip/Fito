import { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 350;

/**
 * Backend-driven pagination + search + column filters for a DataTable.
 * `fetchFn({ page, limit, search, ...filters })` must resolve to
 * `{ items, total }`. Wire `handleTableChange` straight to antd Table's
 * `onChange` and `pagination`/`loading`/`items` straight to DataTable.
 *
 * Pass `enabled: false` to skip fetching entirely — used by pages that fall
 * back to a fully static dataset while testing mode is on.
 */
export default function useServerTableQuery(fetchFn, { pageSize: defaultPageSize = 10, enabled = true } = {}) {
    const [searchInput, setSearchInput] = useState('');
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({ current: 1, pageSize: defaultPageSize });
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(enabled);
    const [reloadTick, setReloadTick] = useState(0);
    const requestId = useRef(0);
    const filtersRef = useRef(filters);
    const fetchFnRef = useRef(fetchFn);

    // Keeps the ref current without writing to it during render. Runs before
    // the fetch effect below (React runs effects in declaration order), so
    // that effect always sees the latest fetchFn even when it's a fresh
    // closure every render (e.g. an inline arrow capturing a prop).
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    });

    // Typing resets back to page 1 — the old page may not exist for the new query.
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchText(searchInput);
            setPagination((p) => (p.current === 1 ? p : { ...p, current: 1 }));
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (!enabled) return undefined;
        let cancelled = false;
        const id = ++requestId.current;
        setLoading(true);
        fetchFnRef
            .current({ page: pagination.current, limit: pagination.pageSize, search: searchText, ...filters })
            .then((data) => {
                if (cancelled || id !== requestId.current) return;
                setItems(data.items);
                setTotal(data.total);
            })
            .catch(() => {
                if (!cancelled) setItems([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, pagination.current, pagination.pageSize, searchText, JSON.stringify(filters), reloadTick]);

    // Wired straight to antd Table's onChange — page/pageSize/column-filter
    // changes all land here. A filter change (vs. just a page change) resets
    // back to page 1, since the old page may no longer exist for the new query.
    const handleTableChange = (nextPagination, tableFilters = {}) => {
        const nextFilters = Object.fromEntries(
            Object.entries(tableFilters)
                .filter(([, value]) => value?.length)
                .map(([key, value]) => [key, value[0]])
        );
        const filtersChanged = JSON.stringify(nextFilters) !== JSON.stringify(filtersRef.current);
        filtersRef.current = nextFilters;
        setFilters(nextFilters);
        setPagination({
            current: filtersChanged ? 1 : nextPagination.current,
            pageSize: nextPagination.pageSize,
        });
    };

    // Escape hatch for refreshing the current page after a mutation (create/
    // update/delete) without disturbing page/search/filter state.
    const refetch = () => setReloadTick((t) => t + 1);

    return {
        items,
        total,
        loading,
        searchInput,
        setSearchInput,
        filters,
        pagination,
        handleTableChange,
        refetch,
    };
}
