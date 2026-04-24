import * as types from "../types";
import { signJWT } from "../middleware/auth";
import * as db from "../db";

export async function handleAuthPIN(
  req: Request,
  jwtSecret: string,
  accessPin: string
): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: { code: "METHOD_NOT_ALLOWED", message: "Only POST is allowed" }
      } as types.APIResponse),
      { status: 405 }
    );
  }

  try {
    const body = (await req.json()) as types.AuthPINRequest;

    if (!body.pin) {
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: "MISSING_PIN", message: "PIN code is required" }
        } as types.APIResponse),
        { status: 400 }
      );
    }

    // 验证 PIN 码
    if (body.pin !== accessPin) {
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: "INVALID_PIN", message: "PIN code is incorrect" }
        } as types.APIResponse),
        { status: 401 }
      );
    }

    // 生成 JWT（固定 user_id = 1）
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    const payload: types.JWTPayload = {
      sub: 1,
      pin: body.pin,
      iat: Date.now(),
      exp: Date.now() + expiresIn
    };

    const token = await signJWT(payload, jwtSecret);

    const response: types.APIResponse<types.AuthPINResponse> = {
      success: true,
      data: {
        token,
        exp: payload.exp
      },
      error: null
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: { code: "SERVER_ERROR", message: String(error) }
      } as types.APIResponse),
      { status: 500 }
    );
  }
}
