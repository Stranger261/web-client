import { useEffect, useState } from 'react';
import { INITIAL_PATIENT_DATA } from '../constants/patientConstants';
import { useUpdate } from '../../../../../contexts/UpdateContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { transformUserDataToPatientData } from '../utils/patientDataTransformer';

export const usePatientData = () => {
  const {
    updateAddress,
    updateCivilStatus,
    updateContacts,
    updateEmail,
    updateHeight,
    updateWeight,
    updateChronicConditions,
    updateCurrentMedications,
    updateInsuranceProvider,
    updateInsuranceName,
    updateInsuranceExpiry,
  } = useUpdate();
  const { currentUser } = useAuth();

  const userUuid = currentUser?.user_uuid;

  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Resolve address codes to names
      const primaryAddress = currentUser.person?.addresses?.find(
        addr => addr.is_primary
      );

      // Transform nested data to flat structure
      const transformedData = transformUserDataToPatientData(
        currentUser,
        primaryAddress
      );

      setPatientData(transformedData);
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
      setError(err.message || 'Failed to load patient data');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateField = async (field, value) => {
    setIsLoading(true);

    try {
      switch (field) {
        case 'civilStatus':
          await updateCivilStatus(userUuid, value);
          break;
        case 'emergency_contact_name':
        case 'emergency_contact_relation':
        case 'emergency_contact_number':
        case 'contact_number':
        case 'contact_name':
        case 'contact_type':
          await updateContacts(userUuid, { [field]: value });
          break;
        case 'email':
          await updateEmail(userUuid, value);
          break;
        case 'height':
          await updateHeight(userUuid, value);
          break;
        case 'weight':
          await updateWeight(userUuid, value);
          break;
        case 'chronicConditions':
          await updateChronicConditions(userUuid, value);
          break;
        case 'currentMedications':
          await updateCurrentMedications(userUuid, value);
          break;
        case 'insuranceProvider':
          await updateInsuranceProvider(userUuid, value);
          break;
        case 'updateInsuranceName':
          await updateInsuranceName(userUuid, value);
          break;
        case 'insuranceExpiry':
          await updateInsuranceExpiry(userUuid, value);
          break;
        default:
          break;
      }
      await new Promise(resolve => setTimeout(resolve, 800));

      setPatientData(prev => ({
        ...prev,
        [field]: value,
      }));

      return { success: true };
    } catch (error) {
      console.error('Failed to update field:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateFields = async updates => {
    setIsLoading(true);

    try {
      await updateAddress(userUuid, updates);

      setPatientData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          ...updates,
        },
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    patientData,
    isLoading,
    loadingData,
    setPatientData,
    updateField,
    updateFields,
  };
};
