import { useContext } from 'react';
import { createContext } from 'react';
import updatePersonApi from '../services/updatePersonApi';

const UpdateContext = createContext();

const UpdateProvider = ({ children }) => {
  const updateEmail = async (userUuid, updatedEmail) => {
    try {
      const res = await updatePersonApi.updateEmail(userUuid, updatedEmail);

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateAddress = async (userUuid, updatedAddress) => {
    try {
      const res = await updatePersonApi.updatedAddress(
        userUuid,
        updatedAddress
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateCivilStatus = async (userUuid, updatedStatus) => {
    try {
      const res = await updatePersonApi.updateCivilStatus(
        userUuid,
        updatedStatus
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateContacts = async (userUuid, updatedContact) => {
    try {
      const res = await updatePersonApi.updateContacts(
        userUuid,
        updatedContact
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateHeight = async (userUuid, updatedHeight) => {
    try {
      const res = await updatePersonApi.updateHeight(userUuid, updatedHeight);

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateWeight = async (userUuid, updatedWeight) => {
    try {
      const res = await updatePersonApi.updateWeight(userUuid, updatedWeight);

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateChronicConditions = async (
    userUuid,
    updatedChronicConditions
  ) => {
    try {
      const res = await updatePersonApi.updateChronicConditions(
        userUuid,
        updatedChronicConditions
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateCurrentMedications = async (
    userUuid,
    updatedCurrentMedications
  ) => {
    try {
      const res = await updatePersonApi.updateCurrentMedications(
        userUuid,
        updatedCurrentMedications
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateInsuranceProvider = async (
    userUuid,
    updatedInsuranceProvider
  ) => {
    try {
      const res = await updatePersonApi.updateInsuranceProvider(
        userUuid,
        updatedInsuranceProvider
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateInsuranceNumber = async (userUuid, updatedInsuranceNumber) => {
    try {
      const res = await updatePersonApi.updateInsuranceNumber(
        userUuid,
        updatedInsuranceNumber
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateInsuranceExpiry = async (userUuid, updatedInsuranceExpiry) => {
    try {
      const res = await updatePersonApi.updateInsuranceExpiry(
        userUuid,
        updatedInsuranceExpiry
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const value = {
    updateAddress,
    updateCivilStatus,
    updateContacts,
    updateEmail,
    updateHeight,
    updateWeight,
    updateChronicConditions,
    updateCurrentMedications,
    updateInsuranceProvider,
    updateInsuranceNumber,
    updateInsuranceExpiry,
  };

  return (
    <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>
  );
};

export const useUpdate = () => {
  const context = useContext(UpdateContext);

  if (!context) {
    throw new Error('Update context must be used within UpdateProvider');
  }

  return context;
};

export default UpdateProvider;
