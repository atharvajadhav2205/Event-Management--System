import { useState, useRef, useEffect } from 'react';
import { Menu, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleBadgeColors = {
  student: 'bg-blue-100 text-blue-700',
  organiser: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-amber-100 text-amber-700',
};

export default function Navbar({ role, onMenuToggle }) {
  const { user, updateProfile } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  const dropdownRef = useRef(null);

  const badgeColor = roleBadgeColors[role] || 'bg-gray-100 text-gray-700';
  const displayRole = role.charAt(0).toUpperCase() + role.slice(1);
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  useEffect(() => {
    if (user) {
      setEditData({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setIsEditing(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile(editData.name, editData.phone);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="flex items-center justify-end relative" ref={dropdownRef}>
        <div 
          className="flex items-center gap-3 sm:border-l sm:border-gray-200 sm:pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
          onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            if(isProfileOpen) setIsEditing(false);
          }}
        >
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

        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div className="absolute top-16 right-0 w-72 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Profile Details</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Name</span>
                    <p className="font-medium text-gray-800">{user?.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Email</span>
                    <p className="font-medium text-gray-600">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Role</span>
                    <span className={`inline-block text-[10px] font-bold uppercase py-0.5 px-2 rounded-md ${badgeColor}`}>
                      {displayRole}
                    </span>
                  </div>
                  {user?.phone && (
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Phone Number</span>
                      <p className="font-medium text-gray-600">{user?.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Edit Profile</h3>
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(false);
                        setEditData({ name: user.name || '', phone: user.phone || '' });
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1.5">Name</label>
                    <input 
                      type="text" 
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1.5">Email <span className="text-[10px] font-normal text-gray-400">(Read-only)</span></label>
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      disabled
                      className="w-full text-sm px-3 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      placeholder="e.g. +1 234 567 890"
                    />
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editData.name.trim()}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
