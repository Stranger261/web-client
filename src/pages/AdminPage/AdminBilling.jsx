import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  PieChart,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const AdminBilling = () => {
  const [dateRange, setDateRange] = useState('month');
  const [viewType, setViewType] = useState('overview');

  // Revenue statistics
  const stats = [
    {
      label: 'Total Revenue',
      value: '₱2,847,500',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Outstanding Balance',
      value: '₱184,320',
      change: '-8.2%',
      trend: 'up',
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      label: 'Collection Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      label: 'Avg Transaction',
      value: '₱3,450',
      change: '+5.8%',
      trend: 'up',
      icon: CreditCard,
      color: 'bg-purple-500',
    },
  ];

  // Revenue by department
  const departmentRevenue = [
    {
      dept: 'Cardiology',
      revenue: 685000,
      transactions: 234,
      avgTransaction: 2927,
      growth: 15.2,
      outstanding: 28500,
    },
    {
      dept: 'Orthopedics',
      revenue: 542000,
      transactions: 189,
      avgTransaction: 2867,
      growth: 8.7,
      outstanding: 45200,
    },
    {
      dept: 'Pediatrics',
      revenue: 458000,
      transactions: 312,
      avgTransaction: 1468,
      growth: 12.3,
      outstanding: 18900,
    },
    {
      dept: 'Emergency',
      revenue: 623000,
      transactions: 445,
      avgTransaction: 1400,
      growth: 18.5,
      outstanding: 52100,
    },
    {
      dept: 'General Medicine',
      revenue: 539500,
      transactions: 398,
      avgTransaction: 1355,
      growth: 6.4,
      outstanding: 39620,
    },
  ];

  // Payment method breakdown
  const paymentMethods = [
    { method: 'Cash', amount: 1245000, percentage: 43.7, transactions: 456 },
    {
      method: 'Credit Card',
      amount: 892000,
      percentage: 31.3,
      transactions: 278,
    },
    {
      method: 'Debit Card',
      amount: 385500,
      percentage: 13.5,
      transactions: 189,
    },
    { method: 'Insurance', amount: 245000, percentage: 8.6, transactions: 67 },
    {
      method: 'Online Payment',
      amount: 80000,
      percentage: 2.9,
      transactions: 45,
    },
  ];

  // Daily revenue trend (last 7 days)
  const dailyRevenue = [
    { date: 'Sep 24', revenue: 395000, target: 380000 },
    { date: 'Sep 25', revenue: 412000, target: 380000 },
    { date: 'Sep 26', revenue: 388000, target: 380000 },
    { date: 'Sep 27', revenue: 425000, target: 380000 },
    { date: 'Sep 28', revenue: 200000, target: 380000 },
    { date: 'Sep 29', revenue: 418000, target: 380000 },
    { date: 'Sep 30', revenue: 408500, target: 380000 },
  ];

  // Outstanding payments by age
  const outstandingByAge = [
    { ageRange: '0-30 days', amount: 92500, count: 34, percentage: 50.2 },
    { ageRange: '31-60 days', amount: 48200, count: 18, percentage: 26.2 },
    { ageRange: '61-90 days', amount: 28100, count: 12, percentage: 15.2 },
    { ageRange: '90+ days', amount: 15520, count: 8, percentage: 8.4 },
  ];

  const formatCurrency = amount => {
    return `₱${amount.toLocaleString()}`;
  };

  const getTrendIcon = trend => {
    return trend === 'up' ? (
      <ArrowUpRight size={16} />
    ) : (
      <ArrowDownRight size={16} />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Billing & Revenue Analytics
        </h1>
        <p className="text-gray-600">Financial overview and revenue tracking</p>
      </div>

      {/* Admin Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
        <div className="flex items-start gap-3">
          <DollarSign className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Revenue Overview Access
            </h3>
            <p className="text-sm text-blue-800">
              This dashboard shows clinic-wide revenue analytics. Individual
              cashier transactions and patient billing details are managed by
              billing staff.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View Type
            </label>
            <select
              value={viewType}
              onChange={e => setViewType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Overview</option>
              <option value="departments">By Department</option>
              <option value="payment_methods">By Payment Method</option>
              <option value="trends">Revenue Trends</option>
            </select>
          </div>
          <div className="ml-auto flex items-end gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download size={18} />
              Export Financial Report
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span
                className={`text-sm font-medium flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {getTrendIcon(stat.trend)}
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Revenue Trend */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Daily Revenue Trend
          </h2>
          <Calendar className="text-gray-400" size={20} />
        </div>
        <div className="space-y-3">
          {dailyRevenue.map((day, index) => {
            const percentage = (day.revenue / day.target) * 100;
            const isAboveTarget = day.revenue >= day.target;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {day.date}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Target: {formatCurrency(day.target)}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isAboveTarget ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(day.revenue)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      isAboveTarget ? 'bg-green-600' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Revenue */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Revenue by Department
          </h2>
          <PieChart className="text-gray-400" size={20} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Department
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Revenue
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Transactions
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Avg/Transaction
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Growth
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Outstanding
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentRevenue.map((dept, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {dept.dept}
                  </td>
                  <td className="text-right py-3 px-4 font-bold text-gray-900">
                    {formatCurrency(dept.revenue)}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700">
                    {dept.transactions}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {formatCurrency(dept.avgTransaction)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`font-medium ${
                        dept.growth >= 10 ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      +{dept.growth}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 text-red-600 font-medium">
                    {formatCurrency(dept.outstanding)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 font-bold">
                <td className="py-3 px-4 text-gray-900">TOTAL</td>
                <td className="text-right py-3 px-4 text-gray-900">
                  {formatCurrency(
                    departmentRevenue.reduce((sum, d) => sum + d.revenue, 0)
                  )}
                </td>
                <td className="text-center py-3 px-4 text-gray-900">
                  {departmentRevenue.reduce(
                    (sum, d) => sum + d.transactions,
                    0
                  )}
                </td>
                <td className="text-right py-3 px-4 text-gray-900">-</td>
                <td className="text-center py-3 px-4 text-gray-900">-</td>
                <td className="text-right py-3 px-4 text-red-600">
                  {formatCurrency(
                    departmentRevenue.reduce((sum, d) => sum + d.outstanding, 0)
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
            <CreditCard className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {method.method}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(method.amount)}
                    </span>
                    <span className="text-xs text-gray-600 ml-2">
                      ({method.transactions} txns)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {method.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding by Age */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Outstanding Payments by Age
            </h2>
            <AlertCircle className="text-yellow-600" size={20} />
          </div>
          <div className="space-y-4">
            {outstandingByAge.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {item.ageRange}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-xs text-gray-600 ml-2">
                      ({item.count} cases)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-orange-500'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-green-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                Positive Trends
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Emergency dept revenue up 18.5% - highest growth</li>
                <li>• Collection rate improved to 94.2% (+2.1%)</li>
                <li>• Cash payments remain dominant at 43.7%</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">
                Action Items
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• ₱52,100 outstanding in Emergency - follow up needed</li>
                <li>• 8 cases over 90 days - escalate to collections</li>
                <li>• Orthopedics growth at 8.7% - below target</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;
