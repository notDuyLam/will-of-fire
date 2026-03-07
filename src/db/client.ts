import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

/**
 * SQLite Database Client
 *
 * Khởi tạo kết nối SQLite nội bộ và wrap bằng Drizzle ORM.
 * Database file: "willoffire.db" lưu trữ trên thiết bị.
 *
 * enableChangeListener: cho phép reactive queries (tự re-fetch khi data thay đổi).
 */
const expoDb = openDatabaseSync("willoffire.db", {
    enableChangeListener: true,
});

/**
 * Drizzle ORM instance — sử dụng instance này cho toàn bộ DB operations.
 * Truyền schema để Drizzle hiểu cấu trúc bảng và hỗ trợ type-safe queries.
 */
export const db = drizzle(expoDb, { schema });
