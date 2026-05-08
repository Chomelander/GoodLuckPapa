---
version: 2.1
last_updated: 2026-04-28
description: 开发指南 - 环境配置、代码规范、测试、工作流
---

# 🛠️ 开发指南

针对想为项目贡献代码的开发者的完整指南。

---

## 📄 文档清单

| 文件 | 内容 | 对象 |
|-----|------|------|
| `setup.md` | 开发环境配置和第一次运行 | 新手 |
| `coding-standards.md` | 代码规范和风格指南 | 所有人 |
| `testing-guide.md` | 单元测试、集成测试、端到端测试 | 开发者 |
| `git-workflow.md` | Git 工作流、分支管理、提交规范 | 所有人 |
| `contributing.md` | 如何提交 PR、贡献流程 | 新贡献者 |

---

## 🚀 第一次贡献？

按这个顺序：

1. 读 [setup.md](setup.md) — 配置开发环境（15 分钟）
2. 读 [contributing.md](contributing.md) — 了解 PR 流程（10 分钟）
3. 读 [coding-standards.md](coding-standards.md) — 代码规范（10 分钟）
4. 修改代码，运行 `npm test`
5. 提交 PR

---

## 📊 项目结构

```
src/
├── frontend/                 前端代码
│   ├── index.html           App 主文件
│   ├── js/
│   │   ├── app.js           应用初始化
│   │   ├── db.js            IndexedDB 封装
│   │   ├── sync.js          NAS 同步层
│   │   ├── ui/              各个页面模块
│   │   ├── data/            活动和里程碑库
│   │   └── lib/             辅助库
│   └── css/                 样式表
│
├── backend/                 后端代码
│   ├── server/
│   │   ├── src/
│   │   │   ├── index.ts     REST API 主文件
│   │   │   └── db.ts        SQLite 初始化
│   │   ├── migrations/      数据库版本管理
│   │   └── package.json
│   └── README.md
│
└── README.md
```

---

## ✅ 开发清单

启动开发前：
- [ ] Node.js 14+ 已安装
- [ ] npm 或 yarn 已安装
- [ ] Git 已配置
- [ ] 代码编辑器已准备（VS Code 推荐）

开发中：
- [ ] 遵循代码规范（见 `coding-standards.md`）
- [ ] 添加单元测试（见 `testing-guide.md`）
- [ ] 运行 `npm test` 确保全通过

提交 PR 前：
- [ ] 全部测试通过 (244/244)
- [ ] 代码已 review
- [ ] Commit message 清晰（见 `git-workflow.md`）

---

## 🔧 常见命令

```bash
# 安装依赖
npm install

# 运行所有单元测试
npm test

# 前端本地开发服务器
npx serve . --listen 3000

# 后端本地开发服务器
cd server && npm run dev

# 构建和启动 Docker
docker-compose up -d

# 查看日志
docker logs -f qiqi-api
```

---

## 🧪 测试

244 个单元测试全覆盖：

```bash
npm test
# ✓ 244/244 通过
```

测试覆盖：
- IndexedDB CRUD 操作
- 推荐算法
- 里程碑流转
- 兴趣识别
- 日期计算
- API 同步

---

## 📚 相关文档

- [项目规范](../../CLAUDE.md) — 项目级开发规范（必读）
- [产品需求](../product/requirements-v2.1.md) — 功能规范
- [架构文档](../architecture/) — 技术设计
- [API 规范](../architecture/api-specification.md) — API 定义

---

*开发指南 · v2.1 · 2026-04-28*
