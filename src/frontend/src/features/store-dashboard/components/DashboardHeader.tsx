"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-8 z-20 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-sm w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full bg-secondary/50 border-0 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-card" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Link
          href="/profile"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground">Admin</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Cửa hàng trưởng
            </p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              AD
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
