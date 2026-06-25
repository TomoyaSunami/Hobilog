import type { AnalyticsPeriod, Habit, HabitRecord, HabitStreak, SummaryStats } from "@/types";
import {
  addDays,
  eachDay,
  fromDateKey,
  getPeriodRange,
  getYearEndKey,
  getYearStartKey,
  toDateKey
} from "@/lib/date";
import { getScheduledDates, isHabitScheduledOn } from "@/lib/schedule";

function doneRecords(records: HabitRecord[], todayKey = toDateKey()): HabitRecord[] {
  return records.filter((record) => record.done && record.date <= todayKey);
}

function getRecordQuantity(record: HabitRecord): number {
  const quantity = Number(record.quantity ?? record.durationMinutes ?? 0);
  if (!Number.isFinite(quantity)) return 0;
  return Math.max(0, quantity);
}

function doneSetForHabit(records: HabitRecord[], habitId: string, todayKey = toDateKey()): Set<string> {
  return new Set(
    doneRecords(records, todayKey)
      .filter((record) => record.habitId === habitId)
      .map((record) => record.date)
  );
}

function getHabitStartKey(habit: Habit, records: HabitRecord[], todayKey: string): string {
  const createdDate = habit.createdAt?.slice(0, 10);
  const oldestDoneDate = doneRecords(records, todayKey)
    .filter((record) => record.habitId === habit.id)
    .reduce<string | null>((oldestDate, record) => {
      if (!oldestDate || record.date < oldestDate) {
        return record.date;
      }

      return oldestDate;
    }, null);

  const candidates = [createdDate, oldestDoneDate, habit.schedule.type === "alternateDays" ? habit.schedule.anchorDate : null]
    .filter((dateKey): dateKey is string => Boolean(dateKey) && dateKey <= todayKey)
    .sort();

  return candidates[0] ?? todayKey;
}

function countBackwardsScheduled(scheduledDates: string[], doneDates: Set<string>, anchorIndex: number): number {
  let count = 0;

  for (let index = anchorIndex; index >= 0 && doneDates.has(scheduledDates[index]); index -= 1) {
    count += 1;
  }

  return count;
}

export function getHabitStreak(records: HabitRecord[], habit: Habit, todayKey = toDateKey()): HabitStreak {
  const doneDates = doneSetForHabit(records, habit.id, todayKey);
  const startKey = getHabitStartKey(habit, records, todayKey);
  const scheduledDates = getScheduledDates(habit, startKey, todayKey);
  const currentAnchorIndex = scheduledDates.length - 1;
  const previousAnchorIndex = currentAnchorIndex - 1;
  const current = currentAnchorIndex >= 0 ? countBackwardsScheduled(scheduledDates, doneDates, currentAnchorIndex) : 0;
  const previous = previousAnchorIndex >= 0 ? countBackwardsScheduled(scheduledDates, doneDates, previousAnchorIndex) : 0;
  let best = 0;
  let bestDate: string | null = null;
  let run = 0;

  for (const dateKey of scheduledDates) {
    run = doneDates.has(dateKey) ? run + 1 : 0;

    if (run > best) {
      best = run;
      bestDate = dateKey;
    }
  }

  return { habitId: habit.id, current, previous, best, bestDate };
}

export function getAllStreaks(habits: Habit[], records: HabitRecord[], todayKey = toDateKey()): HabitStreak[] {
  return habits.map((habit) => getHabitStreak(records, habit, todayKey));
}

export function getAvailableYears(records: HabitRecord[], todayKey = toDateKey()): number[] {
  const currentYear = Number(todayKey.slice(0, 4));
  let oldestYear = currentYear;

  records.forEach((record) => {
    const year = Number(record.date.slice(0, 4));
    if (Number.isFinite(year) && year <= currentYear) {
      oldestYear = Math.min(oldestYear, year);
    }
  });

  return Array.from({ length: currentYear - oldestYear + 1 }, (_, index) => currentYear - index);
}

export function getDoneHabitCountForDate(records: HabitRecord[], dateKey: string): number {
  return new Set(
    records.filter((record) => record.date === dateKey && record.done).map((record) => record.habitId)
  ).size;
}

export function buildYearHeatmap(year: number, records: HabitRecord[], habit: Habit) {
  const startKey = getYearStartKey(year);
  const endKey = getYearEndKey(year);
  const first = fromDateKey(startKey);
  const gridStart = addDays(first, -first.getDay());
  const doneDates = doneSetForHabit(records, habit.id, endKey);
  const cells: Array<{ date: string | null; value: number; isInYear: boolean; isScheduled: boolean }> = [];

  for (let index = 0; index < 54 * 7; index += 1) {
    const date = addDays(gridStart, index);
    const dateKey = toDateKey(date);
    const isInYear = dateKey >= startKey && dateKey <= endKey;
    const isScheduled = isInYear && isHabitScheduledOn(habit, dateKey);

    cells.push({
      date: isInYear ? dateKey : null,
      value: isInYear && doneDates.has(dateKey) ? 1 : 0,
      isInYear,
      isScheduled
    });
  }

  return cells;
}

export function buildCumulativeSeries(
  habitId: string,
  records: HabitRecord[],
  startKey: string,
  endKey: string,
  mode: "days" | "quantity" = "days"
): Array<{ date: string; label: string; value: number }> {
  const targetRecords = records.filter(
    (record) => record.habitId === habitId && record.done && record.date >= startKey && record.date <= endKey
  );
  const valueByDate = new Map<string, number>();
  let total = 0;

  targetRecords.forEach((record) => {
    const value = mode === "quantity" ? getRecordQuantity(record) : 1;
    valueByDate.set(record.date, (valueByDate.get(record.date) ?? 0) + value);
  });

  return eachDay(startKey, endKey).map((dateKey) => {
    total += valueByDate.get(dateKey) ?? 0;

    return {
      date: dateKey,
      label: dateKey.replaceAll("-", "/").slice(0, 7),
      value: total
    };
  });
}

export function getSummaryStats(
  records: HabitRecord[],
  startKey: string,
  endKey: string,
  habit: Habit
): SummaryStats {
  const scheduledDates = getScheduledDates(habit, startKey, endKey);
  const scheduledDateSet = new Set(scheduledDates);
  const targetRecords = records.filter((record) => {
    if (!record.done || record.date < startKey || record.date > endKey) {
      return false;
    }

    return record.habitId === habit.id;
  });
  const scheduledTargetRecords = targetRecords.filter((record) => scheduledDateSet.has(record.date));
  const totalDone = targetRecords.length;
  const totalQuantity = targetRecords.reduce((total, record) => total + getRecordQuantity(record), 0);
  const activeDays = new Set(targetRecords.map((record) => record.date)).size;
  const scheduledActiveDays = new Set(scheduledTargetRecords.map((record) => record.date)).size;
  const scheduledDays = scheduledDates.length;
  const averagePerDay = scheduledDays > 0 ? scheduledTargetRecords.length / scheduledDays : 0;
  const averageQuantityPerActiveDay = activeDays > 0 ? totalQuantity / activeDays : 0;
  const completionRate = scheduledDays > 0 ? (scheduledActiveDays / scheduledDays) * 100 : 0;

  return {
    totalDone,
    totalQuantity,
    activeDays,
    scheduledDays,
    averagePerDay,
    averageQuantityPerActiveDay,
    completionRate
  };
}

function getOldestDoneDateForHabit(records: HabitRecord[], habitId: string, todayKey: string): string | null {
  return doneRecords(records, todayKey)
    .filter((record) => record.habitId === habitId)
    .reduce<string | null>((oldestDate, record) => {
      if (!oldestDate || record.date < oldestDate) {
        return record.date;
      }

      return oldestDate;
    }, null);
}

export function getAnalyticsRange(
  year: number,
  period: AnalyticsPeriod,
  records: HabitRecord[] = [],
  habitId = "",
  todayKey = toDateKey()
) {
  if (period === "all") {
    return {
      startKey: getOldestDoneDateForHabit(records, habitId, todayKey) ?? todayKey,
      endKey: todayKey
    };
  }

  return getPeriodRange(year, period, todayKey);
}
