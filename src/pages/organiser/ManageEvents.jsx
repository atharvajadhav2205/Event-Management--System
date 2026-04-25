import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import RichTextEditor from '../../components/RichTextEditor';
import {
  CalendarDays,
  MapPin,
  Clock,
  Tag,
  Users,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ListChecks,
  Download,
  Megaphone,
  MessageSquare,
  Star,
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

/* ─── format date ──────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ─── status badge ─────────────────────────────── */
function StatusBadge({ status }) {
  const cls = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${cls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   EDIT MODAL
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
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit Event</h2>
            <p className="text-xs text-gray-400 mt-0.5">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
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
              <input type="text" value={form.prizePool} onChange={(e) => handleChange('prizePool', e.target.value)} placeholder="e.g. ₹50,000" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadlines</label>
              <input type="text" value={form.deadlines} onChange={(e) => handleChange('deadlines', e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poster URL</label>
              <input type="text" value={form.posterUrl} onChange={(e) => handleChange('posterUrl', e.target.value)} className={inputClass} />
            </div>

            {/* Team event toggle */}
            <div className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                id="isTeamEvent"
                checked={form.isTeamEvent}
                onChange={(e) => handleChange('isTeamEvent', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isTeamEvent" className="text-sm font-medium text-gray-700">Team Event</label>

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
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-md transition-all disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
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
        <p className="text-sm text-gray-500 mb-1">
          Are you sure you want to delete <span className="font-semibold text-gray-700">"{event.title}"</span>?
        </p>
        <p className="text-xs text-gray-400 mb-6">This will also remove all attendance and certificate records for this event. This action cannot be undone.</p>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-md transition-all disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ANNOUNCE MODAL
   ═══════════════════════════════════════════════ */
function AnnounceModal({ event, onClose, onAnnounced }) {
  const backdropRef = useRef(null);
  const [form, setForm] = useState({ title: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await API.post(`/announcements/${event._id}`, form);
      onAnnounced('Announcement sent and students notified via email!');
    } catch (err) {
      onAnnounced(err.response?.data?.message || 'Failed to send announcement', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={backdropRef} onClick={(e) => e.target === backdropRef.current && onClose()} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Megaphone className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-gray-800">Post Announcement</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <p className="text-sm text-gray-500 mb-5 ml-11">Notify all registered students for <strong className="text-gray-700">{event.title}</strong>.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Title</label>
            <input required type="text" placeholder="e.g., Venue Change, Event Postponed" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea required rows="4" placeholder="Type your detailed message here..." value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none"></textarea>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
            <button disabled={sending} type="submit" className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              {sending ? 'Broadcasting...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   VIEW FEEDBACKS MODAL
   ═══════════════════════════════════════════════ */
function ViewFeedbacksModal({ event, onClose }) {
  const backdropRef = useRef(null);
  const feedbacks = event.feedbacks || [];
  
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  return (
    <div ref={backdropRef} onClick={(e) => e.target === backdropRef.current && onClose()} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Event Feedbacks</h3>
            <p className="text-sm text-gray-500 mt-0.5">{event.title}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {feedbacks.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <MessageSquare className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-500 font-medium mb-1">No feedbacks yet</h3>
              <p className="text-gray-400 text-sm">Students haven't submitted any feedback for this event.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 mb-6">
                <div className="text-center">
                  <span className="block text-4xl font-black text-gray-800">{averageRating}</span>
                  <div className="flex justify-center gap-0.5 text-amber-400 my-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200'}`} />)}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{feedbacks.length} Ratings</span>
                </div>
                <div className="flex-1 h-12 border-l border-gray-100 pl-6 flex items-center">
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "Here's what your attendees have to say about this event."
                  </p>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4">
                {feedbacks.map((fb, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                          {fb.userName ? fb.userName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-gray-800">{fb.userName || 'Anonymous'}</span>
                          <span className="block text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                      </div>
                    </div>
                    {fb.comment && (
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed ml-11">
                        {fb.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN – MANAGE EVENTS PAGE
   ═══════════════════════════════════════════════ */
export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [announceEvent, setAnnounceEvent] = useState(null);
  const [viewFeedbacksEvent, setViewFeedbacksEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/events/my-events');
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSaved = (message, type = 'success') => {
    setEditEvent(null);
    showToast(message, type);
    if (type === 'success') fetchEvents();
  };

  const handleDeleted = (message, type = 'success') => {
    setDeleteEvent(null);
    showToast(message, type);
    if (type === 'success') fetchEvents();
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
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ListChecks className="w-7 h-7 text-primary-500" />
          My Events
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage events you've created — edit details or remove them</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center mt-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-gray-500 font-medium mb-1">No events yet</h3>
          <p className="text-gray-400 text-sm">Events you create will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Poster / Header */}
              <div className="relative h-36 bg-gradient-to-br from-primary-50 to-indigo-50 overflow-hidden">
                {event.posterUrl ? (
                  <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={event.status} />
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-base font-bold text-white leading-tight line-clamp-2 drop-shadow">{event.title}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-indigo-400" />{formatDate(event.date)}</span>
                  {event.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" />{event.time}</span>}
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" />{event.location}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  {event.category && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{event.category}</span>}
                  {event.capacity > 0 && (
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.attendees?.length || 0}/{event.capacity}</span>
                  )}
                </div>

                <div className="flex-1" />

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => setViewFeedbacksEvent(event)}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors col-span-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> View Feedbacks {event.feedbacks?.length > 0 && `(${event.feedbacks.length})`}
                  </button>
                  <button
                    onClick={() => exportParticipants(event, 'excel')}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> List
                  </button>
                  <button
                    onClick={() => setAnnounceEvent(event)}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    <Megaphone className="w-3.5 h-3.5" /> Announce
                  </button>
                  <button
                    onClick={() => setEditEvent(event)}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteEvent(event)}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {editEvent && <EditModal event={editEvent} onClose={() => setEditEvent(null)} onSaved={handleSaved} />}
      {deleteEvent && <DeleteModal event={deleteEvent} onClose={() => setDeleteEvent(null)} onDeleted={handleDeleted} />}
      {announceEvent && <AnnounceModal event={announceEvent} onClose={() => setAnnounceEvent(null)} onAnnounced={(msg, type) => { setAnnounceEvent(null); showToast(msg, type); }} />}
      {viewFeedbacksEvent && <ViewFeedbacksModal event={viewFeedbacksEvent} onClose={() => setViewFeedbacksEvent(null)} />}
    </div>
  );
}
