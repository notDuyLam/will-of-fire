import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Bảng `pacts` — Thông tin Khế Ước
 * Lưu trữ định nghĩa và trạng thái hiện tại của mỗi Pact.
 *
 * Các trạng thái (status): 'ACTIVE' | 'COMPLETED' | 'FAILED'
 * Frequency format: 'DAILY' | 'WEEKLY:MON,WED,FRI' | 'INTERVAL:3'
 */
export const pacts = sqliteTable("pacts", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    /** Tên Khế Ước */
    name: text("name").notNull(),

    /** Mô tả chi tiết */
    description: text("description"),

    /**
     * Tần suất thực hiện
     * VD: "DAILY", "WEEKLY:MON,WED,FRI", "INTERVAL:3"
     */
    frequency: text("frequency").notNull(),

    /** Mục tiêu hiện tại (Goal name) */
    goalName: text("goal_name").notNull(),

    /** Định mức để đạt 100% Progress */
    targetCount: integer("target_count").notNull(),

    /** Số lần đã thực hiện cho Goal hiện tại */
    currentProgress: integer("current_progress").notNull().default(0),

    /** Tổng Lửa (Fire) kiếm được từ lúc tạo */
    totalFire: integer("total_fire").notNull().default(0),

    /** Chuỗi Streak hiện tại */
    currentStreak: integer("current_streak").notNull().default(0),

    /** Kỷ lục Streak cao nhất */
    highestStreak: integer("highest_streak").notNull().default(0),

    /** Trạng thái: 'ACTIVE' | 'COMPLETED' | 'FAILED' */
    status: text("status").notNull().default("ACTIVE"),

    /** Giờ nhắc nhở (VD: "07:30") */
    reminderTime: text("reminder_time").default("07:30"),

    /** Thời điểm tạo (ISO string) */
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),

    /** Thời điểm cập nhật lần cuối (ISO string) */
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
            .$defaultFn(() => crypto.randomUUID()),

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
 * Bảng `milestones` — Cột mốc Tiến hóa
 * Lưu lại các Goal đã hoàn thành khi người dùng chọn "Tiến hóa" (Evolve) Pact.
 */
export const milestones = sqliteTable("milestones", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    /** Foreign key -> pacts.id */
    pactId: text("pact_id")
        .notNull()
        .references(() => pacts.id),

    /** Tên mục tiêu đã đạt */
    goalName: text("goal_name").notNull(),

    /** Định mức của mục tiêu đó */
    targetCount: integer("target_count").notNull(),

    /** Thời điểm hoàn thành (ISO string) */
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
