import type { ReportsData, PactLogStats } from "./reportsData";

export interface WillIndexResult {
  /** Điểm 0–100 */
  score: number;
  /** Các thành phần đóng góp (để UI hiển thị) */
  components?: {
    pactCount: number;
    completionRate: number;
    activeCount: number;
    disciplineAvg: number;
    recentFireScore: number;
    penalty: number;
  };
}

const MAX_PACT_BONUS = 15;
const MAX_COMPLETION_RATE_BONUS = 25;
const MAX_ACTIVE_BONUS = 15;
const MAX_DISCIPLINE_BONUS = 25;
const MAX_RECENT_FIRE_BONUS = 20;
const MAX_PENALTY = 20;

/**
 * Tính Chỉ số Ý chí (Will Index) 0–100 từ dữ liệu Reports.
 * Công thức: tổng hợp số pact, tỷ lệ hoàn thành, pact đang chạy, độ kỷ luật TB, Lửa 30 ngày, trừ điểm fail/miss.
 */
export function computeWillIndex(data: ReportsData): WillIndexResult {
  const { allPacts, completedPacts, failedPacts, activePacts, pactLogStats, fireLast30Days, actionCounts } = data;
  const total = allPacts.length;
  const completed = completedPacts.length;
  const failed = failedPacts.length;
  const active = activePacts.length;

  let pactCount = 0;
  if (total > 0) {
    pactCount = Math.min(MAX_PACT_BONUS, Math.sqrt(total) * 5);
  }

  let completionRate = 0;
  const completedOrFailedOrActive = completed + failed + active;
  if (completedOrFailedOrActive > 0) {
    const rate = completed / completedOrFailedOrActive;
    completionRate = rate * MAX_COMPLETION_RATE_BONUS;
  }

  let activeCount = 0;
  if (active > 0) {
    activeCount = Math.min(MAX_ACTIVE_BONUS, active * 5);
  }

  let disciplineSum = 0;
  let disciplineCount = 0;
  pactLogStats.forEach((s) => {
    if (s.total > 0) {
      disciplineSum += s.complete / s.total;
      disciplineCount += 1;
    }
  });
  const disciplineAvg = disciplineCount > 0 ? (disciplineSum / disciplineCount) * MAX_DISCIPLINE_BONUS : 0;

  let recentFireScore = 0;
  if (fireLast30Days > 0) {
    recentFireScore = Math.min(MAX_RECENT_FIRE_BONUS, Math.log10(fireLast30Days + 1) * 8);
  }

  const totalActions = actionCounts.complete + actionCounts.preserve + actionCounts.miss;
  let penalty = 0;
  if (totalActions > 0) {
    const missRate = actionCounts.miss / totalActions;
    const failRate = total > 0 ? failed / total : 0;
    penalty = (missRate * 10 + failRate * 10);
    penalty = Math.min(MAX_PENALTY, penalty);
  }

  const raw = pactCount + completionRate + activeCount + disciplineAvg + recentFireScore - penalty;
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  return {
    score,
    components: {
      pactCount,
      completionRate,
      activeCount,
      disciplineAvg,
      recentFireScore,
      penalty,
    },
  };
}
