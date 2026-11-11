import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { MobileStatusBar } from './components/MobileStatusBar';
import { MobileTopHeader } from './components/MobileTopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './pages/Dashboard';
import { AddEntry } from './pages/AddEntry';
import { CalendarView } from './pages/CalendarView';
import { Reports } from './pages/Reports';
import { WeightGoals } from './pages/WeightGoals';
import { History } from './pages/History';
import { BackupRestore } from './pages/BackupRestore';
import { Settings } from './pages/Settings';
import { AboutCreator } from './pages/AboutCreator';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { authService } from './services/authService';
import { Scale, History as HistoryIcon, Database, Settings as SettingsIcon, User, X } from 'lucide-react';

export const App: React.FC = () => {
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  useEffect(() => {
    // Restore persistent session on app start across background kills or phone reboot
    authService.initSession();
  }, []);

  return (
    <Router>
      {/* Background canvas styling: on mobile fills 100% screen edge-to-edge; on desktop centers a phone frame */}
      <div className="w-full h-[100dvh] min-h-screen bg-[#f8fafc] sm:bg-slate-100 flex items-center justify-center sm:p-4 overflow-hidden">
        {/* ================= RESPONSIVE MOBILE APP VIEWPORT ================= */}
        <div className="w-full h-full sm:h-[92vh] sm:max-w-[440px] bg-[#f8fafc] sm:rounded-[40px] sm:shadow-[0_25px_70px_rgba(0,0,0,0.18)] sm:border-[8px] sm:border-slate-900 flex flex-col relative overflow-hidden">
          {/* Top Mobile Status Bar (Rendered only on desktop preview, hidden on native mobile/Android) */}
          <MobileStatusBar />

          {/* Top Mobile App Header */}
          <MobileTopHeader onOpenMenu={() => setMoreDrawerOpen(true)} />

          {/* Main Mobile Screen Viewport (Scrollable with touch momentum) */}
          <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 overscroll-contain">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-entry" element={<AddEntry />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/reports" element={<Navigate to="/reports/weekly" replace />} />
              <Route path="/reports/:periodParam" element={<Reports />} />
              <Route path="/weight-goals" element={<WeightGoals />} />
              <Route path="/history" element={<History />} />
              <Route path="/backup" element={<BackupRestore />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<AboutCreator />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Mobile Bottom Navigation (Always Visible) */}
          <MobileBottomNav onOpenMore={() => setMoreDrawerOpen(true)} />

          {/* Mobile "More" Drawer Modal */}
          {moreDrawerOpen && (
            <div className="fixed sm:absolute inset-0 z-50 flex flex-col justify-end">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={() => setMoreDrawerOpen(false)}
              />
              <div className="relative bg-white rounded-t-3xl p-5 space-y-4 z-10 shadow-2xl pb-[max(env(safe-area-inset-bottom,0px),2rem)] animate-in slide-in-from-bottom duration-200">
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto" />
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">App Navigation</h3>
                  <button
                    type="button"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <Link
                    to="/weight-goals"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-slate-800 text-xs font-semibold hover:bg-slate-100"
                  >
                    <Scale className="w-4 h-4 text-purple-600" />
                    <span>Weight & Goals</span>
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-slate-800 text-xs font-semibold hover:bg-slate-100"
                  >
                    <HistoryIcon className="w-4 h-4 text-blue-600" />
                    <span>History</span>
                  </Link>

                  <Link
                    to="/backup"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-slate-800 text-xs font-semibold hover:bg-slate-100"
                  >
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Backup & Clean</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-slate-800 text-xs font-semibold hover:bg-slate-100"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-600" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    to="/about"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5 text-emerald-900 text-xs font-semibold hover:bg-emerald-100/80 col-span-2"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>About the Creator</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Router>
  );
};
