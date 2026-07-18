import { NextResponse } from "next/server";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Product reviews proxy error:", error);

    return NextResponse.json(
      { message: "Khong ket noi duoc toi Laravel API." },
      { status: 502 }
    );
  }
}
