---
version: 2.1
last_updated: 2026-04-28
description: 系统架构文档 - 技术设计、架构、数据库、API
---

# 🏗️ 系统架构

起起成长项目的完整技术架构和设计文档。

---

## 📄 文档清单

| 文件 | 内容 | 开发角色 |
|-----|------|---------|
| `system-design.md` | 系统整体设计和架构图 | 所有人必读 |
| `frontend-architecture.md` | 前端架构（UI、存储、同步） | 前端工程师 |
| `backend-architecture.md` | 后端架构（Bun、SQLite、API） | 后端工程师 |
| `database-schema.md` | 完整数据库 schema 定义 | 数据库/全栈 |
| `api-specification.md` | REST API 完整规范和示例 | 集成/全栈 |

---

## 🎯 按需快速查阅

### 我需要了解整个系统
👉 [system-design.md](system-design.md)
- 前后端架构图
- 数据流向
- 核心模块介绍

### 我要开发前端功能
👉 [frontend-architecture.md](frontend-architecture.md)
- IndexedDB 8 个 store
- Service Worker 缓存策略
- UI 模块组织
- sync.js 同步层

### 我要开发或扩展后端
👉 [backend-architecture.md](backend-architecture.md)
- Bun 项目结构
- SQLite 数据库
- REST API 端点
- 认证和授权

### 我需要数据库细节
👉 [database-schema.md](database-schema.md)
- 前端 IndexedDB schema
- 后端 SQLite schema
- 数据类型和关系

### 我需要调用 API
👉 [api-specification.md](api-specification.md)
- 所有端点的完整文档
- 请求/响应示例
- 错误处理
- 认证方式（JWT PIN）

---

## 🏢 架构概览

```
┌─────────────────────────────────────────────┐
│         Web Browser / PWA App               │
│  ┌──────────────────────────────────────┐   │
│  │     Vue Components / UI Modules      │   │
│  └──────────┬───────────────────────────┘   │
│             │                                │
│  ┌──────────▼───────────────────────────┐   │
│  │     IndexedDB (8 stores)             │   │
│  │  - profile, records, milestones...   │   │
│  └──────────┬───────────────────────────┘   │
│             │                                │
│  ┌──────────▼───────────────────────────┐   │
│  │  Service Worker (Cache & Offline)    │   │
│  └──────────┬───────────────────────────┘   │
└─────────────┼────────────────────────────────┘
              │
              │ (HTTP/HTTPS)
              │
     ┌────────▼────────┐
     │  sync.js Layer  │
     │ (Push-only)     │
     └────────┬────────┘
              │
┌─────────────▼────────────────────────────────┐
│         NAS / Server (Bun + SQLite)          │
│  ┌──────────────────────────────────────┐    │
│  │     REST API (Express-like)          │    │
│  │  /api/health, /api/auth, /api/...    │    │
│  └──────────┬───────────────────────────┘    │
│             │                                 │
│  ┌──────────▼───────────────────────────┐    │
│  │  SQLite Database                     │    │
│  │  - profiles, records, diary...       │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 🔌 核心模块

| 模块 | 技术栈 | 职责 |
|-----|-------|------|
| **前端 UI** | HTML5 / CSS3 / Vanilla JS | 用户界面 |
| **本地存储** | IndexedDB | 设备离线数据 |
| **离线支持** | Service Worker | 缓存和离线访问 |
| **同步层** | sync.js | Push-only 数据同步 |
| **后端 API** | Bun + Express-like | RESTful API |
| **数据持久化** | SQLite | NAS 持久化存储 |
| **部署** | Docker + Docker Compose | 一键启动 |

---

## 📊 数据库架构

- **前端**（IndexedDB）：8 个 store，支持离线完全功能
- **后端**（SQLite）：对应的 8 个表，支持多用户和持久化
- **同步机制**：Push-only，前端发起，后端接收，确保一致性

详见 [database-schema.md](database-schema.md)

---

## 🔌 API 设计

- **认证**：JWT + PIN 码（简单易用）
- **风格**：RESTful，JSON 请求/响应
- **路由**：/api/health, /api/auth/pin, /api/profile, /api/records...

详见 [api-specification.md](api-specification.md)

---

## 📚 相关文档

- [产品需求](../product/requirements-v2.1.md) — 功能规范
- [开发指南](../development/) — 代码规范和工作流
- [部署指南](../deployment/) — 部署和运维

---

*架构文档 · v2.1 · 2026-04-28*
