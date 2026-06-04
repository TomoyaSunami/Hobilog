export function toDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

export function clampDateKey(dateKey: string, minKey: string, maxKey: string): string {
  if (dateKey < minKey) return minKey;
  if (dateKey > maxKey) return maxKey;
  return dateKey;
}

export function formatShortDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-");
  return `${year}/${month}/${day}`;
}

export function formatMonthTitle(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function formatWeekday(date = new Date()): string {
  return new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(date);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getMonthCalendarDays(monthDate: Date): Date[] {
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const start = addDays(first, -first.getDay());
  const end = addDays(last, 6 - last.getDay());
  const days: Date[] = [];

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }

  return days;
}

export function eachDay(startKey: string, endKey: string): string[] {
  const days: string[] = [];

  for (let cursor = fromDateKey(startKey); toDateKey(cursor) <= endKey; cursor = addDays(cursor, 1)) {
    days.push(toDateKey(cursor));
  }

  return days;
}

export function daysBetweenInclusive(startKey: string, endKey: string): number {
  const start = fromDateKey(startKey).getTime();
  const end = fromDateKey(endKey).getTime();
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

export function isFutureDateKey(dateKey: string, todayKey = toDateKey()): boolean {
  return dateKey > todayKey;
}

export function getYearStartKey(year: number): string {
  return `${year}-01-01`;
}

export function getYearEndKey(year: number): string {
  return `${year}-12-31`;
}

export function getPeriodRange(year: number, period: "1m" | "3m" | "6m" | "1y", todayKey = toDateKey()) {
  const currentYear = Number(todayKey.slice(0, 4));
  const yearStart = getYearStartKey(year);
  const yearEnd = getYearEndKey(year);
  const endKey = year === currentYear ? todayKey : yearEnd;

  if (period === "1y") {
    return { startKey: yearStart, endKey };
  }

  const monthBack = period === "1m" ? 1 : period === "3m" ? 3 : 6;
  const endDate = fromDateKey(endKey);
  const startDate = addDays(addMonths(endDate, -monthBack), 1);
  const startKey = clampDateKey(toDateKey(startDate), yearStart, yearEnd);

  return { startKey, endKey };
}
