-- 初始化 SQLite 数据库
-- 复用 P1 (CF Workers + D1) 的 schema
-- 参考：.planning/phases/01-cf-workers-skeleton/01-CONTEXT.md (D-01 ~ D-10)

-- ════════════════════════════════════════════════════════════
-- users 表：用户信息（本地场景固定为 1 个用户）
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT UNIQUE,                    -- 微信 openid（本地场景可为 null）
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ════════════════════════════════════════════════════════════
-- profiles 表：孩子档案
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,                    -- 孩子名字
  birth_date TEXT NOT NULL,              -- YYYY-MM-DD
  gender TEXT,                           -- M / F
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ════════════════════════════════════════════════════════════
-- records 表：观察记录
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activity_id TEXT NOT NULL,              -- H 编号，如 "P-6-01"
  init_type TEXT NOT NULL,                -- "child-led" / "adult-led"
  focus_sec INTEGER,                      -- 专注时长（秒）
  emotion TEXT,                           -- 观察到的情绪表达
  note TEXT,                              -- 观察笔记
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,                    -- 软删除
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_records_user_date ON records(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_records_activity ON records(activity_id);

-- ════════════════════════════════════════════════════════════
-- milestone_states 表：里程碑达成状态
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS milestone_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  milestone_id TEXT NOT NULL,             -- 里程碑 ID，如 "m_motor_爬行"
  status TEXT NOT NULL DEFAULT 'not_started',  -- "not_started" / "progressing" / "achieved"
  achieved_at DATETIME,                   -- 达成时间
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, milestone_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ════════════════════════════════════════════════════════════
-- diary_entries 表：育儿日记
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS diary_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,                  -- 日记正文
  image_urls TEXT,                        -- JSON 字符串：["url1", "url2"]
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,                    -- 软删除
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries(user_id, created_at);

-- ════════════════════════════════════════════════════════════
-- ai_usage 表：AI 调用限流计数（P4 预留）
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,                     -- YYYY-MM-DD
  count INTEGER NOT NULL DEFAULT 0,       -- 当日调用次数
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
