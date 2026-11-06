import apiClient from './client';

// Products are sent as multipart/form-data because new gallery images are
// uploaded alongside the fields. `images` holds newly picked File objects,
// `existingImages` the URLs the admin chose to keep.
const toFormData = ({ images = [], existingImages, nutritionFacts, variants, ...fields }) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
    });

    if (nutritionFacts !== undefined) formData.append('nutritionFacts', JSON.stringify(nutritionFacts));
    if (variants !== undefined) formData.append('variants', JSON.stringify(variants));

    images.forEach((file) => formData.append('images', file));

    if (existingImages !== undefined) {
        // An empty array must still be communicated, so send a blank marker the
        // controller normalizes away.
        if (existingImages.length === 0) formData.append('existingImages', '');
        existingImages.forEach((url) => formData.append('existingImages', url));
    }

    return formData;
};

export const fetchProducts = async (params = {}) => {
    const { data } = await apiClient.get('/admin/products', { params });
    return data;
};

export const fetchProduct = async (id) => {
    const { data } = await apiClient.get(`/admin/products/${id}`);
    return data.product;
};

export const createProduct = async (payload) => {
    const { data } = await apiClient.post('/admin/products', toFormData(payload));
    return data.product;
};

export const updateProduct = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/products/${id}`, toFormData(payload));
    return data.product;
};

export const deleteProduct = async (id) => {
    const { data } = await apiClient.delete(`/admin/products/${id}`);
    return data;
};

// `ids` is the full product list in the desired display order.
export const reorderProducts = async (ids) => {
    const { data } = await apiClient.patch('/admin/products/reorder', { ids });
    return data;
};
