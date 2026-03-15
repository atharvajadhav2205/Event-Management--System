import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { CheckSquare, Save, Loader2, ChevronDown } from 'lucide-react';

export default function MarkAttendance() {
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Fetch attendees when event is selected
  useEffect(() => {
    if (!selectedEvent) {
      setAttendees([]);
      return;
    }
    const fetchAttendees = async () => {
      setLoadingAttendees(true);
      try {
        const { data } = await API.get(`/attendance/${selectedEvent}`);
        setAttendees(data);
      } catch (err) {
        console.error('Error fetching attendees:', err);
      } finally {
        setLoadingAttendees(false);
      }
    };
    fetchAttendees();
  }, [selectedEvent]);

  const toggle = (id) => {
    setAttendees((prev) =>
      prev.map((a) =>
        a._id === id ? { ...a, status: a.status === 'present' ? 'absent' : 'present' } : a
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post('/attendance/mark', {
        eventId: selectedEvent,
        records: attendees.map((a) => ({
          userId: a._id,
          status: a.status,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = attendees.filter((a) => a.status === 'present').length;

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
          <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">
            {attendees.length > 0
              ? `${presentCount}/${attendees.length} marked present`
              : 'Select an event to view attendees'}
          </p>
        </div>
        {attendees.length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Attendance'}
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

      {saved && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          ✓ Attendance saved successfully!
        </div>
      )}

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
                  <th className="px-6 py-4 font-semibold w-12">
                    <CheckSquare className="w-4 h-4" />
                  </th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendees.map((a) => (
                  <tr
                    key={a._id}
                    className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${a.status === 'present' ? 'bg-emerald-50/40' : ''}`}
                    onClick={() => toggle(a._id)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={a.status === 'present'}
                        onChange={() => toggle(a._id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{a.name}</td>
                    <td className="px-6 py-4 text-gray-500">{a.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        a.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {a.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedEvent ? (
        <div className="text-center text-gray-400 mt-8">
          <p className="text-sm">No registered attendees for this event</p>
        </div>
      ) : null}
    </div>
  );
}
