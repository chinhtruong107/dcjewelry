import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function PATCH(request: Request, { params }: { params: Promise<{ returnRequestId: string }> }) {
  try {
    const { returnRequestId } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/admin/return-requests/${encodeURIComponent(returnRequestId)}`, {
      method: "PATCH",
      headers: forwardedHeaders(request),
      body: JSON.stringify(await request.json()),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Update return request", error);
  }
}
