import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  Award,
  Download,
  Upload,
  Settings,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileImage,
  Palette,
  Type,
  Move,
  Sparkles,
  AlertCircle,
  Eye,
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

const FONT_OPTIONS = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier', label: 'Courier' },
];

const STEPS = [
  { id: 1, label: 'Upload Template', icon: Upload },
  { id: 2, label: 'Generate', icon: Sparkles },
  { id: 3, label: 'Download', icon: Download },
];

export default function GenerateCertificates() {
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  // Template & Settings
  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreview, setTemplatePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    namePositionX: 50,
    namePositionY: 50,
    fontSize: 40,
    fontFamily: 'Helvetica',
    textColor: '#000000',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Preview
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewIsPdf, setPreviewIsPdf] = useState(false);
  const [sampleName, setSampleName] = useState('John Doe');

  // Generation
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [attendeeCount, setAttendeeCount] = useState(0);

  // Generated certs
  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  const [error, setError] = useState('');

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

  // Fetch settings & certificates when event changes
  const fetchEventData = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      // Fetch existing settings
      const { data: settingsData } = await API.get(`/certificates/settings/${eventId}`);
      if (settingsData && settingsData.templatePath) {
        setSettings({
          namePositionX: settingsData.namePositionX ?? 50,
          namePositionY: settingsData.namePositionY ?? 50,
          fontSize: settingsData.fontSize ?? 40,
          fontFamily: settingsData.fontFamily ?? 'Helvetica',
          textColor: settingsData.textColor ?? '#000000',
        });
        // Use Cloudinary URL for template preview if available
        setTemplatePreview(
          settingsData.templateType !== 'pdf' && settingsData.templateCloudinaryUrl
            ? settingsData.templateCloudinaryUrl
            : ''
        );
      } else {
        setTemplatePreview('');
        setSettings({
          namePositionX: 50,
          namePositionY: 50,
          fontSize: 40,
          fontFamily: 'Helvetica',
          textColor: '#000000',
        });
      }

      // Fetch attendee count
      try {
        const { data: attData } = await API.get(`/attendance/${eventId}`);
        setAttendeeCount(attData.filter((a) => a.status === 'present').length);
      } catch {
        setAttendeeCount(0);
      }

      // Fetch existing generated certificates
      try {
        const { data: certsData } = await API.get(`/certificates/event/${eventId}`);
        setCertificates(certsData);
      } catch {
        setCertificates([]);
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
    }
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setStep(1);
      setGenerationResult(null);
      setError('');
      setTemplateFile(null);
      setSettingsSaved(false);
      fetchEventData(selectedEvent);
    }
  }, [selectedEvent, fetchEventData]);

  /* ───────── HANDLERS ───────── */

  const handleTemplateUpload = async () => {
    if (!templateFile || !selectedEvent) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('template', templateFile);
      const { data } = await API.post(`/certificates/upload-template/${selectedEvent}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Show preview for images using Cloudinary URL
      if (data.settings.templateType !== 'pdf' && data.settings.templateCloudinaryUrl) {
        setTemplatePreview(data.settings.templateCloudinaryUrl);
      } else {
        setTemplatePreview('');
      }

      setTemplateFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError('');
    try {
      await API.put(`/certificates/settings/${selectedEvent}`, settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    setError('');
    setPreviewUrl('');
    try {
      // Save settings first, then generate preview
      await API.put(`/certificates/settings/${selectedEvent}`, settings);
      const { data } = await API.post(`/certificates/preview/${selectedEvent}`, {
        sampleName: sampleName || 'John Doe',
        ...settings,
      });
      // Preview is served locally from backend
      setPreviewUrl(`${BACKEND_URL}${data.previewUrl}?t=${Date.now()}`);
      setPreviewIsPdf(!!data.isPdf);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate preview');
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setGenerationResult(null);
    try {
      const { data } = await API.post(`/certificates/generate/${selectedEvent}`);
      setGenerationResult(data);
      // Refresh certificates list
      const { data: certsData } = await API.get(`/certificates/event/${selectedEvent}`);
      setCertificates(certsData);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate certificates');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (certId, studentName) => {
    // Use backend proxy to download — avoids Cloudinary CORS issues
    const token = localStorage.getItem('token');
    const downloadUrl = `${BACKEND_URL}/api/certificates/download/${certId}`;
    
    // Create a temporary link with auth token
    const link = document.createElement('a');
    link.href = downloadUrl + `?token=${token}`;
    link.download = `certificate-${studentName.replace(/\s+/g, '_')}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ───────── RENDER ───────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="w-7 h-7 text-amber-500" />
          Generate Certificates
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a template, configure text settings, and generate personalised certificates
        </p>
      </div>

      {/* Event Selector */}
      <div className="mb-8 max-w-md">
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

      {selectedEvent && (
        <>
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isComplete = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(s.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200'
                        : isComplete
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ───────── STEP 1: Upload Template & Settings ───────── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Upload Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <FileImage className="w-5 h-5 text-amber-500" />
                  Upload Certificate Template
                </h2>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 w-full">
                    <label className="block">
                      <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl hover:border-amber-400 transition-colors cursor-pointer bg-gray-50/50">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            {templateFile ? templateFile.name : 'Click to select PNG, JPG, or PDF'}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                  <button
                    onClick={handleTemplateUpload}
                    disabled={!templateFile || uploading}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>

                {/* Template Preview */}
                {templatePreview && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Template Preview</p>
                    <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 max-w-lg">
                      <img
                        src={templatePreview}
                        alt="Certificate Template"
                        className="w-full h-auto"
                        onError={() => setTemplatePreview('')}
                      />
                      {/* Position indicator dot */}
                      <div
                        className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                        style={{
                          left: `${settings.namePositionX}%`,
                          top: `${settings.namePositionY}%`,
                        }}
                        title="Name position"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-5">
                  <Settings className="w-5 h-5 text-amber-500" />
                  Text Placement Settings
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Position X */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Move className="w-3.5 h-3.5 text-gray-400" />
                      Position X (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.namePositionX}
                      onChange={(e) => setSettings({ ...settings, namePositionX: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  {/* Position Y */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Move className="w-3.5 h-3.5 text-gray-400" />
                      Position Y (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.namePositionY}
                      onChange={(e) => setSettings({ ...settings, namePositionY: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Type className="w-3.5 h-3.5 text-gray-400" />
                      Font Size (px)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={settings.fontSize}
                      onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Type className="w-3.5 h-3.5 text-gray-400" />
                      Font Family
                    </label>
                    <div className="relative">
                      <select
                        value={settings.fontFamily}
                        onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm appearance-none bg-white"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Palette className="w-3.5 h-3.5 text-gray-400" />
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={settings.textColor}
                        onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>

                {/* Sample Name + Preview Button Row */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-4">
                    <div className="flex-1 w-full sm:max-w-xs">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        Sample Name for Preview
                      </label>
                      <input
                        type="text"
                        value={sampleName}
                        onChange={(e) => setSampleName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={handlePreview}
                      disabled={previewing}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:from-cyan-600 hover:to-blue-600 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {previewing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      {previewing ? 'Generating...' : 'Preview Certificate'}
                    </button>
                  </div>

                  {/* Preview Result */}
                  {previewUrl && (
                    <div className="mb-5 animate-in fade-in duration-300">
                      <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Certificate Preview</p>
                      <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 max-w-2xl shadow-sm">
                        {previewIsPdf ? (
                          <iframe
                            src={previewUrl}
                            title="Certificate Preview"
                            className="w-full border-0"
                            style={{ height: '500px' }}
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt="Certificate Preview"
                            className="w-full h-auto"
                            onError={() => setPreviewUrl('')}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Showing preview with name: <span className="font-semibold text-gray-600">"{sampleName || 'John Doe'}"</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingSettings ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </button>

                  {settingsSaved && (
                    <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium animate-in fade-in duration-300">
                      <CheckCircle className="w-4 h-4" /> Saved!
                    </span>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    className="ml-auto px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ───────── STEP 2: Generate ───────── */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/50">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">Ready to Generate</h2>
                <p className="text-gray-500 text-sm mb-6">
                  {attendeeCount > 0 ? (
                    <>
                      <span className="font-semibold text-gray-700">{attendeeCount}</span> attendees
                      marked present will receive personalised certificates.
                    </>
                  ) : (
                    'No present attendees found. Please mark attendance first.'
                  )}
                </p>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={handleGenerate}
                    disabled={generating || attendeeCount === 0}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-amber-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Certificates
                      </>
                    )}
                  </button>
                </div>

                {generationResult && (
                  <div className="mt-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium border border-emerald-100 inline-flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {generationResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────── STEP 3: Download Certificates ───────── */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Generated Certificates ({certificates.length})
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                >
                  ← Back to Settings
                </button>
              </div>

              {loadingCerts ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
              ) : certificates.length > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 text-gray-500 text-left">
                          <th className="px-6 py-4 font-semibold">#</th>
                          <th className="px-6 py-4 font-semibold">Student Name</th>
                          <th className="px-6 py-4 font-semibold">Email</th>
                          <th className="px-6 py-4 font-semibold">Issued</th>
                          <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {certificates.map((cert, idx) => (
                          <tr key={cert._id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">
                              {cert.studentName || cert.userId?.name || '—'}
                            </td>
                            <td className="px-6 py-4 text-gray-500">{cert.userId?.email || '—'}</td>
                            <td className="px-6 py-4 text-gray-500">
                              {cert.issuedAt
                                ? new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() =>
                                  handleDownload(
                                    cert._id,
                                    cert.studentName || cert.userId?.name || 'certificate'
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-orange-600 active:scale-[0.97] transition-all shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 mt-8 bg-white rounded-2xl border border-gray-100 p-12">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm">No certificates generated yet. Go back and generate them.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
