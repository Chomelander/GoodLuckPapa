import { describe, it, expect } from 'vitest';
import {
  buildWeeklyHTML,
  calcWeeklyStats,
  buildMonthlyFormHTML,
  buildWeekRecordsHTML,
} from '../js/ui/review.js';

// records spread across 7 days
const today = '2026-04-11';
const records = [
  { actId: 'S-0-01', date: '2026-04-11', focusSec: 90,  domain: 'sensorial' },
  { actId: 'S-0-01', date: '2026-04-10', focusSec: 120, domain: 'sensorial' },
  { actId: 'M-0-01', date: '2026-04-09', focusSec: 80,  domain: 'movement' },
  { actId: 'L-0-01', date: '2026-04-07', focusSec: 60,  domain: 'language' },
  // gap: 04-08 missing (1 day gap, ok) and 04-06 → 04-07 (also ok)
];

// records with long gap (> 2 days)
const sparseRecords = [
  { actId: 'S-0-01', date: '2026-04-11', focusSec: 90, domain: 'sensorial' },
  { actId: 'S-0-01', date: '2026-04-06', focusSec: 90, domain: 'sensorial' }, // 5-day gap
];

describe('calcWeeklyStats', () => {
  it('counts total records in last 7 days', () => {
    const stats = calcWeeklyStats({ records, today });
    expect(stats.totalRecords).toBe(4);
  });

  it('counts unique active days', () => {
    const stats = calcWeeklyStats({ records, today });
    expect(stats.activeDays).toBe(4); // 04-11, 04-10, 04-09, 04-07
  });

  it('detects no continuity warning when gap ≤ 2 days', () => {
    const stats = calcWeeklyStats({ records, today });
    expect(stats.continuityWarning).toBe(false);
  });

  it('detects continuity warning when gap > 2 days', () => {
    const stats = calcWeeklyStats({ records: sparseRecords, today });
    expect(stats.continuityWarning).toBe(true);
  });

  it('returns zero stats for empty records', () => {
    const stats = calcWeeklyStats({ records: [], today });
    expect(stats.totalRecords).toBe(0);
    expect(stats.activeDays).toBe(0);
    expect(stats.continuityWarning).toBe(false);
  });

  it('identifies domains covered this week', () => {
    const stats = calcWeeklyStats({ records, today });
    expect(stats.domainsCovered).toContain('sensorial');
    expect(stats.domainsCovered).toContain('movement');
    expect(stats.domainsCovered).toContain('language');
  });
});

describe('buildWeeklyHTML', () => {
  it('renders week record count', () => {
    const html = buildWeeklyHTML({ records, today, ageMonths: 4 });
    expect(html).toContain('4');
  });

  it('renders active days count', () => {
    const html = buildWeeklyHTML({ records, today, ageMonths: 4 });
    // "4天" active
    expect(html).toContain('4');
  });

  it('renders continuity warning when gap > 2 days', () => {
    const html = buildWeeklyHTML({ records: sparseRecords, today, ageMonths: 4 });
    expect(html).toContain('连续');
  });

  it('does not render continuity warning for regular records', () => {
    const html = buildWeeklyHTML({ records, today, ageMonths: 4 });
    expect(html).not.toContain('连续性提醒');
  });

  it('renders 5 reflection questions', () => {
    const html = buildWeeklyHTML({ records, today, ageMonths: 4 });
    // Count question items
    const matches = html.match(/class="week-question"/g) || [];
    expect(matches.length).toBe(5);
  });

  it('renders empty state when no records', () => {
    const html = buildWeeklyHTML({ records: [], today, ageMonths: 4 });
    expect(html).toContain('本周还没有记录');
  });
});

describe('buildWeeklyHTML — 可点击统计', () => {
  it('stats card includes data-action="view-records"', () => {
    const html = buildWeeklyHTML({ records, today, ageMonths: 4 });
    expect(html).toContain('data-action="view-records"');
  });
});

const weekActivities = [
  { id: 'S-0-01', title: '触觉感官板' },
  { id: 'M-0-01', title: '翻身练习' },
  { id: 'L-0-01', title: '家人声音与歌谣' },
];

describe('buildWeekRecordsHTML', () => {
  it('shows activity title for each record', () => {
    const html = buildWeekRecordsHTML({ records, activities: weekActivities, today });
    expect(html).toContain('触觉感官板');
    expect(html).toContain('翻身练习');
  });

  it('shows formatted duration (90s → 01:30)', () => {
    const html = buildWeekRecordsHTML({ records, activities: weekActivities, today });
    expect(html).toContain('01:30');
  });

  it('shows record date (MM-DD format)', () => {
    const html = buildWeekRecordsHTML({ records, activities: weekActivities, today });
    expect(html).toContain('04-11');
  });

  it('returns empty state when no week records', () => {
    const html = buildWeekRecordsHTML({ records: [], activities: weekActivities, today });
    expect(html).toContain('本周暂无记录');
  });

  it('only includes records from this week', () => {
    const oldRecord = [{ actId: 'S-0-01', date: '2026-03-01', focusSec: 60, domain: 'sensorial' }];
    const html = buildWeekRecordsHTML({ records: oldRecord, activities: weekActivities, today });
    expect(html).toContain('本周暂无记录');
  });
});

describe('buildMonthlyFormHTML', () => {
  it('renders 10 dimension items', () => {
    const html = buildMonthlyFormHTML({ ageMonths: 4 });
    const matches = html.match(/class="dim-item"/g) || [];
    expect(matches.length).toBe(10);
  });

  it('renders rating inputs for each dimension', () => {
    const html = buildMonthlyFormHTML({ ageMonths: 4 });
    // each dimension has 5 radio options
    const radios = html.match(/type="radio"/g) || [];
    expect(radios.length).toBe(50); // 10 × 5
  });

  it('renders submit button', () => {
    const html = buildMonthlyFormHTML({ ageMonths: 4 });
    expect(html).toContain('保存复盘');
  });

  it('renders dimension labels', () => {
    const html = buildMonthlyFormHTML({ ageMonths: 4 });
    expect(html).toContain('动作发展');
    expect(html).toContain('感官探索');
    expect(html).toContain('语言发展');
  });
});
