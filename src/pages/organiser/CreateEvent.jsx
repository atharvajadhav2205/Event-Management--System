import { useState } from 'react';
import API from '../../api/axios';
import { PlusCircle, CalendarDays, Clock, MapPin, Users, AlignLeft, Tag, Image, Trophy, AlertCircle } from 'lucide-react';

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: null,
    category: 'Technology',
    collegeName: '',
    posterUrl: '',
    prizePool: '',
    deadlines: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await API.post('/events/create', {
        ...form,
        capacity: Number(form.capacity),
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setForm({ title: '', date: '', time: '', location: '', description: '', capacity: null, category: 'Technology', collegeName: '', posterUrl: '', prizePool: '', deadlines: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: 'title', label: 'Event Title', type: 'text', placeholder: 'e.g. Tech Summit 2026', icon: PlusCircle },
    { name: 'date', label: 'Date', type: 'date', icon: CalendarDays },
    { name: 'time', label: 'Time', type: 'time', icon: Clock },
    { name: 'location', label: 'Venue', type: 'text', placeholder: 'e.g. Main Auditorium', icon: MapPin },
    { name: 'capacity', label: 'Max Attendees', type: 'number', placeholder: 'e.g. 200', icon: Users },
    { name: 'collegeName', label: 'College Name', type: 'text', placeholder: 'e.g. IIT Delhi', icon: Tag },
    { name: 'posterUrl', label: 'Poster Image URL', type: 'url', placeholder: 'https://example.com/poster.jpg', icon: Image, required: false },
    { name: 'prizePool', label: 'Prize Pool', type: 'text', placeholder: 'e.g. ₹50,000', icon: Trophy, required: false },
    { name: 'deadlines', label: 'Important Deadlines', type: 'text', placeholder: 'e.g. Registration closes April 10', icon: AlertCircle, required: false },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to submit a new event for approval</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">
          {submitted && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Event submitted for approval!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      required={f.required !== false}
                      placeholder={f.placeholder || ''}
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              );
            })}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm appearance-none bg-white"
              >
                <option value="Technology">Technology</option>
                <option value="Cultural">Cultural</option>
                <option value="Workshop">Workshop</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="Art">Art</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the event..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? 'Submitting...' : 'Submit Event for Approval'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
