import { subDays, format, addDays } from "date-fns";
import {
  createPact,
  updatePact,
  getLogsForPact,
  getAllPacts,
  getLogForDate,
  logAction,
  createMilestone,
} from "./queries";
import type { Pact } from "./schema";

const TODAY = new Date();
const TODAY_STR = format(TODAY, "yyyy-MM-dd");

type Action = "COMPLETE" | "PRESERVE" | "MISS";

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seed nhiều Pact + Log + Milestone để test màn Reports.
 * Chạy trong app (cùng process với DB). Gọi từ UI (vd. nút "Seed data").
 * Mỗi lần gọi thêm 16 pact, hàng trăm log, 8 milestone. Có thể gọi nhiều lần để có thêm data.
 */
export function runSeed(): { pactsCreated: number; logsCreated: number; milestonesCreated: number } {

  const frequencies = ["DAILY", "DAILY", "EVERY_2_DAYS", "EVERY_3_DAYS", "WEEKLY", "MONTHLY"] as const;
  const namesWithGoal = [
    { name: "Đọc sách 30 phút", goal: "Đọc 12 cuốn/năm", deadline: 90 },
    { name: "Chạy bộ", goal: "Chạy 21km", deadline: 60 },
    { name: "Học AWS", goal: "Thi đỗ AWS Certified", deadline: 120 },
    { name: "Tiết kiệm", goal: "Để dành 50 triệu", deadline: 180 },
    { name: "Meditation", goal: "30 ngày liên tục", deadline: 45 },
    { name: "Viết blog", goal: "20 bài trong năm", deadline: 200 },
    { name: "Học guitar", goal: "Chơi 10 bài", deadline: 100 },
    { name: "Gọi điện cho gia đình", goal: "Mỗi tuần 1 lần", deadline: 52 },
  ];
  const namesNoGoal = [
    "Uống nước đủ 2L",
    "Ngủ trước 23h",
    "Ăn rau mỗi bữa",
    "Đi bộ 10k bước",
    "Ghi chú 3 việc quan trọng",
    "Đọc tin tức 15 phút",
    "Stretch 10 phút",
    "Không scroll quá 1h",
  ];

  const created: Pact[] = [];
  let logsCount = 0;

  for (let i = 0; i < 8; i++) {
    const withGoal = namesWithGoal[i]!;
    const startDate = subDays(TODAY, randomInt(60, 90));
    const deadlineDate = addDays(TODAY, withGoal.deadline);
    const freq = frequencies[randomInt(0, frequencies.length - 1)]!;
    const pact = createPact({
      name: withGoal.name,
      description: `Seed pact ${i + 1}`,
      frequency: freq,
      scheduleStartDate: format(startDate, "yyyy-MM-dd"),
      goalName: withGoal.goal,
      goalDeadline: format(deadlineDate, "yyyy-MM-dd"),
      reminderTime: "07:30",
      intervalDays: freq === "EVERY_X_DAYS" ? 5 : undefined,
    });
    created.push(pact);
  }

  for (let i = 0; i < 8; i++) {
    const name = namesNoGoal[i]!;
    const startDate = subDays(TODAY, randomInt(30, 60));
    const pact = createPact({
      name,
      description: `Seed no-goal ${i + 1}`,
      frequency: "DAILY",
      scheduleStartDate: format(startDate, "yyyy-MM-dd"),
      reminderTime: "07:30",
    });
    created.push(pact);
  }

  for (const pact of created) {
    const start = subDays(TODAY, 60);
    const daysToLog = pact.frequency === "DAILY" ? 50 : pact.frequency === "WEEKLY" ? 10 : pact.frequency === "MONTHLY" ? 3 : 25;
    let logged = 0;
    for (let d = 0; d < 60 && logged < daysToLog; d++) {
      const date = addDays(start, d);
      const dateStr = format(date, "yyyy-MM-dd");
      if (dateStr >= TODAY_STR) continue;
      if (getLogForDate(pact.id, dateStr)) continue;
      const r = Math.random();
      const action: Action = r < 0.6 ? "COMPLETE" : r < 0.85 ? "PRESERVE" : "MISS";
      logAction({
        pactId: pact.id,
        date: dateStr,
        action,
        fireEarned: action === "COMPLETE" ? 1 : 0,
      });
      logsCount++;
      logged++;
    }
  }

  for (const pact of created) {
    const logs = getLogsForPact(pact.id);
    const totalFire = logs.reduce((s, l) => s + (l.fireEarned ?? 0), 0);
    const currentProgress = logs.filter((l) => l.action === "COMPLETE").length;
    let currentStreak = 0;
    const sortedDates = [...new Set(logs.map((l) => l.date))].sort().reverse();
    for (const dateStr of sortedDates) {
      const log = logs.find((l) => l.date === dateStr);
      if (log?.action === "COMPLETE" || log?.action === "PRESERVE") currentStreak++;
      else break;
    }
    const highestStreak = Math.max(currentStreak, randomInt(3, 15));
    updatePact(pact.id, {
      totalFire,
      currentProgress,
      currentStreak,
      highestStreak,
    });
  }

  const toComplete = created.slice(0, 5);
  const toFail = created.slice(5, 8);
  toComplete.forEach((p) => updatePact(p.id, { status: "COMPLETED" }));
  toFail.forEach((p) => updatePact(p.id, { status: "FAILED" }));

  let milestonesCount = 0;
  const milestoneGoals = [
    "Đọc 6 cuốn",
    "Chạy 10km",
    "AWS Practice Exam",
    "Tiết kiệm 20 triệu",
    "Meditation 14 ngày",
    "Viết 10 bài",
    "Chơi 5 bài guitar",
    "Gọi điện 3 tháng",
  ];
  for (let i = 0; i < 8; i++) {
    const pact = created[i];
    if (!pact) continue;
    const achievedAt = subDays(TODAY, randomInt(5, 80));
    createMilestone({
      pactId: pact.id,
      goalName: milestoneGoals[i] ?? `Goal ${i + 1}`,
      goalDeadline: format(subDays(achievedAt, 1), "yyyy-MM-dd"),
    });
    milestonesCount++;
  }

  return { pactsCreated: created.length, logsCreated: logsCount, milestonesCreated: milestonesCount };
}
