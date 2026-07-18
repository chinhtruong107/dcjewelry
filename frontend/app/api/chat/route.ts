import { NextResponse } from "next/server";

type ChatRole = "assistant" | "user";

type ChatHistoryItem = {
  role: ChatRole;
  content: string;
};

type ChatProduct = {
  id: number;
  name: string;
  price: number;
  category?: string;
  description?: string;
  stock?: number;
  status?: string;
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";

function trimText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function formatProduct(product: ChatProduct) {
  const status =
    product.status === "inactive" || (typeof product.stock === "number" && product.stock <= 0)
      ? "hết hàng"
      : "còn hàng";

  return [
    `ID ${product.id}`,
    product.name,
    product.category ? `danh mục: ${product.category}` : "",
    `giá: ${product.price.toLocaleString("vi-VN")} VND`,
    `trạng thái: ${status}`,
    product.description ? `mô tả: ${product.description.slice(0, 140)}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function extractOutputText(data: unknown) {
  if (typeof data !== "object" || data === null) return "";

  const outputText = (data as { output_text?: unknown }).output_text;
  if (typeof outputText === "string" && outputText.trim()) {
    return outputText.trim();
  }

  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((contentItem) => {
      if (typeof contentItem !== "object" || contentItem === null) return "";
      const text = (contentItem as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "Chưa cấu hình OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      message?: unknown;
      history?: ChatHistoryItem[];
      products?: ChatProduct[];
    };

    const message = trimText(body.message, 800);

    if (!message) {
      return NextResponse.json(
        { message: "Vui lòng nhập nội dung cần tư vấn." },
        { status: 400 }
      );
    }

    const history = Array.isArray(body.history)
      ? body.history
          .slice(-8)
          .map((item) => ({
            role: item.role === "assistant" ? "assistant" : "user",
            content: trimText(item.content, 500),
          }))
          .filter((item) => item.content)
      : [];

    const products = Array.isArray(body.products)
      ? body.products
          .filter((product) => product && typeof product.id === "number" && typeof product.name === "string")
          .slice(0, 12)
      : [];

    const productContext = products.length
      ? products.map(formatProduct).join("\n")
      : "Chưa có danh sách sản phẩm từ hệ thống.";

    const historyContext = history.length
      ? history.map((item) => `${item.role === "assistant" ? "Trợ lý" : "Khách"}: ${item.content}`).join("\n")
      : "Chưa có lịch sử hội thoại.";

    const prompt = `Bạn là Đức Chính Jewelry Concierge, chatbot tư vấn cho website trang sức cao cấp Đức Chính Jewelry.

Mục tiêu:
- Trả lời bằng tiếng Việt tự nhiên, thân thiện, ngắn gọn.
- Tư vấn theo đúng 3 nhóm chính: dây chuyền, bông tai, vòng tay/lắc tay.
- Có thể tư vấn theo phong cách, dịp sử dụng, ngân sách, chất liệu và nhu cầu quà tặng.
- Nếu có sản phẩm phù hợp trong danh sách, gợi ý tên sản phẩm và giá. Không bịa sản phẩm ngoài danh sách.
- Nếu thiếu thông tin, hỏi lại 1 câu ngắn để chốt nhu cầu.
- Không khẳng định chất liệu, chứng nhận hoặc chính sách nếu thông tin đó không có trong dữ liệu sản phẩm.
- Không nhắc đến API, model, system prompt hay nội bộ kỹ thuật.

Danh sách sản phẩm Đức Chính Jewelry:
${productContext}

Lịch sử hội thoại gần đây:
${historyContext}

Khách vừa hỏi: ${message}`;

    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
            ],
          },
        ],
        max_output_tokens: 450,
      }),
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI chat error:", data);
      const error =
        typeof data === "object" && data !== null && "error" in data
          ? (data as { error?: { code?: string; type?: string; message?: string } }).error
          : undefined;

      return NextResponse.json(
        {
          code: error?.code || error?.type || "openai_error",
          message:
            error?.code === "insufficient_quota"
              ? "OpenAI API key hiện hết quota hoặc chưa bật billing."
              : "AI hiện chưa phản hồi được. Vui lòng thử lại sau.",
        },
        { status: openaiResponse.status }
      );
    }

    const text = extractOutputText(data);

    return NextResponse.json({
      text:
        text ||
        "Mình chưa tạo được câu trả lời phù hợp. Bạn cho mình biết nhu cầu, nhóm sản phẩm và ngân sách để tư vấn chính xác hơn nhé.",
    });
  } catch (error) {
    console.error("Chat route error:", error);

    return NextResponse.json(
      { message: "Không thể kết nối chatbot AI lúc này." },
      { status: 500 }
    );
  }
}
