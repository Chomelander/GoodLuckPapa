/**
 * sync.js — API 同步层（Phase 1：IndexedDB 写入后 push 到 NAS API）
 *
 * 设计原则：
 * - IndexedDB 是主存储，始终可用（包括离线）
 * - API 是次级存储，NAS 在线时自动同步
 * - 所有 push/delete 操作 fire-and-forget，错误不影响主 UI 流程
 * - 未配置 API 地址时，所有操作静默跳过
 *
 * 配置方式（由设置页写入 localStorage）：
 *   localStorage.setItem('qiqi_api_base', 'http://192.168.1.100')
 *   localStorage.setItem('qiqi_jwt', '<token>')
 */

const API_BASE_KEY = 'qiqi_api_base';
const TOKEN_KEY    = 'qiqi_jwt';

// ── 基础工具 ──────────────────────────────────────

function _getBase() {
  return (localStorage.getItem(API_BASE_KEY) || '').replace(/\/$/, '');
}

function _getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setApiBase(base) {
  localStorage.setItem(API_BASE_KEY, base.replace(/\/$/, ''));
}

/** 是否已配置 API 地址 */
export function isConfigured() {
  return Boolean(_getBase());
}

/** 清除认证信息（登出） */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 通用 fetch 封装
 * - 未配置地址 → 返回 null（静默）
 * - 网络错误 → 返回 null + console.warn
 * - 401 → 清除 token + 返回 null
 */
async function _apiFetch(path, options = {}) {
  const base = _getBase();
  if (!base) return null;

  const token = _getToken();
  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      console.warn('[sync] Token expired, cleared.');
      return null;
    }

    if (!res.ok) {
      console.warn(`[sync] ${options.method || 'GET'} ${path} → ${res.status}`);
      return null;
    }

    return res.json();
  } catch (err) {
    console.warn('[sync] Network error:', err.message);
    return null;
  }
}

// ── 认证 ──────────────────────────────────────────

/**
 * 用 PIN 换取 JWT，成功后自动存入 localStorage
 * @returns {boolean} 是否登录成功
 */
export async function login(pin) {
  const result = await _apiFetch('/api/auth/pin', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
  if (result?.success && result.data?.token) {
    setToken(result.data.token);
    return true;
  }
  return false;
}

// ── Push 操作（fire-and-forget） ───────────────────

/**
 * 同步新增观察记录
 * @param {Object} record - IndexedDB record 对象（含 actId/initType/focusSec/emotion/note）
 */
export function pushRecord(record) {
  _apiFetch('/api/records', {
    method: 'POST',
    body: JSON.stringify({
      activity_id: record.actId,
      init_type:   record.initType   || null,
      focus_sec:   record.focusSec   || null,
      emotion:     record.emotion    || null,
      note:        record.note       || null,
    }),
  });
}

/**
 * 同步删除观察记录
 * @param {number} id - IndexedDB record.id
 */
export function deleteRecord(id) {
  _apiFetch(`/api/records/${id}`, { method: 'DELETE' });
}

/**
 * 同步孩子档案
 * @param {Object} profile - IndexedDB profile 对象（含 name/birthDate/gender）
 */
export function pushProfile(profile) {
  _apiFetch('/api/profile', {
    method: 'PUT',
    body: JSON.stringify({
      name:       profile.name       || null,
      birth_date: profile.birthDate  || null,
      gender:     profile.gender     || null,
    }),
  });
}

/**
 * 同步新增育儿日记
 * @param {Object} entry - IndexedDB diary 对象（含 content/imageUrls）
 */
export function pushDiary(entry) {
  _apiFetch('/api/diary', {
    method: 'POST',
    body: JSON.stringify({
      content:    entry.content    || '',
      image_urls: entry.imageUrls || [],
    }),
  });
}

/**
 * 同步删除育儿日记
 * @param {number} id - IndexedDB diary.id
 */
export function deleteDiary(id) {
  _apiFetch(`/api/diary/${id}`, { method: 'DELETE' });
}

/**
 * 同步里程碑达成状态
 * @param {string} milestoneId - 里程碑 ID
 * @param {Object} milestoneState - { status, achievedDate }
 */
export function pushMilestoneState(milestoneId, milestoneState) {
  _apiFetch(`/api/milestones/states/${milestoneId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: milestoneState.status }),
  });
}

// ── Pull 操作（应用启动时全量拉取） ───────────────

/**
 * 从 API 拉取所有数据（用于跨设备恢复）
 * @returns {{ profile, records, diaries, milestoneStates }}
 */
export async function pullAll() {
  const [profile, records, diaries, milestoneStates] = await Promise.all([
    _apiFetch('/api/profile'),
    _apiFetch('/api/records'),
    _apiFetch('/api/diary'),
    _apiFetch('/api/milestones/states'),
  ]);
  return {
    profile:         profile?.data         ?? null,
    records:         records?.data         ?? [],
    diaries:         diaries?.data         ?? [],
    milestoneStates: milestoneStates?.data ?? [],
  };
}
