import { LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function GET(_request: Request, { params }: { params: Promise<{ certificateCode: string }> }) {
  try {
    const { certificateCode } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/certificates/${encodeURIComponent(certificateCode)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Certificate", error);
  }
}
