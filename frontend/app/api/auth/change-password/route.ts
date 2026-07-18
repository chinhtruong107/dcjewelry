import { NextResponse } from "next/server";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Change password proxy error:", error);

    return NextResponse.json(
      { message: "Không kết nối được tới Laravel API. Hãy kiểm tra backend đang chạy ở port 8002." },
      { status: 502 }
    );
  }
}
