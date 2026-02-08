"use client";

import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { ProductItem } from "@/types/product.type";
import { useGetAllProductsQuery } from "@/services/productApi";
import { formatToVND } from "@/helper/formatter";

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.categoryName && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0">
            {product.categoryName}
          </Badge>
        )}
        <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </button>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs text-muted-foreground">{product.storeName}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium text-foreground">
            {product.rating}
          </span>
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div> */}

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {formatToVND(product.basePrice)}
            </span>
            {/* {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice}d
              </span>
            )} */}
          </div>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9 p-0"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Add to cart</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  const { data: productData, isLoading } = useGetAllProductsQuery({
    pageIndex: 1,
    pageSize: 10,
  });

  const products = productData?.data.items ?? [];

  if (isLoading) return <div>Loading...</div>;

  if (products.length === 0) return <div>No products found</div>;

  return (
    <section id="products" className="py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Featured Products
            </p>
            <h2 className="text-3xl font-bold font-serif text-foreground sm:text-4xl text-balance">
              Trending This Week
            </h2>
          </div>
          <Button
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
          >
            View All Products
          </Button>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.name}
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
  );
}
