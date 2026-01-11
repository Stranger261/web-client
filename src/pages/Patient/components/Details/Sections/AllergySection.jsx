import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertCircle, Plus, Shield } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { AllergyCard } from '../components/AllergyCard';
import allergyAPI from '../../../../../services/allergyApi';
import { LoadingSpinner } from '../../../../../components/ui/loading-spinner';
import {
  INITIAL_ALLERGY_DATA,
  ALLERGY_TYPES,
  SEVERITY_LEVELS,
  ALLERGY_TYPE_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
} from '../constants/allergyConstants';

import { useAuth } from '../../../../../contexts/AuthContext';

export const AllergiesSection = () => {
  const { currentUser } = useAuth();
  const userUuid = currentUser?.user_uuid;
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [allergies, setAllergies] = useState([]);
  const [criticalAllergies, setCriticalAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAllergy, setNewAllergy] = useState(INITIAL_ALLERGY_DATA);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAllergies();
  }, []);

  const fetchAllergies = async () => {
    try {
      setLoading(true);
      const [allergiesResponse, criticalResponse] = await Promise.all([
        allergyAPI.getAllAllergies(userUuid),
        allergyAPI.getCriticalAllergies(userUuid),
      ]);

      setAllergies(allergiesResponse.data || []);
      setCriticalAllergies(criticalResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch allergies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.allergen.trim()) {
      toast.warning('Please enter an allergen name');
      return;
    }

    setIsSaving(true);
    try {
      await allergyAPI.createAllergy(userUuid, newAllergy);
      await fetchAllergies();
      setNewAllergy(INITIAL_ALLERGY_DATA);
      setIsAddingNew(false);
      toast.success('Allergy added successfully.');
    } catch (error) {
      console.error('Failed to add allergy:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to add allergy. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAllergy = async (allergyId, updatedData) => {
    try {
      await allergyAPI.updateAllergy(userUuid, allergyId, updatedData);
      await fetchAllergies();
      toast.success('Allergy updated successfully.');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to update allergy. Please try again.'
      );
      throw error;
    }
  };

  const handleDeleteAllergy = async allergyId => {
    try {
      await allergyAPI.deleteAllergy(userUuid, allergyId);
      await fetchAllergies();
      toast.success('Deleted successfully.');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to add allergy. Please try again.'
      );
      throw error;
    }
  };

  const handleCancelAdd = () => {
    setNewAllergy(INITIAL_ALLERGY_DATA);
    setIsAddingNew(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div
      className="mt-8 pt-6 border-t"
      style={{
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
      }}
    >
      {/* CRITICAL ALLERGIES BANNER */}
      {criticalAllergies.length > 0 && (
        <div
          className="mb-6 rounded-lg border-2 p-4 animate-pulse-subtle"
          style={{
            backgroundColor: isDarkMode
              ? 'rgba(127, 29, 29, 0.2)'
              : 'rgba(239, 68, 68, 0.1)',
            borderColor: SEVERITY_COLORS.life_threatening,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{
                backgroundColor: SEVERITY_COLORS.life_threatening + '30',
              }}
            >
              <Siren
                size={24}
                style={{ color: SEVERITY_COLORS.life_threatening }}
              />
            </div>
            <div className="flex-1">
              <h4
                className="text-base font-bold mb-2 flex items-center gap-2"
                style={{ color: SEVERITY_COLORS.life_threatening }}
              >
                <AlertTriangle size={18} />
                CRITICAL ALLERGIES ALERT
              </h4>
              <p
                className="text-sm mb-3"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                This patient has {criticalAllergies.length} severe or
                life-threatening{' '}
                {criticalAllergies.length === 1 ? 'allergy' : 'allergies'}:
              </p>
              <div className="space-y-2">
                {criticalAllergies.map(allergy => (
                  <div
                    key={allergy.allergy_id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.dark
                        : COLORS.surface.light,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        size={20}
                        style={{ color: SEVERITY_COLORS[allergy.severity] }}
                      />
                      <div>
                        <p
                          className="font-semibold text-base"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {allergy.allergen}
                        </p>
                        {allergy.reaction && (
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            {allergy.reaction}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-3 py-1 rounded-full font-bold"
                        style={{
                          backgroundColor:
                            SEVERITY_COLORS[allergy.severity] + '30',
                          color: SEVERITY_COLORS[allergy.severity],
                        }}
                      >
                        {SEVERITY_LABELS[allergy.severity].toUpperCase()}
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h4
          className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          <AlertCircle size={16} style={{ color: COLORS.warning }} />
          All Known Allergies ({allergies.length})
        </h4>

        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors hover:opacity-80"
            style={{
              backgroundColor: COLORS.primary,
              color: '#ffffff',
            }}
          >
            <Plus size={16} />
            Add Allergy
          </button>
        )}
      </div>

      {/* ADD NEW ALLERGY FORM */}
      {isAddingNew && (
        <div
          className="mb-4 rounded-lg border-2 p-4"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: COLORS.primary,
          }}
        >
          <h5
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            <Plus size={16} style={{ color: COLORS.primary }} />
            Add New Allergy
          </h5>

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
                value={newAllergy.allergen}
                onChange={e =>
                  setNewAllergy({ ...newAllergy, allergen: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
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
                autoFocus
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
                  value={newAllergy.allergy_type}
                  onChange={e =>
                    setNewAllergy({
                      ...newAllergy,
                      allergy_type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
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
                  value={newAllergy.severity}
                  onChange={e =>
                    setNewAllergy({ ...newAllergy, severity: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
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
                value={newAllergy.reaction}
                onChange={e =>
                  setNewAllergy({ ...newAllergy, reaction: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
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

            {/* Severity Warning */}
            {(newAllergy.severity === 'severe' ||
              newAllergy.severity === 'life_threatening') && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{
                  backgroundColor: SEVERITY_COLORS[newAllergy.severity] + '15',
                  border: `1px solid ${SEVERITY_COLORS[newAllergy.severity]}30`,
                }}
              >
                <AlertTriangle
                  size={16}
                  style={{ color: SEVERITY_COLORS[newAllergy.severity] }}
                  className="flex-shrink-0 mt-0.5"
                />
                <p
                  className="text-xs"
                  style={{ color: SEVERITY_COLORS[newAllergy.severity] }}
                >
                  <strong>Warning:</strong> This allergy will be marked as{' '}
                  {SEVERITY_LABELS[newAllergy.severity].toLowerCase()} and will
                  appear in the critical allergies alert.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddAllergy}
                disabled={isSaving || !newAllergy.allergen.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: COLORS.success,
                  color: '#ffffff',
                  opacity: isSaving || !newAllergy.allergen.trim() ? 0.5 : 1,
                  cursor:
                    isSaving || !newAllergy.allergen.trim()
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" color="#ffffff" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Allergy
                  </>
                )}
              </button>
              <button
                onClick={handleCancelAdd}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.background.main,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALLERGIES LIST */}
      {allergies.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.background.main,
          }}
        >
          <Shield
            size={64}
            className="mx-auto mb-4 opacity-20"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          />
          <p
            className="text-base font-medium mb-1"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            No allergies recorded
          </p>
          <p
            className="text-sm"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Click "Add Allergy" to record any known allergies
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allergies.map(allergy => (
            <AllergyCard
              key={allergy.allergy_id}
              allergy={allergy}
              onUpdate={handleUpdateAllergy}
              onDelete={handleDeleteAllergy}
            />
          ))}
        </div>
      )}
    </div>
  );
};
