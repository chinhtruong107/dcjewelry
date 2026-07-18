import { LARAVEL_API_URL } from "@/lib/serverApi";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/return-images/${path.map(encodeURIComponent).join("/")}`, {
      cache: "no-store",
    });
    if (!response.ok) return new Response(null, { status: response.status });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "image/jpeg",
        "cache-control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Return image proxy error:", error);
    return new Response(null, { status: 502 });
  }
}
