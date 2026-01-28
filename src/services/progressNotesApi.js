import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class ProgressNoteService {
  constructor() {
    this.progressNoteApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/progressNote`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY || 'core-1-secret-key',
      },
    });
  }

  // Create progress note
  async createProgressNote(noteData) {
    try {
      const response = await this.progressNoteApi.post('/create', { noteData });
      return response.data;
    } catch (error) {
      console.error('Failed to create progress note:', error);
      throw error;
    }
  }

  // Amend progress note
  async amendProgressNote(noteId, amendmentData) {
    try {
      const response = await this.progressNoteApi.post(`/${noteId}/amend`, {
        amendmentData,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to amend progress note:', error);
      throw error;
    }
  }

  // Soft delete progress note
  async deleteProgressNote(noteId, reason) {
    try {
      const response = await this.progressNoteApi.delete(`/${noteId}`, {
        data: { reason },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete progress note:', error);
      throw error;
    }
  }
  // Get progress notes for an admission
  async getAdmissionProgressNotes(admissionId, filters = {}) {
    try {
      const response = await this.progressNoteApi.get(
        `/admission/${admissionId}`,
        { params: filters },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get admission progress notes:', error);
      throw error;
    }
  }

  // Get single progress note
  async getProgressNoteById(noteId) {
    try {
      const response = await this.progressNoteApi.get(`/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get progress note:', error);
      throw error;
    }
  }

  // Get note with amendment history
  async getProgressNoteWithHistory(noteId) {
    try {
      const response = await this.progressNoteApi.get(`/${noteId}/history`);
      return response.data;
    } catch (error) {
      console.error('Failed to get progress note history:', error);
      throw error;
    }
  }

  // Get vital signs history
  async getVitalSignsHistory(admissionId, limit = 20) {
    try {
      const response = await this.progressNoteApi.get(
        `/admission/${admissionId}/vitals`,
        { params: { limit } },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get vital signs history:', error);
      throw error;
    }
  }

  // Get vitals trend with comparison
  async getVitalsTrendWithComparison(admissionId, limit = 20) {
    try {
      const response = await this.progressNoteApi.get(
        `/admission/${admissionId}/vitals-trend`,
        { params: { limit } },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get vitals trend:', error);
      throw error;
    }
  }

  // Get latest progress note
  async getLatestProgressNote(admissionId) {
    try {
      const response = await this.progressNoteApi.get(
        `/admission/${admissionId}/latest`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get latest progress note:', error);
      throw error;
    }
  }
}

export default new ProgressNoteService();
