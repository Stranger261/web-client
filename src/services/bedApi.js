import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class bedService {
  constructor() {
    this.bedApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/bed`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY || 'core-1-secret-key',
      },
    });
  }

  // read opertaions
  async getFloorSummary() {
    try {
      const floorSummary = await this.bedApi.get('/floor-summary');

      return floorSummary.data;
    } catch (error) {
      console.error('Failed to get floor summary.');
      throw error;
    }
  }

  async getRoomsSummary(floorNumber) {
    try {
      const roomsSummary = await this.bedApi.get(`/room/${floorNumber}`);

      return roomsSummary.data;
    } catch (error) {
      console.error('Failed to get room summary.');
      throw error;
    }
  }

  async getRoomBeds(roomId) {
    try {
      const roomBeds = await this.bedApi.get(`/${roomId}/beds`);

      return roomBeds.data;
    } catch (error) {
      console.error('Failed to get room beds.');
      throw error;
    }
  }

  async getAvailableBed(filters) {
    const { bedType, floor, roomType } = filters;

    try {
      const availableBeds = await this.bedApi.get('/available', {
        params: {
          bedType,
          floor,
          roomType,
        },
      });

      return availableBeds.data;
    } catch (error) {
      console.error('Failed to get available beds.');
      throw error;
    }
  }

  async getBedDetails(bedId) {
    try {
      const bedDetails = await this.bedApi.get(`/${bedId}`);

      return bedDetails.data;
    } catch (error) {
      console.error('Failed to get bed details.');
      throw error;
    }
  }

  async getAllBeds() {
    try {
      const beds = await this.bedApi.get('/all');

      return beds.data;
    } catch (error) {
      console.error('Failed to get all bed.');
      throw error;
    }
  }

  // stats
  async getBedOccupancyStats() {
    try {
      const bedOccupancyStats = await this.bedApi.get('/stats/occupancy');

      return bedOccupancyStats.data;
    } catch (error) {
      console.error('Failed to get bed occupancy stats.');
      throw error;
    }
  }

  async getBedRequiringAttention() {
    try {
      const bedRequireAttention = await this.bedApi.get('/stats/attention');

      return bedRequireAttention.data;
    } catch (error) {
      console.error('Failed to get bed require attention.');
      throw error;
    }
  }

  // manual updates
  async updateBedStatus(bedId, status, reason) {
    try {
      const newBedDetails = await this.bedApi.patch(`/${bedId}/status`, {
        status,
        reason,
      });

      return newBedDetails.data;
    } catch (error) {
      console.error('Failed to update bed status.');
      throw error;
    }
  }

  async markBedForMaintenance(bedId, reason) {
    try {
      const res = await this.bedApi.post(`/${bedId}/maintenance`, {
        reason,
      });

      return res.data;
    } catch (error) {
      console.error('Failed to mark bed as maintenance.');
      throw error;
    }
  }

  async markBedCleaned(bedId) {
    try {
      const res = await this.bedApi.patch(`/${bedId}/cleaned`);

      return res.data;
    } catch (error) {
      console.error('Failed to mark bed clean.');
      throw error;
    }
  }

  async reserveBed(bedId, reason) {
    try {
      const res = await this.bedApi.post(`/${bedId}/reserve`, {
        reason,
      });

      return res.data;
    } catch (error) {
      console.error('Failed to reserve bed.');
      throw error;
    }
  }

  async cancelBedReservation(bedId, reason) {
    try {
      const res = await this.bedApi.delete(`/${bedId}/reserve`, {
        reason,
      });

      return res.data;
    } catch (error) {
      console.error('Failed to cancel bed reservation.');
      throw error;
    }
  }

  // bed status logs
  async getBedStatusHistory(bedId) {
    try {
      const res = await this.bedApi.get(`${bedId}/history`);

      return res.data;
    } catch (error) {
      console.error('Failed get bed status history.');
      throw error;
    }
  }
  async getRecentStatusChanges() {
    try {
      const res = await this.bedApi.get('/logs/recent');

      return res.data;
    } catch (error) {
      console.error('Failed get Recent bed status changes.');
      throw error;
    }
  }
}

export default new bedService();
