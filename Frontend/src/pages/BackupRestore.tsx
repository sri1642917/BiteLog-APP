import React, { useRef, useState, useEffect } from 'react';
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Database,
  ShieldCheck,
  Loader2,
  Trash2,
  Calendar,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { getLocalDateString } from '../utils/dateUtils';

export const BackupRestore: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoring, setRestoring] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Date Range Clean states
  const today = new Date();
  const pastWeek = new Date(today);
  pastWeek.setDate(today.getDate() - 7);

  const [cleanFromDate, setCleanFromDate] = useState<string>(getLocalDateString(pastWeek));
  const [cleanToDate, setCleanToDate] = useState<string>(getLocalDateString(today));
  const [cleanEntries, setCleanEntries] = useState<boolean>(true);
  const [cleanWeights, setCleanWeights] = useState<boolean>(true);

  const [previewCounts, setPreviewCounts] = useState<{ entries: number; weights: number } | null>(null);
  const [cleaningRange, setCleaningRange] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const loadRangePreview = async (fromD: string, toD: string) => {
    if (!fromD || !toD || fromD > toD) {
      setPreviewCounts(null);
      return;
    }
    try {
      const data = await api.previewCleanRange(fromD, toD);
      setPreviewCounts({ entries: data.entries_count, weights: data.weights_count });
    } catch (err) {
      setPreviewCounts(null);
    }
  };

  useEffect(() => {
    loadRangePreview(cleanFromDate, cleanToDate);
  }, [cleanFromDate, cleanToDate]);

  const handleExport = () => {
    window.location.href = api.exportBackupUrl();
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Restoring will replace all current database entries and weight logs with this backup. Continue?')) {
      return;
    }

    setRestoring(true);
    setStatusMsg(null);

    try {
      const res = await api.restoreBackup(file);
      setStatusMsg({ type: 'success', text: res.message });
      loadRangePreview(cleanFromDate, cleanToDate);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Restoration failed' });
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCleanRangeSubmit = async () => {
    if (!cleanEntries && !cleanWeights) {
      alert('Please select at least one data type to clean (Nutrition entries or Weight logs).');
      return;
    }

    setCleaningRange(true);
    setStatusMsg(null);

    try {
      const res = await api.cleanDataByRange({
        from_date: cleanFromDate,
        to_date: cleanToDate,
        clean_entries: cleanEntries,
        clean_weights: cleanWeights,
      });

      setStatusMsg({ type: 'success', text: res.message });
      setShowConfirmModal(false);
      loadRangePreview(cleanFromDate, cleanToDate);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to clean data by range' });
    } finally {
      setCleaningRange(false);
    }
  };

  const handleClearAll = async () => {
    const code = prompt('WARNING: This will permanently delete ALL logged entries and weight history.\nType "CLEAR" to confirm:');
    if (code !== 'CLEAR') return;

    try {
      const res = await api.clearAllData();
      alert(res.message);
      window.location.reload();
    } catch (err) {
      alert('Failed to clear data');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="dashboard-card p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Backup & Data Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            100% offline local storage management. Export, restore, or clean your data selectively by date range.
          </p>
        </div>

        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* 1. Export & Restore Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export Card */}
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Export Backup</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Download a JSON snapshot of all your logged entries, weight history, and targets.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Restore Card */}
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Restore Backup</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Import and restore a previous backup file to restore your database.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestoreFile}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              disabled={restoring}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Choose Backup File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. NEW FEATURE: Clean Data by Date Period */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clean Data by Date Period</h3>
              <p className="text-xs text-slate-400">
                Delete records for a specific time range without losing the rest of your history.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-amber-100/80 bg-amber-50/20 space-y-4">
            {/* From Date and To Date pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>From Date</span>
                </label>
                <input
                  type="date"
                  value={cleanFromDate}
                  onChange={(e) => setCleanFromDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>To Date</span>
                </label>
                <input
                  type="date"
                  value={cleanToDate}
                  onChange={(e) => setCleanToDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Checkboxes for what to clean */}
            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanEntries}
                  onChange={(e) => setCleanEntries(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Nutrition Entries (kcal & protein)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanWeights}
                  onChange={(e) => setCleanWeights(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Weight Logs</span>
              </label>
            </div>

            {/* Live Count Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-100/60">
              <div className="text-xs text-slate-600 font-medium">
                {previewCounts ? (
                  <span>
                    Selected period contains{' '}
                    <strong className="text-slate-900 font-bold">{previewCounts.entries}</strong> nutrition entries and{' '}
                    <strong className="text-slate-900 font-bold">{previewCounts.weights}</strong> weight logs.
                  </span>
                ) : (
                  <span className="text-rose-500">Please select a valid date range.</span>
                )}
              </div>

              <button
                type="button"
                disabled={
                  cleaningRange ||
                  !previewCounts ||
                  (previewCounts.entries === 0 && previewCounts.weights === 0) ||
                  (!cleanEntries && !cleanWeights)
                }
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clean Selected Period</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Clear All Data Section */}
        <div className="pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-rose-800">Clear All Stored Data</h4>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Permanently wipes all entries and weight history across all dates.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Date Range Cleanup */}
      {showConfirmModal && previewCounts && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">Confirm Date Range Cleanup</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete records between:
              </p>
              <div className="my-2 p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border border-slate-100">
                {cleanFromDate} → {cleanToDate}
              </div>
              <p className="text-xs text-amber-700 font-medium">
                This will delete{' '}
                {cleanEntries ? `${previewCounts.entries} nutrition entries` : ''}
                {cleanEntries && cleanWeights ? ' and ' : ''}
                {cleanWeights ? `${previewCounts.weights} weight logs` : ''}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2.5 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={cleaningRange}
                onClick={handleCleanRangeSubmit}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {cleaningRange ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cleaning...</span>
                  </>
                ) : (
                  <span>Yes, Delete Records</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
