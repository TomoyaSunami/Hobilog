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

export type HabitColor = "Blue" | "Cyan" | "Pink" | "Purple" | "Green" | "Amber" | "Red" | "Orange" | "Slate";

export type RecordMethod = "done" | "time" | "count" | "distance" | "pages" | "custom";

export type AnalyticsPeriod = "1m" | "3m" | "6m" | "1y" | "all";

export interface Habit {
  id: string;
  name: string;
  icon: HabitIcon;
  color: HabitColor;
  recordMethod: RecordMethod;
  customUnit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  done: boolean;
  quantity: number;
  durationMinutes?: number;
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
  totalQuantity: number;
  activeDays: number;
  averagePerDay: number;
  averageQuantityPerActiveDay: number;
  completionRate: number;
}
