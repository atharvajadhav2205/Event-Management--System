import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api/axios';
import {
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
  UserCheck,
  Award,
  Loader2,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function EventAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await API.get('/events/analytics');
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const [downloadingCerts, setDownloadingCerts] = useState(false);

  const downloadAllCertificates = async () => {
    setDownloadingCerts(true);
    try {
      const { data } = await API.get('/certificates/admin/all');
      if (!data || data.length === 0) {
        alert('No certificates have been issued yet.');
        return;
      }

      const headers = [['Certificate ID', 'Student Name', 'Event', 'Issue Date']];
      const rows = data.map(cert => [
        cert._id,
        cert.studentName,
        cert.eventId ? cert.eventId.title : 'N/A',
        new Date(cert.issuedAt).toLocaleDateString()
      ]);

      const worksheetData = [...headers, ...rows];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      const colWidths = [{ wch: 30 }, { wch: 25 }, { wch: 30 }, { wch: 15 }];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Certificates");
      XLSX.writeFile(wb, "all_issued_certificates.xlsx");
    } catch (err) {
      console.error('Failed to download certificates:', err);
      alert('Failed to download certificates.');
    } finally {
      setDownloadingCerts(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Events',
      value: analytics.totalEvents,
      icon: CalendarDays,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      label: 'Total Registrations',
      value: analytics.totalRegistrations.toLocaleString(),
      icon: Users,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      label: 'Avg. Attendance',
      value: `${analytics.avgAttendance}%`,
      icon: TrendingUp,
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
    {
      label: 'Pending Approvals',
      value: analytics.pendingApprovals,
      icon: Clock,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      label: 'Active Organisers',
      value: analytics.activeOrganisers,
      icon: UserCheck,
      bg: 'bg-pink-50',
      text: 'text-pink-600',
    },
    {
      label: 'Certificates Issued',
      value: analytics.certificatesIssued.toLocaleString(),
      icon: Award,
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
    },
  ];

  // Monthly events chart data
  const monthlyData = analytics.monthlyEvents || [];

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Event Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of platform performance and metrics</p>
        </div>
        <button
          onClick={downloadAllCertificates}
          disabled={downloadingCerts}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {downloadingCerts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export All Certificates
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${s.text}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Area Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Monthly Events</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Events"
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
