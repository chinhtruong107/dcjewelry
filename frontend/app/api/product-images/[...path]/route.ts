const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const imagePath = path.map(encodeURIComponent).join("/");
    const response = await fetch(`${API_BASE_URL}/product-images/${imagePath}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return new Response(null, { status: response.status });
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");

    if (contentType) {
      headers.set("content-type", contentType);
    }

    headers.set("cache-control", "no-cache, no-store, must-revalidate");

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Product image proxy error:", error);

    return new Response(null, { status: 502 });
  }
}
