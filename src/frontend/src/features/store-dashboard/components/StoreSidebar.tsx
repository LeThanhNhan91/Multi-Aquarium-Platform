"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Store as StoreIcon,
  LogOut,
  FileText,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { motion } from "framer-motion";

export const menuItems = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "posts", label: "Bài viết", icon: FileText },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "analytics", label: "Báo cáo", icon: BarChart3 },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

interface StoreSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function StoreSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}: StoreSidebarProps) {
  return (
    <aside
      className={cn(
        "bg-card border-r border-border/50 flex flex-col transition-all duration-300 z-30 shadow-xl relative",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <Link href={"/"}>
        <div className="p-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <StoreIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight text-foreground truncate">
              Aqua Admin
            </span>
          )}
        </div>
      </Link>

      <nav className="flex-1 px-3 space-y-1 mt-4 relative">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative outline-none",
              isCollapsed && "justify-center",
              activeTab === item.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 z-0"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            <item.icon
              className={cn(
                "h-5 w-5 shrink-0 relative z-10",
                activeTab === item.id
                  ? ""
                  : "group-hover:scale-110 transition-transform",
              )}
            />
            {!isCollapsed && (
              <span className="text-sm font-bold relative z-10">
                {item.label}
              </span>
            )}

            {activeTab === item.id && isCollapsed && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute left-0 w-1.5 h-6 bg-primary-foreground rounded-r-full z-20"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <Separator className="mb-4 opacity-50" />
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors",
            isCollapsed && "justify-center px-0",
          )}
          onClick={() => (window.location.href = "/profile")}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-bold">Thoát Dashboard</span>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center shadow-md hover:bg-secondary transition-colors z-40"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
