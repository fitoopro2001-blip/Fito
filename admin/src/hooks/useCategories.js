import { useEffect, useState } from 'react';
import { fetchCategories } from '../api/adminCategories.api';

// Read-only category list for pages that just need to populate a dropdown or
// filter (e.g. the product form/table) — CategoryManagementPage manages its
// own state directly since it also needs to create/update/delete.
export default function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchCategories()
            .then((data) => {
                if (!cancelled) setCategories(data);
            })
            .catch(() => {
                if (!cancelled) setCategories([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return { categories, loading };
}
