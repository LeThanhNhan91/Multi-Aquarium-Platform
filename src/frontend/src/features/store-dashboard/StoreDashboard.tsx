"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useGetStoreByIdQuery } from "@/services/storeApi";
import { FishLoading } from "@/app/Loading";
import DashboardStoreHeader from "./components/DashboardStoreHeader";

// Tab Components
import OverviewTab from "./components/overview/OverviewTab";
import OrdersTab from "./components/orders/OrdersTab";
import ProductsTab from "./components/products/ProductsTab";
import CustomersTab from "./components/customers/CustomersTab";
import AnalyticsTab from "./components/analytic/AnalyticsTab";
import SettingsTab from "./components/settings/SettingsTab";
import { PostsTab } from "./components/posts/PostsTab";

export default function StoreDashboard({ storeId }: { storeId: string }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";

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
      case "posts":
        return <PostsTab storeId={storeId} />;
      case "analytics":
        return <AnalyticsTab storeId={storeId} />;
      case "settings":
        return <SettingsTab storeId={storeId} />;
      default:
        return <OverviewTab storeId={storeId} />;
    }
  };

  return (
    <div className="p-8">
      <DashboardStoreHeader store={store} />
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderTabContent()}
      </div>
    </div>
  );
}
