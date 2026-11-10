import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusSquare,
  Calendar as CalendarIcon,
  BarChart3,
  Scale,
  History as HistoryIcon,
  Database,
  Settings as SettingsIcon,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sprout
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const [reportsOpen, setReportsOpen] = useState(true);

  const isReportsActive = location.pathname.startsWith('/reports');

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-sm">
          <Sprout className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">BiteLog</h1>
          <p className="text-[10px] text-emerald-700 font-bold leading-tight mt-0.5">Log every bite. Stay on track. Achieve your goal.</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 stroke-[2]" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/add-entry"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <PlusSquare className="w-4 h-4 stroke-[2]" />
          <span>Add Entry</span>
        </NavLink>

        <NavLink
          to="/calendar"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <CalendarIcon className="w-4 h-4 stroke-[2]" />
          <span>Calendar</span>
        </NavLink>

        {/* Reports with Submenu */}
        <div>
          <button
            type="button"
            onClick={() => setReportsOpen(!reportsOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isReportsActive
                ? 'bg-emerald-50/50 text-emerald-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 stroke-[2]" />
              <span>Reports</span>
            </div>
            {reportsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {reportsOpen && (
            <div className="pl-10 pr-2 py-1 space-y-1">
              {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map((p) => {
                const subPath = `/reports/${p.toLowerCase()}`;
                const isSubActive = location.pathname === subPath;
                return (
                  <NavLink
                    key={p}
                    to={subPath}
                    onClick={onCloseMobile}
                    className={`block py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isSubActive
                        ? 'text-emerald-600 font-semibold bg-emerald-50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {p}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        <NavLink
          to="/weight-goals"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <Scale className="w-4 h-4 stroke-[2]" />
          <span>Weight & Goals</span>
        </NavLink>

        <NavLink
          to="/history"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <HistoryIcon className="w-4 h-4 stroke-[2]" />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/backup"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <Database className="w-4 h-4 stroke-[2]" />
          <span>Backup & Restore</span>
        </NavLink>

        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <SettingsIcon className="w-4 h-4 stroke-[2]" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Bottom Privacy Card */}
      <div className="p-4 m-3 mt-auto bg-slate-50/80 rounded-2xl border border-slate-100/80">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-white rounded-lg shadow-2xs border border-slate-100 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900">All Data is Stored Locally</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Your data never leaves this device.</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

