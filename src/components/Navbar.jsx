import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleBadgeColors = {
  student: 'bg-blue-100 text-blue-700',
  organiser: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-amber-100 text-amber-700',
};

export default function Navbar({ role, onMenuToggle }) {
  const { user } = useAuth();
  const badgeColor = roleBadgeColors[role] || 'bg-gray-100 text-gray-700';
  const displayRole = role.charAt(0).toUpperCase() + role.slice(1);
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>


      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4">


        <div className="flex items-center gap-3 sm:border-l sm:border-gray-200 sm:pl-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-gray-800 leading-tight">
              {user?.name || 'Loading...'}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 px-2 py-0.5 rounded-md ${badgeColor}`}>
              {displayRole}
            </span>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/20 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
}
