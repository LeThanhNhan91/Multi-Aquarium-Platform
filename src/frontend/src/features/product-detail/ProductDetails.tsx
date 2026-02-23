"use client";

import { useState } from "react";
import { Fish, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "./ImageGallery";
import { ProductInfo } from "./ProductInfo";
import { PurchaseActions } from "./PurchaseActions";
import { StoreInfo } from "./StoreInfo";
import { ReviewsSection } from "./ReviewsSection";
import { RelatedProducts } from "./RelatedProducts";
import { useGetProductByIdQuery } from "@/services/productApi";
import { FishInstance } from "@/types/product.type";
import { FishLoading } from "@/app/Loading";
import { FishInstanceSelector } from "./FishInstanceSelector";

interface Props {
  productId: string;
}

export default function ProductDetailPage({ productId }: Props) {
  const { data: response, isLoading } = useGetProductByIdQuery(productId);
  const product = response?.data;

  const [selectedFish, setSelectedFish] = useState<FishInstance | null>(null);

  const galleryImages =
    selectedFish?.images?.length
      ? selectedFish.images
      : product?.images ?? [];

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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Fish className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold font-serif text-foreground">
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
            {/* Main Product Section */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Left Column - Gallery, Video, Fish Instances */}
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

              {/* Right Column - Info & Actions */}
              <div className="space-y-6">
                <ProductInfo product={product} selectedFish={selectedFish} />

                <PurchaseActions
                  productId={product.id}
                  isLiveFish={isLiveFish}
                  availableStock={product.availableStock ?? 0}
                  selectedFish={selectedFish}
                />

                <StoreInfo
                  storeName={product.storeName}
                  storeId={product.storeId}
                />
              </div>
            </div>

            {/* Mobile Sticky Purchase Actions */}
            <div className="lg:hidden mb-28">
              <PurchaseActions
                productId={product.id}
                isLiveFish={isLiveFish}
                availableStock={product.availableStock ?? 0}
                selectedFish={selectedFish}
                isSticky
              />
            </div>

            <Separator className="my-12 bg-border/30" />

            <ReviewsSection
              averageRating={product.averageRating}
              totalReviews={product.totalReviews}
            />

            <Separator className="my-12 bg-border/30" />

            <RelatedProducts categoryName={product.categoryName} />
          </div>
        )}
      </main>
    </>
  );
}

