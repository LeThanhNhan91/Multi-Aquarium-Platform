export interface Store {
  id: string;
  name: string;
  slug: string;
  phoneNumber: string | null;
  address: string | null;
  deliveryArea: string | null;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  status: "Pending" | "Active" | "Rejected" | "Paused";
  role: "Owner" | "Manager" | "Staff" | "Guest";
  averageRating: number;
  totalReviews: number;
}

export interface CreateStoreRequest {
  name: string;
  phoneNumber: string;
  address: string;
  deliveryArea: string;
  description?: string;
}

export interface UpdateStoreInfoRequest {
  name: string;
  phoneNumber: string;
  address: string;
  deliveryArea: string;
  description?: string;
}

export interface GetStoresFilter {
  searchTerm?: string;
  status?: string;
  userId?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface StoreResponse {
  id: string;
  name: string;
  slug: string;
  status: "Pending" | "Active" | "Rejected" | "Paused";
  role: "Owner" | "Manager" | "Staff" | "Guest";
  averageRating: number;
  totalReviews: number;
  phoneNumber: string;
  address: string;
  deliveryArea: string | null;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
}

export interface UpdateStoreMediaResponse {
  storeId: string;
  storeName: string;
  logoUrl: string | null;
  coverUrl: string | null;
}
