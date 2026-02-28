"use client";

import { useState } from "react";
import { Fish, ShoppingBag, Heart, Settings, Store } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/features/profile/ProfileHeader";
import { MyShops } from "@/features/profile/MyShops";
import { OrderHistory } from "@/features/profile/OrderHistory";
import { Wishlist } from "@/features/profile/Wishlist";
import { SettingsTab } from "@/features/profile/SettingsTab";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("shops");

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Fish className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold  text-foreground tracking-tight">
              AquaMarket
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Back to Marketplace
          </Link>
        </nav>
      </header>

      <ProfileHeader />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 rounded-xl p-1 h-auto flex-wrap gap-1">
            <TabsTrigger
              value="shops"
              className="rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-2"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">My Shops</span>
              <span className="sm:hidden">Shops</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="wishlist"
              className="rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-2"
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="shops" className="mt-0">
              <MyShops />
            </TabsContent>
            <TabsContent value="orders" className="mt-0">
              <OrderHistory onNavigateToShops={() => setActiveTab("shops")} />
            </TabsContent>
            <TabsContent value="wishlist" className="mt-0">
              <Wishlist />
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
