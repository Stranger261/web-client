import { Pill } from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import { formatDate } from '../../../utils/dateFormatter';

export const PrescriptionsList = ({
  prescriptions,
  source,
  sourceNumber,
  sourceDate,
  isDarkMode,
}) => (
  <div className="space-y-3">
    <div className="mb-2">
      <div
        className="flex items-center gap-2 text-sm"
        style={{
          color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
        }}
      >
        <Pill size={14} />
        <span>Prescribed from {source}</span>
      </div>
      {sourceNumber && (
        <div
          className="text-xs ml-6 mt-1"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          {sourceNumber} • {sourceDate && formatDate(sourceDate)}
        </div>
      )}
    </div>

    {prescriptions?.map(rx => (
      <div
        key={rx.prescription_id}
        className="border rounded-lg p-3"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          backgroundColor: isDarkMode ? COLORS.surface.dark : '#f9fafb',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <div className="flex-1">
            <div
              className="font-medium text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Prescription #{rx.prescription_number}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              {formatDate(rx.prescription_date)}
            </div>
          </div>
          <span
            className="px-2 py-1 rounded text-xs self-start"
            style={{
              backgroundColor:
                rx.prescription_status === 'active'
                  ? COLORS.success
                  : COLORS.text.secondary,
              color: 'white',
            }}
          >
            {rx.prescription_status}
          </span>
        </div>
        <div className="space-y-2">
          {rx.items?.map(item => (
            <div
              key={item.item_id}
              className="flex items-start gap-2 text-sm p-2 rounded"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.darkHover
                  : '#f3f4f6',
              }}
            >
              <Pill
                size={16}
                className="mt-0.5 flex-shrink-0"
                style={{ color: COLORS.primary }}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium break-words"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {item.medication_name} - {item.dosage}
                </div>
                <div
                  className="text-xs mt-1 break-words"
                  style={{ color: COLORS.text.secondary }}
                >
                  {item.frequency} {item.route && `• ${item.route}`}{' '}
                  {item.duration && `• ${item.duration}`}
                  {item.instructions && ` • ${item.instructions}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
