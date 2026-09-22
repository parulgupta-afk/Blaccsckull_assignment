import { apiClient } from './client';

export const competitionApi = {
  getDetails: (competitionId, locale) =>
    apiClient.get(`/competitions/${competitionId}`, { params: { locale } }),

  register: (competitionId, paymentReference) =>
    apiClient.post(`/competitions/${competitionId}/register`, { paymentReference }),

  confirmPayment: (competitionId, registrationId, paymentReference) =>
    apiClient.post(`/competitions/${competitionId}/registrations/${registrationId}/confirm-payment`, {
      paymentReference,
    }),

  submit: (competitionId, mediaUrl) =>
    apiClient.post(`/competitions/${competitionId}/submissions`, { mediaUrl }),
};
