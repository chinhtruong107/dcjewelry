"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type React from "react";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Shield,
} from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : data.message;
        throw new Error(validationMessage || "Chưa thể gửi tin nhắn.");
      }

      setIsSubmitted(true);
      setSubmitMessage(
        `${data.message}${data.reference ? ` Mã yêu cầu: ${data.reference}.` : ""}`,
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setIsSubmitted(false);
      setSubmitError(error instanceof Error ? error.message : "Chưa thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: ["hello@ducchinhjewelry.vn", "support@ducchinhjewelry.vn"],
      description: "Gửi yêu cầu tư vấn trang sức hoặc hỗ trợ đơn hàng.",
    },
    {
      icon: Phone,
      title: "Hotline",
      details: ["0389794445"],
      description: "Thứ Hai - Thứ Bảy, từ 9:00 đến 20:00.",
    },
    {
      icon: MapPin,
      title: "Boutique",
      details: ["Hà Nội"],
      description: "Hẹn lịch trước để được tư vấn và trải nghiệm trang sức riêng tư.",
    },
    {
      icon: Clock,
      title: "Thời gian phản hồi",
      details: ["Trong vòng 2 giờ làm việc"],
      description: "Chủ Nhật vẫn tiếp nhận tin nhắn trực tuyến.",
    },
  ];

  const features = [
    {
      icon: Headphones,
      title: "Tư vấn theo phong cách",
      description: "Gợi ý thiết kế dựa trên phong cách, dịp dùng và ngân sách.",
    },
    {
      icon: MessageSquare,
      title: "Phản hồi nhanh",
      description: "Đội ngũ hỗ trợ sẽ liên hệ lại sớm nhất có thể.",
    },
    {
      icon: Shield,
      title: "Thông tin riêng tư",
      description: "Dữ liệu liên hệ chỉ dùng cho mục đích chăm sóc khách hàng.",
    },
  ];

  const faqs = [
    {
      question: "Đức Chính Jewelry cam kết chất lượng thế nào?",
      answer:
        "Mỗi sản phẩm đều được kiểm tra kỹ tình trạng, chất liệu và thông tin trước khi giao đến khách hàng.",
    },
    {
      question: "Đơn hàng được giao trong bao lâu?",
      answer:
        "Nội thành thường từ 1-2 ngày làm việc. Các tỉnh thành khác tùy đơn vị vận chuyển và địa chỉ nhận hàng.",
    },
    {
      question: "Tôi có thể nhờ tư vấn chọn trang sức không?",
      answer:
        "Có. Bạn chỉ cần chia sẻ phong cách, dịp sử dụng và khoảng giá, đội ngũ sẽ gợi ý lựa chọn phù hợp.",
    },
    {
      question: "Sản phẩm có được đổi trả không?",
      answer:
        "Cửa hàng hỗ trợ xử lý khi sản phẩm gặp lỗi vận chuyển hoặc sai thông tin đơn hàng. Vui lòng liên hệ sớm khi nhận hàng.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070607] text-[#f7efe1]">
      <div className="mx-auto max-w-[1500px] border-x border-[#d6bd7a]/18 bg-[linear-gradient(180deg,#0b0908_0%,#120e0c_48%,#070607_100%)] px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
        <section className="border-b border-[#d6bd7a]/20 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d6bd7a]">Contact boutique</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl font-light leading-tight text-[#f7efe1] sm:text-5xl lg:text-6xl">
                Liên hệ Đức Chính Jewelry
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#cfc4ad]/78 sm:text-base">
                Cần chọn một thiết kế, kiểm tra đơn hàng hoặc đặt lịch tư vấn? Gửi tin nhắn cho chúng tôi, đội ngũ sẽ phản hồi bằng sự chỉn chu của một boutique trang sức cao cấp.
              </p>
            </div>
            <div className="border border-[#d6bd7a]/24 bg-black/24 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d6bd7a]">Response time</p>
              <p className="mt-3 font-serif text-3xl text-[#f7efe1]">2 giờ</p>
              <p className="mt-1 text-sm leading-6 text-[#cfc4ad]/72">thời gian phản hồi trung bình trong giờ làm việc</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-16">
          <div className="luxury-panel p-5 sm:p-7">
            <div className="mb-7 border-b border-[#d6bd7a]/18 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d6bd7a]">Send a message</p>
              <h2 className="mt-3 font-serif text-3xl text-[#f7efe1]">Gửi tin nhắn cho chúng tôi</h2>
              <p className="mt-3 text-sm leading-7 text-[#cfc4ad]/75">
                Điền thông tin bên dưới để Đức Chính Jewelry tư vấn hoặc hỗ trợ bạn sớm nhất.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tên của bạn" htmlFor="name">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="rounded-none border-[#d6bd7a]/28 bg-black/28 text-[#f7efe1] placeholder:text-[#cfc4ad]/48 focus-visible:border-[#d6bd7a]/70 focus-visible:ring-[#d6bd7a]/20"
                  />
                </Field>

                <Field label="Email của bạn" htmlFor="email">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ban@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="rounded-none border-[#d6bd7a]/28 bg-black/28 text-[#f7efe1] placeholder:text-[#cfc4ad]/48 focus-visible:border-[#d6bd7a]/70 focus-visible:ring-[#d6bd7a]/20"
                  />
                </Field>
              </div>

              <Field label="Chủ đề" htmlFor="subject">
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Bạn cần Đức Chính Jewelry hỗ trợ điều gì?"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="rounded-none border-[#d6bd7a]/28 bg-black/28 text-[#f7efe1] placeholder:text-[#cfc4ad]/48 focus-visible:border-[#d6bd7a]/70 focus-visible:ring-[#d6bd7a]/20"
                />
              </Field>

              <Field label="Tin nhắn" htmlFor="message">
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Hãy cho chúng tôi biết thêm về nhu cầu, phong cách bạn thích hoặc vấn đề đơn hàng..."
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="resize-none rounded-none border-[#d6bd7a]/28 bg-black/28 text-[#f7efe1] placeholder:text-[#cfc4ad]/48 focus-visible:border-[#d6bd7a]/70 focus-visible:ring-[#d6bd7a]/20"
                />
              </Field>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || isSubmitted}
                className="luxury-button h-12 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang gửi...
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Đã gửi tin nhắn
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Gửi tin nhắn
                  </>
                )}
              </Button>

              {submitMessage && (
                <div role="status" className="flex items-start gap-3 border border-emerald-400/30 bg-emerald-950/28 p-4 text-sm leading-6 text-emerald-100">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p>{submitMessage}</p>
                </div>
              )}

              {submitError && (
                <div role="alert" className="flex items-start gap-3 border border-red-400/30 bg-red-950/28 p-4 text-sm leading-6 text-red-100">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                  <p>{submitError}</p>
                </div>
              )}
            </form>
          </div>

          <div className="space-y-6">
            <div className="luxury-panel p-5 sm:p-6">
              <h2 className="font-serif text-2xl text-[#f7efe1]">Thông tin liên hệ</h2>
              <div className="mt-6 space-y-5">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-4 border-b border-[#d6bd7a]/12 pb-5 last:border-b-0 last:pb-0">
                    <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#d6bd7a]/24 bg-black/30 text-[#d6bd7a]">
                      <info.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#f7efe1]">{info.title}</h3>
                      {info.details.map((detail) => (
                        <p key={detail} className="mt-1 text-sm text-[#cfc4ad]/82">{detail}</p>
                      ))}
                      <p className="mt-2 text-xs leading-5 text-[#cfc4ad]/62">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="luxury-panel p-5 sm:p-6">
              <h2 className="font-serif text-2xl text-[#f7efe1]">Vì sao nên liên hệ?</h2>
              <div className="mt-5 space-y-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-[#d6bd7a]/20 text-[#d6bd7a]">
                      <feature.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#f7efe1]">{feature.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#cfc4ad]/68">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#d6bd7a]/18 py-12 lg:py-16">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d6bd7a]">FAQ</p>
            <h2 className="mt-3 font-serif text-3xl text-[#f7efe1] sm:text-4xl">Câu hỏi thường gặp</h2>
            <p className="mt-3 text-sm leading-7 text-[#cfc4ad]/75">
              Một vài thông tin nhanh trước khi bạn gửi yêu cầu tư vấn hoặc đặt hàng.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="border border-[#d6bd7a]/20 bg-[#0d0b0a] p-6 transition hover:border-[#d6bd7a]/48">
                <h3 className="font-semibold text-[#f7efe1]">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#cfc4ad]/72">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-[#d6bd7a]/24 bg-black/24 p-6 text-center sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d6bd7a]">Need quick help</p>
          <h2 className="mt-3 font-serif text-3xl text-[#f7efe1] sm:text-4xl">Vẫn còn thắc mắc?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#cfc4ad]/75">
            Gọi trực tiếp hoặc gửi tin nhắn, chúng tôi sẽ hỗ trợ bạn chọn thiết kế và xử lý thông tin đơn hàng nhanh nhất có thể.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a href="tel:0389794445" className="luxury-button inline-flex items-center justify-center gap-2 px-6 py-3">
              <Phone className="h-4 w-4" />
              Gọi ngay
            </a>
            <a href="mailto:hello@ducchinhjewelry.vn" className="luxury-button-outline inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold">
              <Mail className="h-4 w-4" />
              Gửi email
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#f7efe1]">
        {label}
      </label>
      {children}
    </div>
  );
}
