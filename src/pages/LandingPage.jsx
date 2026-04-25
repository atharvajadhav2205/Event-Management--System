import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// --- Subcomponents for Interactivity ---

const TiltCard = ({ children, className }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12; // Max 12 deg tilt
    const rotateY = ((x - centerX) / centerX) * 12;

    gsap.to(card, {
      rotateX,
      rotateY,
      scale: 1.02,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)'
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
    </div>
  );
};



// Helper for Stars
const Stars = ({ count }) => (
  <div className="flex gap-1 mb-3">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-5 h-5 ${i < count ? 'text-slate-900' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const FEEDBACKS = [
  {
    id: 1,
    rating: 4,
    text: "EventHub transformed how our tech club manages hackathons. It's so easy to track registrations and issue certificates!",
    author: "Shivam Awate",
    time: "2 days ago",
    initial: "S",
    color: "bg-emerald-500"
  },
  {
    id: 2,
    rating: 5,
    text: "The platform is incredibly user-friendly. I've found three internships and attended two amazing workshops through EventHub.",
    author: "Kartiki Korade",
    time: "4 days ago",
    initial: "K",
    color: "bg-blue-500"
  },
  {
    id: 3,
    rating: 5,
    text: "Issuing verified certificates was always a headache, but EventHub makes it a one-click process. Highly recommended for all college societies.",
    author: "Sakshi Koshti",
    time: "1 week ago",
    initial: "S",
    color: "bg-indigo-500"
  },
  {
    id: 4,
    rating: 4,
    text: "Great interface and smooth experience. Love the real-time notifications for upcoming events on campus.",
    author: "Vaibhav Jadhav",
    time: "2 weeks ago",
    initial: "V",
    color: "bg-purple-500"
  },
  {
    id: 5,
    rating: 5,
    text: "Perfect for Indian classrooms and college societies. The analytics dashboard helps us understand our event reach perfectly.",
    author: "Shreyash Hingane",
    time: "3 weeks ago",
    initial: "S",
    color: "bg-teal-500"
  }
];

// --- Main Page Component ---

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);

  // Wait, I should not redirect if they are just visiting landing page
  // The user can now visit landing page while logged in.

  useEffect(() => {
    const fetchPublicEvents = async () => {
      try {
        const res = await API.get('/events/public');

        // Filter out past events (keep upcoming and live events)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate Date comparison

        const upcomingAndLiveEvents = res.data.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });

        // Sort events so the nearest upcoming events show first
        upcomingAndLiveEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        // You could slice here if you want a max number limit: upcomingAndLiveEvents.slice(0, 10)
        setEvents(upcomingAndLiveEvents);
      } catch (error) {
        console.error("Failed to load public events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicEvents();
  }, []);

  useGSAP(() => {
    // Hero Entry Animation
    gsap.fromTo('.hero-anim',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out', delay: 0.2 }
    );

    // Parallax Blobs
    gsap.to('.parallax-blob-1', {
      y: 300,
      ease: 'none',
      scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: 0.5 }
    });

    gsap.to('.parallax-blob-2', {
      y: -300,
      ease: 'none',
      scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: 0.5 }
    });

    // Features Section Stagger
    gsap.fromTo('.feature-anim',
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out',
        scrollTrigger: { trigger: '#features-section', start: 'top 75%' }
      }
    );

    // Events Stagger
    if (!loading && events.length > 0) {
      gsap.fromTo('.event-anim',
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '#events-section', start: 'top 75%' }
        }
      );
    }
  }, { scope: containerRef, dependencies: [loading, events.length] });

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <img src="/logo.png" alt="EventHub Logo" className="h-16 md:h-20 object-contain mix-blend-multiply hover:scale-105 transition-transform cursor-pointer" />
            </div>
            <div className="flex space-x-6 items-center">
              {user ? (
                <>
                  <span className="text-sm font-semibold text-slate-600 hidden sm:inline-block">Hi, {user.name}</span>
                  <button
                    onClick={() => navigate(`/${user.role}`)}
                    className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-500/0 hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login?redirect=/')}
                    className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md font-semibold transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/signup?redirect=/')}
                    className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-500/0 hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 -z-10" />

        {/* Parallax Background Blobs */}
        <div className="parallax-blob-1 absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-3xl -z-10" />
        <div className="parallax-blob-2 absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h1 className="hero-anim text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
            Discover & Manage <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Unforgettable Events
            </span>
          </h1>
          <p className="hero-anim mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-slate-500 mb-12 font-light">
            The all-in-one platform for organizers to host incredible events and students to upskill, participate, and earn verifiable certificates.
          </p>
          <div className="hero-anim flex justify-center gap-6 flex-col sm:flex-row">
            <button
              onClick={() => {
                document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300"
            >
              Explore Events
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-slate-700 rounded-full font-semibold text-lg border-2 border-slate-100 shadow-xl shadow-slate-200/20 hover:border-slate-200 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1"
            >
              Host an Event
            </button>
          </div>
        </div>
      </div>



      {/* Features Section (3D Tilt) */}
      <div id="features-section" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Everything you need</h2>
            <p className="mt-6 text-xl text-slate-500 max-w-3xl mx-auto">Powerful features tailored specifically for organizers and ambitious participants.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'Seamless Management', desc: 'Create events, manage registrations, and track powerful analytics all in one beautiful dashboard.', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
              { title: 'Verified Certificates', desc: 'Automatically generate and instantly distribute cryptographically verifiable certificates to attendees.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'Team Registrations', desc: 'Easily manage exact team formations, rigid sizes, and group submissions for competitive hackathons.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
            ].map((feature, i) => (
              <TiltCard key={i} className="feature-anim bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 group cursor-crosshair">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform-gpu">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg">{feature.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>

      {/* Events Display Section */}
      <div id="events-section" className="py-32 bg-white rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.02)] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">Upcoming Events</h2>
              <p className="mt-4 text-xl text-slate-500">Discover and immediately register for the latest approved events.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-white bg-slate-900 px-6 py-3 rounded-full font-semibold hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-2 group hover:-translate-y-1"
            >
              View All
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-32 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
              <p className="text-slate-500 text-xl font-medium">No public events available at the moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {events.map((evt) => (
                <TiltCard key={evt._id} className="event-anim bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col group cursor-pointer">
                  <div className="h-56 bg-slate-100 relative overflow-hidden">
                    {evt.posterUrl ? (
                      <img src={evt.posterUrl} alt={evt.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                        <span className="text-slate-400 font-medium text-lg">No Poster</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-white/95 backdrop-blur shadow-sm text-slate-900 rounded-full text-sm font-bold tracking-wide">
                        {evt.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow bg-white">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 truncate group-hover:text-blue-600 transition-colors">{evt.title}</h3>
                    <p className="text-slate-500 text-base mb-6 line-clamp-2">{evt.description ? evt.description.replace(/<[^>]+>/g, '') : ''}</p>
                    <div className="mt-auto space-y-3 mb-8 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        {evt.date} • {evt.time}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3.5 bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 font-bold rounded-xl transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                    >
                      Register Now
                    </button>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testimonials / Feedback Section */}
      <div className="py-24 bg-slate-50 overflow-hidden relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Real Stories, Real Impact</h2>
          <p className="mt-4 text-xl text-slate-500">Hear from people who use EventHub every day.</p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden flex pb-12">
          {/* Gradient Masks for smooth fading edges */}
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

          <div className="flex w-max animate-marquee gap-8 px-4 hover:animate-paused">
            {[...FEEDBACKS, ...FEEDBACKS].map((feedback, idx) => (
              <div key={`${feedback.id}-${idx}`} className="w-[350px] sm:w-[400px] bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col flex-shrink-0 cursor-default hover:-translate-y-3 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-300">
                <Stars count={feedback.rating} />
                <p className="text-slate-600 text-lg leading-relaxed mb-8 flex-grow italic">"{feedback.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${feedback.color}`}>
                    {feedback.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{feedback.author}</h4>
                    <span className="text-sm text-slate-500">{feedback.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Your Experience Section (Only for students or non-logged in users) */}
      {(!user || user.role === 'student') && (
        <div className="py-24 bg-white relative">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Share Your Experience</h2>
            <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-left relative group">
              <textarea
                id="feedback-text"
                rows={4}
                className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none mb-4 cursor-text"
                placeholder={user ? "Write your experience here..." : "Sign in to share your experience..."}
                onClick={() => !user && navigate('/login?redirect=/')}
                readOnly={!user}
              ></textarea>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login?redirect=/');
                    } else {
                      document.getElementById('feedback-text').value = '';
                      alert('Thank you for your feedback!');
                    }
                  }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-blue-600 shadow-lg shadow-slate-300 hover:shadow-blue-500/30 transition-all duration-300 transform group-hover:-translate-y-1"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
            <div className="bg-white/95 px-4 py-3 rounded-2xl shadow-xl">
              <img src="/logo.png" alt="EventHub Logo" className="h-16 md:h-20 object-contain mix-blend-multiply" />
            </div>
          </div>
          <span className="text-slate-500 text-center">© {new Date().getFullYear()} EventHub. All rights reserved.</span>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 font-medium text-center">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
