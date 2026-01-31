// components/modals/RoundsViewModal.jsx
import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CheckCircle,
  Clock,
  Activity,
  Thermometer,
  Pill,
  FileText,
} from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';
import doctorAdmissionApi from '../../../../services/doctorAdmissionApi';
import { Button } from '../../../ui/button';
import { LoadingSpinner } from '../../../ui/loading-spinner';

const RoundsViewModal = ({ isOpen, onClose, admission, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [vitals, setVitals] = useState(null);

  useEffect(() => {
    if (isOpen && admission) {
      fetchRoundsData();
    }
  }, [isOpen, admission]);

  const fetchRoundsData = async () => {
    setLoading(true);
    try {
      // Fetch recent notes
      const notesResponse =
        await doctorAdmissionApi.getDoctorAdmissionProgressNotes(
          admission.admission_id,
          { limit: 5 },
        );
      setNotes(notesResponse.data?.notes || []);

      // Fetch latest vitals (you'll need to implement this endpoint)
      // const vitalsResponse = await someApi.getLatestVitals(admission.admission_id);
      // setVitals(vitalsResponse.data);
    } catch (error) {
      console.error('Error fetching rounds data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !admission) return null;

  const patientName =
    `${admission.patient?.person?.first_name || ''} ${admission.patient?.person?.last_name || ''}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 sm:p-6 border-b"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6" style={{ color: COLORS.primary }} />
            <div>
              <h2
                className="text-xl font-bold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Rounds View - {patientName}
              </h2>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                Today's assessment and monitoring
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={onClose}
            className="w-8 h-8 p-0"
          />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  icon={Thermometer}
                  className="flex flex-col items-center justify-center h-20"
                >
                  <span className="text-xs">Record Vitals</span>
                </Button>

                <Button
                  variant="outline"
                  icon={Pill}
                  className="flex flex-col items-center justify-center h-20"
                >
                  <span className="text-xs">Review Meds</span>
                </Button>

                <Button
                  variant="outline"
                  icon={FileText}
                  className="flex flex-col items-center justify-center h-20"
                >
                  <span className="text-xs">Add Note</span>
                </Button>

                <Button
                  variant="outline"
                  icon={CheckCircle}
                  className="flex flex-col items-center justify-center h-20"
                >
                  <span className="text-xs">Mark Visited</span>
                </Button>
              </div>

              {/* Recent Notes */}
              <div>
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Recent Notes
                </h3>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.slice(0, 3).map(note => (
                      <div
                        key={note.note_id}
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
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-sm font-medium"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {note.note_type}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {new Date(note.note_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p
                          className="text-sm line-clamp-2"
                          style={{ color: COLORS.text.secondary }}
                        >
                          {note.assessment || note.subjective || 'No content'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: COLORS.text.secondary }}>
                    No recent notes
                  </p>
                )}
              </div>

              {/* Today's Checklist */}
              <div>
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Today's Checklist
                </h3>
                <div className="space-y-2">
                  {[
                    'Review latest vitals',
                    'Check medication administration',
                    'Assess pain level',
                    'Review lab results',
                    'Update care plan',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundsViewModal;
