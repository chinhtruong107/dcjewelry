import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/admin/orders/${encodeURIComponent(orderId)}/shipment`, {
      method: "POST",
      headers: forwardedHeaders(request),
      body: JSON.stringify(await request.json()),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Create shipment", error);
  }
}
