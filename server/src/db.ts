import { Database } from "bun:sqlite";
import { readFileSync } from "fs";
import * as types from "./types";

let db: Database;

export async function initDB(dbPath: string) {
  db = new Database(dbPath);

  // 启用外键约束
  db.exec("PRAGMA foreign_keys = ON");

  // 运行迁移
  const migration = readFileSync(new URL("../migrations/0001_init.sql", import.meta.url), "utf-8");
  db.exec(migration);

  // 初始化默认用户（只有你一个人）
  const existingUser = db.query("SELECT * FROM users WHERE id = 1").get();
  if (!existingUser) {
    db.query(`
      INSERT INTO users (id, openid, created_at, updated_at)
      VALUES (1, 'local-user', datetime('now'), datetime('now'))
    `).run();
  }

  return db;
}

// ═══════════════════════════════════════════════
// User 操作
// ═══════════════════════════════════════════════

export function getUser(userId: number = 1) {
  const stmt = db.query("SELECT * FROM users WHERE id = ?");
  return stmt.get(userId) as types.User | null;
}

// ═══════════════════════════════════════════════
// Profile 操作
// ═══════════════════════════════════════════════

export function getProfile(userId: number = 1) {
  const stmt = db.query("SELECT * FROM profiles WHERE user_id = ?");
  return stmt.get(userId) as types.Profile | null;
}

export function updateProfile(userId: number, profile: types.UpdateProfileRequest) {
  const stmt = db.query(`
    UPDATE profiles
    SET name = ?, birth_date = ?, gender = ?, updated_at = datetime('now')
    WHERE user_id = ?
    RETURNING *
  `);
  return stmt.get(profile.name, profile.birth_date, profile.gender || null, userId) as types.Profile;
}

// ═══════════════════════════════════════════════
// Record 操作
// ═══════════════════════════════════════════════

export function createRecord(userId: number, record: types.CreateRecordRequest) {
  const stmt = db.query(`
    INSERT INTO records (user_id, activity_id, init_type, focus_sec, emotion, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    RETURNING *
  `);
  return stmt.get(
    userId,
    record.activity_id,
    record.init_type,
    record.focus_sec || null,
    record.emotion || null,
    record.note || null
  ) as types.Record;
}

export function getRecords(userId: number = 1, date?: string) {
  let query = "SELECT * FROM records WHERE user_id = ? AND deleted_at IS NULL";
  const params: any[] = [userId];

  if (date) {
    // date 格式: YYYY-MM-DD
    query += ` AND DATE(created_at) = ?`;
    params.push(date);
  }

  query += " ORDER BY created_at DESC";
  const stmt = db.query(query);
  return stmt.all(...params) as types.Record[];
}

export function deleteRecord(recordId: number, userId: number = 1) {
  const stmt = db.query(`
    UPDATE records
    SET deleted_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
    RETURNING *
  `);
  return stmt.get(recordId, userId) as types.Record;
}

// ═══════════════════════════════════════════════
// Milestone State 操作
// ═══════════════════════════════════════════════

export function getMilestoneStates(userId: number = 1) {
  const stmt = db.query(`
    SELECT * FROM milestone_states
    WHERE user_id = ?
    ORDER BY milestone_id
  `);
  return stmt.all(userId) as types.MilestoneState[];
}

export function updateMilestoneState(
  userId: number = 1,
  milestoneId: string,
  status: "not_started" | "progressing" | "achieved"
) {
  const achievedAt = status === "achieved" ? new Date().toISOString() : null;

  // 先尝试 UPDATE，若无结果再 INSERT
  const existing = db.query(
    "SELECT * FROM milestone_states WHERE user_id = ? AND milestone_id = ?"
  ).get(userId, milestoneId);

  if (existing) {
    const stmt = db.query(`
      UPDATE milestone_states
      SET status = ?, achieved_at = ?, updated_at = datetime('now')
      WHERE user_id = ? AND milestone_id = ?
      RETURNING *
    `);
    return stmt.get(status, achievedAt, userId, milestoneId) as types.MilestoneState;
  } else {
    const stmt = db.query(`
      INSERT INTO milestone_states (user_id, milestone_id, status, achieved_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      RETURNING *
    `);
    return stmt.get(userId, milestoneId, status, achievedAt) as types.MilestoneState;
  }
}

// ═══════════════════════════════════════════════
// Diary Entry 操作
// ═══════════════════════════════════════════════

export function createDiaryEntry(userId: number = 1, entry: types.CreateDiaryRequest) {
  const imageUrls = entry.image_urls ? JSON.stringify(entry.image_urls) : null;
  const stmt = db.query(`
    INSERT INTO diary_entries (user_id, content, image_urls, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
    RETURNING *
  `);
  const result = stmt.get(userId, entry.content, imageUrls) as any;

  // 返回时解析 JSON
  if (result && result.image_urls) {
    result.image_urls = JSON.parse(result.image_urls);
  }
  return result as types.DiaryEntry;
}

export function getDiaryEntries(userId: number = 1) {
  const stmt = db.query(`
    SELECT * FROM diary_entries
    WHERE user_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
  `);
  const results = stmt.all(userId) as any[];

  // 解析所有 image_urls JSON
  return results.map(r => ({
    ...r,
    image_urls: r.image_urls ? JSON.parse(r.image_urls) : []
  })) as types.DiaryEntry[];
}

export function deleteDiaryEntry(entryId: number, userId: number = 1) {
  const stmt = db.query(`
    UPDATE diary_entries
    SET deleted_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
    RETURNING *
  `);
  const result = stmt.get(entryId, userId) as any;

  if (result && result.image_urls) {
    result.image_urls = JSON.parse(result.image_urls);
  }
  return result as types.DiaryEntry;
}

// ═══════════════════════════════════════════════
// AI Usage 操作（限流）
// ═══════════════════════════════════════════════

export function incrementAIUsage(userId: number = 1) {
  const today = new Date().toISOString().split("T")[0];

  const existing = db.query(
    "SELECT * FROM ai_usage WHERE user_id = ? AND date = ?"
  ).get(userId, today);

  if (existing) {
    const stmt = db.query(`
      UPDATE ai_usage
      SET count = count + 1, updated_at = datetime('now')
      WHERE user_id = ? AND date = ?
      RETURNING *
    `);
    return stmt.get(userId, today) as types.AIUsage;
  } else {
    const stmt = db.query(`
      INSERT INTO ai_usage (user_id, date, count, created_at, updated_at)
      VALUES (?, ?, 1, datetime('now'), datetime('now'))
      RETURNING *
    `);
    return stmt.get(userId, today) as types.AIUsage;
  }
}

export function getAIUsageToday(userId: number = 1) {
  const today = new Date().toISOString().split("T")[0];
  const stmt = db.query(
    "SELECT * FROM ai_usage WHERE user_id = ? AND date = ?"
  );
  return (stmt.get(userId, today) as types.AIUsage)?.count || 0;
}
