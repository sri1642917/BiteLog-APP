import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronLeft, Sprout } from 'lucide-react';

interface MobileTopHeaderProps {
  onOpenMenu: () => void;
}

export const MobileTopHeader: React.FC<MobileTopHeaderProps> = ({ onOpenMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
    return 'BiteLog';
  };

  if (isDashboard) {
    return (
      <header className="h-16 px-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-11 z-30 select-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
              BiteLog
            </h1>
            <p className="text-[9.5px] text-emerald-700 font-bold mt-1 tracking-tight leading-tight">
              Log every bite. Stay on track. Achieve your goal.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[2]" />
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-2 right-2"></span>
        </button>
      </header>
    );
  }

  return (
    <header className="h-14 px-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-11 z-30 select-none">
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

