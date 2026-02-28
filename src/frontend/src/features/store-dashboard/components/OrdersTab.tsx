"use client";

import React from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  ShoppingBag,
  Calendar,
  User as UserIcon,
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
import { useGetOrdersQuery } from "@/services/orderApi";
import { AquariumLoader } from "@/components/shared/AquariumLoader";
import { formatCurrency, cn } from "@/utils/utils";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  OrderStatus,
  PaymentStatus,
} from "@/types/order.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface OrdersTabProps {
  storeId: string;
}

export default function OrdersTab({ storeId }: OrdersTabProps) {
  const { data: response, isLoading } = useGetOrdersQuery({ storeId: storeId });
  const orders = response?.data?.items || [];

  if (isLoading) {
    return <AquariumLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý đơn hàng
          </h2>
          <p className="text-muted-foreground">
            Theo dõi và xử lý các đơn hàng từ khách hàng của bạn.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, tên khách..."
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
              <TableHead>Mã đơn hàng</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 opacity-20" />
                    <p>Chưa có đơn hàng nào cho cửa hàng của bạn.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-xs font-bold">
                    #{order.id.split("-")[0].toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "px-2.5 py-0.5 rounded-full border font-medium",
                        ORDER_STATUS_COLORS[order.status as OrderStatus],
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "px-2.5 py-0.5 rounded-full border font-medium",
                        PAYMENT_STATUS_COLORS[
                          order.paymentStatus as PaymentStatus
                        ],
                      )}
                    >
                      {
                        PAYMENT_STATUS_LABELS[
                          order.paymentStatus as PaymentStatus
                        ]
                      }
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
                          Đơn hàng
                        </DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                          <Eye className="h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                          <ShoppingBag className="h-4 w-4" />
                          Cập nhật trạng thái
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
