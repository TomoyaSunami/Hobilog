import type { Habit, HabitColor, HabitIcon, Settings } from "@/types";

export const HABIT_STORAGE_KEY = "hobilog:habits";
export const RECORD_STORAGE_KEY = "hobilog:records";
export const SETTINGS_STORAGE_KEY = "hobilog:settings";

const initialTimestamp = "2026-05-27T00:00:00.000Z";

export const DEFAULT_HABITS: Habit[] = [
  {
    id: "habit-strength",
    name: "筋トレ",
    icon: "Dumbbell",
    color: "Blue",
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp
  },
  {
    id: "habit-illustration",
    name: "イラスト練習",
    icon: "Palette",
    color: "Pink",
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp
  },
  {
    id: "habit-study",
    name: "勉強",
    icon: "BookOpen",
    color: "Cyan",
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp
  }
];

export const DEFAULT_SETTINGS: Settings = {
  activeTab: "home",
  selectedAnalyticsHabitId: null,
  selectedAnalyticsYear: new Date().getFullYear()
};

export const ICON_OPTIONS: HabitIcon[] = [
  "Dumbbell",
  "Palette",
  "BookOpen",
  "PenTool",
  "Brain",
  "Music",
  "Code",
  "Heart",
  "Footprints",
  "Bike",
  "SideBendStretch",
  "BeerOff",
  "BookMarked",
  "NotebookPen",
  "GraduationCap",
  "Languages",
  "Camera",
  "ChefHat",
  "BucketCloth",
  "PiggyBank",
  "Moon",
  "GlassWater",
  "UtensilsCrossed",
  "Target",
  "Star",
  "Clover",
  "Trophy",
  "Smile"
];

export const COLOR_OPTIONS: HabitColor[] = ["Blue", "Cyan", "Pink", "Purple", "Green", "Amber"];

export const COLOR_THEME: Record<
  HabitColor,
  {
    label: string;
    text: string;
    soft: string;
    border: string;
    solid: string;
  }
> = {
  Blue: {
    label: "ブルー",
    text: "#007AFF",
    soft: "rgba(0, 122, 255, 0.11)",
    border: "rgba(0, 122, 255, 0.28)",
    solid: "#007AFF"
  },
  Cyan: {
    label: "シアン",
    text: "#32ADE6",
    soft: "rgba(50, 173, 230, 0.12)",
    border: "rgba(50, 173, 230, 0.3)",
    solid: "#32ADE6"
  },
  Pink: {
    label: "ピンク",
    text: "#FF2D55",
    soft: "rgba(255, 45, 85, 0.11)",
    border: "rgba(255, 45, 85, 0.28)",
    solid: "#FF2D55"
  },
  Purple: {
    label: "パープル",
    text: "#AF52DE",
    soft: "rgba(175, 82, 222, 0.12)",
    border: "rgba(175, 82, 222, 0.3)",
    solid: "#AF52DE"
  },
  Green: {
    label: "グリーン",
    text: "#34C759",
    soft: "rgba(52, 199, 89, 0.12)",
    border: "rgba(52, 199, 89, 0.3)",
    solid: "#34C759"
  },
  Amber: {
    label: "アンバー",
    text: "#FF9500",
    soft: "rgba(255, 149, 0, 0.12)",
    border: "rgba(255, 149, 0, 0.3)",
    solid: "#FF9500"
  }
};
