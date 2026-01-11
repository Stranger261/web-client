import { useState, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Pagination from '../../../components/ui/Pagination';

import MedicalRecordsTable from '../components/MedicalHistory/MedicalRecordsTable';
import RecordDetailModal from '../components/MedicalHistory/RecordDetailModal';

import { COLORS } from '../../../configs/CONST';

import { usePatient } from '../../../contexts/PatientContext';
import { useAuth } from '../../../contexts/AuthContext';

const PatientMedicalHistory = () => {
  const { medHistory, pagination, getPatientMedHistory } = usePatient();
  const { currentUser } = useAuth();
  const isDarkMode = document.documentElement.classList.contains('dark');

  // State
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch records
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const patientUuid = currentUser?.person?.patient?.patient_uuid;

      await getPatientMedHistory(patientUuid, pagination);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.person, getPatientMedHistory, pagination]);

  const handleViewDetails = record => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = newItemsPerPage => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader
          title="Medical History"
          subtitle="View your past medical records and consultations"
          action={
            <div className="flex items-center gap-2">
              <FileText
                size={24}
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              />
            </div>
          }
        />

        <CardBody padding={false}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: COLORS.primary }}
              />
            </div>
          ) : (
            <>
              <div className={isMobile ? 'p-4' : ''}>
                <MedicalRecordsTable
                  records={medHistory}
                  onViewDetails={handleViewDetails}
                  isMobile={isMobile}
                />
              </div>

              {pagination.total > 0 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>

      <RecordDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        record={selectedRecord}
      />
    </div>
  );
};

export default PatientMedicalHistory;
