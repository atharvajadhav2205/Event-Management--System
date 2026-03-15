import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Award, Download, CheckCircle, Loader2, ChevronDown } from 'lucide-react';

export default function GenerateCertificates() {
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [generated, setGenerated] = useState({});
  const [generating, setGenerating] = useState(false);

  // Fetch organiser's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get('/events/my-events');
        setMyEvents(data.filter((e) => e.status === 'approved'));
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch attendees when event is selected (only show present ones)
  useEffect(() => {
    if (!selectedEvent) {
      setAttendees([]);
      setGenerated({});
      return;
    }
    const fetchAttendees = async () => {
      setLoadingAttendees(true);
      try {
        const { data } = await API.get(`/attendance/${selectedEvent}`);
        setAttendees(data.filter((a) => a.status === 'present'));
        setGenerated({});
      } catch (err) {
        console.error('Error fetching attendees:', err);
      } finally {
        setLoadingAttendees(false);
      }
    };
    fetchAttendees();
  }, [selectedEvent]);

  const handleGenerate = async (userId) => {
    try {
      await API.post('/certificates/generate', {
        eventId: selectedEvent,
        userIds: [userId],
      });
      setGenerated((prev) => ({ ...prev, [userId]: true }));
    } catch (err) {
      console.error('Error generating certificate:', err);
    }
  };

  const handleBulk = async () => {
    setGenerating(true);
    try {
      const userIds = attendees.map((a) => a._id);
      await API.post('/certificates/generate', {
        eventId: selectedEvent,
        userIds,
      });
      const all = {};
      attendees.forEach((a) => (all[a._id] = true));
      setGenerated(all);
    } catch (err) {
      console.error('Error generating certificates:', err);
    } finally {
      setGenerating(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Generate Certificates</h1>
          <p className="text-gray-500 text-sm mt-1">
            {attendees.length > 0
              ? `Issue certificates to ${attendees.length} attendees who were present`
              : 'Select an event to view present attendees'}
          </p>
        </div>
        {attendees.length > 0 && (
          <button
            onClick={handleBulk}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
          >
            <Award className="w-4 h-4" /> {generating ? 'Generating...' : 'Generate All'}
          </button>
        )}
      </div>

      {/* Event Selector */}
      <div className="mb-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Event</label>
        <div className="relative">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm appearance-none bg-white"
          >
            <option value="">-- Choose an event --</option>
            {myEvents.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title} — {ev.date}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingAttendees ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : attendees.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-left">
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendees.map((a, idx) => (
                  <tr key={a._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{a.name}</td>
                    <td className="px-6 py-4 text-gray-500">{a.email}</td>
                    <td className="px-6 py-4 text-right">
                      {generated[a._id] ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <CheckCircle className="w-4 h-4" /> Generated
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerate(a._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold hover:bg-primary-100 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Generate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedEvent ? (
        <div className="text-center text-gray-400 mt-8">
          <p className="text-sm">No present attendees found for this event. Mark attendance first.</p>
        </div>
      ) : null}
    </div>
  );
}
