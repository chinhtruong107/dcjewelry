import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function GET(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/orders`, {
      headers: forwardedHeaders(request),
      cache: "no-store",
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Orders", error);
  }
}

export async function POST(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/orders`, {
      method: "POST",
      headers: forwardedHeaders(request),
      body: await request.text(),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Create order", error);
  }
}
