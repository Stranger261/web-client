class FacePlusPlusService {
  constructor() {
    this.BASE_URL = 'http://localhost:56742/api/v1/faceplusplus';
  }

  async makeRequest(endpoint, body) {
    try {
      const response = await fetch(`${this.BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Face++ request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`Face++ ${endpoint} error:`, error.message);
      throw error;
    }
  }

  async detectFace(imageBase64) {
    return await this.makeRequest('detect', { imageBase64 });
  }

  async compareFaces(faceToken1, faceToken2) {
    return await this.makeRequest('compare', { faceToken1, faceToken2 });
  }

  async verifyFaces(idImageBase64, liveImageBase64) {
    return await this.makeRequest('verify', { idImageBase64, liveImageBase64 });
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.BASE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Face++ health check error:', error.message);
      return { status: 'error', message: error.message };
    }
  }
}

export default new FacePlusPlusService();
