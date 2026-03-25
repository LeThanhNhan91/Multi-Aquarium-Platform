import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/libs/redux/store";
import { AddToCartRequest, CheckoutValidationResult } from "@/types/cart.type";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query<any, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation<any, AddToCartRequest>({
      query: (item) => ({
        url: "/cart",
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation<any, { id: string; quantity: number }>({
      query: ({ id, quantity }) => ({
        url: `/cart/${id}`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    removeFromCart: builder.mutation<any, string>({
      query: (id) => ({
        url: `/cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation<any, void>({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    mergeCart: builder.mutation<any, AddToCartRequest[]>({
      query: (items) => ({
        url: "/cart/merge",
        method: "POST",
        body: items,
      }),
      invalidatesTags: ["Cart"],
    }),
    removeStoreItems: builder.mutation<any, string>({
      query: (storeId) => ({
        url: `/cart/store/${storeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    validateCheckout: builder.mutation<
      CheckoutValidationResult,
      { storeId: string; items: Array<{ productId: string; fishInstanceId?: string; quantity: number }> }
    >({
      query: ({ storeId, items }) => ({
        url: `/orders/validate-checkout?storeId=${storeId}`,
        method: "POST",
        body: items,
      }),
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useMergeCartMutation,
  useRemoveStoreItemsMutation,
  useValidateCheckoutMutation,
} = cartApi;
