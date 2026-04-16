import { describe, it, expect } from 'vitest';
import { buildRecordHTML, buildSessionHTML, parseAnchorQuestions, mergeAnchorAnswers } from '../js/ui/record.js';

const sampleActivity = {
  id: 'S-0-01',
  title: '触觉感官板',
  domain: 'sensorial',
  ageRange: [0, 6],
  typicalSec: 120,
  observeAnchor: '孩子手部接触板面时的专注程度',
};

describe('buildRecordHTML', () => {
  it('renders activity title', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90 });
    expect(html).toContain('触觉感官板');
  });

  it('renders focusSec pre-filled in hidden field', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90 });
    expect(html).toContain('90');
  });

  it('renders emotion options', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    // Should contain at least some emotion options
    expect(html).toContain('专注');
    expect(html).toContain('愉悦');
  });

  it('renders initType options', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('孩子主导');
    expect(html).toContain('成人引导');
  });

  it('renders note textarea', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('textarea');
  });

  it('renders submit button', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('保存记录');
  });
});

describe('buildRecordHTML — observeAnchor 填空', () => {
  it('renders anchor question as label when observeAnchor present', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90 });
    expect(html).toContain('孩子手部接触板面时的专注程度');
  });

  it('renders fill-in input with data-anchor-index when observeAnchor present', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('data-anchor-index="0"');
  });

  it('does NOT render obs-guide-card wrapper anymore', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).not.toContain('obs-guide-card');
  });

  it('does not render fill-in inputs when activity has no observeAnchor', () => {
    const actNoAnchor = { ...sampleActivity, observeAnchor: undefined };
    const html = buildRecordHTML({ activity: actNoAnchor, focusSec: 0 });
    expect(html).not.toContain('data-anchor-index');
  });

  it('hides fill-in section in edit mode (isEdit=true)', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0, isEdit: true });
    expect(html).not.toContain('data-anchor-index');
  });

  it('note placeholder changes when observeAnchor present', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('可在此补充其他观察');
  });

  it('note placeholder is default when no observeAnchor', () => {
    const actNoAnchor = { ...sampleActivity, observeAnchor: undefined };
    const html = buildRecordHTML({ activity: actNoAnchor, focusSec: 0 });
    expect(html).toContain('记录你观察到的细节');
  });
});

describe('buildRecordHTML — manualEntry 时长编辑', () => {
  it('manualEntry=true renders time input fields instead of static display', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0, manualEntry: true });
    expect(html).toContain('id="focus-min"');
    expect(html).toContain('id="focus-sec"');
  });

  it('manualEntry=false renders time as static display with edit hint', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90, manualEntry: false });
    expect(html).toContain('01:30');
    expect(html).toContain('data-action="edit-focussec"');
  });

  it('manualEntry=true stores time in hidden field after input', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0, manualEntry: true });
    // 隐藏字段 data-focussec 用于 submit 时读取
    expect(html).toContain('id="focussec-hidden"');
  });
});

describe('parseAnchorQuestions', () => {
  it('splits multi-question anchor into array', () => {
    const qs = parseAnchorQuestions('他听到你的声音有什么反应？转头？安静下来？');
    expect(qs).toEqual(['他听到你的声音有什么反应？', '转头？', '安静下来？']);
  });

  it('handles single question anchor', () => {
    const qs = parseAnchorQuestions('他在你怀里是放松还是紧绷？');
    expect(qs).toEqual(['他在你怀里是放松还是紧绷？']);
  });

  it('returns empty array for empty string', () => {
    expect(parseAnchorQuestions('')).toEqual([]);
  });

  it('returns empty array for null/undefined', () => {
    expect(parseAnchorQuestions(null)).toEqual([]);
    expect(parseAnchorQuestions(undefined)).toEqual([]);
  });

  it('appends ？ to fragment that did not originally end with one', () => {
    const qs = parseAnchorQuestions('孩子手部接触板面时的专注程度');
    expect(qs).toEqual(['孩子手部接触板面时的专注程度？']);
  });
});

describe('mergeAnchorAnswers', () => {
  it('formats q→a pairs and appends note', () => {
    const result = mergeAnchorAnswers({
      questions: ['转头？', '安静吗？'],
      answers: ['转头了', '不安静'],
      note: '补充观察',
    });
    expect(result).toBe('转头？ → 转头了\n安静吗？ → 不安静\n---\n补充观察');
  });

  it('omits separator when note is empty', () => {
    const result = mergeAnchorAnswers({
      questions: ['转头？'],
      answers: ['转头了'],
      note: '',
    });
    expect(result).toBe('转头？ → 转头了');
  });

  it('omits empty answers from output', () => {
    const result = mergeAnchorAnswers({
      questions: ['转头？', '安静吗？'],
      answers: ['转头了', ''],
      note: '',
    });
    expect(result).toBe('转头？ → 转头了');
  });

  it('returns note unchanged when no questions answered', () => {
    const result = mergeAnchorAnswers({
      questions: ['转头？'],
      answers: [''],
      note: '只有备注',
    });
    expect(result).toBe('只有备注');
  });

  it('returns empty string when both empty', () => {
    const result = mergeAnchorAnswers({ questions: [], answers: [], note: '' });
    expect(result).toBe('');
  });
});

describe('buildSessionHTML', () => {
  it('renders positive feedback', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 90,
      anchorMet: false,
    });
    expect(html).toContain('记录完成');
  });

  it('renders elapsed time in session card', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 75,
      anchorMet: false,
    });
    expect(html).toContain('01:15');
  });

  it('renders anchor met message when anchor is satisfied', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 200,
      anchorMet: true,
    });
    expect(html).toContain('专注超过');
  });

  it('renders activity title in session card', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 60,
      anchorMet: false,
    });
    expect(html).toContain('触觉感官板');
  });

  it('renders continue button', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 60,
      anchorMet: false,
    });
    expect(html).toContain('查看今日');
  });
});
