import apiClient from './client';

// Courses take a single cover image, so the body is multipart/form-data with
// an optional `image` File. The list fields (`outcomes`, `curriculum`) can't
// travel as plain form values, so they're JSON-encoded.
const toFormData = ({ image, outcomes, curriculum, ...fields }) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
    });

    if (outcomes !== undefined) formData.append('outcomes', JSON.stringify(outcomes ?? []));
    if (curriculum !== undefined) formData.append('curriculum', JSON.stringify(curriculum ?? []));
    if (image instanceof File) formData.append('image', image);

    return formData;
};

export const fetchCourses = async (params = {}) => {
    const { data } = await apiClient.get('/admin/courses', { params });
    return data;
};

export const fetchCourse = async (id) => {
    const { data } = await apiClient.get(`/admin/courses/${id}`);
    return data.course;
};

export const createCourse = async (payload) => {
    const { data } = await apiClient.post('/admin/courses', toFormData(payload));
    return data.course;
};

export const updateCourse = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/courses/${id}`, toFormData(payload));
    return data.course;
};

export const deleteCourse = async (id) => {
    const { data } = await apiClient.delete(`/admin/courses/${id}`);
    return data;
};
