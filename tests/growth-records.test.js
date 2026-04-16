import { describe, it, expect } from 'vitest';
import { buildActivityRecordsHTML } from '../js/ui/growth-records.js';

const sampleActivities = [
  { id: 'S-0-01', title: '触觉感官板', domain: 'sensorial' },
];

const sampleRecords = [
  {
    id: 1,
    actId: 'S-0-01',
    date: '2026-04-14',
    focusSec: 90,
    emotion: 'engaged',
    initType: 'child_led',
    note: '很专注，一直在摸',
  },
  {
    id: 2,
    actId: 'S-0-01',
    date: '2026-04-07',
    focusSec: 60,
    emotion: 'calm',
    initType: 'adult_led',
    note: '',
  },
];

describe('buildActivityRecordsHTML', () => {
  it('renders section title', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('活动记录');
  });

  it('renders activity title for each record', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('触觉感官板');
  });

  it('renders record date', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('2026-04-14');
  });

  it('renders focusSec as mm:ss', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('01:30');
  });

  it('renders edit button with data-ar-action', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('data-ar-action="edit"');
  });

  it('renders delete button with data-ar-action', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('data-ar-action="delete"');
  });

  it('renders record id in data-id attribute', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('data-id="1"');
  });

  it('renders truncated note preview (max 40 chars)', () => {
    const longNote = 'a'.repeat(50);
    const records = [{ ...sampleRecords[0], note: longNote }];
    const html = buildActivityRecordsHTML({ records, activities: sampleActivities });
    expect(html).toContain('a'.repeat(40) + '…');
    expect(html).not.toContain('a'.repeat(41));
  });

  it('renders empty state when no records', () => {
    const html = buildActivityRecordsHTML({ records: [], activities: sampleActivities });
    expect(html).toContain('还没有活动记录');
  });

  it('renders ar-actions wrapper with record id', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('id="ar-actions-1"');
  });

  it('falls back to actId when activity not found', () => {
    const records = [{ ...sampleRecords[0], actId: 'X-99-99' }];
    const html = buildActivityRecordsHTML({ records, activities: sampleActivities });
    expect(html).toContain('X-99-99');
  });
});
