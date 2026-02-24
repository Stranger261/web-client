import React from 'react';
import {
  MessageCircle,
  File,
  Image as ImageIcon,
  Download,
  Clock,
  User,
} from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';
import { formatDateTime } from '../../../../utils/dateFormatter';

const ConsultationMessages = ({ consultation, messages, isDarkMode }) => {
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

  if (!consultation.hasMessages) {
    return (
      <div
        className="text-center py-8 rounded-lg"
        style={{
          backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f9fafb',
          color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
        }}
      >
        <MessageCircle className="mx-auto mb-2 opacity-50" size={32} />
        <p className="text-sm">No messages in this consultation</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border p-4 max-h-96 overflow-y-auto"
      style={{
        backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
        borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
      }}
    >
      <div className="space-y-3">
        {messages.map((message, index) => (
          <div
            key={message.messageId || index}
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.darkHover
                : '#f9fafb',
              borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
            }}
          >
            {/* Message Header */}
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

            {/* Message Content */}
            {message.isFile ? (
              <div
                className="flex items-center gap-3 p-3 rounded border"
                style={{
                  backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
                  borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
                }}
              >
                <div className="flex-shrink-0">
                  {message.isImage ? (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#dbeafe' }}
                    >
                      <ImageIcon size={20} style={{ color: '#0284c7' }} />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#f3f4f6' }}
                    >
                      <File size={20} style={{ color: '#6b7280' }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {message.messageContent}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {formatFileSize(message.fileSize)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    downloadFile(message.fileUrl, message.messageContent)
                  }
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
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
                  <Download size={14} />
                  Download
                </button>
              </div>
            ) : (
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {message.messageContent}
              </p>
            )}

            {/* Image Preview */}
            {message.isImage && message.fileUrl && (
              <div className="mt-3">
                <img
                  src={message.fileUrl}
                  alt={message.messageContent}
                  className="max-w-full h-auto rounded-lg border cursor-pointer"
                  style={{
                    maxHeight: '300px',
                    borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
                  }}
                  onClick={() => window.open(message.fileUrl, '_blank')}
                  onError={e => {
                    console.error('Image load error:', message.fileUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsultationMessages;
