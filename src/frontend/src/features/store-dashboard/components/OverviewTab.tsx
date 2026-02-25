"use client";

import React from "react";
import { BarChart3, ShoppingBag, Package, Users, Bell } from "lucide-react";
import { cn } from "@/utils/utils";

interface OverviewTabProps {
  storeId: string;
}

export default function OverviewTab({ storeId }: OverviewTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Doanh thu",
            value: "24.5M",
            icon: BarChart3,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
          },
          {
            label: "Đơn hàng",
            value: "128",
            icon: ShoppingBag,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Sản phẩm",
            value: "45",
            icon: Package,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
          },
          {
            label: "Khách hàng",
            value: "89",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="text-[10px] font-bold text-emerald-500">
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-serif">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 h-[400px] flex items-center justify-center text-muted-foreground italic">
          [Biểu đồ tăng trưởng doanh thu]
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-6 h-[400px]">
          <h3 className="font-bold font-serif mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Thông báo mới
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex gap-3 text-sm border-b border-border/30 pb-3 last:border-0"
              >
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Có đơn hàng mới #ORD-99{i}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    2 giờ trước
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
