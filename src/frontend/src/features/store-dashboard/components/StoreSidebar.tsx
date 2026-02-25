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
} from "lucide-react";
import { cn } from "@/utils/utils";
import { Separator } from "@/components/ui/separator";

export const menuItems = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "products", label: "Sản phẩm", icon: Package },
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
      <div className="p-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <StoreIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <span className="font-bold font-serif text-xl tracking-tight text-foreground truncate">
            Aqua Admin
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              isCollapsed
                ? "w-full flex justify-center items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative"
                : "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
              activeTab === item.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0",
                activeTab === item.id
                  ? ""
                  : "group-hover:scale-110 transition-transform",
              )}
            />
            {!isCollapsed && (
              <span className="text-sm font-bold">{item.label}</span>
            )}
            {activeTab === item.id && isCollapsed && (
              <div className="absolute left-0 w-1 h-6 bg-primary-foreground rounded-r-full" />
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
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center shadow-md hover:bg-secondary transition-colors"
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
