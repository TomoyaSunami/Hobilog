import type { Habit, HabitSchedule, Weekday } from "@/types";
import { eachDay, fromDateKey, toDateKey } from "@/lib/date";

export const WEEKDAY_OPTIONS: Array<{ value: Weekday; label: string }> = [
  { value: 0, label: "日" },
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" }
];

export const SCHEDULE_LABELS: Record<HabitSchedule["type"], string> = {
  daily: "毎日",
  alternateDays: "1日おき",
  weekdays: "曜日指定"
};

export function isWeekday(value: unknown): value is Weekday {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6;
}

export function normalizeHabitSchedule(schedule: unknown, fallbackDate = toDateKey()): HabitSchedule {
  if (!schedule || typeof schedule !== "object") return { type: "daily" };

  const candidate = schedule as { type?: unknown; anchorDate?: unknown; weekdays?: unknown };
  if (candidate.type === "alternateDays") {
    const anchorDate =
      typeof candidate.anchorDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(candidate.anchorDate)
        ? candidate.anchorDate
        : fallbackDate;
    return { type: "alternateDays", anchorDate };
  }

  if (candidate.type === "weekdays") {
    const weekdays = Array.isArray(candidate.weekdays)
      ? [...new Set(candidate.weekdays.filter(isWeekday))].sort((a, b) => a - b)
      : [];
    return weekdays.length > 0 ? { type: "weekdays", weekdays } : { type: "daily" };
  }

  return { type: "daily" };
}

export function isHabitScheduledOn(habit: Habit, dateKey: string): boolean {
  const schedule = habit.schedule;

  if (schedule.type === "daily") {
    return true;
  }

  if (schedule.type === "alternateDays") {
    const diffDays = Math.round(
      (fromDateKey(dateKey).getTime() - fromDateKey(schedule.anchorDate).getTime()) / 86400000
    );
    return diffDays % 2 === 0;
  }

  return schedule.weekdays.includes(fromDateKey(dateKey).getDay() as Weekday);
}

export function getScheduledDates(habit: Habit, startKey: string, endKey: string): string[] {
  if (startKey > endKey) return [];
  return eachDay(startKey, endKey).filter((dateKey) => isHabitScheduledOn(habit, dateKey));
}

export function formatScheduleLabel(schedule: HabitSchedule): string {
  if (schedule.type === "weekdays") {
    const labels = WEEKDAY_OPTIONS.filter((option) => schedule.weekdays.includes(option.value)).map(
      (option) => option.label
    );
    return labels.length > 0 ? `曜日指定: ${labels.join("・")}` : SCHEDULE_LABELS.weekdays;
  }

  return SCHEDULE_LABELS[schedule.type];
}
