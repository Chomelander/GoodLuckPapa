import { initDB } from "./db";
import { authMiddleware } from "./middleware/auth";
import { handleAuthPIN } from "./routes/auth";
import * as types from "./types";
import * as db from "./db";

// 环境变量读取
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ACCESS_PIN = process.env.ACCESS_PIN || "1234";
const DATABASE_PATH = process.env.DATABASE_PATH || "/data/sqlite.db";
const PORT = parseInt(process.env.PORT || "8080", 10);

// 初始化数据库
console.log("🚀 Initializing database...");
await initDB(DATABASE_PATH);
console.log("✅ Database initialized");

// HTTP 服务器
const server = Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS 处理
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    try {
      // ═══════════════════════════════════════════════
      // 健康检查（无需认证）
      // ═══════════════════════════════════════════════
      if (path === "/api/health") {
        if (req.method === "GET") {
          const response: types.APIResponse = {
            success: true,
            data: { status: "ok", timestamp: new Date().toISOString() },
            error: null
          };
          return new Response(JSON.stringify(response), { status: 200, headers });
        }
      }

      // ═══════════════════════════════════════════════
      // PIN 认证（无需 JWT）
      // ═══════════════════════════════════════════════
      if (path === "/api/auth/pin") {
        return handleAuthPIN(req, JWT_SECRET, ACCESS_PIN);
      }

      // ═══════════════════════════════════════════════
      // 其他所有路由都需要 JWT 认证
      // ═══════════════════════════════════════════════
      const authResult = await authMiddleware(req, JWT_SECRET);
      if (!authResult.valid || !authResult.payload) {
        const response: types.APIResponse = {
          success: false,
          data: null,
          error: { code: "UNAUTHORIZED", message: authResult.error || "Invalid token" }
        };
        return new Response(JSON.stringify(response), { status: 401, headers });
      }

      const userId = authResult.payload.sub;

      // ═══════════════════════════════════════════════
      // Profile API
      // ═══════════════════════════════════════════════
      if (path === "/api/profile") {
        if (req.method === "GET") {
          const profile = db.getProfile(userId);
          if (!profile) {
            const response: types.APIResponse = {
              success: false,
              data: null,
              error: { code: "NOT_FOUND", message: "Profile not found" }
            };
            return new Response(JSON.stringify(response), { status: 404, headers });
          }

          const response: types.APIResponse = {
            success: true,
            data: profile,
            error: null
          };
          return new Response(JSON.stringify(response), { status: 200, headers });
        }

        if (req.method === "PUT") {
          const body = (await req.json()) as types.UpdateProfileRequest;
          const profile = db.updateProfile(userId, body);

          const response: types.APIResponse = {
            success: true,
            data: profile,
            error: null
          };
          return new Response(JSON.stringify(response), { status: 200, headers });
        }
      }

      // ═══════════════════════════════════════════════
      // Records API
      // ═══════════════════════════════════════════════
      if (path === "/api/records") {
        if (req.method === "GET") {
          const date = url.searchParams.get("date") || undefined;
          const records = db.getRecords(userId, date);

          const response: types.APIResponse = {
            success: true,
            data: records,
            error: null
          };
          return new Response(JSON.stringify(response), { status: 200, headers });
        }

        if (req.method === "POST") {
          const body = (await req.json()) as types.CreateRecordRequest;
          const record = db.createRecord(userId, body);

          const response: types.APIResponse = {
            success: true,
            data: record,
            error: null
          };
          return new Response(JSON.stringify(response), { status: 201, headers });
        }
      }

      // DELETE /api/records/:id
      if (path.match(/^\/api\/records\/\d+$/) && req.method === "DELETE") {
        const recordId = parseInt(path.split("/")[3], 10);
        const record = db.deleteRecord(recordId, userId);
        const response: types.APIResponse = {
          success: true,
          data: record,
          error: null
        };
        return new Response(JSON.stringify(response), { status: 200, headers });
      }

      // ═══════════════════════════════════════════════
      // Diary API
      // ═══════════════════════════════════════════════
      if (path === "/api/diary") {
        if (req.method === "GET") {
          const entries = db.getDiaryEntries(userId);

          const response: types.APIResponse = {
            success: true,
            data: entries,
            error: null
          };
          return new Response(JSON.stringify(response), { status: 200, headers });
        }

        if (req.method === "POST") {
          const body = (await req.json()) as types.CreateDiaryRequest;
          const entry = db.createDiaryEntry(userId, body);

          const response: types.APIResponse = {
            success: true,
            data: entry,
            error: null
          };
          return new Response(JSON.stringify(response), { status: 201, headers });
        }
      }

      // DELETE /api/diary/:id
      if (path.match(/^\/api\/diary\/\d+$/) && req.method === "DELETE") {
        const entryId = parseInt(path.split("/")[3], 10);
        const entry = db.deleteDiaryEntry(entryId, userId);
        const response: types.APIResponse = {
          success: true,
          data: entry,
          error: null
        };
        return new Response(JSON.stringify(response), { status: 200, headers });
      }

      // ═══════════════════════════════════════════════
      // Milestones API
      // ═══════════════════════════════════════════════
      if (path.startsWith("/api/milestones")) {
        const milestoneId = path.split("/")[3];

        if (path === "/api/milestones/states") {
          if (req.method === "GET") {
            const states = db.getMilestoneStates(userId);

            const response: types.APIResponse = {
              success: true,
              data: states,
              error: null
            };
            return new Response(JSON.stringify(response), { status: 200, headers });
          }
        }

        if (path.startsWith("/api/milestones/states/")) {
          const idParam = path.replace("/api/milestones/states/", "");
          if (req.method === "PUT") {
            const body = await req.json() as { status: "not_started" | "progressing" | "achieved" };
            const state = db.updateMilestoneState(userId, idParam, body.status);

            const response: types.APIResponse = {
              success: true,
              data: state,
              error: null
            };
            return new Response(JSON.stringify(response), { status: 200, headers });
          }
        }
      }

      // ═══════════════════════════════════════════════
      // 404
      // ═══════════════════════════════════════════════
      const response: types.APIResponse = {
        success: false,
        data: null,
        error: { code: "NOT_FOUND", message: "Route not found" }
      };
      return new Response(JSON.stringify(response), { status: 404, headers });
    } catch (error) {
      console.error("Request error:", error);

      const response: types.APIResponse = {
        success: false,
        data: null,
        error: { code: "SERVER_ERROR", message: String(error) }
      };
      return new Response(JSON.stringify(response), { status: 500, headers });
    }
  }
});

console.log(`✅ Bun server listening on http://0.0.0.0:${PORT}`);
console.log(`Database: ${DATABASE_PATH}`);
