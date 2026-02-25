"use client";

import React, { useState } from "react";
import { useGetStoreByIdQuery } from "@/services/storeApi";
import { FishLoading } from "@/app/Loading";

// Layout Components
import StoreSidebar from "./components/StoreSidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardStoreHeader from "./components/DashboardStoreHeader";

// Tab Components
import OverviewTab from "./components/OverviewTab";
import OrdersTab from "./components/OrdersTab";
import ProductsTab from "./components/ProductsTab";
import CustomersTab from "./components/CustomersTab";
import AnalyticsTab from "./components/AnalyticsTab";
import SettingsTab from "./components/SettingsTab";

export default function StoreDashboard({ storeId }: { storeId: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { data: store, isLoading } = useGetStoreByIdQuery(storeId);

  if (isLoading) return <FishLoading isLoading={true} />;
  if (!store) return <div className="p-10 text-center">Store not found</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab storeId={storeId} />;
      case "orders":
        return <OrdersTab storeId={storeId} />;
      case "products":
        return <ProductsTab storeId={storeId} />;
      case "customers":
        return <CustomersTab storeId={storeId} />;
      case "analytics":
        return <AnalyticsTab storeId={storeId} />;
      case "settings":
        return <SettingsTab storeId={storeId} />;
      default:
        return <OverviewTab storeId={storeId} />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary/20 overflow-hidden font-sans">
      <StoreSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <DashboardStoreHeader store={store} />

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
