/**
 * 里程碑引用验证脚本
 * 检查 activities-complete.js 中所有 linkedMilestones 是否都在 milestones.js 中存在
 * 运行：node docs/plans/temp/verify-milestones.js
 */

const fs = require('fs');
const path = require('path');

// 读取文件内容
const rootDir = path.join(__dirname, '../../..');
const milestonesPath = path.join(rootDir, 'js/data/milestones.js');
const activitiesPath = path.join(rootDir, 'js/data/activities-complete.js');

function extractMilestoneIds(content) {
  const ids = new Set();
  const regex = /id:\s*'(m_[^']+)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

function extractLinkedMilestones(content) {
  const refs = new Map(); // activityId -> Set of milestone IDs

  // 匹配活动ID
  const activityIdRegex = /id:\s*'([A-Z]-\d+-\d+[a-z]?)'/g;
  // 匹配 linkedMilestones 数组
  const linkedRegex = /linkedMilestones:\s*\[([^\]]*)\]/g;

  // 分块处理——找每个活动的 id 和 linkedMilestones
  const activityBlockRegex = /\{[^{}]*id:\s*'([A-Z]-\d+-\d+[a-z]?)'[^{}]*linkedMilestones:\s*\[([^\]]*)\][^{}]*\}/gs;

  let match;
  while ((match = activityBlockRegex.exec(content)) !== null) {
    const actId = match[1];
    const linkedStr = match[2];
    const milestoneRefs = new Set();

    const milestoneIdRegex = /'(m_[^']+)'/g;
    let mMatch;
    while ((mMatch = milestoneIdRegex.exec(linkedStr)) !== null) {
      milestoneRefs.add(mMatch[1]);
    }

    if (milestoneRefs.size > 0) {
      refs.set(actId, milestoneRefs);
    }
  }

  return refs;
}

// 备用方法：直接提取所有 linkedMilestones 中的里程碑引用
function extractAllLinkedMilestoneIds(content) {
  const ids = new Set();
  // 先找所有 linkedMilestones 数组内容
  const linkedRegex = /linkedMilestones:\s*\[([^\]]*)\]/g;
  let match;
  while ((match = linkedRegex.exec(content)) !== null) {
    const arrayContent = match[1];
    const milestoneIdRegex = /'(m_[^']+)'/g;
    let mMatch;
    while ((mMatch = milestoneIdRegex.exec(arrayContent)) !== null) {
      ids.add(mMatch[1]);
    }
  }
  return ids;
}

try {
  const milestonesContent = fs.readFileSync(milestonesPath, 'utf-8');
  const activitiesContent = fs.readFileSync(activitiesPath, 'utf-8');

  const definedIds = extractMilestoneIds(milestonesContent);
  const referencedIds = extractAllLinkedMilestoneIds(activitiesContent);

  console.log('=== 里程碑验证报告 ===\n');
  console.log(`milestones.js 中定义的里程碑数量: ${definedIds.size}`);
  console.log(`activities-complete.js 中引用的唯一里程碑 ID 数量: ${referencedIds.size}`);

  // 找出被引用但未定义的里程碑
  const missing = [];
  for (const id of referencedIds) {
    if (!definedIds.has(id)) {
      missing.push(id);
    }
  }

  // 找出已定义但从未被引用的里程碑
  const unreferenced = [];
  for (const id of definedIds) {
    if (!referencedIds.has(id)) {
      unreferenced.push(id);
    }
  }

  console.log(`\n✅ 覆盖完整的里程碑 ID: ${referencedIds.size - missing.length}`);
  console.log(`❌ 被引用但未定义的里程碑 ID: ${missing.length}`);
  console.log(`⚠️  已定义但从未被引用: ${unreferenced.length}`);

  if (missing.length > 0) {
    console.log('\n=== 缺失的里程碑 ID（需要在 milestones.js 中添加）===');
    // 按维度分组
    const byDim = {};
    missing.sort().forEach(id => {
      const parts = id.split('_');
      const dim = parts[1];
      if (!byDim[dim]) byDim[dim] = [];
      byDim[dim].push(id);
    });

    Object.keys(byDim).sort().forEach(dim => {
      console.log(`\n[${dim}] (${byDim[dim].length} 条):`);
      byDim[dim].forEach(id => console.log(`  - ${id}`));
    });
  }

  if (unreferenced.length > 0) {
    console.log('\n=== 未被活动引用的里程碑（可能是孤立的）===');
    const byDim = {};
    unreferenced.sort().forEach(id => {
      const parts = id.split('_');
      const dim = parts[1];
      if (!byDim[dim]) byDim[dim] = [];
      byDim[dim].push(id);
    });
    Object.keys(byDim).sort().forEach(dim => {
      console.log(`\n[${dim}] (${byDim[dim].length} 条):`);
      byDim[dim].forEach(id => console.log(`  - ${id}`));
    });
  }

  // 输出引用完整性统计
  console.log('\n=== 总结 ===');
  const coverageRate = ((referencedIds.size - missing.length) / referencedIds.size * 100).toFixed(1);
  console.log(`引用完整率: ${coverageRate}%`);

  if (missing.length === 0) {
    console.log('\n✅ 所有引用均有效，里程碑库完整！');
  } else {
    console.log(`\n❌ 还有 ${missing.length} 个里程碑 ID 未定义，需要补充`);
    process.exit(1);
  }

} catch (err) {
  console.error('验证脚本出错:', err.message);
  process.exit(1);
}
