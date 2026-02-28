"use client";

import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Nguyen Minh Tuan",
    role: "Aquarium Hobbyist",
    avatar: "NM",
    rating: 5,
    text: "MultiAqua completely changed how I source fish for my collection. The quality of livestock from verified sellers is consistently exceptional. Highly recommended!",
  },
  {
    name: "Tran Thi Mai",
    role: "Shop Owner, Coral Reef VN",
    avatar: "TM",
    rating: 5,
    text: "As a shop owner, this platform has expanded our customer base significantly. The tools for managing inventory and orders are intuitive and powerful.",
  },
  {
    name: "Le Van Hoang",
    role: "Professional Aquascaper",
    avatar: "LH",
    rating: 5,
    text: "Finding premium ADA products and rare aquatic plants has never been easier. The curated selection and fast delivery make MultiAqua my go-to marketplace.",
  },
  {
    name: "Pham Duc Anh",
    role: "Koi Collector",
    avatar: "PA",
    rating: 5,
    text: "The verification system for sellers gives me confidence when purchasing high-value koi. Every fish I have received has been exactly as described.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Đánh giá
          </p>
          <h2 className="text-3xl font-bold  text-foreground sm:text-4xl text-balance">
            Được yêu thích bởi những người đam mê hồ cá
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn khách hàng và chủ cửa hàng hài lòng, những người tin tưởng MultiAqua cho nhu cầu thủy sinh của họ.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-6">
            {testimonials.map((t) => (
              <CarouselItem
                key={t.name}
                className="pl-6 basis-full md:basis-1/2"
              >
                <div className="relative flex flex-col gap-6 rounded-2xl border border-border/50 bg-card p-8 h-full">
                  <Quote className="h-8 w-8 text-primary/20" />
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-foreground/80 flex-1">
                    {t.text}
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {t.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center gap-2 mt-8">
            <CarouselPrevious className="static translate-x-0 translate-y-0 h-10 w-10 border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary" />
            <CarouselNext className="static translate-x-0 translate-y-0 h-10 w-10 border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
