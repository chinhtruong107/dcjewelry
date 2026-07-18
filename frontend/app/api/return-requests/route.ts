import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function GET(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/return-requests`, {
      headers: forwardedHeaders(request),
      cache: "no-store",
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Return requests", error);
  }
}

export async function POST(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/return-requests`, {
      method: "POST",
      headers: forwardedHeaders(request, false),
      body: await request.formData(),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Create return request", error);
  }
}
