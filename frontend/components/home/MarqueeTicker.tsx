import { Asterisk } from "lucide-react";

export default function MarqueeTicker() {
  return (
    <div className="overflow-hidden bg-[#7a2130] py-4 text-[#fffaf2] hover-pause">
      <div className="flex min-w-full whitespace-nowrap animate-marquee">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="flex items-center gap-10 px-5 text-[10px] font-bold uppercase tracking-[0.28em]">
            <span>Đức Chính Jewelry</span><Asterisk className="h-3 w-3" /><span>Modern heirlooms</span><Asterisk className="h-3 w-3" /><span>Made with intention</span>
          </div>
        ))}
      </div>
    </div>
  );
}
