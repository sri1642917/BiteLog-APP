import React, { useEffect, useState } from 'react';
import {
  Clock,
  Trash2,
  Calendar,
  Filter,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Entry } from '../types';

export const History: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>('');

  const loadEntries = async (date?: string) => {
    setLoading(true);
    try {
      const data = await api.getEntries(date || undefined, 100);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load history entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries(filterDate);
  }, [filterDate]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.deleteEntry(id);
      loadEntries(filterDate);
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="dashboard-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nutrition History</h2>
            <p className="text-xs text-slate-400 mt-0.5">All your logged calories and protein entries stored locally.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="text-xs text-slate-400 hover:text-slate-700 underline"
              >
                Clear
              </button>
            )}
            <Link
              to="/add-entry"
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </Link>
          </div>
        </div>

        {/* Table of Entries */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-semibold">Meal</th>
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold">Calories</th>
                <th className="pb-3 font-semibold">Protein</th>
                <th className="pb-3 font-semibold">Fiber</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No entries found.
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {item.meal_type || 'Meal'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 text-[11px]">{item.date} • {item.time}</td>
                    <td className="py-3.5 font-bold text-orange-600">{item.calories_kcal} kcal</td>
                    <td className="py-3.5 font-bold text-emerald-600">{item.protein_g} g</td>
                    <td className="py-3.5 font-bold text-blue-600">{item.fiber_g || 0} g</td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

