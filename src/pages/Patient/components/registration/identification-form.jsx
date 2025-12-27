import React, { useState } from 'react';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select } from '../../../../components/ui/select';

const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID' },
  { value: 'philhealth', label: 'PhilHealth ID' },
  { value: 'health_insurance', label: 'Health Insurance Card' },
  { value: 'other', label: 'Other' },
];

export const IdentificationForm = ({
  data,
  onChange,
  onBack,
  onNext,
  isSubmitting,
}) => {
  const { processOCR } = useAuth();
  const [errors, setErrors] = useState({});
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [idImage, setIdImage] = useState(
    data.id_image ? URL.createObjectURL(data.id_image) : null
  );
  const [ocrResult, setOcrResult] = useState(null);
  const [showOcrResults, setShowOcrResults] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null);
  const [ocrFields, setOcrFields] = useState(null);

  const handleChange = (field, value) => {
    onChange({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const callOcrApi = async imageFile => {
    try {
      const response = await processOCR(imageFile);
      return response.data; // Return the data from auth context
    } catch (error) {
      console.error('❌ OCR API error:', error);
      throw new Error(error.message || 'OCR processing failed');
    }
  };

  const mapIdTypeFromOcr = ocrIdType => {
    if (!ocrIdType) return null;

    const idTypeStr = ocrIdType.toLowerCase();

    if (idTypeStr.includes('philhealth') || idTypeStr.includes('phil health')) {
      return 'philhealth';
    } else if (idTypeStr.includes('national')) {
      return 'national_id';
    } else if (idTypeStr.includes('driver') || idTypeStr.includes('license')) {
      return 'drivers_license';
    } else if (idTypeStr.includes('passport')) {
      return 'passport';
    } else if (
      idTypeStr.includes('health') ||
      idTypeStr.includes('insurance')
    ) {
      return 'health_insurance';
    }

    return 'other';
  };

  const parseAddressFromOcr = addressString => {
    if (!addressString) return {};

    const updates = {};
    const parts = addressString.split(',').map(p => p.trim());

    // Try to extract street and barangay
    if (parts.length > 0) {
      updates.street = parts[0];
    }
    if (parts.length > 1) {
      // Second part might be barangay
      updates.address_notes = addressString;
    }

    return updates;
  };

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setIdImage(reader.result);
      onChange({ id_image: file });
    };
    reader.readAsDataURL(file);

    setIsProcessingOcr(true);
    setOcrFields(null);
    setOcrResult(null);
    setMatchStatus(null);
    setErrors({});
    setShowOcrResults(false);

    try {
      const ocrResponse = await callOcrApi(file);
      setOcrResult(ocrResponse);

      if (ocrResponse.fields) {
        setOcrFields(ocrResponse.fields);

        const updates = {};

        // Map ID Type
        if (ocrResponse.idType) {
          const mappedIdType = mapIdTypeFromOcr(ocrResponse.idType);
          if (mappedIdType && !data.id_type) {
            updates.id_type = mappedIdType;
          }
        }

        // Map First Name
        if (ocrResponse.fields.firstname && !data.first_name) {
          updates.first_name = ocrResponse.fields.firstname;
        }

        // Map Last Name
        if (ocrResponse.fields.lastname && !data.last_name) {
          updates.last_name = ocrResponse.fields.lastname;
        }

        // Map Middle Name
        if (ocrResponse.fields.middlename && !data.middle_name) {
          updates.middle_name = ocrResponse.fields.middlename;
        }

        // Map ID Number
        if (ocrResponse.fields.idNumber) {
          updates.id_number = ocrResponse.fields.idNumber;
        }

        // Map Date of Birth
        if (ocrResponse.fields.birthDate && !data.date_of_birth) {
          try {
            const birthDate = new Date(ocrResponse.fields.birthDate);
            if (!isNaN(birthDate.getTime())) {
              updates.date_of_birth = birthDate.toISOString().split('T')[0];

              // Calculate age
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
              ) {
                age--;
              }
              updates.age = age.toString();
            }
          } catch (error) {
            console.error('Error parsing birth date:', error);
          }
        }

        // Map Gender
        if (ocrResponse.fields.sex && !data.gender) {
          const sex = ocrResponse.fields.sex.toUpperCase();
          if (sex === 'MALE' || sex === 'M') {
            updates.gender = 'male';
          } else if (sex === 'FEMALE' || sex === 'F') {
            updates.gender = 'female';
          }
        }

        // Map Nationality
        if (ocrResponse.fields.nationality && !data.nationality) {
          updates.nationality = ocrResponse.fields.nationality;
        }

        // Map Address (if empty)
        if (ocrResponse.fields.address && !data.street) {
          const addressUpdates = parseAddressFromOcr(
            ocrResponse.fields.address
          );
          Object.assign(updates, addressUpdates);
        }

        // Map Expiration Date
        if (ocrResponse.fields.expirationDate) {
          try {
            const expDate = new Date(ocrResponse.fields.expirationDate);
            if (!isNaN(expDate.getTime())) {
              updates.id_expiry_date = expDate.toISOString().split('T')[0];
            }
          } catch (error) {
            console.error('Error parsing expiration date:', error);
          }
        }

        // Apply updates
        onChange(updates);
        setShowOcrResults(true);

        // Verify data match
        const matchResult = verifyDataMatch(ocrResponse.fields, {
          ...data,
          ...updates,
        });
        setMatchStatus(matchResult.matched ? 'matched' : 'mismatch');

        if (!matchResult.matched) {
          setErrors({
            submit: 'ID information does not match your profile details',
            details: matchResult.issues,
          });
        }
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setErrors({ submit: error.message || 'Failed to process ID image' });
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const verifyDataMatch = (ocrFields, formData) => {
    const issues = [];

    // Compare First Name
    if (ocrFields.firstname && formData.first_name) {
      if (
        ocrFields.firstname.toLowerCase().trim() !==
        formData.first_name.toLowerCase().trim()
      ) {
        issues.push(
          `First name: "${ocrFields.firstname}" doesn't match "${formData.first_name}"`
        );
      }
    } else if (!ocrFields.firstname) {
      issues.push('First name not detected in ID');
    }

    // Compare Last Name
    if (ocrFields.lastname && formData.last_name) {
      if (
        ocrFields.lastname.toLowerCase().trim() !==
        formData.last_name.toLowerCase().trim()
      ) {
        issues.push(
          `Last name: "${ocrFields.lastname}" doesn't match "${formData.last_name}"`
        );
      }
    } else if (!ocrFields.lastname) {
      issues.push('Last name not detected in ID');
    }

    // Compare Date of Birth
    if (ocrFields.birthDate && formData.date_of_birth) {
      try {
        // Parse both dates
        const ocrDate = new Date(ocrFields.birthDate);
        const formDate = new Date(formData.date_of_birth);

        // Check if dates are valid
        if (isNaN(ocrDate.getTime()) || isNaN(formDate.getTime())) {
          issues.push('Date of birth format error - could not compare');
        } else {
          // Compare year, month, and day only (ignore time)
          const ocrYear = ocrDate.getFullYear();
          const ocrMonth = ocrDate.getMonth();
          const ocrDay = ocrDate.getDate();

          const formYear = formDate.getFullYear();
          const formMonth = formDate.getMonth();
          const formDay = formDate.getDate();

          if (
            ocrYear !== formYear ||
            ocrMonth !== formMonth ||
            ocrDay !== formDay
          ) {
            issues.push(
              `Date of birth: "${formatDate(
                ocrFields.birthDate
              )}" doesn't match "${formatDate(formData.date_of_birth)}"`
            );
          }
        }
      } catch (error) {
        console.error('Date comparison error:', error);
        issues.push('Date of birth format error - could not compare');
      }
    }

    return { matched: issues.length === 0, issues };
  };

  const formatDate = dateString => {
    if (!dateString) return 'Not detected';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleRemoveImage = () => {
    setIdImage(null);
    setOcrFields(null);
    setOcrResult(null);
    setMatchStatus(null);
    setShowOcrResults(false);
    onChange({
      id_image: null,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!data.id_type) {
      newErrors.id_type = 'ID type is required';
    }

    if (data.id_type === 'other' && !data.id_type_specification) {
      newErrors.id_type_specification = 'Please specify ID type';
    }

    if (!data.id_number) {
      newErrors.id_number = 'ID number is required';
    }

    if (!data.id_image) {
      newErrors.id_image = 'ID image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (matchStatus === 'mismatch') {
      // Show warning but allow to proceed
      if (
        !window.confirm(
          'ID information does not match your profile. Do you want to proceed anyway?'
        )
      ) {
        return;
      }
    }

    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Identity Verification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Identification Type"
            value={data.id_type || ''}
            onChange={e => handleChange('id_type', e.target.value)}
            options={ID_TYPES}
            error={errors.id_type}
            required
          />

          {data.id_type === 'other' && (
            <Input
              label="Specify ID Type"
              value={data.id_type_specification || ''}
              onChange={e =>
                handleChange('id_type_specification', e.target.value)
              }
              error={errors.id_type_specification}
              required
            />
          )}

          <Input
            label="ID Number"
            value={data.id_number || ''}
            onChange={e => handleChange('id_number', e.target.value)}
            error={errors.id_number}
            required
          />

          <Input
            label="ID Expiry Date"
            type="date"
            value={data.id_expiry_date || ''}
            onChange={e => handleChange('id_expiry_date', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Front Image {!idImage && <span className="text-red-500">*</span>}
          </label>

          {idImage ? (
            <div className="space-y-4">
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      {isProcessingOcr
                        ? 'Processing OCR...'
                        : 'ID image uploaded successfully'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {ocrFields && !isProcessingOcr && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={showOcrResults ? EyeOff : Eye}
                        onClick={() => setShowOcrResults(!showOcrResults)}
                      >
                        {showOcrResults ? 'Hide' : 'Show'} Results
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <img
                src={idImage}
                alt="ID preview"
                className="max-w-xs max-h-48 mx-auto border rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          )}
          {errors.id_image && (
            <p className="mt-1 text-sm text-red-600">{errors.id_image}</p>
          )}
        </div>

        {isProcessingOcr && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="text-blue-900 font-semibold text-lg">
                  Processing ID with OCR
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Extracting information from your ID... Please wait.
                </p>
              </div>
            </div>
          </div>
        )}

        {showOcrResults && ocrFields && !isProcessingOcr && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h4 className="text-xl font-bold text-blue-900 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                OCR Extraction Results
              </h4>
              <span className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md">
                {ocrResult?.idType || 'ID Detected'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h5 className="font-bold text-blue-900 text-lg">
                    Extracted from ID
                  </h5>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md space-y-3 border border-blue-100">
                  <div className="pb-3 border-b-2 border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      Full Name
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {ocrFields.fullname || 'Not detected'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        First Name
                      </p>
                      <p className="font-semibold text-gray-900">
                        {ocrFields.firstname || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Last Name
                      </p>
                      <p className="font-semibold text-gray-900">
                        {ocrFields.lastname || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Middle Name
                    </p>
                    <p className="font-semibold text-gray-900">
                      {ocrFields.middlename || 'N/A'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Date of Birth
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(ocrFields.birthDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Gender
                        </p>
                        <p className="font-semibold text-gray-900">
                          {ocrFields.sex || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      ID Number
                    </p>
                    <p className="font-mono font-bold text-blue-600 text-lg">
                      {ocrFields.idNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Nationality
                    </p>
                    <p className="font-semibold text-gray-900">
                      {ocrFields.nationality || 'N/A'}
                    </p>
                  </div>

                  {ocrFields.address && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Address
                      </p>
                      <p className="font-medium text-gray-900 text-sm leading-relaxed">
                        {ocrFields.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  <h5 className="font-bold text-green-900 text-lg">
                    Your Profile
                  </h5>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md space-y-3 border border-green-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        First Name
                      </p>
                      <p
                        className={`font-semibold ${
                          data.first_name &&
                          ocrFields.firstname &&
                          data.first_name.toLowerCase().trim() ===
                            ocrFields.firstname.toLowerCase().trim()
                            ? 'text-green-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {data.first_name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Last Name
                      </p>
                      <p
                        className={`font-semibold ${
                          data.last_name &&
                          ocrFields.lastname &&
                          data.last_name.toLowerCase().trim() ===
                            ocrFields.lastname.toLowerCase().trim()
                            ? 'text-green-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {data.last_name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Middle Name
                    </p>
                    <p className="font-semibold text-gray-900">
                      {data.middle_name || 'Not provided'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Date of Birth
                        </p>
                        <p
                          className={`font-semibold ${
                            data.date_of_birth &&
                            ocrFields.birthDate &&
                            formatDate(data.date_of_birth) ===
                              formatDate(ocrFields.birthDate)
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {formatDate(data.date_of_birth)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Gender
                        </p>
                        <p className="font-semibold text-gray-900">
                          {data.gender || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-lg p-4 ${
                    matchStatus === 'matched'
                      ? 'bg-green-100 border-2 border-green-400'
                      : 'bg-amber-100 border-2 border-amber-400'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {matchStatus === 'matched' ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-bold mb-1 ${
                          matchStatus === 'matched'
                            ? 'text-green-900'
                            : 'text-amber-900'
                        }`}
                      >
                        {matchStatus === 'matched'
                          ? '✓ Information Verified'
                          : '⚠ Verification Issues'}
                      </p>
                      <p
                        className={`text-sm ${
                          matchStatus === 'matched'
                            ? 'text-green-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {matchStatus === 'matched'
                          ? 'ID information matches your profile!'
                          : 'Some information does not match. Please review.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errors.details && errors.details.length > 0 && (
              <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-lg p-5">
                <h5 className="font-bold text-red-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Mismatch Details
                </h5>
                <ul className="space-y-2">
                  {errors.details.map((issue, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-red-800"
                    >
                      <span className="text-red-600 font-bold mr-2">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOcrResults(false)}
              >
                Hide Details
              </Button>
              {matchStatus !== 'matched' && (
                <Button
                  type="button"
                  onClick={() => {
                    setMatchStatus('matched');
                    setErrors({});
                  }}
                >
                  Accept & Continue
                </Button>
              )}
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <div className="mr-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          </div>
          <div className="">
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={
                !idImage || !data.id_type || !data.id_number || isSubmitting
              }
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
