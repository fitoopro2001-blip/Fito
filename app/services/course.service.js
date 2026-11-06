import apiClient from './api';

export const getCourses = async () => {
  const { data } = await apiClient.get('/courses');
  return data.courses;
};

export const getCourseBySlug = async (slug) => {
  const { data } = await apiClient.get(`/courses/${encodeURIComponent(slug)}`);
  return data.course;
};

// Enrolment is multipart (the payment screenshot travels alongside the form
// fields), so it can't be sent as a plain JSON body. Auth required — the
// token is attached by the axios request interceptor.
export const enrollInCourse = async ({ courseId, paymentScreenshot, ...fields }) => {
  const formData = new FormData();
  formData.append('courseId', courseId);
  Object.entries(fields).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  if (paymentScreenshot) formData.append('paymentScreenshot', paymentScreenshot);

  // The screenshot uploads to Cloudinary inside this request, which can take
  // longer than the global default timeout.
  const { data } = await apiClient.post('/course-enrollments', formData, { timeout: 60000 });
  return data.enrollment;
};

export const getMyEnrollments = async () => {
  const { data } = await apiClient.get('/course-enrollments/my');
  return data.enrollments;
};
