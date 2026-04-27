# PWA 中文 API 配置指南

## 问题

PWA 需要知道你的 NAS API 地址和 PIN 码，才能实现数据同步。

---

## 配置步骤

### 1. 打开 PWA 设置

在浏览器打开：`http://192.168.9.3`（或你的 NAS 地址）

点击底部导航栏的**设置** Tab

### 2. 找到"NAS 配置"或"API 服务"

在设置页寻找类似这样的表单：

```
┌─────────────────────────────┐
│ NAS API 配置                 │
├─────────────────────────────┤
│                              │
│ API 地址                      │
│ [_________________________]   │
│ 例：http://192.168.9.3/api   │
│                              │
│ PIN 码                        │
│ [_________________________]   │
│ 例：123456                    │
│                              │
│ [连接]  [清除配置]            │
│                              │
└─────────────────────────────┘
```

### 3. 填写 API 地址

**本地网络（推荐）：**
```
http://192.168.9.3/api
```

**或（用 NAS 主机名）：**
```
http://ugnas.local/api
```

**外网访问（需配置 DDNS）：**
```
https://myqiqi.ugnas.com/api
```

### 4. 填写 PIN 码

输入你在 `.env` 中配置的 `ACCESS_PIN`（默认 `123456`）

### 5. 点击"连接"

等待 1-2 秒，应看到提示：
```
✅ 连接成功
已连接到 http://192.168.9.3/api
```

---

## 验证配置是否生效

### 方法 A：检查浏览器开发者工具

1. 打开 PWA
2. 按 `F12` 打开开发者工具
3. 进入"Network"标签页
4. 在"今日" Tab 添加一条观察记录
5. 应看到新的 POST 请求：
   ```
   POST http://192.168.9.3/api/records
   ```
   状态码应为 `200` 或 `201`

### 方法 B：检查 NAS 数据库

在 NAS 上运行：

```bash
docker exec qiqi-bun sqlite3 /data/sqlite.db "SELECT COUNT(*) FROM records;"
```

应显示记录数量已增加。

### 方法 C：检查浏览器本地存储

1. 打开开发者工具（F12）
2. 进入"Application"标签页
3. 点击"Local Storage"
4. 应看到：
   ```
   qiqi_api_base = http://192.168.9.3/api
   qiqi_jwt = eyJhbGciOiJIUzI1NiI...（JWT token）
   ```

---

## 故障排查

### 连接失败：网络错误

**可能原因：**
- NAS API 服务未运行
- 输入的 API 地址错误
- 防火墙阻止

**解决：**
```bash
# 在 NAS 上检查服务状态
docker-compose ps

# 验证 API 是否响应
curl http://192.168.9.3/api/health
# 应返回：{"success":true}
```

### 连接失败：401 Unauthorized

**可能原因：**
- PIN 码输入错误
- JWT token 过期

**解决：**
```bash
# 检查 PIN 码是否正确
grep ACCESS_PIN /mnt/nas/qiqi/.env

# 清除本地 token，重新连接
# 在 PWA 设置页点击"清除配置"，再点"连接"
```

### 记录已保存在 IndexedDB，但未同步到 NAS

**可能原因：**
- API 未配置（PWA 在 IndexedDB 保存，但不会发送到 NAS）
- API 地址配置错误

**解决：**
1. 检查设置页是否显示"已连接"
2. 检查浏览器开发者工具的 Network 标签是否有 `/api/records` 请求
3. 在浏览器 Console 输入：
   ```javascript
   console.log(localStorage.getItem('qiqi_api_base'))
   // 应显示：http://192.168.9.3/api
   ```

---

## 高级配置

### 更改 API 地址（不重新配置）

在浏览器 Console 输入：

```javascript
localStorage.setItem('qiqi_api_base', 'http://new-address/api');
location.reload();
```

### 清除所有配置并重置

```javascript
localStorage.removeItem('qiqi_api_base');
localStorage.removeItem('qiqi_jwt');
location.reload();
```

### 导出 API token（用于多设备同步）

```javascript
console.log('JWT Token:');
console.log(localStorage.getItem('qiqi_jwt'));
```

在另一台设备的 Console 输入：
```javascript
localStorage.setItem('qiqi_jwt', 'YOUR_JWT_TOKEN_HERE');
location.reload();
```

---

## 多设备同步

### 在新设备上同步数据

1. **在新设备上打开 PWA：** `http://192.168.9.3`
2. **配置 API：** 同上，输入相同的 API 地址和 PIN 码
3. **刷新页面：** F5 或点击地址栏的刷新
4. **检查数据：** 应显示来自 NAS 的所有历史数据

### 跨 WiFi 和外网访问

**在家里：**
```
http://192.168.9.3/api
```

**在公司或出差：**
```
https://myqiqi.ugnas.com/api  （配置 DDNS 后）
```

或使用 Tailscale VPN：
```
http://100.x.x.x/api
```

---

## 注意事项

⚠️ **不要在公共设备上保存 JWT token**
- 关闭浏览器时点击"清除配置"
- 避免在网吧、医院等公共场所登录

⚠️ **PIN 码安全**
- 定期修改 `.env` 中的 `ACCESS_PIN`
- 不要使用太简单的密码（如 1234）

⚠️ **HTTPS 强烈推荐**
- 外网访问时必须使用 HTTPS
- 配置 DDNS 会自动启用 HTTPS 和 SSL 证书

---

## 需要帮助？

- 检查 NAS 上的日志：`docker-compose logs -f`
- 查看 PWA 开发者工具：F12 → Console 查看错误信息
- 详见完整部署指南：`DEPLOYMENT.md`
