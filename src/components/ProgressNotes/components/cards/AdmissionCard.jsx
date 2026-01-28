import { useState } from 'react';
import {
  Clock,
  Calendar,
  User,
  Activity,
  FileText,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import Card, { CardBody } from '../../../ui/card';
import Badge from '../../../ui/badge';
import { Button } from '../../../ui/button';

import ProgressNoteModal from '../modals/ProgressNoteModal';
import PatientProgressModal from '../modals/PatientProgressModal';
import { COLORS } from '../../../../configs/CONST';

import progressNoteService from '../../../../services/progresNotesApi';

const AdmissionCard = ({ admission, onUpdate }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const patient = admission.patient;
  const doctor = admission.attendingDoctor;

  const handleCreateNote = async noteData => {
    setLoading(true);
    try {
      await progressNoteService.createProgressNote(noteData);
      toast.success('Progress note created successfully');
      setShowNoteModal(false);
      onUpdate?.(); // Refresh parent data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const getBedTypeBadge = bedType => {
    const variants = {
      icu: 'danger',
      ward: 'primary',
      isolation: 'warning',
      semi_private: 'info',
      private: 'success',
    };
    return variants[bedType] || 'default';
  };

  const getStatusBadge = status => {
    const variants = {
      occupied: 'danger',
      available: 'success',
      maintenance: 'warning',
    };
    return variants[status] || 'default';
  };

  return (
    <>
      <Card hover className="h-full">
        <CardBody>
          <div className="space-y-4">
            {/* Header - Patient Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS.info}20` }}
                >
                  <User size={24} style={{ color: COLORS.info }} />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {patient.person.first_name} {patient.person.last_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: COLORS.text.secondary }}>
                      #{admission.admission_number}
                    </span>
                    <span style={{ color: COLORS.text.secondary }}>•</span>
                    <span style={{ color: COLORS.text.secondary }}>
                      MRN-{patient.mrn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admission Type Badges */}
              <div className="flex gap-2">
                <Badge variant="primary">{admission.admission_type}</Badge>
                <Badge variant="info">{admission.admission_source}</Badge>
              </div>
            </div>

            {/* Patient Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Blood Type & Vitals */}
              <div className="flex items-center gap-2">
                <Activity size={16} style={{ color: COLORS.text.secondary }} />
                <div>
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Blood Type
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {patient.blood_type || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp size={16} style={{ color: COLORS.success }} />
                <div>
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Vitals
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {admission.latestVitals
                      ? `${admission.latestVitals.blood_pressure_systolic}/${admission.latestVitals.blood_pressure_diastolic}`
                      : 'No data'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bed Information */}
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.darkHover
                  : COLORS.surface.lightHover,
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {admission.bed?.bed_number || 'No Bed Assigned'}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Type: {admission.bed?.bed_type || 'N/A'}
                  </p>
                </div>
                <Badge variant={getStatusBadge(admission.bed?.status)}>
                  {admission.bed?.status || 'Unknown'}
                </Badge>
              </div>
            </div>

            {/* Admission Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: COLORS.text.secondary }} />
                <div>
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Admitted
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {new Date(admission.admission_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: COLORS.text.secondary }} />
                <div>
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    LOS
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {admission.length_of_stay_days || 0} days
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor */}
            <div className="flex items-center gap-2">
              <User size={16} style={{ color: COLORS.text.secondary }} />
              <div>
                <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                  Attending Doctor
                </p>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Dr. {doctor?.person?.first_name || ''}{' '}
                  {doctor?.person?.last_name || ''}
                </p>
                {doctor?.specialization && (
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {doctor.specialization}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                icon={FileText}
                className="flex-1"
                onClick={() => setShowNoteModal(true)}
              >
                Add Note
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDetailsModal(true)}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <ProgressNoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        admission={admission}
        onSubmit={handleCreateNote}
        loading={loading}
      />

      <PatientProgressModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        admission={admission}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default AdmissionCard;
