import { Calendar, FileText, Stethoscope, Eye } from 'lucide-react';
import Card, { CardBody } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { COLORS } from '../../../../configs/CONST';
import { formatDate, truncateText } from '../../../../utils/dateFormatter';

const MedicalRecordCard = ({ record, onViewDetails }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-2 mb-3">
      <Icon
        size={16}
        className="mt-1 flex-shrink-0"
        style={{
          color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
        }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          {label}
        </p>
        <p
          className="text-sm mt-0.5 break-words"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <Card hover className="mb-3">
      <CardBody>
        <div className="flex justify-between items-start mb-4">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.info + '20'
                : COLORS.info + '10',
              color: COLORS.info,
            }}
          >
            {record.record_type}
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => onViewDetails(record)}
          >
            View
          </Button>
        </div>

        <InfoItem
          icon={Calendar}
          label="Date"
          value={formatDate(record.record_date)}
        />

        <InfoItem
          icon={FileText}
          label="Chief Complaint"
          value={truncateText(record.chief_complaint, 80)}
        />

        <InfoItem
          icon={Stethoscope}
          label="Diagnosis"
          value={truncateText(record.diagnosis, 60)}
        />
      </CardBody>
    </Card>
  );
};

export default MedicalRecordCard;
