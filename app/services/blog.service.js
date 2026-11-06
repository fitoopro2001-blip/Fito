import apiClient from './api';

export const getBlogs = async ({ category, limit } = {}) => {
    const { data } = await apiClient.get('/blogs', { params: { category, limit } });
    return data.blogs;
};

export const getBlogCategories = async () => {
    const { data } = await apiClient.get('/blogs/categories');
    return data.categories;
};

// Returns { blog, related } — the detail page renders both.
export const getBlogBySlug = async (slug) => {
    const { data } = await apiClient.get(`/blogs/${slug}`);
    return data;
};
