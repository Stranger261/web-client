import { Camera, Edit, Eye, Mail, Phone } from 'lucide-react';

import Card, { CardBody } from '../../ui/card';
import Badge from '../../ui/badge';
import { Button } from '../../ui/button';

export const PatientCard = ({ patient, onView, onEdit, onAddFace }) => {
  const calculateAge = dob => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getStatusVariant = status => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'deceased':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody>
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {patient.first_name?.[0]}
            {patient.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 truncate">
              {patient.first_name} {patient.middle_name} {patient.last_name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">MRN: {patient.mrn}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge
              variant={getStatusVariant(patient.patient_status)}
              className="capitalize"
            >
              {patient.patient_status}
            </Badge>
            {!patient.has_face && (
              <Badge variant="warning" className="text-xs">
                No Face
              </Badge>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">Age</p>
            <p className="text-sm font-medium text-gray-900">
              {calculateAge(patient.date_of_birth)} years
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Gender</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {patient.gender}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Blood Type</p>
            <p className="text-sm font-medium text-gray-900">
              {patient.blood_type || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Registration</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {patient.registration_type}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{patient.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 truncate">
              {patient.email || 'N/A'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={Eye}
            onClick={() => onView(patient)}
            className="flex-1"
          >
            View
          </Button>
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => onEdit(patient)}
            className="flex-1"
          >
            Edit
          </Button>
          {!patient.has_face && (
            <Button
              variant="success"
              icon={Camera}
              onClick={() => onAddFace(patient)}
              className="flex-1"
            >
              Add Face
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
