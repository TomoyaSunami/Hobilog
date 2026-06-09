import type { Habit, HabitColor, HabitIcon, RecordMethod, Settings } from "@/types";

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
    recordMethod: "count",
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp
  },
  {
    id: "habit-reading",
    name: "読書",
    icon: "BookMarked",
    color: "Pink",
    recordMethod: "pages",
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp
  },
  {
    id: "habit-study",
    name: "勉強",
    icon: "BookOpen",
    color: "Cyan",
    recordMethod: "time",
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

export const COLOR_OPTIONS: HabitColor[] = ["Blue", "Cyan", "Pink", "Purple", "Green", "Amber", "Red", "Orange", "Slate"];

export const RECORD_METHOD_OPTIONS: RecordMethod[] = ["done", "time", "count", "distance", "pages", "custom"];

export const RECORD_METHOD_META: Record<
  RecordMethod,
  {
    label: string;
    unit: string;
    inputLabel: string;
    placeholder: string;
  }
> = {
  done: {
    label: "実施のみ",
    unit: "",
    inputLabel: "実施のみ",
    placeholder: ""
  },
  time: {
    label: "時間",
    unit: "分",
    inputLabel: "時間 分",
    placeholder: "例: 60"
  },
  count: {
    label: "回数",
    unit: "回",
    inputLabel: "回数 回",
    placeholder: "例: 30"
  },
  distance: {
    label: "距離",
    unit: "km",
    inputLabel: "距離 km",
    placeholder: "例: 5"
  },
  pages: {
    label: "ページ数",
    unit: "ページ",
    inputLabel: "ページ数 ページ",
    placeholder: "例: 40"
  },
  custom: {
    label: "カスタム",
    unit: "",
    inputLabel: "記録値",
    placeholder: "例: 100"
  }
};

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
    label: "イエロー",
    text: "#FFDD00",
    soft: "#FFFBE0",
    border: "rgba(255, 221, 0, 0.46)",
    solid: "#FFDD00"
  },
  Red: {
    label: "レッド",
    text: "#EF4444",
    soft: "rgba(239, 68, 68, 0.13)",
    border: "rgba(239, 68, 68, 0.34)",
    solid: "#EF4444"
  },
  Orange: {
    label: "オレンジ",
    text: "#F97316",
    soft: "rgba(249, 115, 22, 0.13)",
    border: "rgba(249, 115, 22, 0.34)",
    solid: "#F97316"
  },
  Slate: {
    label: "グレー",
    text: "#64748B",
    soft: "rgba(100, 116, 139, 0.14)",
    border: "rgba(100, 116, 139, 0.34)",
    solid: "#64748B"
  }
};
