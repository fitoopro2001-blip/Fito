import apiClient from './client';

// Blogs take a single cover image, so the body is multipart/form-data with an
// optional `image` File. `content` is HTML from the Tiptap editor.
const toFormData = ({ image, content, ...fields }) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
    });

    if (content !== undefined) formData.append('content', content);
    if (image instanceof File) formData.append('image', image);

    return formData;
};

export const fetchBlogs = async (params = {}) => {
    const { data } = await apiClient.get('/admin/blogs', { params });
    return data;
};

export const fetchBlog = async (id) => {
    const { data } = await apiClient.get(`/admin/blogs/${id}`);
    return data.blog;
};

export const createBlog = async (payload) => {
    const { data } = await apiClient.post('/admin/blogs', toFormData(payload));
    return data.blog;
};

export const updateBlog = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/blogs/${id}`, toFormData(payload));
    return data.blog;
};

export const deleteBlog = async (id) => {
    const { data } = await apiClient.delete(`/admin/blogs/${id}`);
    return data;
};
