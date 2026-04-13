/**
 * 起起成长 App · 里程碑库示范数据 · 第一阶段
 * 操作性判断引导（observeTip 字段）
 * 用途：验证里程碑判断指导的实用性
 *
 * 状态：待 Lin 审核 → 确认后启动批量填充 30-40 条里程碑
 */

// ── 规范化辅助 ──────────────────────────────────────────────
const DIM_MAP = {
  cognitive:        'cognitive',
  motor:            'motor',
  language:         'language',
  emotional:        'emotional_social',
  emotional_social: 'emotional_social',
  habit:            'self_care',
  self_care:        'self_care',
};

function normalizeMilestone(raw) {
  return {
    ...raw,
    title: raw.name ?? raw.title,
    domain: DIM_MAP[raw.dim] ?? DIM_MAP[raw.domain] ?? raw.dim ?? raw.domain,
  };
}

const _RAW_MILESTONES = [
  /**
   * 认知维度
   */
  {
    id: 'm_cog_视觉追踪',
    dim: 'cognitive',
    whoField: '认知理解（视觉）',
    name: '视觉追踪',
    windowStart: 0,
    windowEnd: 3,
    description: '婴儿能光滑地追踪缓慢移动的物体，视线不中断',
    piaget: '反射性追踪（新生儿）→ 随意追踪（1-2月）',

    // v1.5新增：达成判断引导
    // 触发时机：父母点击「标记达成」时弹出
    // 形式：2-3 句话，包含具体操作步骤和判断标准
    observeTip: '在婴儿眼前 20-30cm 处缓慢移动一个黑白高对比物体（或红球）。速度要慢——1 秒钟移动 15cm。观察他的眼睛是否跟随，视线是否能跨越中线（眼睛中间）平滑追踪 180°。不应该是一跳一跳的断续追踪。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_客体永久性',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '客体永久性',
    windowStart: 6,
    windowEnd: 12,
    description: '婴儿理解消失的物体仍然存在，会主动寻找被隐藏的物品',
    piaget: '协调的次级图式（8-12月）',

    observeTip: '用不透明方巾在婴儿注视的情况下完全遮盖他的熟悉玩具。等 5 秒，观察他有没有主动去揭开方巾寻找玩具。6-8 月龄可能只看着方巾的位置；8+ 月龄应该能主动揭开。如果他立即失去兴趣转向其他地方，说明还在萌芽期。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_因果认知',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '因果认知',
    windowStart: 4,
    windowEnd: 8,
    description: '婴儿理解自己的动作会引起外界变化，主动重复因果行为',
    piaget: '次级循环反应（4-8月）',

    observeTip: '让婴儿脚踝绑一个松紧带，系上铃铛。完全退后不干预，让他偶然触发。如果他发现踢腿会发声，之后会持续增加踢腿频率，这说明他开始建立因果联系。关键指标：踢腿的重复性和节奏的改变。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_社会性微笑',
    dim: 'cognitive',
    whoField: '社会情绪',
    name: '社会性微笑',
    windowStart: 4,
    windowEnd: 8,
    description: '婴儿对人脸（尤其是熟悉人脸）出现有意识的微笑反应',
    piaget: '无差别反射期后的社会适应',

    observeTip: '在清醒安静时期，在婴儿视线 30cm 处缓慢靠近，轻声说话或做简单的鬼脸。观察他的嘴角是否上扬成「笑容」（注意：不是反射性的生理微笑，应该伴随眼睛的关注和可能的身体反应）。6 周以上的婴儿应该能对熟悉人脸产生社会性微笑。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 运动维度
   */
  {
    id: 'm_motor_对指抓握',
    dim: 'motor',
    whoField: '精细动作',
    name: '对指抓握',
    windowStart: 6,
    windowEnd: 10,
    description: '用拇指和食指对捏，能准确抓取小物件（如豌豆大小）',
    piaget: null,

    observeTip: '在婴儿面前放一个豌豆大小的软质物体（如湿纸球、小海绵块）。观察他的抓握方式：4-6月是全手掌抓；6-8月开始出现三指捏；8-10月应该能用拇指和食指对捏。标志是他能准确地用两个指头夹起物体，而不是全手抓。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_独坐不需支撑',
    dim: 'motor',
    whoField: '粗大动作',
    name: '独坐不需支撑',
    windowStart: 6,
    windowEnd: 9,
    description: '无任何支撑下，独立坐立 ≥30 秒，躯干直立',
    piaget: null,

    observeTip: '让婴儿坐在平坦、铺垫的地面或垫子上，你的手完全放下（不接触婴儿）。观察他的躯干是否笔直，头部是否稳定（不摇晃），能维持这个姿势多久。目标是不需要任何支撑（不靠墙、不靠人、不靠垫子）独坐 30 秒以上。6月初可能需要轻微支撑，7-9月应该能独坐。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_爬行',
    dim: 'motor',
    whoField: '粗大动作',
    name: '爬行',
    windowStart: 7,
    windowEnd: 11,
    description: '双手双膝协调爬行，能有目的地向某个物体爬去',
    piaget: null,

    observeTip: '在婴儿能独坐后，在 1-2 米远处放置一个吸引物（色彩鲜艳的玩具或你自己）。观察他有没有用双手双膝的交替动作向前移动。初期可能是匍匐爬（腹部贴地）或螃蟹爬（侧身），都属于爬行的变体。关键是「有目的地向某处移动」，而不是原地挥舞。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 情感维度
   */
  {
    id: 'm_emotional_陌生人焦虑',
    dim: 'emotional',
    whoField: '社会情绪',
    name: '陌生人焦虑',
    windowStart: 6,
    windowEnd: 9,
    description: '在陌生人面前表现出明显的害羞、警惕或回避行为',
    piaget: null,

    observeTip: '当一个婴儿不熟悉的人靠近或与婴儿互动时，观察婴儿的反应。6-9月龄应该表现出：寻求熟悉照顾者、身体靠向你、回避陌生人目光、甚至哭闹。这不是「坏」行为，而是社会情绪健康发展的信号——说明他已经能区分熟悉与陌生。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_依恋行为',
    dim: 'emotional',
    whoField: '社会情绪',
    name: '主动依恋行为',
    windowStart: 6,
    windowEnd: 12,
    description: '主动靠向熟悉照顾者寻求安慰，当照顾者离开时表现出明显反应',
    piaget: null,

    observeTip: '观察日常生活中的几个时刻：当婴儿受惊或不舒服时，他有没有主动爬/走向你而不是向别人？当你离开房间时，他有没有哭泣或追随？当你回来时，他有没有伸手要你抱？这些都是「安全依恋」的表现。如果他对你和陌生人一样回应，说明依恋还未成熟。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 习惯维度
   */
  {
    id: 'm_habit_秩序感_惯例',
    dim: 'habit',
    whoField: '日常生活',
    name: '秩序感（日常惯例）',
    windowStart: 6,
    windowEnd: 12,
    description: '对日常程序表现出预期行为，如听到换衣背景音乐就准备，或固定位置进食',
    piaget: null,

    observeTip: '建立固定的日常程序（如每天固定时间、固定地点、固定顺序的活动）。观察婴儿是否表现出预期行为：比如你每次拿起特定的歌曲/铃铛时，他是否做出换衣的肢体准备？或在固定的吃饭地点坐下时是否表现出兴奋？这说明他记住了程序顺序，秩序感在发展。',

    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  }
];

export const MILESTONES = _RAW_MILESTONES.map(normalizeMilestone);
