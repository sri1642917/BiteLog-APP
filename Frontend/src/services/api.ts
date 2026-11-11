import {
  DashboardSummary,
  IntakeOverviewItem,
  Entry,
  CalendarMonthData,
  DayDetailData,
  ReportData,
  ReportPeriod,
  WeightStats,
  WeightPoint,
  UserSettings,
  ParseResult
} from '../types';

const API_BASE = '/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Dashboard & Entries
  getDashboardSummary: async (date?: string): Promise<DashboardSummary> => {
    const url = date ? `${API_BASE}/entries/dashboard-summary?target_date=${date}` : `${API_BASE}/entries/dashboard-summary`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  getIntakeOverview: async (timeframe: string = 'This Week'): Promise<IntakeOverviewItem[]> => {
    const res = await fetch(`${API_BASE}/entries/intake-overview?timeframe=${encodeURIComponent(timeframe)}`);
    if (!res.ok) throw new Error('Failed to fetch intake overview');
    return res.json();
  },

  getEntries: async (date?: string, limit: number = 50): Promise<Entry[]> => {
    const url = date ? `${API_BASE}/entries?date=${date}&limit=${limit}` : `${API_BASE}/entries?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch entries');
    return res.json();
  },

  createEntry: async (entry: Omit<Entry, 'id' | 'created_at' | 'updated_at'>): Promise<Entry> => {
    const res = await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to save entry');
    }
    return res.json();
  },

  updateEntry: async (id: number, entry: Partial<Entry>): Promise<Entry> => {
    const res = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to update entry');
    return res.json();
  },

  deleteEntry: async (id: number): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete entry');
    return res.json();
  },

  // Parsing (Offline OCR, Food Vision & Text)
  getModelStatus: async () => {
    const res = await fetch(`${API_BASE}/parse/model-status`);
    if (!res.ok) throw new Error('Failed to fetch model status');
    return res.json();
  },

  parseFoodPhoto: async (
    file: File,
    modelTier: string = 'e2b',
    portionSize: string = 'normal',
    cookingStyle: string = 'home',
    plateSize: string = 'medium'
  ): Promise<{
    success: boolean;
    calories_kcal: number;
    min_calories_kcal?: number;
    max_calories_kcal?: number;
    average_calories_kcal?: number;
    calorie_range_str?: string;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g: number;
    confidence_level: string;
    portion_notes: string;
    model_used: string;
    inference_time_ms: number;
    disclaimer: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_tier', modelTier);
    formData.append('portion_size', portionSize);
    formData.append('cooking_style', cookingStyle);
    formData.append('plate_size', plateSize);
    const res = await fetch(`${API_BASE}/parse/food-photo`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to analyze food photo');
    }
    return res.json();
  },

  parseImage: async (file: File): Promise<ParseResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/parse/image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to run OCR on image');
    }
    return res.json();
  },

  parseText: async (text: string): Promise<ParseResult> => {
    const res = await fetch(`${API_BASE}/parse/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to parse text');
    return res.json();
  },

  // Calendar
  getMonthCalendar: async (year?: number, month?: number): Promise<CalendarMonthData> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const res = await fetch(`${API_BASE}/calendar/month?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load month calendar');
    return res.json();
  },

  getDayDetails: async (date: string): Promise<DayDetailData> => {
    const res = await fetch(`${API_BASE}/calendar/day-details?date=${date}`);
    if (!res.ok) throw new Error('Failed to load day details');
    return res.json();
  },

  // Reports (6 Periods: Day, Week, Month, Quarter, 6 Months, Year)
  getReport: async (period: ReportPeriod | string, targetDate?: string): Promise<ReportData> => {
    const url = targetDate
      ? `${API_BASE}/reports?period=${period}&target_date=${targetDate}`
      : `${API_BASE}/reports?period=${period}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load report');
    return res.json();
  },

  downloadReportCsvUrl: (period: string = 'weekly', targetDate?: string) => {
    return targetDate
      ? `${API_BASE}/reports/download-csv?period=${period}&target_date=${targetDate}`
      : `${API_BASE}/reports/download-csv?period=${period}`;
  },

  // Weight & Goals
  getWeightStats: async (): Promise<WeightStats> => {
    const res = await fetch(`${API_BASE}/weight/stats`);
    if (!res.ok) throw new Error('Failed to load weight stats');
    return res.json();
  },

  getWeightHistory: async (filterRange: string = 'This Month'): Promise<WeightPoint[]> => {
    const res = await fetch(`${API_BASE}/weight/history?range_filter=${encodeURIComponent(filterRange)}`);
    if (!res.ok) throw new Error('Failed to load weight history');
    return res.json();
  },

  logWeight: async (date: string, weight_kg: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/weight/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, weight_kg }),
    });
    if (!res.ok) throw new Error('Failed to log weight');
    return res.json();
  },

  // User Settings
  getSettings: async (): Promise<UserSettings> => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  clearAllData: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/settings/clear-all`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to clear data');
    return res.json();
  },

  previewCleanRange: async (from_date: string, to_date: string): Promise<{ from_date: string; to_date: string; entries_count: number; weights_count: number }> => {
    const res = await fetch(`${API_BASE}/entries/clean-range/preview?from_date=${from_date}&to_date=${to_date}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to preview date range');
    }
    return res.json();
  },

  cleanDataByRange: async (payload: { from_date: string; to_date: string; clean_entries: boolean; clean_weights: boolean }): Promise<{ success: boolean; deleted_entries: number; deleted_weights: number; message: string }> => {
    const res = await fetch(`${API_BASE}/entries/clean-range`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to clean data by range');
    }
    return res.json();
  },

  // Backup & Restore
  exportBackupUrl: () => `${API_BASE}/backup/export`,

  restoreBackup: async (file: File): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/backup/restore`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Restoration failed');
    }
    return res.json();
  },
};

