import { RotateCcw, Shield, Truck } from "lucide-react";

export default function Features() {
  const features = [
    { icon: Truck, title: "Giao hàng miễn phí", desc: "Cho đơn hàng trên 500.000đ" },
    { icon: Shield, title: "Bảo hành minh bạch", desc: "Bảo hành 1 năm cho sản phẩm đủ điều kiện" },
    { icon: RotateCcw, title: "Đổi trả dễ dàng", desc: "Hỗ trợ đổi trả trong 30 ngày" },
  ];

  return (
    <section className="border-b border-[#28171a]/12 py-14">
      <div className="grid gap-7 md:grid-cols-3">
        {features.map((feature, index) => (
          <div key={feature.title} className="grid grid-cols-[auto_1fr] gap-4 border-t border-[#28171a]/12 pt-5">
            <span className="font-serif text-2xl italic text-[#7a2130]">0{index + 1}</span>
            <div>
              <feature.icon className="mb-4 h-5 w-5 text-[#7a2130]" />
              <h2 className="font-serif text-2xl font-normal text-[#28171a]">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#756568]">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
