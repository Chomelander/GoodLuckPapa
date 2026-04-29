# 设计文档：观察锚点填空 + 成长 Tab 活动记录时间线

**日期**：2026-04-14  
**状态**：已确认，待实现

---

## 背景

当前记录观察时，`observeAnchor` 字段以纯文字卡片显示在表单顶部，用户无法针对性地回答锚点问题。同时，历史活动记录只能在设置页查看（仅支持删除），没有时间线视图，也不支持编辑。

---

## Feature 1：观察锚点填空

### 解析逻辑

新增 `parseAnchorQuestions(str: string): string[]`：

1. 以 `？` 为分隔符切割字符串
2. 每段 `trim()` 后过滤空串
3. 末尾补回 `？`

```
'他听到你的声音有什么反应？转头？安静下来？'
→ ['他听到你的声音有什么反应？', '转头？', '安静下来？']

'他在你怀里是放松还是紧绷？'
→ ['他在你怀里是放松还是紧绷？']
```

### UI 变化（`js/ui/record.js` · `buildRecordHTML`）

| 变化点 | 说明 |
|--------|------|
| 移除顶部"观察引导"卡片 | `anchorHTML` 块不再渲染 |
| "活动发起方式"下方新增填空区 | 每个问题 → `label + input[type=text]`，用 `data-anchor-index="N"` 标识 |
| 仅当 `observeAnchor` 存在时渲染 | 无锚点活动行为不变 |
| 备注 textarea placeholder | 有锚点时改为"可在此补充其他观察…" |
| 编辑已有记录（existingRecord）时 | 填空区隐藏，直接展示已合并 note，不尝试反解析 |

### 提交合并逻辑

提交时：

1. 收集所有 `[data-anchor-index]` input 的值，过滤空值
2. 格式化为：
   ```
   他听到你的声音有什么反应？→ 转头了
   安静下来？→ 没有安静
   ---
   ```
3. 自由备注内容拼在 `---` 后（若为空则省略 `---`）
4. 合并结果写入 `record.note`（无需改动 IndexedDB schema）

---

## Feature 2：成长 Tab 活动记录时间线

### 新文件

`js/ui/growth-records.js`

### 展示结构

三级折叠，参照 `diary.js` 日记时间线：

```
年（details, open）
└── 周（details, 当前周默认展开）
    └── 记录卡片
        ├── 活动标题 + 日期
        ├── 专注时长 + 情绪 + 发起方式
        ├── note 截断预览（前 40 字）
        └── 编辑按钮 | 删除按钮（inline confirm）
```

### 操作

| 操作 | 实现 |
|------|------|
| 编辑 | 派发 `record:edit` 事件，复用现有 `showRecord` overlay（编辑模式，填空区隐藏） |
| 删除 | inline confirm（与今日页保持一致），调用 `state.db.deleteRecord(id)`，删后重渲时间线 |

### 渲染位置

`index.html` 的 `#growth-body` 内，育儿日记区块下方，新增：

```html
<div id="activity-records-section"></div>
```

### 数据来源

`state.db.getRecords()` + `state.activities`（用于 actId → title 映射）

---

## Feature 3：设置页历史记录区块移除

- 删除 `settings.js` 中的 `历史记录` section HTML（`settings-records-section`）
- 删除 `renderRecordsList` 函数及相关分页变量（`recordsOffset`、`RECORDS_PAGE_SIZE`）
- 删除 `sr-*` 事件处理逻辑（`sr-delete`、`sr-confirm`、`sr-cancel`、`sr-load-more`）
- `buildSettingsHTML` 中移除对应区块

---

## 不在此次范围内

- IndexedDB schema 变更（`DB_VERSION` 保持 2）
- 锚点答案的独立字段存储
- 成长 Tab 的编辑 overlay 中展示历史填空答案的反解析
