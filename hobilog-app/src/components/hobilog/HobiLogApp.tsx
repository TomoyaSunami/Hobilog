"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_HABITS,
  DEFAULT_SETTINGS,
  HABIT_STORAGE_KEY,
  ICON_OPTIONS,
  RECORD_METHOD_OPTIONS,
  RECORD_STORAGE_KEY,
  SETTINGS_STORAGE_KEY
} from "@/lib/constants";
import { isFutureDateKey, toDateKey } from "@/lib/date";
import { getAllStreaks, getAvailableYears } from "@/lib/analytics";
import { isHabitScheduledOn, normalizeHabitSchedule } from "@/lib/schedule";
import type { AnalyticsPeriod, Habit, HabitIcon, HabitRecord, HabitSchedule, RecordMethod, TabId } from "@/types";
import {
  BottomNav,
  ChartScreen,
  DeleteHabitModal,
  HabitFormModal,
  HabitsScreen,
  HomeScreen,
  LogScreen,
  RecordModal,
  type HabitFormState,
  type RecordDraft
} from "./screens";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function safeParseArray<T>(value: string | null, fallback: T[]): T[] {
  const parsed = safeParse<unknown>(value, fallback);
  return Array.isArray(parsed) ? (parsed as T[]) : fallback;
}

function isRecordMethod(method: unknown): method is RecordMethod {
  return typeof method === "string" && (RECORD_METHOD_OPTIONS as string[]).includes(method);
}

function inferRecordMethod(habit: Habit): RecordMethod {
  if (isRecordMethod(habit.recordMethod)) {
    return habit.recordMethod;
  }

  const key = `${habit.id} ${habit.name}`;
  if (key.includes("strength") || key.includes("筋トレ") || key.includes("スクワット")) return "count";
  if (key.includes("reading") || key.includes("読書")) return "pages";
  if (key.includes("study") || key.includes("勉強")) return "time";
  if (key.includes("running") || key.includes("ランニング") || key.includes("ジョギング")) return "distance";

  return "time";
}

function normalizeCustomUnit(unit: unknown): string {
  if (typeof unit !== "string") return "";
  return unit.trim().slice(0, 12);
}

function normalizeHabitIcon(icon: unknown): HabitIcon {
  if (typeof icon !== "string") return "Dumbbell";
  if ((ICON_OPTIONS as string[]).includes(icon)) return icon as HabitIcon;
  return "Dumbbell";
}

function normalizeHabit(habit: Habit): Habit {
  const fallbackDate = habit.createdAt?.slice(0, 10) || toDateKey();

  return {
    ...habit,
    icon: normalizeHabitIcon(habit.icon),
    recordMethod: inferRecordMethod(habit),
    customUnit: normalizeCustomUnit(habit.customUnit),
    schedule: normalizeHabitSchedule(habit.schedule, fallbackDate)
  };
}

function normalizeRecord(record: HabitRecord): HabitRecord {
  const rawQuantity = Number(record.quantity ?? record.durationMinutes ?? 0);
  const quantity = Number.isFinite(rawQuantity) ? Math.max(0, rawQuantity) : 0;

  return {
    ...record,
    done: Boolean(record.done),
    quantity
  };
}

function normalizeQuantityForMethod(method: RecordMethod, value: unknown): number {
  const numberValue = Number(value);
  const normalized = Math.max(0, Number.isFinite(numberValue) ? numberValue : 0);

  if (method === "distance" || method === "custom") {
    return Math.round(normalized * 10) / 10;
  }

  return Math.trunc(normalized);
}

function normalizeScheduleForSave(schedule: HabitSchedule, todayKey: string): HabitSchedule {
  if (schedule.type === "alternateDays") {
    return {
      type: "alternateDays",
      anchorDate: schedule.anchorDate || todayKey
    };
  }

  if (schedule.type === "weekdays") {
    return {
      type: "weekdays",
      weekdays: [...new Set(schedule.weekdays)].sort((a, b) => a - b)
    };
  }

  return { type: "daily" };
}

function makeId(prefix: string): string {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
  return `${prefix}-${randomId}`;
}

export default function HobiLogApp() {
  const todayKey = useMemo(() => toDateKey(), []);
  const [hydrated, setHydrated] = useState(false);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS.map((habit) => ({ ...habit })));
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>(DEFAULT_SETTINGS.activeTab);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [logMonth, setLogMonth] = useState(new Date());
  const [recordDraft, setRecordDraft] = useState<RecordDraft | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [habitForm, setHabitForm] = useState<HabitFormState | null>(null);
  const [deleteHabitTarget, setDeleteHabitTarget] = useState<Habit | null>(null);
  const [analyticsTarget, setAnalyticsTarget] = useState<string>(DEFAULT_HABITS[0]?.id ?? "");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>("1y");

  useEffect(() => {
    const storedHabits = localStorage.getItem(HABIT_STORAGE_KEY);
    const storedRecords = localStorage.getItem(RECORD_STORAGE_KEY);
    const storedSettings = safeParse(localStorage.getItem(SETTINGS_STORAGE_KEY), DEFAULT_SETTINGS);
    const parsedHabits = safeParseArray<Habit>(storedHabits, DEFAULT_HABITS);

    setHabits(parsedHabits.map((habit) => normalizeHabit(habit)));
    setRecords(safeParseArray<HabitRecord>(storedRecords, []).map((record) => normalizeRecord(record)));
    setActiveTab(storedSettings.activeTab ?? DEFAULT_SETTINGS.activeTab);
    setAnalyticsTarget(storedSettings.selectedAnalyticsHabitId ?? DEFAULT_HABITS[0]?.id ?? "");
    setSelectedYear(storedSettings.selectedAnalyticsYear ?? new Date().getFullYear());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(habits));
  }, [habits, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(records));
  }, [records, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        activeTab,
        selectedAnalyticsHabitId: analyticsTarget || null,
        selectedAnalyticsYear: selectedYear
      })
    );
  }, [activeTab, analyticsTarget, hydrated, selectedYear]);

  useEffect(() => {
    if (habits.length === 0) {
      if (analyticsTarget !== "") {
        setAnalyticsTarget("");
      }
      if (deleteHabitTarget) {
        setDeleteHabitTarget(null);
      }
      return;
    }

    if (!habits.some((habit) => habit.id === analyticsTarget)) {
      setAnalyticsTarget(habits[0].id);
    }
    if (deleteHabitTarget && !habits.some((habit) => habit.id === deleteHabitTarget.id)) {
      setDeleteHabitTarget(null);
    }
  }, [analyticsTarget, deleteHabitTarget, habits]);

  const activeHabitIds = useMemo(() => new Set(habits.map((habit) => habit.id)), [habits]);
  const activeRecords = useMemo(
    () => records.filter((record) => activeHabitIds.has(record.habitId)),
    [activeHabitIds, records]
  );

  useEffect(() => {
    const availableYears = getAvailableYears(activeRecords, todayKey);
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] ?? Number(todayKey.slice(0, 4)));
    }
  }, [activeRecords, selectedYear, todayKey]);

  const streaks = useMemo(() => getAllStreaks(habits, activeRecords, todayKey), [habits, activeRecords, todayKey]);
  const todayScheduledHabitIds = useMemo(
    () => new Set(habits.filter((habit) => isHabitScheduledOn(habit, todayKey)).map((habit) => habit.id)),
    [habits, todayKey]
  );
  const todayDoneCount = useMemo(
    () =>
      new Set(
        activeRecords
          .filter((record) => record.date === todayKey && record.done && todayScheduledHabitIds.has(record.habitId))
          .map((record) => record.habitId)
      ).size,
    [activeRecords, todayKey, todayScheduledHabitIds]
  );

  function openRecord(habitId: string, date: string) {
    const existing = records.find((record) => record.habitId === habitId && record.date === date);
    setRecordDraft({
      habitId,
      date,
      done: existing?.done ?? true,
      quantity: existing?.quantity ?? existing?.durationMinutes ?? 0,
      memo: existing?.memo ?? ""
    });
    setRecordError(null);
  }

  function saveRecord() {
    if (!recordDraft) return;

    if (isFutureDateKey(recordDraft.date, todayKey)) {
      setRecordError("未来日の記録は保存できません。");
      return;
    }

    const updatedAt = new Date().toISOString();
    const habit = habits.find((item) => item.id === recordDraft.habitId);
    const normalizedQuantity =
      habit?.recordMethod === "done"
        ? 0
        : normalizeQuantityForMethod(habit?.recordMethod ?? "time", recordDraft.quantity);
    const nextRecord: HabitRecord = {
      id: `${recordDraft.habitId}-${recordDraft.date}`,
      habitId: recordDraft.habitId,
      date: recordDraft.date,
      done: recordDraft.done,
      quantity: normalizedQuantity,
      memo: recordDraft.memo.trim(),
      updatedAt
    };

    setRecords((current) => {
      const withoutExisting = current.filter(
        (record) => !(record.habitId === nextRecord.habitId && record.date === nextRecord.date)
      );
      return [...withoutExisting, nextRecord].sort((a, b) => a.date.localeCompare(b.date));
    });
    setRecordDraft(null);
    setRecordError(null);
  }

  function deleteRecord() {
    if (!recordDraft) return;
    setRecords((current) =>
      current.filter((record) => !(record.habitId === recordDraft.habitId && record.date === recordDraft.date))
    );
    setRecordDraft(null);
    setRecordError(null);
  }

  function openHabitForm(habit?: Habit) {
    setHabitForm(
      habit
        ? {
            id: habit.id,
            name: habit.name,
            icon: habit.icon,
            color: habit.color,
            recordMethod: habit.recordMethod,
            customUnit: habit.customUnit ?? "",
            schedule: habit.schedule
          }
        : {
            id: null,
            name: "",
            icon: "Dumbbell",
            color: "Blue",
            recordMethod: "done",
            customUnit: "",
            schedule: { type: "daily" }
          }
    );
  }

  function saveHabit() {
    if (!habitForm) return;
    const name = habitForm.name.trim();
    if (!name) return;
    if (habitForm.recordMethod === "custom" && !habitForm.customUnit.trim()) return;
    if (habitForm.schedule.type === "weekdays" && habitForm.schedule.weekdays.length === 0) return;

    const updatedAt = new Date().toISOString();
    const schedule = normalizeScheduleForSave(habitForm.schedule, todayKey);

    setHabits((current) => {
      if (habitForm.id) {
        return current.map((habit) =>
          habit.id === habitForm.id
            ? {
                ...habit,
                name,
                icon: habitForm.icon,
                color: habitForm.color,
                recordMethod: habitForm.recordMethod,
                customUnit: habitForm.recordMethod === "custom" ? normalizeCustomUnit(habitForm.customUnit) : "",
                schedule,
                updatedAt
              }
            : habit
        );
      }

      return [
        ...current,
        {
          id: makeId("habit"),
          name,
          icon: habitForm.icon,
          color: habitForm.color,
          recordMethod: habitForm.recordMethod,
          customUnit: habitForm.recordMethod === "custom" ? normalizeCustomUnit(habitForm.customUnit) : "",
          schedule,
          createdAt: updatedAt,
          updatedAt
        }
      ];
    });
    setHabitForm(null);
  }

  function reorderHabits(nextHabits: Habit[]) {
    setHabits(nextHabits);
  }

  function confirmDeleteHabit() {
    if (!deleteHabitTarget) return;

    const remainingHabits = habits.filter((item) => item.id !== deleteHabitTarget.id);
    setHabits(remainingHabits);
    setRecords((current) => current.filter((record) => record.habitId !== deleteHabitTarget.id));
    if (analyticsTarget === deleteHabitTarget.id) {
      setAnalyticsTarget(remainingHabits[0]?.id ?? "");
    }
    setDeleteHabitTarget(null);
  }

  const activeScreen = (() => {
    if (activeTab === "log") {
      return (
        <LogScreen
          habits={habits}
          records={activeRecords}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          logMonth={logMonth}
          setLogMonth={setLogMonth}
          todayKey={todayKey}
          openRecord={openRecord}
          openHabitForm={openHabitForm}
        />
      );
    }

    if (activeTab === "chart") {
      return (
        <ChartScreen
          habits={habits}
          records={activeRecords}
          streaks={streaks}
          todayKey={todayKey}
          analyticsTarget={analyticsTarget}
          setAnalyticsTarget={setAnalyticsTarget}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          analyticsPeriod={analyticsPeriod}
          setAnalyticsPeriod={setAnalyticsPeriod}
        />
      );
    }

    if (activeTab === "habits") {
      return (
        <HabitsScreen
          habits={habits}
          openHabitForm={openHabitForm}
          deleteHabit={setDeleteHabitTarget}
          reorderHabits={reorderHabits}
        />
      );
    }

    return (
      <HomeScreen
        habits={habits}
        records={activeRecords}
        streaks={streaks}
        todayDoneCount={todayDoneCount}
        todayKey={todayKey}
        openRecord={openRecord}
        openHabitForm={openHabitForm}
      />
    );
  })();

  return (
    <main className="app-shell">
      <div className="screen">
        {activeScreen}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <RecordModal
        draft={recordDraft}
        error={recordError}
        habits={habits}
        records={records}
        setDraft={setRecordDraft}
        onClose={() => {
          setRecordDraft(null);
          setRecordError(null);
        }}
        onDelete={deleteRecord}
        onSave={saveRecord}
        todayKey={todayKey}
      />
      <HabitFormModal
        form={habitForm}
        setForm={setHabitForm}
        onClose={() => setHabitForm(null)}
        onSave={saveHabit}
        todayKey={todayKey}
      />
      <DeleteHabitModal
        habit={deleteHabitTarget}
        records={records}
        onCancel={() => setDeleteHabitTarget(null)}
        onConfirm={confirmDeleteHabit}
      />
    </main>
  );
}
