import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import RichTextEditor from '../../components/RichTextEditor';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { exportParticipants } from '../../utils/exportParticipants';

/* ─── toast helper ─────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === 'success'
      ? 'bg-emerald-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-gray-700';

  return (
    <div className={`fixed top-6 right-6 z-[100] ${bg} text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-fadeIn`}>
      {type === 'success' && <CheckCircle className="w-4 h-4" />}
      {type === 'error' && <XCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EDIT MODAL (Admin version — same fields)
   ═══════════════════════════════════════════════ */
function EditModal({ event, onClose, onSaved }) {
  const backdropRef = useRef(null);
  const [form, setForm] = useState({
    title: event.title || '',
    description: event.description || '',
    date: event.date || '',
    time: event.time || '',
    location: event.location || '',
    collegeName: event.collegeName || '',
    capacity: event.capacity || 0,
    category: event.category || '',
    isTeamEvent: !!event.isTeamEvent,
    minTeamSize: event.minTeamSize || 2,
    maxTeamSize: event.maxTeamSize || 4,
    posterUrl: event.posterUrl || '',
    prizePool: event.prizePool || '',
    deadlines: event.deadlines || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/events/${event._id}`, form);
      onSaved('Event Updated Successfully');
    } catch (err) {
      onSaved(err.response?.data?.message || 'Failed to update event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm';

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-scaleIn">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit Event (Admin)</h2>
            <p className="text-xs text-gray-400 mt-0.5">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" required value={form.title} onChange={(e) => handleChange('title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required value={form.date} onChange={(e) => handleChange('date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" required value={form.time} onChange={(e) => handleChange('time', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Venue</label>
              <input type="text" required value={form.location} onChange={(e) => handleChange('location', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
              <input type="text" value={form.collegeName} onChange={(e) => handleChange('collegeName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => handleChange('category', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" min="0" value={form.capacity} onChange={(e) => handleChange('capacity', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool</label>
              <input type="text" value={form.prizePool} onChange={(e) => handleChange('prizePool', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadlines</label>
              <input type="text" value={form.deadlines} onChange={(e) => handleChange('deadlines', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poster URL</label>
              <input type="text" value={form.posterUrl} onChange={(e) => handleChange('posterUrl', e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <input type="checkbox" id="adminIsTeamEvent" checked={form.isTeamEvent} onChange={(e) => handleChange('isTeamEvent', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="adminIsTeamEvent" className="text-sm font-medium text-gray-700">Team Event</label>
              {form.isTeamEvent && (
                <div className="flex items-center gap-2 ml-auto">
                  <input type="number" min="1" value={form.minTeamSize} onChange={(e) => handleChange('minTeamSize', e.target.value)} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Min" />
                  <span className="text-gray-400 text-sm">to</span>
                  <input type="number" min="1" value={form.maxTeamSize} onChange={(e) => handleChange('maxTeamSize', e.target.value)} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Max" />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <RichTextEditor
                value={form.description}
                onChange={(html) => handleChange('description', html)}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-md transition-all disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DELETE CONFIRMATION MODAL
   ═══════════════════════════════════════════════ */
function DeleteModal({ event, onClose, onDeleted }) {
  const backdropRef = useRef(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/events/${event._id}`);
      onDeleted('Event Deleted Successfully');
    } catch (err) {
      onDeleted(err.response?.data?.message || 'Failed to delete event', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Event?</h3>
        <p className="text-sm text-gray-500 mb-1">Are you sure you want to delete <span className="font-semibold text-gray-700">"{event.title}"</span>?</p>
        <p className="text-xs text-gray-400 mb-6">This will also remove all attendance and certificate records. This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-md transition-all disabled:opacity-60">{deleting ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN — APPROVE EVENTS PAGE
   ═══════════════════════════════════════════════ */
export default function ApproveEvents() {
  const [pending, setPending] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [toast, setToast] = useState(null);

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
      fetchData();
    } catch (err) {
      console.error(`Error ${action}ing event:`, err);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleSaved = (message, type = 'success') => {
    setEditEvent(null);
    showToast(message, type);
    if (type === 'success') fetchData();
  };

  const handleDeleted = (message, type = 'success') => {
    setDeleteEvent(null);
    showToast(message, type);
    if (type === 'success') fetchData();
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => exportParticipants(event, 'excel')}
                            title="Download Excel"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            <Download className="w-3 h-3" /> List
                          </button>
                          <button
                            onClick={() => setEditEvent(event)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold hover:bg-primary-100 transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteEvent(event)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editEvent && <EditModal event={editEvent} onClose={() => setEditEvent(null)} onSaved={handleSaved} />}
      {deleteEvent && <DeleteModal event={deleteEvent} onClose={() => setDeleteEvent(null)} onDeleted={handleDeleted} />}
    </div>
  );
}
