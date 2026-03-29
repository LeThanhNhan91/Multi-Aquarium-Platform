import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { ApiResponse } from "@/types/baseModel";
import { ProductAttribute, AttributeInput } from "@/types/product.type";

export const productAttributeApi = createApi({
  reducerPath: "productAttributeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ProductAttribute"],
  endpoints: (builder) => ({
    getAttributes: builder.query<ApiResponse<ProductAttribute[]>, string>({
      query: (productId) => `/products/${productId}/attributes`,
      providesTags: (result, error, productId) => [
        { type: "ProductAttribute", id: productId },
      ],
    }),
    upsertAttributes: builder.mutation<
      ApiResponse<ProductAttribute[]>,
      { productId: string; attributes: AttributeInput[] }
    >({
      query: ({ productId, attributes }) => ({
        url: `/products/${productId}/attributes`,
        method: "POST",
        body: attributes,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "ProductAttribute", id: productId },
      ],
    }),
    deleteAttribute: builder.mutation<
      ApiResponse<any>,
      { productId: string; attributeId: string }
    >({
      query: ({ productId, attributeId }) => ({
        url: `/products/${productId}/attributes/${attributeId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "ProductAttribute", id: productId },
      ],
    }),
  }),
});

export const {
  useGetAttributesQuery,
  useUpsertAttributesMutation,
  useDeleteAttributeMutation,
} = productAttributeApi;
