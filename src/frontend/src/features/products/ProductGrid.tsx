"use client";

import { Product, ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArrowUpRightIcon, SearchAlertIcon } from "lucide-react";

interface ProductsGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductsGrid({ products, isLoading }: ProductsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card overflow-hidden animate-pulse"
          >
            <div className="aspect-4/3 bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded w-1/3 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchAlertIcon />
          </EmptyMedia>
          <EmptyTitle>No Products Found</EmptyTitle>
          <EmptyDescription>
            There are no products match your current searches or filters.
          </EmptyDescription>
        </EmptyHeader>
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
