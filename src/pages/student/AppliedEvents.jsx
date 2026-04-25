import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, UsersRound, Clock, Tag, ExternalLink, CheckCircle, MessageSquare, Star, X } from 'lucide-react';
import API from '../../api/axios';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AppliedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackEvent, setFeedbackEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmittingFeedback(true);
    try {
      await API.post(`/events/${feedbackEvent._id}/feedback`, { rating, comment });
      setEvents(events.map(ev => 
        ev._id === feedbackEvent._id ? { ...ev, feedbackSubmitted: true } : ev
      ));
      setFeedbackEvent(null);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    const fetchAppliedEvents = async () => {
      try {
        const res = await API.get('/events/applied');
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch applied events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedEvents();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Registrations</h1>
        <p className="text-gray-500 text-sm mt-1">Events you have successfully registered for</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(n => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-48" />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Registrations Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            You haven't applied to any events yet. Head over to the Explore Events page to find something exciting!
          </p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{event.title}</h3>
                    <p className="text-sm text-primary-600 font-medium mt-0.5">{event.collegeName}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Registered
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(event.date)}
                  </span>
                  {event.time && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {event.time}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {event.location}
                  </span>
                </div>

                {/* Team Details specifically for Applied Events */}
                {event.isTeamEvent && event.userRegistrationInfo?.teamMembers?.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3">
                      <UsersRound className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-sm font-bold text-indigo-900">
                        {event.userRegistrationInfo.teamName || 'Your Team'}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full ml-auto">
                        {event.userRegistrationInfo.teamMembers.length} Members
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {event.userRegistrationInfo.teamMembers.map((member, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">{member.name}</span>
                          <span className="text-xs text-gray-500">{member.email}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Fallback for Solo Registration */}
                {!event.isTeamEvent && (
                  <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium">
                    Individual Registration
                  </div>
                )}

                {/* Feedback Action */}
                {event.isCompleted && event.attended && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {event.feedbackSubmitted ? (
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 py-2.5 rounded-xl border border-emerald-100">
                        <CheckCircle className="w-4 h-4" />
                        Feedback Submitted
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setFeedbackEvent(event);
                          setRating(0);
                          setComment('');
                        }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 py-2.5 rounded-xl transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Give Feedback
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Share Feedback</h3>
              <button onClick={() => setFeedbackEvent(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              How was your experience at <strong className="text-gray-800">{feedbackEvent.title}</strong>?
            </p>
            
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 transition-colors ${rating >= star ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'}`}
                  >
                    <Star className="w-10 h-10 fill-current" />
                  </button>
                ))}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments (Optional)</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                  placeholder="Tell us what you loved or what could be improved..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={rating === 0 || submittingFeedback}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
