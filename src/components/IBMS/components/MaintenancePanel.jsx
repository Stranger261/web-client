import { useState, useEffect } from 'react';
import {
  Wrench,
  Sparkles,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  BedDouble,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { COLORS } from '../../../configs/CONST';
import { useIBMSSocket } from '../../../hooks/useIBMSSocket';
import BedMaintenanceModal from './Modals/BedMaintenanceModal';
import bedApi from '../../../services/bedApi';
import bedAssignmentApi from '../../../services/bedAssignmentApi';

const MaintenancePanel = ({ isDarkMode, userRole }) => {
  const [activeTab, setActiveTab] = useState('cleaning'); // 'cleaning', 'maintenance'
  const [cleaningBeds, setCleaningBeds] = useState([]);
  const [maintenanceBeds, setMaintenanceBeds] = useState([]);
  const [filterFloor, setFilterFloor] = useState('all');
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const tabs = [
    {
      id: 'cleaning',
      label: 'Needs Cleaning',
      shortLabel: 'Cleaning',
      icon: Sparkles,
      color: COLORS.warning,
    },
    {
      id: 'maintenance',
      label: 'Under Maintenance',
      shortLabel: 'Maintenance',
      icon: Wrench,
      color: COLORS.danger,
    },
  ];

  const { isConnected } = useIBMSSocket({
    onBedStatusChanged: data => {
      fetchBedsRequiringAttention();
    },
    onBedCleaned: data => {
      fetchBedsRequiringAttention();
    },
    onBedReleased: data => {
      fetchBedsRequiringAttention();
    },
  });

  useEffect(() => {
    fetchBedsRequiringAttention();
    fetchFloors();
  }, []);

  const fetchBedsRequiringAttention = async () => {
    setLoading(true);
    try {
      const response = await bedApi.getBedRequiringAttention();
      const data = response.data;

      setCleaningBeds(data.cleaning || []);
      setMaintenanceBeds(data.maintenance || []);
    } catch (error) {
      console.error('Error fetching beds requiring attention:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async () => {
    try {
      const response = await bedApi.getFloorSummary();
      setFloors(response.data || []);
    } catch (error) {
      console.error('Error fetching floors:', error);
    }
  };

  const handleMarkCleaned = async bedId => {
    try {
      await bedAssignmentApi.markBedCleaned(bedId);
      fetchBedsRequiringAttention();
      toast.success('Bed marked as cleaned successfully');
    } catch (error) {
      console.error('Error marking bed as cleaned:', error);
      toast.error(
        error.response?.data?.message || 'Failed to mark bed as cleaned',
      );
    }
  };

  const handleViewMaintenance = bed => {
    setSelectedBed(bed);
    setShowMaintenanceModal(true);
  };

  const getFilteredBeds = beds => {
    if (filterFloor === 'all') return beds;
    return beds.filter(bed => bed.room?.floor_number === parseInt(filterFloor));
  };

  const getTimeSince = date => {
    if (!date) return 'Unknown';
    const now = new Date();
    const bedDate = new Date(date);
    const diffMs = now - bedDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }
  };

  const getUrgencyColor = date => {
    if (!date) return COLORS.text.secondary;
    const now = new Date();
    const bedDate = new Date(date);
    const diffHours = (now - bedDate) / (1000 * 60 * 60);

    if (diffHours > 48) return COLORS.danger; // More than 2 days
    if (diffHours > 24) return COLORS.warning; // More than 1 day
    return COLORS.info; // Less than 1 day
  };

  if (loading && cleaningBeds.length === 0 && maintenanceBeds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: COLORS.primary }}
        />
      </div>
    );
  }

  const currentBeds =
    activeTab === 'cleaning'
      ? getFilteredBeds(cleaningBeds)
      : getFilteredBeds(maintenanceBeds);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2
            className="text-xl sm:text-2xl font-bold truncate"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Maintenance & Cleaning
          </h2>
          <p
            className="text-xs sm:text-sm mt-0.5 sm:mt-1"
            style={{ color: COLORS.text.secondary }}
          >
            Manage beds requiring attention
          </p>
        </div>

        {/* Summary Cards - Responsive */}
        <div className="flex gap-2 sm:gap-3">
          <div
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.badge.warning.bg,
              borderColor: COLORS.warning,
            }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                style={{ color: COLORS.warning }}
              />
              <div className="min-w-0">
                <p
                  className="text-xs truncate"
                  style={{ color: COLORS.text.secondary }}
                >
                  <span className="hidden sm:inline">Needs </span>Cleaning
                </p>
                <p
                  className="text-lg sm:text-xl font-bold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {cleaningBeds.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.badge.danger.bg,
              borderColor: COLORS.danger,
            }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Wrench
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                style={{ color: COLORS.danger }}
              />
              <div className="min-w-0">
                <p
                  className="text-xs truncate"
                  style={{ color: COLORS.text.secondary }}
                >
                  <span className="hidden sm:inline">Under </span>Maintenance
                </p>
                <p
                  className="text-lg sm:text-xl font-bold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {maintenanceBeds.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Responsive */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count =
            tab.id === 'cleaning'
              ? cleaningBeds.length
              : maintenanceBeds.length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
              style={{
                backgroundColor: isActive
                  ? tab.color + '20'
                  : isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.surface.lightHover,
                color: isActive ? tab.color : COLORS.text.secondary,
                borderLeft: isActive ? `3px solid ${tab.color}` : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span
                className="px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: isActive ? tab.color : COLORS.text.secondary,
                  color: COLORS.text.white,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter - Responsive */}
      <div
        className="p-2.5 sm:p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Filter
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
            style={{ color: COLORS.text.secondary }}
          />
          <span
            className="text-xs sm:text-sm font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Filter by Floor:
          </span>
        </div>
        <select
          value={filterFloor}
          onChange={e => setFilterFloor(e.target.value)}
          className="w-full sm:w-auto px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-lg border text-xs sm:text-sm"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.input.backgroundDark
              : COLORS.input.background,
            borderColor: isDarkMode
              ? COLORS.input.borderDark
              : COLORS.input.border,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <option value="all">All Floors</option>
          {floors.map(floor => (
            <option key={floor.floor_number} value={floor.floor_number}>
              Floor {floor.floor_number}
            </option>
          ))}
        </select>
      </div>

      {/* Beds List - Responsive Grid */}
      {currentBeds.length === 0 ? (
        <div
          className="text-center py-8 sm:py-12 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <CheckCircle
            className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3"
            style={{ color: COLORS.success }}
          />
          <p
            className="text-base sm:text-lg font-medium px-4"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            All Clear!
          </p>
          <p
            className="text-xs sm:text-sm mt-1 px-4"
            style={{ color: COLORS.text.secondary }}
          >
            {activeTab === 'cleaning'
              ? 'No beds need cleaning at the moment'
              : 'No beds under maintenance'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {currentBeds.map(bed => {
            const urgencyColor = getUrgencyColor(
              activeTab === 'cleaning'
                ? bed.last_cleaned_at || bed.updated_at
                : bed.maintenance_reported_at || bed.updated_at,
            );

            return (
              <div
                key={bed.bed_id}
                className="p-3 sm:p-4 rounded-lg border-2 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                  borderColor: urgencyColor,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: urgencyColor + '20' }}
                    >
                      <BedDouble
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        style={{ color: urgencyColor }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-bold text-base sm:text-lg truncate"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        {bed.bed_number}
                      </h3>
                      <p
                        className="text-xs truncate"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {bed.room?.room_number &&
                          `Room ${bed.room.room_number}`}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className="px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 flex-shrink-0 ml-2"
                    style={{
                      backgroundColor: urgencyColor + '20',
                      color: urgencyColor,
                    }}
                  >
                    {activeTab === 'cleaning' ? (
                      <Sparkles className="w-3 h-3" />
                    ) : (
                      <Wrench className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">
                      {bed.bed_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div
                  className="p-2 rounded-lg mb-3"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.lightHover,
                  }}
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MapPin
                      className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                      style={{ color: COLORS.text.secondary }}
                    />
                    <span style={{ color: COLORS.text.secondary }}>
                      Location:
                    </span>
                    <span
                      className="font-medium truncate"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      Floor {bed.room?.floor_number} • Room{' '}
                      {bed.room?.room_number}
                    </span>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm">
                  <Clock
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: urgencyColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      style={{ color: COLORS.text.secondary }}
                      className="truncate"
                    >
                      {activeTab === 'cleaning'
                        ? 'Waiting for'
                        : 'In maintenance for'}
                      :
                    </p>
                    <p className="font-medium" style={{ color: urgencyColor }}>
                      {getTimeSince(
                        activeTab === 'cleaning'
                          ? bed.last_cleaned_at || bed.updated_at
                          : bed.maintenance_reported_at || bed.updated_at,
                      )}
                    </p>
                  </div>
                </div>

                {/* Reason/Issue Display */}
                {activeTab === 'maintenance' && bed.maintenance_reason && (
                  <div
                    className="p-2.5 sm:p-3 rounded-lg mb-3 border-l-4"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.darkHover
                        : COLORS.badge.warning.bg,
                      borderColor: COLORS.warning,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5"
                        style={{ color: COLORS.warning }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          Issue Reported:
                        </p>
                        <p
                          className="text-xs sm:text-sm line-clamp-3"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {bed.maintenance_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cleaning Notes */}
                {activeTab === 'cleaning' && bed.cleaning_notes && (
                  <div
                    className="p-2.5 sm:p-3 rounded-lg mb-3 border-l-4"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.darkHover
                        : COLORS.badge.info.bg,
                      borderColor: COLORS.info,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5"
                        style={{ color: COLORS.info }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          Notes:
                        </p>
                        <p
                          className="text-xs sm:text-sm line-clamp-2"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {bed.cleaning_notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bed Type */}
                <div className="mb-3">
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Bed Type
                  </p>
                  <p
                    className="text-xs sm:text-sm font-medium capitalize"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {bed.bed_type.replace('_', ' ')}
                  </p>
                </div>

                {/* Last Cleaned Info */}
                {bed.last_cleaned_at && (
                  <div
                    className="mb-3 text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Last cleaned:{' '}
                    {new Date(bed.last_cleaned_at).toLocaleDateString()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {activeTab === 'cleaning' &&
                    ['nurse', 'housekeeping', 'admin'].includes(userRole) && (
                      <button
                        onClick={() => handleMarkCleaned(bed.bed_id)}
                        className="flex-1 px-2 sm:px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 sm:gap-2"
                        style={{
                          backgroundColor: COLORS.success,
                          color: COLORS.text.white,
                        }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Mark Cleaned</span>
                      </button>
                    )}

                  {activeTab === 'maintenance' && (
                    <button
                      onClick={() => handleViewMaintenance(bed)}
                      className="flex-1 px-2 sm:px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.surface.darkHover
                          : COLORS.button.outline.bgHover,
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                        border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
                      }}
                    >
                      View Details
                    </button>
                  )}
                </div>

                {/* Urgency Indicator */}
                {urgencyColor === COLORS.danger && (
                  <div
                    className="mt-3 p-2 rounded flex items-center gap-2 text-xs"
                    style={{
                      backgroundColor: COLORS.badge.danger.bg,
                      color: COLORS.badge.danger.text,
                    }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Urgent attention needed!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenance Details Modal */}
      {showMaintenanceModal && selectedBed && (
        <BedMaintenanceModal
          isOpen={showMaintenanceModal}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedBed(null);
          }}
          bed={selectedBed}
          isDarkMode={isDarkMode}
          userRole={userRole}
          onUpdate={fetchBedsRequiringAttention}
        />
      )}

      {/* Hide scrollbar CSS */}
      <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
      `}</style>
    </div>
  );
};

export default MaintenancePanel;
