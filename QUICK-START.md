# 5 分钟快速启动 — NAS 部署

## 前提

- NAS 地址：`192.168.9.3`
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
ACCESS_PIN=123456
DATA_PATH=/mnt/nas/qiqi-data
```

保存：`Ctrl+X` → `Y` → `Enter`

---

## 4. 启动服务

```bash
mkdir -p /mnt/nas/qiqi-data
docker-compose up -d
```

**检查状态：**
```bash
docker-compose ps
# 应显示 2 个 running 的容器
```

---

## 5. 验证

```bash
curl http://192.168.9.3/api/health
# 应返回：{"success":true}
```

在浏览器打开：`http://192.168.9.3`
应看到起起成长 PWA

---

## 6. PWA 中配置 API

1. 在 PWA 中点击"设置" Tab
2. 找到"NAS 配置"或"API 服务"
3. 输入：
   - API 地址：`http://192.168.9.3/api`
   - PIN 码：`123456`
4. 点击"连接"

---

## 7. 测试同步

在"今日" Tab 记录一条观察 → 检查数据是否存储在 NAS

```bash
# 在 NAS 上验证
docker exec qiqi-bun sqlite3 /data/sqlite.db "SELECT COUNT(*) FROM records;"
# 应返回：1（或更多）
```

**完成！** 🎉

---

## 常见问题

### 容器无法启动？

```bash
docker-compose logs
# 查看错误信息
```

### 端口 80 被占用？

修改 `docker-compose.yml`：
```yaml
ports:
  - "8888:80"  # 改为 8888
```

重启：
```bash
docker-compose down && docker-compose up -d
访问：http://192.168.9.3:8888
```

### 需要停止服务？

```bash
docker-compose down
```

### 需要查看数据？

```bash
docker exec qiqi-bun sqlite3 /data/sqlite.db "SELECT * FROM records LIMIT 5;"
```

---

## 下一步

- 配置外网访问（DDNS 或 Tailscale）
- 启用 HTTPS
- 定期备份数据库

详见：`DEPLOYMENT.md`
