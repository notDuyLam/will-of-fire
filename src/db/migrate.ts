import { db } from "./client";
import { pacts, pactLogs, milestones } from "./schema";
import { sql } from "drizzle-orm";

/**
 * Khởi tạo database — tạo các bảng nếu chưa tồn tại.
 *
 * Sử dụng raw SQL CREATE TABLE IF NOT EXISTS thay vì migration system
 * để đơn giản hóa cho MVP. Khi app scale lớn hơn có thể chuyển sang
 * Drizzle migration system.
 */
export async function initializeDatabase(): Promise<void> {
    try {
        // Tạo bảng pacts
        db.run(sql`
      CREATE TABLE IF NOT EXISTS pacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        frequency TEXT NOT NULL,
        interval_days INTEGER,
        schedule_start_date TEXT,
        goal_name TEXT,
        goal_deadline TEXT,
        target_count INTEGER,
        current_progress INTEGER NOT NULL DEFAULT 0,
        total_fire INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        highest_streak INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        reminder_time TEXT DEFAULT '07:30',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
        // Thêm cột mới nếu bảng cũ đã tồn tại (migration)
        try {
            db.run(sql`ALTER TABLE pacts ADD COLUMN interval_days INTEGER`);
        } catch { /* already exists */ }
        try {
            db.run(sql`ALTER TABLE pacts ADD COLUMN schedule_start_date TEXT`);
        } catch { /* already exists */ }
        try {
            db.run(sql`ALTER TABLE pacts ADD COLUMN goal_deadline TEXT`);
        } catch { /* already exists */ }

        // Tạo bảng pact_logs
        db.run(sql`
      CREATE TABLE IF NOT EXISTS pact_logs (
        id TEXT PRIMARY KEY,
        pact_id TEXT NOT NULL REFERENCES pacts(id),
        date TEXT NOT NULL,
        action TEXT NOT NULL,
        fire_earned INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

        // Tạo index cho pact_logs (query lịch nhanh)
        db.run(sql`
      CREATE INDEX IF NOT EXISTS idx_pact_logs_pact_date
      ON pact_logs (pact_id, date)
    `);

        // Tạo bảng milestones
        db.run(sql`
      CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY,
        pact_id TEXT NOT NULL REFERENCES pacts(id),
        goal_name TEXT NOT NULL,
        goal_deadline TEXT,
        target_count INTEGER DEFAULT 0,
        achieved_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
        try {
            db.run(sql`ALTER TABLE milestones ADD COLUMN goal_deadline TEXT`);
        } catch { /* already exists */ }
        try {
            db.run(sql`ALTER TABLE milestones ADD COLUMN target_count INTEGER DEFAULT 0`);
        } catch { /* already exists */ }

        console.log("✅ Database initialized successfully");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
        throw error;
    }
}
