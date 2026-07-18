import { NextResponse } from "next/server";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

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

async function forwardFavoriteRequest(request: Request, context: RouteContext, method: "POST" | "DELETE") {
  try {
    const { productId } = await context.params;

    const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
      method,
      headers: authHeaders(request),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Favorite item proxy error:", error);

    return NextResponse.json(
      { message: "Khong ket noi duoc toi Laravel API." },
      { status: 502 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  return forwardFavoriteRequest(request, context, "POST");
}

export async function DELETE(request: Request, context: RouteContext) {
  return forwardFavoriteRequest(request, context, "DELETE");
}
