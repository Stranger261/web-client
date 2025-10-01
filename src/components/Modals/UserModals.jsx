import React from 'react';

const UserModal = ({
  modalMode,
  formData,
  setFormData,
  selectedUser,
  onClose,
  onSubmit,
}) => {
  const isEdit = modalMode === 'edit';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {isEdit ? 'Edit User' : 'Add User'}
        </h2>

        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          {/* Personal Info */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name *"
                required
                value={formData.firstname}
                onChange={e =>
                  setFormData({ ...formData, firstname: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="Middle Name"
                value={formData.middlename}
                onChange={e =>
                  setFormData({ ...formData, middlename: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="Last Name *"
                required
                value={formData.lastname}
                onChange={e =>
                  setFormData({ ...formData, lastname: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
              <input
                type="date"
                placeholder="Date of Birth *"
                required
                value={formData.dateOfBirth}
                onChange={e =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
              <select
                value={formData.gender}
                required
                onChange={e =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              >
                <option value="">Select Gender *</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <input
                type="tel"
                placeholder="Phone *"
                required
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={e =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={e =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
            </div>
          </div>

          {/* Account Info */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Account Information
            </h3>
            {!isEdit ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="px-4 py-2 border rounded-lg w-full"
                />
                <input
                  type="password"
                  placeholder="Password *"
                  required
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="px-4 py-2 border rounded-lg w-full"
                />
                <input
                  type="password"
                  placeholder="Confirm Password *"
                  required
                  value={formData.confirmPassword}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="px-4 py-2 border rounded-lg w-full"
                />
              </div>
            ) : (
              selectedUser && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">User ID:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {selectedUser.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {selectedUser.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date Added:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {selectedUser.dateAdded}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {selectedUser.lastLogin}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Role & Department */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Work Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                required
                value={formData.role}
                onChange={e =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              >
                <option value="">Select Role *</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
                <option value="patient">Patient</option>
              </select>
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={e =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Emergency Contact Name"
                value={formData.emergencyContact}
                onChange={e =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
              <input
                type="tel"
                placeholder="Emergency Phone"
                value={formData.emergencyPhone}
                onChange={e =>
                  setFormData({ ...formData, emergencyPhone: e.target.value })
                }
                className="px-4 py-2 border rounded-lg w-full"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
