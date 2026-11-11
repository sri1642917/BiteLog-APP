import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronLeft, Sprout, User as UserIcon, LogOut } from 'lucide-react';
import { authService, User } from '../services/authService';

interface MobileTopHeaderProps {
  onOpenMenu: () => void;
}

export const MobileTopHeader: React.FC<MobileTopHeaderProps> = ({ onOpenMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('bitelog_auth_changed', handleAuthChange);
    return () => window.removeEventListener('bitelog_auth_changed', handleAuthChange);
  }, []);

  const isDashboard = location.pathname === '/';

  // Get screen title for non-dashboard pages
  const getTitle = () => {
    if (location.pathname.startsWith('/add-entry')) return 'Add Entry';
    if (location.pathname.startsWith('/calendar')) return 'Calendar';
    if (location.pathname.startsWith('/reports')) return 'Reports';
    if (location.pathname.startsWith('/weight-goals')) return 'Weight & Goals';
    if (location.pathname.startsWith('/history')) return 'History';
    if (location.pathname.startsWith('/backup')) return 'Backup & Restore';
    if (location.pathname.startsWith('/settings')) return 'Settings';
    if (location.pathname.startsWith('/about')) return 'About the Creator';
    if (location.pathname.startsWith('/register')) return 'Register';
    if (location.pathname.startsWith('/login')) return 'Sign In';
    if (location.pathname.startsWith('/forgot-password')) return 'Forgot Password?';
    return 'BiteLog';
  };

  if (isDashboard) {
    return (
      <header className="h-16 pt-[env(safe-area-inset-top,0px)] px-4 sm:px-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 select-none shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Sprout className="w-4 h-4 fill-emerald-500/20 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">
                BiteLog
              </h1>
              <p className="text-[8.5px] text-emerald-700 font-bold mt-0.5 tracking-tight leading-tight truncate max-w-[150px]">
                Log every bite. Stay on track.
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Bell icon + Sign In / User profile pill (Matching signin-feature-icon-ui-design-5.png) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-1.5 right-1.5"></span>
          </button>

          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span className="max-w-[65px] truncate">{currentUser.full_name.split(' ')[0]}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium">Logged in</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser.full_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      authService.logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-1.5"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Pill button: [ 👤 Sign In ] (Exact match to Design 5) */
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="h-14 pt-[env(safe-area-inset-top,0px)] px-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 select-none shrink-0">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center"
        aria-label="Go Back to Dashboard"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      <h2 className="text-sm font-bold text-slate-900 tracking-tight">{getTitle()}</h2>

      <div className="w-8"></div>
    </header>
  );
};


