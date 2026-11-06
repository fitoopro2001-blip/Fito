import apiClient from './api';

export const getCareers = async () => {
  const { data } = await apiClient.get('/careers');
  return data.careers;
};

export const applyToCareer = async (careerId, payload) => {
  const { data } = await apiClient.post(`/careers/${careerId}/apply`, payload);
  return data.application;
};
