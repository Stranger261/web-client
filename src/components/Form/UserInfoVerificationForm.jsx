import { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Upload,
  ArrowRight,
  FileImage,
  Save,
} from 'lucide-react';
import Modal from '../../components/generic/Modal';
import { UnverifiedBanner, UnverifiedUserStatus } from '../generic/Warning';
import Spinner from '../generic/Spinner';
import ExtractedData from '../generic/ExtractedData';

const UserInfoVerificationForm = ({
  userData,
  onSubmit,
  errors,
  isSubmitting,
  fileInputRef,
  idPhotoPreview,
  handleIdPhotoChange,
  handleInputChange,
  formData,
  extractedData,
  extractDataError,
  OCROpen,
  canSubmit,
  dateOfBirthValue,
  isOCRLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <span className="text-gray-400">
              Personal Information & ID Upload
            </span>
          </div>
        </div>
      </div>

      <div className="bg-base-100 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Personal Information
        </h3>
        {!userData?.isVerified && (
          <UnverifiedBanner onClick={() => setIsModalOpen(true)} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstname ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={true}
              placeholder="Enter first name"
            />
            {errors.firstname && (
              <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastname ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
              disabled={true}
            />
            {errors.lastname && (
              <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              name="middlename"
              value={formData.middlename}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter middle name"
              disabled={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+63XXXXXXXXXX"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Gender <span className="text-red-600">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID enrollment status
            </label>
            <input
              type="text"
              name="faceEnrollmentStatus"
              value={formData.faceEnrollmentStatus}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.faceEnrollmentStatus
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date of Birth <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={dateOfBirthValue}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-base-100 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ZIP code"
            />
          </div>
        </div>
      </div>

      <div className="bg-base-100 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Emergency Contact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Emergency contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+63XXXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {formData.faceEnrollmentStatus === 'pending' && !formData?.isVerified && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileImage className="w-5 h-5 mr-2" />
            ID Photo Upload <span className="text-red-600">*</span>
          </h3>
          <p className="text-gray-600 mb-4">
            Please upload a clear photo of your Philippine Valid ID for
            verification.
          </p>

          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleIdPhotoChange}
              accept="image/*"
              className="hidden"
            />

            {!idPhotoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                  errors.idPhoto ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to upload your ID photo
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, or GIF up to 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={idPhotoPreview}
                    alt="ID Preview"
                    className="w-full max-w-sm mx-auto rounded-lg border border-gray-300"
                  />
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            )}

            {errors.idPhoto && (
              <p className="text-red-500 text-sm">{errors.idPhoto}</p>
            )}
          </div>
        </div>
      )}

      {OCROpen && (
        <ExtractedData
          error={extractDataError}
          data={extractedData}
          isOCRLoading={isOCRLoading}
        />
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className={` flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              formData?.isVerified
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }
            disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Submitting...
            </>
          ) : formData?.isVerified ? (
            <>
              Update status <Save className="w-4 h-4 ml-2 " />
            </>
          ) : (
            <>
              Submit Information
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(!isModalOpen)}>
        <UnverifiedUserStatus />
      </Modal>

      {/* Step Content */}
      <div className="bg-white rounded-lg px-6">{renderStep1()}</div>
    </div>
  );
};

export default UserInfoVerificationForm;
