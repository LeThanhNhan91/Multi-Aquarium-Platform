export interface CartItemBackend {
  id: string;
  productId: string;
  fishInstanceId?: string;
  productName: string;
  productType: string;
  price: number;
  quantity: number;
  imageUrl: string;
  storeId: string;
  storeName: string;
  availableStock?: number;
}

export interface AddToCartRequest {
  productId: string;
  fishInstanceId?: string;
  quantity: number;
}

export interface InventoryCheckItem {
  productId: string;
  fishInstanceId?: string;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  reason?: string;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  items: InventoryCheckItem[];
  message?: string;
}