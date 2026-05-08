import { describe, it, expect } from 'vitest';
import {
  buildWeeklyHTML,
  calcWeeklyStats,
  buildMonthlyStatsHTML,
  computeDimensionStats,
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

// ── computeDimensionStats ──────────────────────────────────

const milestones = [
  { id: 'm1', domain: 'motor',    windowStart: 0, windowEnd: 3 },
  { id: 'm2', domain: 'motor',    windowStart: 0, windowEnd: 6 },
  { id: 'm3', domain: 'language', windowStart: 0, windowEnd: 6 },
  { id: 'm4', domain: 'sensory',  windowStart: 3, windowEnd: 9 },
];

const activities = [
  { id: 'M-0-01', domain: 'movement' },
  { id: 'L-0-01', domain: 'language' },
  { id: 'S-0-01', domain: 'sensorial' },
];

const statRecords = [
  { actId: 'M-0-01', date: '2026-04-01' },
  { actId: 'M-0-01', date: '2026-04-15' },
  { actId: 'L-0-01', date: '2026-04-10' },
  { actId: 'S-0-01', date: '2026-03-20' }, // different month — excluded
];

describe('computeDimensionStats', () => {
  it('returns 10 dimension stats', () => {
    const stats = computeDimensionStats({
      milestones, activities, ageMonths: 6, month: '2026-04',
      milestoneStates: {}, records: statRecords,
    });
    expect(stats).toHaveLength(10);
  });

  it('counts observation frequency for this month only', () => {
    const stats = computeDimensionStats({
      milestones, activities, ageMonths: 6, month: '2026-04',
      milestoneStates: {}, records: statRecords,
    });
    const movement = stats.find(d => d.id === 'movement');
    expect(movement.frequency).toBe(2);
    const sensorial = stats.find(d => d.id === 'sensorial');
    expect(sensorial.frequency).toBe(0); // S-0-01 record is in March
  });

  it('returns milestoneRate null when no applicable milestones for age', () => {
    const stats = computeDimensionStats({
      milestones, activities, ageMonths: 2, month: '2026-04',
      milestoneStates: {}, records: [],
    });
    // sensory milestone windowEnd=9, so at ageMonths=2: windowEnd(9) <= 2+1=3 → false → no applicable
    const sensorial = stats.find(d => d.id === 'sensorial');
    expect(sensorial.milestoneRate).toBeNull();
  });

  it('calculates milestone completion rate correctly', () => {
    // ageMonths=6: m1(windowEnd=3 ≤ 7 ✓), m2(windowEnd=6 ≤ 7 ✓) applicable for movement
    // m2 is achieved
    const stats = computeDimensionStats({
      milestones, activities, ageMonths: 6, month: '2026-04',
      milestoneStates: { m2: { status: 'achieved' } }, records: [],
    });
    const movement = stats.find(d => d.id === 'movement');
    expect(movement.milestoneApplicable).toBe(2);
    expect(movement.milestoneAchieved).toBe(1);
    expect(movement.milestoneRate).toBeCloseTo(0.5);
  });

  it('returns milestoneRate 0 when no milestones achieved', () => {
    const stats = computeDimensionStats({
      milestones, activities, ageMonths: 6, month: '2026-04',
      milestoneStates: {}, records: [],
    });
    const movement = stats.find(d => d.id === 'movement');
    expect(movement.milestoneRate).toBe(0);
  });
});

// ── buildMonthlyStatsHTML ──────────────────────────────────

const sampleStats = [
  { id: 'movement', label: '动作发展', milestoneRate: 0.5, milestoneAchieved: 1, milestoneApplicable: 2, frequency: 3 },
  { id: 'sensorial', label: '感官探索', milestoneRate: null, milestoneAchieved: 0, milestoneApplicable: 0, frequency: 0 },
  ...['language','math_logic','practical_life','social_emotion','concentration','independence','creativity','nature_culture'].map(id => (
    { id, label: id, milestoneRate: 0, milestoneAchieved: 0, milestoneApplicable: 1, frequency: 0 }
  )),
];

describe('buildMonthlyStatsHTML', () => {
  it('renders 10 dimension stat items', () => {
    const html = buildMonthlyStatsHTML({ stats: sampleStats, note: null, ageMonths: 6 });
    const matches = html.match(/class="dim-stat-item"/g) || [];
    expect(matches.length).toBe(10);
  });

  it('renders dimension labels', () => {
    const html = buildMonthlyStatsHTML({ stats: sampleStats, note: null, ageMonths: 6 });
    expect(html).toContain('动作发展');
    expect(html).toContain('感官探索');
  });

  it('renders progress bar for dimensions with applicable milestones', () => {
    const html = buildMonthlyStatsHTML({ stats: sampleStats, note: null, ageMonths: 6 });
    expect(html).toContain('width:50%');
  });

  it('renders null milestone indicator for age-inapplicable dimensions', () => {
    const html = buildMonthlyStatsHTML({ stats: sampleStats, note: null, ageMonths: 6 });
    expect(html).toContain('暂无适用里程碑');
  });

  it('shows note when provided', () => {
    const html = buildMonthlyStatsHTML({ stats: sampleStats, note: '宝宝开始爬了', ageMonths: 6 });
    expect(html).toContain('宝宝开始爬了');
    expect(html).not.toContain('save-monthly-note');
  });

  it('shows note input when note is null', () => {
    const html = buildMonthlyStatsHTML({ stats: sampleStats, note: null, ageMonths: 6 });
    expect(html).toContain('save-monthly-note');
    expect(html).toContain('monthly-note');
  });

  it('renders observation frequency count', () => {
    const html = buildMonthlyStatsHTML({ stats: sampleStats, note: null, ageMonths: 6 });
    expect(html).toContain('📝 × 3');
  });
});
