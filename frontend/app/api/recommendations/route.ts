import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const response = await fetch(`${LARAVEL_API_URL}/recommendations?${url.searchParams.toString()}`, {
      headers: forwardedHeaders(request),
      cache: "no-store",
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Recommendations", error);
  }
}
