import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  Award,
  PlusCircle,
  UserCheck,
  FileBadge,
  ShieldCheck,
  BarChart3,
  LogOut,
  X,
  Ticket,
  ScanLine,
  Home,
} from 'lucide-react';

const menuMap = {
  student: [
    { label: 'View Events', path: 'events', icon: CalendarDays },
    { label: 'Applied Events', path: 'applied', icon: ClipboardCheck },
    { label: 'Event Tickets', path: 'tickets', icon: Ticket },
    { label: 'Certificates', path: 'certificates', icon: Award },
  ],
  organiser: [
    { label: 'Create Event', path: 'create-event', icon: PlusCircle },
    { label: 'My Events', path: 'my-events', icon: CalendarDays },
    { label: 'View Attendance', path: 'attendance', icon: UserCheck },
    { label: 'Scan Tickets', path: 'scan-tickets', icon: ScanLine },
    { label: 'Generate Certificates', path: 'generate-certificates', icon: FileBadge },
  ],
  admin: [
    { label: 'Approve Events', path: 'approve-events', icon: ShieldCheck },
    { label: 'Event Analytics', path: 'analytics', icon: BarChart3 },
  ],
};

export default function Sidebar({ role, open, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const items = menuMap[role] || [];

  const handleLogout = () => {
    logout(); // Clear auth state and localStorage
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
          <div className="flex items-center">
             <img src="/logo.png" alt="EventHub Logo" className="h-14 object-contain mix-blend-multiply origin-left scale-110 object-left" />
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={() => {
              navigate('/');
              if (onClose) onClose();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all duration-150"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
