import { NextResponse } from "next/server";

export const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

export function forwardedHeaders(request: Request, json = true): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const authorization = request.headers.get("authorization");
  const cartToken = request.headers.get("x-cart-token");

  if (json) headers["Content-Type"] = "application/json";
  if (authorization) headers.Authorization = authorization;
  if (cartToken) headers["X-Cart-Token"] = cartToken;

  return headers;
}

export async function proxyJson(response: Response) {
  const text = await response.text();
  let data: unknown = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  return NextResponse.json(data, { status: response.status });
}

export function proxyFailure(label: string, error: unknown) {
  console.error(`${label} proxy error:`, error);

  return NextResponse.json(
    { message: "Không kết nối được tới Laravel API." },
    { status: 502 }
  );
}
