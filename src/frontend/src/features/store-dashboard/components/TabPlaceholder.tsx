"use client";

import React from "react";
import { LucideIcon, LayoutDashboard } from "lucide-react";

interface TabPlaceholderProps {
  title: string;
  icon?: LucideIcon;
}

export default function TabPlaceholder({
  title,
  icon: Icon = LayoutDashboard,
}: TabPlaceholderProps) {
  return (
    <div className="bg-card border border-border/50 rounded-3xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 mb-6">
        <Icon className="h-10 w-10 text-primary/40" />
      </div>
      <h3 className="text-xl font-bold font-serif text-foreground mb-2">
        Chức năng {title}
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Chức năng này đang được phát triển. Vui lòng quay lại sau!
      </p>
    </div>
  );
}
