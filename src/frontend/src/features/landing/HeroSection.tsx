"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

function Bubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/10 animate-bubble"
          style={{
            width: `${Math.random() * 20 + 6}px`,
            height: `${Math.random() * 20 + 6}px`,
            left: `${Math.random() * 100}%`,
            bottom: `-${Math.random() * 20}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 6 + 6}s`,
          }}
        />
      ))}
    </div>
  );
}

function WaveDecoration() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
      <svg
        className="absolute bottom-0 w-[200%] h-full animate-wave opacity-10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="hsl(var(--primary))"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
      <svg
        className="absolute bottom-0 w-[200%] h-full animate-wave opacity-5"
        style={{ animationDelay: "-3s", animationDuration: "11s" }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="hsl(var(--accent))"
          d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,224,576,229.3C672,235,768,224,864,202.7C960,181,1056,149,1152,144C1248,139,1344,160,1392,170.7L1440,181L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-b from-secondary/50 via-background to-background pt-20">
      <Bubbles />
      <WaveDecoration />

      <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 w-fit">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Vietnam&apos;s #1 Aquarium Marketplace
              </span>
            </div>

            <h1 className="text-4xl font-bold  leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Khám phá thế giới{" "}
              <span className="text-primary">thủy sinh cao cấp</span>
            </h1>

            <p className="text-lg leading-relaxed text-muted-foreground max-w-lg">
              Nơi kết nối những người đam mê cá cảnh với các cửa hàng uy tín.
              Khám phá những loài cá kỳ lạ, những bể cá tuyệt đẹp và phụ kiện
              cao cấp, tất cả chỉ trong một nơi.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 text-base h-12"
                >
                  Bắt đầu mua sắm
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/5 text-base h-12 bg-transparent"
              >
                <Play className="h-4 w-4" />
                Xem demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold  text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">
                  Cửa hàng đáng tin cậy
                </p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-3xl font-bold  text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Loài cá</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-3xl font-bold  text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">
                  Khách hàng hài lòng
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/20 to-accent/20 blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10 aspect-square">
                <Image
                  src="/images/hero-aquarium.jpg"
                  alt="Beautiful aquarium with tropical fish"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-card p-4 shadow-lg border border-border/50 animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🐠</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Hàng vừa cập bến
                    </p>
                    <p className="text-xs text-muted-foreground">
                      120+ loại trong tuần này
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="absolute -top-4 -right-4 rounded-2xl bg-card p-4 shadow-lg border border-border/50 animate-float"
                style={{ animationDelay: "3s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-lg">⭐</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Đánh giá cao
                    </p>
                    <p className="text-xs text-muted-foreground">
                      4.9/5 đánh giá trung bình
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
