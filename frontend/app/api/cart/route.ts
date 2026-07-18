import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function GET(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/cart`, {
      headers: forwardedHeaders(request),
      cache: "no-store",
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Cart", error);
  }
}

export async function DELETE(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/cart`, {
      method: "DELETE",
      headers: forwardedHeaders(request),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Clear cart", error);
  }
}
