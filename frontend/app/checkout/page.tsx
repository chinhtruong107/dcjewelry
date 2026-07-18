"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  buildFullAddress,
  fetchProvinces,
  fetchWards,
  findProvince,
  findWard,
  type ProvinceOption,
  type WardOption,
} from "@/lib/locations";
import { fixVietnameseText, formatVND, productImageUrl } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CreditCard,
  Landmark,
  ShoppingBag,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PaymentMethod = "cod" | "vnpay";

type CheckoutAddressBlockProps = {
  address: string;
  provinceCode: string;
  wardCode: string;
  provinces: ProvinceOption[];
  wards: WardOption[];
  required?: boolean;
  detailLabel: string;
  onAddressChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onWardChange: (value: string) => void;
};

const fieldClass =
  "h-12 rounded-none border-[#28171a]/16 bg-[#fffdf9] text-[#28171a] placeholder:text-[#756568]/55 focus-visible:ring-[#7a2130]/20";

const paymentOptions: {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "cod",
    title: "Thanh toán khi nhận hàng",
    description: "Thanh toán bằng tiền mặt khi đơn hàng được giao tới bạn.",
    icon: Wallet,
  },
  {
    id: "vnpay",
    title: "VNPay",
    description: "Thanh toán online qua cổng VNPay bằng thẻ ATM, thẻ quốc tế hoặc mã QR.",
    icon: Landmark,
  },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7a2130]">{children}</label>;
}

function CheckoutAddressBlock({
  address,
  provinceCode,
  wardCode,
  provinces,
  wards,
  required = true,
  detailLabel,
  onAddressChange,
  onProvinceChange,
  onWardChange,
}: CheckoutAddressBlockProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FieldLabel>{detailLabel}</FieldLabel>
        <Input
          required={required}
          className={fieldClass}
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          placeholder="Số nhà, tên đường"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Tỉnh/Thành phố</FieldLabel>
          <Select value={provinceCode} onValueChange={onProvinceChange}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Chọn tỉnh/thành" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code}>
                  {province.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel>Phường/Xã</FieldLabel>
          <Select value={wardCode} onValueChange={onWardChange} disabled={!provinceCode}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder={provinceCode ? "Chọn phường/xã" : "Chọn tỉnh trước"} />
            </SelectTrigger>
            <SelectContent>
              {wards.map((ward) => (
                <SelectItem key={ward.code} value={ward.code}>
                  {ward.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, clearCart, guestToken } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    province_code: "",
    ward_code: "",
  });
  const [recipientData, setRecipientData] = useState({
    name: "",
    phone: "",
    address: "",
    province_code: "",
    ward_code: "",
  });
  const [isDifferentRecipient, setIsDifferentRecipient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCartReady, setIsCartReady] = useState(false);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [customerWards, setCustomerWards] = useState<WardOption[]>([]);
  const [recipientWards, setRecipientWards] = useState<WardOption[]>([]);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address_detail || user.address || "",
      province_code: user.province_code || "",
      ward_code: user.ward_code || "",
    }));
  }, [user]);

  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch((error) => setLocationError(error instanceof Error ? error.message : "Không thể tải tỉnh/thành."));
  }, []);

  useEffect(() => {
    if (!formData.province_code) {
      setCustomerWards([]);
      return;
    }

    fetchWards(formData.province_code)
      .then((wards) => {
        setCustomerWards(wards);
        setFormData((current) =>
          current.ward_code && !wards.some((ward) => ward.code === current.ward_code)
            ? { ...current, ward_code: "" }
            : current
        );
      })
      .catch((error) => setLocationError(error instanceof Error ? error.message : "Không thể tải phường/xã."));
  }, [formData.province_code]);

  useEffect(() => {
    if (!recipientData.province_code) {
      setRecipientWards([]);
      return;
    }

    fetchWards(recipientData.province_code)
      .then((wards) => {
        setRecipientWards(wards);
        setRecipientData((current) =>
          current.ward_code && !wards.some((ward) => ward.code === current.ward_code)
            ? { ...current, ward_code: "" }
            : current
        );
      })
      .catch((error) => setLocationError(error instanceof Error ? error.message : "Không thể tải phường/xã."));
  }, [recipientData.province_code]);

  useEffect(() => {
    setIsCartReady(true);
  }, []);

  useEffect(() => {
    if (isCartReady && cart.length === 0 && !isSuccess) {
      router.push("/cart");
    }
  }, [cart.length, isCartReady, isSuccess, router]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const tax = Math.round(subtotal * 0.08);
  const discount = user ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + shipping + tax - discount;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRecipientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    if (!paymentMethod) {
      setIsPaymentModalOpen(true);
      return;
    }

    const customerProvince = findProvince(provinces, formData.province_code);
    const customerWard = findWard(customerWards, formData.ward_code);

    if (!customerProvince || !customerWard) {
      setSubmitError("Vui lòng chọn đầy đủ tỉnh/thành và phường/xã giao hàng.");
      return;
    }

    const recipientProvince = isDifferentRecipient ? findProvince(provinces, recipientData.province_code) : null;
    const recipientWard = isDifferentRecipient ? findWard(recipientWards, recipientData.ward_code) : null;

    if (isDifferentRecipient && (!recipientProvince || !recipientWard)) {
      setSubmitError("Vui lòng chọn đầy đủ tỉnh/thành và phường/xã của người nhận.");
      return;
    }

    setIsSubmitting(true);

    try {
      const customerAddress = buildFullAddress(formData.address, customerWard, customerProvince);
      const recipientAddress =
        isDifferentRecipient && recipientProvince && recipientWard
          ? buildFullAddress(recipientData.address, recipientWard, recipientProvince)
          : "";

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(guestToken ? { "X-Cart-Token": guestToken } : {}),
        },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: customerAddress,
            address_detail: formData.address,
            province_code: customerProvince.code,
            ward_code: customerWard.code,
          },
          recipient: isDifferentRecipient
            ? {
                name: recipientData.name,
                phone: recipientData.phone,
                address: recipientAddress,
                address_detail: recipientData.address,
                province_code: recipientProvince?.code,
                ward_code: recipientWard?.code,
              }
            : undefined,
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
        return;
      }

      if (paymentMethod === "vnpay") {
        if (!data.payment_url) {
          setSubmitError("Chưa tạo được liên kết thanh toán VNPay. Vui lòng thử lại.");
          return;
        }

        localStorage.setItem(STORAGE_KEYS.pendingVnpayOrder, data.order_number || "");
        window.location.href = data.payment_url;
        return;
      }

      setOrderNumber(data.order_number || "");
      setIsSuccess(true);
      clearCart();

      setTimeout(() => {
        router.push("/");
      }, 4000);
    } catch {
      setSubmitError("Không kết nối được tới máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#f5f0e7] px-6 py-24 text-[#28171a]">
        <section className="mx-auto max-w-xl border-y border-[#28171a]/12 py-14 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center border border-[#7a2130]/24 bg-[#7a2130]/8 text-[#7a2130]">
            <Check className="h-10 w-10" />
          </div>
          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.32em] text-[#7a2130]">Đặt hàng thành công</p>
          <h1 className="mt-4 font-serif text-5xl font-normal tracking-[-0.04em] text-[#28171a]">
            Cảm ơn bạn đã mua sắm
          </h1>
          <p className="mt-5 text-sm leading-7 text-[#756568]">
            Đơn hàng của bạn đang được xử lý và hệ thống sẽ tự động quay về trang chủ.
          </p>
          {orderNumber && (
            <p className="mt-6 border border-[#7a2130]/18 bg-[#fffdf9] px-4 py-3 text-sm font-semibold text-[#7a2130]">
              Mã đơn hàng: {orderNumber}
            </p>
          )}
          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center justify-center border border-[#7a2130] bg-[#7a2130] px-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#fffaf2] transition hover:bg-[#55131e]"
          >
            Tiếp tục mua sắm
          </Link>
        </section>
      </main>
    );
  }

  if (!isCartReady || cart.length === 0) return null;

  return (
    <>
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#28171a]/55 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-required-title"
            className="w-full max-w-md border border-[#28171a]/12 bg-[#fffdf9] p-6 shadow-[0_24px_80px_rgba(55,28,33,0.18)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-[#7a2130]/20 bg-[#7a2130]/8 text-[#7a2130]">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div>
                  <h2 id="payment-required-title" className="font-serif text-2xl font-normal text-[#28171a]">
                    Chưa chọn phương thức thanh toán
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[#756568]">
                    Vui lòng chọn COD hoặc VNPay trong phần tóm tắt đơn hàng trước khi xác nhận.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="grid h-9 w-9 place-items-center text-[#756568] transition hover:bg-[#7a2130] hover:text-white"
                aria-label="Đóng thông báo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="mt-6 h-11 w-full border border-[#7a2130] bg-[#7a2130] text-[10px] font-bold uppercase tracking-[0.22em] text-[#fffaf2] transition hover:bg-[#55131e]"
            >
              Chọn phương thức
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-[#f5f0e7] text-[#28171a]">
        <div className="mx-auto max-w-[1600px] px-6 pb-24 pt-8 sm:px-10 lg:px-16 xl:px-24">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#756568] transition hover:text-[#7a2130]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại giỏ hàng
          </Link>

          <header className="mt-8 border-b border-[#28171a]/12 pb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#7a2130]">Secure checkout</p>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <h1 className="font-serif text-5xl font-normal tracking-[-0.04em] text-[#28171a] sm:text-6xl lg:text-7xl">
                Thanh toán
              </h1>
              <p className="max-w-xl text-sm leading-7 text-[#756568]">
                Hoàn tất thông tin giao hàng, chọn phương thức thanh toán và xác nhận đơn hàng Đức Chính Jewelry.
              </p>
            </div>
          </header>

          <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_480px]">
            <section className="border border-[#28171a]/12 bg-[#fffdf9] p-5 shadow-[0_24px_80px_rgba(55,28,33,0.08)] sm:p-7 lg:p-9">
              <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#28171a]/12 pb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#7a2130]">01</p>
                  <h2 className="mt-2 font-serif text-4xl font-normal tracking-[-0.03em] text-[#28171a]">
                    Thông tin giao hàng
                  </h2>
                </div>
              </div>

              {!user && (
                <div className="mb-8 flex flex-col gap-4 border border-[#28171a]/12 bg-[#f5f0e7] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#28171a]">Bạn đã có tài khoản?</p>
                    <p className="mt-1 text-sm text-[#756568]">Đăng nhập để nhận ưu đãi giảm 5%.</p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center border border-[#7a2130] px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2130] transition hover:bg-[#7a2130] hover:text-[#fffaf2]"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel>Họ và tên</FieldLabel>
                    <Input
                      required
                      className={fieldClass}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Số điện thoại</FieldLabel>
                    <Input
                      required
                      className={fieldClass}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0901234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    required
                    className={fieldClass}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nguyenvana@example.com"
                  />
                </div>

                {!isDifferentRecipient && (
                  <CheckoutAddressBlock
                    address={formData.address}
                    provinceCode={formData.province_code}
                    wardCode={formData.ward_code}
                    provinces={provinces}
                    wards={customerWards}
                    required={!isDifferentRecipient}
                    detailLabel="Địa chỉ cá nhân"
                    onAddressChange={(value) => setFormData((current) => ({ ...current, address: value }))}
                    onProvinceChange={(value) =>
                      setFormData((current) => ({ ...current, province_code: value, ward_code: "" }))
                    }
                    onWardChange={(value) => setFormData((current) => ({ ...current, ward_code: value }))}
                  />
                )}

                <div className="border-t border-[#28171a]/12 pt-6">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#28171a]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#7a2130]"
                      checked={isDifferentRecipient}
                      onChange={(event) => setIsDifferentRecipient(event.target.checked)}
                    />
                    Giao hàng cho người nhận khác
                  </label>

                  {isDifferentRecipient && (
                    <div className="mt-5 space-y-5 border border-[#28171a]/12 bg-[#f5f0e7] p-4 sm:p-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <FieldLabel>Tên người nhận</FieldLabel>
                          <Input
                            required={isDifferentRecipient}
                            className={fieldClass}
                            name="name"
                            value={recipientData.name}
                            onChange={handleRecipientChange}
                            placeholder="Tên người nhận"
                          />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel>SĐT người nhận</FieldLabel>
                          <Input
                            required={isDifferentRecipient}
                            className={fieldClass}
                            name="phone"
                            value={recipientData.phone}
                            onChange={handleRecipientChange}
                            placeholder="Số điện thoại"
                          />
                        </div>
                      </div>

                      <CheckoutAddressBlock
                        address={recipientData.address}
                        provinceCode={recipientData.province_code}
                        wardCode={recipientData.ward_code}
                        provinces={provinces}
                        wards={recipientWards}
                        required={isDifferentRecipient}
                        detailLabel="Địa chỉ giao hàng"
                        onAddressChange={(value) => setRecipientData((current) => ({ ...current, address: value }))}
                        onProvinceChange={(value) =>
                          setRecipientData((current) => ({ ...current, province_code: value, ward_code: "" }))
                        }
                        onWardChange={(value) => setRecipientData((current) => ({ ...current, ward_code: value }))}
                      />
                    </div>
                  )}
                </div>
              </form>

              {locationError && (
                <p className="mt-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  {locationError}
                </p>
              )}
              {submitError && (
                <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {submitError}
                </p>
              )}
            </section>

            <aside className="h-fit border border-[#28171a]/12 bg-[#fffdf9] p-5 shadow-[0_24px_80px_rgba(55,28,33,0.08)] lg:sticky lg:top-28">
              <div className="border-b border-[#28171a]/12 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#7a2130]">02</p>
                <h2 className="mt-2 flex items-center gap-2 font-serif text-3xl font-normal text-[#28171a]">
                  <ShoppingBag className="h-5 w-5 text-[#7a2130]" />
                  Tóm tắt đơn hàng
                </h2>
                <p className="mt-2 text-sm text-[#756568]">{itemCount} sản phẩm trong giỏ hàng.</p>
              </div>

              <div className="mt-5 max-h-64 space-y-4 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden bg-[#ede5d9]">
                      <Image
                        src={productImageUrl(item.image)}
                        alt={fixVietnameseText(item.name)}
                        fill
                        className="object-cover mix-blend-multiply"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#28171a]">{fixVietnameseText(item.name)}</h3>
                      <p className="mt-1 text-xs text-[#756568]">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="text-right text-sm font-semibold text-[#28171a]">
                      {formatVND(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-y border-[#28171a]/12 py-5">
                <SummaryRow label="Tạm tính" value={formatVND(subtotal)} />
                <SummaryRow label="Phí vận chuyển" value={shipping === 0 ? "Miễn phí" : formatVND(shipping)} />
                <SummaryRow label="Thuế (8%)" value={formatVND(tax)} />
                {user && (
                  <div className="flex justify-between gap-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Ưu đãi thành viên
                    </span>
                    <span>-{formatVND(discount)}</span>
                  </div>
                )}
                <div className="flex items-end justify-between gap-4 pt-3">
                  <span className="text-sm font-bold uppercase tracking-[0.22em] text-[#28171a]">Tổng cộng</span>
                  <span className="font-serif text-3xl font-normal text-[#7a2130]">{formatVND(total)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7a2130]">
                    Phương thức thanh toán
                  </p>
                  <p className="mt-1 text-xs leading-6 text-[#756568]">
                    Chọn một phương thức trước khi xác nhận đơn hàng.
                  </p>
                </div>

                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = paymentMethod === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(option.id);
                        setIsPaymentModalOpen(false);
                      }}
                      className={`flex w-full items-start gap-3 border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a2130]/20 ${
                        isSelected
                          ? "border-[#7a2130] bg-[#7a2130]/7"
                          : "border-[#28171a]/12 bg-[#fffdf9] hover:border-[#7a2130]/35 hover:bg-[#f5f0e7]"
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center border ${
                          isSelected
                            ? "border-[#7a2130] bg-[#7a2130] text-white"
                            : "border-[#28171a]/12 text-[#756568]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="text-sm font-semibold text-[#28171a]">{option.title}</span>
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center border ${
                              isSelected ? "border-[#7a2130] bg-[#7a2130]" : "border-[#28171a]/25"
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-6 text-[#756568]">{option.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 border border-[#7a2130] bg-[#7a2130] px-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#fffaf2] transition hover:bg-[#55131e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin border-2 border-current border-t-transparent" />
                    {paymentMethod === "vnpay" ? "Đang chuyển sang VNPay" : "Đang xử lý"}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {paymentMethod === "vnpay" ? "Thanh toán qua VNPay" : "Xác nhận đặt hàng"}
                  </>
                )}
              </button>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-[#756568]">{label}</span>
      <span className="font-semibold text-[#28171a]">{value}</span>
    </div>
  );
}
