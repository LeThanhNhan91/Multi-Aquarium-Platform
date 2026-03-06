"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Fish, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "./SearchBar";
import { FilterState, FiltersSidebar } from "./FiltersSidebar";
import { ProductsGrid } from "./ProductGrid";
import { Product } from "./ProductCard";
import { useGetAllProductsQuery, ProductParams } from "@/services/productApi";
import { FishLoading } from "@/app/Loading";

const defaultFilters: FilterState = {
  priceRange: [0, 10000000],
  selectedRatings: [],
  selectedCategories: [],
};

type SortOption = "newest" | "price-low" | "price-high" | "rating" | "popular";

export default function ProductsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Construct API parameters derived from state
  const apiParams: ProductParams = useMemo(() => {
    const params: ProductParams = {
      pageIndex: 1,
      pageSize: 10,
      Keyword: debouncedSearchQuery || undefined,
      MinPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
      MaxPrice:
        filters.priceRange[1] < 10000000 ? filters.priceRange[1] : undefined,
      AverageRating:
        filters.selectedRatings.length > 0
          ? Math.min(...filters.selectedRatings)
          : undefined,
      CategoryId:
        filters.selectedCategories.length > 0
          ? filters.selectedCategories[0]
          : undefined,
    };

    // Sort mapping
    switch (sortBy) {
      case "price-low":
        params.SortBy = "price";
        params.IsDescending = false;
        break;
      case "price-high":
        params.SortBy = "price";
        params.IsDescending = true;
        break;
      case "rating":
        params.SortBy = "averagerating";
        params.IsDescending = true;
        break;
      case "popular":
        params.SortBy = "totalreviews";
        params.IsDescending = true;
        break;
      case "newest":
        params.SortBy = "newest";
        params.IsDescending = true;
        break;
      default:
        break;
    }

    return params;
  }, [debouncedSearchQuery, filters, sortBy]);

  const { data: productData, isLoading } = useGetAllProductsQuery(apiParams);

  // Map API response to UI model
  const products: Product[] = useMemo(() => {
    if (!productData?.data?.items) return [];

    return productData.data.items.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      shop: item.storeName,
      price: item.basePrice ?? item.minPrice ?? 0,
      // originalPrice: item.originalPrice,
      rating: item.averageRating ?? 0,
      reviews: item.totalReviews ?? 0,
      image: item.images?.[0] || "/images/product-placeholder.jpg",
      category: item.categoryName,
      // tag: undefined,
    }));
  }, [productData]);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery("");
  };

  return (
    <>
      <FishLoading isLoading={isLoading} />
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                ← Quay Lại
              </Link>
            </div>

            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold  text-foreground mb-2">
              Sản Phẩm
            </h1>
            <p className="text-muted-foreground">
              Tìm kiếm cá, bể, phụ kiện từ các cửa hàng tốt nhất
            </p>
          </div>

          <div className="flex gap-8">
            <div className="hidden md:block w-80 shrink-0">
              <FiltersSidebar
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="text-sm text-muted-foreground">
                  {products.length === 0
                    ? ""
                    : `${productData?.data?.totalCount ?? products.length} sản phẩm`}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-2 rounded-lg border border-border/50 bg-card text-foreground text-sm font-medium cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <option value="newest">Mới Nhất</option>
                    <option value="price-low">Giá: Thấp Đến Cao</option>
                    <option value="price-high">Giá: Cao Đến Thấp</option>
                    <option value="rating">Đánh Giá Cao Nhất</option>
                    <option value="popular">Phổ Biến Nhất</option>
                  </select>

                  <Sheet
                    open={mobileFiltersOpen}
                    onOpenChange={setMobileFiltersOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="md:hidden border-border/50 bg-card hover:bg-secondary"
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Bộ Lọc
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <div className="h-full overflow-y-auto p-6">
                        <FiltersSidebar
                          filters={filters}
                          onFiltersChange={setFilters}
                          onReset={handleResetFilters}
                          isOpen={mobileFiltersOpen}
                          onClose={() => setMobileFiltersOpen(false)}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              <ProductsGrid products={products} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
