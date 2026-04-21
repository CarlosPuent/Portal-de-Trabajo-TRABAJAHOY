// Review Service
import { api } from '@services/api';

export const reviewService = {
  // ── Public ────────────────────────────────────────────────────────────────
  async getCompanyReviews(companyId, params = {}) {
    const response = await api.get(`/reviews/company/${companyId}`, params);
    return response.data;
  },

  async getCompanyReviewSummary(companyId) {
    const response = await api.get(`/reviews/company/${companyId}/summary`);
    return response.data;
  },

  async getReviewById(id) {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  // ── Authenticated ─────────────────────────────────────────────────────────
  async getMyReviews() {
    const response = await api.get('/reviews/me/list');
    return response.data;
  },

  /**
   * Create a review for a company
   * @param {Object} data - { companyId, rating, title, content, pros, cons, employmentStatus, isAnonymous }
   */
  async createReview(data) {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  async updateReview(id, data) {
    const response = await api.patch(`/reviews/${id}`, data);
    return response.data;
  },

  async deleteReview(id) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  async rateHelpful(reviewId) {
    const response = await api.post(`/reviews/${reviewId}/helpfulness`);
    return response.data;
  },

  async removeHelpful(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}/helpfulness`);
    return response.data;
  },

  async reportReview(reviewId, reason, details) {
    const response = await api.post(`/reviews/${reviewId}/reports`, { reason, details });
    return response.data;
  },

  // ── Admin / Moderator ─────────────────────────────────────────────────────
  async getReportedReviews() {
    const response = await api.get('/reviews/admin/reported/list');
    return response.data;
  },

  async getAllReviewsAdmin(params = {}) {
    const response = await api.get('/reviews/admin/list', params);
    return response.data;
  },

  async getReviewReports(reviewId) {
    const response = await api.get(`/reviews/admin/${reviewId}/reports`);
    return response.data;
  },

  /**
   * Moderate a review
   * @param {string} reviewId
   * @param {Object} data - { status: 'approved' | 'rejected', moderatorNotes }
   */
  async moderateReview(reviewId, data) {
    const response = await api.patch(`/reviews/admin/${reviewId}/status`, data);
    return response.data;
  },
};
