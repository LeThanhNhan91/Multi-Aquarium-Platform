"use client";

import {
  Store,
  ArrowRight,
  User,
  Phone,
  FileText,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const REGISTER_STEPS = [
  {
    icon: User,
    label: "Thông tin cửa hàng",
    desc: "Tên, mô tả, địa chỉ cửa hàng, khu vực giao hàng",
  },
  { icon: ImagePlus, label: "Hình ảnh & Logo", desc: "Ảnh đại diện, ảnh bìa" },
  {
    icon: Phone,
    label: "Liên hệ",
    desc: "Số điện thoại",
  },
  {
    icon: FileText,
    label: "Xác nhận & Gửi duyệt",
    desc: "Chờ đội ngũ AquaMarket xét duyệt",
  },
];

export function RegisterShopForm() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 px-8 py-10 mb-8 text-center">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold font-serif text-foreground mb-2">
            Đăng ký mở cửa hàng
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Tham gia cộng đồng người bán trên AquaMarket và tiếp cận hàng nghìn
            người yêu thủy sinh khắp Việt Nam.
          </p>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-3 mb-8">
        {REGISTER_STEPS.map((step, idx) => (
          <div
            key={step.label}
            className="flex items-center gap-4 rounded-xl border border-border/50 bg-card px-5 py-4 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <step.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 text-[10px] font-bold text-muted-foreground">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          className="w-full sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 text-sm font-semibold shadow-md shadow-primary/20"
          disabled
        >
          <Store className="h-4 w-4" />
          Bắt đầu đăng ký cửa hàng
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
