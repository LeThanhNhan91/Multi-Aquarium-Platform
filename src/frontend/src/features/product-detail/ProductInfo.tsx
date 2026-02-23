import { Star, Package, Calendar, Ruler, Palette, Tag, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import { FishInstance, ProductItem } from "@/types/product.type";

interface ProductInfoProps {
  product: ProductItem;
  selectedFish: FishInstance | null;
}

export function ProductInfo({ product, selectedFish }: ProductInfoProps) {
  const isLiveFish = product.productType === "LiveFish";

  // Price display logic
  const renderPrice = () => {
    if (selectedFish) {
      return (
        <div className="text-4xl font-bold text-primary">
          {selectedFish.price.toLocaleString("vi-VN")}
          <span className="text-lg ml-2">đ</span>
        </div>
      );
    }
    if (isLiveFish && product.minPrice !== null && product.minPrice !== undefined) {
      if (product.minPrice === product.maxPrice) {
        return (
          <div className="text-4xl font-bold text-primary">
            {product.minPrice.toLocaleString("vi-VN")}
            <span className="text-lg ml-2">đ</span>
          </div>
        );
      }
      return (
        <div className="space-y-1">
          <div className="text-3xl font-bold text-primary">
            {product.minPrice.toLocaleString("vi-VN")}đ
            <span className="text-xl text-muted-foreground font-normal mx-2">—</span>
            {product.maxPrice?.toLocaleString("vi-VN")}đ
          </div>
          <p className="text-xs text-muted-foreground">Chọn cá bên dưới để xem giá cụ thể</p>
        </div>
      );
    }
    if (product.basePrice !== null && product.basePrice !== undefined) {
      return (
        <div className="text-4xl font-bold text-primary">
          {product.basePrice.toLocaleString("vi-VN")}
          <span className="text-lg ml-2">đ</span>
        </div>
      );
    }
    return <div className="text-xl text-muted-foreground">Liên hệ để biết giá</div>;
  };

  // Stock / availability
  const renderStock = () => {
    if (isLiveFish) {
      const count = product.availableFishCount ?? 0;
      return {
        label: count > 0 ? `Còn ${count} cá sẵn sàng` : "Hết hàng",
        color: count > 0 ? (count <= 3 ? "text-orange-500" : "text-green-500") : "text-red-500",
      };
    }
    const stock = product.availableStock ?? 0;
    return {
      label: stock > 0 ? (stock <= 10 ? `Còn lại ${stock} sản phẩm` : "Còn hàng") : "Hết hàng",
      color: stock > 0 ? (stock <= 10 ? "text-orange-500" : "text-green-500") : "text-red-500",
    };
  };

  const stockInfo = renderStock();
  const { averageRating, totalReviews, categoryName, name, description , createdAt } = product;

  const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-primary/10 text-primary border-0 hover:bg-primary/20">
          {categoryName}
        </Badge>
        {isLiveFish && (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
            Cá sống
          </Badge>
        )}
      </div>

      {/* Product Name */}
      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground leading-tight">
        {name}
      </h1>

      <p>{description}</p>

      {/* Rating */}
      <div className="flex items-center gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted",
                )}
              />
            ))}
          </div>
          <span className="text-lg font-bold text-foreground">
            {averageRating.toFixed(1)}
          </span>
        </div>
        <button className="text-sm font-medium text-primary hover:underline">
          {totalReviews} đánh giá
        </button>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Giá</p>
        {renderPrice()}
      </div>

      {/* Selected Fish Details */}
      {selectedFish && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
          <p className="text-sm font-semibold text-primary">Thông tin cá đã chọn</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-foreground/80">
              <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Kích thước: <strong>{selectedFish.size} cm</strong></span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Giới tính: <strong>{selectedFish.gender}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80 col-span-2">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Màu sắc: <strong>{selectedFish.color}</strong></span>
            </div>
            <div className="flex items-start gap-2 text-foreground/80 col-span-2">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
              <span>Đặc điểm: <strong>{selectedFish.features}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Stock Status */}
      <div className="p-4 rounded-xl bg-linear-to-r from-secondary/40 to-secondary/20">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Tình trạng</p>
            <p className={cn("text-sm font-medium", stockInfo.color)}>
              {stockInfo.label}
            </p>
          </div>
        </div>
      </div>

      {/* Date Added */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Đăng vào {formattedDate}</span>
      </div>

      {/* Policies */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <p className="text-sm font-semibold text-foreground">Chính sách</p>
        <div className="space-y-2">
          {[
            "Giao hàng an toàn, đóng gói chuyên dụng",
            "Hoàn tiền nếu hàng không đúng mô tả",
            "Bảo hành 7 ngày sau mua",
            "Chăm sóc khách hàng 24/7",
          ].map((policy) => (
            <div key={policy} className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              <p className="text-sm text-foreground/80">{policy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
