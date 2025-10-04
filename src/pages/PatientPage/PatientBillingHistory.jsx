import { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Settings,
  Download,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Bell,
  DollarSign,
  CreditCard,
  Receipt,
  Printer,
  Package,
  Pill,
  Activity,
  Stethoscope,
  XCircle,
  Filter,
} from 'lucide-react';

const PatientBillingHistory = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const patientInfo = {
    name: 'John Smith',
    patientId: 'P-2025-001',
    email: 'john.smith@email.com',
    phone: '+63 917 123 4567',
    insuranceProvider: 'PhilHealth',
    insuranceNumber: 'PH-123456789',
  };

  const billingData = [
    {
      id: 1,
      invoiceNo: 'INV-2025-1234',
      date: '2025-10-04',
      dueDate: '2025-10-14',
      description: 'Consultation - Dr. Sarah Anderson',
      category: 'Professional Fee',
      items: [
        {
          service: 'Doctor Consultation',
          quantity: 1,
          unitPrice: 3000,
          amount: 3000,
        },
        {
          service: 'Medical Certificate',
          quantity: 1,
          unitPrice: 200,
          amount: 200,
        },
      ],
      subtotal: 3200,
      discount: 0,
      tax: 0,
      total: 3200,
      paid: 0,
      balance: 3200,
      status: 'pending',
      paymentMethod: null,
      notes: 'Regular follow-up consultation',
    },
    {
      id: 2,
      invoiceNo: 'INV-2025-1200',
      date: '2025-09-20',
      dueDate: '2025-09-30',
      description: 'Laboratory Tests',
      category: 'Laboratory',
      items: [
        {
          service: 'Complete Blood Count (CBC)',
          quantity: 1,
          unitPrice: 500,
          amount: 500,
        },
        { service: 'Lipid Panel', quantity: 1, unitPrice: 800, amount: 800 },
        {
          service: 'Blood Chemistry',
          quantity: 1,
          unitPrice: 600,
          amount: 600,
        },
      ],
      subtotal: 1900,
      discount: 100,
      tax: 0,
      total: 1800,
      paid: 1800,
      balance: 0,
      status: 'paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2025-09-22',
      notes: 'PhilHealth discount applied',
    },
    {
      id: 3,
      invoiceNo: 'INV-2025-1180',
      date: '2025-09-20',
      dueDate: '2025-09-30',
      description: 'Consultation & Prescription',
      category: 'Professional Fee',
      items: [
        {
          service: 'Doctor Consultation',
          quantity: 1,
          unitPrice: 3000,
          amount: 3000,
        },
        { service: 'Prescription', quantity: 1, unitPrice: 0, amount: 0 },
      ],
      subtotal: 3000,
      discount: 0,
      tax: 0,
      total: 3000,
      paid: 3000,
      balance: 0,
      status: 'paid',
      paymentMethod: 'Cash',
      paymentDate: '2025-09-20',
      notes: 'Payment received on same day',
    },
    {
      id: 4,
      invoiceNo: 'INV-2025-1150',
      date: '2025-08-15',
      dueDate: '2025-08-25',
      description: 'Initial Consultation & Tests',
      category: 'Multiple',
      items: [
        {
          service: 'Doctor Consultation',
          quantity: 1,
          unitPrice: 3000,
          amount: 3000,
        },
        { service: 'ECG Test', quantity: 1, unitPrice: 1200, amount: 1200 },
        {
          service: 'Complete Blood Count',
          quantity: 1,
          unitPrice: 500,
          amount: 500,
        },
        {
          service: 'Basic Metabolic Panel',
          quantity: 1,
          unitPrice: 800,
          amount: 800,
        },
      ],
      subtotal: 5500,
      discount: 500,
      tax: 0,
      total: 5000,
      paid: 5000,
      balance: 0,
      status: 'paid',
      paymentMethod: 'Debit Card',
      paymentDate: '2025-08-15',
      notes: 'New patient discount applied',
    },
    {
      id: 5,
      invoiceNo: 'INV-2025-1100',
      date: '2025-07-10',
      dueDate: '2025-07-20',
      description: 'Cardiac Screening Package',
      category: 'Diagnostic',
      items: [
        {
          service: 'Cardiology Consultation',
          quantity: 1,
          unitPrice: 4000,
          amount: 4000,
        },
        {
          service: 'Echocardiogram',
          quantity: 1,
          unitPrice: 3500,
          amount: 3500,
        },
        { service: 'Stress Test', quantity: 1, unitPrice: 2500, amount: 2500 },
      ],
      subtotal: 10000,
      discount: 1000,
      tax: 0,
      total: 9000,
      paid: 9000,
      balance: 0,
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      paymentDate: '2025-07-12',
      notes: 'Package discount applied',
    },
    {
      id: 6,
      invoiceNo: 'INV-2024-5500',
      date: '2024-10-05',
      dueDate: '2024-10-15',
      description: 'Annual Physical Examination',
      category: 'Check-up',
      items: [
        {
          service: 'Physical Examination',
          quantity: 1,
          unitPrice: 2500,
          amount: 2500,
        },
        {
          service: 'Complete Blood Count',
          quantity: 1,
          unitPrice: 500,
          amount: 500,
        },
        { service: 'Urinalysis', quantity: 1, unitPrice: 300, amount: 300 },
        { service: 'Chest X-ray', quantity: 1, unitPrice: 800, amount: 800 },
      ],
      subtotal: 4100,
      discount: 100,
      tax: 0,
      total: 4000,
      paid: 4000,
      balance: 0,
      status: 'paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2024-10-05',
      notes: 'Annual check-up package',
    },
  ];

  const summary = {
    totalBilled: billingData.reduce((sum, bill) => sum + bill.total, 0),
    totalPaid: billingData.reduce((sum, bill) => sum + bill.paid, 0),
    totalBalance: billingData.reduce((sum, bill) => sum + bill.balance, 0),
    pendingInvoices: billingData.filter(b => b.status === 'pending').length,
  };

  const filteredBilling = billingData.filter(
    bill => filterStatus === 'all' || bill.status === filterStatus
  );

  const getStatusColor = status => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = category => {
    switch (category) {
      case 'Professional Fee':
        return <Stethoscope className="text-blue-600" size={18} />;
      case 'Laboratory':
        return <Activity className="text-red-600" size={18} />;
      case 'Diagnostic':
        return <Activity className="text-purple-600" size={18} />;
      case 'Pharmacy':
        return <Pill className="text-green-600" size={18} />;
      case 'Check-up':
        return <CheckCircle className="text-teal-600" size={18} />;
      default:
        return <FileText className="text-gray-600" size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between px-16 py-4 border-b bg-base-100 border-base-300 shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-2 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {patientInfo.name}
              </h1>
              <p className="text-sm text-gray-600">
                Patient Portal • {patientInfo.patientId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              My Billing History
            </h2>
            <p className="text-gray-600">
              View your invoices, payments, and account balance
            </p>
          </div>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download size={18} />
            Download Statement
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Receipt className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">
              Total Billed
            </p>
            <p className="text-2xl font-bold text-gray-800">
              ₱{summary.totalBilled.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">
              ₱{summary.totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">
              Balance Due
            </p>
            <p className="text-2xl font-bold text-red-600">
              ₱{summary.totalBalance.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">
              Pending Invoices
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {summary.pendingInvoices}
            </p>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-green-600" size={20} />
            Insurance Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Provider</p>
              <p className="font-bold text-gray-800">
                {patientInfo.insuranceProvider}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Insurance Number</p>
              <p className="font-bold text-gray-800">
                {patientInfo.insuranceNumber}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Coverage Status</p>
              <p className="font-bold text-green-600">Active</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <Filter className="text-gray-600" size={18} />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Invoices</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Billing List */}
        <div className="space-y-4">
          {filteredBilling.map(bill => (
            <div
              key={bill.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg">
                    {getCategoryIcon(bill.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {bill.description}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          bill.status
                        )}`}
                      >
                        {bill.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {bill.invoiceNo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Issued: {bill.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Due: {bill.dueDate}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          ₱{bill.total.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Paid</p>
                        <p className="text-lg font-bold text-green-600">
                          ₱{bill.paid.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Balance</p>
                        <p className="text-lg font-bold text-red-600">
                          ₱{bill.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedInvoice(bill);
                      setShowInvoiceModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    View Details
                  </button>
                  {bill.status === 'pending' && (
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Invoice Details
                  </h3>
                  <p className="text-green-100">{selectedInvoice.invoiceNo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-green-500 text-white rounded-lg transition-colors">
                    <Download size={20} />
                  </button>
                  <button className="p-2 hover:bg-green-500 text-white rounded-lg transition-colors">
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="p-2 hover:bg-green-500 text-white rounded-lg transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bill To</p>
                  <p className="font-bold text-gray-800">{patientInfo.name}</p>
                  <p className="text-sm text-gray-600">
                    {patientInfo.patientId}
                  </p>
                  <p className="text-sm text-gray-600">{patientInfo.email}</p>
                  <p className="text-sm text-gray-600">{patientInfo.phone}</p>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-bold text-gray-800">
                      {selectedInvoice.date}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-bold text-gray-800">
                      {selectedInvoice.dueDate}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                      selectedInvoice.status
                    )}`}
                  >
                    {selectedInvoice.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Service
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {item.service}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 text-right">
                          ₱{item.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">
                          ₱{item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="space-y-2 max-w-md ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">
                      ₱{selectedInvoice.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -₱{selectedInvoice.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-800">
                        ₱{selectedInvoice.tax.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="font-bold text-gray-800">
                      Total Amount
                    </span>
                    <span className="font-bold text-xl text-gray-800">
                      ₱{selectedInvoice.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-bold text-green-600">
                      ₱{selectedInvoice.paid.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="font-bold text-gray-800">Balance Due</span>
                    <span className="font-bold text-xl text-red-600">
                      ₱{selectedInvoice.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {selectedInvoice.status === 'paid' && (
                <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={18} />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-800">
                        {selectedInvoice.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Date</p>
                      <p className="font-medium text-gray-800">
                        {selectedInvoice.paymentDate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
                {selectedInvoice.status === 'pending' && (
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2">
                    <CreditCard size={18} />
                    Pay Now
                  </button>
                )}
                <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2">
                  <Download size={18} />
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PatientBillingHistory;
