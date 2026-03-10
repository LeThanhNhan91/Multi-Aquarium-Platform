import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { ApiResponse } from "@/types/baseModel";
import {
  Review,
  ReviewSummary,
  GetReviewsFilter,
  ReviewResponse,
  CreateReviewRequest,
  CanReviewResponse,
} from "@/types/review.type";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Review", "ProductRating"],
  endpoints: (builder) => ({
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
        body: request,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Review", id: `CAN_REVIEW_${productId}` },
        { type: "ProductRating", id: productId },
      ],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetProductReviewSummaryQuery,
  useCanReviewProductQuery,
  useCreateProductReviewMutation,
} = reviewApi;
