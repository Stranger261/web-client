import axios from 'axios';
import {
  APPOINTMENT_SERVICE_BASE_URL,
  INTERNAL_API_KEY,
} from '../configs/CONST';

class appointmentSerevice {
  constructor() {
    this.appointmentApi = axios.create({
      baseURL: `${APPOINTMENT_SERVICE_BASE_URL}/appointments`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
  }

  async bookUserAppointment(appointmentData) {
    try {
      const bookedAppointment = await this.appointmentApi.post(
        '/book',
        appointmentData
      );

      console.log(bookedAppointment);

      return bookedAppointment.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAppointmentById(appointmentId) {
    try {
      const appointment = await this.appointmentApi.get(`/${appointmentId}`);
      console.log(appointment);

      return appointment.data;
    } catch (error) {
      console.log('Get appointment error: ', error);
      throw error;
    }
  }

  async getPatientAppointments(patientUuid, filters = {}) {
    try {
      const patientAppointment = await this.appointmentApi.get(
        `/patient/${patientUuid}`,
        { params: filters }
      );

      return patientAppointment.data;
    } catch (error) {
      console.log('patient appointment error: ', error);
      throw error;
    }
  }

  // for staff

  // doctor/receptionist/nurse
  async getAppointmentsToday(filters) {
    try {
      const appointmentToday = await this.appointmentApi.get('/today', {
        filters,
      });
      console.log(appointmentToday);

      return appointmentToday.data;
    } catch (error) {
      console.log('today appointment error: ', error);
      throw error;
    }
  }

  async checkInAppointment(appointmentId) {
    try {
      const checkedInAppointment = await this.appointmentApi.patch(
        `/${appointmentId}/check-in`
      );
      console.log(checkedInAppointment);

      return checkedInAppointment.data;
    } catch (error) {
      console.log('check-in appointment failed: ', error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId, reason) {
    try {
      const cancelledAppointment = await this.appointmentApi.patch(
        `/${appointmentId}/cancel`,
        { reason }
      );
      console.log(cancelledAppointment);

      return cancelledAppointment.data;
    } catch (error) {
      console.log('check-in appointment failed: ', error);
      throw error;
    }
  }

  async rescheduleAppointment(appointmentId, newAppointmentData) {
    try {
      const { new_time, new_date } = newAppointmentData;
      const rescheduledAppointment = await this.appointmentApi.patch(
        `/${appointmentId}/reschedule`,
        { new_date, new_time }
      );
      console.log(rescheduledAppointment);

      return rescheduledAppointment.data;
    } catch (error) {
      console.log('rescheduled appointment failed: ', error);
      throw error;
    }
  }

  async getAppointmentTypes() {
    try {
      const res = await this.appointmentApi.get('/appointment-types');
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async extendAppointment(appointmentId, additionl_minutes) {
    try {
      const extendedAppointment = await this.appointmentApi.patch(
        `/${appointmentId}/extend`,
        { additionl_minutes }
      );
      console.log(extendedAppointment);

      return extendedAppointment.data;
    } catch (error) {
      console.log('extend appointment failed: ', error);
      throw error;
    }
  }

  async completeAppointment(appointmentId, notes) {
    try {
      const completedAppointment = await this.appointmentApi.patch(
        `/${appointmentId}/complete`,
        { notes }
      );
      console.log(completedAppointment);

      return completedAppointment.data;
    } catch (error) {
      console.log('completed appointment failed: ', error);
      throw error;
    }
  }

  async processPayment(appointmentId, paymentData) {
    try {
      const processedAppointment = await this.appointmentApi.post(
        `/${appointmentId}/payment`,
        { paymentData }
      );
      console.log(processedAppointment);

      return processedAppointment.data;
    } catch (error) {
      console.log('process payment failed: ', error);
      throw error;
    }
  }

  async calculateFee(appointmentDetails = {}) {
    try {
      const fee = await this.appointmentApi.get(
        '/calculate-fee',
        appointmentDetails
      );
      console.log(fee);

      return fee.data;
    } catch (error) {
      console.log('calculate fee error: ', error);
      throw error;
    }
  }
}

export default new appointmentSerevice();
