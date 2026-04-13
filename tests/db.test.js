import { describe, test, expect, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { openDB } from '../js/db.js';

// 每个 test 用独立的 IDB 实例，互不干扰
let db;
beforeEach(async () => {
  db = await openDB(new IDBFactory());
});

// ── Store 初始化 ───────────────────────────────────────────

describe('initDB — 6个store初始化', () => {
  test('DB 打开成功，包含 profile store', async () => {
    const stores = Array.from(db.idb.objectStoreNames);
    expect(stores).toContain('profile');
  });

  test('包含所有6个store', async () => {
    const stores = Array.from(db.idb.objectStoreNames);
    expect(stores).toContain('activities');
    expect(stores).toContain('milestones');
    expect(stores).toContain('records');
    expect(stores).toContain('monthlyReviews');
    expect(stores).toContain('settings');
  });
});

// ── Profile ───────────────────────────────────────────────

describe('profile store', () => {
  test('初始时 getProfile 返回 null', async () => {
    expect(await db.getProfile()).toBeNull();
  });

  test('saveProfile 后 getProfile 返回保存内容', async () => {
    await db.saveProfile({ name: '小明', birthDate: '2025-10-01', gender: 'male' });
    const p = await db.getProfile();
    expect(p.name).toBe('小明');
    expect(p.birthDate).toBe('2025-10-01');
  });

  test('saveProfile 覆盖更新', async () => {
    await db.saveProfile({ name: '小明', birthDate: '2025-10-01', gender: 'male' });
    await db.saveProfile({ name: '小红', birthDate: '2025-10-01', gender: 'female' });
    const p = await db.getProfile();
    expect(p.name).toBe('小红');
  });
});

// ── Records ───────────────────────────────────────────────

describe('records store', () => {
  test('addRecord 返回自增 id', async () => {
    const id = await db.addRecord({ actId: 'L-0-01', date: '2026-04-11', focusSec: 90, emotion: 'positive', note: null, initType: 'suggested' });
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  test('getRecords 返回所有记录', async () => {
    await db.addRecord({ actId: 'L-0-01', date: '2026-04-11', focusSec: 90, emotion: 'positive', note: null, initType: 'suggested' });
    await db.addRecord({ actId: 'S-0-02', date: '2026-04-10', focusSec: 60, emotion: 'neutral', note: 'ok', initType: 'self' });
    const records = await db.getRecords();
    expect(records).toHaveLength(2);
  });

  test('getRecordsByDate 按日期范围查询', async () => {
    await db.addRecord({ actId: 'L-0-01', date: '2026-04-09', focusSec: 90, emotion: 'positive', note: null, initType: 'suggested' });
    await db.addRecord({ actId: 'S-0-02', date: '2026-04-11', focusSec: 60, emotion: 'neutral', note: null, initType: 'suggested' });
    const results = await db.getRecordsByDate('2026-04-10', '2026-04-11');
    expect(results).toHaveLength(1);
    expect(results[0].actId).toBe('S-0-02');
  });

  test('getRecordsByAct 按活动ID查询', async () => {
    await db.addRecord({ actId: 'L-0-01', date: '2026-04-10', focusSec: 90, emotion: 'positive', note: null, initType: 'suggested' });
    await db.addRecord({ actId: 'L-0-01', date: '2026-04-11', focusSec: 100, emotion: 'positive', note: null, initType: 'suggested' });
    await db.addRecord({ actId: 'S-0-02', date: '2026-04-11', focusSec: 60, emotion: 'neutral', note: null, initType: 'suggested' });
    const results = await db.getRecordsByAct('L-0-01');
    expect(results).toHaveLength(2);
    expect(results.every(r => r.actId === 'L-0-01')).toBe(true);
  });
});

// ── Milestones ────────────────────────────────────────────

describe('milestones store', () => {
  test('saveMilestoneState 保存达成状态', async () => {
    await db.saveMilestoneState('m_cog_社会性微笑', { achieved: true, achievedDate: '2026-04-11' });
    const state = await db.getMilestoneState('m_cog_社会性微笑');
    expect(state.achieved).toBe(true);
    expect(state.achievedDate).toBe('2026-04-11');
  });

  test('未保存的里程碑 getMilestoneState 返回 null', async () => {
    expect(await db.getMilestoneState('m_unknown')).toBeNull();
  });
});

// ── Settings ──────────────────────────────────────────────

describe('settings store', () => {
  test('初始 getSettings 返回默认值', async () => {
    const s = await db.getSettings();
    expect(s.guideIntensity).toBe('normal');
    expect(s.onboardingComplete).toBe(false);
  });

  test('saveSettings 更新后读取正确', async () => {
    await db.saveSettings({ guideIntensity: 'heavy', onboardingComplete: true });
    const s = await db.getSettings();
    expect(s.guideIntensity).toBe('heavy');
    expect(s.onboardingComplete).toBe(true);
  });
});

// ── Monthly Reviews ───────────────────────────────────────

describe('monthlyReviews store', () => {
  test('saveMonthlyReview 后可读取', async () => {
    const review = {
      month: '2026-04',
      dimensions: { concentration: 'developing' },
      notes: '专注力有进步',
    };
    await db.saveMonthlyReview(review);
    const r = await db.getMonthlyReview('2026-04');
    expect(r.dimensions.concentration).toBe('developing');
    expect(r.notes).toBe('专注力有进步');
  });

  test('getMonthlyReview 不存在时返回 null', async () => {
    expect(await db.getMonthlyReview('2099-01')).toBeNull();
  });
});
