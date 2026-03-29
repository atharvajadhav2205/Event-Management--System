import { useState, useRef } from 'react';
import API from '../../api/axios';
import {
  PlusCircle, CalendarDays, Clock, MapPin, Users, AlignLeft, Tag, Image,
  Trophy, AlertCircle, UsersRound, Bold, Italic, Underline, List,
  UploadCloud, X, FileText, FileUp
} from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

/**
 * CreateEvent — Organiser page for creating a new event.
 * Includes team event support, attachment upload, certificate templates, and rich text description.
 */
export default function CreateEvent() {
  // ── Form state ──────────────────────────────────────────────
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
    // Team event fields
    isTeamEvent: false,
    minTeamSize: 2,
    maxTeamSize: 4,
    // Attachments
    attachments: [],
  });

  const [templateFile, setTemplateFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Handlers ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle file uploads natively via input matching requirements (PNG, JPG, PDF, PPT, PPTX)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newAttachments = files.map((f) => ({
      name: f.name,
      // Use URL.createObjectURL to simulate file storage path for immediate rendering
      url: URL.createObjectURL(f),
      type: f.name.split('.').pop().toUpperCase(),
      file: f, // Keeping actual file for FormData in real scenario
    }));

    setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
    // Reset input so same file can be chosen again if removed
    e.target.value = null;
  };

  const removeAttachment = (idxToRemove) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idxToRemove),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTemplateFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── Team-size validation ──────────────────────────────────
    if (form.isTeamEvent) {
      const min = Number(form.minTeamSize);
      const max = Number(form.maxTeamSize);
      if (min < 1) {
        setError('Minimum team size must be at least 1.');
        return;
      }
      if (max < min) {
        setError('Maximum team size must be ≥ minimum team size.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const uploadData = new FormData();

      // Append standard fields
      Object.keys(form).forEach((key) => {
        if (key === 'attachments') {
          // Append each raw file object so Multer can process it
          form.attachments.forEach((att) => {
            if (att.file) uploadData.append('attachments', att.file);
          });
        } else if (key === 'capacity') {
          uploadData.append(key, Number(form.capacity) || 0);
        } else if (key === 'minTeamSize' || key === 'maxTeamSize') {
          if (form.isTeamEvent) {
            uploadData.append(key, Number(form[key]) || 0);
          }
        } else {
          uploadData.append(key, form[key]);
        }
      });

      // Append Certificate Template if it exists
      if (templateFile) {
        uploadData.append('certificateTemplate', templateFile);
      }

      await API.post('/events/create', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);

      // Reset form to defaults
      setForm({
        title: '', date: '', time: '', location: '', description: '',
        capacity: null, category: 'Technology', collegeName: '',
        posterUrl: '', prizePool: '', deadlines: '',
        isTeamEvent: false, minTeamSize: 2, maxTeamSize: 4,
        attachments: [],
      });
      setTemplateFile(null);
      const fileInput = document.getElementById('certificateTemplate');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Field config for the generic input loop ─────────────────
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

  // ── Render ──────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to submit a new event for approval</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">
          {/* ── Success banner ─────────────────────────────── */}
          {submitted && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Event submitted for approval!
            </div>
          )}

          {/* ── Error banner ──────────────────────────────── */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Generic text / number / date inputs ────── */}
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

            {/* ── Category select ─────────────────────────── */}
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

            {/* ── Rich Text Description ───────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Event Description
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm(prev => ({ ...prev, description: html }))}
              />
            </div>

            {/* ── Attachments Upload Section ──────────────── */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-800">Attachments & Resources</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload posters, important documents, or PPT templates (.png, .jpg, .pdf, .ppt, .pptx)
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-primary-300 rounded-xl text-primary-600 font-medium text-sm hover:bg-primary-50 transition-colors w-full sm:w-auto">
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose Files</span>
                  <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf,.ppt,.pptx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Selected Files List */}
              {form.attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {form.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm group"
                    >
                      <div className="w-8 h-8 rounded shrink-0 bg-primary-100 flex items-center justify-center text-primary-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-400">
                          {file.type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════════════
                TEAM EVENT SECTION
               ════════════════════════════════════════════════ */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-4 bg-gray-50/50">
              {/* Toggle row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersRound className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-gray-700">Team Event</span>
                </div>

                {/* Custom toggle switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isTeamEvent"
                    checked={form.isTeamEvent}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  {/* Track */}
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:bg-primary-600 transition-colors duration-200"></div>
                  {/* Thumb */}
                  <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                </label>
              </div>

              <p className="text-xs text-gray-400">
                Enable this if participants will register as a team rather than individually.
              </p>

              {/* Conditional team-size inputs */}
              {form.isTeamEvent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Min team size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Min Team Size
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="minTeamSize"
                        min={1}
                        value={form.minTeamSize}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Must be at least 1</p>
                  </div>

                  {/* Max team size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Max Team Size
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="maxTeamSize"
                        min={form.minTeamSize || 1}
                        value={form.maxTeamSize}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Must be ≥ min team size</p>
                  </div>
                </div>
              )}
            </div>

            {/* Certificate Template Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Certificate Template (Optional)
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Upload a certificate background image (PNG/JPG, max 5MB). Student names will be overlaid on this template.
              </p>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="certificateTemplate"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <FileUp className="w-4 h-4" />
                    {templateFile ? 'Change File' : 'Choose File'}
                  </label>
                  <input
                    id="certificateTemplate"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {templateFile && (
                    <span className="text-sm text-gray-500 truncate max-w-[200px]">
                      {templateFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Submit button ────────────────────────────── */}
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