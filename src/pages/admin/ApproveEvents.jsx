import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default function ApproveEvents() {
  const [pending, setPending] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        API.get('/events/pending'),
        API.get('/events/all'),
      ]);
      setPending(pendingRes.data);
      setAllEvents(allRes.data.filter((e) => e.status !== 'pending'));
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await API.put(`/events/${id}/${action}`);
      fetchData(); // Refresh both lists
    } catch (err) {
      console.error(`Error ${action}ing event:`, err);
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
        <h1 className="text-2xl font-bold text-gray-800">Approve Events</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve event requests from organisers</p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Approval ({pending.length})
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-left">
                    <th className="px-6 py-4 font-semibold">Event</th>
                    <th className="px-6 py-4 font-semibold">Organiser</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Venue</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pending.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{event.title}</td>
                      <td className="px-6 py-4 text-gray-500">{event.organiserName || event.organiserId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500">{event.date}</td>
                      <td className="px-6 py-4 text-gray-500">{event.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(event._id, 'approve')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(event._id, 'reject')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resolved */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">All Events ({allEvents.length})</h2>
        {allEvents.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-sm">No resolved events yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-left">
                    <th className="px-6 py-4 font-semibold">Event</th>
                    <th className="px-6 py-4 font-semibold">Organiser</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{event.title}</td>
                      <td className="px-6 py-4 text-gray-500">{event.organiserName || event.organiserId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500">{event.date}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          event.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
