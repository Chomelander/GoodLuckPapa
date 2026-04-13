import { describe, it, expect } from 'vitest';
import { buildGrowthHTML, buildMilestoneConfirmHTML } from '../js/ui/milestones.js';

const sampleMilestones = [
  {
    id: 'cog-0-01',
    title: '手眼协调初步',
    domain: 'cognitive',
    windowStart: 2,
    windowEnd: 6,
    observeTip: '观察孩子伸手抓取物体时的眼神与手部协同',
  },
  {
    id: 'mot-0-01',
    title: '翻身',
    domain: 'motor',
    windowStart: 4,
    windowEnd: 8,
    observeTip: '观察孩子翻身时的手脚协调',
  },
  {
    id: 'lang-0-01',
    title: '发出有意识的声音',
    domain: 'language',
    windowStart: 2,
    windowEnd: 6,
    observeTip: '注意孩子何时发声',
  },
];

const states = {
  'cog-0-01': { status: 'watching', achievedDate: null },
  'mot-0-01': { status: 'pending', achievedDate: null },
  'lang-0-01': { status: 'achieved', achievedDate: '2026-03-10' },
};

describe('buildGrowthHTML', () => {
  it('renders milestone titles', () => {
    const html = buildGrowthHTML({ milestones: sampleMilestones, ageMonths: 4, milestoneStates: states });
    expect(html).toContain('手眼协调初步');
    expect(html).toContain('翻身');
  });

  it('renders watching badge for watching status', () => {
    const html = buildGrowthHTML({ milestones: sampleMilestones, ageMonths: 4, milestoneStates: states });
    expect(html).toContain('badge-watching');
  });

  it('renders achieved badge for achieved status', () => {
    const html = buildGrowthHTML({ milestones: sampleMilestones, ageMonths: 4, milestoneStates: states });
    expect(html).toContain('badge-achieved');
  });

  it('renders pending badge for pending status', () => {
    const html = buildGrowthHTML({ milestones: sampleMilestones, ageMonths: 4, milestoneStates: states });
    expect(html).toContain('badge-pending');
  });

  it('renders data-milestoneid for click handling', () => {
    const html = buildGrowthHTML({ milestones: sampleMilestones, ageMonths: 4, milestoneStates: states });
    expect(html).toContain('data-milestoneid="cog-0-01"');
  });

  it('shows achieved date for achieved milestone', () => {
    const html = buildGrowthHTML({ milestones: sampleMilestones, ageMonths: 4, milestoneStates: states });
    expect(html).toContain('2026-03-10');
  });

  it('renders empty state when no milestones', () => {
    const html = buildGrowthHTML({ milestones: [], ageMonths: 4, milestoneStates: {} });
    expect(html).toContain('暂无里程碑');
  });
});

describe('buildMilestoneConfirmHTML', () => {
  it('renders milestone title', () => {
    const html = buildMilestoneConfirmHTML({
      milestone: sampleMilestones[0],
      status: 'watching',
    });
    expect(html).toContain('手眼协调初步');
  });

  it('renders observeTip', () => {
    const html = buildMilestoneConfirmHTML({
      milestone: sampleMilestones[0],
      status: 'watching',
    });
    expect(html).toContain('观察孩子伸手抓取物体时的眼神与手部协同');
  });

  it('renders confirm achieved button when watching', () => {
    const html = buildMilestoneConfirmHTML({
      milestone: sampleMilestones[0],
      status: 'watching',
    });
    expect(html).toContain('确认已达成');
  });

  it('does not render confirm button when already achieved', () => {
    const html = buildMilestoneConfirmHTML({
      milestone: sampleMilestones[2],
      status: 'achieved',
    });
    expect(html).not.toContain('确认已达成');
  });

  it('shows M2.5 linked activities section label', () => {
    const milestoneWithLinks = { ...sampleMilestones[0], linkedActivities: ['S-0-01'] };
    const html = buildMilestoneConfirmHTML({
      milestone: milestoneWithLinks,
      status: 'watching',
    });
    expect(html).toContain('相关活动');
  });
});
