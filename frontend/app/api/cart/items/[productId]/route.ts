import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

type RouteContext = { params: Promise<{ productId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { productId } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/cart/items/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      headers: forwardedHeaders(request),
      body: JSON.stringify(await request.json()),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Update cart item", error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { productId } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/cart/items/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: forwardedHeaders(request),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Delete cart item", error);
  }
}
