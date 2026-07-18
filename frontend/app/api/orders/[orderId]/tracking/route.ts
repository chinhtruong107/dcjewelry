import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/orders/${encodeURIComponent(orderId)}/tracking`, {
      headers: forwardedHeaders(request),
      cache: "no-store",
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Order tracking", error);
  }
}
