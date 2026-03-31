import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CheckCircle2, ChevronDown, Loader2, XCircle } from 'lucide-react';

export default function ScanTickets() {
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null); // { success: true/false, message: '' }
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleScan = async (result) => {
    // result is usually an array of detected codes in newer versions of @yudiel/react-qr-scanner
    // we take the first value
    const text = Array.isArray(result) ? result[0]?.rawValue : result;
    
    if (!text || isProcessing || !selectedEvent) return;

    try {
      setIsProcessing(true);
      
      // QR code data format: "eventId-userId"
      const parts = text.split('-');
      if (parts.length !== 2) {
        throw new Error("Invalid Ticket QR Format");
      }
      
      const scannedEventId = parts[0];
      const scannedUserId = parts[1];

      if (scannedEventId !== selectedEvent) {
        throw new Error("This ticket is for a different event!");
      }

      // Automatically mark attendance as present
      await API.post('/attendance/mark', {
        eventId: selectedEvent,
        records: [
          {
            userId: scannedUserId,
            status: 'present',
          }
        ],
      });

      setScanResult({
        success: true,
        message: 'Attendee successfully marked present!'
      });

    } catch (err) {
      console.error(err);
      setScanResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Error scanning ticket'
      });
    } finally {
      // Clear message and allow scanning again after 3 seconds
      setTimeout(() => {
        setScanResult(null);
        setIsProcessing(false);
      }, 3000);
    }
  };

  const handleScanError = (error) => {
    // Optional: handle permission denied, etc.
    console.error(error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Scan Digital Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select an event and use your camera to scan student passes
        </p>
      </div>

      {/* Event Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Event to Scan For</label>
        <div className="relative">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm appearance-none bg-white shadow-sm"
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

      {selectedEvent ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 flex flex-col items-center">
          
          {/* Status Message */}
          <div className="h-16 w-full mb-4 flex items-center justify-center">
            {scanResult ? (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-sm text-sm font-medium w-full justify-center ${
                scanResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {scanResult.success ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {scanResult.message}
              </div>
            ) : (
              <div className="text-sm text-gray-400 bg-gray-50 px-4 py-3 rounded-xl w-full text-center border border-gray-100">
                {isProcessing ? 'Processing ticket...' : 'Point your camera at the QR code'}
              </div>
            )}
          </div>

          {/* Scanner Window */}
          <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-inner border-4 border-gray-100 flex items-center justify-center relative">
            <Scanner
              onScan={handleScan}
              onError={handleScanError}
              constraints={{ facingMode: 'environment' }} 
              paused={isProcessing}
              styles={{ container: { width: '100%', height: '100%' } }}
            />
            
            {/* Overlay Grid */}
            <div className="absolute inset-0 border-[32px] border-black/40 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-primary-500/50 border-dashed rounded-xl pointer-events-none"></div>
          </div>
          
          <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
            Make sure the entire QR code fits within the scanning area. The scanner works best in well-lit environments.
          </p>

        </div>
      ) : (
        <div className="text-center bg-white p-10 rounded-3xl border border-gray-100 shadow-sm mt-4 text-gray-400">
          <p>Please select an event above to start scanning tickets.</p>
        </div>
      )}
    </div>
  );
}
