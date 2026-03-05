"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/utils";
import { CreateProductDialog } from "./CreateProductDialog";
import { useGetStoreProductsQuery } from "@/services/productApi";
import { AquariumLoader } from "@/components/shared/AquariumLoader";

interface ProductsTabProps {
  storeId: string;
}

export default function ProductsTab({ storeId }: ProductsTabProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: response, isLoading } = useGetStoreProductsQuery({
    storeId,
  });
  const products = response?.items || [];

  if (isLoading) {
    return <AquariumLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý sản phẩm
          </h2>
          <p className="text-muted-foreground">
            Danh sách tất cả các sản phẩm hiện có trong cửa hàng của bạn.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 h-11 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Thêm sản phẩm
        </Button>
      </div>

      <CreateProductDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        storeId={storeId}
      />

      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-9 bg-card border-border/50 rounded-xl focus-visible:ring-primary/20"
          />
        </div>
        <Button variant="outline" className="rounded-xl border-border/50">
          Bộ lọc
        </Button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá (VND)</TableHead>
              <TableHead>Kho hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Package className="h-12 w-12 opacity-20" />
                    <p>Chưa có sản phẩm nào trong cửa hàng của bạn.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted border border-border/50">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[250px] truncate">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-card">
                      {product.categoryName}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {product.productType === "LiveFish"
                      ? product.minPrice != null && product.maxPrice != null
                        ? product.minPrice === product.maxPrice
                          ? formatCurrency(product.minPrice)
                          : `${formatCurrency(product.minPrice)} – ${formatCurrency(product.maxPrice)}`
                        : product.minPrice != null
                          ? formatCurrency(product.minPrice)
                          : "—"
                      : formatCurrency(product.basePrice ?? 0)}
                  </TableCell>
                  <TableCell>
                    {product.availableStock ?? product.availableFishCount ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 font-medium">
                      Đang bán
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-primary/10 rounded-lg"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl border-border/50 p-2 min-w-[160px]"
                      >
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                          Thao tác
                        </DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                          <Edit className="h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        {product.productType === "LiveFish" && (
                          <DropdownMenuItem
                            className="rounded-lg gap-2 cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/dashboard/stores/${storeId}/fish-instances?productId=${product.id}`,
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                            Quản lý cá cảnh
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                          <Package className="h-4 w-4" />
                          Quản lý tồn kho
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg gap-2 text-destructive cursor-pointer hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                          Xóa sản phẩm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
