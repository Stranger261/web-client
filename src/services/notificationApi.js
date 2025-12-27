import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class notificationService {
  constructor() {
    this.notificationApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/notifications`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
  }

  async getUserNotification(filters) {
    try {
      const res = await this.notificationApi.get('/user-notifications', {
        params: filters,
      });

      return res.data;
    } catch (error) {
      console.log('Notif api error: ', error);
      throw error;
    }
  }

  async readNotification(notifId) {
    try {
      const latestNotif = await this.notificationApi.patch(
        `/notification/${notifId}`
      );

      return latestNotif.data;
    } catch (error) {
      console.log('Notification read error: ', error);
      throw error;
    }
  }

  async markedReadAllNotif() {
    try {
      const res = await this.notificationApi.patch(`/read-all`);

      return res.data;
    } catch (error) {
      console.log('Notification read all error: ', error);
      throw error;
    }
  }
}

export default new notificationService();
