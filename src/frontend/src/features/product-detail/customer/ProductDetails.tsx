"use client";

import { useState, useEffect } from "react";
import { Fish, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ProductInfo } from "./ProductInfo";
import { PurchaseActions } from "./PurchaseActions";
import { StoreInfo } from "./StoreInfo";
import { ReviewsSection } from "./ReviewsSection";
import { RelatedProducts } from "./RelatedProducts";
import { useGetProductByIdQuery } from "@/services/productApi";
import { FishInstance } from "@/types/product.type";
import { FishLoading } from "@/app/Loading";
import { ImageGallery } from "./ImageGallery";
import { FishInstanceSelector } from "./FishInstanceSelector";
import { ChatDrawer } from "../../chat/ChatDrawer";

interface Props {
  productId: string;
}

export default function ProductDetailPage({ productId }: Props) {
  const { data: response, isLoading } = useGetProductByIdQuery(productId);
  const product = response?.data;

  const [selectedFish, setSelectedFish] = useState<FishInstance | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  const galleryImages = selectedFish?.images?.length
    ? selectedFish.images
    : (product?.images ?? []);

  const videoUrl = selectedFish?.videoUrl ?? null;
  const isLiveFish = product?.productType === "LiveFish";

  const handleFishSelect = (fish: FishInstance) => {
    setSelectedFish((prev) => (prev?.id === fish.id ? null : fish));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <FishLoading isLoading={isLoading} />
      <main className="min-h-screen bg-background">
        {/* Header Navigation */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-sm font-bold  text-foreground">
                  AquaMarket
                </span>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link
                href="/products"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Sản phẩm
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate max-w-50">
                {product?.name ?? "..."}
              </span>
            </div>
          </div>
        </header>

        {product && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2 space-y-8">
                <ImageGallery images={galleryImages} videoUrl={videoUrl} />
                {isLiveFish &&
                  product.fishInstances &&
                  product.fishInstances.length > 0 && (
                    <FishInstanceSelector
                      fishInstances={product.fishInstances}
                      selectedId={selectedFish?.id ?? null}
                      onSelect={handleFishSelect}
                    />
                  )}
              </div>

              <div className="space-y-6">
                <ProductInfo
                  product={product}
                  selectedFish={selectedFish}
                  onContactStore={
                    product.isOwner ? undefined : () => setChatOpen(true)
                  }
                />

                <PurchaseActions
                  productId={product.id}
                  storeId={product.storeId}
                  isLiveFish={isLiveFish}
                  availableStock={product.availableStock ?? 0}
                  selectedFish={selectedFish}
                  isOwner={product.isOwner}
                />

                <StoreInfo
                  storeName={product.storeName}
                  storeId={product.storeId}
                  onContactStore={
                    product.isOwner ? undefined : () => setChatOpen(true)
                  }
                />
              </div>
            </div>

            {/* Mobile Sticky Purchase Actions */}
            <div className="lg:hidden mb-28">
              <PurchaseActions
                productId={product.id}
                storeId={product.storeId}
                isLiveFish={isLiveFish}
                availableStock={product.availableStock ?? 0}
                selectedFish={selectedFish}
                isSticky
                isOwner={product.isOwner}
              />
            </div>

            <Separator className="my-12 bg-border/30" />

            <ReviewsSection
              productId={product.id}
              initialAverageRating={product.averageRating}
              initialTotalReviews={product.totalReviews}
            />

            <Separator className="my-12 bg-border/30" />

            <RelatedProducts categoryName={product.categoryName} />
          </div>
        )}

        {product && (
          <ChatDrawer
            key={product.storeId}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            storeId={product.storeId}
            storeName={product.storeName}
          />
        )}
      </main>
    </>
  );
}
