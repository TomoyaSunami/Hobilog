import type { AnalyticsPeriod, Habit, HabitRecord, HabitStreak, SummaryStats } from "@/types";
import {
  addDays,
  daysBetweenInclusive,
  eachDay,
  fromDateKey,
  getPeriodRange,
  getYearEndKey,
  getYearStartKey,
  toDateKey
} from "@/lib/date";

function doneRecords(records: HabitRecord[], todayKey = toDateKey()): HabitRecord[] {
  return records.filter((record) => record.done && record.date <= todayKey);
}

function doneSetForHabit(records: HabitRecord[], habitId: string, todayKey = toDateKey()): Set<string> {
  return new Set(
    doneRecords(records, todayKey)
      .filter((record) => record.habitId === habitId)
      .map((record) => record.date)
  );
}

function countBackwards(doneDates: Set<string>, anchorKey: string): number {
  let count = 0;

  for (let cursor = fromDateKey(anchorKey); doneDates.has(toDateKey(cursor)); cursor = addDays(cursor, -1)) {
    count += 1;
  }

  return count;
}

export function getHabitStreak(records: HabitRecord[], habitId: string, todayKey = toDateKey()): HabitStreak {
  const doneDates = doneSetForHabit(records, habitId, todayKey);
  const yesterdayKey = toDateKey(addDays(fromDateKey(todayKey), -1));
  const currentAnchor = doneDates.has(todayKey) ? todayKey : yesterdayKey;
  const current = countBackwards(doneDates, currentAnchor);
  const previous = countBackwards(doneDates, yesterdayKey);
  const sortedDoneDates = [...doneDates].sort();
  let best = 0;
  let bestDate: string | null = null;
  let run = 0;
  let previousDate: string | null = null;

  for (const dateKey of sortedDoneDates) {
    const expected = previousDate ? toDateKey(addDays(fromDateKey(previousDate), 1)) : null;
    run = expected === dateKey ? run + 1 : 1;

    if (run > best) {
      best = run;
      bestDate = dateKey;
    }

    previousDate = dateKey;
  }

  return { habitId, current, previous, best, bestDate };
}

export function getAllStreaks(habits: Habit[], records: HabitRecord[], todayKey = toDateKey()): HabitStreak[] {
  return habits.map((habit) => getHabitStreak(records, habit.id, todayKey));
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

export function buildYearHeatmap(year: number, records: HabitRecord[], habitId: string) {
  const startKey = getYearStartKey(year);
  const endKey = getYearEndKey(year);
  const first = fromDateKey(startKey);
  const gridStart = addDays(first, -first.getDay());
  const doneDates = doneSetForHabit(records, habitId, endKey);
  const cells: Array<{ date: string | null; value: number; isInYear: boolean }> = [];

  for (let index = 0; index < 54 * 7; index += 1) {
    const date = addDays(gridStart, index);
    const dateKey = toDateKey(date);
    const isInYear = dateKey >= startKey && dateKey <= endKey;

    cells.push({
      date: isInYear ? dateKey : null,
      value: isInYear && doneDates.has(dateKey) ? 1 : 0,
      isInYear
    });
  }

  return cells;
}

export function buildCumulativeSeries(
  habitId: string,
  records: HabitRecord[],
  startKey: string,
  endKey: string
): Array<{ date: string; label: string; value: number }> {
  const doneDates = doneSetForHabit(records, habitId, endKey);
  let total = 0;

  return eachDay(startKey, endKey).map((dateKey) => {
    if (doneDates.has(dateKey)) {
      total += 1;
    }

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
  habitId: string
): SummaryStats {
  const targetRecords = records.filter((record) => {
    if (!record.done || record.date < startKey || record.date > endKey) {
      return false;
    }

    return record.habitId === habitId;
  });
  const totalDone = targetRecords.length;
  const activeDays = new Set(targetRecords.map((record) => record.date)).size;
  const periodDays = daysBetweenInclusive(startKey, endKey);
  const averagePerDay = totalDone / periodDays;
  const completionRate = (activeDays / periodDays) * 100;

  return { totalDone, activeDays, averagePerDay, completionRate };
}

export function getAnalyticsRange(year: number, period: AnalyticsPeriod, todayKey = toDateKey()) {
  return getPeriodRange(year, period, todayKey);
}
