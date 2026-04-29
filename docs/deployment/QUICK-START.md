# 5 分钟快速启动 — NAS 部署

## 前提

- NAS 地址：`192.168.9.3`（内网）或你的内网穿透地址
- Docker 已安装
- SSH 可用

---

## 1. SSH 登录 NAS

```bash
ssh root@192.168.9.3
cd /mnt/nas
```

---

## 2. 克隆项目

```bash
git clone https://github.com/Chomelander/GoodLuckPapa.git qiqi
cd qiqi
```

（如果没有 Git，手动上传项目文件）

---

## 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

**修改这三行：**

```ini
JWT_SECRET=your-super-secret-jwt-key-change-this
ACCESS_PIN=your-pin-code
DATA_PATH=/mnt/nas/qiqi-data
```

保存：`Ctrl+X` → `Y` → `Enter`

---

## 4. 启动服务

```bash
mkdir -p /mnt/nas/qiqi-data
docker compose up -d
```

**检查状态：**

```bash
docker compose ps
# 应显示 2 个容器：qiqi-nginx 和 qiqi-bun
```

---

## 5. 验证

```bash
# 检查 API 健康状态（通过 Nginx 代理）
curl http://192.168.9.3:8088/api/health
# 应返回：{"success":true,"data":{"status":"ok",...}}
```

在浏览器打开：`http://192.168.9.3:8088`
应看到起起成长 PWA

---

## 6. PWA 中配置 NAS 同步

1. 在 PWA 中点击底部"**设置**" Tab
2. 找到"**NAS 数据同步**"区块
3. 在"API 地址"输入框填写：
   ```
   http://192.168.9.3:8088
   ```
4. 填写 PIN 码（即 `.env` 中的 `ACCESS_PIN`）
5. 点击"**连接**"
6. 状态显示"✓ 已连接 NAS，自动同步中"即成功

> 注意：API 地址填写到端口号即可，不需要加 `/api` 后缀。

---

## 7. 测试同步

在"今日" Tab 记录一条观察记录，然后验证数据是否同步到 NAS：

```bash
# 通过 API 查询（需先获取 token）
TOKEN=$(curl -s -X POST http://192.168.9.3:8088/api/auth/pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"your-pin-code"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -s http://192.168.9.3:8088/api/records \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
# 应返回大于 0 的数字
```

**完成！** 🎉

---

## 部署架构

```
浏览器
  ↓ :8088
Nginx（反向代理）
  ↓ :8080（内部）
Bun API 服务器
  ↓
SQLite 数据库（/mnt/nas/qiqi-data/sqlite.db）
```

---

## 常见问题

### 容器无法启动？

```bash
docker compose logs
# 查看错误信息
docker compose logs qiqi-bun  # 仅查看 API 服务日志
```

### 端口 8088 被占用？

修改 `docker-compose.yml`：

```yaml
ports:
  - "8090:80"  # 改为其他端口
```

重启：

```bash
docker compose down && docker compose up -d
# 浏览器访问：http://192.168.9.3:8090
# PWA 中 API 地址改为：http://192.168.9.3:8090
```

### 需要停止服务？

```bash
docker compose down
```

### 需要查看数据库？

```bash
# 通过 API 查询（推荐）
TOKEN=$(curl -s -X POST http://192.168.9.3:8088/api/auth/pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"your-pin"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -s http://192.168.9.3:8088/api/records -H "Authorization: Bearer $TOKEN"
curl -s http://192.168.9.3:8088/api/diary -H "Authorization: Bearer $TOKEN"
```

---

## 下一步

- 配置外网访问（DDNS 或 Tailscale）
- 启用 HTTPS
- 定期备份数据库：`cp /mnt/nas/qiqi-data/sqlite.db /mnt/nas/qiqi-backup-$(date +%Y%m%d).db`

详见：`DEPLOYMENT.md`
