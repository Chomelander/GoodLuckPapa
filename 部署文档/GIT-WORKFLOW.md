---
title: Git 工作流 —— 本机推送到 NAS Gitea
version: v1.0
last_updated: 2026-04-28
changelog:
  - v1.0 (2026-04-28): 首次创建，记录本机→Gitea→NAS 完整流程与排错经验
---

# Git 工作流：本机 → Gitea → NAS

## 架构说明

```
本机（Windows）  ──push──►  NAS Gitea（:41085）  ──pull──►  NAS 运行目录（/mnt/nas/qiqi）
```

- **本机仓库**：`C:\Users\Administrator\Documents\Obsidian Vault\personal-profile\起起教育`
- **Gitea 地址**：`http://192.168.22.99:41085`
- **Gitea 仓库**：`http://192.168.22.99:41085/zzl/GoodLuckPapa`
- **NAS 运行目录**：`/mnt/nas/qiqi`

---

## 标准发布流程

### 第一步：本机推送到 Gitea

```bash
git push gitea main
```

Remote 已配置凭据，无需手动输入密码。

### 第二步：SSH 进 NAS，拉取最新代码

```bash
ssh root@192.168.22.99
cd /mnt/nas/qiqi
git fetch origin && git reset --hard origin/main
```

> `git reset --hard` 会强制覆盖 NAS 本地文件，确保与 Gitea 一致。
> **NAS 上不要直接修改文件**，所有改动必须从本机走 git 流程。

### 第三步：重启服务

```bash
cd /mnt/nas/qiqi/server
docker compose down && docker compose up -d
```

---

## 初始化（首次配置，已完成，仅供参考）

### 在 Gitea 创建仓库（API 方式）

```bash
curl -X POST "http://192.168.22.99:41085/api/v1/user/repos" \
  -H "Content-Type: application/json" \
  -u "zzl:Zelin86seasons" \
  -d '{"name":"GoodLuckPapa","private":true,"auto_init":false}'
```

### 设置本机 Gitea remote（带凭据）

```bash
git remote add gitea http://zzl:Zelin86seasons@192.168.22.99:41085/zzl/GoodLuckPapa.git
```

如已存在则更新：

```bash
git remote set-url gitea http://zzl:Zelin86seasons@192.168.22.99:41085/zzl/GoodLuckPapa.git
```

---

## 常见报错与解决方案

| 报错信息 | 原因 | 解决方法 |
|---------|------|---------|
| `git push` 挂起无响应 | Git Credential Manager 弹出 GUI 对话框被遮挡 | Remote URL 直接带凭据，绕过弹窗 |
| `Failed to authenticate user` | 密码错误（注意大小写） | 确认密码：`Zelin86seasons`（Z 大写） |
| `Push to create is not enabled` | Gitea 仓库不存在 | 先用 API 或 Web 界面建仓库 |
| `Your local changes would be overwritten` | NAS 本地有未提交的改动 | `git fetch origin && git reset --hard origin/main` |

---

## 账号信息

| 项目 | 值 |
|------|----|
| Gitea 用户名 | `zzl` |
| Gitea 密码 | `Zelin86seasons` |
| NAS 内网地址 | `192.168.22.99` |
| Gitea 端口 | `41085` |
