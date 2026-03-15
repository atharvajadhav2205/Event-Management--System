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

        {/* Search bar (desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            className="bg-transparent outline-none text-sm text-gray-600 w-full placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${badgeColor}`}>
          {displayRole}
        </div>

        <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
