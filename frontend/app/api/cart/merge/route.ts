import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/cart/merge`, {
      method: "POST",
      headers: forwardedHeaders(request),
      body: JSON.stringify(await request.json()),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Merge cart", error);
  }
}
