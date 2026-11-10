import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Dumbbell,
  Scale,
  Calendar,
  BarChart3,
  PlusSquare,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardSummary } from '../types';

// Zero initial state: completely clean, no mock or random data
const ZERO_SUMMARY: DashboardSummary = {
  date: new Date().toISOString().split('T')[0],
  today_calories: {
    total: 0,
    target: 2200,
    percentage: 0,
    remaining: 2200,
    exceeded: 0,
  },
  today_protein: {
    total: 0,
    target: 100,
    percentage: 0,
    remaining: 100,
    exceeded: 0,
  },
  weight: {
    current: 72.0,
    target: 65.0,
    progress_percentage: 35,
  },
  entries_summary: {
    count: 0,
    last_entry_time: 'None',
  },
  recent_entries: [],
};

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>(ZERO_SUMMARY);

  const loadData = async () => {
    try {
      const sumRes = await api.getDashboardSummary();
      if (sumRes) {
        setSummary(sumRes);
      }
    } catch (err) {
      console.warn('Backend loading in background; using clean zero state.', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasEntries = summary.today_calories.total > 0 || summary.today_protein.total > 0 || summary.entries_summary.count > 0;
  const calPercent = Math.min(100, Math.round(summary.today_calories.percentage));
  const protPercent = Math.min(100, Math.round(summary.today_protein.percentage));

  // Filter only today's entries from recent entries list if present
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntries = summary.recent_entries.filter(e => e.date === todayStr || e.date === 'Today');

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* ================= REPHRASED TOP MOTIVATIONAL BANNER ================= */}
      {!hasEntries ? (
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 fill-white/20 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Ready to Track Today?
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Every goal begins with your first meal. Once you add your entries, this dashboard will visualize your daily calorie & protein progress.
              </p>
              <Link
                to="/add-entry"
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log Today's First Meal</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100/80 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-900">
              {summary.entries_summary.count} {summary.entries_summary.count === 1 ? 'meal' : 'meals'} logged today
            </span>
          </div>
          <Link to="/add-entry" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            <span>+ Add More</span>
          </Link>
        </div>
      )}

      {/* ================= 1. TODAY'S CALORIES CARD (Clean 0 State) ================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <Flame className="w-5 h-5 fill-orange-500/20 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Calories</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {Math.round(summary.today_calories.total).toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-500">kcal</span>
            </h3>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span>{calPercent}% of {summary.today_calories.target.toLocaleString()} kcal</span>
            <span>{Math.round(summary.today_calories.remaining).toLocaleString()} kcal left</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, calPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ================= 2. TODAY'S PROTEIN CARD (Clean 0 State) ================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Dumbbell className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Protein</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {Math.round(summary.today_protein.total)}{' '}
              <span className="text-sm font-normal text-slate-500">g</span>
            </h3>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span>{protPercent}% of {summary.today_protein.target} g</span>
            <span>{Math.round(summary.today_protein.remaining)} g left</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, protPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ================= 3. 2X2 QUICK ACTION SHORTCUTS (Matching ui-design-1.png Mobile Screen 1) ================= */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Add Entry */}
        <Link
          to="/add-entry"
          className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 border border-slate-100 shadow-2xs">
            <PlusSquare className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-slate-800">Add Entry</span>
        </Link>

        {/* Calendar */}
        <Link
          to="/calendar"
          className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100 shadow-2xs">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-slate-800">Calendar</span>
        </Link>

        {/* Reports */}
        <Link
          to="/reports/weekly"
          className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-orange-500 border border-slate-100 shadow-2xs">
            <BarChart3 className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-slate-800">Reports</span>
        </Link>

        {/* Weight & Goals */}
        <Link
          to="/weight-goals"
          className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-purple-600 border border-slate-100 shadow-2xs">
            <Scale className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-slate-800">Weight & Goals</span>
        </Link>
      </div>

      {/* ================= 4. TODAY'S ENTRIES LIST (Pure Clean State) ================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Today's Meals</h4>
          {hasEntries && (
            <Link to="/history" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <span>View History</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {todayEntries.length === 0 ? (
          <div className="py-6 px-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200 flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <UtensilsCrossed className="w-4 h-4 stroke-[1.8]" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No meals logged yet today</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[220px]">
              Analyze a meal photo, upload a screenshot, or paste text to start tracking your daily progress.
            </p>
            <Link
              to="/add-entry"
              className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              + Add Entry
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {entry.meal_type || 'Meal'}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {entry.calories_kcal} <span className="text-[10px] font-normal text-slate-500">kcal</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    {entry.protein_g}g
                  </span>
                  {entry.fiber_g && entry.fiber_g > 0 ? (
                    <span className="text-[10px] font-semibold text-blue-600">
                      {entry.fiber_g}g fib
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">{entry.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
