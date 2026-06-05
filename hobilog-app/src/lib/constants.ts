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
    text: "#2F67FF",
    soft: "rgba(47, 103, 255, 0.12)",
    border: "rgba(47, 103, 255, 0.32)",
    solid: "#2F67FF"
  },
  Cyan: {
    label: "シアン",
    text: "#25C3D8",
    soft: "rgba(37, 195, 216, 0.13)",
    border: "rgba(37, 195, 216, 0.34)",
    solid: "#25C3D8"
  },
  Pink: {
    label: "ピンク",
    text: "#F044B8",
    soft: "rgba(240, 68, 184, 0.13)",
    border: "rgba(240, 68, 184, 0.34)",
    solid: "#F044B8"
  },
  Purple: {
    label: "パープル",
    text: "#8B5CF6",
    soft: "rgba(139, 92, 246, 0.13)",
    border: "rgba(139, 92, 246, 0.34)",
    solid: "#8B5CF6"
  },
  Green: {
    label: "グリーン",
    text: "#22C55E",
    soft: "rgba(34, 197, 94, 0.13)",
    border: "rgba(34, 197, 94, 0.34)",
    solid: "#22C55E"
  },
  Amber: {
    label: "アンバー",
    text: "#F4B63F",
    soft: "rgba(244, 182, 63, 0.14)",
    border: "rgba(244, 182, 63, 0.34)",
    solid: "#F4B63F"
  }
};
