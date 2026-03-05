"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import StoreSidebar, {
  menuItems,
} from "@/features/store-dashboard/components/StoreSidebar";
import DashboardHeader from "@/features/store-dashboard/components/DashboardHeader";

interface StoreDashboardLayoutProps {
  storeId: string;
  children: React.ReactNode;
}

/**
 * Shared layout shell for all /dashboard/stores/[id]/* pages.
 * Provides the collapsible sidebar and top header; children render the page content.
 */
export default function StoreDashboardLayout({
  storeId,
  children,
}: StoreDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Derive the active tab from the current pathname
  // /dashboard/stores/[id]        → overview (default)
  // /dashboard/stores/[id]/fish-instances → keep "products" highlighted
  const getActiveTab = () => {
    if (pathname.includes("/fish-instances")) return "products";
    // Fall back to overview — the main page handles its own activeTab state
    return "overview";
  };

  const handleSetActiveTab = (tab: string) => {
    router.push(`/dashboard/stores/${storeId}?tab=${tab}`);
  };

  return (
    <div className="flex h-screen bg-secondary/20 overflow-hidden font-sans">
      <StoreSidebar
        activeTab={getActiveTab()}
        setActiveTab={handleSetActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
