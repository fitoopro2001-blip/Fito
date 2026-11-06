import apiClient from './api';

// Consultation submission is multipart (personal/goal data as JSON fields
// alongside the actual photo/report/payment-screenshot files), so it can't
// be sent as a plain JSON body like the other services in this folder.
const buildFormData = ({ goal, plan, personalInfo, goalData, uploads, transactionId }) => {
  const formData = new FormData();
  formData.append('goal', goal);
  if (plan) formData.append('plan', JSON.stringify(plan));
  formData.append('personalInfo', JSON.stringify(personalInfo));
  formData.append('goalData', JSON.stringify(goalData || {}));
  if (transactionId) formData.append('transactionId', transactionId);

  (uploads.bodyPhotos || []).forEach((file) => formData.append('bodyPhotos', file));
  (uploads.reports || []).forEach((file) => formData.append('reports', file));
  (uploads.paymentScreenshot || []).forEach((file) => formData.append('paymentScreenshot', file));

  return formData;
};

// Auth required — the token is attached by the axios request interceptor.
// No explicit Content-Type here: axios sets multipart/form-data with the
// required boundary itself when the body is a FormData instance. Setting it
// manually strips the boundary and the server can't parse the body.
export const submitConsultation = async (payload) => {
  // Up to 11 files (6 body photos + 4 reports + 1 payment screenshot, 5MB
  // each) upload straight to Cloudinary inside this request, which can
  // legitimately take longer than the global 20s default — hence the
  // longer override instead of raising the default for every request.
  const { data } = await apiClient.post('/consultations', buildFormData(payload), {
    timeout: 90000,
  });
  return data.consultation;
};

export const getMyConsultations = async () => {
  const { data } = await apiClient.get('/consultations/my');
  return data.consultations;
};

export const getConsultation = async (id) => {
  const { data } = await apiClient.get(`/consultations/${id}`);
  return data.consultation;
};

export const sendConsultationMessage = async (id, message) => {
  const { data } = await apiClient.post(`/consultations/${id}/messages`, { message });
  return data.consultation;
};

// Admin-managed prices/discounts for the 18 (goal, duration) plans — no auth
// required, unlike the rest of this file.
export const getConsultationPlans = async () => {
  const { data } = await apiClient.get('/consultation-plans');
  return data.plans;
};
