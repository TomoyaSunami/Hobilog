"use client";

import { AnimatePresence, motion, Reorder } from "framer-motion";
import {
  BarChart3,
  BeerOff,
  Bike,
  BookMarked,
  BookOpen,
  Brain,
  CalendarCheck,
  CalendarDays,
  Camera,
  Check,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Clover,
  Code,
  Crown,
  Dumbbell,
  Flame,
  Footprints,
  GlassWater,
  GraduationCap,
  Heart,
  Home,
  Info,
  Languages,
  ListChecks,
  Moon,
  Music,
  NotebookPen,
  Palette,
  Pencil,
  PenTool,
  PiggyBank,
  Plus,
  Save,
  Smile,
  Star,
  Target,
  Trash2,
  Trophy,
  UtensilsCrossed,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  COLOR_OPTIONS,
  COLOR_THEME,
  DEFAULT_HABITS,
  DEFAULT_SETTINGS,
  HABIT_STORAGE_KEY,
  ICON_OPTIONS,
  RECORD_METHOD_META,
  RECORD_METHOD_OPTIONS,
  RECORD_STORAGE_KEY,
  SETTINGS_STORAGE_KEY
} from "@/lib/constants";
import {
  addMonths,
  formatMonthTitle,
  formatShortDate,
  formatWeekday,
  getMonthCalendarDays,
  isFutureDateKey,
  toDateKey
} from "@/lib/date";
import {
  buildYearHeatmap,
  buildCumulativeSeries,
  getAllStreaks,
  getAnalyticsRange,
  getAvailableYears,
  getSummaryStats
} from "@/lib/analytics";
import type { AnalyticsPeriod, Habit, HabitColor, HabitIcon, HabitRecord, RecordMethod, TabId } from "@/types";

type InlineIconProps = {
  "aria-hidden"?: boolean | "true" | "false";
  color?: string;
  size?: number;
  strokeWidth?: number;
};

function SideBendStretch({
  "aria-hidden": ariaHidden,
  color = "currentColor",
  size = 24,
  strokeWidth = 2
}: InlineIconProps) {
  return (
    <svg
      aria-hidden={ariaHidden}
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      <circle cx="15.5" cy="4.3" r="2" />
      <path d="M14.3 6.4c-2.2 1.8-3.4 4-3.6 6.8" />
      <path d="M13.7 7.7 8.8 5.4" />
      <path d="M8.8 5.4 5.7 3" />
      <path d="M13.4 8.7 18 11" />
      <path d="m10.7 13.2-4 6.1" />
      <path d="m10.7 13.2 5.7 6.1" />
      <path d="M5.2 19.3h3.2" />
      <path d="M14.8 19.3h3.2" />
    </svg>
  );
}

function BucketCloth({
  "aria-hidden": ariaHidden,
  color = "currentColor",
  size = 24,
  strokeWidth = 2
}: InlineIconProps) {
  const visualSize = Math.round(size * 1.16);

  return (
    <svg
      aria-hidden={ariaHidden}
      fill="none"
      height={visualSize}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={visualSize}
    >
      <path d="M7 10h10l-1 9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" />
      <path d="M9 10V8a3 3 0 0 1 6 0v2" />
      <path d="M10 10v5a2 2 0 0 0 4 0v-5" />
      <path d="M10 15h4" />
    </svg>
  );
}

const iconMap = {
  Dumbbell,
  Palette,
  BookOpen,
  PenTool,
  Brain,
  Music,
  Code,
  Heart,
  Footprints,
  Bike,
  SideBendStretch,
  BeerOff,
  BookMarked,
  NotebookPen,
  GraduationCap,
  Languages,
  Camera,
  ChefHat,
  BucketCloth,
  PiggyBank,
  Moon,
  GlassWater,
  UtensilsCrossed,
  Target,
  Star,
  Clover,
  Trophy,
  Smile
};

const habitIconLabels: Record<HabitIcon, string> = {
  Dumbbell: "トレーニング",
  Palette: "制作",
  BookOpen: "学習",
  PenTool: "執筆",
  Brain: "思考",
  Music: "音楽",
  Code: "開発",
  Heart: "健康",
  Footprints: "ウォーキング",
  Bike: "サイクリング",
  SideBendStretch: "ストレッチ",
  BeerOff: "禁酒",
  BookMarked: "読書",
  NotebookPen: "日記",
  GraduationCap: "資格",
  Languages: "語学",
  Camera: "写真",
  ChefHat: "料理",
  BucketCloth: "掃除",
  PiggyBank: "家計",
  Moon: "睡眠",
  GlassWater: "水分補給",
  UtensilsCrossed: "食事",
  Target: "目標",
  Star: "星",
  Clover: "クローバー",
  Trophy: "達成",
  Smile: "気分"
};

const tabItems: Array<{ id: TabId; label: string; icon: typeof Home }> = [
  { id: "home", label: "ホーム", icon: Home },
  { id: "log", label: "ログ", icon: ClipboardList },
  { id: "chart", label: "分析", icon: BarChart3 },
  { id: "habits", label: "習慣", icon: ListChecks }
];

const periodLabels: Record<AnalyticsPeriod, string> = {
  "1m": "1ヶ月",
  "3m": "3ヶ月",
  "6m": "6ヶ月",
  "1y": "1年",
  all: "全期間"
};

type RecordDraft = {
  habitId: string;
  date: string;
  done: boolean;
  quantity: number;
  memo: string;
};

type HabitFormState = {
  id: string | null;
  name: string;
  icon: HabitIcon;
  color: HabitColor;
  recordMethod: RecordMethod;
  customUnit: string;
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
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
  return {
    ...habit,
    icon: normalizeHabitIcon(habit.icon),
    recordMethod: inferRecordMethod(habit),
    customUnit: normalizeCustomUnit(habit.customUnit)
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

function getHabitUnit(habit: Habit): string {
  if (habit.recordMethod === "custom") {
    return habit.customUnit?.trim() || "単位";
  }

  return RECORD_METHOD_META[habit.recordMethod].unit;
}

function formatRecordValue(habit: Habit, record: HabitRecord | RecordDraft | null | undefined): string {
  if (!record?.done) return "未実施";

  if (habit.recordMethod === "done") {
    return "実施済み";
  }

  const quantity = Math.max(0, Number(record.quantity) || 0);
  const value = Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);
  return `${value}${getHabitUnit(habit)}`;
}

function normalizeQuantityForMethod(method: RecordMethod, value: unknown): number {
  const numberValue = Number(value);
  const normalized = Math.max(0, Number.isFinite(numberValue) ? numberValue : 0);

  if (method === "distance" || method === "custom") {
    return Math.round(normalized * 10) / 10;
  }

  return Math.trunc(normalized);
}

function makeId(prefix: string): string {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
  return `${prefix}-${randomId}`;
}

function HabitIconView({
  icon,
  size = 22,
  color = "currentColor"
}: {
  icon: HabitIcon;
  size?: number;
  color?: string;
}) {
  const Icon = iconMap[icon] ?? Dumbbell;
  return <Icon aria-hidden="true" color={color} size={size} strokeWidth={2.25} />;
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
    const parsedHabits = storedHabits ? safeParse<Habit[]>(storedHabits, DEFAULT_HABITS) : DEFAULT_HABITS;

    setHabits(parsedHabits.map((habit) => normalizeHabit(habit)));
    setRecords(safeParse<HabitRecord[]>(storedRecords, []).map((record) => normalizeRecord(record)));
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

  useEffect(() => {
    const availableYears = getAvailableYears(records, todayKey);
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [records, selectedYear, todayKey]);

  const streaks = useMemo(() => getAllStreaks(habits, records, todayKey), [habits, records, todayKey]);
  const todayDoneCount = useMemo(
    () => new Set(records.filter((record) => record.date === todayKey && record.done).map((record) => record.habitId)).size,
    [records, todayKey]
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
            customUnit: habit.customUnit ?? ""
          }
        : {
            id: null,
            name: "",
            icon: "Dumbbell",
            color: "Blue",
            recordMethod: "done",
            customUnit: ""
          }
    );
  }

  function saveHabit() {
    if (!habitForm) return;
    const name = habitForm.name.trim();
    if (!name) return;
    if (habitForm.recordMethod === "custom" && !habitForm.customUnit.trim()) return;

    const updatedAt = new Date().toISOString();

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
          records={records}
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
          records={records}
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
        records={records}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {activeScreen}
          </motion.div>
        </AnimatePresence>
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

function HomeScreen({
  habits,
  records,
  streaks,
  todayDoneCount,
  todayKey,
  openRecord,
  openHabitForm
}: {
  habits: Habit[];
  records: HabitRecord[];
  streaks: ReturnType<typeof getAllStreaks>;
  todayDoneCount: number;
  todayKey: string;
  openRecord: (habitId: string, date: string) => void;
  openHabitForm: () => void;
}) {
  const progress = habits.length ? Math.round((todayDoneCount / habits.length) * 100) : 0;
  const isComplete = habits.length > 0 && todayDoneCount === habits.length;
  const progressStatus = todayDoneCount === 0 ? "未実施" : isComplete ? "完了" : "進行中";

  return (
    <section>
      <div className="glass-card mb-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-hobi-muted">今日の進捗</p>
            <p className="mt-1 text-sm font-semibold text-hobi-muted">{formatShortDate(todayKey)} {formatWeekday()}</p>
            <p className="mt-2 text-3xl font-black text-hobi-ink">
              {todayDoneCount}
              <span className="text-base font-bold text-hobi-muted"> / {habits.length}</span>
            </p>
            <p className="mt-1 text-sm font-bold text-hobi-muted">{progressStatus}</p>
          </div>
          {isComplete ? (
            <div className="icon-bubble bg-blue-50 text-hobi-blue">
              <Check size={24} />
            </div>
          ) : null}
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-hobi-blue transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          description="最初の習慣を追加して、今日の記録を始めましょう。"
          icon={<ListChecks size={24} />}
          title="まだ習慣がありません"
          onAction={openHabitForm}
        />
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const theme = COLOR_THEME[habit.color];
            const todayRecord = records.find((record) => record.habitId === habit.id && record.date === todayKey);
            const streak = streaks.find((item) => item.habitId === habit.id);
            const isDone = Boolean(todayRecord?.done);

            return (
              <article
                className="glass-card p-4"
                key={habit.id}
                style={
                  isDone
                    ? {
                        borderColor: theme.border,
                        background: `linear-gradient(135deg, ${theme.soft}, rgba(255, 255, 255, 0.9))`
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-4">
                  <div className="icon-bubble" style={{ background: theme.soft, color: theme.text }}>
                    <HabitIconView icon={habit.icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h2 className="min-w-0 truncate text-lg font-black text-hobi-ink">{habit.name}</h2>
                      {isDone ? (
                        <span
                          className="inline-flex flex-none items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs font-black"
                          style={{ color: theme.text }}
                        >
                          <Check size={13} />
                          実施済み
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-hobi-muted">
                      {RECORD_METHOD_META[habit.recordMethod].label} / 連続 {streak?.current ?? 0} 日
                    </p>
                    <p className="mt-1 text-sm text-hobi-muted">
                      今日: {formatRecordValue(habit, todayRecord)}
                    </p>
                  </div>
                  <button
                    className={cx(isDone ? "secondary-button px-3" : "primary-button px-3")}
                    onClick={() => openRecord(habit.id, todayKey)}
                    type="button"
                  >
                    <Pencil size={17} />
                    {isDone ? "編集" : "記録"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function LogScreen({
  habits,
  records,
  selectedDate,
  setSelectedDate,
  logMonth,
  setLogMonth,
  todayKey,
  openRecord,
  openHabitForm
}: {
  habits: Habit[];
  records: HabitRecord[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  logMonth: Date;
  setLogMonth: (date: Date) => void;
  todayKey: string;
  openRecord: (habitId: string, date: string) => void;
  openHabitForm: () => void;
}) {
  const monthDays = useMemo(() => getMonthCalendarDays(logMonth), [logMonth]);

  return (
    <section>
      <div className="glass-card mb-4 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button className="secondary-button h-10 min-h-10 w-10 px-0" onClick={() => setLogMonth(addMonths(logMonth, -1))} type="button">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-black text-hobi-ink">{formatMonthTitle(logMonth)}</h2>
          <button className="secondary-button h-10 min-h-10 w-10 px-0" onClick={() => setLogMonth(addMonths(logMonth, 1))} type="button">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="calendar-grid mb-2 text-center text-xs font-black text-hobi-muted">
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {monthDays.map((day) => {
            const dateKey = toDateKey(day);
            const isCurrentMonth = day.getMonth() === logMonth.getMonth();
            const isSelected = selectedDate === dateKey;
            const doneHabitDots = records
              .filter((record) => record.date === dateKey && record.done)
              .slice(0, 3)
              .map((record) => {
                const habit = habits.find((item) => item.id === record.habitId);
                return habit ? COLOR_THEME[habit.color].solid : COLOR_THEME.Blue.solid;
              });
            const isFuture = isFutureDateKey(dateKey, todayKey);

            return (
              <button
                className={cx(
                  "min-h-[48px] rounded-2xl border text-sm font-black transition",
                  isSelected
                    ? "border-hobi-blue bg-blue-50 text-hobi-blue"
                    : "border-transparent bg-white/50 text-hobi-ink",
                  !isCurrentMonth && "opacity-40",
                  isFuture && "text-hobi-muted"
                )}
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                type="button"
              >
                <span>{day.getDate()}</span>
                <span className="mt-1 flex justify-center gap-1">
                  {doneHabitDots.map((color, index) => (
                    <span className="h-1.5 w-1.5 rounded-full" key={`${dateKey}-${index}`} style={{ background: color }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          description="習慣を追加すると、日付ごとに実施状況を確認できます。"
          icon={<CalendarCheck size={24} />}
          title="記録する習慣がありません"
          onAction={openHabitForm}
        />
      ) : (
        <div className="glass-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-hobi-ink">{formatShortDate(selectedDate)}</h2>
            {isFutureDateKey(selectedDate, todayKey) ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-hobi-muted">記録不可</span>
            ) : null}
          </div>
          <div className="space-y-3">
            {habits.map((habit) => {
              const theme = COLOR_THEME[habit.color];
              const record = records.find((item) => item.habitId === habit.id && item.date === selectedDate);
              const isFuture = isFutureDateKey(selectedDate, todayKey);

              return (
                <button
                  className="flex w-full items-center gap-3 rounded-2xl border border-hobi-border bg-white/60 p-3 text-left disabled:opacity-55"
                  disabled={isFuture}
                  key={habit.id}
                  onClick={() => openRecord(habit.id, selectedDate)}
                  type="button"
                >
                  <div className="icon-bubble h-11 w-11 flex-none" style={{ background: theme.soft, color: theme.text }}>
                    <HabitIconView icon={habit.icon} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-hobi-ink">{habit.name}</p>
                    <p className="text-sm text-hobi-muted">{formatRecordValue(habit, record)}</p>
                  </div>
                  <ChevronRight className="text-hobi-muted" size={18} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function ChartScreen({
  habits,
  records,
  streaks,
  todayKey,
  analyticsTarget,
  setAnalyticsTarget,
  selectedYear,
  setSelectedYear,
  analyticsPeriod,
  setAnalyticsPeriod
}: {
  habits: Habit[];
  records: HabitRecord[];
  streaks: ReturnType<typeof getAllStreaks>;
  todayKey: string;
  analyticsTarget: string;
  setAnalyticsTarget: (target: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  analyticsPeriod: AnalyticsPeriod;
  setAnalyticsPeriod: (period: AnalyticsPeriod) => void;
}) {
  const availableYears = useMemo(() => getAvailableYears(records, todayKey), [records, todayKey]);
  const targetHabit = habits.find((habit) => habit.id === analyticsTarget) ?? habits[0] ?? null;
  const targetId = targetHabit?.id ?? "";
  const selectedStreak = streaks.find((streak) => streak.habitId === targetId) ?? {
    habitId: targetId,
    current: 0,
    previous: 0,
    best: 0,
    bestDate: null
  };
  const streakDiff = selectedStreak.current - selectedStreak.previous;
  const range = getAnalyticsRange(selectedYear, analyticsPeriod, records, targetId, todayKey);
  const isValueBased = targetHabit ? targetHabit.recordMethod !== "done" : false;
  const metricUnit = targetHabit ? getHabitUnit(targetHabit) : "日";
  const chartUnit = isValueBased ? metricUnit : "日";
  const chartData = buildCumulativeSeries(
    targetId,
    records,
    range.startKey,
    range.endKey,
    isValueBased ? "quantity" : "days"
  );
  const summary = getSummaryStats(records, range.startKey, range.endKey, targetId);
  const heatmapCells = useMemo(
    () => buildYearHeatmap(selectedYear, records, targetId),
    [records, selectedYear, targetId]
  );
  const heatmapRows = useMemo(() => {
    const rows: Array<{ label: string; cells: typeof heatmapCells }> = [];

    for (let index = 0; index < heatmapCells.length; index += 7) {
      const cells = heatmapCells.slice(index, index + 7);
      const monthStartKey = cells.find((cell) => cell.date?.endsWith("-01"))?.date;

      rows.push({
        label: monthStartKey ? `${Number(monthStartKey.slice(5, 7))}月` : "",
        cells
      });
    }

    return rows;
  }, [heatmapCells]);
  const hasDoneRecords = summary.totalDone > 0;
  const hasYearDoneRecords = records.some(
    (record) => record.habitId === targetId && record.done && record.date.startsWith(`${selectedYear}-`)
  );
  const emptyChartTitle =
    analyticsPeriod === "all"
      ? "全期間のデータはありません"
      : hasYearDoneRecords
        ? "この期間のデータはありません"
        : "この年のデータはありません";
  const analyticsItems: MetricTileProps[] = [
    {
      icon: <Flame size={21} />,
      label: "現在連続",
      value: selectedStreak.current,
      unit: "日",
      subLabel: `昨日から ${streakDiff >= 0 ? "+" : ""}${streakDiff}`,
      variant: "blue"
    },
    {
      icon: <Crown size={21} />,
      label: "最長連続",
      value: selectedStreak.best,
      unit: "日",
      subLabel: selectedStreak.bestDate ? `${formatShortDate(selectedStreak.bestDate)} 達成` : "-",
      variant: "amber"
    },
    {
      icon: <Clock size={21} />,
      label: isValueBased ? "総記録量" : "総実施日数",
      value: isValueBased ? summary.totalQuantity.toFixed(summary.totalQuantity % 1 === 0 ? 0 : 1) : summary.totalDone,
      unit: isValueBased ? metricUnit : "日",
      subLabel: "対象期間内",
      variant: "blue"
    },
    {
      icon: <CalendarCheck size={21} />,
      label: "実施日数",
      value: summary.activeDays,
      unit: "日",
      subLabel: "ユニーク日数",
      variant: "cyan"
    },
    {
      icon: <Star size={21} />,
      label: isValueBased ? "平均/実施日" : "平均/日",
      value: (isValueBased ? summary.averageQuantityPerActiveDay : summary.averagePerDay).toFixed(1),
      unit: isValueBased ? metricUnit : "回",
      subLabel: isValueBased ? "実施日の平均" : "1日平均",
      variant: "purple"
    },
    {
      icon: <BarChart3 size={21} />,
      label: "実施率",
      value: Math.round(summary.completionRate),
      unit: "%",
      subLabel: "実施日 ÷ 期間",
      variant: "pink"
    }
  ];
  const [isTargetMenuOpen, setIsTargetMenuOpen] = useState(false);
  const yearControl = (
    <label className="soft-control flex items-center gap-2 px-3 py-2">
      <CalendarDays className="text-hobi-blue" size={16} />
      <select
        className="bg-transparent text-sm font-black text-hobi-ink outline-none"
        onChange={(event) => setSelectedYear(Number(event.target.value))}
        value={selectedYear}
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}年
          </option>
        ))}
      </select>
    </label>
  );

  if (!targetHabit) {
    return (
      <section>
        <div className="glass-card p-6 text-center">
          <p className="text-lg font-black text-hobi-ink">分析する習慣がありません</p>
          <p className="mt-2 text-sm font-semibold text-hobi-muted">習慣タブで習慣を追加すると分析を表示できます</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className={cx("glass-card relative mb-3 overflow-visible p-4", isTargetMenuOpen ? "z-50" : "z-10")}>
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-hobi-ink">対象習慣</h2>
            {yearControl}
          </div>
          <button
            aria-expanded={isTargetMenuOpen}
            aria-haspopup="listbox"
            className="flex min-h-[58px] w-full items-center gap-3 rounded-2xl border border-hobi-border bg-white/80 px-3 py-2 text-left shadow-control transition hover:border-blue-200"
            onClick={() => setIsTargetMenuOpen((open) => !open)}
            type="button"
          >
            <span
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
              style={{
                background: COLOR_THEME[targetHabit.color].soft,
                color: COLOR_THEME[targetHabit.color].text
              }}
            >
              <HabitIconView icon={targetHabit.icon} size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-black text-hobi-ink">{targetHabit.name}</span>
            </span>
            <ChevronDown
              className={cx("text-hobi-muted transition", isTargetMenuOpen && "rotate-180 text-hobi-blue")}
              size={20}
            />
          </button>
          <AnimatePresence>
            {isTargetMenuOpen ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="target-menu-scroll absolute left-0 right-0 top-full z-[100] mt-2 rounded-2xl border border-hobi-border bg-white p-2 shadow-glass"
                exit={{ opacity: 0, y: -6 }}
                initial={{ opacity: 0, y: -6 }}
                role="listbox"
                transition={{ duration: 0.16 }}
              >
                {habits.map((habit) => {
                  const theme = COLOR_THEME[habit.color];
                  const isActive = targetId === habit.id;

                  return (
                    <button
                      aria-selected={isActive}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                        isActive ? "bg-blue-50" : "hover:bg-slate-50"
                      )}
                      key={habit.id}
                      onClick={() => {
                        setAnalyticsTarget(habit.id);
                        setIsTargetMenuOpen(false);
                      }}
                      role="option"
                      type="button"
                    >
                      <span
                        className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
                        style={{ background: theme.soft, color: theme.text }}
                      >
                        <HabitIconView icon={habit.icon} size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-hobi-ink">{habit.name}</span>
                      </span>
                      {isActive ? <Check className="text-hobi-blue" size={18} /> : null}
                    </button>
                  );
                })}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="glass-card mb-4 p-4">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-black text-hobi-ink">
            年間ヒートマップ <Info size={17} className="text-hobi-muted" />
          </h2>
        </div>
        <div className="heatmap-scroll">
          <div className="heatmap-year-grid">
            <span />
            {["日", "月", "火", "水", "木", "金", "土"].map((label) => (
              <span className="heatmap-axis-label heatmap-day-label" key={label}>
                {label}
              </span>
            ))}
            {heatmapRows.map((row, rowIndex) => (
              <div className="contents" key={`week-${rowIndex}`}>
                <span className="heatmap-axis-label">{row.label}</span>
                {row.cells.map((cell, cellIndex) => (
                  <span
                    className="heatmap-cell"
                    key={`${cell.date ?? `blank-${rowIndex}`}-${cellIndex}`}
                    style={{ background: getHeatmapColor(cell.value, cell.isInYear, targetHabit) }}
                    title={cell.date ? `${formatShortDate(cell.date)}: ${cell.value}回` : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-bold text-hobi-muted">
          {[
            ["未実施", 0],
            ["実施", 1]
          ].map(([label, value]) => (
            <span className="flex items-center gap-2" key={label}>
              <span
                className="heatmap-cell"
                style={{ background: getHeatmapColor(Number(value), true, targetHabit) }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card mb-4 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-black text-hobi-ink">
            {isValueBased ? "累計記録量の推移" : "累計実施日数の推移"} <Info size={17} className="text-hobi-muted" />
          </h2>
          <div className="rounded-full bg-slate-100 p-1 text-sm font-black">
            {(Object.keys(periodLabels) as AnalyticsPeriod[]).map((period) => (
              <button
                className={cx(
                  "rounded-full px-3 py-1.5",
                  analyticsPeriod === period && "bg-hobi-blue text-white shadow-control"
                )}
                key={period}
                onClick={() => setAnalyticsPeriod(period)}
                type="button"
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>
        {hasDoneRecords ? (
          <>
            <div className="h-[260px]">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ bottom: 8, left: -18, right: 12, top: 8 }}>
                  <CartesianGrid stroke="#DDE7F5" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="date"
                    minTickGap={26}
                    stroke="#6B7A99"
                    tickFormatter={(value) =>
                      analyticsPeriod === "all"
                        ? String(value).slice(0, 7).replace("-", "/")
                        : String(value).slice(5).replace("-", "/")
                    }
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} stroke="#6B7A99" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #DDE7F5",
                      borderRadius: 16,
                      boxShadow: "0 18px 48px rgba(47, 103, 255, 0.14)"
                    }}
                    formatter={(value, name) => [`${value}${chartUnit}`, name]}
                    labelFormatter={(value) => formatShortDate(String(value))}
                  />
                  <Line
                    dataKey="value"
                    dot={false}
                    isAnimationActive={false}
                    name={targetHabit.name}
                    stroke={COLOR_THEME[targetHabit.color].solid}
                    strokeWidth={3}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-5 text-sm font-black text-hobi-muted">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: COLOR_THEME[targetHabit.color].solid }} />
                {targetHabit.name}
              </span>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-hobi-border bg-white/60 p-6 text-center">
            <p className="text-lg font-black text-hobi-ink">{emptyChartTitle}</p>
            <p className="mt-2 text-sm font-semibold text-hobi-muted">対象期間に記録があると、ここに推移が表示されます</p>
          </div>
        )}

        <div className="mt-5 border-t border-hobi-border pt-4">
          <h3 className="mb-4 text-lg font-black text-hobi-ink">分析指標</h3>
          <div className="grid grid-cols-2 gap-3">
            {analyticsItems.map((item) => (
              <MetricTile key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HabitsScreen({
  habits,
  openHabitForm,
  deleteHabit,
  reorderHabits
}: {
  habits: Habit[];
  openHabitForm: (habit?: Habit) => void;
  deleteHabit: (habit: Habit) => void;
  reorderHabits: (habits: Habit[]) => void;
}) {
  return (
    <section>
      {habits.length > 0 ? (
        <button className="primary-button mb-4 w-full" onClick={() => openHabitForm()} type="button">
          <Plus size={18} />
          新しい習慣を追加
        </button>
      ) : null}

      {habits.length === 0 ? (
        <EmptyState
          description="トレーニング、勉強、読書など、続けたいことを追加しましょう。"
          icon={<Plus size={24} />}
          title="登録済みの習慣がありません"
          actionLabel="新しい習慣を追加"
          onAction={() => openHabitForm()}
        />
      ) : (
        <Reorder.Group as="div" axis="y" className="space-y-3" onReorder={reorderHabits} values={habits}>
          {habits.map((habit) => (
            <HabitReorderItem
              deleteHabit={deleteHabit}
              habit={habit}
              key={habit.id}
              openHabitForm={openHabitForm}
            />
          ))}
        </Reorder.Group>
      )}
    </section>
  );
}

function HabitReorderItem({
  habit,
  openHabitForm,
  deleteHabit
}: {
  habit: Habit;
  openHabitForm: (habit?: Habit) => void;
  deleteHabit: (habit: Habit) => void;
}) {
  const theme = COLOR_THEME[habit.color];

  return (
    <Reorder.Item
      as="article"
      className="glass-card list-none p-4 cursor-grab touch-none active:cursor-grabbing"
      value={habit}
      whileDrag={{ scale: 1.02, boxShadow: "0 22px 54px rgba(16, 35, 74, 0.18)" }}
    >
      <div className="flex items-center gap-4">
        <div className="icon-bubble" style={{ background: theme.soft, color: theme.text }}>
          <HabitIconView icon={habit.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-black text-hobi-ink">{habit.name}</h2>
          <p className="mt-1 truncate text-sm font-bold text-hobi-muted">
            記録方法: {RECORD_METHOD_META[habit.recordMethod].label}
            {habit.recordMethod === "custom" && habit.customUnit ? ` / ${habit.customUnit}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            aria-label={`${habit.name}を編集`}
            className="secondary-button h-10 min-h-10 w-10 cursor-pointer px-0"
            onClick={() => openHabitForm(habit)}
            onPointerDown={(event) => event.stopPropagation()}
            title="編集"
            type="button"
          >
            <Pencil size={16} />
          </button>
          <button
            aria-label={`${habit.name}を削除`}
            className="danger-button h-10 min-h-10 w-10 cursor-pointer px-0"
            onClick={() => deleteHabit(habit)}
            onPointerDown={(event) => event.stopPropagation()}
            title="削除"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

type MetricTileProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit: string;
  subLabel?: string;
  variant: "blue" | "cyan" | "purple" | "amber" | "pink";
};

function getMetricTheme(variant: MetricTileProps["variant"]) {
  if (variant === "cyan") {
    return { color: "#25C3D8", background: "rgba(37, 195, 216, 0.13)" };
  }

  if (variant === "purple") {
    return { color: "#8B5CF6", background: "rgba(139, 92, 246, 0.13)" };
  }

  if (variant === "amber") {
    return { color: "#B89B00", background: "rgba(255, 221, 0, 0.2)" };
  }

  if (variant === "pink") {
    return { color: "#F044B8", background: "rgba(240, 68, 184, 0.13)" };
  }

  return { color: "#2F67FF", background: "rgba(47, 103, 255, 0.12)" };
}

function MetricTile({
  icon,
  label,
  value,
  unit,
  subLabel,
  variant
}: MetricTileProps) {
  const { background, color } = getMetricTheme(variant);

  return (
    <div className="rounded-2xl border border-hobi-border bg-white/60 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-black text-hobi-muted">{label}</p>
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full" style={{ background, color }}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-black leading-none text-hobi-ink">
        {value}
        <span className="ml-1 text-sm font-bold text-hobi-muted">{unit}</span>
      </p>
      {subLabel ? <p className="mt-2 truncate text-xs font-bold text-hobi-muted">{subLabel}</p> : null}
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
  actionLabel = "習慣を追加",
  onAction
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <div className="glass-card p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-hobi-blue">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-black text-hobi-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-[300px] text-sm font-semibold leading-6 text-hobi-muted">{description}</p>
      <button className="primary-button mt-5 w-full" onClick={onAction} type="button">
        <Plus size={18} />
        {actionLabel}
      </button>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }: { activeTab: TabId; setActiveTab: (tab: TabId) => void }) {
  return (
    <nav className="tabbar">
      <div className="grid grid-cols-4 gap-1">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              className={cx(
                "relative flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl text-sm font-black transition",
                isActive ? "text-hobi-blue" : "text-hobi-ink"
              )}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
            >
              <Icon size={25} strokeWidth={2.1} />
              <span>{item.label}</span>
              {isActive ? <span className="absolute bottom-0 h-1 w-9 rounded-full bg-hobi-blue" /> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function RecordModal({
  draft,
  error,
  habits,
  records,
  setDraft,
  onClose,
  onDelete,
  onSave,
  todayKey
}: {
  draft: RecordDraft | null;
  error: string | null;
  habits: Habit[];
  records: HabitRecord[];
  setDraft: (draft: RecordDraft) => void;
  onClose: () => void;
  onDelete: () => void;
  onSave: () => void;
  todayKey: string;
}) {
  const habit = habits.find((item) => item.id === draft?.habitId);
  const existing = records.some((record) => record.habitId === draft?.habitId && record.date === draft?.date);

  if (!draft || !habit) return null;

  const methodMeta = RECORD_METHOD_META[habit.recordMethod];
  const unit = getHabitUnit(habit);
  const shouldShowQuantity = habit.recordMethod !== "done";

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/20 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="glass-card w-full max-w-[430px] p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="icon-bubble h-12 w-12"
              style={{ background: COLOR_THEME[habit.color].soft, color: COLOR_THEME[habit.color].text }}
            >
              <HabitIconView icon={habit.icon} />
            </div>
            <div className="min-w-0">
              <p className="whitespace-nowrap text-sm font-bold text-hobi-muted">記録入力</p>
              <h2 className="truncate whitespace-nowrap text-xl font-black text-hobi-ink">{habit.name}</h2>
            </div>
          </div>
          <button className="secondary-button h-10 min-h-10 w-10 px-0" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-black text-hobi-muted">日付</span>
            <input
              className="field date-field"
              max={todayKey}
              onChange={(event) => {
                const nextDate = event.target.value;
                const existingForDate = records.find(
                  (record) => record.habitId === draft.habitId && record.date === nextDate
                );
                setDraft({
                  ...draft,
                  date: nextDate,
                  done: existingForDate?.done ?? draft.done,
                  quantity: existingForDate?.quantity ?? existingForDate?.durationMinutes ?? draft.quantity,
                  memo: existingForDate?.memo ?? draft.memo
                });
              }}
              type="date"
              value={draft.date}
            />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-hobi-border bg-white/60 p-3">
            <span className="font-black text-hobi-ink">実施した</span>
            <input
              checked={draft.done}
              className="h-6 w-6 accent-hobi-blue"
              onChange={(event) => setDraft({ ...draft, done: event.target.checked })}
              type="checkbox"
            />
          </label>
          {shouldShowQuantity ? (
            <label className="block">
              <span className="mb-2 block text-sm font-black text-hobi-muted">
                {habit.recordMethod === "custom" ? `記録値 ${unit}` : methodMeta.inputLabel}
              </span>
              <input
                className="field"
                enterKeyHint="done"
                inputMode="decimal"
                min={0}
                onChange={(event) => setDraft({ ...draft, quantity: Math.max(0, Number(event.target.value) || 0) })}
                onFocus={(event) => event.target.select()}
                placeholder={methodMeta.placeholder}
                step={habit.recordMethod === "distance" ? "0.1" : "1"}
                type="number"
                value={draft.quantity}
              />
            </label>
          ) : (
            <div className="rounded-2xl border border-hobi-border bg-white/60 px-4 py-3">
              <p className="text-sm font-black text-hobi-muted">記録方法</p>
              <p className="mt-1 font-black text-hobi-ink">実施のみ</p>
            </div>
          )}
          <label className="block">
            <span className="mb-2 block text-sm font-black text-hobi-muted">メモ</span>
            <textarea
              className="field min-h-[92px] resize-none"
              onChange={(event) => setDraft({ ...draft, memo: event.target.value })}
              value={draft.memo}
            />
          </label>
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">{error}</p> : null}
        </div>

        <div className="mt-5 flex gap-3">
          {existing ? (
            <button className="danger-button flex-1" onClick={onDelete} type="button">
              <Trash2 size={17} />
              削除
            </button>
          ) : null}
          <button className="primary-button flex-[2]" onClick={onSave} type="button">
            <Save size={17} />
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}

function HabitFormModal({
  form,
  setForm,
  onClose,
  onSave
}: {
  form: HabitFormState | null;
  setForm: (form: HabitFormState) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!form) return null;

  const canSave = form.name.trim().length > 0 && (form.recordMethod !== "custom" || form.customUnit.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/20 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="glass-card flex max-h-[calc(100dvh-32px)] w-full max-w-[430px] flex-col p-5">
        <div className="mb-5 flex flex-none items-center justify-between">
          <div>
            <p className="text-sm font-bold text-hobi-muted">習慣管理</p>
            <h2 className="text-xl font-black text-hobi-ink">{form.id ? "習慣を編集" : "新しい習慣を追加"}</h2>
          </div>
          <button className="secondary-button h-10 min-h-10 w-10 px-0" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="-mx-1 min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-1">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-hobi-muted">習慣名</span>
            <input
              className="field"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="例: 読書"
              value={form.name}
            />
          </label>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="block text-sm font-black text-hobi-muted">アイコン</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-hobi-muted">
                選択中: {habitIconLabels[form.icon]}
              </span>
            </div>
            <div className="icon-picker-scroll">
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    aria-label={habitIconLabels[icon]}
                    aria-pressed={form.icon === icon}
                    className={cx(
                      "flex aspect-square items-center justify-center rounded-2xl border text-hobi-muted transition",
                      form.icon === icon ? "shadow-control" : "border-hobi-border bg-white/60 hover:bg-white"
                    )}
                    key={icon}
                    onClick={() => setForm({ ...form, icon })}
                    style={
                      form.icon === icon
                        ? {
                            background: COLOR_THEME[form.color].soft,
                            borderColor: COLOR_THEME[form.color].border,
                            color: COLOR_THEME[form.color].solid
                          }
                        : undefined
                    }
                    title={habitIconLabels[icon]}
                    type="button"
                  >
                    <HabitIconView icon={icon} size={24} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-black text-hobi-muted">テーマカラー</span>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  className={cx(
                    "flex items-center gap-2 rounded-2xl border p-3 text-sm font-black",
                    form.color === color ? "border-hobi-blue bg-blue-50" : "border-hobi-border bg-white/60"
                  )}
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  type="button"
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: COLOR_THEME[color].solid }} />
                  {COLOR_THEME[color].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="block text-sm font-black text-hobi-muted">記録方法</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-hobi-muted">
                選択中: {RECORD_METHOD_META[form.recordMethod].label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {RECORD_METHOD_OPTIONS.map((method) => {
                const isSelected = form.recordMethod === method;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={cx(
                      "flex items-center gap-2 rounded-2xl border p-3 text-left text-sm font-black transition",
                      isSelected ? "border-hobi-blue bg-blue-50 text-hobi-blue" : "border-hobi-border bg-white/60 text-hobi-ink"
                    )}
                    key={method}
                    onClick={() => setForm({ ...form, recordMethod: method })}
                    type="button"
                  >
                    <span
                      className={cx(
                        "flex h-5 w-5 flex-none items-center justify-center rounded-full border",
                        isSelected ? "border-hobi-blue bg-hobi-blue text-white" : "border-slate-300 bg-white"
                      )}
                    >
                      {isSelected ? <Check size={13} strokeWidth={3} /> : null}
                    </span>
                    {RECORD_METHOD_META[method].label}
                  </button>
                );
              })}
            </div>
          </div>

          {form.recordMethod === "custom" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-black text-hobi-muted">カスタム単位</span>
              <input
                className="field"
                maxLength={12}
                onChange={(event) => setForm({ ...form, customUnit: event.target.value })}
                placeholder="例: 単語、枚"
                value={form.customUnit}
              />
              <span className="mt-2 block text-xs font-bold text-hobi-muted">記録時の数値の後ろに表示されます。</span>
            </label>
          ) : null}
        </div>

        <button
          className="primary-button mt-5 w-full flex-none disabled:opacity-50"
          disabled={!canSave}
          onClick={onSave}
          type="button"
        >
          <Save size={17} />
          保存する
        </button>
      </div>
    </div>
  );
}

function DeleteHabitModal({
  habit,
  records,
  onCancel,
  onConfirm
}: {
  habit: Habit | null;
  records: HabitRecord[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!habit) return null;

  const theme = COLOR_THEME[habit.color];
  const relatedRecordCount = records.filter((record) => record.habitId === habit.id).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/20 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="glass-card w-full max-w-[430px] p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-hobi-muted">習慣削除</p>
            <h2 className="mt-1 text-xl font-black text-hobi-ink">この習慣を削除しますか？</h2>
          </div>
          <button className="secondary-button h-10 min-h-10 w-10 px-0" onClick={onCancel} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-hobi-border bg-white/70 p-4">
          <div className="flex items-center gap-3">
            <div className="icon-bubble h-12 w-12" style={{ background: theme.soft, color: theme.text }}>
              <HabitIconView icon={habit.icon} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black text-hobi-ink">{habit.name}</p>
              <p className="mt-1 text-sm font-bold text-hobi-muted">関連記録 {relatedRecordCount} 件</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          この習慣に紐づく記録もすべて削除されます。この操作は元に戻せません。
        </div>

        <div className="mt-5 flex gap-3">
          <button className="secondary-button flex-1" onClick={onCancel} type="button">
            キャンセル
          </button>
          <button className="danger-button flex-1" onClick={onConfirm} type="button">
            <Trash2 size={17} />
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}

function getHeatmapColor(value: number, isInYear: boolean, habit: Habit): string {
  if (!isInYear) return "transparent";
  if (value <= 0) return "#EEF2F8";

  return COLOR_THEME[habit.color].solid;
}
