import { describe, it, expect } from 'vitest';
import { buildActivitiesHTML, buildActivityDetailHTML, filterByAge, showActivityDetail } from '../js/ui/activities.js';

const acts = [
  {
    id: 'S-0-01',
    title: '触觉感官板',
    domain: 'sensorial',
    ageRange: [0, 6],
    typicalSec: 120,
    observeAnchor: '孩子手部接触板面时的专注程度',
    observeFocus: ['手部动作是否主动'],
    phases: [{ label: '初探阶段', desc: '随手触摸' }],
    linkedMilestones: ['cog-0-01'],
    theoryBite: '手部触觉探索是感官教育的起点',
    materials: ['木质感官板', '防滑垫'],
    environment: '安静的地板区域，无障碍物',
    errorControl: '材质对比明显，孩子自行感知差异',
  },
  {
    id: 'M-0-01',
    title: '翻身练习',
    domain: 'movement',
    ageRange: [3, 9],
    typicalSec: 90,
    observeAnchor: '翻身时手脚协调',
    observeFocus: [],
    phases: [],
    linkedMilestones: ['mot-0-01'],
    theoryBite: null,
  },
];

const milestones = [
  { id: 'cog-0-01', title: '手眼协调初步', domain: 'cognitive' },
  { id: 'mot-0-01', title: '翻身', domain: 'motor' },
];

describe('filterByAge', () => {
  it('returns all activities when ageMonths matches both', () => {
    const result = filterByAge(acts, 4);
    expect(result).toHaveLength(2);
  });

  it('returns only age-appropriate activities', () => {
    const result = filterByAge(acts, 1);
    // S-0-01 covers 0-6 ✓, M-0-01 covers 3-9 ✗
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('S-0-01');
  });

  it('returns empty when no activities match age', () => {
    const result = filterByAge(acts, 12);
    expect(result).toHaveLength(0);
  });
});

describe('buildActivitiesHTML', () => {
  it('renders activity titles', () => {
    const html = buildActivitiesHTML({ activities: acts, ageMonths: 4 });
    expect(html).toContain('触觉感官板');
    expect(html).toContain('翻身练习');
  });

  it('renders domain badges', () => {
    const html = buildActivitiesHTML({ activities: acts, ageMonths: 4 });
    expect(html).toContain('感官');
    expect(html).toContain('运动');
  });

  it('renders age range', () => {
    const html = buildActivitiesHTML({ activities: acts, ageMonths: 4 });
    expect(html).toContain('0-6');
  });

  it('renders empty state when no activities', () => {
    const html = buildActivitiesHTML({ activities: [], ageMonths: 4 });
    expect(html).toContain('暂无活动');
  });

  it('includes data-id for click handling', () => {
    const html = buildActivitiesHTML({ activities: acts, ageMonths: 4 });
    expect(html).toContain('data-actid="S-0-01"');
  });
});

describe('buildActivityDetailHTML', () => {
  it('renders activity title', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('触觉感官板');
  });

  it('renders observeAnchor', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('孩子手部接触板面时的专注程度');
  });

  it('renders observeFocus items', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('手部动作是否主动');
  });

  it('renders phases when present', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('初探阶段');
  });

  it('renders linked milestones — M2.5 bidirectional', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('手眼协调初步');
  });

  it('renders theoryBite when present', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('手部触觉探索是感官教育的起点');
  });

  it('does not render linked milestones section when none linked', () => {
    const actNoLinks = { ...acts[0], linkedMilestones: [] };
    const html = buildActivityDetailHTML({ activity: actNoLinks, milestones });
    expect(html).not.toContain('促进里程碑');
  });
});

describe('buildActivityDetailHTML — guideIntensity 条件渲染', () => {
  it('light 模式不显示 observeFocus', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones, guideIntensity: 'light' });
    expect(html).not.toContain('手部动作是否主动');
  });

  it('light 模式不显示 phases', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones, guideIntensity: 'light' });
    expect(html).not.toContain('初探阶段');
  });

  it('normal 模式显示 observeFocus 和 phases', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones, guideIntensity: 'normal' });
    expect(html).toContain('手部动作是否主动');
    expect(html).toContain('初探阶段');
  });

  it('不传 guideIntensity 默认 normal（向后兼容）', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('手部动作是否主动');
  });
});

describe('buildActivityDetailHTML — 准备环境 A2', () => {
  it('renders 准备环境 section title when A2 fields present', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('准备环境');
  });

  it('renders each material as a list item', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('木质感官板');
    expect(html).toContain('防滑垫');
  });

  it('renders environment description', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('安静的地板区域，无障碍物');
  });

  it('renders errorControl text', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones });
    expect(html).toContain('材质对比明显，孩子自行感知差异');
  });

  it('does not render 准备环境 section when no A2 fields', () => {
    const actNoA2 = { ...acts[0], materials: undefined, environment: undefined, errorControl: undefined };
    const html = buildActivityDetailHTML({ activity: actNoA2, milestones });
    expect(html).not.toContain('准备环境');
  });

  it('does not render materials block when materials is empty array', () => {
    const actNoMat = { ...acts[0], materials: [] };
    const html = buildActivityDetailHTML({ activity: actNoMat, milestones });
    // environment and errorControl still present → section still shows, but no material items
    expect(html).not.toContain('物品清单');
  });

  it('准备环境 section renders in light mode too', () => {
    const html = buildActivityDetailHTML({ activity: acts[0], milestones, guideIntensity: 'light' });
    expect(html).toContain('准备环境');
    expect(html).toContain('木质感官板');
  });
});

describe('showActivityDetail export', () => {
  it('is exported as a function', () => {
    expect(typeof showActivityDetail).toBe('function');
  });
});
