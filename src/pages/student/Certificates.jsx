import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Award, Download, Loader2, Calendar, Tag } from 'lucide-react';

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

  const handleDownload = (certId, eventTitle) => {
    // Use backend proxy to download — avoids Cloudinary CORS issues
    const token = localStorage.getItem('token');
    const downloadUrl = `http://localhost:5000/api/certificates/download/${certId}`;
    
    // Create a temporary link with auth token
    const link = document.createElement('a');
    link.href = downloadUrl + `?token=${token}`;
    link.download = `certificate-${(eventTitle || 'cert').replace(/\s+/g, '_')}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="w-7 h-7 text-amber-500" />
          My Certificates
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Download certificates from events you've attended
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {/* PDF placeholder */}
              <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-b border-gray-100">
                <div className="text-center group-hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl filter drop-shadow-sm">📄</span>
                  <p className="text-xs text-indigo-400 mt-2 font-semibold uppercase tracking-wider">PDF Certificate</p>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                  {cert.eventId?.title || 'Event'}
                </h3>
                {cert.studentName && (
                  <p className="text-xs font-semibold text-indigo-500 mb-2">
                    For: {cert.studentName}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  {cert.eventId?.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {cert.eventId.date}
                    </span>
                  )}
                  {cert.eventId?.category && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {cert.eventId.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {cert.issuedAt
                      ? new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </span>

                  <button
                    onClick={() =>
                      handleDownload(
                        cert._id,
                        cert.eventId?.title || 'certificate'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-orange-600 active:scale-[0.97] transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
            <Award className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-gray-500 font-medium mb-1">No certificates yet</h3>
          <p className="text-gray-400 text-sm">
            Certificates from events you've attended will appear here
          </p>
        </div>
      )}
    </div>
  );
}
