import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/features/products/ProductCard";

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  rating: number;
  reviews: number;
  shop: string;
  category: string;
  productType: string
}

interface RelatedProductsProps {
  categoryName: string;
}

const mockRelatedProducts: RelatedProduct[] = [
  {
    id: "1",
    name: "Cá Neon Tetra Đỏ Xanh",
    price: 45000,
    image: "/images/product-betta.jpg",
    slug: "ca",
    rating: 4.8,
    reviews: 234,
    shop: "Aqua Paradise",
        category: "Tropical Fish",
        productType: "fish"
  },
  {
    id: "2",
    name: "Bộ Lọc Nước Canister 500L",
    price: 1200000,
    image: "/images/product-tank.jpg",
    slug: "ca",
    rating: 4.6,
    reviews: 156,
    shop: "Pro Equipment",
    category: "Equipment",
    productType: "equipment"
  },
  {
    id: "3",
    name: "Đèn LED Full Spectrum 120cm",
    price: 850000,
    image: "/images/product-light.jpg",
    slug: "ca",
    rating: 4.7,
    reviews: 189,
    shop: "Lighting Experts",
    category: "Supplies",
    productType: "equipment"
  },
  {
    id: "4",
    name: "Cá Arwana Vàng Đỏ",
    price: 2500000,
    image: "/images/product-koi.jpg",
    slug: "ca",
    rating: 5.0,
    reviews: 45,
    shop: "Exotic Fish VN",
    category: "Tropical Fish",
    productType: "fish"
  },
];

export function RelatedProducts({ categoryName }: RelatedProductsProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold  text-foreground">
            Sản phẩm tương tự
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Các sản phẩm khác trong danh mục {categoryName}
          </p>
        </div>
        <Link href={`/products?category=${categoryName}`}>
          <Button
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/5 rounded-lg gap-2"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockRelatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
