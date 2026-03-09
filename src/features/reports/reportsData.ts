import { subDays, format, startOfWeek, endOfWeek } from "date-fns";
import {
  getAllPacts,
  getAllActivePacts,
  getCompletedPacts,
  getFailedPacts,
  getLogsInDateRange,
  getAllMilestones,
  getAllLogs,
} from "../../db/queries";
import type { Pact, PactLog, Milestone } from "../../db/schema";

export interface PactLogStats {
  pactId: string;
  complete: number;
  preserve: number;
  miss: number;
  total: number;
  fireEarned: number;
}

export interface FirePerWeekItem {
  weekLabel: string;
  weekStart: string;
  fire: number;
}

export interface ReportsData {
  /** Tổng Lửa toàn thời gian (từ pacts.totalFire) */
  totalFire: number;
  /** Lửa trong 7 ngày qua (từ logs) */
  fireLast7Days: number;
  /** Lửa trong 30 ngày qua */
  fireLast30Days: number;
  allPacts: Pact[];
  activePacts: Pact[];
  completedPacts: Pact[];
  failedPacts: Pact[];
  /** Goal sắp tới: ACTIVE pacts có goalDeadline, sort asc, limit 5 */
  upcomingGoals: Pact[];
  /** Milestones gần nhất (limit 10) */
  recentMilestones: Milestone[];
  /** Thống kê log theo từng pact (trong 30 ngày) */
  pactLogStats: PactLogStats[];
  /** Tổng COMPLETE / PRESERVE / MISS trong 30 ngày (cho biểu đồ tròn) */
  actionCounts: { complete: number; preserve: number; miss: number };
  /** Lửa theo từng tuần (4–8 tuần gần nhất) cho biểu đồ */
  firePerWeek: FirePerWeekItem[];
  /** Toàn bộ logs (để willIndex có thể dùng) */
  allLogs: PactLog[];
}

const WEEKS_CHART = 8;
const RECENT_DAYS = 30;

function getDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/**
 * Gom dữ liệu cho màn Reports: pacts, logs, milestones, fire theo tuần, v.v.
 */
export function getReportsData(): ReportsData {
  const today = new Date();
  const todayStr = getDateStr(today);
  const from30 = getDateStr(subDays(today, RECENT_DAYS));
  const from7 = getDateStr(subDays(today, 7));

  const allPacts = getAllPacts();
  const activePacts = getAllActivePacts();
  const completedPacts = getCompletedPacts();
  const failedPacts = getFailedPacts();
  const allLogs = getAllLogs();
  const logs30 = getLogsInDateRange(from30, todayStr);
  const logs7 = getLogsInDateRange(from7, todayStr);
  const recentMilestones = getAllMilestones(10);

  const totalFire = allPacts.reduce((sum, p) => sum + (p.totalFire ?? 0), 0);
  const fireLast7Days = logs7.reduce((sum, l) => sum + (l.fireEarned ?? 0), 0);
  const fireLast30Days = logs30.reduce((sum, l) => sum + (l.fireEarned ?? 0), 0);

  const actionCounts = {
    complete: logs30.filter((l) => l.action === "COMPLETE").length,
    preserve: logs30.filter((l) => l.action === "PRESERVE").length,
    miss: logs30.filter((l) => l.action === "MISS").length,
  };

  const upcomingGoals = activePacts
    .filter((p) => p.goalDeadline != null && p.goalDeadline !== "")
    .sort((a, b) => (a.goalDeadline ?? "").localeCompare(b.goalDeadline ?? ""))
    .slice(0, 5);

  const pactLogStats: PactLogStats[] = allPacts.map((p) => {
    const pactLogs30 = logs30.filter((l) => l.pactId === p.id);
    return {
      pactId: p.id,
      complete: pactLogs30.filter((l) => l.action === "COMPLETE").length,
      preserve: pactLogs30.filter((l) => l.action === "PRESERVE").length,
      miss: pactLogs30.filter((l) => l.action === "MISS").length,
      total: pactLogs30.length,
      fireEarned: pactLogs30.reduce((s, l) => s + (l.fireEarned ?? 0), 0),
    };
  });

  const firePerWeek: FirePerWeekItem[] = [];
  for (let i = WEEKS_CHART - 1; i >= 0; i--) {
    const weekEnd = subDays(today, i * 7);
    const weekStart = startOfWeek(weekEnd, { weekStartsOn: 1 });
    const weekEndDate = endOfWeek(weekEnd, { weekStartsOn: 1 });
    const ws = getDateStr(weekStart);
    const we = getDateStr(weekEndDate);
    const weekLogs = getLogsInDateRange(ws, we);
    const fire = weekLogs.reduce((s, l) => s + (l.fireEarned ?? 0), 0);
    firePerWeek.push({
      weekLabel: format(weekStart, "d/M"),
      weekStart: ws,
      fire,
    });
  }

  return {
    totalFire,
    fireLast7Days,
    fireLast30Days,
    allPacts,
    activePacts,
    completedPacts,
    failedPacts,
    upcomingGoals,
    recentMilestones,
    pactLogStats,
    actionCounts,
    firePerWeek,
    allLogs,
  };
}
