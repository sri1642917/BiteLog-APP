export interface Entry {
  id: number;
  date: string;
  time: string;
  calories_kcal: number;
  protein_g: number;
  fiber_g?: number;
  meal_type?: 'Breakfast' | 'Morning Snacks' | 'Lunch' | 'Evening Snacks' | 'Dinner' | 'Midnight Craving' | string;
  source: 'Image' | 'Text' | 'Manual';
  created_at?: string;
  updated_at?: string;
}

export interface DashboardSummary {
  date: string;
  today_calories: {
    total: number;
    target: number;
    percentage: number;
    remaining: number;
    exceeded: number;
  };
  today_protein: {
    total: number;
    target: number;
    percentage: number;
    remaining: number;
    exceeded: number;
  };
  weight: {
    current: number;
    target: number;
    progress_percentage: number;
  };
  entries_summary: {
    count: number;
    last_entry_time: string;
  };
  recent_entries: Entry[];
}

export interface IntakeOverviewItem {
  day: string;
  date: string;
  calories: number;
  protein: number;
}

export interface CalendarDayInfo {
  date: string;
  day: number;
  has_entries: boolean;
  total_calories: number;
  total_protein: number;
  entry_count: number;
}

export interface CalendarMonthData {
  year: number;
  month: number;
  month_name: string;
  days: CalendarDayInfo[];
  first_weekday: number;
}

export interface DayDetailData {
  date: string;
  has_entries: boolean;
  total_calories: number;
  total_protein: number;
  entry_count: number;
  entries: Entry[];
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  calories_kcal: number;
  protein_g: number;
}

export type ReportPeriod = 'day' | 'weekly' | 'monthly' | 'quarterly' | '6months' | 'yearly';

export interface ReportDetailedEntry {
  id: number;
  date: string;
  time: string;
  meal_type: string;
  calories_kcal: number;
  protein_g: number;
  fiber_g: number;
  source: string;
}

export interface DailyReportLogRow {
  date: string;
  raw_date: string;
  calories_kcal: number;
  protein_g: number;
  fiber_g: number;
  meal_logs: string;
  goals_met: boolean;
}

export interface ReportData {
  period: ReportPeriod | string;
  start_date: string;
  end_date: string;
  calorie_target?: number;
  protein_target?: number;
  fiber_target?: number;
  total_calories: number;
  total_protein: number;
  total_fiber?: number;
  average_daily_calories: number;
  average_daily_protein: number;
  average_daily_fiber?: number;
  calorie_target_achievement_pct: number;
  protein_target_achievement_pct: number;
  overall_achievement_pct?: number;
  days_logged: number;
  total_days_in_period: number;
  daily_trends: (DailyTrendPoint & { fiber_g?: number })[];
  detailed_entries?: ReportDetailedEntry[];
  daily_logs_table?: DailyReportLogRow[];
}

export interface WeightStats {
  current_weight_kg: number;
  target_weight_kg: number;
  start_weight_kg: number;
  progress_percentage: number;
  bmi: number;
  bmr: number;
  tdee: number;
  recommended_calories: number;
  recommended_protein: number;
  target_date: string;
  days_remaining: number;
  age: number;
  height_cm: number;
  gender: string;
  activity_level: string;
}

export interface WeightPoint {
  date: string;
  label: string;
  weight_kg: number;
}

export interface UserSettings {
  id?: number;
  date_of_birth: string;
  gender: string;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  activity_level: string;
  calorie_target: number;
  protein_target: number;
  preferred_units: string;
  target_duration_weeks: number;
}

export interface ParseResult {
  success: boolean;
  calories_kcal: number | null;
  protein_g: number | null;
  raw_extracted_text: string | null;
  confidence_note: string | null;
  source: 'Image' | 'Text';
}

