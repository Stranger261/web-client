import React, { useState } from 'react';
import {
  MessageCircle,
  File,
  Image as ImageIcon,
  Download,
  Clock,
  User,
  Activity,
  FileText,
  Video,
  X,
} from 'lucide-react';
import { COLORS } from '../../configs/CONST';
import { formatDateTime } from '../../utils/dateFormatter';
import Modal from '../ui/Modal';

const ConsultationDetailsModal = ({
  isOpen,
  onClose,
  appointment,
  isDarkMode,
}) => {
  console.log(appointment);
  const [activeTab, setActiveTab] = useState('overview');

  if (!appointment?.isOnlineConsultation || !appointment?.consultation) {
    return null;
  }

  const { consultation, consultationMessages } = appointment;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      badge: null,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: consultation.messageCount || 0,
    },
    {
      id: 'files',
      label: 'Files',
      icon: FileText,
      badge: consultationMessages?.filter(m => m.isFile).length || 0,
    },
    {
      id: 'details',
      label: 'Clinical Details',
      icon: File,
      badge: null,
    },
  ];

  const formatDuration = seconds => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = bytes => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Consultation Summary Card */}
      <div
        className="rounded-lg p-4 border"
        style={{
          backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f0f9ff',
          borderColor: isDarkMode ? COLORS.border.dark : '#bfdbfe',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#dbeafe' }}
          >
            <Video size={24} style={{ color: '#0284c7' }} />
          </div>
          <div>
            <h3
              className="font-semibold text-lg"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Online Consultation
            </h3>
            <p
              className="text-sm flex items-center gap-2"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              <Clock size={14} />
              {formatDateTime(appointment.date)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatItem
            label="Status"
            value={consultation.status}
            isDarkMode={isDarkMode}
            badge
          />
          <StatItem
            label="Duration"
            value={formatDuration(consultation.durationSeconds)}
            isDarkMode={isDarkMode}
          />
          <StatItem
            label="Messages"
            value={consultation.messageCount}
            isDarkMode={isDarkMode}
          />
          <StatItem
            label="Files Shared"
            value={consultationMessages?.filter(m => m.isFile).length || 0}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Doctor Info */}
      <div
        className="rounded-lg p-4 border"
        style={{
          backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
          borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
        }}
      >
        <h4
          className="font-semibold mb-3 flex items-center gap-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <User size={16} />
          Healthcare Provider
        </h4>
        <p
          className="text-sm"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          {appointment.doctor}
        </p>
      </div>
    </div>
  );

  const renderMessages = () => {
    const textMessages = consultationMessages?.filter(m => !m.isFile) || [];

    if (textMessages.length === 0) {
      return (
        <div
          className="text-center py-12 rounded-lg"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f9fafb',
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          <MessageCircle className="mx-auto mb-3 opacity-50" size={48} />
          <p className="text-sm">No text messages in this consultation</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {textMessages.map((message, index) => (
          <div
            key={message.messageId || index}
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
              borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User
                  size={14}
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {message.senderName}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs capitalize"
                  style={{
                    backgroundColor:
                      message.senderType === 'patient' ? '#dbeafe' : '#fef3c7',
                    color:
                      message.senderType === 'patient' ? '#1e40af' : '#92400e',
                  }}
                >
                  {message.senderType}
                </span>
              </div>
              <span
                className="text-xs flex items-center gap-1"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                <Clock size={12} />
                {formatDateTime(message.sentAt)}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {message.messageContent}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderFiles = () => {
    const fileMessages = consultationMessages?.filter(m => m.isFile) || [];

    if (fileMessages.length === 0) {
      return (
        <div
          className="text-center py-12 rounded-lg"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f9fafb',
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          <FileText className="mx-auto mb-3 opacity-50" size={48} />
          <p className="text-sm">No files shared in this consultation</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {fileMessages.map((message, index) => (
          <div
            key={message.messageId || index}
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
              borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {message.isImage ? (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#dbeafe' }}
                  >
                    <ImageIcon size={24} style={{ color: '#0284c7' }} />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#f3f4f6' }}
                  >
                    <File size={24} style={{ color: '#6b7280' }} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p
                      className="font-medium text-sm truncate"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {message.messageContent}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      {formatFileSize(message.fileSize)} • Shared by{' '}
                      {message.senderName}
                    </p>
                  </div>
                </div>

                {message.isImage && message.fileUrl && (
                  <div className="mt-3">
                    <img
                      src={message.fileUrl}
                      alt={message.messageContent}
                      className="max-w-full h-auto rounded-lg border cursor-pointer"
                      style={{
                        maxHeight: '300px',
                        borderColor: isDarkMode
                          ? COLORS.border.dark
                          : '#e5e7eb',
                      }}
                      onClick={() => window.open(message.fileUrl, '_blank')}
                      onError={e => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={() =>
                    downloadFile(message.fileUrl, message.messageContent)
                  }
                  className="mt-3 flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors w-full justify-center"
                  style={{
                    backgroundColor: '#0284c7',
                    color: 'white',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#0369a1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#0284c7';
                  }}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>

            <div
              className="mt-3 pt-3 border-t text-xs flex items-center gap-2"
              style={{
                borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              <Clock size={12} />
              {formatDateTime(message.sentAt)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetails = () => (
    <div className="space-y-4">
      {/* Clinical Information */}
      {(appointment.chiefComplaint ||
        appointment.diagnosis ||
        appointment.treatmentPlan) && (
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
          }}
        >
          <h4
            className="font-semibold mb-3"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Clinical Information
          </h4>
          <div className="space-y-3">
            {appointment.chiefComplaint && (
              <DetailItem
                label="Chief Complaint"
                value={appointment.chiefComplaint}
                isDarkMode={isDarkMode}
              />
            )}
            {appointment.diagnosis && (
              <DetailItem
                label="Diagnosis"
                value={appointment.diagnosis}
                isDarkMode={isDarkMode}
              />
            )}
            {appointment.treatmentPlan && (
              <DetailItem
                label="Treatment Plan"
                value={appointment.treatmentPlan}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
      )}

      {/* Vitals */}
      {appointment.vitals && (
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
          }}
        >
          <h4
            className="font-semibold mb-3"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Vital Signs
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {appointment.vitals.bloodPressure && (
              <VitalItem
                label="Blood Pressure"
                value={`${appointment.vitals.bloodPressure} mmHg`}
                isDarkMode={isDarkMode}
              />
            )}
            {appointment.vitals.heartRate && (
              <VitalItem
                label="Heart Rate"
                value={`${appointment.vitals.heartRate} bpm`}
                isDarkMode={isDarkMode}
              />
            )}
            {appointment.vitals.temperature && (
              <VitalItem
                label="Temperature"
                value={`${appointment.vitals.temperature} °C`}
                isDarkMode={isDarkMode}
              />
            )}
            {appointment.vitals.oxygenSaturation && (
              <VitalItem
                label="O₂ Saturation"
                value={`${appointment.vitals.oxygenSaturation}%`}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
      )}

      {/* Room Details */}
      <div
        className="rounded-lg p-4 border"
        style={{
          backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f9fafb',
          borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
        }}
      >
        <h4
          className="font-semibold mb-3 text-sm"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Session Details
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span
              className="opacity-60"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Room ID:
            </span>
            <p
              className="font-mono mt-1"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {consultation.roomId}
            </p>
          </div>
          <div>
            <span
              className="opacity-60"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Consultation ID:
            </span>
            <p
              className="font-mono mt-1"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {consultation.consultationId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Consultation Details">
      {/* Tabs */}
      <div
        className="flex gap-2 mb-4 overflow-x-auto border-b"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
        }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
              style={{
                color:
                  activeTab === tab.id
                    ? '#0284c7'
                    : isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                borderColor: activeTab === tab.id ? '#0284c7' : 'transparent',
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.badge !== null && tab.badge > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor:
                      activeTab === tab.id ? '#dbeafe' : '#f3f4f6',
                    color: activeTab === tab.id ? '#1e40af' : '#6b7280',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'details' && renderDetails()}
      </div>
    </Modal>
  );
};

// Helper Components
const StatItem = ({ label, value, isDarkMode, badge = false }) => (
  <div>
    <p
      className="text-xs mb-1"
      style={{
        color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
      }}
    >
      {label}
    </p>
    {badge ? (
      <span
        className="px-3 py-1 rounded-full text-sm font-semibold capitalize inline-block"
        style={{
          backgroundColor: value === 'completed' ? '#dcfce7' : '#fef3c7',
          color: value === 'completed' ? '#166534' : '#92400e',
        }}
      >
        {value}
      </span>
    ) : (
      <p
        className="text-lg font-bold"
        style={{
          color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
        }}
      >
        {value}
      </p>
    )}
  </div>
);

const DetailItem = ({ label, value, isDarkMode }) => (
  <div>
    <p
      className="text-xs font-medium mb-1"
      style={{
        color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
      }}
    >
      {label}
    </p>
    <p
      className="text-sm"
      style={{
        color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
      }}
    >
      {value}
    </p>
  </div>
);

const VitalItem = ({ label, value, isDarkMode }) => (
  <div
    className="p-3 rounded-lg"
    style={{
      backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f9fafb',
    }}
  >
    <p
      className="text-xs mb-1"
      style={{
        color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
      }}
    >
      {label}
    </p>
    <p
      className="text-sm font-semibold"
      style={{
        color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
      }}
    >
      {value}
    </p>
  </div>
);

export default ConsultationDetailsModal;
