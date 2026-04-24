/**
 * IndexedDB 封装层
 *
 * 6个 Store：
 *   profile         — 孩子档案（单例，key: 'profile'）
 *   activities      — 活动库（内置静态，key: id）
 *   milestones      — 里程碑状态（key: id）
 *   records         — 观察记录（自增主键）
 *   monthlyReviews  — 月度评估（key: 'YYYY-MM'）
 *   settings        — 设置（单例，key: 'main'）
 *
 * @param {IDBFactory} [idbFactory] - 可注入 fake-indexeddb 用于测试
 */
import * as sync from './sync.js';

export async function openDB(idbFactory = globalThis.indexedDB) {
  const DB_NAME = 'qiqi-app';
  const DB_VERSION = 2;

  const idb = await new Promise((resolve, reject) => {
    const req = idbFactory.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile');
      if (!db.objectStoreNames.contains('activities')) db.createObjectStore('activities', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('milestones')) db.createObjectStore('milestones');
      if (!db.objectStoreNames.contains('records')) db.createObjectStore('records', { autoIncrement: true, keyPath: 'id' });
      if (!db.objectStoreNames.contains('monthlyReviews')) db.createObjectStore('monthlyReviews');
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      if (!db.objectStoreNames.contains('diaryEntries')) db.createObjectStore('diaryEntries', { autoIncrement: true, keyPath: 'id' });
      if (!db.objectStoreNames.contains('customActivities')) db.createObjectStore('customActivities', { keyPath: 'id' });
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });

  // 通用事务 helpers
  const tx = (stores, mode = 'readonly') => idb.transaction(stores, mode);
  const rq = (req) => new Promise((res, rej) => {
    req.onsuccess = (e) => res(e.target.result);
    req.onerror = (e) => rej(e.target.error);
  });

  return {
    idb, // 暴露给测试用于断言 objectStoreNames

    // ── Profile ─────────────────────────────────────────

    async getProfile() {
      return (await rq(tx('profile').objectStore('profile').get('profile'))) ?? null;
    },

    async saveProfile(data) {
      const store = tx('profile', 'readwrite').objectStore('profile');
      await rq(store.put({ ...data }, 'profile'));
      sync.pushProfile(data);
    },

    // ── Records ─────────────────────────────────────────

    async addRecord(record) {
      const store = tx('records', 'readwrite').objectStore('records');
      const id = await rq(store.add({ ...record, createdAt: new Date().toISOString() }));
      sync.pushRecord(record);
      return id;
    },

    async getRecords() {
      return rq(tx('records').objectStore('records').getAll());
    },

    async getRecordsByDate(fromDate, toDate) {
      const all = await rq(tx('records').objectStore('records').getAll());
      return all.filter(r => r.date >= fromDate && r.date <= toDate);
    },

    async getRecordsByAct(actId) {
      const all = await rq(tx('records').objectStore('records').getAll());
      return all.filter(r => r.actId === actId);
    },

    async updateRecord(id, patch) {
      const store = tx('records', 'readwrite').objectStore('records');
      const existing = await rq(store.get(id));
      if (!existing) return;
      await rq(store.put({ ...existing, ...patch, id }));
    },

    async deleteRecord(id) {
      await rq(tx('records', 'readwrite').objectStore('records').delete(id));
      sync.deleteRecord(id);
    },

    // ── Milestones ───────────────────────────────────────

    async getMilestoneState(id) {
      return (await rq(tx('milestones').objectStore('milestones').get(id))) ?? null;
    },

    async saveMilestoneState(id, state) {
      await rq(tx('milestones', 'readwrite').objectStore('milestones').put(state, id));
      sync.pushMilestoneState(id, state);
    },

    // ── Settings ─────────────────────────────────────────

    async getSettings() {
      const stored = await rq(tx('settings').objectStore('settings').get('main'));
      return { guideIntensity: 'normal', onboardingComplete: false, ...stored };
    },

    async saveSettings(settings) {
      const current = await this.getSettings();
      await rq(tx('settings', 'readwrite').objectStore('settings').put({ ...current, ...settings }, 'main'));
    },

    // ── Monthly Reviews ───────────────────────────────────

    async getMonthlyReview(month) {
      return (await rq(tx('monthlyReviews').objectStore('monthlyReviews').get(month))) ?? null;
    },

    async saveMonthlyReview(review) {
      await rq(tx('monthlyReviews', 'readwrite').objectStore('monthlyReviews').put(review, review.month));
    },

    // ── Diary Entries ─────────────────────────────────────

    async addDiary(entry) {
      const store = tx('diaryEntries', 'readwrite').objectStore('diaryEntries');
      const id = await rq(store.add({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      sync.pushDiary(entry);
      return id;
    },

    async getDiaries() {
      return rq(tx('diaryEntries').objectStore('diaryEntries').getAll());
    },

    async updateDiary(id, patch) {
      const store = tx('diaryEntries', 'readwrite').objectStore('diaryEntries');
      const existing = await rq(store.get(id));
      if (!existing) return;
      await rq(store.put({ ...existing, ...patch, id, updatedAt: new Date().toISOString() }));
    },

    async deleteDiary(id) {
      await rq(tx('diaryEntries', 'readwrite').objectStore('diaryEntries').delete(id));
      sync.deleteDiary(id);
    },

    // ── Custom Activities ─────────────────────────────────

    async addCustomActivity(act) {
      const store = tx('customActivities', 'readwrite').objectStore('customActivities');
      return rq(store.add({ ...act, createdAt: new Date().toISOString() }));
    },

    async getCustomActivities() {
      return rq(tx('customActivities').objectStore('customActivities').getAll());
    },

    async updateCustomActivity(id, patch) {
      const store = tx('customActivities', 'readwrite').objectStore('customActivities');
      const existing = await rq(store.get(id));
      if (!existing) return;
      await rq(store.put({ ...existing, ...patch, id }));
    },

    async deleteCustomActivity(id) {
      await rq(tx('customActivities', 'readwrite').objectStore('customActivities').delete(id));
    },
  };
}
