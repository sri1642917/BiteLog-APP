import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Cpu,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { UserSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  // Form states
  const [calTarget, setCalTarget] = useState<number>(2200);
  const [protTarget, setProtTarget] = useState<number>(100);
  const [units, setUnits] = useState<string>('metric');
  const [height, setHeight] = useState<number>(175);
  const [targetWeight, setTargetWeight] = useState<number>(65);

  useEffect(() => {
    api.getSettings().then((res) => {
      setSettings(res);
      setCalTarget(res.calorie_target);
      setProtTarget(res.protein_target);
      setUnits(res.preferred_units);
      setHeight(res.height_cm);
      setTargetWeight(res.target_weight_kg);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        calorie_target: calTarget,
        protein_target: protTarget,
        preferred_units: units,
        height_cm: height,
        target_weight_kg: targetWeight,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div className="dashboard-card p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">Customize daily nutrition goals and local preferences.</p>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Daily Nutrition Targets */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Targets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  value={calTarget}
                  onChange={(e) => setCalTarget(Number(e.target.value))}
                  required
                  min={500}
                  max={6000}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Protein Target (grams)
                </label>
                <input
                  type="number"
                  value={protTarget}
                  onChange={(e) => setProtTarget(Number(e.target.value))}
                  required
                  min={20}
                  max={400}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </form>

        {/* Offline & Architecture Info Card */}
        <div className="pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">100% Offline & Private Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              BiteLog does not connect to any external cloud API, remote server, or analytics tracker.
              All food vision processing (Gemma 3n / Tesseract), database operations (SQLite), and weight analytics run entirely on this local device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

