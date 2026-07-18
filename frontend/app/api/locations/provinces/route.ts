import { NextResponse } from "next/server";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/provinces`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Locations provinces proxy error:", error);

    return NextResponse.json(
      { message: "Khong ket noi duoc toi Laravel API." },
      { status: 502 }
    );
  }
}
