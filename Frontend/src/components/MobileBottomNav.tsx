import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusSquare,
  Calendar,
  BarChart3,
  MoreHorizontal
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMore?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMore }) => {
  return (
    <nav className="fixed sm:absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] flex justify-around items-center z-30 shadow-lg shrink-0">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 stroke-[2]" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/add-entry"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <PlusSquare className="w-5 h-5 stroke-[2]" />
        <span>Add Entry</span>
      </NavLink>

      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <Calendar className="w-5 h-5 stroke-[2]" />
        <span>Calendar</span>
      </NavLink>

      <NavLink
        to="/reports/weekly"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <BarChart3 className="w-5 h-5 stroke-[2]" />
        <span>Reports</span>
      </NavLink>

      <button
        type="button"
        onClick={onOpenMore}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium text-slate-500 hover:text-slate-800"
      >
        <MoreHorizontal className="w-5 h-5 stroke-[2]" />
        <span>More</span>
      </button>
    </nav>
  );
};

