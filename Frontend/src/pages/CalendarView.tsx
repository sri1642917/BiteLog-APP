import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  Trash2,
  Calendar as CalendarIcon,
  X,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CalendarMonthData, CalendarDayInfo, DayDetailData } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(today));

  const [calendarData, setCalendarData] = useState<CalendarMonthData | null>(null);
  const [dayDetails, setDayDetails] = useState<DayDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  const loadMonthData = async (year: number, month: number) => {
    setLoading(true);
    try {
      const data = await api.getMonthCalendar(year, month);
      setCalendarData(data);
    } catch (err) {
      console.error('Failed to load calendar data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDayDetails = async (dateStr: string) => {
    try {
      const details = await api.getDayDetails(dateStr);
      setDayDetails(details);
    } catch (err) {
      console.error('Failed to load day details', err);
    }
  };

  useEffect(() => {
    loadMonthData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      loadDayDetails(selectedDate);
    }
  }, [selectedDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.deleteEntry(id);
      loadDayDetails(selectedDate);
      loadMonthData(currentYear, currentMonth);
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  // Weekdays header (Sun - Sat)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Pad days for first weekday of the month
  const emptyDaysCount = calendarData ? (calendarData.first_weekday + 1) % 7 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Calendar Card */}
      <div className="dashboard-card p-6 md:p-8">
        {/* Month Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            {calendarData ? `${calendarData.month_name} ${calendarData.year}` : 'Loading...'}
          </h2>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
          {weekdays.map((day) => (
            <div key={day} className="text-xs font-semibold text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* Empty cells before month starts */}
          {Array.from({ length: emptyDaysCount }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 md:h-24 p-1 rounded-xl bg-slate-50/40 opacity-40"></div>
          ))}

          {/* Active Days */}
          {calendarData?.days.map((d: CalendarDayInfo) => {
            const isSelected = selectedDate === d.date;
            const isToday = getLocalDateString(today) === d.date;

            return (
              <div
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`h-16 md:h-24 p-1.5 md:p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-xs'
                    : d.has_entries
                    ? 'border-slate-200/80 bg-white hover:border-emerald-300'
                    : 'border-slate-100 bg-white/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs md:text-sm font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                      isToday
                        ? 'bg-slate-900 text-white'
                        : isSelected
                        ? 'text-emerald-700 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    {d.day}
                  </span>
                  {d.has_entries && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </div>

                {/* Daily Nutritional Badges (Only shown when has_entries == true, NO fake 0s!) */}
                {d.has_entries ? (
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-[10px] md:text-xs font-bold text-orange-600 truncate">
                      {d.total_calories.toLocaleString()} <span className="hidden md:inline font-normal text-slate-400">kcal</span>
                    </span>
                    <span className="text-[9px] md:text-[11px] font-semibold text-emerald-600 truncate">
                      {d.total_protein}g <span className="hidden md:inline font-normal text-slate-400">protein</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300 text-right">-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Summary Card (Matching ui-design-1.png Mobile Screen 3) */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selected Date</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
          </div>

          <Link
            to="/add-entry"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors border border-emerald-100"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </Link>
        </div>

        {dayDetails?.has_entries ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-white/20" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 font-medium">Total Calories</p>
                  <p className="text-base font-bold text-slate-900">
                    {dayDetails.total_calories.toLocaleString()} kcal
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Total Protein</p>
                  <p className="text-base font-bold text-slate-900">
                    {dayDetails.total_protein} g
                  </p>
                </div>
              </div>
            </div>

            {/* List of individual entries for that date */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  {dayDetails.entry_count} {dayDetails.entry_count === 1 ? 'Entry' : 'Entries'} Logged
                </span>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                {dayDetails.entries.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.time}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {item.calories_kcal} kcal
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {item.protein_g}g protein
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">({item.source})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No nutrition entries logged for this date.
          </div>
        )}
      </div>
    </div>
  );
};

