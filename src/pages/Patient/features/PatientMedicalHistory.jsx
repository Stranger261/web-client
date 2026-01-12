import { useState, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../../components/ui/card';
import Pagination from '../../../components/ui/pagination';

import MedicalRecordsTable from '../components/MedicalHistory/MedicalRecordsTable';
import RecordDetailModal from '../components/MedicalHistory/RecordDetailModal';

import { COLORS, ITEMS_PER_PAGE } from '../../../configs/CONST';

import { usePatient } from '../../../contexts/PatientContext';
import { useAuth } from '../../../contexts/AuthContext';

const PatientMedicalHistory = () => {
  const { medHistory, getPatientMedHistory } = usePatient();
  const { currentUser } = useAuth();
  const isDarkMode = document.documentElement.classList.contains('dark');

  // State
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 0,
    total: 0,
  });

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
  }, [pagination.page, pagination.limit]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const patientUuid = currentUser?.person?.patient?.patient_uuid;
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const medHistory = await getPatientMedHistory(patientUuid, filters);

      setPagination(medHistory.data.pagination);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  }, [
    currentUser.person,
    getPatientMedHistory,
    pagination.page,
    pagination.limit,
  ]);

  const handleViewDetails = record => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = useCallback(
    newLimit => {
      setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setPagination]
  );

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
                  itemsPerPage={pagination.limit}
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
