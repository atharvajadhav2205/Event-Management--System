import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Award, Download, CalendarDays, Loader2 } from 'lucide-react';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <p className="text-gray-500 text-sm mt-1">View and download your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <p className="text-lg font-medium">No certificates yet</p>
          <p className="text-sm mt-1">Attend events to earn certificates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-all duration-300 p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                  Certificate
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-lg mb-1">
                {cert.eventId?.title || 'Event'}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                <CalendarDays className="w-4 h-4" />
                Issued: {new Date(cert.issuedAt).toLocaleDateString()}
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary-100 text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-50 active:scale-[0.98] transition-all duration-150">
                <Download className="w-4 h-4" />
                Download Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
