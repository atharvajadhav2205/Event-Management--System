import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, UsersRound, Clock, Tag, ExternalLink, CheckCircle } from 'lucide-react';
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
