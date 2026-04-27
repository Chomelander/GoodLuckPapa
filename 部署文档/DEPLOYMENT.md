# 起起成长 PWA — UGREEN NAS 部署指南

## 概览

本文档指导如何将起起成长 PWA 应用部署到 UGREEN NAS（192.168.9.3）。

**部署架构：**
```
UGREEN NAS (192.168.9.3)
├── Docker Container: Nginx（Nginx，端口 80/443）
│   └── 静态文件：index.html, js/, css/, manifest.json, service-worker.js
├── Docker Container: Bun API（端口 8080，仅内部）
│   └── SQLite 数据库（/data/sqlite.db）
└── Docker Volume: qiqi-data（数据持久化）
```

---

## 先决条件

- ✅ UGREEN NAS 已安装 Docker
- ✅ NAS 可通过 SSH 访问（或在 Web UI 中配置）
- ✅ Git 仓库已 push 到 GitHub：`https://github.com/Chomelander/GoodLuckPapa.git`
- ✅ 项目根目录已包含：`docker-compose.yml`、`nginx.conf`、`.env.example`

---

## 部署步骤

### 第 1 步：SSH 连接 NAS

**方式 A：使用 SSH（推荐）**

```bash
# 在你的电脑上打开终端
ssh root@192.168.9.3
# 根据提示输入密码
```

**方式 B：通过 NAS Web UI**

1. 打开 http://192.168.9.3:9999/desktop/
2. 在系统设置中启用 SSH 服务
3. 记下 SSH 端口号（通常是 22）

---

### 第 2 步：下载项目到 NAS

**在 NAS 上执行：**

```bash
# 进入 NAS 存储目录（根据你的 NAS 挂载点调整）
cd /mnt/nas  # 或其他存储位置

# 克隆仓库
git clone https://github.com/Chomelander/GoodLuckPapa.git qiqi
cd qiqi

# 确认文件完整
ls -la | grep -E "docker-compose|nginx.conf|.env"
# 应显示：docker-compose.yml, nginx.conf, .env.example
```

**如果 NAS 没有 Git，手动上传：**

1. 在本地运行：`git archive --format=tar HEAD | gzip > qiqi.tar.gz`
2. 上传 `qiqi.tar.gz` 到 NAS
3. 在 NAS 上运行：`tar -xzf qiqi.tar.gz && cd GoodLuckPapa`

---

### 第 3 步：配置环境变量

**在 NAS 上执行：**

```bash
cd /mnt/nas/qiqi

# 从示例文件复制
cp .env.example .env

# 编辑 .env（使用 nano 或 vi）
nano .env
```

**修改以下内容（关键参数）：**

```ini
# JWT 签名密钥（生成强随机值）
JWT_SECRET=your-super-secret-jwt-key-change-this

# PIN 码（前端登录密码，建议改为 6 位数字）
ACCESS_PIN=123456

# 数据库路径（必须在 Docker Volume 可访问的位置）
DATABASE_PATH=/data/sqlite.db

# NAS 数据存储目录（调整为你的实际路径）
DATA_PATH=/mnt/nas/qiqi-data
```

**保存并退出：**
- Nano：按 `Ctrl+X` → `Y` → `Enter`

**生成强 JWT_SECRET：**

```bash
# 在 NAS 上运行（需要 openssl）
openssl rand -hex 32
# 输出例：a1b2c3d4e5f6...（32 字节）
# 复制输出，替换 .env 中的 JWT_SECRET 值
```

---

### 第 4 步：初始化数据库

**在 NAS 上执行：**

```bash
cd /mnt/nas/qiqi

# 创建数据目录
mkdir -p /mnt/nas/qiqi-data
chmod 755 /mnt/nas/qiqi-data

# （可选）预初始化数据库
# docker run --rm -v /mnt/nas/qiqi-data:/data oven/bun:latest bun run /app/migrations/0001_init.sql
# 通常 Bun 服务启动时会自动初始化，无需手动操作
```

---

### 第 5 步：启动 Docker Compose

**在 NAS 上执行：**

```bash
cd /mnt/nas/qiqi

# 加载 .env 文件并启动所有容器
docker-compose up -d

# 验证容器状态
docker-compose ps
# 应显示：qiqi-nginx running, qiqi-bun running
```

**查看日志（如遇问题）：**

```bash
# 查看 Nginx 日志
docker-compose logs nginx

# 查看 Bun API 日志
docker-compose logs bun-api

# 实时追踪日志
docker-compose logs -f
```

---

### 第 6 步：验证部署

**验证 API 健康状态：**

```bash
# 在 NAS 上或你的电脑上
curl http://192.168.9.3/api/health

# 预期输出：
# {"success":true}
```

**验证 PWA 前端：**

在浏览器打开：`http://192.168.9.3`
- 应显示起起成长 PWA（index.html）
- 左上角显示"欢迎使用起起成长"

**验证 PIN 登录：**

```bash
# 测试 PIN 码登录（假设 ACCESS_PIN=123456）
curl -X POST http://192.168.9.3/api/auth/pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"123456"}'

# 预期输出：
# {"success":true,"data":{"token":"eyJhbGc..."}}
```

---

## 前端配置（重要）

PWA 需要配置 API 地址才能实现数据持久化。

### 配置步骤

1. **在 PWA 中设置 API 地址：**
   - 打开 http://192.168.9.3（PWA）
   - 进入"设置"Tab
   - 找到"NAS 配置"或"API 服务"选项
   - 输入 API 地址：`http://192.168.9.3/api`
   - 输入 PIN 码：`123456`（与 .env 中的 ACCESS_PIN 一致）
   - 点击"连接"

2. **验证同步：**
   - 在"今日"Tab 记录一条观察
   - 打开浏览器开发者工具（F12）→ Network
   - 应看到 POST 请求：`http://192.168.9.3/api/records`
   - 查看 NAS 数据库：

   ```bash
   sqlite3 /mnt/nas/qiqi-data/sqlite.db "SELECT COUNT(*) FROM records;"
   ```

   应输出：`1`（或更多，取决于已记录的观察数）

---

## 访问方式对比

| 访问方式 | 地址 | 适用场景 | HTTPS |
|---------|------|--------|-------|
| 局域网 | `http://192.168.9.3` | 家里用 WiFi | ❌ (可选) |
| NAS DDNS | `http://myqiqi.ugnas.com` | 外网访问 | ✅ (自动) |
| Tailscale VPN | `http://100.x.x.x` | 多设备/出差 | ✅ (需配置) |

---

## 外网访问方案

### 方案 A：UGREEN DDNS（最简单）

1. **登录 NAS Web UI**：http://192.168.9.3:9999/desktop/
2. **网络设置 → DDNS**
3. **开启 DDNS 服务**，记下分配的域名（如 `myqiqi.ugnas.com`）
4. **启用端口映射**：
   - 外部端口：80 → 内部 192.168.9.3:80
   - 外部端口：443 → 内部 192.168.9.3:443
5. **在 PWA 中配置 API 地址**：`https://myqiqi.ugnas.com/api`

### 方案 B：Tailscale VPN（更安全）

```bash
# 在 NAS 上安装 Tailscale
# （UGREEN NAS 可能需要通过 Docker 运行 Tailscale）

# 在你的设备上安装 Tailscale 客户端
# iOS/Android/Windows/Mac：下载 Tailscale 官方应用

# 连接成功后，在 PWA 中使用 Tailscale 分配的 IP
# 例：http://100.x.x.x/api
```

---

## 停止和更新

### 停止服务

```bash
cd /mnt/nas/qiqi
docker-compose down
```

### 更新代码

```bash
cd /mnt/nas/qiqi
git pull origin main
docker-compose up -d --build
```

### 重启服务

```bash
cd /mnt/nas/qiqi
docker-compose restart
```

---

## 故障排查

### 问题 1：`docker-compose: command not found`

**解决：**
```bash
# 检查 Docker 版本
docker --version

# 如果没有 docker-compose，使用 docker compose（新版）
docker compose up -d
```

### 问题 2：`Port 80 already in use`

**解决：**
```bash
# 修改 docker-compose.yml，改用其他端口
# ports: ["8888:80"]  （改为 8888）

docker-compose up -d
# 然后在浏览器访问：http://192.168.9.3:8888
```

### 问题 3：API 返回 401 Unauthorized

**检查：**
```bash
# 1. 确认 PIN 码正确
grep ACCESS_PIN /mnt/nas/qiqi/.env

# 2. 查看 Bun 日志
docker-compose logs bun-api | grep -i auth

# 3. 重新生成 JWT token
curl -X POST http://192.168.9.3/api/auth/pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"YOUR_PIN_HERE"}'
```

### 问题 4：数据库文件不存在或损坏

**解决：**
```bash
# 删除旧数据库并重新初始化
rm /mnt/nas/qiqi-data/sqlite.db

# 重启 Bun 服务（会自动初始化数据库）
docker-compose restart bun-api

# 验证
docker exec qiqi-bun sqlite3 /data/sqlite.db ".tables"
```

---

## 数据备份

### 备份数据库

```bash
# 导出 SQLite 数据库
docker exec qiqi-bun sqlite3 /data/sqlite.db ".dump" > backup_$(date +%Y%m%d).sql

# 备份到 NAS 的另一位置
cp /mnt/nas/qiqi-data/sqlite.db /mnt/nas/backup/sqlite_$(date +%Y%m%d).db
```

### 恢复数据库

```bash
# 停止服务
docker-compose down

# 恢复备份
cp /mnt/nas/backup/sqlite_20260424.db /mnt/nas/qiqi-data/sqlite.db

# 重启服务
docker-compose up -d
```

---

## 安全建议

1. **更改默认 PIN 码**：改为强密码（不要用 1234）
2. **更新 JWT_SECRET**：使用 `openssl rand -hex 32` 生成强密钥
3. **启用 HTTPS**：配置 DDNS 或自签名证书，PWA Service Worker 需要 HTTPS
4. **定期备份**：每周备份 SQLite 数据库
5. **限制 SSH 访问**：在 NAS 中配置只允许本地 IP 连接
6. **监控日志**：定期检查 `docker-compose logs` 发现异常

---

## 常用命令速查

```bash
# 启动所有容器
docker-compose up -d

# 停止所有容器
docker-compose down

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重建镜像并启动
docker-compose up -d --build

# 进入 Bun 容器
docker exec -it qiqi-bun sh

# 进入 Nginx 容器
docker exec -it qiqi-nginx sh

# 查看 SQLite 数据库内容
docker exec qiqi-bun sqlite3 /data/sqlite.db "SELECT * FROM records LIMIT 5;"

# 停止特定容器
docker-compose stop bun-api

# 删除所有容器和卷（谨慎）
docker-compose down -v
```

---

## 下一步

1. **完成部署后**：在 PWA 设置中配置 API 地址和 PIN 码
2. **测试完整工作流**：记录观察 → 验证数据存储在 NAS SQLite
3. **配置外网访问**：启用 DDNS 或 Tailscale（可选）
4. **启用 HTTPS**：配置证书，保护 Service Worker 通信（推荐）

---

## 支持

如遇问题，检查：
- GitHub Issue：https://github.com/Chomelander/GoodLuckPapa/issues
- Docker 日志：`docker-compose logs -f`
- 前端开发者工具：F12 → Network 查看 API 请求

