import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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

        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10 border-b border-slate-100 pb-6">Last Updated: {currentDate}</p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <p>At EventHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Platform.</p>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
            <p className="mb-2">We collect information that identifies, relates to, describes, or could reasonably be linked, directly or indirectly, with you ("Personal Information").</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> When you register, we collect your Full Name, Email Address, Phone Number, Account Role (Student, Organiser, Admin), and encrypted password.</li>
              <li><strong>Profile Data:</strong> Information you choose to add to your profile, such as your educational background, skills, resume, or institution.</li>
              <li><strong>Usage Data:</strong> We automatically collect data on how you interact with our Platform, including your IP address, browser type, device information, pages visited, and the time and date of your visits.</li>
              <li><strong>Event Data:</strong> If you register for an event, we collect data related to your participation, submissions, and results.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
            <p className="mb-2">We use the collected information for various purposes, including to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, operate, and maintain our Platform.</li>
              <li>Process your account registration and manage your account.</li>
              <li>Facilitate event registrations and communication between Students and Organisers.</li>
              <li>Send you administrative emails, security alerts, and support messages.</li>
              <li>Improve our Platform layout, features, and overall user experience.</li>
              <li>Ensure platform security and prevent fraudulent activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Share Your Information</h2>
            <p className="mb-2">We do not sell your personal data. We may share your information in the following situations:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>With Event Organisers:</strong> When a Student registers for an event, we share their necessary profile information (e.g., Name, Email, Phone) with the specific Organiser hosting that event so they can manage participation.</li>
              <li><strong>With Service Providers:</strong> We may share data with third-party vendors who perform services for us (e.g., email delivery, hosting services, OTP verification via SMS).</li>
              <li><strong>For Legal Obligations:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to track the activity on our Platform and hold certain information to improve and analyze our service. You can instruct your browser to refuse all cookies, but some parts of the Platform may not function properly without them.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
            <p>We use administrative, technical, and physical security measures to help protect your Personal Information. However, no data transmission over the Internet or electronic storage system is 100% secure. While we strive to protect your data, we cannot guarantee its absolute security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Data Rights</h2>
            <p className="mb-2">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Opt-out of promotional communications at any time.</li>
            </ul>
            <p>To exercise any of these rights, please contact us using the information below.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Contact Us</h2>
            <p>If you have questions or comments about these policies, please contact us at:</p>
            <p className="mt-2">
              <strong>Email:</strong> eventhubsupport@gmail.com<br />

            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
