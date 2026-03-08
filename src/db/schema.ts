import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { randomUUID } from "../utils/uuid";

/**
 * Frequency: DAILY | EVERY_2_DAYS | EVERY_3_DAYS | EVERY_X_DAYS | WEEKLY | MONTHLY
 * Với EVERY_X_DAYS dùng thêm interval_days.
 */
export const PACT_FREQUENCIES = [
  "DAILY",
  "EVERY_2_DAYS",
  "EVERY_3_DAYS",
  "EVERY_X_DAYS",
  "WEEKLY",
  "MONTHLY",
] as const;
export type PactFrequency = (typeof PACT_FREQUENCIES)[number];

/**
 * Bảng `pacts` — Thông tin Khế Ước
 * Mục tiêu theo deadline (goal_deadline); progress tính từ tần suất và số lần COMPLETE.
 */
export const pacts = sqliteTable("pacts", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),

    name: text("name").notNull(),
    description: text("description"),

    /** DAILY | EVERY_2_DAYS | EVERY_3_DAYS | EVERY_X_DAYS | WEEKLY | MONTHLY */
    frequency: text("frequency").notNull(),

    /** Số ngày chu kỳ khi frequency = EVERY_X_DAYS */
    intervalDays: integer("interval_days"),

    /** Ngày đầu tiên pact đến hạn (YYYY-MM-DD); với DAILY có thể = created_at */
    scheduleStartDate: text("schedule_start_date"),

    /** Tên mục tiêu (tùy chọn; thói quen lặp lại có thể không cần goal) */
    goalName: text("goal_name"),

    /** Hạn chót đạt mục tiêu (YYYY-MM-DD); chỉ khi có goal */
    goalDeadline: text("goal_deadline"),

    /** @deprecated Giữ cho tương thích; progress mới tính từ deadline + frequency */
    targetCount: integer("target_count"),
    /** @deprecated Giữ cho tương thích */
    currentProgress: integer("current_progress").notNull().default(0),

    totalFire: integer("total_fire").notNull().default(0),
    currentStreak: integer("current_streak").notNull().default(0),
    highestStreak: integer("highest_streak").notNull().default(0),
    status: text("status").notNull().default("ACTIVE"),
    reminderTime: text("reminder_time").default("07:30"),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});

/**
 * Bảng `pact_logs` — Nhật ký Giữ Lửa
 * Ghi lại hành động mỗi ngày: COMPLETE, PRESERVE, hoặc MISS.
 * Bảng quan trọng nhất để vẽ Calendar và check Failed Rule (Miss 2 lần liên tiếp).
 */
export const pactLogs = sqliteTable(
    "pact_logs",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => randomUUID()),

        /** Foreign key -> pacts.id */
        pactId: text("pact_id")
            .notNull()
            .references(() => pacts.id),

        /** Ngày thực hiện (Format: YYYY-MM-DD) */
        date: text("date").notNull(),

        /** Hành động: 'COMPLETE' | 'PRESERVE' | 'MISS' */
        action: text("action").notNull(),

        /** Số lửa nhận được (1 cho COMPLETE, 0 cho PRESERVE/MISS) */
        fireEarned: integer("fire_earned").notNull().default(0),

        /** Thời điểm ghi log (ISO string) */
        createdAt: text("created_at")
            .notNull()
            .default(sql`(datetime('now'))`),
    },
    (table) => [
        /** Index trên pact_id và date để query lịch siêu nhanh */
        index("idx_pact_logs_pact_date").on(table.pactId, table.date),
    ]
);

/**
 * Bảng `milestones` — Cột mốc Tiến hóa (Goal đã hoàn thành trước deadline)
 */
export const milestones = sqliteTable("milestones", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    pactId: text("pact_id")
        .notNull()
        .references(() => pacts.id),
    goalName: text("goal_name").notNull(),
    /** Deadline của goal đã đạt (YYYY-MM-DD) */
    goalDeadline: text("goal_deadline"),
    /** @deprecated Giữ cho tương thích DB cũ (NOT NULL); mới dùng goal_deadline */
    targetCount: integer("target_count").default(0),
    achievedAt: text("achieved_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});

// ============================================================
// Type Inference — Drizzle tự động sinh type từ schema
// ============================================================

/** Type cho một Pact record đầy đủ từ DB */
export type Pact = typeof pacts.$inferSelect;

/** Type cho data khi INSERT một Pact mới */
export type NewPact = typeof pacts.$inferInsert;

/** Type cho một PactLog record */
export type PactLog = typeof pactLogs.$inferSelect;

/** Type cho data khi INSERT một PactLog mới */
export type NewPactLog = typeof pactLogs.$inferInsert;

/** Type cho một Milestone record */
export type Milestone = typeof milestones.$inferSelect;

/** Type cho data khi INSERT một Milestone mới */
export type NewMilestone = typeof milestones.$inferInsert;
