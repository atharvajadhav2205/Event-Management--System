import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Award, Download, CalendarDays, Loader2 } from 'lucide-react';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await API.get('/certificates/my');
        setCertificates(data);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleDownload = async (certId, eventTitle) => {
    setDownloading((prev) => ({ ...prev, [certId]: true }));
    try {
      const response = await API.get(`/certificates/download/${certId}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${eventTitle?.replace(/\s+/g, '_') || 'Event'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading((prev) => ({ ...prev, [certId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Certificates</h1>
        <p className="text-gray-500 text-sm mt-1">Download your earned certificates for each event</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <p className="text-lg font-medium">No certificates yet</p>
          <p className="text-sm mt-1">Attend events to earn certificates</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-left">
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Event Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Issued On</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {certificates.map((cert, idx) => (
                  <tr key={cert._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {cert.eventId?.title || 'Event'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {cert.eventId?.category || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownload(cert._id, cert.eventId?.title)}
                        disabled={downloading[cert._id]}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-xs font-semibold hover:from-primary-600 hover:to-primary-700 active:scale-[0.97] transition-all shadow-sm disabled:opacity-60"
                      >
                        {downloading[cert._id] ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> Download
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
