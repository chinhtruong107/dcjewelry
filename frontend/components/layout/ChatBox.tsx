"use client";

import { formatVND, productImageUrl } from "@/lib/utils";
import type { Product } from "@/types/product";
import {
  Bot,
  ChevronRight,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type MessageRole = "bot" | "user";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  products?: Product[];
  suggestions?: string[];
}

function createMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const quickPrompts = [
  "Tư vấn chọn dây chuyền",
  "Gợi ý bông tai thanh lịch",
  "Chọn vòng tay làm quà",
  "Gợi ý theo ngân sách",
  "Chính sách bảo hành",
];

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Dây chuyền thanh lịch hằng ngày",
    price: 420000,
    image: "/images/NoImage.jpg",
    category: "Dây chuyền",
    description: "Thiết kế tinh giản, dễ phối, phù hợp sử dụng hằng ngày.",
  },
  {
    id: 2,
    name: "Bông tai dấu ấn hiện đại",
    price: 590000,
    image: "/images/NoImage.jpg",
    category: "Bông tai",
    description: "Đường nét hiện đại dành cho những dịp đáng nhớ.",
  },
  {
    id: 3,
    name: "Vòng tay đồng điệu",
    price: 650000,
    image: "/images/NoImage.jpg",
    category: "Vòng tay",
    description: "Kiểu dáng tinh giản, lưu giữ câu chuyện đẹp trong từng món quà.",
  },
];

const introMessage: ChatMessage = {
  id: "intro",
  role: "bot",
  text:
    "Chào bạn, mình là trợ lý tư vấn của Đức Chính Jewelry. Hãy chia sẻ dịp sử dụng, phong cách hoặc ngân sách, mình sẽ gợi ý thiết kế phù hợp.",
  suggestions: quickPrompts.slice(0, 4),
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function extractBudget(text: string) {
  const normalized = normalizeText(text);
  const underMatch = normalized.match(/(?:duoi|toi da|khoang|tam)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan)?/);
  const plainMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan)/);
  const match = underMatch || plainMatch;

  if (!match) return null;

  const amount = Number(match[1].replace(",", "."));
  const unit = match[2];

  if (!Number.isFinite(amount)) return null;
  if (unit === "trieu" || unit === "tr") return amount * 1000000;
  if (unit === "k" || unit === "nghin" || unit === "ngan") return amount * 1000;

  return amount < 1000 ? amount * 1000000 : amount;
}

function productScore(product: Product, normalizedQuestion: string, budget: number | null) {
  const haystack = normalizeText(
    [product.name, product.category, product.description].filter(Boolean).join(" ")
  );
  let score = 0;

  if (budget && product.price <= budget) score += 4;
  if ((normalizedQuestion.includes("day chuyen") || normalizedQuestion.includes("co")) && haystack.includes("day chuyen")) score += 3;
  if ((normalizedQuestion.includes("bong tai") || normalizedQuestion.includes("khuyen tai")) && haystack.includes("bong tai")) score += 3;
  if ((normalizedQuestion.includes("vong tay") || normalizedQuestion.includes("lac tay")) && /vong tay|lac tay/.test(haystack)) score += 3;
  if ((normalizedQuestion.includes("di lam") || normalizedQuestion.includes("hang ngay")) && /thanh lich|nho|manh|toi gian/.test(haystack)) score += 2;
  if ((normalizedQuestion.includes("ban chay") || normalizedQuestion.includes("dep")) && (product.isBestSeller || product.is_best_seller)) score += 2;

  normalizedQuestion
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .forEach((word) => {
      if (haystack.includes(word)) score += 1;
    });

  return score;
}

function pickProducts(question: string, products: Product[]) {
  const normalizedQuestion = normalizeText(question);
  const budget = extractBudget(question);
  const availableProducts = products.length > 0 ? products : fallbackProducts;

  return [...availableProducts]
    .filter((product) => product.status !== "inactive" && (product.stock ?? 1) > 0)
    .map((product) => ({
      product,
      score: productScore(product, normalizedQuestion, budget),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 3)
    .map(({ product }) => product);
}

function buildBotResponse(question: string, products: Product[]): ChatMessage {
  const normalizedQuestion = normalizeText(question);
  const budget = extractBudget(question);
  const matchedProducts = pickProducts(question, products);
  const suggestions = ["Dây chuyền", "Bông tai", "Vòng tay", "Tìm theo ngân sách"];

  if (/(^|\s)(xin chao|chao|hello|hi|alo|hey)(\s|$)/.test(normalizedQuestion)) {
    return {
      id: createMessageId(),
      role: "bot",
      text:
        "Chào bạn, Đức Chính Jewelry có thể tư vấn theo phong cách, dịp sử dụng và ngân sách. Bạn đang tìm dây chuyền, bông tai, vòng tay hay một món quà đặc biệt?",
      products: matchedProducts.length > 0 ? matchedProducts : fallbackProducts.slice(0, 2),
      suggestions: ["Dây chuyền", "Bông tai", "Vòng tay"],
    };
  }

  if (/(bao hanh|doi tra|van chuyen|ship|giao hang)/.test(normalizedQuestion)) {
    return {
      id: createMessageId(),
      role: "bot",
      text:
        "Đức Chính Jewelry hỗ trợ kiểm tra sản phẩm, xử lý đổi trả theo tình trạng thực tế và giao hàng toàn quốc. Nhân viên sẽ xác nhận thông tin đơn trước khi gửi.",
      suggestions: ["Tư vấn chọn trang sức", "Hỏi về kích thước", "Chính sách giao hàng"],
    };
  }

  if (/(mat tron|mat vuong|mat dai|trai xoan|dang mat|khuon mat|hop mat)/.test(normalizedQuestion)) {
    return {
      id: createMessageId(),
      role: "bot",
      text:
        "Mình sẽ dựa trên phong cách và dịp sử dụng để gợi ý thiết kế hài hòa nhất. Nếu bạn chia sẻ thêm chất liệu yêu thích và ngân sách, lựa chọn sẽ chính xác hơn.",
      products: matchedProducts,
      suggestions: ["Dây chuyền thanh lịch", "Bông tai đi làm", "Vòng tay làm quà"],
    };
  }

  if (/(du tiec|hang ngay|di lam|di choi|ky niem|sinh nhat)/.test(normalizedQuestion)) {
    return {
      id: createMessageId(),
      role: "bot",
      text:
        "Với nhu cầu sử dụng thường xuyên, bạn nên ưu tiên thiết kế tinh giản, dễ phối và thoải mái. Nếu dành cho một dịp đặc biệt, mình có thể gợi ý mẫu nổi bật hơn.",
      products: matchedProducts,
      suggestions: ["Dây chuyền hằng ngày", "Bông tai nổi bật", "Tìm theo ngân sách"],
    };
  }

  if (/(van phong|cong so|toi gian|thanh lich|nhe nhang|de deo)/.test(normalizedQuestion)) {
    return {
      id: createMessageId(),
      role: "bot",
      text:
        "Trang sức dùng hằng ngày nên có đường nét gọn, dễ phối và phù hợp nhịp sống của bạn. Hãy cho mình biết thêm chất liệu hoặc kiểu dáng bạn yêu thích.",
      products: matchedProducts,
      suggestions: ["Thiết kế tinh giản", "Bông tai thanh lịch", "Gợi ý quà tặng"],
    };
  }

  if (budget) {
    return {
      id: createMessageId(),
      role: "bot",
      text: `Với ngân sách khoảng ${formatVND(budget)}, mình sẽ ưu tiên những thiết kế hài hòa về chất liệu, kiểu dáng và giá trị sử dụng. Đây là các lựa chọn phù hợp nhất trong tầm giá này.`,
      products: matchedProducts,
      suggestions: ["Xem thêm lựa chọn", "Dây chuyền", "Bông tai"],
    };
  }

  if (/(gia|re|khuyen mai|ban chay|san pham|mua|tu van|chon|day chuyen|bong tai|vong tay|lac tay)/.test(normalizedQuestion)) {
    return {
      id: createMessageId(),
      role: "bot",
      text:
        "Để chọn nhanh, bạn hãy chia sẻ 3 điều: dịp sử dụng, phong cách mong muốn và ngân sách. Mình có thể gợi ý sản phẩm theo từng tiêu chí đó.",
      products: matchedProducts,
      suggestions,
    };
  }

  return {
    id: createMessageId(),
    role: "bot",
    text:
      "Mình chưa chắc bạn đang cần tư vấn theo tiêu chí nào. Bạn có thể nhắn kiểu: 'tìm dây chuyền làm quà', 'bông tai thanh lịch' hoặc 'vòng tay trong ngân sách 2 triệu'.",
    suggestions: quickPrompts.slice(1),
  };
}

function parseChatApiText(data: unknown) {
  if (typeof data !== "object" || data === null) return "";

  const text = (data as { text?: unknown }).text;
  return typeof text === "string" ? text.trim() : "";
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [inputValue, setInputValue] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visibleProducts = useMemo(
    () => products.filter((product) => product.status !== "inactive" && (product.stock ?? 1) > 0),
    [products]
  );

  useEffect(() => {
    let isMounted = true;

    fetch("/api/products")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Product[]) => {
        if (isMounted && Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(() => {
        if (isMounted) setProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isTyping) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      text: trimmedText,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);
    setInputValue("");
    setIsTyping(true);

    const fallbackResponse = buildBotResponse(trimmedText, visibleProducts);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedText,
          history: messages.slice(-8).map((message) => ({
            role: message.role === "bot" ? "assistant" : "user",
            content: message.text,
          })),
          products: visibleProducts.slice(0, 12).map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            stock: product.stock,
            status: product.status,
          })),
        }),
      });

      const data = await response.json();
      const aiText = response.ok ? parseChatApiText(data) : "";
      const matchedProducts = pickProducts(`${trimmedText} ${aiText}`, visibleProducts);

      if (!aiText) {
        throw new Error("Empty AI response");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "bot",
          text: aiText,
          products: matchedProducts.length > 0 ? matchedProducts : fallbackResponse.products,
          suggestions: fallbackResponse.suggestions,
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        fallbackResponse,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label="Chatbot tư vấn Đức Chính Jewelry"
          className="mb-3 flex h-[34rem] max-h-[calc(100vh-7rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:mb-4"
        >
          <div className="border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-tight">Đức Chính Concierge</h3>
                  <p className="mt-1 text-xs leading-snug text-primary-foreground/80">
                    Tư vấn trang sức riêng tư
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70"
                  aria-label="Thu nhỏ chatbot"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([introMessage]);
                    setInputValue("");
                    setIsOpen(false);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70"
                  aria-label="Đóng chatbot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-muted/30 px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "bot" ? "justify-start" : "justify-end"}`}
              >
                {message.role === "bot" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2 ${message.role === "user" ? "items-end" : ""}`}>
                  <div
                    className={`whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      message.role === "bot"
                        ? "rounded-bl-md border border-border bg-card text-card-foreground"
                        : "rounded-br-md bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.products && message.products.length > 0 && (
                    <div className="space-y-2">
                      {message.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="flex gap-3 rounded-xl border border-border bg-card p-2 text-left shadow-sm transition-colors hover:border-primary/60 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={productImageUrl(product.image)}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs font-semibold text-foreground">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs font-bold text-primary">
                              {formatVND(product.price)}
                            </p>
                          </div>
                          <ChevronRight className="mt-4 h-4 w-4 shrink-0 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => sendMessage(suggestion)}
                          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  <span className="mx-1 h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border bg-card p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <label htmlFor="chatbox-message" className="sr-only">
                Nhập tin nhắn cần tư vấn
              </label>
              <input
                id="chatbox-message"
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Bạn đang tìm thiết kế nào?"
                className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      {!isOpen && (
        <div className="group flex items-center gap-3">
          <div className="hidden rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-lg sm:block">
            Cần tư vấn trang sức?
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Mở chatbot tư vấn"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          </button>
        </div>
      )}
    </div>
  );
}
