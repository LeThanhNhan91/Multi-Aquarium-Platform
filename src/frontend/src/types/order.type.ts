export interface CreateOrderItemRequest {
  productId: string;
  fishInstanceId?: string;
  quantity: number;
}

export interface CreateOrderRequest {
  storeId: string;
  items: CreateOrderItemRequest[];
  shippingAddress: string;
  note?: string;
  idempotencyKey?: string;
}

export interface OrderResponse {
  id: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
}

export interface OrderItemResponse {
  productId: string;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
  totalLineAmount: number;
}

export interface OrderDetailResponse {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  note?: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface CreatePaymentUrlRequest {
  orderId: string;
  paymentMethod: string;
}

export interface PaymentLinkDto {
  paymentUrl: string;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipping"
  | "Completed"
  | "Cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: "Chờ thanh toán",
  Processing: "Đang xử lý",
  Shipping: "Đang giao hàng",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Processing: "text-blue-600 bg-blue-50 border-blue-200",
  Shipping: "text-purple-600 bg-purple-50 border-purple-200",
  Completed: "text-green-600 bg-green-50 border-green-200",
  Cancelled: "text-red-600 bg-red-50 border-red-200",
};
