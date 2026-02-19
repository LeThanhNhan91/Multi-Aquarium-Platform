"use client";

import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import StarRating from "@/components/shared/StarRating ";

export interface Product {
  id: string;
  name: string;
  shop: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  tag?: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.tag && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0">
            {product.tag}
          </Badge>
        )}
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground border-0">
            -{discount}%
          </Badge>
        )}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            isWishlisted
              ? "bg-destructive text-destructive-foreground"
              : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
          }`}
        >
          <Heart
            className="h-4 w-4"
            fill={isWishlisted ? "currentColor" : "none"}
          />
          <span className="sr-only">Add to wishlist</span>
        </button>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs text-muted-foreground">{product.shop}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <StarRating averageRating={product.rating} />
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {product.price.toLocaleString()}đ
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice.toLocaleString()}đ
              </span>
            )}
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
