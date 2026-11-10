import React from 'react';
import { Bell, Settings, Sun, Menu, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopNavProps {
  onOpenMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileMenu }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-900 text-base">BiteLog</span>
      </div>

      {/* Desktop Left: Breadcrumb or spacer */}
      <div className="hidden md:flex items-center gap-2">
        {/* Can remain clean and minimal */}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* 100% Offline Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>100% Offline</span>
        </div>

        {/* Theme Toggle (Sun) */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Light Theme active"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
        </button>

        {/* Settings Shortcut */}
        <Link
          to="/settings"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* User Profile Pill */}
        <Link
          to="/settings"
          className="hidden sm:flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full border border-slate-100 hover:bg-slate-50 transition-colors"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
            alt="You"
            className="w-7 h-7 rounded-full object-cover"
            onError={(e) => {
              // Fallback to local colored avatar if offline
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center -ml-2 sm:ml-0">
            Y
          </div>
          <div className="flex flex-col text-left pr-2">
            <span className="text-xs font-semibold text-slate-800 leading-none">You</span>
            <span className="text-[10px] text-emerald-600 font-medium">Premium</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

