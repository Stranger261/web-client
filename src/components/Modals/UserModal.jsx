const UserModal = ({
  modalMode,
  formData,
  setFormData,
  selectedUser,
  departments,
  getAvailableRoles,
  handleDepartmentChange,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {modalMode === 'add' ? 'Add New User' : 'Edit User'}
        </h3>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <input
            type="text"
            placeholder="First Name *"
            value={formData.firstname || ''}
            onChange={e =>
              setFormData({ ...formData, firstname: e.target.value })
            }
            required
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Last Name *"
            value={formData.lastname || ''}
            onChange={e =>
              setFormData({ ...formData, lastname: e.target.value })
            }
            required
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Middle Name"
            value={formData.middlename || ''}
            onChange={e =>
              setFormData({ ...formData, middlename: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email *"
            value={formData.email || ''}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
            className="border rounded-lg px-3 py-2"
          />

          {/* Phone */}
          <input
            type="text"
            placeholder="Phone *"
            value={formData.phone || ''}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            required
            className="border rounded-lg px-3 py-2"
          />

          {/* DOB */}
          <input
            type="date"
            placeholder="Date of Birth"
            value={formData.dateOfBirth || ''}
            onChange={e =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />

          {/* Gender */}
          <select
            value={formData.gender || ''}
            onChange={e => setFormData({ ...formData, gender: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Address */}
          <input
            type="text"
            placeholder="Address"
            value={formData.address || ''}
            onChange={e =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city || ''}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={formData.zipCode || ''}
            onChange={e =>
              setFormData({ ...formData, zipCode: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />

          {/* Department */}
          <select
            value={formData.department || ''}
            onChange={e => handleDepartmentChange(e.target.value)}
            required
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Select Department *</option>
            {departments.map(dep => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          {/* Role */}
          <select
            value={formData.role || ''}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            required
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Select Role *</option>
            {getAvailableRoles(formData.department).map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* Emergency Contact */}
          <input
            type="text"
            placeholder="Emergency Contact"
            value={formData.emergencyContact || ''}
            onChange={e =>
              setFormData({ ...formData, emergencyContact: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Emergency Phone"
            value={formData.emergencyPhone || ''}
            onChange={e =>
              setFormData({ ...formData, emergencyPhone: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {/* Add Password fields only in Add mode */}
        {modalMode === 'add' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input
              type="password"
              placeholder="Password *"
              value={formData.password || ''}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password *"
              value={formData.confirmPassword || ''}
              onChange={e =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="border rounded-lg px-3 py-2"
              required
            />
          </div>
        )}

        {/* Edit-only Account Info */}
        {modalMode === 'edit' && selectedUser && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4 text-sm">
            <p>
              <span className="text-gray-600">User ID:</span>{' '}
              <span className="font-medium">{selectedUser.id}</span>
            </p>
            <p>
              <span className="text-gray-600">Date Added:</span>{' '}
              <span className="font-medium">
                {selectedUser.dateAdded || 'N/A'}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Last Login:</span>{' '}
              <span className="font-medium">
                {selectedUser.lastLogin || 'N/A'}
              </span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            {modalMode === 'add' ? 'Add User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
