export interface FishInstance {
  id: string;
  productId: string;
  price: number;
  size: string;
  color: string;
  features: string;
  gender: string;
  status: "Available" | "Sold" | "Reserved";
  images: string[];
  videoUrl: string | null;
  createdAt: string;
  soldAt: string | null;
  reservedUntil: string | null;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  productType: "LiveFish" | "Equipment" | string;
  basePrice: number | null;
  storeName: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  videos?: string[];
  createdAt: string;
  quantity: number | null;
  availableStock: number | null;
  averageRating: number;
  totalReviews: number;
  availableFishCount?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  fishInstances?: FishInstance[];
  isOwner?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  basePrice?: number;
  categoryId: string;
  stock?: number;
  images?: File[];
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  basePrice?: number;
  newImages?: File[];
  removeImageIds?: string[];
}

export interface CreateFishInstanceRequest {
  price: number;
  size: string;
  color?: string;
  features?: string;
  gender?: string;
  images?: File[];
  video?: File;
}

export interface UpdateFishInstanceRequest {
  price: number;
  size: string;
  color?: string;
  features?: string;
  gender?: string;
  status: "Available" | "Sold" | "Reserved" | "OnHold";
}
