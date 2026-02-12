import {
  Eye,
  Phone,
  Mail,
  Camera,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import Table from '../../ui/table';
import Pagination from '../../ui/pagination';
import Badge from '../../ui/badge';
import { Button } from '../../ui/button';
import { LoadingSpinner } from '../../ui/loading-spinner';

import { COLORS } from '../../../configs/CONST';

import { calculateAge, getStatusVariant } from '../utils/patientHelpers';

const PatientTableView = ({
  patients,
  pagination,
  isLoading,
  onViewPatient,
  onAddFace,
  onPageChange,
  onLimitChange,
  isDarkMode,
  userRole,
}) => {
  console.log(patients);
  const columns = [
    {
      header: 'Patient Info',
      accessor: 'patient_info',
      render: row => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{
              background: `linear-gradient(135deg, ${COLORS.info} 0%, ${COLORS.primary} 100%)`,
            }}
          >
            {row?.first_name[0].toUpperCase()}
            {row?.last_name[0].toUpperCase()}
          </div>
          <div>
            <p
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {row.first_name} {row.last_name}
            </p>
            <p
              className="text-xs"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {row.mrn} • {row.patient_uuid}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Age/Gender',
      accessor: 'demographics',
      render: row => (
        <div>
          <p
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {calculateAge(row.date_of_birth)} years
          </p>
          <p
            className="text-xs capitalize"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            {row.gender}
          </p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      render: row => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone
              size={14}
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            />
            <span
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {row.phone || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail
              size={14}
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            />
            <span
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {row.email || 'N/A'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'First Visit',
      accessor: 'first_visit_date',
      render: row => (
        <span
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          {!row.first_visit_date
            ? 'N/A'
            : new Date(row.first_visit_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'patient_status',
      render: row => (
        <Badge
          variant={getStatusVariant(row.patient_status)}
          className="capitalize"
        >
          {row.patient_status}
        </Badge>
      ),
    },
    {
      header: 'Face ID',
      accessor: 'face_id',
      render: row => (
        <div>
          {row.has_face ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Registered</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Not Set</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'center',
      render: row => (
        <div className="flex items-center gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            iconOnly
            onClick={e => {
              e.stopPropagation();
              onViewPatient(row);
            }}
          />
          {userRole === 'receptionist' && !row.has_face && (
            <Button
              variant="ghost"
              size="sm"
              icon={Camera}
              iconOnly
              onClick={e => {
                e.stopPropagation();
                onAddFace(row);
              }}
              title="Add Face ID"
              style={{ color: '#10b981' }} // green color
            />
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div
        className="rounded-xl shadow-sm border p-16 flex flex-col items-center justify-center"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          minHeight: '400px',
        }}
      >
        <LoadingSpinner size="lg" />
        <p
          className="mt-4 text-sm"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Loading patients data...
        </p>
      </div>
    );
  }

  return (
    <>
      <Table
        columns={columns}
        data={patients}
        onRowClick={onViewPatient}
        hoverable={true}
      />

      {patients.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
          onItemsPerPageChange={onLimitChange}
        />
      )}
    </>
  );
};

export default PatientTableView;
