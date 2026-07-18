import { NextResponse } from "next/server";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const response = await fetch(`${API_BASE_URL}/products${query ? `?${query}` : ""}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Products proxy error:", error);

    return NextResponse.json(
      { message: "Không kết nối được tới Laravel API." },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const authorization = request.headers.get("authorization");
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Create product proxy error:", error);

    return NextResponse.json(
      { message: "Không kết nối được tới Laravel API." },
      { status: 502 }
    );
  }
}
