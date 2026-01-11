import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import {
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  ALLERGY_TYPE_LABELS,
  ALLERGY_TYPES,
  SEVERITY_LEVELS,
} from '../constants/allergyConstants';
import { LoadingSpinner } from '../../../../../components/ui/loading-spinner';
import { ConfirmationModal } from '../../../../../components/Modals/confirmation-modal';

export const AllergyCard = ({ allergy, onUpdate, onDelete }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({
    allergen: allergy.allergen,
    allergy_type: allergy.allergy_type,
    severity: allergy.severity,
    reaction: allergy.reaction || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(allergy.allergy_id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update allergy:', error);
      toast.error('Failed to update allergy. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(allergy.allergy_id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete allergy:', error);
      toast.error('Failed to delete allergy. Please try again later.');
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      allergen: allergy.allergen,
      allergy_type: allergy.allergy_type,
      severity: allergy.severity,
      reaction: allergy.reaction || '',
    });
    setIsEditing(false);
  };

  const severityColor = SEVERITY_COLORS[allergy.severity];

  return (
    <>
      <div
        className="rounded-lg border p-4 transition-all"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          opacity: isDeleting ? 0.5 : 1,
        }}
      >
        {isEditing ? (
          // EDIT MODE
          <div className="space-y-3">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide mb-1 block"
                style={{ color: COLORS.text.secondary }}
              >
                Allergen Name *
              </label>
              <input
                type="text"
                value={editData.allergen}
                onChange={e =>
                  setEditData({ ...editData, allergen: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.input.backgroundDark
                    : COLORS.input.background,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                }}
                placeholder="e.g., Penicillin, Peanuts, Pollen"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide mb-1 block"
                  style={{ color: COLORS.text.secondary }}
                >
                  Type *
                </label>
                <select
                  value={editData.allergy_type}
                  onChange={e =>
                    setEditData({ ...editData, allergy_type: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.input.backgroundDark
                      : COLORS.input.background,
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  {ALLERGY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {ALLERGY_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide mb-1 block"
                  style={{ color: COLORS.text.secondary }}
                >
                  Severity *
                </label>
                <select
                  value={editData.severity}
                  onChange={e =>
                    setEditData({ ...editData, severity: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.input.backgroundDark
                      : COLORS.input.background,
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  {SEVERITY_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {SEVERITY_LABELS[level]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide mb-1 block"
                style={{ color: COLORS.text.secondary }}
              >
                Reaction/Symptoms
              </label>
              <textarea
                value={editData.reaction}
                onChange={e =>
                  setEditData({ ...editData, reaction: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.input.backgroundDark
                    : COLORS.input.background,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                }}
                placeholder="Describe the reaction (e.g., rash, swelling, difficulty breathing)"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving || !editData.allergen}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                style={{
                  backgroundColor: COLORS.success,
                  color: '#ffffff',
                  opacity: isSaving || !editData.allergen ? 0.5 : 1,
                }}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" color="#ffffff" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.background.main,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // VIEW MODE
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className="font-semibold text-base"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {allergy.allergen}
                  </h4>
                  {allergy.severity === 'life_threatening' && (
                    <AlertTriangle
                      size={16}
                      style={{ color: SEVERITY_COLORS.life_threatening }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{
                      backgroundColor: severityColor + '20',
                      color: severityColor,
                    }}
                  >
                    {SEVERITY_LABELS[allergy.severity]}
                  </span>
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.darkHover
                        : COLORS.background.main,
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {ALLERGY_TYPE_LABELS[allergy.allergy_type]}
                  </span>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isDeleting}
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor =
                      COLORS.primary + '10';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Edit2 size={16} style={{ color: COLORS.primary }} />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor =
                      COLORS.danger + '10';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={16} style={{ color: COLORS.danger }} />
                </button>
              </div>
            </div>

            {allergy.reaction && (
              <div>
                <p
                  className="text-xs uppercase tracking-wide mb-1"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  Reaction
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {allergy.reaction}
                </p>
              </div>
            )}

            {allergy.reported_date && (
              <p
                className="text-xs mt-2"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Reported: {new Date(allergy.reported_date).toLocaleDateString()}
                {allergy.verified && ' • Verified'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Allergy"
        message="Are you sure you want to delete this allergy?"
        itemName={allergy.allergen}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
};
