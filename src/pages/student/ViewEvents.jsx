import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { CalendarDays, MapPin, Users, Clock, Search, Loader2, X, Info, Trophy, ImageOff } from 'lucide-react';

const categoryColors = {
  Technology: 'bg-blue-100 text-blue-700',
  Cultural: 'bg-pink-100 text-pink-700',
  Workshop: 'bg-purple-100 text-purple-700',
  Entrepreneurship: 'bg-amber-100 text-amber-700',
  Art: 'bg-emerald-100 text-emerald-700',
  General: 'bg-gray-100 text-gray-700',
};

export default function ViewEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState('');
  // Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events');
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (eventId) => {
    setApplyingId(eventId);
    setMessage('');
    try {
      const { data } = await API.post(`/events/apply/${eventId}`);
      setMessage(data.message);
      fetchEvents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingId(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Open the details modal
  const openModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // Close the details modal
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300); // Wait for animation
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(search.toLowerCase()))
  );

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
          <h1 className="text-2xl font-bold text-gray-800">Explore Events</h1>
          <p className="text-gray-500 text-sm mt-1">Discover and register for upcoming events</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-72 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-600 w-full"
          />
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-medium">
          {message}
        </div>
      )}

      {/* ───────── Event Cards Grid ───────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            {/* Event Poster */}
            {event.posterUrl ? (
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-44 object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            {/* Fallback placeholder (shown if no posterUrl or image fails to load) */}
            <div
              className={`h-44 bg-gradient-to-br from-primary-500 to-purple-600 relative p-5 flex flex-col justify-end ${event.posterUrl ? 'hidden' : ''}`}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                <ImageOff className="w-16 h-16 text-white" />
              </div>
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${categoryColors[event.category] || 'bg-gray-100 text-gray-700'}`}>
                  {event.category}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg leading-snug relative z-10">{event.title}</h3>
            </div>

            {/* Category badge over poster */}
            {event.posterUrl && (
              <div className="px-5 pt-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-lg leading-snug truncate">{event.title}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ml-2 ${categoryColors[event.category] || 'bg-gray-100 text-gray-700'}`}>
                  {event.category}
                </span>
              </div>
            )}

            <div className="p-5 space-y-3">
              <p className="text-gray-500 text-sm line-clamp-2">{event.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CalendarDays className="w-4 h-4 text-primary-500" />
                  DeadLine : {event.date}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="w-4 h-4 text-primary-500" />
                  {event.time}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  Location : {event.location}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="w-4 h-4 text-primary-500" />
                  {event.attendees?.length || 0}/{event.capacity}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-primary-500 to-purple-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(((event.attendees?.length || 0) / (event.capacity || 1)) * 100, 100)}%` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => openModal(event)}
                  className="flex-1 py-2.5 border-2 border-primary-100 text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-50 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5"
                >
                  <Info className="w-4 h-4" />
                  Details
                </button>
                <button
                  onClick={() => handleApply(event._id)}
                  disabled={applyingId === event._id}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-primary-500/20 disabled:opacity-60"
                >
                  {applyingId === event._id ? 'Applying...' : 'Register Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 mt-12">
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm mt-1">Check back later for new events</p>
        </div>
      )}

      {/* ───────── Details Modal ───────── */}
      {selectedEvent && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              modalOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
              modalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-md transition-all hover:scale-110"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Scrollable inner content */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Modal Poster */}
              {selectedEvent.posterUrl ? (
                <img
                  src={selectedEvent.posterUrl}
                  alt={selectedEvent.title}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center">
                    <ImageOff className="w-12 h-12 text-white/30 mx-auto mb-2" />
                    <p className="text-white/50 text-sm">No poster available</p>
                  </div>
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Title + Category */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h2>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ${categoryColors[selectedEvent.category] || 'bg-gray-100 text-gray-700'}`}>
                      {selectedEvent.category}
                    </span>
                  </div>
                  {selectedEvent.organiserName && (
                    <p className="text-sm text-gray-400 mt-1">by {selectedEvent.organiserName}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto border border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>

                {/* Prize Pool */}
                {selectedEvent.prizePool && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h3 className="text-sm font-semibold text-amber-800">Prize Pool</h3>
                    </div>
                    <p className="text-amber-700 font-bold text-lg">{selectedEvent.prizePool}</p>
                  </div>
                )}

                {/* Important Deadlines */}
                {selectedEvent.deadlines && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-5 h-5 text-red-500" />
                      <h3 className="text-sm font-semibold text-red-800">Important Deadlines</h3>
                    </div>
                    <p className="text-red-700 text-sm">{selectedEvent.deadlines}</p>
                  </div>
                )}

                {/* Event Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      <CalendarDays className="w-3.5 h-3.5" /> Date
                    </div>
                    <p className="text-gray-800 text-sm font-medium">{selectedEvent.date}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      <Clock className="w-3.5 h-3.5" /> Time
                    </div>
                    <p className="text-gray-800 text-sm font-medium">{selectedEvent.time}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      <MapPin className="w-3.5 h-3.5" /> Location
                    </div>
                    <p className="text-gray-800 text-sm font-medium">{selectedEvent.location}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      <Users className="w-3.5 h-3.5" /> Capacity
                    </div>
                    <p className="text-gray-800 text-sm font-medium">{selectedEvent.attendees?.length || 0}/{selectedEvent.capacity}</p>
                  </div>
                </div>

                {/* Register Button inside modal */}
                <button
                  onClick={() => { handleApply(selectedEvent._id); closeModal(); }}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-[0.98]"
                >
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
