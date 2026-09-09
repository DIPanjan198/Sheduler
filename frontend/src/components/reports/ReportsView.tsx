import React, { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { BarChart3, Download, Clock, DollarSign, AlertTriangle, Users } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

export const ReportsView: React.FC = () => {
  const { showToast } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = useCallback(async () => {
    try {
      const data = await api.request<any>('/reports/hours');
      setReportData(data);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useDataSync(loadReport, 5000);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csvContent = await api.request<string>('/reports/export.csv');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `payroll-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Payroll CSV exported cleanly!');
    } catch (e: any) {
      showToast(e.message || 'Failed to export CSV', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = reportData?.summary || { totalEmployees: 0, totalHoursWorked: 0, totalPayroll: 0, totalFlaggedEntries: 0 };
  const userSummaries = reportData?.userSummaries || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 lg:pb-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-card border border-gray-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Hours & Payroll Reports</h2>
            <p className="text-xs text-gray-500">Aggregate hours worked and payroll calculations</p>
          </div>
        </div>

        <Button size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCsv} isLoading={isExporting}>
          Export CSV
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-lifted transition-all duration-300 space-y-2 hover:-translate-y-0.5">
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Hours</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{summary.totalHoursWorked.toFixed(1)} <span className="text-sm font-semibold text-gray-500">hrs</span></div>
          <div className="text-[11px] text-gray-500 font-medium">Completed clock sessions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-lifted transition-all duration-300 space-y-2 hover:-translate-y-0.5">
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Estimated Payroll</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">${summary.totalPayroll.toFixed(2)}</div>
          <div className="text-[11px] text-gray-500 font-medium">Based on hourly rates</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-lifted transition-all duration-300 space-y-2 hover:-translate-y-0.5">
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active Staff</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{summary.totalEmployees}</div>
          <div className="text-[11px] text-gray-500 font-medium">Employees with time entries</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-lifted transition-all duration-300 space-y-2 hover:-translate-y-0.5">
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Flagged Entries</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">{summary.totalFlaggedEntries}</div>
          <div className="text-[11px] text-gray-500 font-medium">Unmatched shift punches</div>
        </div>
      </div>

      {/* Employee Payroll Breakdown Table */}
      <div className="bg-white rounded-card border border-gray-200 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Employee Hours Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Shifts</th>
                <th className="p-3">Hours Worked</th>
                <th className="p-3">Hourly Rate</th>
                <th className="p-3">Estimated Pay</th>
                <th className="p-3 text-right">Flagged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userSummaries.map((item: any) => (
                <tr key={item.user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 font-semibold text-gray-900">
                    {item.user.name}
                    <div className="text-[10px] text-gray-400 font-normal">{item.user.email}</div>
                  </td>
                  <td className="p-3 text-gray-600 font-medium">{item.totalShifts}</td>
                  <td className="p-3 text-gray-900 font-bold">{item.totalHours.toFixed(2)} hrs</td>
                  <td className="p-3 text-gray-600">
                    {item.user.hourlyRate !== null ? `$${item.user.hourlyRate.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="p-3 text-emerald-700 font-bold">${item.estimatedPay.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    {item.flaggedCount > 0 ? (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {item.flaggedCount} Flagged
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
