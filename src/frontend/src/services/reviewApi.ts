import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { ApiResponse, PagedResult } from "@/types/baseModel";
import {
  Review,
  ReviewSummary,
  GetReviewsFilter,
  ReviewResponse,
  CreateReviewRequest,
  CanReviewResponse,
  StoreBadgeResponse,
} from "@/types/review.type";

function buildReviewFormData(request: CreateReviewRequest): FormData {
  const fd = new FormData();
  fd.append("orderId", request.orderId);
  fd.append("rating", String(request.rating));
  fd.append("comment", request.comment);
  request.images?.forEach((file) => fd.append("images", file));
  return fd;
}

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Review", "ProductRating", "StoreReview", "Badge"],
  endpoints: (builder) => ({
    // Product Reviews
    getProductReviews: builder.query<
      ApiResponse<ReviewResponse>,
      { productId: string; filter: GetReviewsFilter }
    >({
      query: ({ productId, filter }) => ({
        url: `/products/${productId}/reviews`,
        params: filter,
      }),
      providesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
      ],
    }),

    getProductReviewSummary: builder.query<ApiResponse<ReviewSummary>, string>({
      query: (productId) => `/products/${productId}/reviews/summary`,
      providesTags: (result, error, id) => [{ type: "ProductRating", id }],
    }),

    canReviewProduct: builder.query<ApiResponse<CanReviewResponse>, string>({
      query: (productId) => `/products/${productId}/can-review`,
      providesTags: (result, error, id) => [
        { type: "Review", id: `CAN_REVIEW_${id}` },
      ],
    }),

    createProductReview: builder.mutation<
      ApiResponse<Review>,
      { productId: string; request: CreateReviewRequest }
    >({
      query: ({ productId, request }) => ({
        url: `/products/${productId}/reviews`,
        method: "POST",
        body: buildReviewFormData(request),
      }),
      invalidatesTags: (result, error, { productId, request }) => [
        { type: "Review", id: productId },
        { type: "Review", id: `CAN_REVIEW_${productId}` },
        { type: "ProductRating", id: productId },
        { type: "Review", id: `ORDER_${request.orderId}` },
      ],
    }),

    getOrderReviews: builder.query<ApiResponse<Review[]>, string>({
      query: (orderId) => `/orders/${orderId}/reviews`,
      providesTags: (result, error, orderId) => [
        { type: "Review", id: `ORDER_${orderId}` },
      ],
    }),

    // Store Reviews
    getStoreReviews: builder.query<
      ApiResponse<PagedResult<Review>>,
      { storeId: string; filter: GetReviewsFilter }
    >({
      query: ({ storeId, filter }) => ({
        url: `/stores/${storeId}/reviews`,
        params: filter,
      }),
      providesTags: (result, error, { storeId }) => [
        { type: "StoreReview", id: storeId },
      ],
    }),

    getStoreReviewSummary: builder.query<ApiResponse<ReviewSummary>, string>({
      query: (storeId) => `/stores/${storeId}/reviews/summary`,
      providesTags: (result, error, id) => [{ type: "StoreReview", id: `SUMMARY_${id}` }],
    }),

    createStoreReview: builder.mutation<
      ApiResponse<Review>,
      { storeId: string; request: CreateReviewRequest }
    >({
      query: ({ storeId, request }) => ({
        url: `/stores/${storeId}/reviews`,
        method: "POST",
        body: buildReviewFormData(request),
      }),
      invalidatesTags: (result, error, { storeId, request }) => [
        { type: "StoreReview", id: storeId },
        { type: "StoreReview", id: `SUMMARY_${storeId}` },
        { type: "StoreReview", id: `ORDER_${request.orderId}` },
        { type: "Badge", id: storeId },
      ],
    }),

    deleteStoreReview: builder.mutation<
      ApiResponse<null>,
      { storeId: string; reviewId: string }
    >({
      query: ({ storeId, reviewId }) => ({
        url: `/stores/${storeId}/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { storeId }) => [
        { type: "StoreReview", id: storeId },
        { type: "StoreReview", id: `SUMMARY_${storeId}` },
        { type: "Badge", id: storeId },
      ],
    }),

    getStoreReviewByOrder: builder.query<
      ApiResponse<Review | null>,
      { storeId: string; orderId: string }
    >({
      query: ({ storeId, orderId }) =>
        `/stores/${storeId}/orders/${orderId}/review`,
      providesTags: (result, error, { storeId, orderId }) => [
        { type: "StoreReview", id: `ORDER_${orderId}` },
      ],
    }),

    // Badges
    getStoreBadges: builder.query<
      ApiResponse<StoreBadgeResponse[]>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/badges`,
      providesTags: (result, error, id) => [{ type: "Badge", id }],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetProductReviewSummaryQuery,
  useCanReviewProductQuery,
  useCreateProductReviewMutation,
  useGetOrderReviewsQuery,
  useGetStoreReviewsQuery,
  useGetStoreReviewSummaryQuery,
  useCreateStoreReviewMutation,
  useDeleteStoreReviewMutation,
  useGetStoreReviewByOrderQuery,
  useGetStoreBadgesQuery,
} = reviewApi;
