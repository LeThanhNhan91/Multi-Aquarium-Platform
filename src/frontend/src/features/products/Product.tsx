"use client";

import { useState, useMemo } from "react";
import { Fish, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "./SearchBar";
import { FilterState, FiltersSidebar } from "./FiltersSidebar";
import { ProductsGrid } from "./ProductGrid";
import { Product } from "./ProductCard";

// Mock product data
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Cá Betta Halfmoon Galaxy",
    shop: "Saigon Aquatics",
    price: 350000,
    originalPrice: 450000,
    rating: 4.9,
    reviews: 128,
    image: "/images/product-betta.jpg",
    tag: "Best Seller",
    category: "tropical-fish",
  },
  {
    id: "2",
    name: "Bể Kính ADA 60P",
    shop: "Nature Aquarium VN",
    price: 2800000,
    rating: 4.8,
    reviews: 86,
    image: "/images/product-tank.jpg",
    tag: "Premium",
    category: "aquariums",
  },
  {
    id: "3",
    name: "Cá Discus Blue Diamond",
    shop: "Hanoi Fish World",
    price: 1200000,
    originalPrice: 1500000,
    rating: 4.7,
    reviews: 64,
    image: "/images/product-discus.jpg",
    tag: "New",
    category: "tropical-fish",
  },
  {
    id: "4",
    name: "Bộ Khuếch Tán CO2 Pro",
    shop: "AquaScape Studio",
    price: 890000,
    rating: 4.6,
    reviews: 42,
    image: "/images/product-co2.jpg",
    category: "co2-systems",
  },
  {
    id: "5",
    name: "Cá Koi Showa Premium",
    shop: "Koi Garden Center",
    price: 5500000,
    originalPrice: 6200000,
    rating: 5.0,
    reviews: 31,
    image: "/images/product-koi.jpg",
    tag: "Premium",
    category: "koi",
  },
  {
    id: "6",
    name: "Đèn LED Aquarium RGB",
    shop: "Tech Aqua Store",
    price: 1650000,
    rating: 4.5,
    reviews: 97,
    image: "/images/product-light.jpg",
    tag: "Popular",
    category: "lighting",
  },
  {
    id: "7",
    name: "Cá Neon Tetra (Bảng 10 con)",
    shop: "Saigon Aquatics",
    price: 120000,
    rating: 4.8,
    reviews: 215,
    image: "/images/product-betta.jpg",
    category: "tropical-fish",
  },
  {
    id: "8",
    name: "Lọc Nước Lạnh 1500L/H",
    shop: "AquaScape Studio",
    price: 450000,
    originalPrice: 550000,
    rating: 4.4,
    reviews: 78,
    image: "/images/product-tank.jpg",
    tag: "Best Seller",
    category: "filters",
  },
  {
    id: "9",
    name: "Cây Aquatic Premium Mix",
    shop: "Nature Aquarium VN",
    price: 250000,
    rating: 4.7,
    reviews: 92,
    image: "/images/product-light.jpg",
    category: "planted-tank",
  },
  {
    id: "10",
    name: "Đá Lava Aquascape",
    shop: "Hanoi Fish World",
    price: 180000,
    rating: 4.6,
    reviews: 56,
    image: "/images/product-discus.jpg",
    category: "decorations",
  },
  {
    id: "11",
    name: "Thức Ăn Cá Hạt Cao Cấp 100g",
    shop: "Tech Aqua Store",
    price: 95000,
    rating: 4.9,
    reviews: 342,
    image: "/images/product-co2.jpg",
    tag: "Popular",
    category: "food-supplements",
  },
  {
    id: "12",
    name: "Hệ Thống Lọc Nước Toàn Bộ",
    shop: "Koi Garden Center",
    price: 8900000,
    rating: 4.9,
    reviews: 24,
    image: "/images/product-koi.jpg",
    category: "filters",
  },
];

const defaultFilters: FilterState = {
  priceRange: [0, 10000000],
  selectedRatings: [],
  selectedCategories: [],
};

type SortOption = "newest" | "price-low" | "price-high" | "rating" | "popular";

export default function ProductsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shop.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        filters.selectedCategories.length === 0 ||
        filters.selectedCategories.includes(product.category);

      // Price filter
      const matchesPrice =
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];

      // Rating filter
      const matchesRating =
        filters.selectedRatings.length === 0 ||
        filters.selectedRatings.some((r) => product.rating >= r);

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [searchQuery, filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "popular":
        return sorted.sort((a, b) => b.reviews - a.reviews);
      case "newest":
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Fish className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-serif text-foreground tracking-tight">
                AquaMarket
              </span>
            </Link>
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
          <h1 className="text-3xl font-bold font-serif text-foreground mb-2">
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
                {sortedProducts.length === 0
                  ? "Không tìm thấy sản phẩm"
                  : `${sortedProducts.length} sản phẩm`}
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

            {/* Products Grid */}
            <ProductsGrid products={sortedProducts} />
          </div>
        </div>
      </div>
    </main>
  );
}
