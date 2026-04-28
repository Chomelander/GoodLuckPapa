# PWA NAS 数据同步配置指南

## 概述

起起成长 PWA 采用**事件驱动即时同步**机制：
- 每次用户保存观察记录、日记或标记里程碑后，立即推送到 NAS
- IndexedDB 为主存储（离线可用），NAS SQLite 为副存储（跨设备同步）
- 未配置 API 时静默跳过，不影响本地使用

---

## 配置步骤

### 1. 打开 PWA 设置

在浏览器打开 PWA（如 `http://192.168.9.3:8088`），点击底部导航"**设置**" Tab。

### 2. 找到"NAS 数据同步"区块

```
┌─────────────────────────────────┐
│  NAS 数据同步                    │
├─────────────────────────────────┤
│  API 地址                        │
│  [http://192.168.x.x:8088    ]  │
│                                  │
│  PIN 码                          │
│  [__________________________]   │
│  [连接]                          │
│                                  │
│  未配置，数据仅存本设备            │
└─────────────────────────────────┘
```

### 3. 填写 API 地址

**格式：** `http://{NAS地址}:{端口}`（不需要加 `/api` 后缀）

| 场景 | API 地址示例 |
|------|------------|
| 内网访问 | `http://192.168.9.3:8088` |
| 内网穿透 | `http://192.168.22.99:8088` |
| 外网 DDNS | `https://myqiqi.ugnas.com` |

### 4. 填写 PIN 码 → 点击"连接"

输入 `.env` 中配置的 `ACCESS_PIN`，点击"连接"。

成功后状态显示：
```
✓ 已连接 NAS，自动同步中
```

---

## 验证配置生效

### 方法 A：浏览器 DevTools Network 面板

1. 打开 F12 → Network 标签页
2. 在今日 Tab 保存一条观察记录
3. 应看到新请求：
   ```
   POST http://192.168.9.3:8088/api/records  201 Created
   ```

### 方法 B：查询 NAS 数据库（API）

```bash
# 获取 token
TOKEN=$(curl -s -X POST http://192.168.9.3:8088/api/auth/pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"your-pin"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 查询各表数据量
echo "观察记录：" && curl -s http://192.168.9.3:8088/api/records \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
echo "育儿日记：" && curl -s http://192.168.9.3:8088/api/diary \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
echo "里程碑状态：" && curl -s http://192.168.9.3:8088/api/milestones/states \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
```

---

## 同步的数据类型

| 操作 | 触发函数 | API 端点 |
|------|---------|---------|
| 保存观察记录 | `pushRecord()` | POST /api/records |
| 删除观察记录 | `deleteRecord()` | DELETE /api/records/:id |
| 保存育儿日记 | `pushDiary()` | POST /api/diary |
| 删除育儿日记 | `deleteDiary()` | DELETE /api/diary/:id |
| 标记里程碑达成 | `pushMilestoneState()` | PUT /api/milestones/states/:id |
| 保存孩子档案 | `pushProfile()` | PUT /api/profile |

---

## 同步机制说明

**事件驱动即时推送（当前实现）：**

```
用户操作 → IndexedDB 保存（同步）→ NAS API 推送（异步，< 1 秒）
```

- ✅ 实时性最好，数据即时同步
- ✅ 网络错误时静默降级，不影响用户操作
- ⚠️ 仅支持单向推送（本地 → NAS），跨设备恢复通过 `pullAll()` 手动触发（P1 功能）

---

## 故障排查

### 状态显示"未配置，数据仅存本设备"

API 地址未填写，填写后会显示 PIN 码输入框。

### PIN 码正确但连接失败

```bash
# 确认 NAS 服务在运行
curl http://192.168.9.3:8088/api/health
# 返回 {"success":true} 说明正常
```

### 连接成功但数据未同步

1. 打开 DevTools → Console，查看是否有 `[sync] Network error` 日志
2. 检查 Network 面板中 `/api/records` 请求的状态码

### 断开连接 / 切换设备

在设置页点击"**断开连接**"按钮，会清除 localStorage 中的 JWT token。

重新连接：再次填写 PIN 码 → 点击"连接"。

---

## 多设备使用

同一 PIN 码可在多台设备登录（JWT 有效期 7 天）。

**在新设备上配置：**

1. 打开 PWA → 设置 → NAS 数据同步
2. 填写相同的 API 地址和 PIN 码
3. 点击"连接"
4. 此后该设备产生的新数据会自动同步到 NAS

> 跨设备全量数据恢复（pullAll）计划在 P1 阶段实现。

---

## 安全提示

- 公共设备上使用后，点击"断开连接"清除 token
- 推荐设置复杂 PIN 码（`.env` 中的 `ACCESS_PIN`）
- 外网访问时强烈建议启用 HTTPS（见 `HTTPS-DDNS-SETUP.md`）
