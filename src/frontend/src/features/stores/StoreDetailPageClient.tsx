"use client";

import { useGetStoreByIdQuery } from "@/services/storeApi";
import { useGetStorePostsQuery } from "@/services/postApi";
import {
  useGetAllProductsQuery,
  useGetStoreProductsQuery,
} from "@/services/productApi";
import { useGetStoreReviewsQuery } from "@/services/reviewApi";
import {
  Store,
  Star,
  MapPin,
  Loader2,
  Heart,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/features/feeds/PostCard";
import { ProductCard } from "@/features/products/ProductCard";
import { PostDetailModal } from "@/features/posts/PostDetailModal";
import { useState } from "react";

export default function StoreDetailPageClient({
  storeId,
}: {
  storeId: string;
}) {
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);

  const { data: store, isLoading: isStoreLoading } =
    useGetStoreByIdQuery(storeId);

  const { data: postsRes, isLoading: isPostsLoading } = useGetStorePostsQuery({
    storeId,
    page: 1,
    size: 20,
  });

  const { data: productsRes, isLoading: isProductsLoading } =
    useGetAllProductsQuery({
      StoreId: storeId,
      pageIndex: 1,
      pageSize: 12,
    });

  const { data: reviewsRes, isLoading: isReviewsLoading } =
    useGetStoreReviewsQuery({
      storeId,
      filter: { pageIndex: 1, pageSize: 10 },
    });

  if (isStoreLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Cửa hàng không tồn tại.
      </div>
    );
  }

  const posts = postsRes?.data?.items || [];
  const products = productsRes?.data.items || [];
  const reviews = reviewsRes?.data?.items || [];

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      {/* Banner & Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-white">
        {store.coverUrl ? (
          <Image
            src={store.coverUrl}
            alt={`${store.name} cover`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-blue-400 to-emerald-400 opacity-80" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Info Container */}
        <div className="relative -mt-16 bg-card rounded-2xl shadow-sm border border-border/50 p-6 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
          {/* Avatar & Basic Info */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 md:pr-6 pb-6 md:pb-0 items-center md:items-start text-center md:text-left">
            <div className="h-28 w-28 shrink-0 rounded-2xl border-4 border-card bg-white shadow-md relative overflow-hidden flex items-center justify-center -mt-12 md:-mt-16 z-10">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Store className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2 flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-foreground">
                {store.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">
                    {store.averageRating?.toFixed(1) || "4.8"}
                  </span>
                  <span>({store.totalReviews || 120} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="line-clamp-1">{store.address}</span>
                </div>
              </div>
              {store.description && (
                <p className="text-sm text-foreground/80 line-clamp-2 pt-2 max-w-xl">
                  {store.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex flex-col justify-center gap-4 md:pl-6 pt-6 md:pt-0 min-w-[240px]">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                  Sản phẩm
                </p>
                <p className="text-xl font-bold text-foreground">
                  {productsRes?.data.totalCount ?? 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                  Đánh giá tốt
                </p>
                <p className="text-xl font-bold text-foreground">98%</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2">
                <Heart className="h-4 w-4" /> Theo dõi
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-semibold gap-2 border-primary/20 hover:bg-primary/5 text-primary"
              >
                <MessageSquare className="h-4 w-4" /> Nhắn tin
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="bg-card border border-border/50 p-1 w-full flex overflow-x-auto justify-start md:w-auto md:inline-flex rounded-xl shadow-xs">
              <TabsTrigger
                value="posts"
                className="flex-1 md:flex-none rounded-lg font-semibold px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Bài đăng ({postsRes?.data?.totalCount ?? 0})
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="flex-1 md:flex-none rounded-lg font-semibold px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Sản phẩm ({productsRes?.data.totalCount ?? 0})
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="flex-1 md:flex-none rounded-lg font-semibold px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Đánh giá ({reviewsRes?.data?.totalCount ?? 0})
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent
                value="posts"
                className="m-0 focus-visible:outline-none focus-visible:ring-0"
              >
                {isPostsLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post, index) => (
                      <PostCard key={post.id} post={post} onOpenDetail={() => setSelectedPostIndex(index)} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
                    <p className="text-muted-foreground">
                      Cửa hàng chưa có bài đăng nào.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="products"
                className="m-0 focus-visible:outline-none focus-visible:ring-0"
              >
                {isProductsLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((p) => {
                      const image = p.images?.[0] || "/placeholder.svg";
                      const mappedProduct = {
                        id: p.id,
                        slug: "product",
                        name: p.name,
                        shop: store.name,
                        price: p.basePrice ?? p.minPrice ?? 0,
                        rating: p.averageRating,
                        reviews: p.totalReviews,
                        image: image,
                        category: p.categoryName || "Uncategorized",
                        productType: p.productType || "Normal",
                      };
                      return <ProductCard key={p.id} product={mappedProduct} />;
                    })}
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
                    <p className="text-muted-foreground">
                      Cửa hàng chưa có sản phẩm nào.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="reviews"
                className="m-0 focus-visible:outline-none focus-visible:ring-0"
              >
                {isReviewsLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="border-b last:border-0 border-border/50 pb-6 last:pb-0"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                            <span className="font-bold text-sm">
                              {r.userName?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">
                              {r.userName}
                            </p>
                            <div className="flex gap-1 mt-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 pl-13">
                          {r.comment}
                        </p>
                        {r.mediaUrls && r.mediaUrls.length > 0 && (
                          <div className="flex gap-2 mt-3 pl-13">
                            {r.mediaUrls.map((url, i) => (
                              <div
                                key={i}
                                className="relative h-16 w-16 rounded-lg overflow-hidden border border-border/50"
                              >
                                <Image
                                  src={url}
                                  alt={`Review photo ${i}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
                    <p className="text-muted-foreground">
                      Cửa hàng chưa có đánh giá nào.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {selectedPostIndex !== null && posts.length > 0 && (
        <PostDetailModal 
          posts={posts} 
          initialIndex={selectedPostIndex} 
          onClose={() => setSelectedPostIndex(null)} 
        />
      )}
    </div>
  );
}
