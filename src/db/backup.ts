import { db } from "./client";
import { pacts, pactLogs, milestones, type Pact, type PactLog, type Milestone } from "./schema";
import type { Locale } from "../i18n/translations";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

export interface BackupPayload {
  version: string;
  exportedAt: string;
  locale?: Locale;
  pacts: Pact[];
  logs: PactLog[];
  milestones: Milestone[];
}

function getAppVersion(): string {
  // Đơn giản: hard-code, có thể đồng bộ tay với package.json khi bump version.
  return "1.0.0";
}

export function exportBackup(locale?: Locale): BackupPayload {
  const allPacts = db.select().from(pacts).all();
  const allLogs = db.select().from(pactLogs).all();
  const allMilestones = db.select().from(milestones).all();

  return {
    version: getAppVersion(),
    exportedAt: new Date().toISOString(),
    locale,
    pacts: allPacts,
    logs: allLogs,
    milestones: allMilestones,
  };
}

export function importBackup(payload: BackupPayload): void {
  if (!payload || !Array.isArray(payload.pacts) || !Array.isArray(payload.logs) || !Array.isArray(payload.milestones)) {
    throw new Error("INVALID_BACKUP_FORMAT");
  }

  db.transaction((tx) => {
    // Xóa toàn bộ dữ liệu cũ theo thứ tự: logs -> milestones -> pacts
    tx.delete(pactLogs).run();
    tx.delete(milestones).run();
    tx.delete(pacts).run();

    // Khôi phục pacts (giữ nguyên id)
    for (const pact of payload.pacts) {
      tx.insert(pacts).values(pact as unknown as typeof pacts.$inferInsert).run();
    }

    // Khôi phục logs
    for (const log of payload.logs) {
      tx.insert(pactLogs).values(log as unknown as typeof pactLogs.$inferInsert).run();
    }

    // Khôi phục milestones
    for (const m of payload.milestones) {
      tx.insert(milestones).values(m as unknown as typeof milestones.$inferInsert).run();
    }
  });
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildCsvSummary(allPacts: Pact[], allLogs: PactLog[]): string {
  const header = [
    "pact_id",
    "pact_name",
    "status",
    "goal_name",
    "goal_deadline",
    "date",
    "action",
    "fire_earned",
  ].join(",");

  const pactMap = new Map<string, Pact>();
  for (const p of allPacts) {
    pactMap.set(p.id, p);
  }

  const rows: string[] = [header];

  for (const log of allLogs) {
    const pact = pactMap.get(log.pactId);
    rows.push(
      [
        escapeCsvValue(log.pactId),
        escapeCsvValue(pact?.name ?? ""),
        escapeCsvValue(pact?.status ?? ""),
        escapeCsvValue(pact?.goalName ?? ""),
        escapeCsvValue(pact?.goalDeadline ?? ""),
        escapeCsvValue(log.date),
        escapeCsvValue(log.action),
        escapeCsvValue(log.fireEarned ?? 0),
      ].join(","),
    );
  }

  return rows.join("\n");
}

const BACKUP_PREFIX = "will-of-fire-backup";

export async function saveAndShareJsonBackup(locale?: Locale): Promise<void> {
  const payload = exportBackup(locale);
  const json = JSON.stringify(payload, null, 2);
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  const fileName = `${BACKUP_PREFIX}-${ts}.json`;
  const uri = (FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? "") + fileName;

  await FileSystem.writeAsStringAsync(uri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
}

export async function saveAndShareCsvSummary(): Promise<void> {
  const data = exportBackup();
  const csv = buildCsvSummary(data.pacts, data.logs);

  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  const fileName = `${BACKUP_PREFIX}-logs-${ts}.csv`;
  const uri = (FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? "") + fileName;

  await FileSystem.writeAsStringAsync(uri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "text/csv" });
  }
}

export interface ImportResult {
  ok: boolean;
  cancelled?: boolean;
  errorMessage?: string;
}

export async function pickAndImportBackup(): Promise<ImportResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { ok: false, cancelled: true };
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return { ok: false, errorMessage: "NO_FILE_URI" };
    }

    const content = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { ok: false, errorMessage: "INVALID_JSON" };
    }

    importBackup(parsed as BackupPayload);
    return { ok: true };
  } catch (e) {
    return { ok: false, errorMessage: (e as Error).message ?? "UNKNOWN_ERROR" };
  }
}

