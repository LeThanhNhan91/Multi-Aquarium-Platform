export interface Review {
  id: string;
  productId: string;
  storeId: string | null;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  orderId: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

export interface GetReviewsFilter {
  rating?: number;
  sortBy?: string;
  isDescending?: boolean;
  pageIndex: number;
  pageSize: number;
}

export interface ReviewResponse {
  items: Review[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface CreateReviewRequest {
  orderId: string;
  rating: number;
  comment: string;
}

export interface CanReviewResponse {
  canReview: boolean;
  orderId: string | null;
  message: string;
}
