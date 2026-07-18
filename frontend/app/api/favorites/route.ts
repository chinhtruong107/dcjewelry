import { NextResponse } from "next/server";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

function authHeaders(request: Request) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.Authorization = authorization;
  }

  return headers;
}

export async function GET(request: Request) {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "GET",
      headers: authHeaders(request),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Favorites proxy error:", error);

    return NextResponse.json(
      { message: "Khong ket noi duoc toi Laravel API." },
      { status: 502 }
    );
  }
}
