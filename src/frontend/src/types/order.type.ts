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
  customerId: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  note?: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  productId: string;
  fishInstanceId?: string | null;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
  totalLineAmount: number;
  productImageUrl?: string | null;
  fishImages?: string[] | null;
  fishVideoUrl?: string | null;
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
  | "Confirmed"
  | "Pending"
  | "Processing"
  | "Shipping"
  | "Completed"
  | "Cancelled";

export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  Unpaid: "Chưa thanh toán",
  Paid: "Đã thanh toán",
  Refunded: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  Unpaid: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Paid: "text-green-600 bg-green-50 border-green-200",
  Refunded: "text-purple-600 bg-purple-50 border-purple-200",
};

export interface GetOrdersFilter {
  orderId?: string;
  storeId?: string;
  customerId?: string;
  status?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  isDescending?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Confirmed: "Đã xác nhận",
  Pending: "Chờ thanh toán",
  Processing: "Đang xử lý",
  Shipping: "Đang giao hàng",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  Confirmed: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Processing: "text-blue-600 bg-blue-50 border-blue-200",
  Shipping: "text-purple-600 bg-purple-50 border-purple-200",
  Completed: "text-green-600 bg-green-50 border-green-200",
  Cancelled: "text-red-600 bg-red-50 border-red-200",
};
