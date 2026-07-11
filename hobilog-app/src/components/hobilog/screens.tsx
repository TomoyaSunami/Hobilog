"use client";

import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
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
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
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
  ICON_OPTIONS,
  RECORD_METHOD_META,
  RECORD_METHOD_OPTIONS
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
import {
  formatScheduleLabel,
  isHabitScheduledOn,
  SCHEDULE_LABELS,
  WEEKDAY_OPTIONS
} from "@/lib/schedule";
import type {
  AnalyticsPeriod,
  Habit,
  HabitColor,
  HabitIcon,
  HabitRecord,
  HabitSchedule,
  RecordMethod,
  TabId,
  Weekday
} from "@/types";

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

export type RecordDraft = {
  habitId: string;
  date: string;
  done: boolean;
  quantity: number;
  memo: string;
};

export type HabitFormState = {
  id: string | null;
  name: string;
  icon: HabitIcon;
  color: HabitColor;
  recordMethod: RecordMethod;
  customUnit: string;
  schedule: HabitSchedule;
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
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


export function HomeScreen({
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
  const todayHabits = useMemo(() => habits.filter((habit) => isHabitScheduledOn(habit, todayKey)), [habits, todayKey]);
  const progress = todayHabits.length ? Math.round((todayDoneCount / todayHabits.length) * 100) : 0;
  const isComplete = todayHabits.length > 0 && todayDoneCount === todayHabits.length;
  const progressStatus = todayHabits.length === 0 ? "予定なし" : todayDoneCount === 0 ? "未実施" : isComplete ? "完了" : "進行中";

  return (
    <section>
      <div className="glass-card mb-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-hobi-muted">今日の進捗</p>
            <p className="mt-1 text-sm font-semibold text-hobi-muted">{formatShortDate(todayKey)} {formatWeekday()}</p>
            <p className="mt-2 text-3xl font-black text-hobi-ink">
              {todayDoneCount}
              <span className="text-base font-bold text-hobi-muted"> / {todayHabits.length}</span>
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
      ) : todayHabits.length === 0 ? (
        <EmptyState
          actionLabel="新しい習慣を追加"
          description="今日が対象日の習慣はありません。ログや分析で過去の記録は確認できます。"
          icon={<CalendarCheck size={24} />}
          title="今日の予定はありません"
          onAction={openHabitForm}
        />
      ) : (
        <div className="space-y-3">
          {todayHabits.map((habit) => {
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
                      {RECORD_METHOD_META[habit.recordMethod].label} / {formatScheduleLabel(habit.schedule)} / 連続{" "}
                      {streak?.current ?? 0} 回
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

export function LogScreen({
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
  const logHabits = useMemo(
    () =>
      habits.filter((habit) => {
        const hasRecord = records.some((record) => record.habitId === habit.id && record.date === selectedDate);
        return isHabitScheduledOn(habit, selectedDate) || hasRecord;
      }),
    [habits, records, selectedDate]
  );

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
      ) : logHabits.length === 0 ? (
        <EmptyState
          actionLabel="新しい習慣を追加"
          description="この日に予定されている習慣はありません。"
          icon={<CalendarCheck size={24} />}
          title="この日の予定はありません"
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
            {logHabits.map((habit) => {
              const theme = COLOR_THEME[habit.color];
              const record = records.find((item) => item.habitId === habit.id && item.date === selectedDate);
              const isFuture = isFutureDateKey(selectedDate, todayKey);
              const isScheduled = isHabitScheduledOn(habit, selectedDate);

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
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate font-black text-hobi-ink">{habit.name}</p>
                      {!isScheduled && record ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700">
                          予定外の記録
                        </span>
                      ) : null}
                    </div>
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

export function ChartScreen({
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
  const summary = targetHabit
    ? getSummaryStats(records, range.startKey, range.endKey, targetHabit)
    : {
        totalDone: 0,
        totalQuantity: 0,
        activeDays: 0,
        scheduledDays: 0,
        averagePerDay: 0,
        averageQuantityPerActiveDay: 0,
        completionRate: 0
      };
  const heatmapCells = useMemo(
    () => (targetHabit ? buildYearHeatmap(selectedYear, records, targetHabit) : []),
    [records, selectedYear, targetHabit]
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
      unit: "回",
      subLabel: `前回から ${streakDiff >= 0 ? "+" : ""}${streakDiff}`,
      variant: "blue"
    },
    {
      icon: <Crown size={21} />,
      label: "最長連続",
      value: selectedStreak.best,
      unit: "回",
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
      label: isValueBased ? "平均/実施日" : "平均/対象日",
      value: (isValueBased ? summary.averageQuantityPerActiveDay : summary.averagePerDay).toFixed(1),
      unit: isValueBased ? metricUnit : "回",
      subLabel: isValueBased ? "実施日の平均" : "対象日の平均",
      variant: "purple"
    },
    {
      icon: <BarChart3 size={21} />,
      label: "実施率",
      value: Math.round(summary.completionRate),
      unit: "%",
      subLabel: "実施日 ÷ 対象日",
      variant: "pink"
    }
  ];
  const metricDescriptions = [
    ["現在連続", "対象日のうち、直近の対象日まで連続して実施した回数です。対象外の日では途切れません。"],
    ["最長連続", "これまでに最も長く対象日を連続して実施できた回数です。表示日付はその連続記録を達成した日です。"],
    [
      isValueBased ? "総記録量" : "総実施日数",
      isValueBased
        ? `対象期間内に記録した${metricUnit}の合計です。`
        : "対象期間内で実施済みにした日数です。"
    ],
    ["実施日数", "対象期間内で1回以上実施した日を、日付の重複なしで数えます。"],
    [
      isValueBased ? "平均/実施日" : "平均/対象日",
      isValueBased
        ? `実施した日の総記録量を実施日数で割った平均${metricUnit}です。`
        : "対象期間内の対象日に対して、1対象日あたり何回実施したかの平均です。"
    ],
    ["実施率", "対象期間内の対象日のうち、1回以上実施した日が占める割合です。"]
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
                    style={{ background: getHeatmapColor(cell.value, cell.isInYear, cell.isScheduled, targetHabit) }}
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
            ["実施", 1],
            ["対象外", -1]
          ].map(([label, value]) => (
            <span className="flex items-center gap-2" key={label}>
              <span
                className="heatmap-cell"
                style={{ background: getHeatmapColor(Number(value), true, Number(value) >= 0, targetHabit) }}
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
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 className="text-lg font-black text-hobi-ink">分析指標</h3>
            <details className="metric-info-disclosure">
              <summary aria-label="分析指標の説明を表示">
                <Info size={16} />
              </summary>
              <div className="metric-info-panel">
                <p className="text-sm font-black text-hobi-ink">分析指標の見方</p>
                <dl className="mt-3 space-y-2">
                  {metricDescriptions.map(([label, description]) => (
                    <div key={label}>
                      <dt className="text-xs font-black text-hobi-ink">{label}</dt>
                      <dd className="mt-0.5 text-xs font-semibold leading-relaxed text-hobi-muted">{description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
          </div>
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

export function HabitsScreen({
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
  const dragControls = useDragControls();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [isHolding, setIsHolding] = useState(false);

  function clearLongPress(resetHolding = true) {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pointerStart.current = null;
    if (resetHolding) {
      setIsHolding(false);
    }
  }

  useEffect(() => () => clearLongPress(false), []);

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pointerStart.current = { x: event.clientX, y: event.clientY };
    setIsHolding(true);
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      pointerStart.current = null;
      setIsHolding(false);
      dragControls.start(event);
    }, 360);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!longPressTimer.current || !pointerStart.current) return;

    const deltaX = Math.abs(event.clientX - pointerStart.current.x);
    const deltaY = Math.abs(event.clientY - pointerStart.current.y);

    // A vertical swipe is a scroll gesture, not a reorder gesture. Cancel the
    // long-press early so the browser can keep handling the native page scroll.
    if (deltaY > 6 || deltaX > 10) {
      clearLongPress();
    }
  }

  return (
    <Reorder.Item
      as="article"
      className={cx(
        "glass-card list-none p-4 cursor-grab touch-pan-y select-none active:cursor-grabbing",
        isHolding && "border-blue-200 bg-blue-50/40"
      )}
      dragControls={dragControls}
      dragListener={false}
      onPointerCancel={clearLongPress}
      onPointerDown={handlePointerDown}
      onPointerLeave={clearLongPress}
      onPointerMove={handlePointerMove}
      onPointerUp={clearLongPress}
      title="長押しで並び替え"
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
          <p className="mt-1 truncate text-sm font-bold text-hobi-muted">
            実施予定: {formatScheduleLabel(habit.schedule)}
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
  icon: ReactNode;
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
  icon: ReactNode;
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

export function BottomNav({ activeTab, setActiveTab }: { activeTab: TabId; setActiveTab: (tab: TabId) => void }) {
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

export function RecordModal({
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

export function HabitFormModal({
  form,
  setForm,
  onClose,
  onSave,
  todayKey
}: {
  form: HabitFormState | null;
  setForm: (form: HabitFormState) => void;
  onClose: () => void;
  onSave: () => void;
  todayKey: string;
}) {
  const isOpen = Boolean(form);

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  if (!form) return null;
  const currentForm = form;

  const hasName = form.name.trim().length > 0;
  const customUnitError =
    form.recordMethod === "custom" && form.customUnit.trim().length === 0
      ? "カスタム単位を入力してください。"
      : null;
  const scheduleError =
    form.schedule.type === "weekdays" && form.schedule.weekdays.length === 0
      ? "曜日指定では1つ以上の曜日を選択してください。"
      : null;
  const formError = customUnitError ?? scheduleError;
  const canSave = hasName && !formError;

  function selectSchedule(type: HabitSchedule["type"]) {
    if (type === "alternateDays") {
      setForm({
        ...currentForm,
        schedule:
          currentForm.schedule.type === "alternateDays"
            ? currentForm.schedule
            : { type: "alternateDays", anchorDate: todayKey }
      });
      return;
    }

    if (type === "weekdays") {
      setForm({
        ...currentForm,
        schedule:
          currentForm.schedule.type === "weekdays"
            ? currentForm.schedule
            : {
                type: "weekdays",
                weekdays: []
              }
      });
      return;
    }

    setForm({ ...currentForm, schedule: { type: "daily" } });
  }

  function toggleWeekday(weekday: Weekday) {
    if (currentForm.schedule.type !== "weekdays") return;

    const selected = currentForm.schedule.weekdays.includes(weekday)
      ? currentForm.schedule.weekdays.filter((item) => item !== weekday)
      : [...currentForm.schedule.weekdays, weekday];
    setForm({
      ...currentForm,
      schedule: {
        type: "weekdays",
        weekdays: selected.sort((a, b) => a - b)
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end overscroll-none bg-slate-950/20 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
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

        <div className="-mx-1 min-h-0 flex-1 touch-pan-y space-y-4 overflow-y-auto overscroll-contain px-1 pb-1">
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

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="block text-sm font-black text-hobi-muted">実施予定</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-hobi-muted">
                選択中: {SCHEDULE_LABELS[form.schedule.type]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(SCHEDULE_LABELS) as HabitSchedule["type"][]).map((type) => {
                const isSelected = form.schedule.type === type;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={cx(
                      "flex min-h-[52px] items-center justify-center rounded-2xl border p-2 text-center text-sm font-black transition",
                      isSelected ? "border-hobi-blue bg-blue-50 text-hobi-blue" : "border-hobi-border bg-white/60 text-hobi-ink"
                    )}
                    key={type}
                    onClick={() => selectSchedule(type)}
                    type="button"
                  >
                    {SCHEDULE_LABELS[type]}
                  </button>
                );
              })}
            </div>
            {form.schedule.type === "weekdays" ? (
              <div className="mt-3">
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAY_OPTIONS.map((weekday) => {
                    const isSelected = form.schedule.type === "weekdays" && form.schedule.weekdays.includes(weekday.value);

                    return (
                      <button
                        aria-pressed={isSelected}
                        className={cx(
                          "flex aspect-square items-center justify-center rounded-full border text-sm font-black transition",
                          isSelected
                            ? "border-hobi-blue bg-hobi-blue text-white"
                            : "border-hobi-border bg-white/70 text-hobi-muted"
                        )}
                        key={weekday.value}
                        onClick={() => toggleWeekday(weekday.value)}
                        type="button"
                      >
                        {weekday.label}
                      </button>
                    );
                  })}
                </div>
                {scheduleError ? (
                  <span className="mt-2 block text-xs font-black text-red-600">{scheduleError}</span>
                ) : null}
              </div>
            ) : null}
          </div>

          {form.recordMethod === "custom" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-black text-hobi-muted">カスタム単位</span>
              <input
                aria-describedby={customUnitError ? "custom-unit-error" : undefined}
                aria-invalid={Boolean(customUnitError)}
                className="field"
                maxLength={12}
                onChange={(event) => setForm({ ...form, customUnit: event.target.value })}
                placeholder="例: 単語、枚"
                value={form.customUnit}
              />
              <span className="mt-2 block text-xs font-bold text-hobi-muted">記録時の数値の後ろに表示されます。</span>
              {customUnitError ? (
                <span className="mt-2 block text-xs font-black text-red-600" id="custom-unit-error">
                  {customUnitError}
                </span>
              ) : null}
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

export function DeleteHabitModal({
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

function getHeatmapColor(value: number, isInYear: boolean, isScheduled: boolean, habit: Habit): string {
  if (!isInYear) return "transparent";
  if (!isScheduled && value <= 0) return "rgba(148, 163, 184, 0.18)";
  if (value <= 0) return "#EEF2F8";

  return COLOR_THEME[habit.color].solid;
}
