import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class videoService {
  constructor() {
    this.videoApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/online-video`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  async getTodaysOnlineConsultation(filters) {
    try {
      const todaysAppointment = await this.videoApi.get('/appointments/today', {
        params: filters,
      });

      return todaysAppointment.data;
    } catch (error) {
      console.log('Failed to get todays appointment', error);
      throw error;
    }
  }

  async createRoom(appointmentId) {
    try {
      const createdRoom = await this.videoApi.post('/create-room', {
        params: { appointmentId },
      });

      return createdRoom.data;
    } catch (error) {
      console.log('Failed to create consultation room: ', error.message);
      throw error;
    }
  }

  async getRoomDetails(roomId) {
    try {
      const roomDetails = await this.videoApi.get(`/${roomId}/room-details`);

      return roomDetails.data;
    } catch (error) {
      console.log('Get room details failed: ', error.message);
      throw error;
    }
  }

  async checkRoomStatus(roomId) {
    try {
      const status = await this.videoApi.get(`/${roomId}/status`);

      return status.data;
    } catch (error) {
      console.log('Check room status error: ', error);
      throw error;
    }
  }

  async joinRoom(data) {
    const { peerId, socketId, roomId } = data;
    console.log('JOIN ROOM DATA:', peerId, socketId);

    try {
      const joinedRoom = await this.videoApi.patch(`/${roomId}/join-room`, {
        peerId,
        socketId,
      });

      return joinedRoom.data;
    } catch (error) {
      console.log('Failed to join room: ', error);
      throw error;
    }
  }

  async userDisconnected(socketId) {
    try {
      const disconnectedUser = await this.videoApi.patch('/disconnected-user', {
        socketId,
      });

      return disconnectedUser.data;
    } catch (error) {
      console.log('Failed to disconnect: ', error);
      throw error;
    }
  }

  async leaveRoom({ roomId, duration }) {
    try {
      const leftRoom = await this.videoApi.patch(`/${roomId}/leave-room`, {
        duration,
      });

      return leftRoom.data;
    } catch (error) {
      console.log('Failed to leave room: ', error);
      throw error;
    }
  }

  async rejoinRoom({ roomId, socketId, peerId }) {
    try {
      const rejoinedRoom = await this.videoApi.patch(`/${roomId}/rejoin-room`, {
        socketId,
        peerId,
      });

      return rejoinedRoom.data;
    } catch (error) {
      console.log('Failed to rejoin room: ', error);
      throw error;
    }
  }

  async deleteRoom(roomId) {
    try {
      const deletedRoom = await this.videoApi.delete(`/${roomId}/delete-room`);

      return deletedRoom.data;
    } catch (error) {
      console.log('Delete room failed: ', error.message);
      throw error;
    }
  }
}

export default new videoService();
