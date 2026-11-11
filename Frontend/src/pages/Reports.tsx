import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Dumbbell,
  Sprout,
  Target,
  Download,
  FileText,
  Printer,
  Lock,
  X,
  CheckCircle2,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { api } from '../services/api';
import { ReportData, ReportPeriod } from '../types';

interface FilterPill {
  id: ReportPeriod;
  label: string;
}

const FILTER_ROWS: FilterPill[][] = [
  [
    { id: 'day', label: 'Today' },
    { id: 'weekly', label: 'Last 7 Days' },
    { id: 'monthly', label: 'Last 30 Days' },
  ],
  [
    { id: 'quarterly', label: 'Last 3 Months' },
    { id: '6months', label: 'Last 6 Months' },
    { id: 'yearly', label: 'Year-to-Date' },
  ],
];

export const Reports: React.FC = () => {
  const { periodParam } = useParams<{ periodParam?: string }>();
  const navigate = useNavigate();

  const activePeriod = (periodParam?.toLowerCase() || 'weekly') as ReportPeriod;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const loadReportData = async (period: ReportPeriod | string) => {
    setLoading(true);
    try {
      const data = await api.getReport(period);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData(activePeriod);
  }, [activePeriod]);

  const handlePeriodChange = (p: ReportPeriod) => {
    navigate(`/reports/${p}`);
  };

  const handleDownloadCsv = () => {
    window.location.href = api.downloadReportCsvUrl(activePeriod);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Active period display name
  const activePill = FILTER_ROWS.flat().find((p) => p.id === activePeriod) || { label: 'Last 7 Days' };
  const calorieTarget = report.calorie_target || 2200;
  const proteinTarget = report.protein_target || 100;
  const fiberTarget = report.fiber_target || 30;

  // Percentage calculations
  const calPercent = Math.round((report.average_daily_calories / calorieTarget) * 100);
  const protPercent = Math.round((report.average_daily_protein / proteinTarget) * 100);
  const fiberPercent = Math.round(((report.average_daily_fiber || 0) / fiberTarget) * 100);
  const overallTarget = report.overall_achievement_pct || 90.3;

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* ================= 1. HEADER (Matching ui-design-2) ================= */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Export</h2>
      </div>

      {/* ================= 2. PERIOD PILLS (2 Rows Matching ui-design-2) ================= */}
      <div className="space-y-2">
        {FILTER_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-3 gap-2">
            {row.map((pill) => {
              const isActive = activePeriod === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handlePeriodChange(pill.id)}
                  className={`py-2 px-1 text-center rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-200/80 hover:bg-slate-300/80 text-slate-700'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* ================= 3. 2X2 METRIC SUMMARY CARDS (Matching ui-design-2) ================= */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Card 1: Avg. Daily Calories */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-slate-500 font-medium">Avg. Daily Calories</span>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
              <Flame className="w-4 h-4 fill-orange-500/20 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {Math.round(report.average_daily_calories).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">kcal</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {calPercent}% of {calorieTarget.toLocaleString()} goal
            </p>
          </div>
        </div>

        {/* Card 2: Avg. Daily Protein */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-slate-500 font-medium">Avg. Daily Protein</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Dumbbell className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {Math.round(report.average_daily_protein)}{' '}
              <span className="text-xs font-normal text-slate-500">g</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {protPercent}% of {proteinTarget}g goal
            </p>
          </div>
        </div>

        {/* Card 3: Avg. Daily Fiber */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-slate-500 font-medium">Avg. Daily Fiber</span>
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <Sprout className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {report.average_daily_fiber || 0}{' '}
              <span className="text-xs font-normal text-slate-500">g</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {fiberPercent}% of {fiberTarget}g goal
            </p>
          </div>
        </div>

        {/* Card 4: Target Achievement */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-slate-500 font-medium">Target Achievement</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Target className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {overallTarget}%
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Overall Consistency
            </p>
          </div>
        </div>
      </div>

      {/* ================= 4. REPORT PREVIEW (Chart + Recent Day List) ================= */}
      <div className="space-y-2 pt-1">
        <h3 className="text-sm font-bold text-slate-900">Report Preview</h3>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
          <h4 className="text-xs font-bold text-slate-800">
            Calories vs Goals ({activePill.label})
          </h4>

          {/* Smooth Area Chart */}
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.daily_trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#f1f5f9' }}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="cal"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                {/* Dashed Target Line */}
                <ReferenceLine
                  yAxisId="cal"
                  y={calorieTarget}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <Area
                  yAxisId="cal"
                  type="monotone"
                  dataKey="calories_kcal"
                  name="Calories (kcal)"
                  stroke="#ea580c"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCalories)"
                />
                <Area
                  yAxisId="cal"
                  type="monotone"
                  dataKey="protein_g"
                  name="Protein (g)"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProtein)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Day Logs List under chart (matching ui-design-2) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {(!report.daily_logs_table || report.daily_logs_table.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-2">No meal entries logged in this period.</p>
            ) : (
              report.daily_logs_table.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{item.date}:</span>
                    <span className="font-bold text-slate-900">
                      {item.calories_kcal.toLocaleString()} kcal,
                    </span>
                    <span className="font-bold text-emerald-700">{item.protein_g}g P,</span>
                    <span className="font-bold text-blue-700">{item.fiber_g}g F</span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1">
                    <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold" title="Calories Tracked">
                      🍲
                    </span>
                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold" title="Protein Target">
                      P
                    </span>
                    <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold" title="Fiber Target">
                      F
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= 5. EXPORT & DOWNLOAD SECTION (Matching ui-design-2) ================= */}
      <div className="space-y-2 pt-1">
        <h3 className="text-sm font-bold text-slate-900">Export & Download</h3>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {/* Print / PDF View button */}
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Print / PDF View</span>
          </button>
        </div>
      </div>

      {/* ================= 6. DATA PRIVACY & RETENTION CARD (Matching ui-design-2) ================= */}
      <div className="p-4 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
          <Lock className="w-4 h-4 stroke-[2]" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">Data Privacy & Retention</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Stored permanently in your local SQLite database. Photo processing is 100% in-memory and instantly erased.
          </p>
        </div>
      </div>

      {/* ================= 7. FULL PRINT / PDF MODAL (Matching ui-design-3) ================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Actions Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-tight">Print & PDF Export Document</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Document Content (1:1 matching report-export-ui-design-3.png) */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 bg-white" id="printable-report">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-base font-black text-emerald-800 tracking-tight">
                    BITELOG - NUTRITION & CALORIE REPORT
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Exported: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {activePill.label}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">User: You (Premium)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Period: {report.start_date} – {report.end_date} ({report.total_days_in_period} Days)
                  </p>
                </div>
              </div>

              {/* 4 Summary Cards with Progress Bars (Matching Design 3) */}
              <div className="grid grid-cols-4 gap-3">
                {/* 1. Calories */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Avg. Daily Calories</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {Math.round(report.average_daily_calories).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kcal</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {calPercent}% of {calorieTarget} kcal
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, calPercent)}%` }} />
                  </div>
                </div>

                {/* 2. Protein */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                    <span>Avg. Daily Protein</span>
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {Math.round(report.average_daily_protein)} <span className="text-[10px] font-normal text-slate-500">g</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {protPercent}% of {proteinTarget} g
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, protPercent)}%` }} />
                  </div>
                </div>

                {/* 3. Fiber */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                    <span>Avg. Daily Fiber</span>
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {report.average_daily_fiber || 0} <span className="text-[10px] font-normal text-slate-500">g</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {fiberPercent}% of {fiberTarget}g
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, fiberPercent)}%` }} />
                  </div>
                </div>

                {/* 4. Target Achievement */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Target Achievement</span>
                  <div className="text-base font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✔</span>
                    <span>{overallTarget}%</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                    Consistent Goal
                  </div>
                </div>
              </div>

              {/* Chart: Daily Breakdown & Goals Achievement */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Daily Breakdown & Goals Achievement</h3>
                  <div className="flex items-center gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-orange-600">
                      <span className="w-2.5 h-0.5 bg-orange-500 rounded-full" /> Calories
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" /> Protein
                    </span>
                  </div>
                </div>

                <div className="w-full h-44 bg-slate-50/50 rounded-2xl p-2 border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.daily_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis yAxisId="cal" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <ReferenceLine yAxisId="cal" y={calorieTarget} stroke="#94a3b8" strokeDasharray="4 4" />
                      <Area yAxisId="cal" type="monotone" dataKey="calories_kcal" stroke="#ea580c" fill="#ea580c" fillOpacity={0.15} strokeWidth={2} />
                      <Area yAxisId="cal" type="monotone" dataKey="protein_g" stroke="#059669" fill="#059669" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily Meal & Nutrition Log Table (Matching Design 3) */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  DAILY MEAL & NUTRITION LOG
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-2 text-right">Calories (kcal)</th>
                        <th className="py-2.5 px-2 text-right">Protein (g)</th>
                        <th className="py-2.5 px-2 text-right">Fiber (g)</th>
                        <th className="py-2.5 px-3">Meal & Snack Logs</th>
                        <th className="py-2.5 px-3 text-center">Goals Met (C/P)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!report.daily_logs_table || report.daily_logs_table.length === 0) ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400">
                            No logs recorded in this period.
                          </td>
                        </tr>
                      ) : (
                        report.daily_logs_table.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">{row.date}</td>
                            <td className="py-2.5 px-2 text-right font-bold text-slate-900">{row.calories_kcal.toLocaleString()}</td>
                            <td className="py-2.5 px-2 text-right font-bold text-emerald-700">{row.protein_g}g</td>
                            <td className="py-2.5 px-2 text-right font-bold text-teal-700">{row.fiber_g}g</td>
                            <td className="py-2.5 px-3 text-slate-600 text-[10px] leading-relaxed max-w-xs">{row.meal_logs}</td>
                            <td className="py-2.5 px-3 text-center">
                              {row.goals_met ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✔ Achieved
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center text-slate-400">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Document Footer (Matching Design 3) */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>Page 1 of 1</span>
                <span>Generated by BiteLog • Log every bite. Stay on track.</span>
                <span>Stored permanently in your local SQLite database.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
