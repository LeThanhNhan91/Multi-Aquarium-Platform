import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Store, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Store,
    title: "For Shop Owners",
    description:
      "List your products, manage inventory, and reach thousands of customers. Our platform handles payments and logistics so you can focus on what you do best.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Sellers",
    description:
      "Every seller on our platform goes through a rigorous verification process. Shop with confidence knowing you are buying from trusted experts.",
  },
  {
    icon: Truck,
    title: "Safe Delivery",
    description:
      "Specialized packaging and express delivery for live fish. Temperature-controlled shipping ensures your aquatic pets arrive healthy and happy.",
  },
];

export function CtaSection() {
  return (
    <section id="about" className="py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Tại sao chọn MultiAqua
            </p>
            <h2 className="text-3xl font-bold  text-foreground sm:text-4xl text-balance">
              Nền tảng đáng tin cậy cho thương mại thủy sinh
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Cho dù bạn là người đam mê tìm kiếm các loài quý hiếm hay chủ cửa
              hàng muốn mở rộng phạm vi tiếp cận, MultiAqua cung cấp các công cụ
              và sự tin cậy bạn cần để thành công.
            </p>

            <div className="flex flex-col gap-8 mt-10">
              {features.map((f) => (
                <div key={f.title} className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {f.title === "For Shop Owners"
                        ? "Dành cho chủ cửa hàng"
                        : f.title === "Verified Sellers"
                          ? "Người bán đã xác minh"
                          : "Giao hàng an toàn"}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {f.description ===
                      "List your products, manage inventory, and reach thousands of customers. Our platform handles payments and logistics so you can focus on what you do best."
                        ? "Liệt kê sản phẩm của bạn, quản lý hàng tồn kho và tiếp cận hàng nghìn khách hàng. Nền tảng của chúng tôi xử lý thanh toán và hậu cần để bạn tập trung vào những gì bạn làm tốt nhất."
                        : f.description ===
                            "Every seller on our platform goes through a rigorous verification process. Shop with confidence knowing you are buying from trusted experts."
                          ? "Mọi người bán trên nền tảng của chúng tôi đều trải qua quy trình xác minh nghiêm ngặt. Mua sắm với sự tự tin khi biết rằng bạn đang mua từ các chuyên gia đáng tin cậy."
                          : "Đóng gói chuyên dụng và giao hàng nhanh cho cá sống. Vận chuyển kiểm soát nhiệt độ đảm bảo thú cưng thủy sinh của bạn đến nơi khỏe mạnh và hạnh phúc."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/5 relative aspect-4/3">
              <Image
                src="/images/shop-showcase.jpg"
                alt="Aquarium shop showcase"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-card p-6 shadow-xl border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Ready to get started?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Join 500+ shops already on MultiAqua
                  </p>
                </div>
                <Link href="/login">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                    Join Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
