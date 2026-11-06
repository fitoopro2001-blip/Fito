import { useMemo, useState } from 'react';

/**
 * Lightweight client-side search + filter helper for AntD Tables backed by
 * mock data. Pagination and sorting are handled natively by AntD's Table.
 */
export default function useTableQuery(data, { searchKeys = [] } = {}) {
    const [searchText, setSearchText] = useState('');

    const filteredData = useMemo(() => {
        if (!searchText.trim()) return data;
        const query = searchText.toLowerCase();
        return data.filter((row) =>
            searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(query))
        );
    }, [data, searchText, searchKeys]);

    return { searchText, setSearchText, filteredData };
}
