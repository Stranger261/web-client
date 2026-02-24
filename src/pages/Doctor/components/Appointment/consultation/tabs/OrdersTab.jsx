import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Loader2,
  Stethoscope,
  Microscope,
} from 'lucide-react';
import laboratoryService from '../../../../../../services/laboratoryApi';

const formatPrice = price =>
  Number(price).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const OrdersTab = ({ data, onChange, isSavingOrder }) => {
  const [allServices, setAllServices] = useState({
    risServices: [],
    lisServices: [],
  });
  const [selectedImagingServices, setSelectedImagingServices] = useState([]);
  const [selectedLabServices, setSelectedLabServices] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [priority, setPriority] = useState('routine');
  const [loading, setLoading] = useState(true);

  // Initialize from existing diagnosis data
  useEffect(() => {
    if (data?.lab_tests_ordered) {
      const labIds = data.lab_tests_ordered
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      setSelectedLabServices(labIds);
    }

    if (data?.imaging_ordered) {
      const imagingIds = data.imaging_ordered
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      setSelectedImagingServices(imagingIds);
    }

    if (data?.clinical_notes) {
      setClinicalNotes(data.clinical_notes);
    }

    if (data?.order_priority) {
      setPriority(data.order_priority);
    }
  }, [data]);

  // Fetch all services on mount
  useEffect(() => {
    fetchAllServices();
  }, []);

  // BACKEND CALL: Fetch all services (RIS + LIS)
  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const response = await laboratoryService.getAllService();

      if (response.success && response.data) {
        setAllServices({
          risServices: response.data.risServices || [],
          lisServices: response.data.lisServices || [],
        });
      }

      console.log('All services:', response);
    } catch (error) {
      console.error('Error fetching all services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagingServiceToggle = serviceId => {
    const newSelection = selectedImagingServices.includes(serviceId)
      ? selectedImagingServices.filter(id => id !== serviceId)
      : [...selectedImagingServices, serviceId];
    setSelectedImagingServices(newSelection);
    onChange('imaging_ordered', newSelection.join(','));
  };

  const handleLabServiceToggle = serviceId => {
    const newSelection = selectedLabServices.includes(serviceId)
      ? selectedLabServices.filter(id => id !== serviceId)
      : [...selectedLabServices, serviceId];
    setSelectedLabServices(newSelection);
    onChange('lab_tests_ordered', newSelection.join(','));
  };

  const handleClinicalNotesChange = e => {
    const value = e.target.value;
    setClinicalNotes(value);
    onChange('clinical_notes', value);
  };

  const handlePriorityChange = e => {
    const value = e.target.value;
    setPriority(value);
    onChange('order_priority', value);
  };

  const getPriorityBadgeStyle = priority => {
    const styles = {
      stat: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
      },
      urgent: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-300',
      },
      routine: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
      },
      default: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-800 dark:text-gray-300',
      },
    };
    return styles[priority?.toLowerCase()] || styles.default;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Loading services...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Saving Indicator */}

      {/* Laboratory Services (LIS) Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Microscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Laboratory Tests (LIS)
          </h3>
          <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
            {allServices.lisServices.length} available
            {selectedLabServices.length > 0 &&
              ` • ${selectedLabServices.length} selected`}
          </span>
        </div>

        {allServices.lisServices.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p>No laboratory tests available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {allServices.lisServices.map(service => (
              <div
                key={service.service_id}
                className={`p-2 rounded border transition-all cursor-pointer hover:shadow-sm relative  ${
                  selectedLabServices.includes(service.service_id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => handleLabServiceToggle(service.service_id)}
              >
                {/* Small Checkbox */}
                <div className="absolute top-2 right-2">
                  {selectedLabServices.includes(service.service_id) ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                </div>

                <div className="pr-6">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {service.test_name}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {service.test_code}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                      {service.department}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {service.turnaround_time_hours}h
                      </div>
                      {service.requires_fasting && (
                        <div className="text-amber-600 dark:text-amber-400 font-medium">
                          • Fasting
                        </div>
                      )}
                      {service.is_stat_available && (
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          • STAT
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      ₱{formatPrice(service.base_price)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {service.specimen_type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Imaging Services (RIS) Section */}
      <div className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Imaging Studies (RIS)
          </h3>
          <span className="ml-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
            {allServices.risServices.length} available
            {selectedImagingServices.length > 0 &&
              ` • ${selectedImagingServices.length} selected`}
          </span>
        </div>

        {allServices.risServices.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p>No imaging studies available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {allServices.risServices.map(service => (
              <div
                key={service.service_id}
                className={`p-2 rounded border transition-all cursor-pointer hover:shadow-sm relative ${
                  selectedImagingServices.includes(service.service_id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner'
                    : 'border-gray-200 dark:border-gray-700'
                } ${isSavingOrder ? 'opacity-75' : ''}`}
                onClick={() => handleImagingServiceToggle(service.service_id)}
              >
                {/* Small Checkbox */}
                <div className="absolute top-2 right-2">
                  {selectedImagingServices.includes(service.service_id) ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                </div>

                <div className="pr-6">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {service.service_name}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {service.service_code}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                      {service.service_category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {service.duration_minutes}m
                      </div>
                      {service.requires_contrast && (
                        <div className="text-amber-600 dark:text-amber-400 font-medium">
                          • Contrast
                        </div>
                      )}
                      {service.requires_sedation && (
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          • Sedation
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      ₱{formatPrice(service.base_price)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {service.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Section */}
      <div className="pt-6 border-t dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Order Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Clinical Notes
            </label>
            <textarea
              value={clinicalNotes}
              onChange={handleClinicalNotesChange}
              placeholder="Clinical indication for the tests..."
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              rows="2"
              disabled={isSavingOrder}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              These notes will be attached to all orders
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
              Priority
            </label>
            <div className="flex gap-3">
              {['routine', 'urgent', 'stat'].map(p => (
                <label
                  key={p}
                  className={`flex items-center gap-1.5 cursor-pointer ${isSavingOrder ? 'opacity-50' : ''}`}
                >
                  <input
                    type="radio"
                    value={p}
                    checked={priority === p}
                    onChange={handlePriorityChange}
                    className="w-3.5 h-3.5"
                    disabled={isSavingOrder}
                  />
                  <span className="text-sm capitalize text-gray-900 dark:text-gray-100">
                    {p}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadgeStyle(p).bg} ${getPriorityBadgeStyle(p).text}`}
                  >
                    {p.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Priority applies to all selected orders
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      {(selectedImagingServices.length > 0 ||
        selectedLabServices.length > 0) && (
        <div className="pt-6 border-t dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Order Summary
          </h3>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="font-medium mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Microscope className="w-4 h-4" />
                  Lab Tests ({selectedLabServices.length})
                </div>
                {selectedLabServices.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400">
                    None selected
                  </div>
                ) : (
                  <div className="space-y-1">
                    {allServices.lisServices
                      .filter(s => selectedLabServices.includes(s.service_id))
                      .map(service => (
                        <div
                          key={service.service_id}
                          className="flex justify-between"
                        >
                          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                            • {service.test_name}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            ₱{formatPrice(service.base_price)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <div className="font-medium mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Imaging ({selectedImagingServices.length})
                </div>
                {selectedImagingServices.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400">
                    None selected
                  </div>
                ) : (
                  <div className="space-y-1">
                    {allServices.risServices
                      .filter(s =>
                        selectedImagingServices.includes(s.service_id),
                      )
                      .map(service => (
                        <div
                          key={service.service_id}
                          className="flex justify-between"
                        >
                          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                            • {service.service_name}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            ₱{formatPrice(service.base_price)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Total Services:{' '}
                    {selectedImagingServices.length +
                      selectedLabServices.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Priority: <span className="capitalize">{priority}</span>
                    {isSavingOrder && ' • Saving...'}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded font-medium ${getPriorityBadgeStyle(priority).bg} ${getPriorityBadgeStyle(priority).text}`}
                >
                  {priority.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
