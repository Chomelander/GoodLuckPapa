# Dockerfile for Bun server
FROM oven/bun:latest

WORKDIR /app

# 复制 package.json 和代码
COPY package.json bunfig.toml ./
COPY src ./src
COPY migrations ./migrations

# 设置环境变量
ENV JWT_SECRET=your-secret-key
ENV ACCESS_PIN=1234
ENV DATABASE_PATH=/data/sqlite.db
ENV PORT=8080

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run --eval "fetch('http://localhost:8080/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1

# 启动服务
CMD ["bun", "run", "src/index.ts"]
