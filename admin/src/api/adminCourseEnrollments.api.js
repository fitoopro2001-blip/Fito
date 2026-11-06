import apiClient from './client';

export const fetchCourseEnrollments = async (params = {}) => {
    const { data } = await apiClient.get('/admin/course-enrollments', { params });
    return data;
};

// Resolves to { enrollment, emailSent } — emailSent is only set when the
// change approved the enrolment (that's what triggers the confirmation email).
export const updateCourseEnrollment = async (id, updates) => {
    const { data } = await apiClient.patch(`/admin/course-enrollments/${id}`, updates);
    return data;
};

export const resendEnrollmentEmail = async (id) => {
    const { data } = await apiClient.post(`/admin/course-enrollments/${id}/resend-email`);
    return data.enrollment;
};

export const deleteCourseEnrollment = async (id) => {
    await apiClient.delete(`/admin/course-enrollments/${id}`);
};
