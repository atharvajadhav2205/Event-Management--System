import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LandingPage from './pages/LandingPage';
import DeveloperPage from './pages/DeveloperPage';
import DashboardLayout from './components/DashboardLayout';

// Student
import ViewEvents from './pages/student/ViewEvents';
import AppliedEvents from './pages/student/AppliedEvents';
import Certificates from './pages/student/Certificates';
import MyTickets from './pages/student/MyTickets';

// Admin
import ApproveEvents from './pages/admin/ApproveEvents';
import EventAnalytics from './pages/admin/EventAnalytics';

// Organiser
import CreateEvent from './pages/organiser/CreateEvent';
import ManageEvents from './pages/organiser/ManageEvents';
import MarkAttendance from './pages/organiser/MarkAttendance';
import GenerateCertificates from './pages/organiser/GenerateCertificates';
import ScanTickets from './pages/organiser/ScanTickets';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Optionally checks if user has the required role.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/developer" element={<DeveloperPage />} />

      {/* Dashboard shell — :role = student | organiser | admin */}
      <Route
        path="/:role"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Student */}
        <Route path="events" element={<ViewEvents />} />
        <Route path="applied" element={<AppliedEvents />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="certificates" element={<Certificates />} />

        {/* Admin */}
        <Route path="approve-events" element={<ApproveEvents />} />
        <Route path="analytics" element={<EventAnalytics />} />

        {/* Organiser */}
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="my-events" element={<ManageEvents />} />
        <Route path="attendance" element={<MarkAttendance />} />
        <Route path="scan-tickets" element={<ScanTickets />} />
        <Route path="generate-certificates" element={<GenerateCertificates />} />

        {/* Default redirect for each role */}
        <Route index element={<RoleIndex />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RoleIndex() {
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'student') return <Navigate to="events" replace />;
  if (role === 'admin') return <Navigate to="approve-events" replace />;
  if (role === 'organiser') return <Navigate to="create-event" replace />;
  return <Navigate to="events" replace />;
}