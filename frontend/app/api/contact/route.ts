import { NextResponse } from "next/server";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${API_BASE_URL}/contact-messages`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Contact proxy error:", error);
    return NextResponse.json(
      { message: "Chưa thể gửi tin nhắn. Vui lòng thử lại hoặc gọi hotline 0389794445." },
      { status: 502 },
    );
  }
}
