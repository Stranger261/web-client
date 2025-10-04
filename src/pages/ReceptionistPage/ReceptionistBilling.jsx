import { useState } from 'react';
import {
  Eye,
  Download,
  CheckCircle,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Search,
  Filter,
  Calendar,
  Printer,
} from 'lucide-react';

// Import API service (you'll use the real one)
// import { billingService } from '../services/api';

// Mock data for demo
const mockBills = [
  {
    id: 1001,
    billNumber: 'BILL-2025-0001',
    patient: 'Juan Dela Cruz',
    patientType: 'OPD',
    service: 'General Consultation',
    totalAmount: 3050,
    amountPaid: 3050,
    balance: 0,
    status: 'paid',
    date: '2025-10-01',
    time: '10:30 AM',
    paymentMethod: 'Card',
  },
  {
    id: 1002,
    billNumber: 'BILL-2025-0002',
    patient: 'Maria Santos',
    patientType: 'OPD',
    service: 'Pediatric Consultation',
    totalAmount: 1080,
    amountPaid: 0,
    balance: 1080,
    status: 'pending',
    date: '2025-10-02',
    time: '02:15 PM',
    paymentMethod: null,
  },
  {
    id: 1003,
    billNumber: 'BILL-2025-0003',
    patient: 'Pedro Reyes',
    patientType: 'OPD',
    service: 'Laboratory Tests',
    totalAmount: 1400,
    amountPaid: 500,
    balance: 900,
    status: 'partially-paid',
    date: '2025-10-02',
    time: '09:00 AM',
    paymentMethod: 'Cash',
  },
  {
    id: 1004,
    billNumber: 'BILL-2025-0004',
    patient: 'Ana Garcia',
    patientType: 'IPD',
    service: 'Post-Surgery Care',
    totalAmount: 48300,
    amountPaid: 0,
    balance: 48300,
    status: 'pending',
    date: '2025-09-28',
    time: '03:00 PM',
    paymentMethod: null,
  },
];

export default function ReceptionistBilling() {
  const [bills, setBills] = useState(mockBills);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cashAmount, setCashAmount] = useState('');

  // Calculate stats
  const stats = {
    totalRevenue: bills
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0),
    pendingCount: bills.filter(b => b.status === 'pending').length,
    paidCount: bills.filter(b => b.status === 'paid').length,
    todayRevenue: bills
      .filter(b => b.status === 'paid' && b.date === '2025-10-02')
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch =
      bill.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'All' || bill.status === filterStatus;
    const matchesType = filterType === 'All' || bill.patientType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const paymentMethods = [
    { id: 'card', name: 'Card', icon: CreditCard },
    { id: 'cash', name: 'Cash', icon: Banknote },
    { id: 'digital', name: 'E-Wallet', icon: Smartphone },
  ];

  const processPayment = () => {
    if (!selectedPaymentMethod || !showPaymentModal) return;

    if (selectedPaymentMethod === 'cash') {
      const change = parseFloat(cashAmount) - showPaymentModal.balance;
      if (change < 0) return;
    }

    const paymentAmount =
      selectedPaymentMethod === 'cash'
        ? parseFloat(cashAmount)
        : showPaymentModal.balance;

    setBills(prev =>
      prev.map(bill => {
        if (bill.id === showPaymentModal.id) {
          const newAmountPaid = bill.amountPaid + paymentAmount;
          const newBalance = bill.totalAmount - newAmountPaid;
          return {
            ...bill,
            amountPaid: newAmountPaid,
            balance: newBalance,
            status: newBalance <= 0 ? 'paid' : 'partially-paid',
            paymentMethod: selectedPaymentMethod,
          };
        }
        return bill;
      })
    );

    setShowPaymentModal(null);
    setSelectedPaymentMethod(null);
    setCashAmount('');
  };

  const calculateChange = () => {
    if (!showPaymentModal || !cashAmount) return 0;
    return parseFloat(cashAmount) - showPaymentModal.balance;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Billing & Payments
          </h1>
          <p className="text-gray-600 mt-1">
            Manage patient bills and process payments
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Calendar size={18} />
            <span className="text-sm">Today</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">
            ₱{stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs opacity-75 mt-2">
            {stats.paidCount} transactions
          </p>
        </div>
        <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-1">Pending Bills</p>
          <p className="text-3xl font-bold">{stats.pendingCount}</p>
          <p className="text-xs opacity-75 mt-2">Awaiting payment</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-1">Paid Today</p>
          <p className="text-3xl font-bold">{stats.paidCount}</p>
          <p className="text-xs opacity-75 mt-2">Completed</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-1">Today's Revenue</p>
          <p className="text-3xl font-bold">
            ₱{stats.todayRevenue.toLocaleString()}
          </p>
          <p className="text-xs opacity-75 mt-2">
            From {stats.paidCount} bills
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by patient name or bill number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>All</option>
          <option>pending</option>
          <option>partially-paid</option>
          <option>paid</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>All</option>
          <option>OPD</option>
          <option>IPD</option>
        </select>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Bill #
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.map(bill => (
                <tr
                  key={bill.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {bill.billNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {bill.patient}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        bill.patientType === 'OPD'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {bill.patientType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₱{bill.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">
                    ₱{bill.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : bill.status === 'partially-paid'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {bill.status === 'paid'
                        ? 'Paid'
                        : bill.status === 'partially-paid'
                        ? 'Partial'
                        : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{bill.date}</div>
                    <div className="text-xs text-gray-500">{bill.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        onClick={() => setSelectedBill(bill)}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Download Receipt"
                      >
                        <Download size={18} />
                      </button>
                      {bill.status !== 'paid' && (
                        <button
                          className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                          onClick={() => setShowPaymentModal(bill)}
                          title="Process Payment"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No bills found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedBill.billNumber}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedBill.date} at {selectedBill.time}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Patient Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedBill.patient}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedBill.patientType === 'OPD'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {selectedBill.patientType}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Service Provided</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedBill.service}
                </p>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-b">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{selectedBill.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₱{selectedBill.balance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Payment Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBill.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : selectedBill.status === 'partially-paid'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {selectedBill.status === 'paid'
                    ? 'Paid'
                    : selectedBill.status === 'partially-paid'
                    ? 'Partial'
                    : 'Pending'}
                </span>
              </div>

              {selectedBill.paymentMethod && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedBill.paymentMethod}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 rounded-b-xl flex gap-3">
              <button
                onClick={() => setSelectedBill(null)}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-white border hover:bg-gray-100"
              >
                Close
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                <Printer size={16} />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Process Payment
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {showPaymentModal.billNumber}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(null);
                    setSelectedPaymentMethod(null);
                    setCashAmount('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Patient</p>
                <p className="text-lg font-semibold text-gray-900">
                  {showPaymentModal.patient}
                </p>
                <p className="text-sm text-gray-600 mt-2">Service</p>
                <p className="font-medium text-gray-900">
                  {showPaymentModal.service}
                </p>
                <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between items-center">
                  <span className="text-gray-600">Amount to Pay</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ₱{showPaymentModal.balance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Select Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <method.icon
                        className={`w-6 h-6 ${
                          selectedPaymentMethod === method.id
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          selectedPaymentMethod === method.id
                            ? 'text-blue-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPaymentMethod === 'cash' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash Received (₱)
                  </label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {cashAmount && calculateChange() >= 0 && (
                    <div className="mt-3 p-3 bg-white rounded border border-green-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Change Due
                        </span>
                        <span className="text-xl font-bold text-green-700">
                          ₱{calculateChange().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  {cashAmount && calculateChange() < 0 && (
                    <div className="mt-3 text-sm font-semibold text-red-600">
                      ⚠️ Insufficient amount
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 rounded-b-xl flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(null);
                  setSelectedPaymentMethod(null);
                  setCashAmount('');
                }}
                className="flex-1 px-4 py-3 text-sm rounded-lg bg-white border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                disabled={
                  !selectedPaymentMethod ||
                  (selectedPaymentMethod === 'cash' && calculateChange() < 0)
                }
                className={`flex-1 px-4 py-3 rounded-lg text-white font-semibold transition-colors ${
                  selectedPaymentMethod &&
                  (selectedPaymentMethod !== 'cash' || calculateChange() >= 0)
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
