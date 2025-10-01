// pages/receptionist/ReceptionistBilling.jsx
import { useState } from 'react';
import { Eye, Download, CheckCircle } from 'lucide-react';

const mockBills = [
  {
    id: 1001,
    patient: 'Juan Dela Cruz',
    service: 'General Consultation',
    amount: 500,
    status: 'Pending',
    date: '2025-09-30',
  },
  {
    id: 1002,
    patient: 'Maria Santos',
    service: 'X-Ray',
    amount: 1500,
    status: 'Paid',
    date: '2025-09-29',
  },
];

const ReceptionistBilling = () => {
  const [bills, setBills] = useState(mockBills);
  const [selected, setSelected] = useState(null);

  const markAsPaid = id => {
    setBills(prev =>
      prev.map(bill => (bill.id === id ? { ...bill, status: 'Paid' } : bill))
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Billing</h1>

      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-100 rounded">
          <p className="text-sm text-gray-600">Total Revenue Today</p>
          <p className="text-xl font-bold">₱2,000</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded">
          <p className="text-sm text-gray-600">Pending Bills</p>
          <p className="text-xl font-bold">3</p>
        </div>
        <div className="p-4 bg-blue-100 rounded">
          <p className="text-sm text-gray-600">Paid Bills</p>
          <p className="text-xl font-bold">5</p>
        </div>
      </div>

      {/* Billing Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Invoice #</th>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{bill.id}</td>
                <td className="px-4 py-2">{bill.patient}</td>
                <td className="px-4 py-2">{bill.service}</td>
                <td className="px-4 py-2">₱{bill.amount}</td>
                <td
                  className={`px-4 py-2 font-medium ${
                    bill.status === 'Paid' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {bill.status}
                </td>
                <td className="px-4 py-2">{bill.date}</td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                  <button
                    className="p-2 rounded hover:bg-gray-200"
                    onClick={() => setSelected(bill)}
                  >
                    <Eye size={18} />
                  </button>
                  <button className="p-2 rounded hover:bg-blue-100 text-blue-600">
                    <Download size={18} />
                  </button>
                  {bill.status === 'Pending' && (
                    <button
                      className="p-2 rounded hover:bg-green-100 text-green-600"
                      onClick={() => markAsPaid(bill.id)}
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-2">Invoice #{selected.id}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Patient: {selected.patient} <br />
              Service: {selected.service} <br />
              Amount: ₱{selected.amount} <br />
              Status: {selected.status} <br />
              Date: {selected.date}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistBilling;
