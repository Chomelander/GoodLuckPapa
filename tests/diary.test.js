import { describe, it, expect } from 'vitest';
import { buildDiaryFormHTML, buildDiaryTimelineHTML } from '../js/ui/diary.js';

const sampleEntry = {
  id: 1,
  date: '2026-04-14',
  changes: '今天会翻身了',
  feelings: '太感动了，记录一下',
  images: [],
};

describe('buildDiaryFormHTML — 编辑模式', () => {
  it('pre-fills changes textarea when entry provided', () => {
    const html = buildDiaryFormHTML({ entry: sampleEntry });
    expect(html).toContain('今天会翻身了');
  });

  it('pre-fills feelings textarea when entry provided', () => {
    const html = buildDiaryFormHTML({ entry: sampleEntry });
    expect(html).toContain('太感动了，记录一下');
  });

  it('sets data-entry-id on form when entry has id', () => {
    const html = buildDiaryFormHTML({ entry: sampleEntry });
    expect(html).toContain('data-entry-id="1"');
  });

  it('sets empty data-entry-id when no entry (new diary)', () => {
    const html = buildDiaryFormHTML();
    expect(html).toContain('data-entry-id=""');
  });
});

describe('buildDiaryTimelineHTML — 编辑入口', () => {
  const entries = [sampleEntry];

  it('renders diary-entry-card with data-diary-id', () => {
    const html = buildDiaryTimelineHTML({ entries });
    expect(html).toContain('data-diary-id="1"');
  });

  it('renders edit hint on each card (编辑 text or pencil)', () => {
    const html = buildDiaryTimelineHTML({ entries });
    // 卡片上需有编辑提示（文字或图标）让用户知道可点击
    expect(html).toContain('编辑');
  });

  it('renders entry date in card', () => {
    const html = buildDiaryTimelineHTML({ entries });
    expect(html).toContain('2026-04-14');
  });

  it('renders empty state message when no entries', () => {
    const html = buildDiaryTimelineHTML({ entries: [] });
    expect(html).toContain('还没有日记');
  });
});
