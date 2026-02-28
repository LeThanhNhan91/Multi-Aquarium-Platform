"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useGetAllProductsQuery } from "@/services/productApi";
import Link from "next/link";
import { FishLoading } from "@/app/Loading";
import { ProductCard, Product } from "@/features/products/ProductCard";

export function FeaturedProducts() {
  const { data: productData, isLoading } = useGetAllProductsQuery({
    pageIndex: 1,
    pageSize: 10,
  });

  const items = productData?.data.items ?? [];

  const products: Product[] = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    shop: item.storeName,
    price: item.basePrice ?? item.minPrice ?? 0,
    rating: item.averageRating ?? 0,
    reviews: item.totalReviews ?? 0,
    image: item.images?.[0] || "/placeholder.svg",
    category: item.categoryName,
  }));

  if (!isLoading && products.length === 0)
    return <div>No products found</div>;

  return (
    <>
      <FishLoading isLoading={isLoading} />
      <section id="products" className="py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Sản phẩm nổi bật
              </p>
              <h2 className="text-3xl font-bold  text-foreground sm:text-4xl text-balance">
                Xu hướng tuần này
              </h2>
            </div>
            <Link href="/products">
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
              >
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-2 mt-8">
              <CarouselPrevious className="static translate-x-0 translate-y-0 h-10 w-10 border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary" />
              <CarouselNext className="static translate-x-0 translate-y-0 h-10 w-10 border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary" />
            </div>
          </Carousel>
        </div>
      </section>
    </>
  );
}
