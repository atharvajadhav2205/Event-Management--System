import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { CalendarDays, Loader2 } from 'lucide-react';

const statusColors = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AppliedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplied = async () => {
      try {
        const { data } = await API.get('/events/applied');
        setEvents(data);
      } catch (err) {
        console.error('Error fetching applied events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplied();
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
        <h1 className="text-2xl font-bold text-gray-800">Applied Events</h1>
        <p className="text-gray-500 text-sm mt-1">Track the status of your event registrations</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <p className="text-lg font-medium">No applied events yet</p>
          <p className="text-sm mt-1">Browse events and register to see them here</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-left">
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Event</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event, idx) => (
                  <tr key={event._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{event.title}</td>
                    <td className="px-6 py-4 text-gray-500">{event.date}</td>
                    <td className="px-6 py-4 text-gray-500">{event.location}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusColors[event.status] || 'bg-gray-100 text-gray-700'}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl border border-gray-100 shadow-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{event.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusColors[event.status]}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> {event.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
