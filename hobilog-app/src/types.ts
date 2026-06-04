export type TabId = "home" | "log" | "chart" | "habits";

export type HabitIcon =
  | "BeerOff"
  | "Dumbbell"
  | "Palette"
  | "BookOpen"
  | "PenTool"
  | "Brain"
  | "Music"
  | "Code"
  | "Heart"
  | "Footprints"
  | "Bike"
  | "SideBendStretch"
  | "BookMarked"
  | "NotebookPen"
  | "GraduationCap"
  | "Languages"
  | "Camera"
  | "ChefHat"
  | "BucketCloth"
  | "PiggyBank"
  | "Moon"
  | "GlassWater"
  | "UtensilsCrossed"
  | "Target"
  | "Star"
  | "Clover"
  | "Trophy"
  | "Smile";

export type HabitColor = "Blue" | "Cyan" | "Pink" | "Purple" | "Green" | "Amber";

export type AnalyticsPeriod = "1m" | "3m" | "6m" | "1y";

export interface Habit {
  id: string;
  name: string;
  icon: HabitIcon;
  color: HabitColor;
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  done: boolean;
  durationMinutes: number;
  memo: string;
  updatedAt: string;
}

export interface Settings {
  activeTab: TabId;
  selectedAnalyticsHabitId: string | null;
  selectedAnalyticsYear: number;
}

export interface HabitStreak {
  habitId: string;
  current: number;
  previous: number;
  best: number;
  bestDate: string | null;
}

export interface SummaryStats {
  totalDone: number;
  activeDays: number;
  averagePerDay: number;
  completionRate: number;
}
