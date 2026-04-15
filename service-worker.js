/**
 * 起起成长 Service Worker
 * 策略：Cache-First — 所有资源本地化，无服务端 API，离线后完整可用
 * 升级缓存：修改 CACHE_NAME 版本号，旧缓存自动清理
 */
const CACHE_NAME = 'qiqi-v2';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/css/variables.css',
  '/css/app.css',
  '/js/app.js',
  '/js/db.js',
  '/js/rules.js',
  '/js/data/activities.js',
  '/js/data/milestones.js',
  '/js/ui/onboarding.js',
  '/js/ui/today.js',
  '/js/ui/activities.js',
  '/js/ui/milestones.js',
  '/js/ui/settings.js',
  '/js/ui/timer.js',
  '/js/ui/record.js',
  '/js/ui/reentry.js',
  '/js/ui/review.js',
  '/js/ui/sop.js',
  '/js/ui/diary.js',
  '/js/ui/custom-activity.js',
];

// ── Install：预缓存所有静态资源 ───────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting(); // 立即激活，无需等待旧 SW 退出
});

// ── Activate：清理旧版本缓存 ──────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // 立即接管所有已打开的页面
});

// ── Fetch：Cache-First ────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // 缓存未命中：从网络获取并写入缓存
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 网络也不通时，对导航请求返回离线页面（index.html）
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
