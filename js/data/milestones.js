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
  },

  /**
   * 认知维度 - 补充
   */
  {
    id: 'm_cog_形状认知',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '形状认知',
    windowStart: 9,
    windowEnd: 18,
    description: '能识别并区分圆形、方形、三角形等基本几何形状',
    piaget: '感觉运动期的符号功能萌芽',
    observeTip: '在纸上画出或使用实物展示圆形、方形、三角形。说出形状名称，观察孩子是否能用手指正确指向对应形状，或说出形状名称。9-12月能识别最熟悉的圆形；18月左右应能识别三种基本形状。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_颜色认知',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '颜色认知',
    windowStart: 18,
    windowEnd: 30,
    description: '能识别并命名红、蓝、绿、黄等基本颜色',
    piaget: '前运算期的颜色概念形成',
    observeTip: '准备红、蓝、绿、黄等颜色的积木或卡片。说"把红色的给妈妈"，观察孩子是否能从多个颜色中选出正确的一个。18-24月开始认识红色；30月左右应能识别3-4种基本颜色。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_分类能力',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '分类能力',
    windowStart: 18,
    windowEnd: 36,
    description: '能按一个维度（形状、颜色、大小）对物体进行分类',
    piaget: '前运算期的分类能力萌芽',
    observeTip: '准备混合的积木（不同颜色、不同形状、不同大小）。说"把红色的积木放在一起"，观察孩子是否能按颜色分类。18-24月可能只能分2类；30-36月应能按单一维度准确分类。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_专注力',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '专注力',
    windowStart: 12,
    windowEnd: 36,
    description: '能持续注意某事物5-15分钟',
    piaget: '注意力的持续性发展',
    observeTip: '观察孩子在玩玩具或听故事时的持续时间。12-18月可能只关注1-2分钟；24-30月应能持续5-10分钟；36月左右应能保持15分钟左右的专注。注意排除环境干扰因素。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_自我认知',
    dim: 'cognitive',
    whoField: '自我认知',
    name: '自我认知',
    windowStart: 12,
    windowEnd: 24,
    description: '认识自己的身体部位，能指出头、手、脚等',
    piaget: '自我概念的萌芽',
    observeTip: '和孩子面对面坐着，指着自己的鼻子说"鼻子在哪里？"观察他是否能正确指向自己的鼻子。也可以照镜子，指着镜中的自己问"这是谁？"。12-15月可能只认识1-2个部位；24月左右应能认识5个以上。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_分类',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '分类（双维度）',
    windowStart: 24,
    windowEnd: 36,
    description: '能按两个维度对物体进行分类',
    piaget: '分类能力的进阶发展',
    observeTip: '准备同时具有两种属性的物体（如红色大圆、蓝色小圆、红色小方等）。问"把所有红色的放一起"，然后"把圆形和方形分开"。能同时考虑颜色和形状两个维度进行分类为达标。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_逻辑思维',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '逻辑思维',
    windowStart: 24,
    windowEnd: 48,
    description: '理解简单的因果关系，能进行简单推理',
    piaget: '前运算期的逻辑萌芽',
    observeTip: '观察日常生活中孩子能否理解"如果…就…"的因果关系，如"如果下雨就要打伞"。也可以问"因为宝宝哭了，所以妈妈来抱抱，对不对？"。能说出简单的原因是达标的标志。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_叙事能力',
    dim: 'cognitive',
    whoField: '语言与思维',
    name: '叙事能力',
    windowStart: 30,
    windowEnd: 48,
    description: '能讲述简单的事件顺序或小故事',
    piaget: '符号功能的发展',
    observeTip: '看图说话时，观察孩子能否用2-3句话描述图片中的内容。或者问"今天早上做了什么？"观察他是否能按时间顺序描述事件。30-36月只能说1-2句；48月左右应能讲述简单故事。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_序列',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '序列概念',
    windowStart: 24,
    windowEnd: 36,
    description: '理解大小、长短、高矮的排序',
    piaget: '排序概念的萌芽',
    observeTip: '准备3个大小不同的杯子或木块。说"从大到小排起来"，观察孩子是否能按大小排序。也可以用长短不一的棍子进行同样测试。24-30月开始理解大小；36月左右应能完成3个物体的排序。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_尺寸概念',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '尺寸概念',
    windowStart: 18,
    windowEnd: 30,
    description: '理解大、中、小的概念',
    piaget: '大小概念的建立',
    observeTip: '展示不同大小的物品，问"哪个是大的？哪个是小的？"。也可以说"给我一个大球"，观察孩子是否能从多个球中选择正确大小。18-24月可能混淆大小；30月左右应能准确区分。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_空间知觉',
    dim: 'cognitive',
    whoField: '空间认知',
    name: '空间知觉',
    windowStart: 24,
    windowEnd: 48,
    description: '理解上下、前后、左右的基本空间关系',
    piaget: '空间概念的发展',
    observeTip: '在日常生活中渗透空间概念："把书放在桌子上面"、"娃娃在盒子里面还是外面？"。"你的左手在哪里？"能正确伸出左手为达标。24-36月理解上下里外；48月理解左右相对概念。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_一一对应',
    dim: 'cognitive',
    whoField: '数学认知',
    name: '一一对应',
    windowStart: 30,
    windowEnd: 48,
    description: '能将数字与数量对应，理解每个数字代表多少',
    piaget: '数量概念的基础',
    observeTip: '准备数字卡片和相应数量的物品。说"把3个雪花片放在数字3下面"，观察孩子是否能正确匹配。能理解数字3代表3个物体。30-36月可能只对应1-2；48月应能对应1-10。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_几何心智',
    dim: 'cognitive',
    whoField: '空间认知',
    name: '几何心智',
    windowStart: 36,
    windowEnd: 60,
    description: '理解平面几何图形，能识别复杂形状',
    piaget: '几何概念的深化',
    observeTip: '展示长方形、菱形、椭圆形等复杂图形，问"这是什么形状？"。36-48月能识别正方形、圆形、三角形；60月左右应能识别并命名多种平面几何图形。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_创造力',
    dim: 'cognitive',
    whoField: '创造性思维',
    name: '创造力',
    windowStart: 36,
    windowEnd: 60,
    description: '能进行创造性想象和假装游戏',
    piaget: '符号联想能力的发展',
    observeTip: '观察孩子是否会用想象力玩游戏，如假装用香蕉当电话、用纸箱当汽车。或者说"我们来玩医生游戏吧"，看他是否能参与并丰富假装游戏的情节。36-48月是假装游戏高峰期。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_数学心智',
    dim: 'cognitive',
    whoField: '数学认知',
    name: '数学心智',
    windowStart: 36,
    windowEnd: 60,
    description: '对数学概念有初步兴趣和理解',
    piaget: '具体运算思维的萌芽',
    observeTip: '观察孩子在日常生活中是否自发数数、比较多少、分类整理。问"这里有多少个苹果？"或"哪个更多？"。对数学问题表现出好奇心是重要信号。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_空间想象',
    dim: 'cognitive',
    whoField: '空间认知',
    name: '空间想象',
    windowStart: 48,
    windowEnd: 72,
    description: '能在头脑中进行空间旋转和想象',
    piaget: '心理旋转能力的发展',
    observeTip: '拼图和积木搭建是测试空间想象的好方法。问"如果把这个积木转一下，会变成什么样？"。能完成复杂拼图（20片以上）或描述想象中的空间变化为达标。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_生命概念',
    dim: 'cognitive',
    whoField: '科学认知',
    name: '生命概念',
    windowStart: 48,
    windowEnd: 72,
    description: '理解生命成长过程，知道动植物的生长变化',
    piaget: '生物概念的形成',
    observeTip: '观察孩子是否理解"种子长大变成植物"、"毛毛虫变成蝴蝶"等生命变化过程。能说出生命成长的基本阶段：出生、成长、变化。能照顾小植物或小动物是重要信号。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_时间线',
    dim: 'cognitive',
    whoField: '时间认知',
    name: '时间概念',
    windowStart: 36,
    windowEnd: 60,
    description: '理解过去、现在、未来的基本时间顺序',
    observeTip: '使用日常照片讲解时间顺序："这是你小时候，这是你现在的样子"。问"明天我们要去哪里？""昨天我们做了什么？"。能说出昨天、今天、明天的概念为达标。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_因果关系',
    dim: 'cognitive',
    whoField: '逻辑思维',
    name: '因果关系',
    windowStart: 36,
    windowEnd: 60,
    description: '理解事件之间的因果链条',
    observeTip: '观察孩子能否解释"为什么"的问题："为什么天会黑？""为什么植物需要水？"。能说出简单但合理的原因，如"因为太阳下山了所以天黑了"。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_地理概念',
    dim: 'cognitive',
    whoField: '空间认知',
    name: '地理概念',
    windowStart: 48,
    windowEnd: 72,
    description: '理解地点、方向、地图等基本地理概念',
    observeTip: '使用简单地图或地球仪，问"我们的家在哪里？"。去过的地方能否说出名称和方位。能在引导下描述简单路线，如"从家到幼儿园要左转再右转"。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_多样性',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '多样性认知',
    windowStart: 48,
    windowEnd: 72,
    description: '理解不同文化、物种的多样性',
    observeTip: '观察孩子对不同肤色、语言、文化的反应。能接受并尊重差异。问"世界上有很多不同的国家，你想知道哪个？"。能说出2-3个国家的名称或特点。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_科学思维',
    dim: 'cognitive',
    whoField: '科学认知',
    name: '科学思维',
    windowStart: 48,
    windowEnd: 72,
    description: '能提出假设并验证，探索自然规律',
    observeTip: '设计简单实验："我们猜猜这块冰放在阳光下会怎么样？"。观察孩子是否会预测结果并观察变化。能提出"为什么"的问题并尝试寻找答案是重要标志。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_好奇心',
    dim: 'cognitive',
    whoField: '探索精神',
    name: '好奇心',
    windowStart: 36,
    windowEnd: 72,
    description: '主动探索未知，提问多且有深度',
    observeTip: '统计孩子每天提问的数量和类型。36-48月多问"这是什么"；48-60月多问"为什么"；60月以上可能问"如果...会怎样"。提问频率高且有逻辑性为佳。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_观察',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '观察力',
    windowStart: 24,
    windowEnd: 60,
    description: '能仔细观察细节，发现事物特征和变化',
    observeTip: '"找不同"游戏是测试观察力的好方法。展示两幅相似但有细微差异的图片，问"这两幅图有什么不同？"。能发现3处以上细微差异为达标。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_对称',
    dim: 'cognitive',
    whoField: '几何认知',
    name: '对称概念',
    windowStart: 36,
    windowEnd: 48,
    description: '理解对称的概念，能识别对称图形',
    observeTip: '展示蝴蝶、叶子等对称物品，问"左右两边一样吗？"。用镜子展示对称概念。能说出"对称"并能沿对称轴对折图形。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_cog_多维度认知',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '多维度思维',
    windowStart: 48,
    windowEnd: 72,
    description: '能同时考虑两个或多个属性进行判断',
    observeTip: '给出口头指令："把红色的、大的那积木给我"。需要同时考虑颜色和大小两个属性。60月左右应能处理2个维度的复合指令。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 运动维度 - 补充
   */
  {
    id: 'm_motor_抬头',
    dim: 'motor',
    whoField: '粗大动作',
    name: '抬头',
    windowStart: 1,
    windowEnd: 4,
    description: '能控制头部抬起，俯卧时能抬头片刻',
    observeTip: '婴儿俯卧时，在前方用玩具吸引注意。观察他是否能抬起头，抬起的角度和时间。1-2月抬头可达45度；3-4月能抬头90度并保持一段时间。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_俯趴',
    dim: 'motor',
    whoField: '粗大动作',
    name: '俯趴（Tummy Time）',
    windowStart: 0,
    windowEnd: 4,
    description: '俯卧时能抬头片刻，锻炼颈部肌肉',
    observeTip: '每天清醒时让婴儿俯趴在软垫上。观察他是否能抬起头，抬起的时间是否逐渐延长。理想的俯趴时间是每天累计30分钟以上。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_反射性抓握',
    dim: 'motor',
    whoField: '精细动作',
    name: '反射性抓握',
    windowStart: 0,
    windowEnd: 4,
    description: '有抓握反射，能握住放在手心的物体',
    observeTip: '将手指或轻质玩具放在婴儿手心，观察他是否会无意识地握紧。抓握反射在2-3月时最强，之后逐渐被有意识的抓握取代。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_有意识抓握',
    dim: 'motor',
    whoField: '精细动作',
    name: '有意识抓握',
    windowStart: 3,
    windowEnd: 6,
    description: '能主动伸手抓握物体，而非反射性抓握',
    observeTip: '在婴儿面前展示一个彩色玩具，观察他是否主动伸手去抓。3-4月可能只能碰到物体；4-5月能有意识伸手但抓不准；6月左右应能准确抓握。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_对指捏',
    dim: 'motor',
    whoField: '精细动作',
    name: '对指捏取',
    windowStart: 6,
    windowEnd: 12,
    description: '能用拇指和食指对捏，准确抓取小物件',
    observeTip: '在婴儿面前放一个豌豆大小的软质物体。观察他抓取的方式：6-8月可能还只能用全手抓；9-12月应用拇指食指对捏。能否用两个指尖准确夹起物体是判断标准。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_手眼协调',
    dim: 'motor',
    whoField: '精细动作',
    name: '手眼协调',
    windowStart: 6,
    windowEnd: 18,
    description: '视觉与手部动作配合，能准确操作物体',
    observeTip: '观察孩子串珠子、拼拼图、搭积木等活动时的表现。能否眼到手到地完成精细操作。6-9月开始发展，12-18月趋于成熟。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_双手传递',
    dim: 'motor',
    whoField: '精细动作',
    name: '双手传递',
    windowStart: 9,
    windowEnd: 15,
    description: '能双手交换物体，协调性好',
    observeTip: '给孩子一个玩具，等他握好后递给他另一个玩具，观察他是否能把原来手中的玩具换到另一只手再接新玩具。9-12月可能需要帮助；15月左右应能独立完成。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_独立行走',
    dim: 'motor',
    whoField: '粗大动作',
    name: '独立行走',
    windowStart: 9,
    windowEnd: 15,
    description: '不需扶持，能独立行走一段距离',
    observeTip: '让孩子站立，向前走出1-2米去拿玩具。观察是否需要扶东西或成人手扶。9-11月可能只能扶走；12-15月应能独立走几步但可能不稳；15月以上应能走得很稳。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_平衡感',
    dim: 'motor',
    whoField: '粗大动作',
    name: '平衡感',
    windowStart: 12,
    windowEnd: 24,
    description: '行走和活动时能保持身体平衡',
    observeTip: '观察孩子行走、跑动、转弯时的平衡能力。能否在行走中弯腰捡东西不摔倒？能否后退走？能否在窄线上行走？平衡感好的孩子动作流畅、不易摔倒。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_精细动作',
    dim: 'motor',
    whoField: '精细动作',
    name: '精细动作',
    windowStart: 12,
    windowEnd: 36,
    description: '手指灵活，能完成剪纸、折纸、系扣子等精细活动',
    observeTip: '观察孩子日常生活中的精细动作：能否用勺子吃饭、能否搭5块以上积木、能否串珠子。36月左右应能使用剪刀剪纸、折出简单形状。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_跑步',
    dim: 'motor',
    whoField: '粗大动作',
    name: '跑步',
    windowStart: 18,
    windowEnd: 30,
    description: '能稳定地跑动，动作协调',
    observeTip: '带孩子到户外，观察他跑动时的姿态。18-24月开始学跑，可能跌跌撞撞；30月左右应能稳定跑步，能绕过障碍物，能自己停下来。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_跳跃',
    dim: 'motor',
    whoField: '粗大动作',
    name: '跳跃',
    windowStart: 24,
    windowEnd: 48,
    description: '能双脚跳起，落地稳定',
    observeTip: '在地上画一条线，让孩子双脚跳过去。24-30月可能只能跳离地面一点点；36月应能双脚跳起并稳稳落地；48月能跳远、跳高。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_单脚站',
    dim: 'motor',
    whoField: '粗大动作',
    name: '单脚站立',
    windowStart: 36,
    windowEnd: 60,
    description: '能单脚站立5秒以上',
    observeTip: '鼓励孩子抬起一只脚站立，你数数看能站多久。36-48月可能只能站2-3秒；60月左右应能单脚站立5-10秒。能完成单脚跳是更高水平。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_大运动',
    dim: 'motor',
    whoField: '粗大动作',
    name: '大运动发展',
    windowStart: 24,
    windowEnd: 72,
    description: '跑、跳、攀爬、投掷等大肌肉运动协调',
    observeTip: '观察孩子户外活动时的表现：是否能骑平衡车、是否能攀爬架、是否能踢球、是否能接球。60月以上应有较好的大运动能力。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_motor_书写前准备',
    dim: 'motor',
    whoField: '精细动作',
    name: '书写前准备',
    windowStart: 36,
    windowEnd: 60,
    description: '掌握正确握笔姿势，能画简单图形',
    observeTip: '观察孩子握笔方式，拇指和食指应形成稳定的握笔点。能否画圆形、正方形、三角形？线条是否流畅稳定？36-48月能画简单人物；60月能写字母和简单汉字。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 语言维度
   */
  {
    id: 'm_language_定向反应',
    dim: 'language',
    whoField: '语言理解',
    name: '声音定向反应',
    windowStart: 1,
    windowEnd: 4,
    description: '对声音有转头寻找声源的反应',
    observeTip: '在婴儿视线外拍手或摇铃，观察他是否转头寻找声音来源。1-2月可能只对大声音有反应；3-4月应能转头180度寻找声源。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_咿呀学语',
    dim: 'language',
    whoField: '语言表达',
    name: '咿呀学语',
    windowStart: 4,
    windowEnd: 8,
    description: '发出韵母音节，咿咿呀呀地自言自语',
    observeTip: '倾听婴儿的声音。4-6月主要发出单韵母音（a、o、e）；6-8月开始发出辅音+韵母的音节（ma、da）。注意是否有音调变化。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_词汇理解',
    dim: 'language',
    whoField: '语言理解',
    name: '词汇理解',
    windowStart: 8,
    windowEnd: 14,
    description: '能理解简单指令，如"给我"、"不可以"',
    observeTip: '说简单指令如"宝宝，给妈妈"、"不可以碰"，观察孩子是否理解并有相应反应。8-10月理解简单词；12-14月能理解20个以上词汇。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_声音模仿',
    dim: 'language',
    whoField: '语言表达',
    name: '声音模仿',
    windowStart: 6,
    windowEnd: 12,
    description: '模仿听到的声音和音节',
    observeTip: '对着婴儿发出简单声音（如"噗噗"、动物叫声），观察他是否尝试模仿。6-9月开始模仿音调；10-12月能模仿词语。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_语言表达',
    dim: 'language',
    whoField: '语言表达',
    name: '语言表达',
    windowStart: 10,
    windowEnd: 18,
    description: '有意识地发声，能说简单的词',
    observeTip: '观察孩子是否有意识地叫"妈妈"、"爸爸"。10-12月开始有意识地发音；18月左右能说3-10个单词。能用声音、手势、表情来表达需求。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_词汇',
    dim: 'language',
    whoField: '语言表达',
    name: '词汇量',
    windowStart: 12,
    windowEnd: 24,
    description: '能说单个词，词汇量逐渐增加',
    observeTip: '记录孩子能说的单词数量。12-15月约3-10个词；18-24月约50-100个词。能用单词命名常见物品、人物。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_双词句',
    dim: 'language',
    whoField: '语言表达',
    name: '双词组合',
    windowStart: 18,
    windowEnd: 24,
    description: '能把两个词组合在一起表达完整意思',
    observeTip: '观察孩子是否说"妈妈抱"、"宝宝饿"等两个词的组合。这表明孩子开始用语法规则组合词。18-21月可能出现；24月应能较常说双词句。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_简单句子',
    dim: 'language',
    whoField: '语言表达',
    name: '简单句子',
    windowStart: 24,
    windowEnd: 36,
    description: '能说3-5个字的简单句子',
    observeTip: '记录孩子说的句子。24-30月说3-4字的短句；36月左右能说5-6字的完整句子。能用句子表达需求和描述事物。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_句子长度',
    dim: 'language',
    whoField: '语言表达',
    name: '句子长度增加',
    windowStart: 36,
    windowEnd: 48,
    description: '能说复杂句子，句子长度和语法进步',
    observeTip: '观察孩子是否能说"因为...所以..."、"如果...就..."等关联词。能使用代词、介词等。36-42月句子长度可达6-8字；48月能说包含2-3个从句的句子。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_理解简单句子',
    dim: 'language',
    whoField: '语言理解',
    name: '理解简单问句',
    windowStart: 18,
    windowEnd: 24,
    description: '能理解简单问句，如"要不要"、"是不是"',
    observeTip: '问孩子"要不要喝水？""这是不是苹果？"观察他是否能理解问句并用点头、摇头或语言回答。18-24月能理解选择问句。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_理解复杂句',
    dim: 'language',
    whoField: '语言理解',
    name: '理解复杂句',
    windowStart: 48,
    windowEnd: 72,
    description: '能理解包含多个条件的复合句',
    observeTip: '给出复杂指令如"先去洗手，然后拿杯子，最后坐好"。观察孩子是否按正确顺序完成所有步骤。能理解"因为...所以..."等因果复句。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_叙事',
    dim: 'language',
    whoField: '语言表达',
    name: '叙事能力',
    windowStart: 36,
    windowEnd: 60,
    description: '能讲述事件或故事，有条理地叙述',
    observeTip: '问"今天去了哪里？""刚才发生了什么？"。观察孩子是否能按时间顺序讲述，是否能描述人物、动作、场景。36-48月只能说片段；60月能完整叙述。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_语音意识',
    dim: 'language',
    whoField: '语言认知',
    name: '语音意识',
    windowStart: 36,
    windowEnd: 60,
    description: '能感知语音单位，分辨不同发音',
    observeTip: '说一个音，让孩子分辨首音："苹果的音是什么？"。唱儿歌时是否能押韵。36-48月能分辨音节；60月能有初步的音素意识。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_拼读',
    dim: 'language',
    whoField: '语言认知',
    name: '拼读意识',
    windowStart: 48,
    windowEnd: 72,
    description: '有拼读意识，能将音与字对应',
    observeTip: '看到认识的字是否会尝试读出来。能否将简单音节拼在一起。48-60月开始有拼读意识；72月能读简单音节词。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_字母认知',
    dim: 'language',
    whoField: '语言认知',
    name: '字母认知',
    windowStart: 48,
    windowEnd: 72,
    description: '认识字母形状，能区分不同字母',
    observeTip: '展示字母卡片，问"这是什么字母？"。能否说出字母的发音。能否区分字母大小写。48-60月认识少量字母；72月认识大部分字母。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_命名',
    dim: 'language',
    whoField: '语言表达',
    name: '命名能力',
    windowStart: 24,
    windowEnd: 36,
    description: '能说出物品名称，丰富词汇',
    observeTip: '展示图片或实物问"这是什么？"。记录孩子能命名的物品数量。24-30月约50个；36月可达100个以上。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_词汇积累',
    dim: 'language',
    whoField: '语言表达',
    name: '词汇快速增长',
    windowStart: 24,
    windowEnd: 48,
    description: '词汇量快速增长，出现命名爆炸',
    observeTip: '关注孩子是否每天学会新词。24-36月是词汇爆发期，每天可能学会几个新词。能用新词造句。48月词汇量可达2000+。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_语言理解',
    dim: 'language',
    whoField: '语言理解',
    name: '语言理解能力',
    windowStart: 24,
    windowEnd: 48,
    description: '能理解故事情节，跟上对话',
    observeTip: '读故事时问"故事里讲了什么？""主人公做了什么？"。能否回答关于故事的问题。能否参与对话并提出问题。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_language_数字认知',
    dim: 'language',
    whoField: '语言与数学',
    name: '数字语言',
    windowStart: 36,
    windowEnd: 60,
    description: '理解数字词汇，能数数',
    observeTip: '能否从1数到10。能否理解"一个"、"两个"、"三个"的含义。能否说出自己的年龄。36-48月数数1-10；60月理解数量含义。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 情绪-社会性维度
   */
  {
    id: 'm_emotional_依恋建立',
    dim: 'emotional',
    whoField: '社会情绪',
    name: '依恋建立',
    windowStart: 6,
    windowEnd: 12,
    description: '与主要照顾者建立情感连接',
    observeTip: '观察孩子与主要照顾者分离时的反应。6-9月是否表现出不舍；12月是否主动寻求安慰。安全依恋的孩子更愿意探索新环境。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_自我认知萌芽',
    dim: 'emotional',
    whoField: '自我认知',
    name: '自我认知萌芽',
    windowStart: 9,
    windowEnd: 15,
    description: '认识镜中的自己，能分辨自我与他人',
    observeTip: '让孩子照镜子，用手指着镜中的像问"这是谁？"。9-12月可能只对镜中像好奇；15月左右能认出自己。能指出照片中的自己。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_情绪认知',
    dim: 'emotional',
    whoField: '情绪理解',
    name: '情绪认知',
    windowStart: 18,
    windowEnd: 30,
    description: '认识基本情绪，能识别开心、难过、生气等',
    observeTip: '指着脸部表情图问"这个小朋友怎么了？"。能否说出开心、难过、生气、害怕等情绪词。能否识别他人的情绪变化。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_情绪调节',
    dim: 'emotional',
    whoField: '情绪管理',
    name: '情绪调节',
    windowStart: 24,
    windowEnd: 48,
    description: '能自我安抚，调节情绪反应',
    observeTip: '观察孩子情绪失控时的表现。24-36月是否能在安慰下平静；48月是否能用语言表达情绪而非只哭闹。能否使用自我安抚策略。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_共情',
    dim: 'emotional',
    whoField: '社会情绪',
    name: '共情能力',
    windowStart: 18,
    windowEnd: 36,
    description: '能感受他人情绪，对他人表现出关心',
    observeTip: '当看到其他孩子哭时，观察自己孩子的反应。是否有安慰行为，如拍肩、给玩具。18-24月开始有共情表现；36月应有明确的关心行为。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_情绪识别',
    dim: 'emotional',
    whoField: '情绪理解',
    name: '情绪识别',
    windowStart: 24,
    windowEnd: 48,
    description: '能识别他人复杂情绪，理解情绪原因',
    observeTip: '讲故事时问"你觉得他为什么哭？""他现在是什么心情？"。能否理解混合情绪如"又开心又紧张"。24-36月识别基本情绪；48月理解复杂情绪。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_冲动控制',
    dim: 'emotional',
    whoField: '自我控制',
    name: '冲动控制',
    windowStart: 24,
    windowEnd: 48,
    description: '能抑制冲动行为，三思而后行',
    observeTip: '设置等待场景如"等一下才能吃"。观察孩子能否在提醒下等待。24-36月可能立即要；48月能在帮助下等待片刻。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_延迟满足',
    dim: 'emotional',
    whoField: '自我控制',
    name: '延迟满足',
    windowStart: 36,
    windowEnd: 60,
    description: '能为更大奖励等待更长时间',
    observeTip: '经典的棉花糖实验变体：留下一个玩具说"我去拿更好玩的，等我回来"。观察孩子等待的时间。36-48月能等5分钟；60月能等更久。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_自律',
    dim: 'emotional',
    whoField: '自我管理',
    name: '自律能力',
    windowStart: 36,
    windowEnd: 60,
    description: '能自我管理，遵守规则',
    observeTip: '在无成人监督时观察孩子是否能遵守规则，如不碰危险物品、不打扰他人。36-48月在提醒下遵守；60月能自觉遵守简单规则。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_自我控制',
    dim: 'emotional',
    whoField: '情绪管理',
    name: '情绪自我控制',
    windowStart: 24,
    windowEnd: 48,
    description: '能控制情绪反应，不过度激动',
    observeTip: '观察受挫时的表现。能否不用打人的方式表达愤怒。能否在激动时停下来深呼吸。24-36月需要大人帮助平静；48月能有初步控制。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_emotional_亲社会行为',
    dim: 'emotional',
    whoField: '社会行为',
    name: '亲社会行为',
    windowStart: 24,
    windowEnd: 48,
    description: '主动帮助他人，分享玩具',
    observeTip: '观察是否主动分享食物、玩具。是否帮助做家务。是否安慰需要帮助的人。24-36月开始分享；48月应有稳定的亲社会行为。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 自理维度
   */
  {
    id: 'm_self_独立进食',
    dim: 'self_care',
    whoField: '日常生活',
    name: '独立进食',
    windowStart: 8,
    windowEnd: 15,
    description: '能自己拿食物吃，使用勺子或手抓',
    observeTip: '吃饭时观察孩子是否主动抓取食物往嘴里送。8-10月可能只会手抓；12-15月开始尝试用勺子。是否能在帮助下吃完一顿饭。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_self_自理能力',
    dim: 'self_care',
    whoField: '日常生活',
    name: '基本自理能力',
    windowStart: 18,
    windowEnd: 36,
    description: '能独立完成穿脱衣服、洗手等基本自理',
    observeTip: '观察孩子是否自己要求穿脱衣服。能否自己拉拉链、扣大扣子。18-24月会配合穿衣；36月应能独立完成大部分自理。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_self_责任感',
    dim: 'self_care',
    whoField: '责任意识',
    name: '责任感',
    windowStart: 24,
    windowEnd: 48,
    description: '对自己的行为负责，愿意承担小任务',
    observeTip: '分配简单任务如"把玩具收好"。观察是否完成任务。是否主动承认错误而非推卸。24-36月有初步责任感；48月能主动承担任务。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_self_独立探索',
    dim: 'self_care',
    whoField: '独立性',
    name: '独立探索',
    windowStart: 12,
    windowEnd: 24,
    description: '能独立在新环境中探索，不过度依赖照顾者',
    observeTip: '在安全的环境中观察孩子是否愿意离开成人去探索。12-18月需要成人靠近；24月能在同一房间独立玩耍。是否主动探索新玩具。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_self_穿衣',
    dim: 'self_care',
    whoField: '日常生活',
    name: '独立穿衣',
    windowStart: 24,
    windowEnd: 48,
    description: '能独立穿脱简单衣物',
    observeTip: '观察孩子穿脱衣服时的表现。能否自己穿脱袜子、鞋子。能否自己套上简单外套。24-30月开始配合；48月应能独立穿衣。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_self_刷牙',
    dim: 'self_care',
    whoField: '日常生活',
    name: '独立刷牙',
    windowStart: 24,
    windowEnd: 36,
    description: '能自己刷牙，养成口腔卫生习惯',
    observeTip: '给孩子牙刷观察他如何刷牙。是否能把牙刷放入口中。24-30月可能只会咬牙刷；36月能在帮助下完成刷牙。应建立早晚刷牙习惯。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 社会维度
   */
  {
    id: 'm_social_同伴意识',
    dim: 'social',
    whoField: '社会交往',
    name: '同伴意识',
    windowStart: 18,
    windowEnd: 30,
    description: '开始关注其他孩子，表现出社交兴趣',
    observeTip: '在游乐场或幼儿园观察孩子。是否看其他孩子在做什么。是否主动靠近或模仿。18-24月开始关注同伴；30月有明确社交兴趣。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_social_社会礼仪',
    dim: 'social',
    whoField: '社会交往',
    name: '基本社会礼仪',
    windowStart: 24,
    windowEnd: 48,
    description: '掌握问好、再见、谢谢等基本礼貌',
    observeTip: '观察孩子是否主动问好。能否说"谢谢"、"对不起"。24-36月在提醒下使用；48月应能主动使用礼貌用语。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_social_合作',
    dim: 'social',
    whoField: '社会交往',
    name: '合作游戏',
    windowStart: 30,
    windowEnd: 60,
    description: '能参与合作游戏，与同伴一起完成任务',
    observeTip: '观察过家家、搭积木等游戏。是否与同伴配合。能否轮流。30-36月各自玩但会看对方；48月能有真正合作。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_social_轮流',
    dim: 'social',
    whoField: '社会交往',
    name: '轮流等待',
    windowStart: 24,
    windowEnd: 48,
    description: '理解轮流概念，能在游戏中等待',
    observeTip: '玩接龙游戏或轮流骑小车时观察。能否在等待时控制行为。24-30月需要提醒；48月能理解并接受轮流。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_social_责任',
    dim: 'social',
    whoField: '社会责任',
    name: '社会责任意识',
    windowStart: 30,
    windowEnd: 60,
    description: '理解社会责任，愿意为群体做贡献',
    observeTip: '分配小组任务如"帮老师收玩具"。观察孩子是否配合。是否关心集体荣誉。30-48月开始有集体意识；60月能主动承担责任。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_social_同伴关系',
    dim: 'social',
    whoField: '社会交往',
    name: '同伴关系发展',
    windowStart: 36,
    windowEnd: 60,
    description: '发展友谊，与特定同伴建立友好关系',
    observeTip: '问孩子"你在幼儿园的好朋友是谁？"。能否说出2-3个好朋友的名字。是否主动邀请同伴玩。36-48月有固定玩伴；60月有深厚友谊。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_social_文化认同',
    dim: 'social',
    whoField: '社会认知',
    name: '文化认同',
    windowStart: 48,
    windowEnd: 72,
    description: '认同自身文化，理解不同文化的差异',
    observeTip: '介绍传统节日时观察反应。能否说出自己是哪个国家的人。是否对其他文化表现兴趣。48-60月开始有文化意识。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_social_规则意识',
    dim: 'social',
    whoField: '规则理解',
    name: '规则意识',
    windowStart: 36,
    windowEnd: 60,
    description: '理解并遵守游戏规则和社会规则',
    observeTip: '玩棋类游戏时观察。能否理解复杂规则并遵守。36-48月理解简单规则；60月能遵守并维护规则。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 数学维度
   */
  {
    id: 'm_math_数概念',
    dim: 'math',
    whoField: '数学认知',
    name: '数概念',
    windowStart: 24,
    windowEnd: 48,
    description: '理解数量的基本概念，知道"多少"的含义',
    observeTip: '两堆物体问"哪边多？"。能否理解"给我一个"、"给我很多"的区别。24-36月有初步数量感知；48月理解数量含义。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_计数',
    dim: 'math',
    whoField: '数学认知',
    name: '计数能力',
    windowStart: 24,
    windowEnd: 48,
    description: '能按顺序数数，理解数到最后代表总量',
    observeTip: '能否数物品说"1、2、3..."。数完后问"一共有几个？"能否理解数到最后是总数。24-30月可能只是背数；48月理解计数含义。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_数量对应',
    dim: 'math',
    whoField: '数学认知',
    name: '数量对应',
    windowStart: 30,
    windowEnd: 60,
    description: '能将数字与实物数量对应',
    observeTip: '展示数字3，问"这是几？"。能否拿出3个物品。30-36月对应1-5；60月对应1-10甚至更多。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_数符号',
    dim: 'math',
    whoField: '数学认知',
    name: '数符号认知',
    windowStart: 48,
    windowEnd: 72,
    description: '认识数字符号，能写数字',
    observeTip: '展示数字问"这是几？"。能否在纸上写数字1-10。能否把数字和数量配对。48-60月认识数字1-10；72月能写数字。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_十进制',
    dim: 'math',
    whoField: '数学认知',
    name: '十进制概念',
    windowStart: 48,
    windowEnd: 72,
    description: '理解十进制的原理，知道10个一捆',
    observeTip: '用小棒演示10个一捆。问"10个一是多少？"。能否按群计数。48-60月开始理解；72月熟练掌握十进制。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_加法',
    dim: 'math',
    whoField: '数学认知',
    name: '加法概念',
    windowStart: 48,
    windowEnd: 72,
    description: '理解"合在一起"的加法概念',
    observeTip: '"我有2个苹果，妈妈又给了1个，现在有几个？"能否说出3。48-60月理解合并概念；72月能做简单加法。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_运算',
    dim: 'math',
    whoField: '数学认知',
    name: '运算能力',
    windowStart: 48,
    windowEnd: 72,
    description: '能进行简单加减运算',
    observeTip: '能否做5以内的加减法。用实物操作帮助理解。48-60月萌芽；72月能做10以内加减法。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_分组',
    dim: 'math',
    whoField: '数学认知',
    name: '分组概念',
    windowStart: 48,
    windowEnd: 72,
    description: '能按数进行分组，理解分组含义',
    observeTip: '"把6个苹果分给3个小朋友，每个几个？"能否正确分组。48-60月开始理解分组；72月熟练分组。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_位值',
    dim: 'math',
    whoField: '数学认知',
    name: '位值概念',
    windowStart: 60,
    windowEnd: 72,
    description: '理解个位、十位的含义',
    observeTip: '问"12里面的1表示什么？"。能否区分个位和十位。60-72月理解位值概念。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_math_零的概念',
    dim: 'math',
    whoField: '数学认知',
    name: '零的概念',
    windowStart: 48,
    windowEnd: 60,
    description: '理解"没有"可以用0表示',
    observeTip: '"盒子里没有饼干了，用什么数字表示？"。能否理解0表示空无一物。48-60月理解零的概念。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 日常生活维度
   */
  {
    id: 'm_practical_自我服务',
    dim: 'practical',
    whoField: '日常生活',
    name: '自我服务技能',
    windowStart: 24,
    windowEnd: 48,
    description: '掌握穿衣、吃饭、整理等自我服务技能',
    observeTip: '观察日常生活中的自我服务。24-36月开始学习；48月应熟练掌握基本生活技能。能否整理自己物品。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_practical_家务参与',
    dim: 'practical',
    whoField: '日常生活',
    name: '家务参与',
    windowStart: 24,
    windowEnd: 60,
    description: '愿意参与简单家务活动',
    observeTip: '分配擦桌子、收衣服等任务。观察孩子是否配合。24-36月可能只参与感兴趣的家务；60月应有稳定参与意愿。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_practical_优雅动作',
    dim: 'practical',
    whoField: '优雅与礼仪',
    name: '动作优雅',
    windowStart: 24,
    windowEnd: 48,
    description: '动作优雅、举止得体',
    observeTip: '观察走路、拿东西时的动作。能否不发出大声响。能否轻轻关门。24-36月开始学习；48月动作更优雅。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_practical_美感',
    dim: 'practical',
    whoField: '美感培养',
    name: '美感发展',
    windowStart: 36,
    windowEnd: 60,
    description: '对美有感受，能欣赏和创造美',
    observeTip: '观察孩子对艺术活动的兴趣。能否用颜料、黏土创作。36-48月开始有美感意识；60月有稳定审美偏好。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 感官维度
   */
  {
    id: 'm_senso_颜色辨别',
    dim: 'sensory',
    whoField: '感官发展',
    name: '颜色辨别',
    windowStart: 24,
    windowEnd: 48,
    description: '能区分和命名不同颜色',
    observeTip: '展示红、黄、蓝、绿等颜色问"这是什么颜色？"。24-30月认识红色；36-48月认识更多颜色。能按颜色分类。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_senso_形状辨别',
    dim: 'sensory',
    whoField: '感官发展',
    name: '形状辨别',
    windowStart: 24,
    windowEnd: 48,
    description: '能区分和命名不同形状',
    observeTip: '展示圆形、方形、三角形问"这是什么形状？"。24-36月认识基本形状；48月能区分更多形状。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_senso_触觉',
    dim: 'sensory',
    whoField: '感官发展',
    name: '触觉发展',
    windowStart: 0,
    windowEnd: 72,
    description: '触觉感知发展，能通过触摸区分物体',
    observeTip: '蒙眼摸物问"这是什么？"。能否通过触摸区分粗糙/光滑、软/硬。0-12月触觉快速发展；可持续发展。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_senso_视觉辨别',
    dim: 'sensory',
    whoField: '感官发展',
    name: '视觉辨别',
    windowStart: 24,
    windowEnd: 48,
    description: '能发现细微视觉差异',
    observeTip: '玩找不同游戏。展示相似图案找出差异。24-36月找大差异；48月找小差异。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  {
    id: 'm_senso_色彩',
    dim: 'sensory',
    whoField: '感官发展',
    name: '色彩感知',
    windowStart: 24,
    windowEnd: 48,
    description: '对色彩敏感，有色彩偏好',
    observeTip: '观察孩子对色彩的选择。是否偏好某种颜色。能否混色创作。24-36月有色彩偏好；48月能进行色彩搭配。',
    status: 'pending',
    achievedDate: null,
    achievedAgeMonths: null,
    note: ''
  },

  /**
   * 认知维度 - 补充缺失
   */
  {
    id: 'm_cog_世界概念',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '世界概念',
    windowStart: 48,
    windowEnd: 72,
    description: '对世界的基本认知，理解自然与社会的基本规律',
    observeTip: '问"为什么会下雨？""动物为什么需要吃东西？"观察孩子能否用自己的话解释自然现象。能回答2-3个简单的"为什么"为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_因果理解',
    dim: 'cognitive',
    whoField: '逻辑思维',
    name: '因果理解',
    windowStart: 6,
    windowEnd: 18,
    description: '理解动作与结果的因果联系',
    observeTip: '观察孩子是否理解"按按钮→发出声音"、"推倒→倒塌"这类因果关系。重复触发同一因果关系时，孩子能否预期结果？',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_宇宙概念',
    dim: 'cognitive',
    whoField: '科学认知',
    name: '宇宙概念',
    windowStart: 48,
    windowEnd: 72,
    description: '对地球、太阳、星星等宇宙概念有初步认知',
    observeTip: '问"地球是什么形状的？""太阳为什么会下山？"能说出地球是圆的、太阳是恒星等基本概念为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_感官配对',
    dim: 'cognitive',
    whoField: '感官认知',
    name: '感官配对',
    windowStart: 12,
    windowEnd: 24,
    description: '能将感官体验与对应事物配对，如声音配动物',
    observeTip: '播放动物叫声或环境音，问"这是什么声音？"。或展示气味让孩子说出来源。12-18月识别2-3种；24月识别更多。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_数量精确',
    dim: 'cognitive',
    whoField: '数学认知',
    name: '精确数量感知',
    windowStart: 36,
    windowEnd: 60,
    description: '能精确感知并比较5以上的数量',
    observeTip: '展示6个和8个物品，问"哪边多？多几个？"。能数出准确数量并说出差值为达标。36-48月比较5以内；60月比较10以内。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_时间概念',
    dim: 'cognitive',
    whoField: '时间认知',
    name: '时间概念',
    windowStart: 24,
    windowEnd: 48,
    description: '理解早上/下午/晚上等时间词汇',
    observeTip: '问"现在是早上还是晚上？""吃完午饭是什么时候？"能正确使用早中晚等时间词为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_比较',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '比较概念',
    windowStart: 18,
    windowEnd: 36,
    description: '能比较两个物体的大小、多少、长短等',
    observeTip: '展示两个明显不同大小的物品问"哪个大？哪个小？"。能正确回答为达标。18-24月比较大小；36月能比较多个维度。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_相对概念',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '相对概念',
    windowStart: 24,
    windowEnd: 48,
    description: '理解高/矮、多/少、快/慢等相对性概念',
    observeTip: '问"爸爸和宝宝谁更高？""哪个跑得更快？"能理解相对比较而非绝对量为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_科学探索',
    dim: 'cognitive',
    whoField: '科学认知',
    name: '科学探索精神',
    windowStart: 36,
    windowEnd: 72,
    description: '主动探索自然规律，有实验和验证的意识',
    observeTip: '给孩子简单实验材料（水、沙、磁铁等），观察是否主动探索规律。能否提出"如果我这样做会怎样？"的探索性问题。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_秩序感',
    dim: 'cognitive',
    whoField: '认知发展',
    name: '秩序感',
    windowStart: 6,
    windowEnd: 24,
    description: '对事物的规律性和固定顺序有强烈感知',
    observeTip: '观察孩子是否对程序变化敏感，如换了路线回家是否不安。是否坚持固定的睡前顺序。对顺序有明显预期行为为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_空间感知',
    dim: 'cognitive',
    whoField: '空间认知',
    name: '空间感知',
    windowStart: 6,
    windowEnd: 24,
    description: '感知物体在空间中的位置关系',
    observeTip: '观察孩子是否能找到藏在固定地点的玩具。是否理解"在桌子下面"等简单空间关系。能找到藏好的玩具为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_空间概念',
    dim: 'cognitive',
    whoField: '空间认知',
    name: '空间概念',
    windowStart: 24,
    windowEnd: 48,
    description: '理解上下左右前后等空间方位词',
    observeTip: '给出方位指令如"把球放在盒子里面"、"站在椅子后面"。能按多个方位词正确行动为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_空间管理',
    dim: 'cognitive',
    whoField: '空间认知',
    name: '空间管理',
    windowStart: 48,
    windowEnd: 72,
    description: '能有意识地整理和管理自己的空间',
    observeTip: '让孩子整理自己的书包或玩具架。观察是否有分类整理的意识，是否知道每样东西该放哪里。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_自控',
    dim: 'cognitive',
    whoField: '执行功能',
    name: '认知自控',
    windowStart: 24,
    windowEnd: 60,
    description: '能控制自己的注意力和行为以实现目标',
    observeTip: '观察孩子是否能在干扰下坚持完成任务。是否能切换注意力。能否在被打断后回到原来的任务。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_cog_问题解决',
    dim: 'cognitive',
    whoField: '认知理解',
    name: '问题解决',
    windowStart: 36,
    windowEnd: 72,
    description: '面对障碍时能想出解决方法',
    observeTip: '创造一个小障碍（如玩具被放在够不到的地方）。观察孩子是否主动想办法解决，能否尝试多种方法。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 情绪维度 - 短前缀（m_emo_）补充
   */
  {
    id: 'm_emo_专注力',
    dim: 'emotional_social',
    whoField: '自我管理',
    name: '专注力（情绪）',
    windowStart: 24,
    windowEnd: 60,
    description: '能排除情绪干扰，保持注意力集中',
    observeTip: '在孩子玩游戏时轻微打扰，观察能否保持专注继续活动。能在情绪波动后回到任务为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_元认知',
    dim: 'emotional_social',
    whoField: '自我认知',
    name: '元认知萌芽',
    windowStart: 48,
    windowEnd: 72,
    description: '开始意识到自己的思维过程',
    observeTip: '问"你怎么知道这个答案的？""你为什么这么想？"能说出自己的思考过程为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_共情',
    dim: 'emotional_social',
    whoField: '社会情绪',
    name: '共情',
    windowStart: 18,
    windowEnd: 36,
    description: '能感受他人情绪，表现出关心行为',
    observeTip: '当他人哭泣或不开心时，观察孩子是否表现出关心。是否会安慰、分享或寻求帮助。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_冲动控制',
    dim: 'emotional_social',
    whoField: '自我控制',
    name: '冲动控制',
    windowStart: 24,
    windowEnd: 48,
    description: '能在冲动前停下来思考',
    observeTip: '设置等待场景。观察孩子看到想要的东西时是否能等待，而非立即抓取。能等待30秒以上为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_延迟满足',
    dim: 'emotional_social',
    whoField: '自我控制',
    name: '延迟满足',
    windowStart: 36,
    windowEnd: 60,
    description: '为更大奖励愿意等待',
    observeTip: '用"等我回来给你两个"的方式测试。能等待5分钟以上为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_情绪表达',
    dim: 'emotional_social',
    whoField: '情绪表达',
    name: '情绪表达',
    windowStart: 18,
    windowEnd: 48,
    description: '能用语言或适当方式表达情绪',
    observeTip: '观察孩子情绪波动时是否会用语言表达，如"我很生气"、"我不开心"。能替代哭闹用言语表达为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_情绪识别',
    dim: 'emotional_social',
    whoField: '情绪理解',
    name: '情绪识别',
    windowStart: 24,
    windowEnd: 48,
    description: '能识别他人的情绪状态',
    observeTip: '看情绪图片或故事时，问"他现在是什么心情？"能准确说出高兴、难过、生气、害怕为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_情绪调节',
    dim: 'emotional_social',
    whoField: '情绪管理',
    name: '情绪调节',
    windowStart: 24,
    windowEnd: 48,
    description: '能自我调节情绪反应',
    observeTip: '观察孩子在挫折或冲突后恢复平静的时间和方式。能在5分钟内平静为佳。是否有自我安抚策略。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_自信',
    dim: 'emotional_social',
    whoField: '自我认知',
    name: '自信心',
    windowStart: 24,
    windowEnd: 60,
    description: '对自己的能力有信心，愿意尝试新事物',
    observeTip: '观察孩子面对新任务时的态度。是否愿意尝试，是否相信自己能做到。能主动说"我来试试"为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_自律',
    dim: 'emotional_social',
    whoField: '自我管理',
    name: '自律',
    windowStart: 36,
    windowEnd: 60,
    description: '无需外部监督也能遵守规则',
    observeTip: '在无成人监督时观察孩子的行为。能否坚持完成任务，能否遵守已知规则。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_自我控制',
    dim: 'emotional_social',
    whoField: '情绪管理',
    name: '自我控制',
    windowStart: 24,
    windowEnd: 48,
    description: '能控制情绪和行为反应',
    observeTip: '在令人兴奋或沮丧的情境中，观察孩子能否适当控制反应。不过度激动、不大哭大闹为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_自我认知',
    dim: 'emotional_social',
    whoField: '自我认知',
    name: '自我认知',
    windowStart: 18,
    windowEnd: 48,
    description: '了解自己的喜好、能力和特点',
    observeTip: '问"你最喜欢做什么？""你擅长什么？"能说出自己的特点和偏好为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_emo_自我负责',
    dim: 'emotional_social',
    whoField: '责任意识',
    name: '自我负责',
    windowStart: 36,
    windowEnd: 60,
    description: '能对自己的行为负责，不推卸责任',
    observeTip: '当发生错误时观察孩子的反应。是否承认错误而非推卸，是否尝试弥补。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 情绪维度 - 补充 m_emotional_ 前缀缺失
   */
  {
    id: 'm_emotional_社会性微笑',
    dim: 'emotional_social',
    whoField: '社会情绪',
    name: '社会性微笑（情绪）',
    windowStart: 2,
    windowEnd: 6,
    description: '对熟悉人脸出现有意识的情感性微笑',
    observeTip: '在婴儿清醒安静时，靠近面对面轻声说话。观察是否出现眼睛有神、嘴角上扬的社会性微笑，而不是生理性的无意识微笑。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 语言维度 - 短前缀（m_lang_）补充
   */
  {
    id: 'm_lang_书写',
    dim: 'language',
    whoField: '书写能力',
    name: '书写能力',
    windowStart: 48,
    windowEnd: 72,
    description: '能书写字母、数字或简单汉字',
    observeTip: '观察孩子写字时的笔画顺序和字形正确率。能写出可辨认的字母和数字为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_书写准备',
    dim: 'language',
    whoField: '书写准备',
    name: '书写准备',
    windowStart: 36,
    windowEnd: 60,
    description: '握笔正确，能画出基本图形，为书写做准备',
    observeTip: '观察孩子握笔姿势，是否能画直线、圆形。能画出可辨认的图形为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_书面准备',
    dim: 'language',
    whoField: '书面语言',
    name: '书面语言准备',
    windowStart: 48,
    windowEnd: 72,
    description: '有初步的书面语言意识，知道文字的功能',
    observeTip: '问"书上的字是什么意思？"观察孩子是否理解文字代表语言。能假装读书，知道从左到右为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_书面表达',
    dim: 'language',
    whoField: '书面表达',
    name: '书面表达',
    windowStart: 60,
    windowEnd: 72,
    description: '能用简单文字表达想法',
    observeTip: '观察孩子是否能写出简单的话或句子表达意思。能写出3字以上有意义的文字组合为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_分类',
    dim: 'language',
    whoField: '语言认知',
    name: '语言分类',
    windowStart: 24,
    windowEnd: 48,
    description: '能按语义类别将词语分类',
    observeTip: '说出几个词，问孩子"哪些是动物？哪些是食物？"能按语义类别分类为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_叙事',
    dim: 'language',
    whoField: '语言表达',
    name: '叙事表达',
    windowStart: 36,
    windowEnd: 60,
    description: '能有条理地讲述事件或故事',
    observeTip: '问"今天去哪里了？发生了什么？"能按时间顺序说出开始、经过、结果为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_口语表达',
    dim: 'language',
    whoField: '语言表达',
    name: '口语表达',
    windowStart: 24,
    windowEnd: 60,
    description: '能流畅地用口语表达想法和感受',
    observeTip: '观察日常对话的流畅度。是否能说完整句子，是否有明显口吃或卡顿。语言流畅自然为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_句子长度',
    dim: 'language',
    whoField: '语言表达',
    name: '句子长度增长',
    windowStart: 36,
    windowEnd: 60,
    description: '句子长度持续增加，语法更完整',
    observeTip: '记录孩子说的最长句子。36月约5-6字；48月约8-10字；60月能说15字以上的复杂句。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_命名',
    dim: 'language',
    whoField: '语言表达',
    name: '命名能力',
    windowStart: 12,
    windowEnd: 36,
    description: '能给物品、人、动作命名',
    observeTip: '展示各类物品或图片，问"这叫什么？"记录能正确命名的数量。24月约100词；36月约300词以上。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_字母认知',
    dim: 'language',
    whoField: '语言认知',
    name: '字母认知',
    windowStart: 48,
    windowEnd: 72,
    description: '认识并区分字母',
    observeTip: '展示字母卡片问名称和发音。能识别并说出20个以上字母为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_想象力',
    dim: 'language',
    whoField: '创造性语言',
    name: '语言想象力',
    windowStart: 36,
    windowEnd: 60,
    description: '能用语言描述想象中的事物和故事',
    observeTip: '问"你来编一个故事"或"想象你有魔法能做什么"。能持续创作内容超过1分钟为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_批判思维',
    dim: 'language',
    whoField: '高阶思维',
    name: '批判性思维',
    windowStart: 48,
    windowEnd: 72,
    description: '能质疑和评价信息，不盲目接受',
    observeTip: '讲一个明显不对的说法，看孩子是否提出质疑。能说"我不同意，因为..."为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_拼写',
    dim: 'language',
    whoField: '书面语言',
    name: '拼写能力',
    windowStart: 60,
    windowEnd: 72,
    description: '能拼写简单词汇',
    observeTip: '让孩子拼写熟悉的词汇。能拼出常用词的基本构成为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_拼读',
    dim: 'language',
    whoField: '语音意识',
    name: '拼读能力',
    windowStart: 48,
    windowEnd: 72,
    description: '能将音节拼合成词',
    observeTip: '缓慢分音节说"m-a"，问孩子听到什么词。能合成音节读出词为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_握笔',
    dim: 'language',
    whoField: '书写准备',
    name: '握笔姿势',
    windowStart: 36,
    windowEnd: 60,
    description: '掌握正确的握笔姿势',
    observeTip: '观察孩子握笔时的手指位置。拇指和食指捏住笔杆，中指托住为正确姿势。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_数字认知',
    dim: 'language',
    whoField: '语言与数学',
    name: '数字语言',
    windowStart: 36,
    windowEnd: 60,
    description: '能用语言表达数量和数字概念',
    observeTip: '问"你几岁了？""桌子上有几个苹果？"能正确说出数字并理解意义为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_理解',
    dim: 'language',
    whoField: '语言理解',
    name: '语言理解',
    windowStart: 12,
    windowEnd: 36,
    description: '能理解日常对话和简单指令',
    observeTip: '给出日常指令如"把鞋放好，然后去洗手"。能否按顺序完成多步指令为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_理解复杂句',
    dim: 'language',
    whoField: '语言理解',
    name: '理解复杂句',
    windowStart: 48,
    windowEnd: 72,
    description: '能理解包含关系从句的复杂句子',
    observeTip: '说复杂指令如"如果今天下雨，我们就不去公园，而是在家画画"。能理解并按指令行动为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_理解简单句子',
    dim: 'language',
    whoField: '语言理解',
    name: '理解简单句子',
    windowStart: 18,
    windowEnd: 30,
    description: '能理解完整的简单句子',
    observeTip: '说简单完整的句子如"把红色的球放在盒子里"。能按完整句子内容行动为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_表达',
    dim: 'language',
    whoField: '语言表达',
    name: '语言表达',
    windowStart: 18,
    windowEnd: 48,
    description: '能用语言清晰表达需求和想法',
    observeTip: '观察孩子在日常中是否主动用语言表达需求，而非哭闹或手势。能用完整句子表达为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_识字',
    dim: 'language',
    whoField: '阅读认字',
    name: '识字能力',
    windowStart: 48,
    windowEnd: 72,
    description: '能识别常见汉字或字母',
    observeTip: '展示常见字卡，问"这个字念什么？"能认出10个以上常见字为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_词汇',
    dim: 'language',
    whoField: '语言表达',
    name: '词汇量',
    windowStart: 12,
    windowEnd: 48,
    description: '词汇量持续增加',
    observeTip: '统计孩子能使用的词汇量。12月约10词；24月约200词；36月约1000词；48月约2000词。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_词汇爆发',
    dim: 'language',
    whoField: '语言表达',
    name: '词汇爆发期',
    windowStart: 18,
    windowEnd: 30,
    description: '词汇量快速增长，每天学会新词',
    observeTip: '记录孩子每周新学的词汇。词汇爆发期每周可学5-10个新词，显著加速学习。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_词汇积累',
    dim: 'language',
    whoField: '语言表达',
    name: '词汇积累',
    windowStart: 24,
    windowEnd: 60,
    description: '持续积累词汇，能用丰富词汇描述',
    observeTip: '在孩子描述时观察词汇的丰富程度。能用多个不同词描述同一事物为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_语言兴趣',
    dim: 'language',
    whoField: '语言发展',
    name: '语言兴趣',
    windowStart: 0,
    windowEnd: 36,
    description: '对语言和故事有浓厚兴趣',
    observeTip: '观察孩子是否主动要求读书、听故事。是否喜欢听新词并模仿。对语言游戏（押韵、歌谣）感兴趣为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_语言理解',
    dim: 'language',
    whoField: '语言理解',
    name: '语言理解能力',
    windowStart: 12,
    windowEnd: 48,
    description: '能理解日常对话、故事和指令',
    observeTip: '读短故事后问问题，观察孩子能否回答关于内容的问题。能回答"谁""做了什么"为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_语音意识',
    dim: 'language',
    whoField: '语音认知',
    name: '语音意识',
    windowStart: 36,
    windowEnd: 60,
    description: '能感知语音单位，有押韵和音节意识',
    observeTip: '唱儿歌时观察孩子是否感受押韵。说一个词让孩子说出押韵词，如"猫、包、刀"。有押韵意识为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_辅音发音',
    dim: 'language',
    whoField: '语音发展',
    name: '辅音发音',
    windowStart: 6,
    windowEnd: 24,
    description: '能发出辅音，语音逐渐清晰',
    observeTip: '倾听孩子的发音清晰度。6-12月出现b、p、m等音；18-24月辅音种类增多。与同龄儿发音相比是否清晰。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_阅读',
    dim: 'language',
    whoField: '阅读能力',
    name: '阅读能力',
    windowStart: 60,
    windowEnd: 72,
    description: '能独立阅读简单文字材料',
    observeTip: '给孩子简单绘本，观察是否能独立阅读文字。能读完一个短句且理解意思为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_阅读准备',
    dim: 'language',
    whoField: '阅读准备',
    name: '阅读准备',
    windowStart: 36,
    windowEnd: 60,
    description: '有阅读兴趣，具备阅读所需的基础技能',
    observeTip: '观察孩子翻书时是否从左到右、从上到下。是否能指着字一个个说出来。有阅读意识为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_lang_阅读理解',
    dim: 'language',
    whoField: '阅读理解',
    name: '阅读理解',
    windowStart: 48,
    windowEnd: 72,
    description: '能理解所读内容，提取信息',
    observeTip: '读完一段文字后问问题。能回答"主要说了什么""为什么会这样"等问题为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 数学维度 - 补充缺失
   */
  {
    id: 'm_math_一一对应',
    dim: 'math',
    whoField: '数学认知',
    name: '一一对应',
    windowStart: 30,
    windowEnd: 48,
    description: '理解一个数字对应一个实物的概念',
    observeTip: '让孩子将数量与数字卡对应。能将3个物体与数字"3"准确配对为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_乘法',
    dim: 'math',
    whoField: '数学认知',
    name: '乘法概念',
    windowStart: 60,
    windowEnd: 72,
    description: '理解乘法是重复加法的概念',
    observeTip: '"3个孩子每人有2个苹果，一共几个苹果？"能用加法或直接说出6为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_减法',
    dim: 'math',
    whoField: '数学认知',
    name: '减法概念',
    windowStart: 48,
    windowEnd: 72,
    description: '理解"拿走"的减法概念',
    observeTip: '"有5个苹果，吃了2个，还剩几个？"能用实物操作或口算说出3为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_分数',
    dim: 'math',
    whoField: '数学认知',
    name: '分数概念',
    windowStart: 60,
    windowEnd: 72,
    description: '理解"一半"和简单分数的概念',
    observeTip: '"把这个苹果分成一半，每份是多少？"能正确分成等份并理解"一半"含义为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_应用题',
    dim: 'math',
    whoField: '数学认知',
    name: '数学应用',
    windowStart: 60,
    windowEnd: 72,
    description: '能将数学运用于解决实际问题',
    observeTip: '在购物或分配时观察孩子是否自发运用数学。能自发计算找钱、分配等生活问题为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_心算',
    dim: 'math',
    whoField: '数学认知',
    name: '心算能力',
    windowStart: 60,
    windowEnd: 72,
    description: '不借助实物，在头脑中进行计算',
    observeTip: '"2加3等于几？"不用手指也能回答为达标。能做5以内心算为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_数概念应用',
    dim: 'math',
    whoField: '数学认知',
    name: '数概念应用',
    windowStart: 48,
    windowEnd: 72,
    description: '在实际情境中正确运用数字和数量',
    observeTip: '观察日常中孩子是否自发使用数量概念，如"我要两个"、"还剩三块"。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_数量感',
    dim: 'math',
    whoField: '数学认知',
    name: '数量感',
    windowStart: 18,
    windowEnd: 48,
    description: '不数数也能直觉感知小数量',
    observeTip: '快速展示1-4个点，不让孩子数，问"有几个？"能直觉说出1-4的数量为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_整体与部分',
    dim: 'math',
    whoField: '数学认知',
    name: '整体与部分',
    windowStart: 48,
    windowEnd: 72,
    description: '理解整体可以分成若干部分，部分合成整体',
    observeTip: '"5可以分成2和几？"能回答不同分法为达标。用积木展示组合与分解概念。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_时钟',
    dim: 'math',
    whoField: '时间认知',
    name: '认识时钟',
    windowStart: 48,
    windowEnd: 72,
    description: '能认读简单的整点时间',
    observeTip: '指着钟面问"现在几点了？"能认出整点（如3点、6点）为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_时间概念',
    dim: 'math',
    whoField: '时间认知',
    name: '数学时间概念',
    windowStart: 36,
    windowEnd: 60,
    description: '理解时间的数学性质，如分钟、小时',
    observeTip: '问"1分钟有多长？""一天有多少小时？"能说出60分钟等基本时间单位为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_测量',
    dim: 'math',
    whoField: '数学认知',
    name: '测量概念',
    windowStart: 48,
    windowEnd: 72,
    description: '能用非标准或标准单位测量',
    observeTip: '让孩子用积木或尺子测量桌子长度。能说出"这张桌子有8块积木长"为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_货币',
    dim: 'math',
    whoField: '实际数学',
    name: '货币概念',
    windowStart: 48,
    windowEnd: 72,
    description: '认识货币，理解买卖的基本概念',
    observeTip: '玩过家家购物游戏，观察孩子是否理解付钱和找零的概念。能算出简单找零为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_math_逻辑推理',
    dim: 'math',
    whoField: '逻辑思维',
    name: '逻辑推理',
    windowStart: 48,
    windowEnd: 72,
    description: '能进行简单的逻辑推理',
    observeTip: '给出排列规律题（如红蓝红蓝，下一个是什么？）。能发现规律并延续为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 运动维度 - 补充缺失
   */
  {
    id: 'm_motor_主动伸手',
    dim: 'motor',
    whoField: '精细动作',
    name: '主动伸手抓取',
    windowStart: 3,
    windowEnd: 6,
    description: '主动伸手去够取感兴趣的物体',
    observeTip: '在婴儿面前约30cm处悬挂玩具，观察是否主动伸手。3-4月可能只挥手；5-6月能准确伸手够取。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_motor_协调性',
    dim: 'motor',
    whoField: '动作协调',
    name: '动作协调性',
    windowStart: 12,
    windowEnd: 36,
    description: '全身动作协调流畅',
    observeTip: '观察跑动、爬楼梯时的协调程度。能流畅完成复合动作（如边跑边踢球）为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_motor_双手配合',
    dim: 'motor',
    whoField: '精细动作',
    name: '双手配合',
    windowStart: 6,
    windowEnd: 18,
    description: '两手能协调配合完成任务',
    observeTip: '观察孩子用一手固定、一手操作的活动，如打开瓶盖、撕纸。两手有意识地分工协作为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_motor_粗大动作',
    dim: 'motor',
    whoField: '粗大动作',
    name: '粗大动作发展',
    windowStart: 0,
    windowEnd: 36,
    description: '大肌肉运动能力持续发展',
    observeTip: '综合评估翻身、坐立、爬行、走路、跑步的发展情况。与同月龄标准比较，是否在正常范围内发展。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_motor_节奏感',
    dim: 'motor',
    whoField: '音乐动作',
    name: '节奏感',
    windowStart: 12,
    windowEnd: 36,
    description: '能感受并跟随音乐节奏运动',
    observeTip: '播放有明显节拍的音乐，观察孩子是否随音乐律动。能基本跟上拍子拍手或舞动为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 日常生活维度 - 补充缺失
   */
  {
    id: 'm_practical_准备上学',
    dim: 'practical',
    whoField: '生活准备',
    name: '入学准备',
    windowStart: 60,
    windowEnd: 72,
    description: '具备入学所需的基本生活自理和社交技能',
    observeTip: '检查孩子是否能独立如厕、整理书包、遵守规则、与同伴交往。多项基本技能达标为入学准备好。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_practical_时间管理',
    dim: 'practical',
    whoField: '自我管理',
    name: '时间管理',
    windowStart: 48,
    windowEnd: 72,
    description: '有初步的时间意识，能按时间安排行动',
    observeTip: '设置定时提醒，观察孩子是否能按时完成任务。能在提醒下准时完成为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_practical_独立',
    dim: 'practical',
    whoField: '独立性',
    name: '生活独立',
    windowStart: 24,
    windowEnd: 60,
    description: '能独立完成日常生活活动',
    observeTip: '观察孩子是否主动完成自己能做的事，不过度依赖成人帮助。能说"我自己来"并完成为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_practical_生活技能',
    dim: 'practical',
    whoField: '日常生活',
    name: '生活技能',
    windowStart: 18,
    windowEnd: 60,
    description: '掌握日常生活所需的基本技能',
    observeTip: '综合评估穿脱衣、洗漱、吃饭、整理等生活技能。与同龄儿相比是否具备基本自理能力。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_practical_穿衣',
    dim: 'practical',
    whoField: '日常生活',
    name: '穿衣自理',
    windowStart: 24,
    windowEnd: 48,
    description: '能独立穿脱衣物',
    observeTip: '观察孩子穿脱衣服的独立程度。24-36月能穿宽松衣服；48月能独立穿大部分衣物。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_practical_责任',
    dim: 'practical',
    whoField: '责任意识',
    name: '生活责任',
    windowStart: 30,
    windowEnd: 60,
    description: '能承担日常生活责任，如整理玩具',
    observeTip: '分配日常小任务（整理玩具、浇花），观察是否持续执行。能稳定完成分配的日常任务为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 自理维度 - 补充缺失
   */
  {
    id: 'm_self_卫生',
    dim: 'self_care',
    whoField: '日常生活',
    name: '个人卫生',
    windowStart: 18,
    windowEnd: 48,
    description: '能保持基本个人卫生习惯',
    observeTip: '观察孩子是否主动洗手、擦鼻涕、保持整洁。能在提醒下养成卫生习惯为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_self_独立',
    dim: 'self_care',
    whoField: '独立性',
    name: '自我独立',
    windowStart: 18,
    windowEnd: 48,
    description: '在日常活动中表现出独立意愿',
    observeTip: '观察孩子是否经常说"我来"、"我自己做"。主动要求自己完成力所能及的事为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_self_生活规划',
    dim: 'self_care',
    whoField: '自我管理',
    name: '生活规划',
    windowStart: 48,
    windowEnd: 72,
    description: '能规划和安排自己的日常活动',
    observeTip: '问"今天你想做什么？先做什么再做什么？"能说出有顺序的计划为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_self_自我服务',
    dim: 'self_care',
    whoField: '日常生活',
    name: '自我服务',
    windowStart: 18,
    windowEnd: 48,
    description: '能为自己提供基本服务，如倒水、取食物',
    observeTip: '创造机会让孩子自己倒水、取零食。能独立完成简单自我服务为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_self_自我管理',
    dim: 'self_care',
    whoField: '自我管理',
    name: '自我管理',
    windowStart: 36,
    windowEnd: 60,
    description: '能管理自己的物品和时间',
    observeTip: '观察孩子是否知道自己东西放在哪里，是否能管理自己的玩具和衣物。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_self_责任',
    dim: 'self_care',
    whoField: '责任意识',
    name: '自我责任',
    windowStart: 24,
    windowEnd: 48,
    description: '对自己的物品和行为负责',
    observeTip: '观察孩子是否能照顾自己的玩具，是否在弄坏东西后主动说明。有责任感表现为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_self_金钱观念',
    dim: 'self_care',
    whoField: '生活教育',
    name: '金钱观念',
    windowStart: 48,
    windowEnd: 72,
    description: '理解金钱的基本功能和价值',
    observeTip: '玩购物游戏或去真实购物时观察。能理解付钱买东西的基本概念，知道东西需要用钱买为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 感官维度 - 补充缺失
   */
  {
    id: 'm_senso_感官精致',
    dim: 'sensory',
    whoField: '感官发展',
    name: '感官精细化',
    windowStart: 36,
    windowEnd: 72,
    description: '感官辨别能力精细化，能区分细微差别',
    observeTip: '展示近似颜色或音调，问孩子能否区分差异。能区分近似色（深红/浅红）或音调高低为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_sensory_触觉辨别',
    dim: 'sensory',
    whoField: '感官发展',
    name: '触觉辨别',
    windowStart: 6,
    windowEnd: 36,
    description: '通过触摸辨别不同材质和特性',
    observeTip: '蒙眼摸不同材质，问"这是什么感觉？"能区分粗糙/光滑、硬/软、热/冷等质感为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_sensory_音乐感知',
    dim: 'sensory',
    whoField: '听觉发展',
    name: '音乐感知',
    windowStart: 6,
    windowEnd: 48,
    description: '能感知音乐节奏、旋律和音调变化',
    observeTip: '播放音乐观察孩子的反应。是否随节拍律动，是否能分辨快节奏与慢节奏，是否对旋律有情绪反应。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },

  /**
   * 社会维度 - 补充缺失
   */
  {
    id: 'm_social_亲社会行为',
    dim: 'social',
    whoField: '社会交往',
    name: '亲社会行为',
    windowStart: 24,
    windowEnd: 60,
    description: '主动帮助他人、分享、安慰等亲社会行为',
    observeTip: '观察孩子是否主动帮助他人，如帮小朋友捡东西、安慰哭泣的孩子。稳定表现亲社会行为为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_social_冲突解决',
    dim: 'social',
    whoField: '社会交往',
    name: '冲突解决',
    windowStart: 36,
    windowEnd: 60,
    description: '能用和平方式解决同伴冲突',
    observeTip: '观察与同伴发生冲突时的处理方式。是否能用协商代替争夺，是否能求助成人。不用攻击行为解决为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_social_团队',
    dim: 'social',
    whoField: '社会交往',
    name: '团队合作',
    windowStart: 36,
    windowEnd: 72,
    description: '能参与团队活动，为共同目标配合',
    observeTip: '观察团体游戏中的参与度。是否愿意配合，是否接受分工，是否为团队贡献。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_social_沟通',
    dim: 'social',
    whoField: '社会交往',
    name: '社交沟通',
    windowStart: 24,
    windowEnd: 60,
    description: '能与同伴进行有效的社交沟通',
    observeTip: '观察孩子与同伴对话。是否能开启和维持对话，是否能理解对方意思并回应。对话持续3轮以上为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_social_社会责任',
    dim: 'social',
    whoField: '社会责任',
    name: '社会责任感',
    windowStart: 48,
    windowEnd: 72,
    description: '有初步的社会责任意识',
    observeTip: '观察孩子对公共环境的态度。是否爱护公物、不随地扔垃圾、帮助他人。有意识的社会责任行为为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_social_跨文化',
    dim: 'social',
    whoField: '文化理解',
    name: '跨文化理解',
    windowStart: 48,
    windowEnd: 72,
    description: '能理解和尊重不同文化背景',
    observeTip: '介绍不同国家或民族的习俗，观察孩子的反应。能接受差异并表示尊重为达标。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  },
  {
    id: 'm_social_领导力',
    dim: 'social',
    whoField: '社会交往',
    name: '领导力萌芽',
    windowStart: 48,
    windowEnd: 72,
    description: '有组织和引领同伴的倾向',
    observeTip: '观察孩子在同伴游戏中是否自发担任组织者角色，提出游戏规则或方向。同伴愿意跟随为佳。',
    status: 'pending', achievedDate: null, achievedAgeMonths: null, note: ''
  }
];

export const MILESTONES = _RAW_MILESTONES.map(normalizeMilestone);
