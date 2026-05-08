# HTTPS 和 DDNS 配置指南

## 为什么需要 HTTPS？

PWA 的 Service Worker（离线功能）**必须运行在 HTTPS 上**。

- 本地网络（192.168.x.x）：可暂时使用 HTTP，但不推荐
- 外网访问：**必须 HTTPS**

---

## 方案对比

| 方案 | 难度 | 自动更新证书 | 推荐度 |
|------|------|-----------|--------|
| DDNS + Let's Encrypt | 低 | ✅ | ⭐⭐⭐ 推荐 |
| 自签名证书 | 中 | ❌ | ⭐⭐ |
| Tailscale VPN | 中 | ✅ | ⭐⭐ |

---

## 方案 A：DDNS + Let's Encrypt（推荐）

### 前提

UGREEN NAS 内置 DDNS 支持，会自动分配域名和 SSL 证书。

### 步骤

#### 1. 在 NAS 中启用 DDNS

1. **打开 NAS Web UI**：http://192.168.9.3:9999
2. **系统设置 → 网络 → DDNS**
3. **启用 DDNS 服务**
4. **记下分配的域名**（如 `myqiqi.ugnas.com`）
5. **等待 SSL 证书自动配置**（通常 5-10 分钟）

#### 2. 配置端口映射

1. **网络 → 端口映射**
2. **新建映射规则：**
   ```
   外部端口 80  → 内部 192.168.9.3:80
   外部端口 443 → 内部 192.168.9.3:443
   ```
3. **保存并启用**

#### 3. 验证 HTTPS 访问

在浏览器打开：`https://myqiqi.ugnas.com`

- 应看到绿色锁头 🔒
- 无证书警告
- PWA 正常加载

#### 4. 在 PWA 中配置 API

在设置页，API 地址改为：
```
https://myqiqi.ugnas.com/api
```

（注意：`https` 而非 `http`）

---

## 方案 B：Tailscale VPN（更安全，推荐外网）

### 前提

- NAS 安装了 Tailscale（或通过 Docker 运行）
- 你的设备安装了 Tailscale 客户端

### 步骤

#### 1. 在 NAS 上运行 Tailscale

使用 Docker 运行 Tailscale：

```bash
docker run -d --name tailscale \
  -v /var/lib/tailscale:/var/lib/tailscale \
  -e TS_AUTHKEY=your-auth-key \
  ghcr.io/tailscale/tailscale:latest
```

获取 `your-auth-key`：
1. 访问 https://login.tailscale.com/admin/settings/keys
2. 生成新的 Auth Key

#### 2. 在你的设备上连接 Tailscale

**Windows/Mac：**
- 下载 Tailscale：https://tailscale.com/download
- 安装并登录
- 等待设备配对

**iOS/Android：**
- App Store / Google Play 搜索"Tailscale"
- 安装并登录

#### 3. 获取 NAS 的 Tailscale IP

```bash
# 在 NAS 上获取 Tailscale IP
docker exec tailscale tailscale ip -4
# 输出：100.x.x.x
```

#### 4. 在 PWA 中配置 API

在设置页，API 地址改为：
```
http://100.x.x.x/api
```

（用你的 Tailscale IP 替换 100.x.x.x）

---

## 方案 C：自签名证书（本地测试）

### 前提

仅用于本地测试，外网访问不推荐（浏览器会显示警告）。

### 步骤

#### 1. 在 NAS 上生成证书

```bash
mkdir -p /mnt/nas/qiqi/certs
cd /mnt/nas/qiqi/certs

# 生成自签名证书（有效期 365 天）
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/C=CN/ST=State/L=City/O=Org/CN=192.168.9.3"
```

#### 2. 编辑 nginx.conf

取消注释 HTTPS 块：

```nginx
server {
  listen 443 ssl http2;
  server_name 192.168.9.3;

  ssl_certificate /etc/nginx/certs/cert.pem;
  ssl_certificate_key /etc/nginx/certs/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://bun-api:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Content-Type $http_content_type;
    proxy_buffering off;
    proxy_request_buffering off;
  }
}

# HTTP 301 重定向到 HTTPS
server {
  listen 80;
  server_name _;
  return 301 https://$host$request_uri;
}
```

#### 3. 编辑 docker-compose.yml

修改 Nginx 卷挂载：

```yaml
volumes:
  - ./nginx.conf:/etc/nginx/nginx.conf:ro
  - ./certs/cert.pem:/etc/nginx/certs/cert.pem:ro
  - ./certs/key.pem:/etc/nginx/certs/key.pem:ro
```

#### 4. 重启服务

```bash
docker-compose down && docker-compose up -d
```

#### 5. 在设备上信任证书

**Windows：**
```bash
# 复制 cert.pem 到 Windows
# 双击 → 安装证书 → 当前用户 → 受信根证书颁发机构
```

**Mac：**
```bash
# 复制 cert.pem 到 Mac
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain cert.pem
```

**iOS/Android：**
- 下载 cert.pem，按提示安装为可信证书

#### 6. 在 PWA 中配置 API

```
https://192.168.9.3/api
```

---

## 故障排查

### HTTPS 访问显示"不安全"

**DDNS 方案：**
- 等待 5-10 分钟让 Let's Encrypt 证书生成
- 在 NAS 系统日志中查看是否有错误

**自签名方案：**
- 在浏览器中点击"高级" → "继续访问"（同意风险）
- 或在操作系统中信任证书

### API 请求返回 SSL 错误

**检查 nginx.conf：**
```bash
# 验证配置文件语法
docker exec qiqi-nginx nginx -t
```

**重启 Nginx：**
```bash
docker-compose restart nginx
```

### Service Worker 无法注册

Service Worker 要求 HTTPS（或 localhost）。

检查 PWA 地址：
- ✅ `https://myqiqi.ugnas.com` → 可以
- ✅ `http://localhost:8080` → 可以
- ❌ `http://192.168.x.x` → 不可以（除非用自签名证书）

---

## 安全建议

1. **始终使用 HTTPS（如果可能）**
   - DDNS 方案自动配置 Let's Encrypt 证书

2. **定期更新证书**
   - Let's Encrypt 证书自动续期（90 天）
   - 自签名证书需手动更新

3. **限制 IP 访问（可选）**
   ```nginx
   location /api/ {
     allow 192.168.9.0/24;  # 仅允许本地网络
     deny all;
     proxy_pass http://bun-api:8080;
   }
   ```

4. **启用 HSTS（可选）**
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   ```

---

## 下一步

- 在 PWA 设置中配置 API 地址（用 HTTPS 地址）
- 测试 Service Worker：打开 DevTools → Application → Service Workers
- 验证离线功能：停止 WiFi，PWA 应仍可加载

---

## 帮助

- **DDNS 配置问题**：查看 NAS 系统日志
- **证书问题**：检查 Nginx 日志：`docker-compose logs nginx`
- **Tailscale 问题**：访问 https://login.tailscale.com/admin/machines
