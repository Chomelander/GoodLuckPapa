---
version: 2.1
last_updated: 2026-04-28
description: 部署和运维文档 - 快速启动、完整指南、配置、故障排查
---

# 🚀 部署和运维

后端服务的部署、配置、监控和故障排查文档。

---

## ⚡ 快速开始（5 分钟）

👉 [quick-start.md](quick-start.md)
```bash
docker-compose up -d
# 然后在 App 设置页配置 API 地址
```
就这么简单！

---

## 📄 完整文档清单

| 文件 | 内容 | 耗时 |
|-----|------|------|
| `quick-start.md` | ⚡ 5 分钟快速启动（推荐新手） | 5 分钟 |
| `deployment-guide.md` | 📖 完整部署指南和各种场景 | 30 分钟 |
| `docker-setup.md` | 🐳 Docker 和 Docker Compose 详解 | 20 分钟 |
| `api-configuration.md` | ⚙️ API 地址、PIN 码、连接测试 | 10 分钟 |
| `https-ddns-setup.md` | 🔒 HTTPS 和动态域名配置 | 30 分钟 |
| `monitoring.md` | 📊 日志、监控、健康检查 | - |
| `troubleshooting.md` | 🔧 常见问题排查 | - |

---

## 🎯 按场景选择

### 我只想快速试一下
👉 [quick-start.md](quick-start.md)
- 本地 Docker 启动
- 5 分钟完成
- 适合测试和演示

### 我要在生产环境部署
👉 [deployment-guide.md](deployment-guide.md)
- NAS 部署
- 云服务器部署
- 多机房部署

### 我需要 HTTPS 和外网访问
👉 [https-ddns-setup.md](https-ddns-setup.md)
- 自签名证书
- 动态域名（DDNS）
- 内网穿透选项

### 我要监控和调试
👉 [monitoring.md](monitoring.md)
- 日志查看
- 性能监控
- 健康检查

### 遇到问题了
👉 [troubleshooting.md](troubleshooting.md)
- 常见错误
- 解决方案
- 调试方法

---

## 📋 前置要求

- **Docker** 和 **Docker Compose**（推荐）
- 或者本地 **Bun** 运行时
- 一台有网络连接的机器

## 🏗️ 部署架构

```
┌──────────────────────────┐
│    Nginx (Reverse Proxy) │
│    :8088 → :8080         │
└────────────┬─────────────┘
             │
   ┌─────────▼──────────┐
   │   Bun API Server   │
   │  • REST Endpoints  │
   │  • JWT Auth        │
   └─────────┬──────────┘
             │
   ┌─────────▼──────────┐
   │   SQLite Database  │
   │  Persistent Storage│
   └────────────────────┘
```

---

## ✅ 检查清单

部署完成后检查：

- [ ] Docker 容器正常运行 (`docker ps`)
- [ ] API 可以访问 (`curl http://localhost:8088/api/health`)
- [ ] SQLite 数据库存在（`server/qiqi.db`）
- [ ] App 能连接到 API
- [ ] 数据同步正常工作

---

## 📚 相关文档

- [产品需求](../product/requirements-v2.1.md) — 需要同步的数据类型
- [API 规范](../architecture/api-specification.md) — API 端点详解
- [数据库设计](../architecture/database-schema.md) — SQLite schema

---

*部署文档 · v2.1 · 2026-04-28*
