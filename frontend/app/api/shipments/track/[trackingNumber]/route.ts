import { LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function GET(_request: Request, { params }: { params: Promise<{ trackingNumber: string }> }) {
  try {
    const { trackingNumber } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/shipments/track/${encodeURIComponent(trackingNumber)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Shipment tracking", error);
  }
}
