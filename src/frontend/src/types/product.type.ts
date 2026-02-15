export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  storeName: string;
  storeId: string;
  categoryName: string;
  images: string[];
  createdAt: string; // or Date if you parse it
  quantity: number;
  availableStock: number;
  averageRating: number;
  totalReviews: number;
}
