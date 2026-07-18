import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/product-views`, {
      method: "POST",
      headers: forwardedHeaders(request),
      body: JSON.stringify(await request.json()),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Product view", error);
  }
}
