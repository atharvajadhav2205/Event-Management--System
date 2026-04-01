import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import {
  CalendarDays,
  MapPin,
  Users,
  X,
  Plus,
  Trash2,
  UserCheck,
  UsersRound,
  Trophy,
  Clock,
  Tag,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// MOCK DATA — used as fallback when the API is unreachable
// so the UI can be previewed without the backend running.
// ─────────────────────────────────────────────────────────────
const MOCK_EVENTS = [
  {
    _id: '1',
    title: 'Tech Summit 2026',
    collegeName: 'IIT Delhi',
    date: '2026-04-20',
    time: '10:00',
    location: 'Main Auditorium',
    description:
      'A flagship technology conference bringing together industry leaders, researchers, and students to explore cutting-edge innovations in AI, blockchain, and quantum computing.',
    capacity: 200,
    registered: 142,
    category: 'Technology',
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    prizePool: '₹50,000',
  },
  {
    _id: '2',
    title: 'Cultural Night',
    collegeName: 'NIT Trichy',
    date: '2026-05-15',
    time: '18:00',
    location: 'Open Air Theatre',
    description:
      'An enchanting evening of dance, music, and theatrical performances celebrating the diverse cultural heritage of our campus community.',
    capacity: 500,
    registered: 387,
    category: 'Cultural',
    posterUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
    isTeamEvent: false,
  },
  {
    _id: '3',
    title: 'Startup Pitch Day',
    collegeName: 'BITS Pilani',
    date: '2026-06-01',
    time: '09:00',
    location: 'Innovation Hub',
    description:
      'Present your startup ideas to a panel of seasoned investors and mentors. Win funding opportunities, mentorship, and incubation support for your venture.',
    capacity: 50,
    registered: 48,
    category: 'Entrepreneurship',
    posterUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
    isTeamEvent: true,
    minTeamSize: 1,
    maxTeamSize: 3,
    prizePool: '₹1,00,000',
  },
  {
    _id: '4',
    title: 'Web Dev Workshop',
    collegeName: 'VIT Vellore',
    date: '2026-04-28',
    time: '14:00',
    location: 'Computer Lab 3',
    description:
      'Hands-on workshop covering modern full-stack development with React, Node.js, and MongoDB. Perfect for beginners looking to build real-world projects.',
    capacity: 60,
    registered: 22,
    category: 'Workshop',
    posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
    isTeamEvent: false,
  },
  {
    _id: '5',
    title: 'AI Hackathon',
    collegeName: 'IIIT Hyderabad',
    date: '2026-07-10',
    time: '08:00',
    location: 'Innovation Center',
    description:
      'A 24-hour AI hackathon challenging teams to build intelligent solutions addressing real-world problems. Mentorship and API credits provided.',
    capacity: 100,
    registered: 76,
    category: 'Technology',
    posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
    isTeamEvent: true,
    minTeamSize: 3,
    maxTeamSize: 5,
    prizePool: '₹75,000',
  },
  {
    _id: '6',
    title: 'Art Exhibition',
    collegeName: 'JNU Delhi',
    date: '2026-05-20',
    time: '11:00',
    location: 'Gallery Hall',
    description:
      'Showcasing student artworks spanning painting, sculpture, digital art, and mixed media. Open to all art enthusiasts and creators.',
    capacity: 150,
    registered: 45,
    category: 'Art',
    posterUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    isTeamEvent: false,
  },
];

// ─────────────────────────────────────────────────────────────
// HELPER — format a date string nicely
// ─────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ═════════════════════════════════════════════════════════════
// EVENT CARD COMPONENT
// ═════════════════════════════════════════════════════════════
function EventCard({ event, onRegister, onDetails }) {
  const registeredCount = event.attendees?.length ?? event.registered ?? 0;
  const capacityPercent = event.capacity
    ? Math.min(100, Math.round((registeredCount / event.capacity) * 100))
    : 0;

  const barColor =
    capacityPercent >= 90
      ? 'bg-red-500'
      : 'bg-orange-500';

  const isFull = capacityPercent >= 100;

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden border border-gray-100/80 flex flex-col relative">
      {/* ── Poster ────────────────────────────────────────── */}
      <div className="relative h-52 overflow-hidden">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.title}
            onError={(e) => {
              e.target.onerror = null; // prevents looping
              e.target.style.display = 'none'; // hide broken image
              e.target.nextElementSibling.style.display = 'block'; // show gradient
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : null}

        {/* Fallback pattern (always present but hidden if img loads, shown if no url or img fails) */}
        <div
          className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          style={{ display: event.posterUrl ? 'none' : 'block' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Category badge (top-left) */}
        <span className="absolute top-3 left-3 text-[11px] font-medium bg-white/95 px-3 py-1 rounded-full text-gray-700 shadow-sm flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {event.category || 'General'}
        </span>

        {/* Team / Solo badge (top-right) */}
        {event.isTeamEvent ? (
          <span className="absolute top-3 right-3 text-[11px] font-bold bg-indigo-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <UsersRound className="w-3 h-3" />
            Team
          </span>
        ) : (
          <span className="absolute top-3 right-3 text-[11px] font-bold bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            Solo
          </span>
        )}

        {/* Prize pool floating badge on poster */}
        {event.prizePool && (
          <div className="absolute top-11 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            {event.prizePool}
          </div>
        )}

        {/* Title + college on poster */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
            {event.title}
          </h3>
          <p className="text-xs font-medium text-white/70 mt-0.5 uppercase tracking-wider">
            {event.collegeName}
          </p>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1 gap-3">

        {/* Date + Time + Location row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            {formatDate(event.date)}
          </span>
          {event.time && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {event.time}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            {event.location}
          </span>
        </div>

        {/* Description removed as requested — layout is now clean and minimal */}

        {/* ── Prize pool banner (prominent) ─────────────── */}
        {event.prizePool && (
          <div className="flex items-center gap-3 bg-[#fffaf0] border border-yellow-200 rounded-xl px-4 py-3">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-400 rounded-lg shadow-sm shrink-0">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Prize Pool</p>
              <p className="text-base font-extrabold text-gray-900 leading-tight">{event.prizePool}</p>
            </div>
          </div>
        )}

        {/* Capacity progress bar */}
        {event.capacity > 0 && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {registeredCount} / {event.capacity} seats
              </span>
              <span className={isFull ? 'text-red-500 font-bold' : ''}>
                {isFull ? 'FULL' : `${capacityPercent}%`}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Team size info */}
        {event.isTeamEvent && event.minTeamSize && event.maxTeamSize && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full w-fit mt-1">
            <UsersRound className="w-3.5 h-3.5" />
            {event.minTeamSize} – {event.maxTeamSize} members
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Card Buttons ─────────────────────────────────── */}
        <div className="flex gap-3 pt-3">
          <button
            onClick={() => onDetails(event)}
            className="flex-[0.8] py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.97]"
          >
            Details
          </button>
          <button
            onClick={() => onRegister(event)}
            disabled={isFull}
            className={`flex-[1.2] py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] ${isFull
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#4f46e5] text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
              }`}
          >
            {isFull ? 'Full' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// DETAILS MODAL COMPONENT
// ═════════════════════════════════════════════════════════════
function DetailsModal({ event, onClose }) {
  const backdropRef = useRef(null);

  if (!event) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-12 bg-black/60 backdrop-blur-md animate-fadeIn"
    >
      {/* Increased max-w-lg to max-w-4xl for a wider layout */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto animate-scaleIn flex flex-col">
        {/* Header */}
        <div className="relative">
          {event.posterUrl && (
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-full h-56 object-cover rounded-t-2xl"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-xl font-bold text-white drop-shadow-lg">{event.title}</h2>
            <p className="text-sm text-white/80 font-medium">{event.collegeName}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Info chips row */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <CalendarDays className="w-4 h-4 text-primary-500" />
              {formatDate(event.date)} {event.time && `at ${event.time}`}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-primary-500" />
              {event.location}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-primary-500" />
              {event.attendees?.length ?? event.registered ?? 0} / {event.capacity} registered
            </span>
          </div>

          {/* Prize Pool banner */}
          {event.prizePool && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/60 rounded-xl px-4 py-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-md shadow-amber-200/50">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-amber-700/70 uppercase tracking-wider">Prize Pool</p>
                <p className="text-base font-bold text-amber-800">{event.prizePool}</p>
              </div>
            </div>
          )}

          {event.deadlines && (
            <p className="text-sm text-red-500 font-medium">⏰ {event.deadlines}</p>
          )}

          {/* Description — using dangerouslySetInnerHTML for Rich Text Support */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" />
              About This Event
            </h4>
            <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
              <div
                className="prose prose-sm prose-primary max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: event.description || '<p>No description provided.</p>' }}
              />
            </div>
          </div>

          {/* Attachments Section */}
          {event.attachments && event.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-primary-500" />
                Attachments & Resources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.attachments.map((file, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Programmatic download — works cross-origin
                      fetch(file.url)
                        .then(res => res.blob())
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = file.name || 'download';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        })
                        .catch(() => {
                          // Fallback: open in new tab
                          window.open(file.url, '_blank');
                        });
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors group text-left w-full"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {file.type || 'Document'} · Click to download
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-primary-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team info */}
          {event.isTeamEvent && (
            <div className="flex items-center gap-2 text-sm bg-primary-50 text-primary-700 px-3 py-2 rounded-lg">
              <UsersRound className="w-4 h-4" />
              <span className="font-medium">Team Event</span>
              <span className="text-primary-500">&mdash;</span>
              <span>{event.minTeamSize} to {event.maxTeamSize} members per team</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// REGISTRATION MODAL COMPONENT
// Adapts its form between Individual and Team events.
// ═════════════════════════════════════════════════════════════
function RegisterModal({ event, onClose }) {
  const backdropRef = useRef(null);

  // ── Individual registration state ──────────────────────────
  const [individual, setIndividual] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    yearDept: '',
  });

  // ── Team registration state ────────────────────────────────
  const [teamName, setTeamName] = useState('');
  const minMembers = event?.minTeamSize || 2;
  const maxMembers = event?.maxTeamSize || 4;

  // Pre-fill minimum number of member slots
  const [members, setMembers] = useState(
    () => Array.from({ length: minMembers }, () => ({ name: '', email: '', phone: '', college: '', yearDept: '' }))
  );

  if (!event) return null;

  // ── Member management helpers ──────────────────────────────
  const addMember = () => {
    if (members.length < maxMembers) {
      setMembers((prev) => [...prev, { name: '', email: '', phone: '', college: '', yearDept: '' }]);
    }
  };

  const removeMember = (idx) => {
    if (members.length > minMembers) {
      setMembers((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const updateMember = (idx, field, value) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  // ── Submit handler ─────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (event.isTeamEvent) {
        const payload = {
          teamName,
          teamMembers: members,
        };
        await API.post(`/events/apply/${event._id}`, payload);
      } else {
        await API.post(`/events/apply/${event._id}`, individual);
      }

      alert('Successfully registered for the event!');
      onClose(true); // Indicate success to parent component
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register. Please try again.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared input class ─────────────────────────────────────
  const inputClass =
    'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm';

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* ── Modal Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Register</h2>
            <p className="text-xs text-gray-400 mt-0.5">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Modal Body ───────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* ──────── INDIVIDUAL REGISTRATION ──────── */}
          {!event.isTeamEvent && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={individual.name}
                  onChange={(e) => setIndividual((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter Name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={individual.email}
                  onChange={(e) => setIndividual((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Enter Email"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={individual.phone}
                  onChange={(e) => setIndividual((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                <input
                  type="text"
                  required
                  value={individual.college}
                  onChange={(e) => setIndividual((p) => ({ ...p, college: e.target.value }))}
                  placeholder="Your college name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year / Department
                </label>
                <input
                  type="text"
                  required
                  value={individual.yearDept}
                  onChange={(e) => setIndividual((p) => ({ ...p, yearDept: e.target.value }))}
                  placeholder=""
                  className={inputClass}
                />
              </div>
            </>
          )}

          {/* ──────── TEAM REGISTRATION ──────── */}
          {event.isTeamEvent && (
            <>
              {/* Team name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter Team Name"
                  className={inputClass}
                />
              </div>

              {/* Heading with counter */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Team Members ({members.length} / {maxMembers})
                </h3>
                <span className="text-xs text-gray-400">
                  Min: {minMembers} · Max: {maxMembers}
                </span>
              </div>

              {/* Dynamic member fields */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {members.map((member, idx) => (
                  <div
                    key={idx}
                    className="relative border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-2"
                  >
                    {/* Remove button (only if above min) */}
                    {members.length > minMembers && (
                      <button
                        type="button"
                        onClick={() => removeMember(idx)}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <p className="text-xs font-semibold text-gray-400">Member {idx + 1}</p>

                    <input
                      type="text"
                      required
                      value={member.name}
                      onChange={(e) => updateMember(idx, 'name', e.target.value)}
                      placeholder="Member name"
                      className={inputClass}
                    />
                    <input
                      type="email"
                      required
                      value={member.email}
                      onChange={(e) => updateMember(idx, 'email', e.target.value)}
                      placeholder="Member email"
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      required
                      value={member.phone}
                      onChange={(e) => updateMember(idx, 'phone', e.target.value)}
                      placeholder="Phone number"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      required
                      value={member.college}
                      onChange={(e) => updateMember(idx, 'college', e.target.value)}
                      placeholder="College name"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      required
                      value={member.yearDept}
                      onChange={(e) => updateMember(idx, 'yearDept', e.target.value)}
                      placeholder="Year / Dept (e.g. 3rd Year CSE)"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              {/* Add member button */}
              {members.length < maxMembers && (
                <button
                  type="button"
                  onClick={addMember}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              )}
            </>
          )}

          {/* ── Submit ─────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VIEW EVENTS PAGE
// ═════════════════════════════════════════════════════════════
export default function ViewEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [detailsEvent, setDetailsEvent] = useState(null);
  const [registerEvent, setRegisterEvent] = useState(null);

  // ── Fetch events on mount ──────────────────────────────────
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/events');
      setEvents(res.data.length ? res.data : MOCK_EVENTS);
    } catch {
      // API unreachable — fall back to mock data
      setEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>
      {/* ── Page heading ──────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Explore Events</h1>
        <p className="text-gray-500 text-sm mt-1">
          Discover upcoming events and register to secure your spot
        </p>
      </div>

      {/* ── Loading skeleton ──────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Event grid ────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onDetails={setDetailsEvent}
              onRegister={setRegisterEvent}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────── */}
      {!loading && events.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm mt-1">Check back later for upcoming events!</p>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────── */}
      {detailsEvent && (
        <DetailsModal event={detailsEvent} onClose={() => setDetailsEvent(null)} />
      )}

      {registerEvent && (
        <RegisterModal
          event={registerEvent}
          onClose={(success) => {
            setRegisterEvent(null);
            if (success === true) fetchEvents();
          }}
        />
      )}
    </div>
  );
}
