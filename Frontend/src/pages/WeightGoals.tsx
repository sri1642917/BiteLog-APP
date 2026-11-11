import React, { useEffect, useState } from 'react';
import {
  Scale,
  Calendar,
  Target,
  Activity,
  Flame,
  Dumbbell,
  Clock,
  Plus,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { api } from '../services/api';
import { WeightStats, WeightPoint, UserSettings } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

export const WeightGoals: React.FC = () => {
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [history, setHistory] = useState<WeightPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Update Weight Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logWeightVal, setLogWeightVal] = useState<string>('');
  const [logDateVal, setLogDateVal] = useState<string>(getLocalDateString());

  // Edit Goals / Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dob, setDob] = useState<string>('1995-01-01');
  const [heightStr, setHeightStr] = useState<string>('175');
  const [currentWeightStr, setCurrentWeightStr] = useState<string>('72');
  const [targetWeightStr, setTargetWeightStr] = useState<string>('65');
  const [gender, setGender] = useState<string>('male');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');

  const loadAll = async () => {
    try {
      const [sRes, hRes, setRes] = await Promise.all([
        api.getWeightStats(),
        api.getWeightHistory('This Month'),
        api.getSettings(),
      ]);
      setStats(sRes);
      setHistory(hRes);
      if (setRes) {
        setDob(setRes.date_of_birth);
        setHeightStr(setRes.height_cm.toString());
        setTargetWeightStr(setRes.target_weight_kg.toString());
        setGender(setRes.gender);
        setActivityLevel(setRes.activity_level);
      }
      if (sRes) {
        setCurrentWeightStr(sRes.current_weight_kg.toString());
        setLogWeightVal(sRes.current_weight_kg.toString());
      }
    } catch (err) {
      console.error('Error loading weight data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleLogWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(logWeightVal);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    try {
      await api.logWeight(logDateVal, val);
      setShowLogModal(false);
      loadAll();
    } catch (err) {
      alert('Failed to log weight');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const curW = parseFloat(currentWeightStr);
    const tarW = parseFloat(targetWeightStr);
    const h = parseFloat(heightStr);

    if (isNaN(curW) || curW <= 0) {
      alert('Please enter a valid current weight');
      return;
    }
    if (isNaN(tarW) || tarW <= 0) {
      alert('Please enter a valid target weight');
      return;
    }

    try {
      // 1. Update user settings
      await api.updateSettings({
        date_of_birth: dob,
        height_cm: h || 175,
        current_weight_kg: curW,
        target_weight_kg: tarW,
        gender: gender,
        activity_level: activityLevel,
      });

      // 2. Also log to weight history for today so chart and stats immediately reflect the new weight!
      const todayStr = getLocalDateString();
      await api.logWeight(todayStr, curW);

      setShowProfileModal(false);
      await loadAll();
    } catch (err) {
      alert('Failed to update weight & profile');
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Current Weight Card (Exact match to ui-design-1.png Mobile Screen 5) */}
      <div className="dashboard-card p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Current Weight</p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {stats.current_weight_kg} <span className="text-sm font-normal text-slate-500">kg</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Target: {stats.target_weight_kg} kg</p>
          </div>

          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            title="Edit Profile & Goals"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Smooth Purple Area Chart */}
        <div className="w-full h-36 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
                formatter={(v: any) => [`${v} kg`, 'Weight']}
              />
              <Area
                type="monotone"
                dataKey="weight_kg"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#purpleGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats List (Matching ui-design-1.png Mobile Screen 5) */}
        <div className="divide-y divide-slate-100 pt-2 text-xs">
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">BMI</span>
            <span className="font-bold text-slate-900">{stats.bmi}</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Daily Calorie Target</span>
            <span className="font-bold text-slate-900">{stats.recommended_calories.toLocaleString()} kcal</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Daily Protein Target</span>
            <span className="font-bold text-slate-900">{stats.recommended_protein} g</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Target Date</span>
            <span className="font-bold text-slate-900">{stats.target_date}</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Days Remaining</span>
            <span className="font-bold text-slate-900">{stats.days_remaining} days</span>
          </div>
        </div>

        {/* Big Green Update Weight Button */}
        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 mt-4"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Update Weight</span>
        </button>
      </div>

      {/* Log Weight Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h4 className="text-base font-bold text-slate-900 mb-1">Update Current Weight</h4>
            <p className="text-xs text-slate-400 mb-4">Record your weight today to keep your progress chart accurate.</p>

            <form onSubmit={handleLogWeightSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={logWeightVal}
                  onChange={(e) => {
                    const val = e.target.value;
                    const clean = val.length > 1 && val.startsWith('0') && !val.startsWith('0.')
                      ? val.replace(/^0+/, '')
                      : val;
                    setLogWeightVal(clean);
                  }}
                  min={30}
                  max={300}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={logDateVal}
                  onChange={(e) => setLogDateVal(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile & Calculations Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h4 className="text-base font-bold text-slate-900 mb-1">Profile & Nutrition Goals</h4>
            <p className="text-xs text-slate-400 mb-4">Calculates BMR & TDEE using the Mifflin-St Jeor equation locally.</p>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              {/* Weight Settings (Current Weight & Target Weight) */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeightStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      const clean = val.length > 1 && val.startsWith('0') && !val.startsWith('0.')
                        ? val.replace(/^0+/, '')
                        : val;
                      setCurrentWeightStr(clean);
                    }}
                    placeholder="e.g. 72"
                    min={30}
                    max={300}
                    required
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-950 mb-1">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={targetWeightStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      const clean = val.length > 1 && val.startsWith('0') && !val.startsWith('0.')
                        ? val.replace(/^0+/, '')
                        : val;
                      setTargetWeightStr(clean);
                    }}
                    placeholder="e.g. 65"
                    min={30}
                    max={300}
                    required
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Height & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      const clean = val.length > 1 && val.startsWith('0') && !val.startsWith('0.')
                        ? val.replace(/^0+/, '')
                        : val;
                      setHeightStr(clean);
                    }}
                    min={100}
                    max={250}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="sedentary">Sedentary (Little or no exercise)</option>
                  <option value="light">Lightly Active (Exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="active">Active (Hard exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (Physical job & intense training)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

