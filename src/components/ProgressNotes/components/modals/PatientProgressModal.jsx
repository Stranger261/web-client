import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Activity, FileText, Clock, Plus, Filter } from 'lucide-react';

import { COLORS } from '../../../../configs/CONST';

import ProgressNotesList from '../../ProgressNotesList';
import VitalsChart from '../../VitalsChart';
import ProgressNoteModal from './ProgressNoteModal';
import progressNoteService from '../../../../services/progressNotesApi';

import Modal from '../../../ui/Modal';
import { Button } from '../../../ui/button';
import Badge from '../../../ui/badge';

const PatientProgressModal = ({ isOpen, onClose, admission, onUpdate }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (isOpen && admission && !showNoteForm) {
      loadProgressNotes();
      if (activeTab === 'vitals') {
        loadVitalsTrend();
      }
    }
  }, [isOpen, admission, showNoteForm, activeTab, pagination.page]);

  const loadProgressNotes = async () => {
    setLoading(true);
    try {
      const response = await progressNoteService.getAdmissionProgressNotes(
        admission.admission_id,
        {
          page: pagination.page,
          limit: pagination.limit,
        },
      );
      setNotes(response.data.notes);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load progress notes');
    } finally {
      setLoading(false);
    }
  };

  const loadVitalsTrend = async () => {
    try {
      const response = await progressNoteService.getVitalsTrendWithComparison(
        admission.admission_id,
        20,
      );
      setVitals(response.data);
    } catch (error) {
      toast.error('Failed to load vitals trend');
    }
  };

  const handleCreateNote = async noteData => {
    try {
      await progressNoteService.createProgressNote(noteData);
      toast.success('Progress note created successfully');
      setShowNoteForm(false);
      loadProgressNotes();
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to create progress note');
    }
  };

  if (!isOpen) return null;

  const patient = admission?.patient;

  const tabs = [
    { id: 'notes', label: 'Progress Notes', icon: FileText },
    { id: 'vitals', label: 'Vitals Trend', icon: Activity },
  ];

  return (
    <>
      {/* Main Modal */}
      <Modal
        isOpen={isOpen && !showNoteForm}
        onClose={onClose}
        title={`${patient?.person?.first_name || ''} ${patient?.person?.last_name || ''} - Progress`}
      >
        <div className="space-y-4">
          {/* Patient Info Header */}
          <div
            className="p-3 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.darkHover
                : COLORS.surface.lightHover,
            }}
          >
            <div>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                {admission?.admission_number} • MRN: {patient?.mrn}
              </p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => setShowNoteForm(true)}
            >
              Add Note
            </Button>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-2 border-b"
            style={{
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors"
                  style={{
                    borderColor: isActive ? COLORS.info : 'transparent',
                    color: isActive
                      ? COLORS.info
                      : isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'notes' && (
              <ProgressNotesList
                notes={notes}
                loading={loading}
                onRefresh={loadProgressNotes}
                admission={admission}
              />
            )}

            {activeTab === 'vitals' && (
              <VitalsChart vitals={vitals} loading={loading} />
            )}
          </div>

          {/* Pagination */}
          {activeTab === 'notes' && pagination.total > 0 && (
            <div
              className="flex items-center justify-between pt-4 border-t"
              style={{
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
              }}
            >
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Nested Note Form Modal */}
      <ProgressNoteModal
        isOpen={showNoteForm}
        onClose={() => setShowNoteForm(false)}
        admission={admission}
        onSubmit={handleCreateNote}
      />
    </>
  );
};

export default PatientProgressModal;
