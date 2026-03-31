import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Loader2, Calendar, MapPin, Clock, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function MyTickets() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get('/events/applied');
        setEvents(data);
      } catch (err) {
        console.error('Error fetching applied events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getTicketStatus = (eventDate, eventTime) => {
    try {
      const eventDateTimeString = `${eventDate}T${eventTime}`;
      const eventDateTime = new Date(eventDateTimeString);
      const currentTime = new Date();
      
      const diffInMs = currentTime - eventDateTime;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours > 1) {
        return 'expired';
      }
      return 'active';
    } catch (e) {
      console.error("Date calculation error", e);
      return 'active';
    }
  };

  const handleDownloadPDF = async (eventId, eventTitle) => {
    const ticketElement = document.getElementById(`ticket-${eventId}`);
    if (!ticketElement) return;

    setDownloadingId(eventId);
    try {
      const canvas = await html2canvas(ticketElement, { 
        scale: 2,
        useCORS: true, 
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height] // Perfectly fit the ticket
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${eventTitle.replace(/\s+/g, '_')}_Ticket.pdf`);
    } catch (error) {
      console.error('Failed to generate ticket PDF', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Event Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">
          Download your tickets as PDFs or show the QR code at the venue.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mt-4 text-gray-400">
          <p>You haven't applied to any events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const status = getTicketStatus(event.date, event.time);
            const isExpired = status === 'expired';
            const ticketId = `${event._id}-${event.userRegistrationInfo?.userId || 'unknown'}`;
            const isDownloading = downloadingId === event._id;

            return (
              <div 
                key={event._id} 
                className={`flex flex-col relative transition-all ${isExpired ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                {/* Visual wrapper for PDF Capture */}
                <div 
                  id={`ticket-${event._id}`}
                  className="bg-white rounded-2xl border border-primary-100 shadow-card overflow-hidden flex-1"
                >
                  {/* Header */}
                  <div className={`${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary-800'} px-6 py-4 flex justify-between items-center`}>
                    <h3 className="font-semibold truncate pr-4">{event.title}</h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                      isExpired ? 'bg-gray-200 border-gray-300 text-gray-600' : 'bg-primary-100 border-primary-200 text-primary-700'
                    }`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    {/* QR Code Section */}
                    <div className="flex flex-col items-center justify-center mb-6">
                      {isExpired ? (
                        <div className="w-40 h-40 bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-medium">
                          Ticket Expired
                        </div>
                      ) : (
                        <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-xl">
                          <QRCodeSVG
                            value={ticketId}
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"M"}
                          />
                        </div>
                      )}
                      {!isExpired && (
                        <p className="text-[10px] text-gray-400 font-mono mt-2 tracking-wider">
                          {ticketId.substring(0, 12)}...
                        </p>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-sm border-t border-gray-100 pt-5">
                      <p className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <span className="font-medium">{event.date}</span>
                      </p>
                      <p className="flex items-center gap-3 text-gray-600">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="font-medium">{event.time}</span>
                      </p>
                      <p className="flex items-center gap-3 text-gray-600">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="truncate font-medium">{event.location}</span>
                      </p>
                    </div>

                    {/* Organizer/Attendee metadata */}
                    <div className="mt-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                       <p className="text-xs text-gray-500 mb-1">
                         <span className="font-medium text-gray-700">Ticket Holder: </span> 
                         {event.userRegistrationInfo?.participantName || event.userRegistrationInfo?.teamName || 'Attendee'}
                       </p>
                       {event.organiserId?.name && (
                         <p className="text-xs text-gray-500">
                           <span className="font-medium text-gray-700">Organized by: </span> 
                           {event.organiserId.name}
                         </p>
                       )}
                    </div>
                  </div>
                </div>

                {/* Download Button (Placed outside the capture rect so it doesn't show in PDF, or if it's inside, we can conditionally hide it) */}
                <button
                  onClick={() => handleDownloadPDF(event._id, event.title)}
                  disabled={isDownloading || isExpired}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isExpired 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow active:scale-[0.98]'
                  }`}
                >
                  {isDownloading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
                  ) : (
                    <><Download className="w-4 h-4" /> Download Ticket</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
