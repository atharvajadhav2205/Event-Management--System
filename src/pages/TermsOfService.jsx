import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10 border-b border-slate-100 pb-6">Last Updated: {currentDate}</p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <p>Welcome to EventHub! These Terms of Service ("Terms") govern your access to and use of the EventHub website, application, and services (collectively, the "Platform"). By creating an account or using the Platform, you agree to be bound by these Terms.</p>
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Account Registration and Roles</h2>
            <p className="mb-2">To use certain features of EventHub, you must register for an account. We offer different account types:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Students/Candidates:</strong> Users seeking to discover and participate in events, competitions, and internships.</li>
              <li><strong>Organisers:</strong> Users who create, manage, and host events on the Platform.</li>
              <li><strong>Admins:</strong> Platform administrators overseeing Organisers and general platform operations.</li>
            </ul>
            <p>You agree to provide accurate, complete, and updated information during registration. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. User Conduct</h2>
            <p className="mb-2">You agree to use EventHub only for lawful purposes. You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide false or misleading information.</li>
              <li>Impersonate any person or entity, or falsely state your affiliation with an Organiser or institution.</li>
              <li>Interfere with or disrupt the operation of the Platform or the servers hosting it.</li>
              <li>Scrape, data-mine, or extract data from the Platform without our explicit written permission.</li>
              <li>Post or transmit any content that is offensive, discriminatory, harmful, or violates the intellectual property rights of others.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Event Creation and Participation</h2>
            <p className="mb-2"><strong>For Organisers:</strong> You are solely responsible for the events you create, including the accuracy of the event details, rules, and the fulfillment of any promised rewards or certificates.</p>
            <p><strong>For Students:</strong> EventHub is a facilitator. We do not guarantee the quality, safety, or legality of any events hosted by third-party Organisers. Your participation in any event is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Intellectual Property</h2>
            <p className="mb-2"><strong>EventHub's Rights:</strong> All platform design, text, graphics, logos, and software are the property of EventHub and are protected by intellectual property laws.</p>
            <p><strong>User Content:</strong> By posting content (e.g., event banners, project submissions) on EventHub, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content to operate and promote the Platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Platform, us, or third parties, or for any other reason.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, EventHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
