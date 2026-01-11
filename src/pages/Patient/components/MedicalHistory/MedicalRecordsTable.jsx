import { Eye } from 'lucide-react';
import Table from '../../../../components/ui/Table';
import { Button } from '../../../../components/ui/button';
import { formatDate, truncateText } from '../../../../utils/dateFormatter';
import MedicalRecordCard from './MedicalRecordCard';

const MedicalRecordsTable = ({ records, onViewDetails, isMobile }) => {
  // Mobile view - Card layout
  if (isMobile) {
    return (
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No medical records found
          </div>
        ) : (
          records.map(record => (
            <MedicalRecordCard
              key={record.record_id}
              record={record}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    );
  }

  // Desktop view - Table layout
  const columns = [
    {
      header: 'Date',
      accessor: 'record_date',
      render: row => formatDate(row.record_date),
      width: '120px',
    },
    {
      header: 'Type',
      accessor: 'record_type',
      width: '120px',
      render: row => <span className="capitalize">{row.record_type}</span>,
    },
    {
      header: 'Chief Complaint',
      accessor: 'chief_complaint',
      render: row => truncateText(row.chief_complaint, 50),
    },
    {
      header: 'Diagnosis',
      accessor: 'diagnosis',
      render: row => truncateText(row.diagnosis, 40),
    },
    {
      header: 'Actions',
      render: row => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={e => {
            e.stopPropagation();
            onViewDetails(row);
          }}
        >
          View
        </Button>
      ),
      align: 'center',
      width: '100px',
    },
  ];

  return (
    <Table
      columns={columns}
      data={records}
      onRowClick={onViewDetails}
      hoverable
    />
  );
};

export default MedicalRecordsTable;
