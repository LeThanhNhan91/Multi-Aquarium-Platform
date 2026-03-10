"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Derive the active tab from the current pathname or search params
  const getActiveTab = () => {
    if (pathname.includes("/fish-instances")) return "products";

    const tab = searchParams.get("tab");
    if (tab && menuItems.some((item) => item.id === tab)) {
      return tab;
    }

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
