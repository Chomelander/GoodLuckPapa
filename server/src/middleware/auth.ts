import * as types from "../types";

// 简单的 JWT 签名实现（Bun 内置）
export async function signJWT(payload: types.JWTPayload, secret: string): Promise<string> {
  // 编码 header + payload + 签名
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadStr = btoa(JSON.stringify(payload));

  const data = `${header}.${payloadStr}`;

  // HMAC-SHA256 签名
  const secretBytes = new TextEncoder().encode(secret);
  const messageBytes = new TextEncoder().encode(data);
  const signature = await crypto.subtle.sign("HMAC",
    await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    messageBytes
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${signatureB64}`;
}

// 验证 JWT
export async function verifyJWT(token: string, secret: string): Promise<types.JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // 验证签名
    const secretBytes = new TextEncoder().encode(secret);
    const messageBytes = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signatureBytes = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]),
      signatureBytes,
      messageBytes
    );

    if (!isValid) return null;

    // 解析 payload
    const payload = JSON.parse(atob(payloadB64)) as types.JWTPayload;

    // 检查过期时间
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

// 中间件：检查并提取 JWT
export async function authMiddleware(
  req: Request,
  secret: string
): Promise<{ valid: boolean; payload?: types.JWTPayload; error?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, secret);

  if (!payload) {
    return { valid: false, error: "Invalid or expired token" };
  }

  return { valid: true, payload };
}
