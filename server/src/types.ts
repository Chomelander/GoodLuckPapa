// 统一响应格式
export interface APIResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

// JWT Payload
export interface JWTPayload {
  sub: number;           // user_id
  pin: string;           // PIN 码（用于刷新判断）
  iat: number;           // 签发时间
  exp: number;           // 过期时间
}

// 服务端 Bindings（Bun 上下文）
export interface Env {
  JWT_SECRET: string;
  ACCESS_PIN: string;
  DATABASE_PATH: string;
  PORT: number;
}

// 数据库实体
export interface User {
  id: number;
  openid?: string;       // 可选，PWA 场景下不用
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  birth_date: string;    // YYYY-MM-DD
  gender?: string;       // M, F
  created_at: string;
  updated_at: string;
}

export interface Record {
  id: number;
  user_id: number;
  activity_id: string;   // 如 "P-6-01"
  init_type: string;     // "child-led" | "adult-led"
  focus_sec?: number;
  emotion?: string;      // "concentrated", "joyful" 等
  note?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MilestoneState {
  id: number;
  user_id: number;
  milestone_id: string;
  status: "not_started" | "progressing" | "achieved";
  achieved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DiaryEntry {
  id: number;
  user_id: number;
  content: string;
  image_urls?: string;   // JSON 字符串 ["url1", "url2"]
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface AIUsage {
  id: number;
  user_id: number;
  date: string;          // YYYY-MM-DD
  count: number;         // 调用次数
  created_at: string;
  updated_at: string;
}

// 请求体类型
export interface AuthPINRequest {
  pin: string;
}

export interface AuthPINResponse {
  token: string;
  exp: number;
}

export interface CreateRecordRequest {
  activity_id: string;
  init_type: string;
  focus_sec?: number;
  emotion?: string;
  note?: string;
}

export interface UpdateProfileRequest {
  name: string;
  birth_date: string;
  gender?: string;
}

export interface CreateDiaryRequest {
  content: string;
  image_urls?: string[];
}
